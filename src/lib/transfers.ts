import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { accounts, accountTransactions, users, wireTransfers } from "@/db/schema";

export type SimulatedTransferInput = {
  sourceAccountId: string;
  recipientIdentifier: string;
  amountPaise: bigint;
  paymentReference?: string | null;
  idempotencyKey: string;
};

export type SimulatedTransferErrorCode =
  | "INVALID_AMOUNT"
  | "CUSTOMER_NOT_ELIGIBLE"
  | "SOURCE_ACCOUNT_NOT_FOUND"
  | "INSUFFICIENT_FUNDS"
  | "IDEMPOTENCY_CONFLICT"
  | "TRANSFER_UNAVAILABLE";

export type SimulatedTransferResult =
  | { ok: true; transferId: string; replayed: boolean }
  | { ok: false; code: SimulatedTransferErrorCode };

class TransferRejected extends Error {
  constructor(readonly code: SimulatedTransferErrorCode) {
    super(code);
  }
}

const MAX_SIGNED_BIGINT = BigInt("9223372036854775807");

/**
 * Execute a simulated outgoing transfer for a customer authenticated by the caller.
 * Derive customerUserId from the verified session, never from submitted form data.
 * The Server Action must validate and canonicalize the input before calling this service.
 */
export async function executeSimulatedTransfer(
  customerUserId: string,
  input: SimulatedTransferInput,
): Promise<SimulatedTransferResult> {
  if (input.amountPaise <= BigInt(0) || input.amountPaise > MAX_SIGNED_BIGINT) {
    return { ok: false, code: "INVALID_AMOUNT" };
  }

  const paymentReference = input.paymentReference ?? null;

  try {
    return await db.transaction(async (tx): Promise<SimulatedTransferResult> => {
      const [customer] = await tx
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.id, customerUserId), eq(users.role, "CUSTOMER")))
        .limit(1);

      if (!customer) throw new TransferRejected("CUSTOMER_NOT_ELIGIBLE");

      // The unique index reserves this customer's key. A concurrent request with
      // the same key waits for this transaction, then observes its committed row.
      const [created] = await tx
        .insert(wireTransfers)
        .values({
          customerUserId,
          sourceAccountId: input.sourceAccountId,
          recipientIdentifier: input.recipientIdentifier,
          amountPaise: input.amountPaise,
          paymentReference,
          idempotencyKey: input.idempotencyKey,
        })
        .onConflictDoNothing({
          target: [wireTransfers.customerUserId, wireTransfers.idempotencyKey],
        })
        .returning({ id: wireTransfers.id });

      if (!created) {
        const [existing] = await tx
          .select({
            id: wireTransfers.id,
            sourceAccountId: wireTransfers.sourceAccountId,
            recipientIdentifier: wireTransfers.recipientIdentifier,
            amountPaise: wireTransfers.amountPaise,
            paymentReference: wireTransfers.paymentReference,
          })
          .from(wireTransfers)
          .where(
            and(
              eq(wireTransfers.customerUserId, customerUserId),
              eq(wireTransfers.idempotencyKey, input.idempotencyKey),
            ),
          )
          .limit(1);

        if (!existing) throw new TransferRejected("TRANSFER_UNAVAILABLE");

        if (
          existing.sourceAccountId !== input.sourceAccountId ||
          existing.recipientIdentifier !== input.recipientIdentifier ||
          existing.amountPaise !== input.amountPaise ||
          existing.paymentReference !== paymentReference
        ) {
          throw new TransferRejected("IDEMPOTENCY_CONFLICT");
        }

        return { ok: true, transferId: existing.id, replayed: true };
      }

      // PostgreSQL locks the updated account row and rechecks this balance
      // predicate after any concurrent update; only a funded debit can succeed.
      const [debited] = await tx
        .update(accounts)
        .set({ balancePaise: sql`${accounts.balancePaise} - ${input.amountPaise}` })
        .where(
          and(
            eq(accounts.id, input.sourceAccountId),
            eq(accounts.ownerUserId, customerUserId),
            gte(accounts.balancePaise, input.amountPaise),
          ),
        )
        .returning({ id: accounts.id });

      if (!debited) {
        const [ownedAccount] = await tx
          .select({ id: accounts.id })
          .from(accounts)
          .where(
            and(
              eq(accounts.id, input.sourceAccountId),
              eq(accounts.ownerUserId, customerUserId),
            ),
          )
          .limit(1);

        throw new TransferRejected(
          ownedAccount ? "INSUFFICIENT_FUNDS" : "SOURCE_ACCOUNT_NOT_FOUND",
        );
      }

      await tx.insert(accountTransactions).values({
        accountId: input.sourceAccountId,
        description: "Simulated outgoing transfer",
        direction: "DEBIT",
        amountPaise: input.amountPaise,
        reference: `SIM-WIRE-${created.id}`,
      });

      return { ok: true, transferId: created.id, replayed: false };
    }, { isolationLevel: "read committed" });
  } catch (error) {
    // A thrown rejection or database error rolls back the transfer, debit and
    // ledger insert together. Never return a raw database error to the caller.
    if (error instanceof TransferRejected) {
      return { ok: false, code: error.code };
    }
    return { ok: false, code: "TRANSFER_UNAVAILABLE" };
  }
}
