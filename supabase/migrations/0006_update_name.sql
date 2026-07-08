ALTER TABLE "schedule_assignments" RENAME COLUMN "org_member_id" TO "member_id";--> statement-breakpoint
ALTER TABLE "time_entries" RENAME COLUMN "org_member_id" TO "member_id";--> statement-breakpoint
ALTER TABLE "schedule_assignments" DROP CONSTRAINT "schedule_assignement_org_member_fkey";
--> statement-breakpoint
ALTER TABLE "time_entries" DROP CONSTRAINT "time_entries_member_fkey";
--> statement-breakpoint
DROP INDEX "schedule_assignement_schedule_id_org_member_id_key";--> statement-breakpoint
DROP INDEX "schedule_assignement_org_member_id_idx";--> statement-breakpoint
DROP INDEX "time_entry_member_idx";--> statement-breakpoint
ALTER TABLE "schedule_assignments" ADD CONSTRAINT "schedule_assignement_org_member_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_member_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "schedule_assignement_schedule_id_org_member_id_key" ON "schedule_assignments" USING btree ("schedule_id","member_id");--> statement-breakpoint
CREATE INDEX "schedule_assignement_org_member_id_idx" ON "schedule_assignments" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "time_entry_member_idx" ON "time_entries" USING btree ("member_id");--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN "hours_worked";