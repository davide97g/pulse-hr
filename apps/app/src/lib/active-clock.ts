/**
 * Running clock-in state for the /time page. Persisted per workspace so a
 * mid-shift reload resumes the timer at the correct elapsed seconds instead
 * of snapping back to zero.
 */
import { useSyncExternalStore } from "react";
import { getNamespace } from "./workspace";

export interface ActiveClock {
  startedAt: string;
  commessaId: string;
}

const SUFFIX = "activeClock";

function storageKey(): string | null {
  const ns = getNamespace();
  return ns ? `${ns}.${SUFFIX}` : null;
}

const listeners = new Set<() => void>();
let cache: ActiveClock | null = null;
let cacheVersion = 0;

function read(): ActiveClock | null {
  const k = storageKey();
  if (!k) return null;
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveClock;
  } catch {
    return null;
  }
}

function refresh() {
  cache = read();
  cacheVersion += 1;
  for (const l of listeners) l();
}

refresh();

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key && e.key.endsWith(`.${SUFFIX}`)) refresh();
  });
}

export function getActiveClock(): ActiveClock | null {
  return cache;
}

export function startActiveClock(commessaId: string) {
  const k = storageKey();
  if (!k) return;
  const next: ActiveClock = { startedAt: new Date().toISOString(), commessaId };
  try {
    localStorage.setItem(k, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  refresh();
}

export function clearActiveClock() {
  const k = storageKey();
  if (!k) return;
  try {
    localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
  refresh();
}

export function useActiveClock(): ActiveClock | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => cache,
    () => cache,
  );
}

/** Seconds elapsed since the clock started; 0 if not running. */
export function elapsedSeconds(clock: ActiveClock | null, now: number = Date.now()): number {
  if (!clock) return 0;
  const started = Date.parse(clock.startedAt);
  if (Number.isNaN(started)) return 0;
  return Math.max(0, Math.floor((now - started) / 1000));
}
