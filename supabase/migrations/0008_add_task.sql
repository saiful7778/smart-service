CREATE TYPE "public"."TaskPriorityEnum" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."TaskStatusEnum" AS ENUM('todo', 'in_progress', 'in_review', 'done', 'cancelled');--> statement-breakpoint
CREATE TABLE "org_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"job_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "TaskStatusEnum" DEFAULT 'todo' NOT NULL,
	"priority" "TaskPriorityEnum" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp (3) with time zone,
	"assigned_by" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "TaskStatusEnum" DEFAULT 'todo' NOT NULL,
	"priority" "TaskPriorityEnum" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp (3) with time zone,
	"assigned_by" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_org_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_task_job_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "org_tasks" ADD CONSTRAINT "org_tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "org_tasks_org_id_idx" ON "org_tasks" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "org_tasks_job_schedule_id_idx" ON "org_tasks" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "org_tasks_assigned_by_idx" ON "org_tasks" USING btree ("assigned_by");--> statement-breakpoint
CREATE INDEX "org_tasks_status_idx" ON "org_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "org_tasks_priority_idx" ON "org_tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "org_tasks_due_date_idx" ON "org_tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "org_tasks_created_at_idx" ON "org_tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tasks_assigned_by_idx" ON "tasks" USING btree ("assigned_by");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_priority_idx" ON "tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "tasks_created_at_idx" ON "tasks" USING btree ("created_at");