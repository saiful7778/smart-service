DROP INDEX "lead_category_slug_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "lead_category_org_slug_unique" ON "lead_categories" USING btree ("organization_id","slug");