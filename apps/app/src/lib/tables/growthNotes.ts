import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { growthNotesSeed, __setGrowthNotesSeed, type GrowthNote } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = growthNotesSeed;

export const growthNotesTable = createTable<GrowthNote>("growthNotes", seed, "gn");

export function useGrowthNotes(): GrowthNote[] {
  return growthNotesTable.useAll();
}

growthNotesTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setGrowthNotesSeed(growthNotesTable.getAll());
});
