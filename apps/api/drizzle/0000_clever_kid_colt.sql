CREATE TABLE "comment_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"body" text NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"author_avatar" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "comment_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid,
	"reply_id" uuid,
	"previous_body" text NOT NULL,
	"edited_by" text NOT NULL,
	"edited_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment_votes" (
	"comment_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"value" smallint NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comment_votes_comment_id_user_id_pk" PRIMARY KEY("comment_id","user_id"),
	CONSTRAINT "comment_votes_value_chk" CHECK ("comment_votes"."value" in (-1, 0, 1))
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route" text NOT NULL,
	"anchor" jsonb NOT NULL,
	"page_meta" jsonb,
	"body" text NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"author_avatar" text,
	"status" text DEFAULT 'open' NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"screenshot_url" text,
	"vote_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "comments_status_chk" CHECK ("comments"."status" in ('open','triaged','planned','shipped','wont_do'))
);
--> statement-breakpoint
ALTER TABLE "comment_replies" ADD CONSTRAINT "comment_replies_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_votes" ADD CONSTRAINT "comment_votes_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_route_idx" ON "comments" USING btree ("route") WHERE "comments"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "comments_status_idx" ON "comments" USING btree ("status") WHERE "comments"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "comments_vote_score_idx" ON "comments" USING btree ("vote_score" DESC NULLS LAST);