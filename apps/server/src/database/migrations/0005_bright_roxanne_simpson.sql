ALTER TABLE "sys_config" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "sys_config" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sys_config" ALTER COLUMN "key" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "sys_config" ALTER COLUMN "key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sys_config" ALTER COLUMN "value" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sys_config" ALTER COLUMN "value" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sys_config" ALTER COLUMN "type" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "sys_config" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sys_config" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sys_config" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sys_config" ALTER COLUMN "updated_at" SET NOT NULL;