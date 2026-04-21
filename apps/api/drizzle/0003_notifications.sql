CREATE TABLE IF NOT EXISTS "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "kind" text NOT NULL,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "link" text,
  "meta" jsonb,
  "read_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "notifications_kind_chk" CHECK ("kind" IN ('release','comment.new','comment.reply','comment.vote','comment.status','mention'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "notifications" ("user_id","created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_unread_idx" ON "notifications" ("user_id","created_at" DESC) WHERE "read_at" IS NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications_outbox" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "email" text NOT NULL,
  "template_key" text NOT NULL,
  "payload" jsonb NOT NULL,
  "status" text DEFAULT 'queued' NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "last_error" text,
  "sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "notifications_outbox_status_chk" CHECK ("status" IN ('queued','sending','sent','failed')),
  CONSTRAINT "notifications_outbox_template_chk" CHECK ("template_key" IN ('release','mention'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_outbox_status_idx" ON "notifications_outbox" ("status","created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_preferences" (
  "user_id" text PRIMARY KEY NOT NULL,
  "release_email" boolean DEFAULT true NOT NULL,
  "mention_email" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "released_versions" (
  "version" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "released_at" timestamp with time zone NOT NULL,
  "announced_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
