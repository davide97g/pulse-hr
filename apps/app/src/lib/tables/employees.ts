/**
 * Persistent employees table. First vertical slice of the createTable factory:
 * proves cross-section read/write and reload survival.
 *
 * Hooks (useEmployees / useEmployee) re-render any subscriber on add/update/
 * remove. `employeeById` is the imperative, always-live lookup — use it from
 * non-React contexts (libs that compute scores, growth summaries, etc.).
 *
 * Helper `makeEmployee` derives the avatar fields the seed normally sets at
 * import time so callers (e.g. the QuickActions Add form) can pass plain raw
 * data and get a complete row back.
 */
import { createTable } from "@/lib/storage";
import { employeesSeed, type Employee } from "@/lib/mock-data";

const AVATAR_SURFACE = "var(--avatar-surface)";

export const employeesTable = createTable<Employee>("employees", employeesSeed, "e");

export function useEmployees(): Employee[] {
  return employeesTable.useAll();
}

export function useEmployee(id: string): Employee | undefined {
  return employeesTable.useById(id);
}

/** Imperative lookup — always reads live state. Safe outside React. */
export function employeeById(id: string): Employee | undefined {
  return employeesTable.getAll().find((e) => e.id === id);
}

export function initialsFor(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Build a complete Employee from the minimal fields a form collects. The
 * caller passes name/role/department/etc.; we fill the avatar derivations
 * the original seed used.
 */
export function makeEmployee(input: Omit<Employee, "id" | "initials" | "avatarColor">): Omit<Employee, "id"> {
  return {
    ...input,
    initials: initialsFor(input.name),
    avatarColor: AVATAR_SURFACE,
  };
}
