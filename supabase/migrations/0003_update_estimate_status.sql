ALTER TABLE "lead_estimates" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "lead_estimates" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
DROP TYPE "public"."LeadEstimateStatusEnum";--> statement-breakpoint
CREATE TYPE "public"."LeadEstimateStatusEnum" AS ENUM('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired');--> statement-breakpoint
ALTER TABLE "lead_estimates" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."LeadEstimateStatusEnum";--> statement-breakpoint
ALTER TABLE "lead_estimates" ALTER COLUMN "status" SET DATA TYPE "public"."LeadEstimateStatusEnum" USING "status"::"public"."LeadEstimateStatusEnum";