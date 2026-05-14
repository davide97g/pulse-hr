import { useEffect, useState } from "react";
import {
  LV_INDEX,
  MY_SKILLS,
  SKILL_CATALOG,
  type LevelDistribution,
  type MySkillRow,
  type SkillCatalogEntry,
  type SkillLevel,
} from "./skills-data";

/* =============================================================
 * Skills CRUD store — persisted via localStorage.
 * Source of truth for the active user's (Davide / DG) own skill matrix.
 * Components subscribe via `useMySkills()` and mutate via the named exports.
 * ============================================================= */

const KEY = "pulse.skills.my.v1";

const MONTHS_IT = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

function todayIt(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

function load(): MySkillRow[] {
  if (typeof window === "undefined") return [...MY_SKILLS];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [...MY_SKILLS];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [...MY_SKILLS];
    return parsed as MySkillRow[];
  } catch {
    return [...MY_SKILLS];
  }
}

function persist(rows: MySkillRow[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    /* quota exceeded etc. — silently ignore, in-memory state still works */
  }
}

let state: MySkillRow[] = load();
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function useMySkills(): MySkillRow[] {
  const [snapshot, setSnapshot] = useState(state);
  useEffect(() => {
    const l = () => setSnapshot(state);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return snapshot;
}

export interface SkillDraft {
  sk: string;
  lvl: SkillLevel;
  note?: string;
}

export function createMySkill(draft: SkillDraft): MySkillRow {
  const row: MySkillRow = {
    id: `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    sk: draft.sk,
    lvl: draft.lvl,
    val: "proposed",
    upd: todayIt(),
    by: null,
    note: draft.note?.trim() || undefined,
  };
  state = [row, ...state];
  persist(state);
  notify();
  return row;
}

/**
 * Update an existing row. Per the design contract, editing a validated skill
 * sends it back to `proposed` and clears the validator stamp — managers will
 * see it surface in their pending queue.
 */
export function updateMySkill(id: string, patch: SkillDraft): MySkillRow | null {
  let updated: MySkillRow | null = null;
  state = state.map((r) => {
    if (r.id !== id) return r;
    updated = {
      ...r,
      sk: patch.sk,
      lvl: patch.lvl,
      note: patch.note?.trim() || undefined,
      val: "proposed",
      by: null,
      upd: todayIt(),
    };
    return updated;
  });
  if (updated) {
    persist(state);
    notify();
  }
  return updated;
}

export function removeMySkill(id: string): MySkillRow | null {
  const found = state.find((r) => r.id === id) ?? null;
  if (!found) return null;
  state = state.filter((r) => r.id !== id);
  persist(state);
  notify();
  return found;
}

/** Replace the whole list — used by Undo handlers in the UI. */
export function replaceMySkills(rows: MySkillRow[]) {
  state = [...rows];
  persist(state);
  notify();
}

export function resetMySkillsToSeed() {
  replaceMySkills(MY_SKILLS);
}

/** Resolve a free-text skill name (case-insensitive) into a catalog entry. */
export function findCatalogByName(name: string): SkillCatalogEntry | undefined {
  const q = name.trim().toLowerCase();
  if (!q) return undefined;
  return SKILL_CATALOG.find((s) => s.name.toLowerCase() === q);
}

/** Level distribution for an arbitrary list of MySkill rows. */
export function distributionOf(skills: MySkillRow[]): LevelDistribution {
  const dist: Record<SkillLevel, number> = {
    novice: 0,
    practitioner: 0,
    expert: 0,
    master: 0,
  };
  let val = 0;
  for (const r of skills) {
    dist[r.lvl]++;
    if (r.val === "validated") val++;
  }
  return { n: skills.length, val, dist };
}

/** Sort helper consistent with the existing variants (master → novice, then by name). */
export function sortByLevelThenName(skills: MySkillRow[]): MySkillRow[] {
  return [...skills].sort((a, b) => {
    const dl = LV_INDEX[b.lvl] - LV_INDEX[a.lvl];
    if (dl !== 0) return dl;
    if (a.val !== b.val) return a.val === "validated" ? -1 : 1;
    return a.sk.localeCompare(b.sk);
  });
}
