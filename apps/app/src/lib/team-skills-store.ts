import { useEffect, useState } from "react";
import {
  LV_INDEX,
  PROPOSED as SEED_PROPOSED,
  SKILL_CATALOG,
  SKILL_GRID as SEED_GRID,
  SKILL_TEAM,
  skill as resolveSkill,
  employee as resolveEmployee,
  MY_ID,
  type MySkillRow,
  type LevelDistribution,
  type PendingRow,
  type PerSkillAggregate,
  type SkillCatalogEntry,
  type SkillLevel,
  type SkillTeamMember,
  type TeamMetrics,
} from "./skills-data";

/* =============================================================
 * Team Skills CRUD store — persisted via localStorage.
 *
 * Mirrors the SEED_GRID + SEED_PROPOSED constants in skills-data.ts but lets
 * managers approve / adjust / add team cells and have those edits survive a
 * reload. The self-view continues to use the `skills-store` module for the
 * active user's own matrix.
 * ============================================================= */

const KEY = "pulse.skills.team.v1";

export type TeamGrid = Record<string, Record<string, SkillLevel>>;
export type ProposedKey = `${string}:${string}`;

interface PersistedState {
  grid: TeamGrid;
  proposed: ProposedKey[];
}

function cloneSeed(): PersistedState {
  const grid: TeamGrid = {};
  for (const [skillId, row] of Object.entries(SEED_GRID)) {
    grid[skillId] = { ...row } as Record<string, SkillLevel>;
  }
  return {
    grid,
    proposed: Array.from(SEED_PROPOSED) as ProposedKey[],
  };
}

function load(): PersistedState {
  if (typeof window === "undefined") return cloneSeed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as PersistedState | null;
    if (!parsed || typeof parsed !== "object" || !parsed.grid || !Array.isArray(parsed.proposed)) {
      return cloneSeed();
    }
    return parsed;
  } catch {
    return cloneSeed();
  }
}

function persist(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded — ignore */
  }
}

let state: PersistedState = load();
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function useTeamSkills(): PersistedState {
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

function key(skillId: string, empId: string): ProposedKey {
  return `${skillId}:${empId}` as ProposedKey;
}

/** Approve a single proposed cell — removes it from the pending set. */
export function approveCell(skillId: string, empId: string) {
  const k = key(skillId, empId);
  if (!state.proposed.includes(k)) return;
  state = { ...state, proposed: state.proposed.filter((p) => p !== k) };
  persist(state);
  notify();
}

/** Approve every currently-pending cell at once. Returns the previous list for Undo. */
export function approveAllPending(): ProposedKey[] {
  const previous = state.proposed;
  if (previous.length === 0) return [];
  state = { ...state, proposed: [] };
  persist(state);
  notify();
  return previous;
}

/** Restore an arbitrary list of pending keys (used by Undo). */
export function restorePending(keys: ProposedKey[]) {
  state = { ...state, proposed: [...new Set([...state.proposed, ...keys])] };
  persist(state);
  notify();
}

/**
 * Set (insert or update) a team cell. When `validated` is false the cell is
 * marked as proposed so it surfaces in the pending queue.
 */
export function setCell(
  skillId: string,
  empId: string,
  lvl: SkillLevel,
  validated: boolean,
) {
  const nextGrid: TeamGrid = { ...state.grid, [skillId]: { ...(state.grid[skillId] ?? {}) } };
  nextGrid[skillId][empId] = lvl;
  const k = key(skillId, empId);
  const inProposed = state.proposed.includes(k);
  let nextProposed = state.proposed;
  if (validated && inProposed) {
    nextProposed = state.proposed.filter((p) => p !== k);
  } else if (!validated && !inProposed) {
    nextProposed = [...state.proposed, k];
  }
  state = { grid: nextGrid, proposed: nextProposed };
  persist(state);
  notify();
}

export function removeCell(skillId: string, empId: string) {
  const row = state.grid[skillId];
  if (!row || !(empId in row)) return;
  const { [empId]: _omit, ...rest } = row;
  const nextGrid: TeamGrid = { ...state.grid, [skillId]: rest };
  const k = key(skillId, empId);
  state = {
    grid: nextGrid,
    proposed: state.proposed.filter((p) => p !== k),
  };
  persist(state);
  notify();
}

export function resetTeamToSeed() {
  state = cloneSeed();
  persist(state);
  notify();
}

/* =============================================================
 * Pure selectors — derive metrics from an explicit snapshot so the manager
 * components stay reactive via `useTeamSkills()` without going through module
 * state on every read.
 * ============================================================= */

export function cellLevelFrom(
  grid: TeamGrid,
  skillId: string,
  empId: string,
): SkillLevel | undefined {
  return grid[skillId]?.[empId];
}

export function isProposedFrom(
  proposed: ProposedKey[],
  skillId: string,
  empId: string,
): boolean {
  return proposed.includes(key(skillId, empId));
}

const EMPTY_DIST: Record<SkillLevel, number> = {
  novice: 0,
  practitioner: 0,
  expert: 0,
  master: 0,
};

/**
 * Distribution for one employee. For `dg` we splice in the live self-skills
 * snapshot so the manager view matches whatever the user has edited.
 */
export function countByLevelFrom(
  empId: string,
  grid: TeamGrid,
  proposed: ProposedKey[],
  mySkills: MySkillRow[],
): LevelDistribution {
  const dist: Record<SkillLevel, number> = { ...EMPTY_DIST };
  let n = 0;
  let val = 0;
  if (empId === MY_ID) {
    for (const r of mySkills) {
      n++;
      dist[r.lvl]++;
      if (r.val === "validated") val++;
    }
  } else {
    for (const s of SKILL_CATALOG) {
      const l = cellLevelFrom(grid, s.id, empId);
      if (l) {
        n++;
        dist[l]++;
        if (!isProposedFrom(proposed, s.id, empId)) val++;
      }
    }
  }
  return { n, val, dist };
}

export function teamMetricsFrom(grid: TeamGrid, proposed: ProposedKey[]): TeamMetrics {
  let totalCells = 0;
  let pending = 0;
  let validCovered = 0;
  let gaps = 0;
  for (const s of SKILL_CATALOG) {
    let validatedCount = 0;
    let practitionerPlus = 0;
    for (const e of SKILL_TEAM) {
      const l = cellLevelFrom(grid, s.id, e.id);
      if (l) {
        totalCells++;
        if (isProposedFrom(proposed, s.id, e.id)) pending++;
        else validatedCount++;
        if (LV_INDEX[l] >= 2) practitionerPlus++;
      }
    }
    if (validatedCount >= 1) validCovered++;
    if (practitionerPlus <= 1) gaps++;
  }
  return {
    skills: SKILL_CATALOG.length,
    people: SKILL_TEAM.length,
    totalCells,
    coverage: Math.round((100 * validCovered) / SKILL_CATALOG.length),
    pending,
    gaps,
  };
}

export function perSkillAggregatesFrom(
  grid: TeamGrid,
  proposed: ProposedKey[],
): PerSkillAggregate[] {
  return SKILL_CATALOG.map((s) => {
    const people: PerSkillAggregate["people"] = [];
    for (const e of SKILL_TEAM) {
      const l = cellLevelFrom(grid, s.id, e.id);
      if (l) people.push({ e, lvl: l, proposed: isProposedFrom(proposed, s.id, e.id) });
    }
    const expertPlus = people.filter((p) => LV_INDEX[p.lvl] >= 3);
    const practPlus = people.filter((p) => LV_INDEX[p.lvl] >= 2);
    return { ...s, people, expertPlus, practPlus };
  });
}

export function pendingRowsFrom(grid: TeamGrid, proposed: ProposedKey[]): PendingRow[] {
  const rows: PendingRow[] = [];
  for (const k of proposed) {
    const [sId, eId] = k.split(":");
    const s: SkillCatalogEntry | undefined = resolveSkill(sId);
    const e: SkillTeamMember | undefined = resolveEmployee(eId);
    const lvl = cellLevelFrom(grid, sId, eId);
    if (!s || !e || !lvl) continue;
    rows.push({ s, e, lvl, key: k });
  }
  rows.sort((a, b) => LV_INDEX[b.lvl] - LV_INDEX[a.lvl]);
  return rows;
}
