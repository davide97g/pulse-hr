/**
 * Generic per-entity table backed by localStorage. One file per entity wraps
 * `createTable(key, seed)` to expose typed React hooks + imperative CRUD.
 *
 * Tables register themselves with the workspace controller so a single
 * `createWorkspace()` / `resetWorkspace()` call fans out to every table.
 *
 * No data is read or written until a Clerk user is set on the workspace
 * controller (see workspace.setCurrentUserId). Pre-onboarding every table
 * reads as `[]`.
 */
import { useSyncExternalStore } from "react";
import { getNamespace, isWorkspaceReady, registerTable } from "./workspace";

let idCounter = 0;
function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

// ── Global "any table changed" pulse ──────────────────────────────────
// Used by TableStoreProvider to re-render the whole React subtree whenever
// any persistent table mutates. Lets legacy components that still read live
// bindings from `mock-data.ts` (instead of the new table hooks) pick up
// changes without per-file migration.
const globalListeners = new Set<() => void>();
let globalVersion = 0;
function pulse() {
  globalVersion += 1;
  for (const l of globalListeners) {
    try {
      l();
    } catch (err) {
      console.warn("storage: global listener threw", err);
    }
  }
}
export function subscribeToAnyTable(listener: () => void): () => void {
  globalListeners.add(listener);
  return () => {
    globalListeners.delete(listener);
  };
}
export function getAnyTableVersion(): number {
  return globalVersion;
}

export interface Table<T extends { id: string }> {
  /** React hook — re-renders on any mutation (or workspace switch). */
  useAll(): T[];
  /** React hook — single row by id. */
  useById(id: string): T | undefined;
  /** Imperative read; safe outside React. */
  getAll(): T[];
  /** Append. Generates an id if absent. Returns the inserted row. */
  add(input: Omit<T, "id"> | T): T;
  /** Shallow merge by id. No-op if id not found. */
  update(id: string, patch: Partial<T>): void;
  /** Delete by id. */
  remove(id: string): void;
  /** Replace the entire table contents (used by seeding/import flows). */
  replace(rows: T[]): void;
  /** Drop in-memory + on-disk state for this table only. */
  reset(): void;
  /** Subscribe to mutations. */
  subscribe(listener: () => void): () => void;
}

export function createTable<T extends { id: string }>(
  tableKey: string,
  seed: T[],
  idPrefix?: string,
): Table<T> {
  let rows: T[] = [];
  const listeners = new Set<() => void>();
  const prefix = idPrefix ?? tableKey.slice(0, 2);

  function fullKey(): string | null {
    const ns = getNamespace();
    return ns ? `${ns}.${tableKey}` : null;
  }

  function persist() {
    const k = fullKey();
    if (!k) return;
    try {
      localStorage.setItem(k, JSON.stringify(rows));
    } catch (err) {
      console.warn(`storage[${tableKey}]: persist failed`, err);
    }
  }

  function notify() {
    for (const l of listeners) {
      try {
        l();
      } catch (err) {
        console.warn(`storage[${tableKey}]: listener threw`, err);
      }
    }
    pulse();
  }

  function hydrate() {
    const k = fullKey();
    if (!k) {
      rows = [];
      notify();
      return;
    }
    try {
      const raw = localStorage.getItem(k);
      if (raw != null) {
        rows = JSON.parse(raw) as T[];
      } else if (isWorkspaceReady()) {
        // Table added after workspace creation — seed and persist now so the
        // user sees real-looking data instead of an unexplained empty list.
        rows = seed.map((r) => ({ ...r }));
        persist();
      } else {
        rows = [];
      }
    } catch (err) {
      console.warn(`storage[${tableKey}]: hydrate failed`, err);
      rows = [];
    }
    notify();
  }

  function clear() {
    rows = [];
    notify();
  }

  function seedNow() {
    rows = seed.map((r) => ({ ...r }));
    persist();
    notify();
  }

  registerTable({
    key: tableKey,
    hydrate,
    clear,
    seed: seedNow,
  });

  // Try to hydrate immediately. If the workspace controller hasn't seen a
  // userId yet (typical on initial module load), this is a no-op; the
  // controller will call hydrate again once Clerk resolves.
  hydrate();

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return {
    subscribe,
    getAll: () => rows,
    useAll() {
      return useSyncExternalStore(
        subscribe,
        () => rows,
        () => rows,
      );
    },
    useById(id) {
      const all = this.useAll();
      return all.find((r) => r.id === id);
    },
    add(input) {
      const row = (
        "id" in (input as object) ? input : { ...(input as object), id: newId(prefix) }
      ) as T;
      rows = [...rows, row];
      persist();
      notify();
      return row;
    },
    update(id, patch) {
      let changed = false;
      rows = rows.map((r) => {
        if (r.id !== id) return r;
        changed = true;
        return { ...r, ...patch };
      });
      if (changed) {
        persist();
        notify();
      }
    },
    remove(id) {
      const next = rows.filter((r) => r.id !== id);
      if (next.length === rows.length) return;
      rows = next;
      persist();
      notify();
    },
    replace(next) {
      rows = next;
      persist();
      notify();
    },
    reset() {
      rows = [];
      const k = fullKey();
      if (k) {
        try {
          localStorage.removeItem(k);
        } catch (err) {
          console.warn(`storage[${tableKey}]: reset failed`, err);
        }
      }
      notify();
    },
  };
}
