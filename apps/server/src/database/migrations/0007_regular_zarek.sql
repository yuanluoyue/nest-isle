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
