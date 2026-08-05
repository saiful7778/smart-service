ALTER TABLE "permissions" ALTER COLUMN "level" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "resource" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "action" SET DATA TYPE varchar;--> statement-breakpoint
DROP TYPE "public"."ActionTypeEnum";--> statement-breakpoint
DROP TYPE "public"."PermissionLevelEnum";--> statement-breakpoint
DROP TYPE "public"."ResourceTypeEnum";