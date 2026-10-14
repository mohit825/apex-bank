"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/session";
import { executeSimulatedTransfer } from "@/lib/transfers";

export type TransferActionState = {
  status: "idle" | "error" | "auth-expired" | "success";
  message: string;
  transferId?: string;
};

const transferSchema = z.object({
  sourceAccountId: z
    .uuid({ error: "Choose a valid source account." })
    .transform((value) => value.toLowerCase()),
  recipientIdentifier: z
    .string({ error: "Enter a recipient identifier." })
    .trim()
    .min(1, { error: "Enter a recipient identifier." })
    .max(100, { error: "Recipient identifier is too long." }),
  amountInr: z
    .string({ error: "Enter an amount in INR." })
    .trim()
    .regex(/^(?:0|[1-9]\d{0,16})(?:\.\d{1,2})?$/, {
      error: "Enter a positive INR amount with up to two decimal places.",
    }),
  paymentReference: z
    .string({ error: "Enter a valid payment reference." })
    .trim()
    .max(140, { error: "Payment reference is too long." })
    .optional(),
  idempotencyKey: z
    .uuid({ error: "Start a new transfer request and try again." })
    .transform((value) => value.toLowerCase()),
});

export async function submitTransfer(
  _previousState: TransferActionState,
  formData: FormData,
): Promise<TransferActionState> {
  // Proxy may reject an expired POST before this action runs, so the client
  // also handles that path. This check remains mandatory for direct calls.
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: "auth-expired", message: "Your session expired. Sign in to continue." };
  }
  if (user.role !== "CUSTOMER") {
    return { status: "error", message: "Transfers are available to customers only." };
  }

  const parsed = transferSchema.safeParse({
    sourceAccountId: formData.get("sourceAccountId"),
    recipientIdentifier: formData.get("recipientIdentifier"),
    amountInr: formData.get("amountInr"),
    paymentReference: formData.get("paymentReference") ?? undefined,
    idempotencyKey: formData.get("idempotencyKey"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check the transfer details and try again.",
    };
  }

  const [rupees, fraction = ""] = parsed.data.amountInr.split(".");
  const amountPaise =
    BigInt(rupees) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));

  if (amountPaise <= BigInt(0) || amountPaise > BigInt("9223372036854775807")) {
    return {
      status: "error",
      message: "Enter a positive amount within the supported range.",
    };
  }

  const result = await executeSimulatedTransfer(user.id, {
    sourceAccountId: parsed.data.sourceAccountId,
    recipientIdentifier: parsed.data.recipientIdentifier,
    amountPaise,
    paymentReference: parsed.data.paymentReference || null,
    idempotencyKey: parsed.data.idempotencyKey,
  });

  if (!result.ok) {
    const messages = {
      INVALID_AMOUNT: "Enter a positive amount within the supported range.",
      CUSTOMER_NOT_ELIGIBLE: "Transfers are available to customers only.",
      SOURCE_ACCOUNT_NOT_FOUND: "Choose one of your accounts.",
      INSUFFICIENT_FUNDS: "The selected account has insufficient funds.",
      IDEMPOTENCY_CONFLICT:
        "This transfer request was already used with different details. Start a new request.",
      TRANSFER_UNAVAILABLE:
        "We could not confirm the transfer. Retry this request without changing its details.",
    } satisfies Record<typeof result.code, string>;

    return { status: "error", message: messages[result.code] };
  }

  revalidatePath("/dashboard");

  return {
    status: "success",
    message: result.replayed
      ? "This simulated transfer was already recorded."
      : "Simulated transfer recorded.",
    transferId: result.transferId,
  };
}
