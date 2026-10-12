import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const ratePlans = pgTable("rate_plans", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  annualRateBasisPoints: integer("annual_rate_basis_points").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});
