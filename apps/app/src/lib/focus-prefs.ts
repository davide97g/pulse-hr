/**
 * Persisted preferences for /focus. Runtime timer state (running, remaining)
 * stays in-memory — only the knobs the user set survive reload.
 */
import { useSyncExternalStore } from "react";
import { getNamespace } from "./workspace";

export type Soundscape = "lofi" | "rain" | "brown" | "off";

export interface FocusPrefs {
  duration: number;
  declineMeetings: boolean;
  muteSlack: boolean;
  soundscape: Soundscape;
}

const DEFAULTS: FocusPrefs = {
  duration: 50,
  declineMeetings: true,
  muteSlack: true,
  soundscape: "lofi",
};

const SUFFIX = "focusPrefs";

function storageKey(): string | null {
  const ns = getNamespace();
  return ns ? `${ns}.${SUFFIX}` : null;
}

const listeners = new Set<() => void>();
let cache: FocusPrefs = DEFAULTS;

function read(): FocusPrefs {
  const k = storageKey();
  if (!k) return DEFAULTS;
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<FocusPrefs>) };
  } catch {
    return DEFAULTS;
  }
}

function refresh() {
  cache = read();
  for (const l of listeners) l();
}

refresh();

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key && e.key.endsWith(`.${SUFFIX}`)) refresh();
  });
}

export function updateFocusPrefs(patch: Partial<FocusPrefs>) {
  const k = storageKey();
  const next = { ...cache, ...patch };
  cache = next;
  if (k) {
    try {
      localStorage.setItem(k, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  for (const l of listeners) l();
}

export function useFocusPrefs(): FocusPrefs {
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
