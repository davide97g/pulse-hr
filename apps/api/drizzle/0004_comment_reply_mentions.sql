ALTER TABLE "comment_replies"
  ADD COLUMN IF NOT EXISTS "mentions" text[] NOT NULL DEFAULT ARRAY[]::text[];
