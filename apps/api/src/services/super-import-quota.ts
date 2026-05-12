/**
 * In-memory, per-user, per-day quota counter for Super Import runs.
 *
 * Keyed by Clerk userId. The day bucket is computed in UTC (resets at 00:00
 * UTC). Single-instance — Render runs one container so this is fine for v1.
 * If we ever scale-out, swap the Map for Upstash Redis.
 */
import { RUNS_PER_DAY } from "@pulse-hr/shared/super-import";

type Bucket = { day: string; runs: number };

const store = new Map<string, Bucket>();

function currentDay(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextResetISO(): string {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.toISOString();
}

function bucketFor(userId: string): Bucket {
  const today = currentDay();
  const existing = store.get(userId);
  if (!existing || existing.day !== today) {
    const fresh: Bucket = { day: today, runs: 0 };
    store.set(userId, fresh);
    return fresh;
  }
  return existing;
}

export function peekQuota(userId: string) {
  const b = bucketFor(userId);
  return {
    runsLeft: Math.max(0, RUNS_PER_DAY - b.runs),
    runsTotal: RUNS_PER_DAY,
    resetAt: nextResetISO(),
  };
}

export type ConsumeResult =
  | { ok: true; runsLeft: number; runsTotal: number; resetAt: string }
  | { ok: false; resetAt: string };

export function checkAndConsume(userId: string): ConsumeResult {
  const b = bucketFor(userId);
  if (b.runs >= RUNS_PER_DAY) {
    return { ok: false, resetAt: nextResetISO() };
  }
  b.runs += 1;
  return {
    ok: true,
    runsLeft: RUNS_PER_DAY - b.runs,
    runsTotal: RUNS_PER_DAY,
    resetAt: nextResetISO(),
  };
}

/** Test-only — clears the in-memory store. */
export function __resetQuotaForTest(): void {
  store.clear();
}
