CREATE TYPE "public"."LeadEstimateStatusEnum" AS ENUM('draft', 'approved', 'sent', 'viewed', 'accepted', 'declined', 'expired', 'cancelled', 'converted');--> statement-breakpoint
CREATE TABLE "lead_estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"lead_id" uuid,
	"job_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" "LeadEstimateStatusEnum" DEFAULT 'draft' NOT NULL,
	"discount" numeric(12, 2) DEFAULT '0',
	"tax_rate" numeric(5, 2) DEFAULT '0',
	"subtotal" numeric(12, 2) DEFAULT '0',
	"tax_amount" numeric(12, 2) DEFAULT '0',
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"valid_until" timestamp (3) with time zone,
	"notes" text,
	"terms" text,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3) with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "lead_estimate_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estimate_id" uuid NOT NULL,
	"material_id" uuid NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lead_estimates" ADD CONSTRAINT "lead_estimate_org_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_estimates" ADD CONSTRAINT "lead_estimate_lead_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_estimates" ADD CONSTRAINT "lead_estimate_job_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_estimates" ADD CONSTRAINT "lead_estimate_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_estimates" ADD CONSTRAINT "lead_estimate_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_estimates" ADD CONSTRAINT "lead_estimate_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_estimate_materials" ADD CONSTRAINT "lead_estimate_material_estimate_fkey" FOREIGN KEY ("estimate_id") REFERENCES "public"."lead_estimates"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_estimate_materials" ADD CONSTRAINT "lead_estimate_material_material_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "lead_estimate_org_id_idx" ON "lead_estimates" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "lead_estimate_lead_id_idx" ON "lead_estimates" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_estimate_job_id_idx" ON "lead_estimates" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "lead_estimate_status_idx" ON "lead_estimates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lead_estimate_created_at_idx" ON "lead_estimates" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lead_estimate_created_by_idx" ON "lead_estimates" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "lead_estimate_deleted_by_idx" ON "lead_estimates" USING btree ("deleted_by");--> statement-breakpoint
CREATE INDEX "lead_estimate_deleted_at_idx" ON "lead_estimates" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "lead_estimate_material_estimate_id_idx" ON "lead_estimate_materials" USING btree ("estimate_id");--> statement-breakpoint
CREATE INDEX "lead_estimate_material_material_id_idx" ON "lead_estimate_materials" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "lead_estimate_material_quantity_idx" ON "lead_estimate_materials" USING btree ("quantity");--> statement-breakpoint
CREATE INDEX "lead_estimate_material_created_at_idx" ON "lead_estimate_materials" USING btree ("created_at");