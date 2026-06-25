CREATE TABLE "org_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" varchar(255) NOT NULL,
	"permission" text NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_role_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "org_member_roles" RENAME COLUMN "assigned_at" TO "created_at";--> statement-breakpoint
ALTER TABLE "org_member_roles" DROP CONSTRAINT "fk_org_member_roles_org_member_id";
--> statement-breakpoint
DROP INDEX "org_member_role_org_member_id_idx";--> statement-breakpoint
DROP INDEX "role_name_type_unique";--> statement-breakpoint
DROP INDEX "custom_role_name_unique";--> statement-breakpoint
ALTER TABLE "org_roles" ADD CONSTRAINT "orgRole_organizationId_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_role_members" ADD CONSTRAINT "org_role_member_org_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."org_roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_role_members" ADD CONSTRAINT "org_role_member_org_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_role_permissions" ADD CONSTRAINT "orgRolePermission_roleId_fk" FOREIGN KEY ("role_id") REFERENCES "public"."org_roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_role_permissions" ADD CONSTRAINT "orgRolePermission_permissionId_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "orgRole_organizationId_idx" ON "org_roles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_role_member_org_role_id_idx" ON "org_role_members" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "org_role_member_org_member_id_idx" ON "org_role_members" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "org_role_member_unique_idx" ON "org_role_members" USING btree ("role_id","member_id");--> statement-breakpoint
CREATE INDEX "orgRolePermission_roleId_idx" ON "org_role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "orgRolePermission_permissionId_idx" ON "org_role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orgRolePermission_unique" ON "org_role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
ALTER TABLE "org_member_roles" ADD CONSTRAINT "fk_org_member_roles_member_id" FOREIGN KEY ("org_member_id") REFERENCES "public"."organization_members"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "org_member_role_member_id_idx" ON "org_member_roles" USING btree ("org_member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_type_name_unique" ON "roles" USING btree ("type","role_name");--> statement-breakpoint
ALTER TABLE "roles" DROP COLUMN "custom_role_name";