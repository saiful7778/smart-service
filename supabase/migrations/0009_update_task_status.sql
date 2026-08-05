ALTER TABLE "org_tasks" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "org_tasks" ALTER COLUMN "status" SET DEFAULT 'todo'::text;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'todo'::text;--> statement-breakpoint
DROP TYPE "public"."TaskStatusEnum";--> statement-breakpoint
CREATE TYPE "public"."TaskStatusEnum" AS ENUM('todo', 'in_progress', 'done', 'cancelled');--> statement-breakpoint
ALTER TABLE "org_tasks" ALTER COLUMN "status" SET DEFAULT 'todo'::"public"."TaskStatusEnum";--> statement-breakpoint
ALTER TABLE "org_tasks" ALTER COLUMN "status" SET DATA TYPE "public"."TaskStatusEnum" USING "status"::"public"."TaskStatusEnum";--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'todo'::"public"."TaskStatusEnum";--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "status" SET DATA TYPE "public"."TaskStatusEnum" USING "status"::"public"."TaskStatusEnum";