/**
 * Builds the Super Import knownEntityDigest from the current persistent
 * tables. Capped to ~500 rows total to keep the LLM prompt small. Sample
 * order: most-recent-first per table, then round-robin.
 */
import type { KnownEntityDigest, SuperImportEntityType } from "@pulse-hr/shared/super-import";
import { employeesTable } from "@/lib/tables/employees";
import { projectsTable } from "@/lib/tables/projects";
import { candidatesTable } from "@/lib/tables/candidates";
import { clientsTable } from "@/lib/tables/clients";
import { activitiesTable } from "@/lib/tables/activities";

const MAX_TOTAL = 500;
const PER_TABLE = 100;

type Mapper<T> = (row: T) => { id: string; displayLabel: string };

function pull<T extends { id: string }>(
  rows: T[],
  type: SuperImportEntityType,
  map: Mapper<T>,
): KnownEntityDigest {
  return rows.slice(0, PER_TABLE).map((r) => ({ type, ...map(r) }));
}

export function buildKnownEntityDigest(): KnownEntityDigest {
  const out: KnownEntityDigest = [
    ...pull(employeesTable.getAll(), "employee", (r: any) => ({ id: r.id, displayLabel: `${r.name} · ${r.role}` })),
    ...pull(projectsTable.getAll(), "commessa", (r: any) => ({ id: r.id, displayLabel: `${r.code} · ${r.name}` })),
    ...pull(candidatesTable.getAll(), "candidate", (r: any) => ({ id: r.id, displayLabel: `${r.name} · ${r.role ?? ""}` })),
    ...pull(clientsTable.getAll(), "client", (r: any) => ({ id: r.id, displayLabel: r.name })),
    ...pull(activitiesTable.getAll(), "activity", (r: any) => ({ id: r.id, displayLabel: r.title })),
  ];
  return out.slice(0, MAX_TOTAL);
}
