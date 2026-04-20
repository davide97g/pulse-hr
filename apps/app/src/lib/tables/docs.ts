import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { docsSeed, __setDocsSeed, type Doc } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = docsSeed;

export const docsTable = createTable<Doc>("docs", seed, "d");

export function useDocs(): Doc[] {
  return docsTable.useAll();
}

docsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setDocsSeed(docsTable.getAll());
});
