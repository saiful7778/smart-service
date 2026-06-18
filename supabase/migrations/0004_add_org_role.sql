DROP INDEX "role_name_type_unique";--> statement-breakpoint
DROP INDEX "custom_role_name_unique";--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "org_id" uuid;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "role_org_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "role_org_id_idx" ON "roles" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "role_custom_role_name_idx" ON "roles" USING btree ("custom_role_name");--> statement-breakpoint
CREATE UNIQUE INDEX "role_org_id_custom_role_name_unique_idx" ON "roles" USING btree ("org_id","custom_role_name");