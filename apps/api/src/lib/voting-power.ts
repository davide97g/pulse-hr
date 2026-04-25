/**
 * Voting power v1 economy helpers.
 *
 * All mutations are expressed as single atomic SQL statements (using CTEs
 * where two writes need to be all-or-nothing) because the neon-http driver
 * does not support multi-statement transactions. Race-safety comes from
 * conditional UPDATE … WHERE clauses ("subtract only if balance >= amount")
 * and ON CONFLICT DO NOTHING on the partial unique index over
 * `voting_power_events (user_id, source_key)`.
 */
import { sql, and, eq, isNull, gte } from "drizzle-orm";
import { db, schema } from "../db/client.ts";

export const VP_BASELINE = 10;
export const VP_REFILL_DAYS = 7;
export const VP_DAILY_COMMENT_CAP = 10;
export const VP_DAILY_PROPOSAL_CAP = 10;
export const VP_GRANT_QUESTIONNAIRE = 10;
export const VP_GRANT_PLANNED = 10;
export const VP_VOTE_COST = 1;

export type VotingPowerErrorCode = "insufficient_power" | "daily_cap_reached";

export class VotingPowerError extends Error {
  readonly code: VotingPowerErrorCode;
  constructor(code: VotingPowerErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = "VotingPowerError";
  }
}

export type VotingPowerRow = {
  userId: string;
  power: number;
  baseline: number;
  lastRefillAt: Date;
};

/**
 * Ensures a `voting_power` row exists for the user (idempotent), then applies
 * the lazy weekly refill if the window has elapsed and returns the current
 * row. Always advances `last_refill_at` when due, even when the user is
 * already at baseline (so the next refill window is anchored from the latest
 * check).
 */
export async function loadAndRefill(userId: string): Promise<VotingPowerRow> {
  // Insert default row if missing. Idempotent.
  await db
    .insert(schema.votingPower)
    .values({ userId, power: VP_BASELINE, baseline: VP_BASELINE })
    .onConflictDoNothing({ target: schema.votingPower.userId });

  const intervalDays = `${VP_REFILL_DAYS} days`;

  // Atomic refill: only fires when at least one full window has elapsed.
  // Tops up to baseline (no-op when already >= baseline). Always advances
  // last_refill_at when due. Returns the prior power so callers can see the
  // delta and decide whether to log a ledger event.
  type RefillRow = {
    user_id: string;
    power: number;
    baseline: number;
    last_refill_at: Date | string;
    prior_power: number;
  };
  const updated = await db.execute(sql`
    UPDATE ${schema.votingPower} vp
       SET power = GREATEST(vp.power, vp.baseline),
           last_refill_at = now(),
           updated_at = now()
      FROM (SELECT user_id, power AS prior_power FROM ${schema.votingPower} WHERE user_id = ${userId}) prev
     WHERE vp.user_id = ${userId}
       AND now() - vp.last_refill_at >= (${intervalDays})::interval
       AND prev.user_id = vp.user_id
    RETURNING vp.user_id, vp.power, vp.baseline, vp.last_refill_at, prev.prior_power
  `);

  // drizzle's neon-http execute returns { rows: [...] } | array depending on
  // version; normalize.
  const refillRow = pickRow<RefillRow>(updated);

  if (refillRow) {
    const delta = refillRow.power - refillRow.prior_power;
    if (delta > 0) {
      await insertEvent(userId, delta, "Weekly refill", null);
    }
    return {
      userId: refillRow.user_id,
      power: refillRow.power,
      baseline: refillRow.baseline,
      lastRefillAt: toDate(refillRow.last_refill_at),
    };
  }

  // No refill due — read current row.
  const [current] = await db
    .select()
    .from(schema.votingPower)
    .where(eq(schema.votingPower.userId, userId))
    .limit(1);
  return {
    userId: current!.userId,
    power: current!.power,
    baseline: current!.baseline,
    lastRefillAt: current!.lastRefillAt,
  };
}

/**
 * Atomically subtract `amount` and append a ledger event. Throws
 * `VotingPowerError("insufficient_power")` if the user's balance would go
 * negative. The CTE guarantees that the event row is only written when the
 * UPDATE actually succeeded.
 */
export async function chargePower(
  userId: string,
  amount: number,
  reason: string,
  sourceKey: string | null,
): Promise<{ power: number }> {
  if (amount <= 0) throw new Error("chargePower amount must be positive");

  const result = await db.execute(sql`
    WITH updated AS (
      UPDATE ${schema.votingPower}
         SET power = power - ${amount},
             updated_at = now()
       WHERE user_id = ${userId} AND power >= ${amount}
       RETURNING power
    ),
    event AS (
      INSERT INTO ${schema.votingPowerEvents}
        (user_id, delta, reason, source_key)
      SELECT ${userId}, ${-amount}, ${reason}, ${sourceKey}
       WHERE EXISTS (SELECT 1 FROM updated)
      RETURNING id
    )
    SELECT power FROM updated
  `);

  const row = pickRow<{ power: number }>(result);
  if (!row) {
    throw new VotingPowerError("insufficient_power", "Not enough voting power.");
  }
  return { power: row.power };
}

/**
 * Atomically add `amount` and append a ledger event. No upper clamp:
 * refunds only fire on retracted/swapped votes that were previously
 * charged, so by construction the user can never end up above where they
 * started. (Capping at baseline would incorrectly *reduce* boosted users
 * who had earned grants above baseline before voting.)
 */
export async function refundPower(
  userId: string,
  amount: number,
  reason: string,
  sourceKey: string | null,
): Promise<{ power: number }> {
  if (amount <= 0) throw new Error("refundPower amount must be positive");

  const result = await db.execute(sql`
    WITH updated AS (
      UPDATE ${schema.votingPower}
         SET power = power + ${amount},
             updated_at = now()
       WHERE user_id = ${userId}
       RETURNING power
    ),
    event AS (
      INSERT INTO ${schema.votingPowerEvents}
        (user_id, delta, reason, source_key)
      SELECT ${userId}, ${amount}, ${reason}, ${sourceKey}
       WHERE EXISTS (SELECT 1 FROM updated)
      RETURNING id
    )
    SELECT power FROM updated
  `);

  const row = pickRow<{ power: number }>(result);
  if (!row) {
    return { power: VP_BASELINE };
  }
  return { power: row.power };
}

/**
 * Idempotent one-shot grant. The unique partial index on
 * `voting_power_events (user_id, source_key) WHERE source_key IS NOT NULL`
 * is the source of truth for "already granted." If the event row is new,
 * power is incremented. If it already existed, this is a no-op.
 *
 * `sourceKey` MUST NOT be null here — that's how idempotency is enforced.
 */
export async function grantPower(
  userId: string,
  delta: number,
  reason: string,
  sourceKey: string,
): Promise<{ granted: boolean; power: number | null }> {
  if (delta <= 0) throw new Error("grantPower delta must be positive");

  const result = await db.execute(sql`
    WITH inserted AS (
      INSERT INTO ${schema.votingPowerEvents}
        (user_id, delta, reason, source_key)
      VALUES (${userId}, ${delta}, ${reason}, ${sourceKey})
      ON CONFLICT (user_id, source_key) DO NOTHING
      RETURNING id
    ),
    bumped AS (
      UPDATE ${schema.votingPower}
         SET power = power + ${delta},
             updated_at = now()
       WHERE user_id = ${userId}
         AND EXISTS (SELECT 1 FROM inserted)
      RETURNING power
    )
    SELECT power FROM bumped
  `);

  const row = pickRow<{ power: number }>(result);
  return { granted: row !== null, power: row?.power ?? null };
}

type DailyCapKind = "comment" | "proposal";

/**
 * Throws `VotingPowerError("daily_cap_reached")` if the user has already
 * created `limit` items of `kind` since the start of the current UTC day.
 * Replies do not count — only top-level rows in `comments`/`proposals`.
 */
export async function assertDailyCap(
  userId: string,
  kind: DailyCapKind,
  limit: number,
): Promise<void> {
  const startOfDayUtc = sql`date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`;

  const table = kind === "comment" ? schema.comments : schema.proposals;
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(table)
    .where(
      and(
        eq(table.authorId, userId),
        isNull(table.deletedAt),
        gte(table.createdAt, startOfDayUtc),
      ),
    );

  if ((count ?? 0) >= limit) {
    throw new VotingPowerError(
      "daily_cap_reached",
      `Daily ${kind} limit reached (${limit} per day).`,
    );
  }
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

async function insertEvent(
  userId: string,
  delta: number,
  reason: string,
  sourceKey: string | null,
): Promise<void> {
  await db.insert(schema.votingPowerEvents).values({
    userId,
    delta,
    reason,
    sourceKey,
  });
}

/**
 * Drizzle's `db.execute` over neon-http returns either an array of rows or
 * an object shaped `{ rows: [...] }` depending on driver version. Normalize
 * to a single row (or null).
 */
function pickRow<T>(result: unknown): T | null {
  if (Array.isArray(result)) {
    return (result[0] as T | undefined) ?? null;
  }
  if (result && typeof result === "object" && "rows" in result) {
    const rows = (result as { rows: T[] }).rows;
    return rows[0] ?? null;
  }
  return null;
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  return new Date(value as string);
}
