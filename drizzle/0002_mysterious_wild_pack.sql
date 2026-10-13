CREATE TYPE "public"."transaction_direction" AS ENUM('CREDIT', 'DEBIT');--> statement-breakpoint
CREATE TABLE "account_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"description" varchar(200) NOT NULL,
	"direction" "transaction_direction" NOT NULL,
	"amount_paise" bigint NOT NULL,
	"reference" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_transactions_amount_paise_positive" CHECK ("account_transactions"."amount_paise" > 0)
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"masked_identifier" varchar(32) NOT NULL,
	"balance_paise" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_balance_paise_nonnegative" CHECK ("accounts"."balance_paise" >= 0)
);
--> statement-breakpoint
CREATE TABLE "investment_holdings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"product_name" varchar(150) NOT NULL,
	"invested_paise" bigint NOT NULL,
	"valuation_paise" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "investment_holdings_invested_paise_positive" CHECK ("investment_holdings"."invested_paise" > 0),
	CONSTRAINT "investment_holdings_valuation_paise_nonnegative" CHECK ("investment_holdings"."valuation_paise" >= 0)
);
--> statement-breakpoint
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_holdings" ADD CONSTRAINT "investment_holdings_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_transactions_account_created_idx" ON "account_transactions" USING btree ("account_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "account_transactions_account_reference_uq" ON "account_transactions" USING btree ("account_id","reference");--> statement-breakpoint
CREATE INDEX "accounts_owner_user_id_idx" ON "accounts" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "investment_holdings_owner_user_id_idx" ON "investment_holdings" USING btree ("owner_user_id");