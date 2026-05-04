-- Voting Power v1
-- ---------------
-- Adds `last_refill_at`, switches scale 100 → 10, archives the existing
-- ledger to `voting_power_events_legacy`, and re-grants the +10 questionnaire
-- bonus to anyone who already completed `user_profiles.fully_answered`.
-- The migrator skips statements that fail with "already exists" so each step
-- below is safe to rerun. The data-migration DO block is also self-guarded.

ALTER TABLE "voting_power"
  ADD COLUMN "last_refill_at" timestamp with time zone NOT NULL DEFAULT now();
--> statement-breakpoint
ALTER TABLE "voting_power" ALTER COLUMN "power" SET DEFAULT 10;
--> statement-breakpoint
ALTER TABLE "voting_power" ALTER COLUMN "baseline" SET DEFAULT 10;
--> statement-breakpoint
CREATE UNIQUE INDEX "voting_power_events_user_source_uniq"
  ON "voting_power_events" ("user_id", "source_key")
  WHERE "source_key" IS NOT NULL;
--> statement-breakpoint
CREATE TABLE "voting_power_events_legacy" (LIKE "voting_power_events" INCLUDING ALL);
--> statement-breakpoint
DO $$
BEGIN
  -- Self-guard: only run the destructive reset once. If the legacy table
  -- already has rows, this migration's data step has already executed.
  IF NOT EXISTS (SELECT 1 FROM "voting_power_events_legacy") THEN
    INSERT INTO "voting_power_events_legacy"
      SELECT * FROM "voting_power_events";

    TRUNCATE "voting_power_events";

    UPDATE "voting_power"
       SET "power" = 10,
           "baseline" = 10,
           "last_refill_at" = now(),
           "updated_at" = now();

    -- Re-grant +10 to users who already completed the company-profile
    -- questionnaire. Idempotent via the unique partial index above.
    INSERT INTO "voting_power_events" ("user_id", "delta", "reason", "source_key", "created_at")
    SELECT up."user_id", 10, 'Completed company profile',
           'questionnaire:company_profile', now()
      FROM "user_profiles" up
     WHERE up."fully_answered" = true
    ON CONFLICT DO NOTHING;

    -- Pure additive grant: rows were just reset to power=baseline=10 above,
    -- so this lifts questionnaire-completers to power=20 (a boost that won't
    -- be topped back up by weekly refill — refill only restores to baseline).
    UPDATE "voting_power" vp
       SET "power" = vp."power" + 10,
           "updated_at" = now()
      FROM "user_profiles" up
     WHERE up."user_id" = vp."user_id"
       AND up."fully_answered" = true;

    -- Also insert a voting_power row at power=20 for any completed-profile
    -- users that don't have one yet (early adopters who completed onboarding
    -- before this table existed). Guarantees the +10 grant event in the
    -- ledger above lines up with a real power balance.
    INSERT INTO "voting_power" ("user_id", "power", "baseline", "last_refill_at", "updated_at")
    SELECT up."user_id", 20, 10, now(), now()
      FROM "user_profiles" up
     WHERE up."fully_answered" = true
       AND NOT EXISTS (SELECT 1 FROM "voting_power" vp WHERE vp."user_id" = up."user_id");
  END IF;
END $$;
