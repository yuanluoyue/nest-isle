CREATE TABLE "sys_search_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"keyword" varchar(200),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sys_search_history" ADD CONSTRAINT "sys_search_history_user_id_sys_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_user"("id") ON DELETE no action ON UPDATE no action;