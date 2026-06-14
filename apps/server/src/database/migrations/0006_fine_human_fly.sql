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
