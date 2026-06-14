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
CREATE TABLE "sys_dict_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_id" uuid,
	"label" varchar(50),
	"value" varchar(50),
	"sort" integer DEFAULT 0,
	"status" integer DEFAULT 0,
	"remark" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sys_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50),
	"key" varchar(50),
	"value" varchar(500),
	"type" integer DEFAULT 0,
	"status" integer DEFAULT 0,
	"remark" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
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
	"username" varchar(50),
	"ip" varchar(50),
	"location" varchar(100),
	"browser" varchar(50),
	"os" varchar(50),
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
	"url" varchar(500),
	"type" varchar(50),
	"size" integer,
	"storage" varchar(20) DEFAULT 'local',
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
