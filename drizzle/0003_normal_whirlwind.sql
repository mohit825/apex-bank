CREATE TABLE "wire_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_user_id" uuid NOT NULL,
	"source_account_id" uuid NOT NULL,
	"recipient_identifier" varchar(100) NOT NULL,
	"amount_paise" bigint NOT NULL,
	"payment_reference" varchar(140),
	"idempotency_key" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wire_transfers_amount_paise_positive" CHECK ("wire_transfers"."amount_paise" > 0)
);
--> statement-breakpoint
ALTER TABLE "wire_transfers" ADD CONSTRAINT "wire_transfers_customer_user_id_users_id_fk" FOREIGN KEY ("customer_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wire_transfers" ADD CONSTRAINT "wire_transfers_source_account_id_accounts_id_fk" FOREIGN KEY ("source_account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "wire_transfers_customer_idempotency_uq" ON "wire_transfers" USING btree ("customer_user_id","idempotency_key");