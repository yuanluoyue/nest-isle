CREATE TABLE "sys_notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50),
	"title" varchar(200),
	"content" text,
	"link" varchar(500),
	"payload" jsonb,
	"priority" integer DEFAULT 0,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sys_notification_receiver" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid,
	"receiver_id" uuid,
	"status" varchar(20) DEFAULT 'unread',
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
