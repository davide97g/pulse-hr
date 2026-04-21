CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"type" text NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"author_avatar" text,
	"status" text DEFAULT 'open' NOT NULL,
	"vote_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "proposals_status_chk" CHECK ("proposals"."status" in ('open','triaged','planned','shipped','wont_do')),
	CONSTRAINT "proposals_type_chk" CHECK ("proposals"."type" in ('bug','idea','improvement'))
);
--> statement-breakpoint
CREATE TABLE "proposal_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"body" text NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"author_avatar" text,
	"mentions" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "proposal_votes" (
	"proposal_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"value" smallint NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proposal_votes_proposal_id_user_id_pk" PRIMARY KEY("proposal_id","user_id"),
	CONSTRAINT "proposal_votes_value_chk" CHECK ("proposal_votes"."value" in (-1, 0, 1))
);
--> statement-breakpoint
ALTER TABLE "proposal_replies" ADD CONSTRAINT "proposal_replies_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_votes" ADD CONSTRAINT "proposal_votes_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "proposals_status_idx" ON "proposals" USING btree ("status") WHERE "proposals"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "proposals_vote_score_idx" ON "proposals" USING btree ("vote_score" DESC NULLS LAST);
