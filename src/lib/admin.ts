import "server-only";

import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { accounts, users, wireTransfers } from "@/db/schema";

const RECENT_TRANSFER_LIMIT = 20;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function getCustomerCount() {
  const [row] = await db
    .select({ count: sql<string>`count(*)::text` })
    .from(users)
    .where(eq(users.role, "CUSTOMER"));

  return BigInt(row.count);
}

async function getTransferMetrics() {
  const since = new Date(Date.now() - ONE_DAY_MS);
  const [row] = await db
    .select({
      totalCount: sql<string>`count(*)::text`,
      last24HoursCount: sql<string>`count(*) filter (where ${wireTransfers.createdAt} >= ${since})::text`,
      totalAmountPaise: sql<string>`coalesce(sum(${wireTransfers.amountPaise}), 0)::text`,
    })
    .from(wireTransfers);

  return {
    totalCount: BigInt(row.totalCount),
    last24HoursCount: BigInt(row.last24HoursCount),
    totalAmountPaise: BigInt(row.totalAmountPaise),
  };
}

async function getRecentTransfers() {
  return db
    .select({
      id: wireTransfers.id,
      createdAt: wireTransfers.createdAt,
      customerEmail: users.email,
      sourceAccountName: accounts.displayName,
      sourceAccountMaskedIdentifier: accounts.maskedIdentifier,
      recipientIdentifier: wireTransfers.recipientIdentifier,
      amountPaise: wireTransfers.amountPaise,
    })
    .from(wireTransfers)
    .innerJoin(users, eq(wireTransfers.customerUserId, users.id))
    .innerJoin(accounts, eq(wireTransfers.sourceAccountId, accounts.id))
    .orderBy(desc(wireTransfers.createdAt), desc(wireTransfers.id))
    .limit(RECENT_TRANSFER_LIMIT);
}

/** Call only after requireAdmin() has verified the current database role. */
export async function getAdminDashboardData() {
  const checkedAt = new Date();

  try {
    await db.execute(sql`select 1`);
  } catch {
    return { databaseAvailable: false, checkedAt, data: null } as const;
  }

  try {
    const [customerCount, transferMetrics, recentTransfers] = await Promise.all([
      getCustomerCount(),
      getTransferMetrics(),
      getRecentTransfers(),
    ]);

    return {
      databaseAvailable: true,
      checkedAt,
      data: { customerCount, transferMetrics, recentTransfers },
    } as const;
  } catch {
    // A successful connection check does not guarantee every query succeeds.
    return { databaseAvailable: true, checkedAt, data: null } as const;
  }
}
