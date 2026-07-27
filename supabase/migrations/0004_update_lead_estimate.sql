ALTER TABLE "lead_estimates" ADD COLUMN "discount_rate" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "lead_estimates" ADD COLUMN "discount_amount" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "lead_estimates" DROP COLUMN "discount";