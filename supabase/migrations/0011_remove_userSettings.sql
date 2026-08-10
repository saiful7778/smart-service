DROP TABLE "user_settings" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" varchar(50) DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "locale" varchar(10) DEFAULT 'en-US' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "currency" varchar(3) DEFAULT 'USD' NOT NULL;