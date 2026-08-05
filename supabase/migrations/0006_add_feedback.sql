CREATE TYPE "public"."FeedbackIssueStatusEnum" AS ENUM('OPEN', 'IN_PROGRESS', 'NEEDS_INFO', 'RESOLVED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."FeedbackIssueTypeEnum" AS ENUM('BUG', 'FEATURE_REQUEST', 'FEEDBACK', 'SUGGESTION', 'REPORT', 'OTHER');--> statement-breakpoint
ALTER TYPE "public"."ResourceTypeEnum" ADD VALUE 'feedback';--> statement-breakpoint
CREATE TABLE "feedback_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"type" "FeedbackIssueTypeEnum" NOT NULL,
	"status" "FeedbackIssueStatusEnum" DEFAULT 'OPEN' NOT NULL,
	"closed_at" timestamp (3) with time zone,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_issue_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback_issues" ADD CONSTRAINT "feedback_issues_createdBy_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "feedback_issue_replies" ADD CONSTRAINT "feedback_issue_replies_issue_fkey" FOREIGN KEY ("issue_id") REFERENCES "public"."feedback_issues"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "feedback_issue_replies" ADD CONSTRAINT "feedback_issue_replies_createdBy_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "feedback_issues_createdBy_idx" ON "feedback_issues" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "feedback_issues_status_idx" ON "feedback_issues" USING btree ("status");--> statement-breakpoint
CREATE INDEX "feedback_issues_type_idx" ON "feedback_issues" USING btree ("type");--> statement-breakpoint
CREATE INDEX "feedback_issues_created_at_idx" ON "feedback_issues" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "feedback_issue_replies_issue_idx" ON "feedback_issue_replies" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "feedback_issue_replies_createdBy_idx" ON "feedback_issue_replies" USING btree ("created_by_id");