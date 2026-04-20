CREATE TABLE "workspace_sidebar_features" (
	"workspace_key" text PRIMARY KEY NOT NULL,
	"features" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
