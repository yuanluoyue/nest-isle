ALTER TABLE "sys_file" RENAME COLUMN "type" TO "original_name";--> statement-breakpoint
ALTER TABLE "sys_file" ALTER COLUMN "storage" SET DEFAULT 'minio';--> statement-breakpoint
ALTER TABLE "sys_file" ADD COLUMN "path" varchar(500);--> statement-breakpoint
ALTER TABLE "sys_file" ADD COLUMN "mime_type" varchar(100);--> statement-breakpoint
ALTER TABLE "sys_file" ADD COLUMN "bucket" varchar(100);--> statement-breakpoint
ALTER TABLE "sys_file" ADD COLUMN "created_by" uuid;