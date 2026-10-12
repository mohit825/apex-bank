import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { ratePlans } from "../src/db/schema";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_MIGRATION_URL;

if (!connectionString) {
  throw new Error("DATABASE_MIGRATION_URL is required to seed rate plans.");
}

const pool = new Pool({
  connectionString,
  max: 1,
  connectionTimeoutMillis: 10_000,
});
const db = drizzle({ client: pool });

const plans = [
  { name: "Apex Savings", annualRateBasisPoints: 350, isActive: true },
  { name: "Apex Wealth Deposit", annualRateBasisPoints: 475, isActive: true },
];

async function seed() {
  try {
    for (const plan of plans) {
      await db
        .insert(ratePlans)
        .values(plan)
        .onConflictDoUpdate({
          target: ratePlans.name,
          set: {
            annualRateBasisPoints: plan.annualRateBasisPoints,
            isActive: plan.isActive,
          },
        });
    }
    console.log("Rate plans seeded.");
  } finally {
    await pool.end();
  }
}

seed().catch((error: unknown) => {
  console.error("Could not seed rate plans:", error);
  process.exitCode = 1;
});
