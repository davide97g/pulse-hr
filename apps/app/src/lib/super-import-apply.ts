/**
 * Commits a reviewed batch of ParsedEntity rows into the live tables.
 *
 * Decisions:
 *   - 'skip'          → ignore the row
 *   - 'update'        → table.update(matchedId, data) (requires conflict.matchedId)
 *   - 'create_anyway' (or undefined decision and no conflict) → table.add(data)
 *
 * Records a single audit entry summarising the import.
 *
 * NOTE: No unit test ships with this helper. apps/app has no test
 * infrastructure (no DOM polyfill, no workspace bootstrap), and createTable
 * is localStorage-backed and workspace-gated. End-to-end behaviour is
 * verified in Task 21 of the Super Import plan.
 */
import type {
  ConflictDecision,
  ImportSummary,
  ParsedEntity,
  SuperImportEntityType,
} from "@pulse-hr/shared/super-import";
import { employeesTable } from "@/lib/tables/employees";
import { projectsTable } from "@/lib/tables/projects";
import { candidatesTable } from "@/lib/tables/candidates";
import { clientsTable } from "@/lib/tables/clients";
import { activitiesTable } from "@/lib/tables/activities";
import { allocationsTable } from "@/lib/tables/allocations";
import { leaveTable } from "@/lib/tables/leave";
import { timesheetEntriesTable } from "@/lib/tables/timesheetEntries";
import { auditLogTable } from "@/lib/tables/auditLog";

type AnyTable = {
  add: (row: any) => any;
  update: (id: string, patch: any) => void;
};

const TABLES: Record<SuperImportEntityType, AnyTable> = {
  employee: employeesTable as unknown as AnyTable,
  commessa: projectsTable as unknown as AnyTable,
  candidate: candidatesTable as unknown as AnyTable,
  client: clientsTable as unknown as AnyTable,
  activity: activitiesTable as unknown as AnyTable,
  allocation: allocationsTable as unknown as AnyTable,
  leave: leaveTable as unknown as AnyTable,
  timesheet: timesheetEntriesTable as unknown as AnyTable,
};

export function applySuperImport(
  entities: ParsedEntity[],
  decisions: Map<string, ConflictDecision>,
): ImportSummary {
  const summary: ImportSummary = { inserted: 0, updated: 0, skipped: 0, byEntity: {} };

  for (const ent of entities) {
    const decision = decisions.get(ent.id);
    const table = TABLES[ent.entityType];
    if (!table) {
      summary.skipped += 1;
      continue;
    }
    if (decision === "skip") {
      summary.skipped += 1;
      continue;
    }
    if (decision === "update" && ent.conflict) {
      table.update(ent.conflict.matchedId, ent.data);
      summary.updated += 1;
    } else {
      table.add(ent.data);
      summary.inserted += 1;
    }
    summary.byEntity[ent.entityType] = (summary.byEntity[ent.entityType] ?? 0) + 1;
  }

  try {
    (auditLogTable as unknown as AnyTable).add({
      kind: "super_import",
      summary,
      at: new Date().toISOString(),
    });
  } catch {
    console.warn("[super-import] audit log append failed");
  }

  return summary;
}
