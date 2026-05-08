/**
 * Persists an in-progress form draft to localStorage so users don't lose
 * unsaved input when they close a dialog/sheet or reload the page. Mirrors
 * the inline pattern in `EmployeeNewWizard` so each form gets the same
 * behaviour without re-implementing the read/write/clear plumbing.
 *
 * Keys live under the flat `pulsehr.draft.*` namespace (not per-user) —
 * drafts are scratch buffers, consistent with the existing wizard.
 */
import { useEffect, useRef, useState } from "react";

function readDraft<T>(key: string, empty: T): T {
  if (typeof localStorage === "undefined") return empty;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return empty;
    return { ...(empty as object), ...(JSON.parse(raw) as object) } as T;
  } catch {
    return empty;
  }
}

function writeDraft<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / disabled storage */
  }
}

function removeDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export interface UseDraft<T> {
  draft: T;
  setDraft: (next: Partial<T> | ((prev: T) => T)) => void;
  resetDraft: (next?: T) => void;
  clearDraft: () => void;
}

export function useDraft<T extends object>(key: string, empty: T): UseDraft<T> {
  const [draft, setRaw] = useState<T>(() => readDraft(key, empty));
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    writeDraft(key, draft);
  }, [key, draft]);

  function setDraft(next: Partial<T> | ((prev: T) => T)) {
    setRaw((prev) =>
      typeof next === "function" ? (next as (p: T) => T)(prev) : { ...prev, ...next },
    );
  }

  function resetDraft(next: T = empty) {
    setRaw(next);
  }

  function clearDraft() {
    removeDraft(key);
    setRaw(empty);
  }

  return { draft, setDraft, resetDraft, clearDraft };
}
