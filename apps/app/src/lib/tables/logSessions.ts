import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { logSessions, __setLogSessions, type LogSession } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = logSessions;

export const logSessionsTable = createTable<LogSession>("logSessions", seed, "ls");

export function useLogSessions(): LogSession[] {
  return logSessionsTable.useAll();
}

logSessionsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setLogSessions(logSessionsTable.getAll());
});
