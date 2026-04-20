import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { timesheetEntries, __setTimesheetEntries, type TimesheetEntry } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = timesheetEntries;

export const timesheetEntriesTable = createTable<TimesheetEntry>("timesheetEntries", seed, "te");

export function useTimesheetEntries(): TimesheetEntry[] {
  return timesheetEntriesTable.useAll();
}

timesheetEntriesTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setTimesheetEntries(timesheetEntriesTable.getAll());
});
