CREATE TYPE "public"."QstashStatusEnum" AS ENUM('pending', 'delivered', 'failed', 'retried', 'cancelled', 'scheduled');--> statement-breakpoint
CREATE TABLE "qstash_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" text NOT NULL,
	"deduplication_id" text,
	"state" "QstashStatusEnum" DEFAULT 'pending' NOT NULL,
	"retries" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3,
	"error" text,
	"last_error" text,
	"callback" text,
	"topic" text,
	"queue" text,
	"is_dead_letter" boolean DEFAULT false NOT NULL,
	"raw_payload" jsonb,
	"url" text NOT NULL,
	"method" varchar(10) DEFAULT 'POST' NOT NULL,
	"headers" jsonb,
	"body" text,
	"response_status" integer,
	"response_body" text,
	"response_headers" jsonb,
	"created_by" uuid,
	"ip_address" varchar(50),
	"user_agent" text,
	"scheduled_at" timestamp (3) with time zone,
	"delivered_at" timestamp (3) with time zone,
	"next_retry_at" timestamp (3) with time zone,
	"created_at" timestamp (3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "qstash_logs" ADD CONSTRAINT "fk_qstash_logs_created_by" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_q_msg_id" ON "qstash_logs" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_q_topic" ON "qstash_logs" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "idx_q_queue" ON "qstash_logs" USING btree ("queue");--> statement-breakpoint
CREATE INDEX "idx_q_state" ON "qstash_logs" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_q_created_at" ON "qstash_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_q_delivered_at" ON "qstash_logs" USING btree ("delivered_at");--> statement-breakpoint
CREATE INDEX "idx_q_next_retry_at" ON "qstash_logs" USING btree ("next_retry_at");--> statement-breakpoint
CREATE INDEX "idx_q_state_created_at" ON "qstash_logs" USING btree ("state","created_at");