CREATE TYPE "public"."ActionTypeEnum" AS ENUM('create', 'read', 'list', 'update', 'delete', 'manage', 'export');--> statement-breakpoint
CREATE TYPE "public"."ContactSubmissionStatusEnum" AS ENUM('PENDING', 'READ', 'REPLIED', 'SPAM');--> statement-breakpoint
CREATE TYPE "public"."JobAssignmentRoleEnum" AS ENUM('primary', 'secondary', 'supervisor', 'trainee');--> statement-breakpoint
CREATE TYPE "public"."JobAssignmentStatusEnum" AS ENUM('active', 'completed', 'cancelled', 'pending', 'declined');--> statement-breakpoint
CREATE TYPE "public"."JobStatusEnum" AS ENUM('draft', 'scheduled', 'in_progress', 'on_hold', 'needs_review', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."LeadRevenueTypeEnum" AS ENUM('expected', 'invoiced', 'received');--> statement-breakpoint
CREATE TYPE "public"."LeadSourceEnum" AS ENUM('manual', 'webhook', 'iframe');--> statement-breakpoint
CREATE TYPE "public"."LeadStatusEnum" AS ENUM('new', 'contacted', 'qualified', 'nurture', 'converted', 'lost', 'cancelled', 'disqualified');--> statement-breakpoint
CREATE TYPE "public"."NotificationCategoryEnum" AS ENUM('SYSTEM', 'ORG', 'AUTH', 'SUPPORT', 'CUSTOMER', 'LEAD', 'JOB', 'INVOICE', 'PAYMENT', 'BILLING', 'REPORT', 'SCHEDULE');--> statement-breakpoint
CREATE TYPE "public"."NotificationLevelEnum" AS ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."PermissionLevelEnum" AS ENUM('system', 'org', 'self');--> statement-breakpoint
CREATE TYPE "public"."ResourceTypeEnum" AS ENUM('user', 'role', 'permission', 'org', 'invitation', 'material', 'team', 'team_member', 'customer', 'lead', 'lead_category', 'lead_attachment', 'lead_note', 'lead_invoice', 'lead_payment', 'lead_billing', 'lead_report', 'lead_estimate', 'job', 'job_category', 'job_material', 'job_assignment', 'job_attachment', 'job_note', 'job_revenue', 'job_invoice', 'job_payment', 'job_estimate', 'job_billing', 'job_time_entry', 'invoice', 'payment', 'billing', 'report', 'schedule');--> statement-breakpoint
CREATE TYPE "public"."RoleEnum" AS ENUM('MEMBER', 'STAFF', 'DISPATCHER', 'TEAM_LEAD', 'MANAGER', 'ORG_SUPPORT_AGENT', 'ORG_ADMIN', 'OWNER', 'USER', 'SYSTEM_SUPPORT_AGENT', 'SYSTEM_ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."RoleTypeEnum" AS ENUM('SYSTEM', 'ORG');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" varchar(255),
	"role" varchar(255),
	"banned" boolean DEFAULT false,
	"ban_reason" varchar(255),
	"ban_expires" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"ip_address" varchar(45),
	"user_agent" text,
	"login_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"logout_at" timestamp (3) with time zone,
	"last_seen_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"locale" varchar(10) DEFAULT 'en-US' NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp (6) with time zone,
	"refresh_token_expires_at" timestamp (6) with time zone,
	"scope" text,
	"password" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(512) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(127) NOT NULL,
	"size" bigint NOT NULL,
	"url" text,
	"uploaded_by" uuid,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"uploaded_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3) with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp (3) with time zone NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"impersonated_by" varchar(255),
	"user_id" uuid NOT NULL,
	"active_org_id" uuid,
	"active_team_id" uuid,
	"expires_at" timestamp (6) with time zone NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"line1" varchar(255) NOT NULL,
	"line2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"zip_code" varchar(20) NOT NULL,
	"country" varchar(100) DEFAULT 'US' NOT NULL,
	"latitude" numeric(11, 8),
	"longitude" numeric(11, 8),
	"place_id" varchar(255),
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3) with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "user_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"address_type" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false,
	"address_type" varchar,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"address_type" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"address_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"phone" varchar(50),
	"company" varchar(255),
	"message" text NOT NULL,
	"status" "ContactSubmissionStatusEnum" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_submission_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"replied_by" uuid NOT NULL,
	"reply" text NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"company" varchar(255),
	"notes" text,
	"source" varchar(100),
	"metadata" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_at" timestamp (3) with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"customer_id" uuid,
	"lead_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "JobStatusEnum" DEFAULT 'scheduled' NOT NULL,
	"service_at" timestamp (3) with time zone,
	"expected_revenue" numeric(10, 2) DEFAULT '0',
	"invoiced_revenue" numeric(10, 2) DEFAULT '0',
	"received_revenue" numeric(10, 2) DEFAULT '0',
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3) with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "job_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"organization_id" uuid NOT NULL,
	"created_by" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_category_joins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"job_category_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"material_id" uuid NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"notes" text,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"start_at" timestamp (3) with time zone NOT NULL,
	"end_at" timestamp (3) with time zone NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_schedule_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_schedule_id" uuid NOT NULL,
	"assigned_by" uuid NOT NULL,
	"assigned_to" uuid NOT NULL,
	"role" "JobAssignmentRoleEnum" DEFAULT 'secondary' NOT NULL,
	"status" "JobAssignmentStatusEnum" DEFAULT 'pending' NOT NULL,
	"acknowledge_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"schedule_id" uuid,
	"start_at" timestamp (3) with time zone NOT NULL,
	"end_at" timestamp (3) with time zone,
	"duration_minutes" integer,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"customer_id" uuid,
	"status" "LeadStatusEnum" DEFAULT 'new' NOT NULL,
	"source" "LeadSourceEnum" NOT NULL,
	"service_type" varchar(255),
	"description" text,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3) with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "lead_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"job_id" uuid,
	"file_id" uuid NOT NULL,
	"title" varchar(255),
	"description" text,
	"category" varchar(255),
	"uploaded_by" uuid NOT NULL,
	"uploaded_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3) with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "lead_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"lead_id" uuid,
	"job_id" uuid,
	"content" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_revenue_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"job_id" uuid,
	"revenue_type" "LeadRevenueTypeEnum" NOT NULL,
	"old_value" numeric(10, 2) DEFAULT '0',
	"new_value" numeric(10, 2) DEFAULT '0',
	"changed_by" uuid NOT NULL,
	"changed_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"change_reason" text
);
--> statement-breakpoint
CREATE TABLE "lead_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"slug" varchar(255) NOT NULL,
	"created_by" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_category_joins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"lead_category_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(255) NOT NULL,
	"description" text,
	"unit_price" numeric(12, 2) NOT NULL,
	"cost_price" numeric(12, 2),
	"stock_quantity" numeric(12, 2) DEFAULT '0' NOT NULL,
	"minimum_stock_level" numeric(12, 2) DEFAULT '0',
	"unit" varchar(50) NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp (3) with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "material_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"material_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" uuid NOT NULL,
	"actor_id" uuid,
	"organization_id" uuid,
	"category" "NotificationCategoryEnum" NOT NULL,
	"level" "NotificationLevelEnum" DEFAULT 'INFO' NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp (3) with time zone,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "NotificationCategoryEnum" NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"push_enabled" boolean DEFAULT true NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"expiration_time" double precision,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(255),
	"logo" text,
	"metadata" text,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" varchar(255) NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"team_id" uuid,
	"role" varchar(255) NOT NULL,
	"status" varchar(255) NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_member_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"org_member_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"level" "PermissionLevelEnum" NOT NULL,
	"resource" "ResourceTypeEnum" NOT NULL,
	"action" "ActionTypeEnum" NOT NULL,
	"description" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "RoleTypeEnum" DEFAULT 'SYSTEM' NOT NULL,
	"role_name" "RoleEnum" DEFAULT 'USER' NOT NULL,
	"description" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activity_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activity_session_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_user_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "address_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_address_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_address_address_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_addresses" ADD CONSTRAINT "org_address_org_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_addresses" ADD CONSTRAINT "org_address_address_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customerAddress_customer_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customerAddress_address_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_addresses" ADD CONSTRAINT "lead_address_lead_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_addresses" ADD CONSTRAINT "lead_address_address_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_addresses" ADD CONSTRAINT "job_address_address_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_addresses" ADD CONSTRAINT "job_address_job_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "contact_submission_replies" ADD CONSTRAINT "contact_submission_reply_submission_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "contact_submission_replies" ADD CONSTRAINT "contact_submission_reply_replied_by_fkey" FOREIGN KEY ("replied_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customer_org_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customer_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customer_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customer_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_org_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customer_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_lead_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_categories" ADD CONSTRAINT "job_categories_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_categories" ADD CONSTRAINT "job_categories_created_by_organization_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_category_joins" ADD CONSTRAINT "job_category_join_job_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_category_joins" ADD CONSTRAINT "job_category_join_job_category_fkey" FOREIGN KEY ("job_category_id") REFERENCES "public"."job_categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_materials" ADD CONSTRAINT "job_material_job_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_materials" ADD CONSTRAINT "job_material_material_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_materials" ADD CONSTRAINT "job_material_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_materials" ADD CONSTRAINT "job_material_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_schedules" ADD CONSTRAINT "job_schedules_org_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_schedules" ADD CONSTRAINT "job_schedules_job_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_schedule_assignments" ADD CONSTRAINT "job_schedule_assignement_schedule_fkey" FOREIGN KEY ("job_schedule_id") REFERENCES "public"."job_schedules"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_schedule_assignments" ADD CONSTRAINT "job_schedule_assignement_assignedTo_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_schedule_assignments" ADD CONSTRAINT "job_schedule_assignement_assignedBy_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_time_entries" ADD CONSTRAINT "job_time_entries_job_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_time_entries" ADD CONSTRAINT "job_time_entries_member_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_time_entries" ADD CONSTRAINT "job_time_entries_schedule_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."job_schedules"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_org_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_customer_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_attachments" ADD CONSTRAINT "lead_attachment_lead_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_attachments" ADD CONSTRAINT "lead_attachment_job_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_attachments" ADD CONSTRAINT "lead_attachment_file_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_attachments" ADD CONSTRAINT "lead_attachment_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_attachments" ADD CONSTRAINT "lead_attachment_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "notes_org_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "notes_lead_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "notes_job_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_revenue_history" ADD CONSTRAINT "lead_revenue_history_lead_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_revenue_history" ADD CONSTRAINT "lead_revenue_history_job_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_revenue_history" ADD CONSTRAINT "lead_revenue_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_categories" ADD CONSTRAINT "lead_category_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_categories" ADD CONSTRAINT "lead_category_org_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_category_joins" ADD CONSTRAINT "lead_category_join_lead_fkey" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "lead_category_joins" ADD CONSTRAINT "lead_category_join_lead_category_fkey" FOREIGN KEY ("lead_category_id") REFERENCES "public"."lead_categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "material_org_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "material_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "material_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "material_files" ADD CONSTRAINT "material_file_material_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "material_files" ADD CONSTRAINT "material_file_file_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_org_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscription_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "orgMember_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "orgMember_org_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitation_inviter_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitation_org_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitation_team_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."org_teams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_teams" ADD CONSTRAINT "orgTeam_org_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_team_members" ADD CONSTRAINT "orgTeamMember_team_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."org_teams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_team_members" ADD CONSTRAINT "orgTeamMember_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_member_roles" ADD CONSTRAINT "fk_org_member_roles_role_id" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_member_roles" ADD CONSTRAINT "fk_org_member_roles_org_id" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_member_roles" ADD CONSTRAINT "fk_org_member_roles_member_id" FOREIGN KEY ("org_member_id") REFERENCES "public"."organization_members"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permission_role_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permission_permission_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_role_id" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_roles" ADD CONSTRAINT "orgRole_organizationId_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_role_members" ADD CONSTRAINT "org_role_member_org_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."org_roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_role_members" ADD CONSTRAINT "org_role_member_org_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_role_permissions" ADD CONSTRAINT "orgRolePermission_roleId_fk" FOREIGN KEY ("role_id") REFERENCES "public"."org_roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_role_permissions" ADD CONSTRAINT "orgRolePermission_permissionId_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_key" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_activity_user_id_idx" ON "user_activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_activity_login_at_idx" ON "user_activities" USING btree ("login_at");--> statement-breakpoint
CREATE INDEX "session_activity_last_seen_at_idx" ON "user_activities" USING btree ("last_seen_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_settings_user_id_idx" ON "user_settings" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_id_key" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "files_user_idx" ON "files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "files_deleted_by_idx" ON "files" USING btree ("deleted_by");--> statement-breakpoint
CREATE INDEX "files_entity_idx" ON "files" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "files_key_idx" ON "files" USING btree ("key");--> statement-breakpoint
CREATE INDEX "files_uploaded_at_idx" ON "files" USING btree ("uploaded_at");--> statement-breakpoint
CREATE UNIQUE INDEX "session_token_key" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "session_active_org_id_idx" ON "sessions" USING btree ("active_org_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "address_city_idx" ON "addresses" USING btree ("city");--> statement-breakpoint
CREATE INDEX "address_state_idx" ON "addresses" USING btree ("state");--> statement-breakpoint
CREATE INDEX "address_zip_code_idx" ON "addresses" USING btree ("zip_code");--> statement-breakpoint
CREATE INDEX "address_country_idx" ON "addresses" USING btree ("country");--> statement-breakpoint
CREATE INDEX "address_coordinates_idx" ON "addresses" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "address_created_at_idx" ON "addresses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "address_deleted_at_idx" ON "addresses" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "address_deleted_by_idx" ON "addresses" USING btree ("deleted_by");--> statement-breakpoint
CREATE INDEX "user_address_user_id_idx" ON "user_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_address_address_id_idx" ON "user_addresses" USING btree ("address_id");--> statement-breakpoint
CREATE INDEX "org_address_org_id_idx" ON "org_addresses" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_address_address_id_idx" ON "org_addresses" USING btree ("address_id");--> statement-breakpoint
CREATE INDEX "org_address_is_primary_idx" ON "org_addresses" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "customerAddress_customer_id_idx" ON "customer_addresses" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customerAddress_address_id_idx" ON "customer_addresses" USING btree ("address_id");--> statement-breakpoint
CREATE INDEX "customerAddress_created_at_idx" ON "customer_addresses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lead_address_lead_id_idx" ON "lead_addresses" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_address_address_id_idx" ON "lead_addresses" USING btree ("address_id");--> statement-breakpoint
CREATE INDEX "lead_address_is_primary_idx" ON "lead_addresses" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "job_address_address_id_idx" ON "job_addresses" USING btree ("address_id");--> statement-breakpoint
CREATE INDEX "job_address_job_id_idx" ON "job_addresses" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_address_is_primary_idx" ON "job_addresses" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "job_address_created_at_idx" ON "job_addresses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contact_submission_email_idx" ON "contact_submissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "contact_submission_status_idx" ON "contact_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_submission_created_at_idx" ON "contact_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contact_submission_reply_submission_id_idx" ON "contact_submission_replies" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "contact_submission_reply_replied_by_idx" ON "contact_submission_replies" USING btree ("replied_by");--> statement-breakpoint
CREATE INDEX "customer_org_id_idx" ON "customers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "customer_created_at_idx" ON "customers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "customer_created_by_idx" ON "customers" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "customer_updated_by_idx" ON "customers" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "customer_deleted_by_idx" ON "customers" USING btree ("deleted_by");--> statement-breakpoint
CREATE INDEX "customer_deleted_at_idx" ON "customers" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "jobs_org_id_idx" ON "jobs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "jobs_lead_id_idx" ON "jobs" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "jobs_customer_id_idx" ON "jobs" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_service_at_idx" ON "jobs" USING btree ("service_at");--> statement-breakpoint
CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "jobs_created_by_idx" ON "jobs" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "jobs_updated_by_idx" ON "jobs" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "jobs_deleted_by_idx" ON "jobs" USING btree ("deleted_by");--> statement-breakpoint
CREATE INDEX "jobs_deleted_at_idx" ON "jobs" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "job_categories_organization_id_idx" ON "job_categories" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "job_categories_created_by_idx" ON "job_categories" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "job_categories_slug_unique" ON "job_categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "job_categories_organization_id_slug_unique" ON "job_categories" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "job_categories_created_at_idx" ON "job_categories" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "job_category_join_job_id_idx" ON "job_category_joins" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_category_join_job_category_id_idx" ON "job_category_joins" USING btree ("job_category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "job_category_join_unique" ON "job_category_joins" USING btree ("job_id","job_category_id");--> statement-breakpoint
CREATE INDEX "job_material_job_id_idx" ON "job_materials" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_material_material_id_idx" ON "job_materials" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "job_material_created_by_idx" ON "job_materials" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "job_material_updated_by_idx" ON "job_materials" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "job_material_quantity_idx" ON "job_materials" USING btree ("quantity");--> statement-breakpoint
CREATE INDEX "job_material_created_at_idx" ON "job_materials" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "job_schedules_org_id_idx" ON "job_schedules" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "job_schedules_job_id_idx" ON "job_schedules" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_schedules_start_at_idx" ON "job_schedules" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "job_schedules_end_at_idx" ON "job_schedules" USING btree ("end_at");--> statement-breakpoint
CREATE INDEX "job_schedules_created_at_idx" ON "job_schedules" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "job_schedule_assignement_schedule_id_idx" ON "job_schedule_assignments" USING btree ("job_schedule_id");--> statement-breakpoint
CREATE INDEX "job_schedule_assignement_assignedTo_idx" ON "job_schedule_assignments" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "job_schedule_assignement_assignedBy_idx" ON "job_schedule_assignments" USING btree ("assigned_by");--> statement-breakpoint
CREATE INDEX "job_schedule_assignement_status_idx" ON "job_schedule_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_schedule_assignement_role_idx" ON "job_schedule_assignments" USING btree ("role");--> statement-breakpoint
CREATE INDEX "job_schedule_assignement_acknowledgeAt_idx" ON "job_schedule_assignments" USING btree ("acknowledge_at");--> statement-breakpoint
CREATE INDEX "job_schedule_assignement_created_at_idx" ON "job_schedule_assignments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "job_time_entry_job_id_idx" ON "job_time_entries" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_time_entry_member_idx" ON "job_time_entries" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "job_time_entry_schedule_id_idx" ON "job_time_entries" USING btree ("schedule_id");--> statement-breakpoint
CREATE INDEX "job_time_entry_startAt_idx" ON "job_time_entries" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "job_time_entry_endAt_idx" ON "job_time_entries" USING btree ("end_at");--> statement-breakpoint
CREATE INDEX "leads_org_id_idx" ON "leads" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "leads_customer_id_idx" ON "leads" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_created_by_idx" ON "leads" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "leads_updated_by_idx" ON "leads" USING btree ("updated_by");--> statement-breakpoint
CREATE INDEX "leads_deleted_by_idx" ON "leads" USING btree ("deleted_by");--> statement-breakpoint
CREATE INDEX "leads_deleted_at_idx" ON "leads" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "lead_attachment_lead_id_idx" ON "lead_attachments" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_attachment_job_id_idx" ON "lead_attachments" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "lead_attachment_file_id_idx" ON "lead_attachments" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "lead_attachment_uploaded_at_idx" ON "lead_attachments" USING btree ("uploaded_at");--> statement-breakpoint
CREATE INDEX "lead_attachment_uploaded_by_idx" ON "lead_attachments" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "lead_attachment_deleted_by_idx" ON "lead_attachments" USING btree ("deleted_by");--> statement-breakpoint
CREATE INDEX "lead_attachment_deleted_at_idx" ON "lead_attachments" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "notes_org_id_idx" ON "lead_notes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "notes_lead_id_idx" ON "lead_notes" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "notes_job_id_idx" ON "lead_notes" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "notes_created_by_idx" ON "lead_notes" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "lead_revenue_history_lead_id_idx" ON "lead_revenue_history" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_revenue_history_job_id_idx" ON "lead_revenue_history" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "lead_revenue_history_revenue_type_idx" ON "lead_revenue_history" USING btree ("revenue_type");--> statement-breakpoint
CREATE INDEX "lead_revenue_history_changed_by_idx" ON "lead_revenue_history" USING btree ("changed_by");--> statement-breakpoint
CREATE INDEX "lead_revenue_history_changed_at_idx" ON "lead_revenue_history" USING btree ("changed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "lead_category_org_slug_unique" ON "lead_categories" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "lead_category_org_id_idx" ON "lead_categories" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "lead_category_created_by_idx" ON "lead_categories" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "lead_category_created_at_idx" ON "lead_categories" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "lead_category_join_unique" ON "lead_category_joins" USING btree ("lead_id","lead_category_id");--> statement-breakpoint
CREATE INDEX "lead_category_join_lead_id_idx" ON "lead_category_joins" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_category_join_lead_category_id_idx" ON "lead_category_joins" USING btree ("lead_category_id");--> statement-breakpoint
CREATE INDEX "material_org_id_idx" ON "materials" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "material_created_by_idx" ON "materials" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "material_updated_by_idx" ON "materials" USING btree ("updated_by");--> statement-breakpoint
CREATE UNIQUE INDEX "material_sku_unique" ON "materials" USING btree ("org_id","sku");--> statement-breakpoint
CREATE INDEX "material_name_idx" ON "materials" USING btree ("name");--> statement-breakpoint
CREATE INDEX "material_stock_quantity_idx" ON "materials" USING btree ("stock_quantity");--> statement-breakpoint
CREATE INDEX "material_minimum_stock_level_idx" ON "materials" USING btree ("minimum_stock_level");--> statement-breakpoint
CREATE INDEX "material_created_at_idx" ON "materials" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "material_file_material_id_idx" ON "material_files" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "material_file_file_id_idx" ON "material_files" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "material_file_material_id_file_id_idx" ON "material_files" USING btree ("material_id","file_id");--> statement-breakpoint
CREATE INDEX "notifications_recipient_idx" ON "notifications" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "notifications_org_idx" ON "notifications" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "notifications_recipient_read_idx" ON "notifications" USING btree ("recipient_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_settings_user_category_key" ON "notification_settings" USING btree ("user_id","category");--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscription_endpoint_unique" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "push_subscription_user_id" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "org_slug_key" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "org_created_at_idx" ON "organizations" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "orgMember_user_org_id_key" ON "organization_members" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "orgMember_user_id_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orgMember_org_id_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "orgMember_created_at_idx" ON "organization_members" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "invitation_email_org_key" ON "invitations" USING btree ("email","organization_id");--> statement-breakpoint
CREATE INDEX "invitation_org_id_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_inviter_id_idx" ON "invitations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orgTeam_org_id_idx" ON "org_teams" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "orgTeam_created_at_idx" ON "org_teams" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orgTeamMember_team_id_idx" ON "org_team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "orgTeamMember_user_id_idx" ON "org_team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orgTeamMember_created_at_idx" ON "org_team_members" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "org_member_role_unique" ON "org_member_roles" USING btree ("organization_id","org_member_id","role_id");--> statement-breakpoint
CREATE INDEX "org_member_role_org_id_idx" ON "org_member_roles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_member_role_member_id_idx" ON "org_member_roles" USING btree ("org_member_id");--> statement-breakpoint
CREATE INDEX "org_member_role_role_id_idx" ON "org_member_roles" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "permission_level_resource_action_key" ON "permissions" USING btree ("level","resource","action");--> statement-breakpoint
CREATE INDEX "permission_level_idx" ON "permissions" USING btree ("level");--> statement-breakpoint
CREATE INDEX "permission_resource_idx" ON "permissions" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "permission_action_idx" ON "permissions" USING btree ("action");--> statement-breakpoint
CREATE INDEX "role_type_idx" ON "roles" USING btree ("type");--> statement-breakpoint
CREATE INDEX "role_name_idx" ON "roles" USING btree ("role_name");--> statement-breakpoint
CREATE UNIQUE INDEX "role_type_name_unique" ON "roles" USING btree ("type","role_name");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permission_unique" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX "role_permission_role_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permission_permission_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "user_role_unique" ON "user_roles" USING btree ("user_id","role_id");--> statement-breakpoint
CREATE INDEX "user_role_role_id_idx" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "user_role_user_id_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orgRole_organizationId_idx" ON "org_roles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_role_member_org_role_id_idx" ON "org_role_members" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "org_role_member_org_member_id_idx" ON "org_role_members" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "org_role_member_unique_idx" ON "org_role_members" USING btree ("role_id","member_id");--> statement-breakpoint
CREATE INDEX "orgRolePermission_roleId_idx" ON "org_role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "orgRolePermission_permissionId_idx" ON "org_role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orgRolePermission_unique" ON "org_role_permissions" USING btree ("role_id","permission_id");