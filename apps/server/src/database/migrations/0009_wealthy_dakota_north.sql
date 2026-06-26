CREATE TABLE "sys_form" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(100) NOT NULL,
	"description" varchar(500),
	"schema" jsonb,
	"published_schema" jsonb,
	"status" integer DEFAULT 0,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_form_datasource" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100),
	"code" varchar(100),
	"type" varchar(20),
	"config" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sys_form_record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"data" jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sys_form_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"schema" jsonb NOT NULL,
	"remark" varchar(500),
	"is_published" integer DEFAULT 0,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
