import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { logMessages, __setLogMessages, type LogMessage } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = logMessages;

export const logMessagesTable = createTable<LogMessage>("logMessages", seed, "lm");

export function useLogMessages(): LogMessage[] {
  return logMessagesTable.useAll();
}

logMessagesTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setLogMessages(logMessagesTable.getAll());
});
