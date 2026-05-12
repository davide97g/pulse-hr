/**
 * Cross-app + cross-tab client-side store primitives.
 *
 * apps/app already runs a richer workspace-scoped table layer in
 * `apps/app/src/lib/storage.ts`. This package-level module is the minimal
 * shared primitive used by:
 *   - apps/feedback to mirror the API offline / when running standalone,
 *   - both apps for tiny cross-app prefs (locale, theme, role override).
 *
 * Storage key prefix: `pulse.shared.*` so it never collides with
 * `pulse.ws.<userId>.*` (workspace tables) or feature-specific keys.
 *
 * Cross-tab sync: subscribes to the browser `storage` event. Writes from one
 * tab fan out to listeners in other tabs (and other apps on the same origin
 * family — feedback runs on a sibling port in dev and the same parent
 * domain in prod, so localStorage is shared per-origin only; cross-origin
 * mirroring is handled by each app reading its own copy and writing on
 * `setLocale` etc.).
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const PREFIX = "pulse.shared.";

function fullKey(key: string): string {
  return `${PREFIX}${key}`;
}

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(fullKey(key));
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(value));
    // Synthesize a same-tab notification — the browser only fires `storage`
    // in OTHER tabs. We dispatch a CustomEvent so same-tab listeners (other
    // components in the same React tree) still pick up the change.
    window.dispatchEvent(
      new CustomEvent("pulse:shared-store", { detail: { key: fullKey(key) } }),
    );
  } catch {
    // ignore
  }
}

export function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(fullKey(key));
    window.dispatchEvent(
      new CustomEvent("pulse:shared-store", { detail: { key: fullKey(key) } }),
    );
  } catch {
    // ignore
  }
}

export type StoreListener = () => void;

export function subscribe(key: string, listener: StoreListener): () => void {
  if (typeof window === "undefined") return () => {};
  const target = fullKey(key);
  function onStorage(e: StorageEvent) {
    if (e.key === target) listener();
  }
  function onSameTab(e: Event) {
    const detail = (e as CustomEvent<{ key: string }>).detail;
    if (detail?.key === target) listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener("pulse:shared-store", onSameTab as EventListener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("pulse:shared-store", onSameTab as EventListener);
  };
}

/**
 * React hook: read a JSON-serialised value from the cross-tab store, persist
 * changes, and re-render on any tab's update.
 */
export function useSharedValue<T>(
  key: string,
  fallback: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const subscribeKey = useCallback(
    (listener: StoreListener) => subscribe(key, listener),
    [key],
  );
  const getSnapshot = useCallback(() => readJSON<T>(key, fallback), [key, fallback]);
  const value = useSyncExternalStore(subscribeKey, getSnapshot, getSnapshot);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(readJSON<T>(key, fallback))
          : next;
      writeJSON(key, resolved);
    },
    [key, fallback],
  );

  return [value, set];
}

/**
 * Less reactive helper: returns the current value plus a setter, without
 * subscribing to cross-tab changes. Useful when the caller only writes.
 */
export function useReadOnceWriter<T>(
  key: string,
  fallback: T,
): { read: () => T; write: (next: T) => void } {
  const [, force] = useState(0);
  const read = useCallback(() => readJSON<T>(key, fallback), [key, fallback]);
  const write = useCallback(
    (next: T) => {
      writeJSON(key, next);
      force((n) => n + 1);
    },
    [key],
  );
  return { read, write };
}
