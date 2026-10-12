import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set to the pooled Neon connection string.");
}

const pool = new Pool({
  connectionString,
  max: 2,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 10_000,
  allowExitOnIdle: true,
});

pool.on("error", (error) => {
  console.error("Unexpected error on an idle PostgreSQL client:", error);
});

export const db = drizzle({ client: pool, schema });
