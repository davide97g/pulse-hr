#!/usr/bin/env bun
/**
 * Backfill: ensure every user with a questionnaire grant event has a
 * voting_power row reflecting that grant. Idempotent.
 *
 * Why this exists: the v1 migration's INSERT into voting_power_events ran
 * for every `user_profiles.fully_answered = true` user, but the UPDATE that
 * bumped `voting_power.power` only touched existing voting_power rows.
 * Users who completed the questionnaire but never had a voting_power row
 * (e.g. early adopters before the table existed) ended up with an event
 * row but no power row.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const sql = neon(url);

const before = (await sql.query(`
  select 'profiles_completed' as k, count(*)::int as n from user_profiles where fully_answered = true
  union all
  select 'voting_power_rows', count(*)::int from voting_power
  union all
  select 'questionnaire_grants', count(*)::int from voting_power_events
   where source_key = 'questionnaire:company_profile'
  union all
  select 'missing_vp_for_completers', count(*)::int from user_profiles up
   where up.fully_answered = true
     and not exists (select 1 from voting_power vp where vp.user_id = up.user_id)
`)) as Array<{ k: string; n: number }>;

console.log("Before:");
for (const r of before) console.log(" ", r);

const inserted = (await sql.query(`
  insert into voting_power (user_id, power, baseline, last_refill_at, updated_at)
  select up.user_id, 20, 10, now(), now()
    from user_profiles up
   where up.fully_answered = true
     and not exists (select 1 from voting_power vp where vp.user_id = up.user_id)
  returning user_id
`)) as Array<{ user_id: string }>;

console.log(`\nInserted ${inserted.length} backfill voting_power rows.`);
for (const r of inserted) console.log("  +", r.user_id);

const after = (await sql.query(`
  select 'voting_power_rows' as k, count(*)::int as n from voting_power
  union all
  select 'missing_vp_for_completers', count(*)::int from user_profiles up
   where up.fully_answered = true
     and not exists (select 1 from voting_power vp where vp.user_id = up.user_id)
`)) as Array<{ k: string; n: number }>;

console.log("\nAfter:");
for (const r of after) console.log(" ", r);
