-- Persist "What's new" dismiss per Clerk user (replaces localStorage-only gate).
ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "changelog_last_seen_version" text;
