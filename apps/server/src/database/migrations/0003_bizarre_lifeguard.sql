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
DROP TABLE "sys_dict_data" CASCADE;