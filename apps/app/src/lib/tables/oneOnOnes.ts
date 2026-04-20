import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { oneOnOnesSeed, __setOneOnOnesSeed, type OneOnOne } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = oneOnOnesSeed;

export const oneOnOnesTable = createTable<OneOnOne>("oneOnOnes", seed, "oo");

export function useOneOnOnes(): OneOnOne[] {
  return oneOnOnesTable.useAll();
}

oneOnOnesTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setOneOnOnesSeed(oneOnOnesTable.getAll());
});
