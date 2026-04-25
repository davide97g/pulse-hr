#!/usr/bin/env bun
/**
 * Smoke check for the voting-power v1 migration. Reads schema + counts and
 * prints a short report. Read-only.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const sql = neon(url);

async function rows<T = Record<string, unknown>>(query: string): Promise<T[]> {
  return (await sql.query(query)) as T[];
}

const cols = await rows(`
  select column_name, data_type, column_default
    from information_schema.columns
   where table_name = 'voting_power'
   order by ordinal_position
`);

const idx = await rows(`
  select indexname, indexdef
    from pg_indexes
   where tablename = 'voting_power_events'
   order by indexname
`);

const tables = await rows(`
  select table_name
    from information_schema.tables
   where table_schema = 'public'
     and table_name in ('voting_power','voting_power_events','voting_power_events_legacy')
   order by table_name
`);

const counts = await rows<{ k: string; n: number }>(`
  select 'voting_power' as k, count(*)::int as n from voting_power
  union all
  select 'events', count(*)::int from voting_power_events
  union all
  select 'events_legacy', count(*)::int from voting_power_events_legacy
  union all
  select 'profiles_completed', count(*)::int from user_profiles where fully_answered = true
  union all
  select 'questionnaire_grants', count(*)::int from voting_power_events
   where source_key = 'questionnaire:company_profile'
`);

const samplePower = await rows<{
  user_id: string;
  power: number;
  baseline: number;
  last_refill_at: string;
}>(`
  select user_id, power, baseline, last_refill_at
    from voting_power
   order by user_id
   limit 5
`);

console.log("\n=== voting_power columns ===");
for (const c of cols) console.log(c);

console.log("\n=== voting_power_events indexes ===");
for (const i of idx) console.log(i);

console.log("\n=== tables present ===");
for (const t of tables) console.log(t);

console.log("\n=== counts ===");
for (const c of counts) console.log(c);

console.log("\n=== sample voting_power rows ===");
for (const r of samplePower) console.log(r);
