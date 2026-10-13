import { createHash } from "node:crypto";

import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { z } from "zod";

import {
  accounts,
  accountTransactions,
  investmentHoldings,
  users,
} from "../src/db/schema";

config({ path: ".env.local" });

class SeedTargetError extends Error {}

// Derive a stable UUID for each sample row, scoped to the existing customer.
function sampleId(userId: string, name: string) {
  const namespace = Buffer.from(userId.replaceAll("-", ""), "hex");
  const bytes = createHash("sha1")
    .update(namespace)
    .update(`apexbank-dashboard-seed:${name}`)
    .digest();
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function seedDashboard() {
  const email = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email().max(320))
    .safeParse(process.env.DASHBOARD_SEED_CUSTOMER_EMAIL);
  const connectionString = process.env.DASHBOARD_SEED_DATABASE_URL;

  if (
    !email.success ||
    !connectionString ||
    !/^postgres(?:ql)?:\/\//.test(connectionString) ||
    process.env.DASHBOARD_SEED_CONFIRM !== "development" ||
    process.env.NODE_ENV === "production"
  ) {
    throw new SeedTargetError(
      "Set DASHBOARD_SEED_CUSTOMER_EMAIL, a direct development DASHBOARD_SEED_DATABASE_URL, and DASHBOARD_SEED_CONFIRM=development. Do not run with NODE_ENV=production.",
    );
  }

  const pool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  });
  const db = drizzle({ client: pool });

  try {
    await db.transaction(async (tx) => {
      const [customer] = await tx
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.email, email.data))
        .limit(1);

      if (!customer) {
        throw new SeedTargetError("The seed target user does not exist.");
      }
      if (customer.role !== "CUSTOMER") {
        throw new SeedTargetError("The seed target must be a CUSTOMER.");
      }

      const accountId = sampleId(customer.id, "account");
      await tx
        .insert(accounts)
        .values({
          id: accountId,
          ownerUserId: customer.id,
          displayName: "Apex Everyday Account",
          maskedIdentifier: "•••• 4242",
          balancePaise: BigInt(805_000),
        })
        .onConflictDoNothing({ target: accounts.id });

      const [account] = await tx
        .select({ ownerUserId: accounts.ownerUserId })
        .from(accounts)
        .where(eq(accounts.id, accountId))
        .limit(1);
      if (account?.ownerUserId !== customer.id) {
        throw new SeedTargetError("The sample account ID is already in use.");
      }

      const day = 24 * 60 * 60 * 1000;
      const now = Date.now();
      await tx
        .insert(accountTransactions)
        .values([
          {
            accountId,
            reference: "DEMO-OPENING-DEPOSIT",
            description: "Sample opening deposit",
            direction: "CREDIT",
            amountPaise: BigInt(1_000_000),
            createdAt: new Date(now - 3 * day),
          },
          {
            accountId,
            reference: "DEMO-BILL-PAYMENT",
            description: "Sample bill payment",
            direction: "DEBIT",
            amountPaise: BigInt(200_000),
            createdAt: new Date(now - 2 * day),
          },
          {
            accountId,
            reference: "DEMO-INTEREST-CREDIT",
            description: "Sample interest credit",
            direction: "CREDIT",
            amountPaise: BigInt(5_000),
            createdAt: new Date(now - day),
          },
        ])
        .onConflictDoNothing({
          target: [accountTransactions.accountId, accountTransactions.reference],
        });

      await tx
        .insert(investmentHoldings)
        .values([
          {
            id: sampleId(customer.id, "balanced-fund"),
            ownerUserId: customer.id,
            productName: "Sample Balanced Fund",
            investedPaise: BigInt(2_500_000),
            valuationPaise: BigInt(2_625_000),
          },
          {
            id: sampleId(customer.id, "bond-fund"),
            ownerUserId: customer.id,
            productName: "Sample Bond Fund",
            investedPaise: BigInt(1_000_000),
            valuationPaise: BigInt(1_030_000),
          },
        ])
        .onConflictDoNothing({ target: investmentHoldings.id });
    });

    console.log("Fictional dashboard data seeded; existing records were not reset.");
  } finally {
    await pool.end();
  }
}

seedDashboard().catch((error: unknown) => {
  console.error(
    error instanceof SeedTargetError
      ? error.message
      : "Could not seed dashboard data. Check the development connection and migrations.",
  );
  process.exitCode = 1;
});
