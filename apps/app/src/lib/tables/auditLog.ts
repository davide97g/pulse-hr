import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { auditLogSeed, __setAuditLogSeed, type AuditEntry } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = auditLogSeed;

export const auditLogTable = createTable<AuditEntry>("auditLog", seed, "au");

export function useAuditLog(): AuditEntry[] {
  return auditLogTable.useAll();
}

auditLogTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setAuditLogSeed(auditLogTable.getAll());
});
