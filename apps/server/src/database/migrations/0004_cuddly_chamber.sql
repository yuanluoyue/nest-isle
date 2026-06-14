ALTER TABLE "sys_notice" ADD COLUMN IF NOT EXISTS "summary" varchar(500);
ALTER TABLE "sys_notice" ADD COLUMN IF NOT EXISTS "category" varchar(50);
ALTER TABLE "sys_notice" ADD COLUMN IF NOT EXISTS "published_at" timestamp;
