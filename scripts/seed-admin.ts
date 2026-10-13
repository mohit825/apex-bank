import { hash } from "bcryptjs";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { z } from "zod";

import { users } from "../src/db/schema";

config({ path: ".env.local" });

const adminInputSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(320)),
  password: z
    .string()
    .min(5)
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72),
});

type SeedResult = "created" | "already-admin" | "customer-conflict";

async function seedAdmin(): Promise<SeedResult | null> {
  const parsed = adminInputSchema.safeParse({
    email: process.env.ADMIN_SEED_EMAIL,
    password: process.env.ADMIN_SEED_PASSWORD,
  });
  if (!parsed.success) {
    console.error(
      "Set a valid ADMIN_SEED_EMAIL and an ADMIN_SEED_PASSWORD of 5 to 72 UTF-8 bytes.",
    );
    process.exitCode = 1;
    return null;
  }

  const connectionString = process.env.DATABASE_MIGRATION_URL;
  if (!connectionString) {
    console.error(
      "DATABASE_MIGRATION_URL is required to seed an administrator.",
    );
    process.exitCode = 1;
    return null;
  }

  const pool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  });
  const db = drizzle({ client: pool });

  try {
    const [existing] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    if (existing) {
      return existing.role === "ADMIN" ? "already-admin" : "customer-conflict";
    }

    const passwordHash = await hash(parsed.data.password, 12);
    const inserted = await db
      .insert(users)
      .values({
        email: parsed.data.email,
        passwordHash,
        role: "ADMIN",
      })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id });

    if (inserted.length > 0) return "created";

    // A concurrent insert may have won; inspect its role without changing it.
    const [conflicting] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    if (!conflicting) throw new Error("Administrator seed conflict.");
    return conflicting.role === "ADMIN" ? "already-admin" : "customer-conflict";
  } finally {
    await pool.end();
  }
}

seedAdmin()
  .then((result) => {
    if (result === "created") {
      console.log("Administrator created.");
    } else if (result === "already-admin") {
      console.log("Administrator already exists; password was not changed.");
    } else if (result === "customer-conflict") {
      console.error("Seed email belongs to a CUSTOMER; no role was changed.");
      process.exitCode = 1;
    }
  })
  .catch(() => {
    console.error(
      "Could not seed administrator; no existing user was changed.",
    );
    process.exitCode = 1;
  });
