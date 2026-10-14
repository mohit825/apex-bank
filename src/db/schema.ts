import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const ratePlans = pgTable("rate_plans", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  annualRateBasisPoints: integer("annual_rate_basis_points").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const userRole = pgEnum("user_role", ["CUSTOMER", "ADMIN"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("CUSTOMER"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    maskedIdentifier: varchar("masked_identifier", { length: 32 }).notNull(),
    balancePaise: bigint("balance_paise", { mode: "bigint" })
      .notNull()
      .default(sql`0`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("accounts_owner_user_id_idx").on(table.ownerUserId),
    check("accounts_balance_paise_nonnegative", sql`${table.balancePaise} >= 0`),
  ],
);

export const transactionDirection = pgEnum("transaction_direction", [
  "CREDIT",
  "DEBIT",
]);

export const accountTransactions = pgTable(
  "account_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    description: varchar("description", { length: 200 }).notNull(),
    direction: transactionDirection("direction").notNull(),
    amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(),
    reference: varchar("reference", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("account_transactions_account_created_idx").on(
      table.accountId,
      table.createdAt.desc(),
    ),
    uniqueIndex("account_transactions_account_reference_uq").on(
      table.accountId,
      table.reference,
    ),
    check("account_transactions_amount_paise_positive", sql`${table.amountPaise} > 0`),
  ],
);

export const wireTransfers = pgTable(
  "wire_transfers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerUserId: uuid("customer_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    sourceAccountId: uuid("source_account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    recipientIdentifier: varchar("recipient_identifier", { length: 100 }).notNull(),
    amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(),
    paymentReference: varchar("payment_reference", { length: 140 }),
    idempotencyKey: uuid("idempotency_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("wire_transfers_customer_idempotency_uq").on(
      table.customerUserId,
      table.idempotencyKey,
    ),
    check("wire_transfers_amount_paise_positive", sql`${table.amountPaise} > 0`),
  ],
);

export const investmentHoldings = pgTable(
  "investment_holdings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    productName: varchar("product_name", { length: 150 }).notNull(),
    investedPaise: bigint("invested_paise", { mode: "bigint" }).notNull(),
    valuationPaise: bigint("valuation_paise", { mode: "bigint" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("investment_holdings_owner_user_id_idx").on(table.ownerUserId),
    check("investment_holdings_invested_paise_positive", sql`${table.investedPaise} > 0`),
    check("investment_holdings_valuation_paise_nonnegative", sql`${table.valuationPaise} >= 0`),
  ],
);
