import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { focusSessionsSeed, __setFocusSessionsSeed, type FocusSession } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = focusSessionsSeed;

export const focusSessionsTable = createTable<FocusSession>("focusSessions", seed, "fs");

export function useFocusSessions(): FocusSession[] {
  return focusSessionsTable.useAll();
}

focusSessionsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setFocusSessionsSeed(focusSessionsTable.getAll());
});
