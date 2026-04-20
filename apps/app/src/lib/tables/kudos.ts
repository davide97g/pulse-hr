import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { kudosSeed, __setKudosSeed, type Kudo } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = kudosSeed;

export const kudosTable = createTable<Kudo>("kudos", seed, "k");

export function useKudos(): Kudo[] {
  return kudosTable.useAll();
}

kudosTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setKudosSeed(kudosTable.getAll());
});
