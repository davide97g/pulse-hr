CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"company_name" text,
	"company_website" text,
	"company_size" text,
	"company_industry" text,
	"intentions" text,
	"desires" text,
	"origin" text,
	"pain_point" text,
	"source" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"fully_answered" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questionnaire_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"questionnaire_key" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"answers" jsonb NOT NULL,
	"fully_answered" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voting_power" (
	"user_id" text PRIMARY KEY NOT NULL,
	"power" integer DEFAULT 100 NOT NULL,
	"baseline" integer DEFAULT 100 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voting_power_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"delta" integer NOT NULL,
	"reason" text NOT NULL,
	"source_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "questionnaire_responses_user_idx" ON "questionnaire_responses" USING btree ("user_id", "submitted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "questionnaire_responses_key_idx" ON "questionnaire_responses" USING btree ("questionnaire_key");--> statement-breakpoint
CREATE INDEX "voting_power_events_user_idx" ON "voting_power_events" USING btree ("user_id", "created_at" DESC NULLS LAST);
