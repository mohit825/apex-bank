import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

const migrationUrl = process.env.DATABASE_MIGRATION_URL;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  ...(migrationUrl ? { dbCredentials: { url: migrationUrl } } : {}),
});
