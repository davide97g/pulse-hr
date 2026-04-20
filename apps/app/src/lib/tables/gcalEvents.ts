import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { gcalEventsSeed, __setGcalEventsSeed, type GCalEvent } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = gcalEventsSeed;

export const gcalEventsTable = createTable<GCalEvent>("gcalEvents", seed, "gc");

export function useGcalEvents(): GCalEvent[] {
  return gcalEventsTable.useAll();
}

gcalEventsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setGcalEventsSeed(gcalEventsTable.getAll());
});
