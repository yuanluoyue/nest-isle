CREATE TABLE "sys_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50),
	"password" varchar(200),
	"nickname" varchar(50),
	"email" varchar(100),
	"phone" varchar(20),
	"gender" integer DEFAULT 0,
	"avatar" varchar(500),
	"dept_id" uuid,
	"status" integer DEFAULT 0,
	"remark" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50),
	"code" varchar(50),
	"sort" integer DEFAULT 0,
	"status" integer DEFAULT 0,
	"remark" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_menu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" varchar(50),
	"type" integer DEFAULT 0,
	"path" varchar(200),
	"component" varchar(200),
	"permission" varchar(100),
	"icon" varchar(100),
	"sort" integer DEFAULT 0,
	"visible" integer DEFAULT 0,
	"status" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_dept" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"name" varchar(50),
	"sort" integer DEFAULT 0,
	"leader" varchar(50),
	"phone" varchar(20),
	"email" varchar(100),
	"status" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50),
	"code" varchar(50),
	"sort" integer DEFAULT 0,
	"status" integer DEFAULT 0,
	"remark" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_dict_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50),
	"code" varchar(50),
	"status" integer DEFAULT 0,
	"remark" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_dict_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dict_type_id" uuid,
	"label" varchar(100),
	"value" varchar(100),
	"sort" integer DEFAULT 0,
	"color" varchar(50),
	"status" integer DEFAULT 0,
	"extra" jsonb,
	"remark" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"type" integer DEFAULT 1 NOT NULL,
	"status" integer DEFAULT 0 NOT NULL,
	"remark" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_user_role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"role_id" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_role_menu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid,
	"menu_id" uuid
);
--> statement-breakpoint
CREATE TABLE "sys_login_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"username" varchar(50),
	"ip" varchar(50),
	"location" varchar(100),
	"browser" varchar(50),
	"os" varchar(50),
	"user_agent" text,
	"status" integer DEFAULT 0,
	"message" varchar(200),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sys_operate_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"module" varchar(50),
	"description" varchar(200),
	"method" varchar(50),
	"url" varchar(500),
	"ip" varchar(50),
	"status" integer DEFAULT 0,
	"request" text,
	"response" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sys_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50),
	"group" varchar(50),
	"handler" varchar(200),
	"cron" varchar(50),
	"status" integer DEFAULT 0,
	"remark" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_job_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"handler" varchar(200),
	"status" integer DEFAULT 0,
	"result" text,
	"error" text,
	"started_at" timestamp,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sys_file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200),
	"original_name" varchar(200),
	"path" varchar(500),
	"url" varchar(500),
	"size" integer,
	"mime_type" varchar(100),
	"storage" varchar(20) DEFAULT 'minio',
	"bucket" varchar(100),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_notice" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"summary" varchar(500),
	"content" text NOT NULL,
	"category" varchar(50),
	"status" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp,
	"remark" varchar(500),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sid" varchar(64) NOT NULL,
	"user_id" uuid NOT NULL,
	"user_type" varchar(20) NOT NULL,
	"ip" varchar(50),
	"country" varchar(100),
	"city" varchar(100),
	"user_agent" text,
	"browser" varchar(50),
	"os" varchar(50),
	"device" varchar(50),
	"platform" varchar(20),
	"login_at" timestamp DEFAULT now() NOT NULL,
	"last_active_at" timestamp DEFAULT now() NOT NULL,
	"logout_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sys_session_sid_unique" UNIQUE("sid")
);
--> statement-breakpoint
CREATE TABLE "sys_ai_provider" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"base_url" varchar(500),
	"api_key" varchar(500),
	"enabled" integer DEFAULT 0,
	"priority" integer DEFAULT 0,
	"remark" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_ai_model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(100),
	"model_type" varchar(20) NOT NULL,
	"enabled" integer DEFAULT 0,
	"is_default" integer DEFAULT 0,
	"context_length" integer,
	"input_price" varchar(50),
	"output_price" varchar(50),
	"remark" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "sys_ai_prompt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"version" integer DEFAULT 1,
	"enabled" integer DEFAULT 0,
	"remark" varchar(500),
	CONSTRAINT "sys_ai_prompt_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sys_ai_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid,
	"model_id" uuid,
	"user_id" uuid,
	"prompt_tokens" integer,
	"completion_tokens" integer,
	"total_tokens" integer,
	"duration" integer,
	"status" integer NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
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
