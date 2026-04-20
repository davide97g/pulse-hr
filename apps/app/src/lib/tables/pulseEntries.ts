import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { pulseEntries, __setPulseEntries, type PulseEntry } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = pulseEntries;

export const pulseEntriesTable = createTable<PulseEntry>("pulseEntries", seed, "pl");

export function usePulseEntries(): PulseEntry[] {
  return pulseEntriesTable.useAll();
}

pulseEntriesTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setPulseEntries(pulseEntriesTable.getAll());
});
