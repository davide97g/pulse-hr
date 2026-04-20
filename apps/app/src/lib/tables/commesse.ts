import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { commesse, __setCommesse, type Commessa } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = commesse;

export const commesseTable = createTable<Commessa>("commesse", seed, "cm");

export function useCommesse(): Commessa[] {
  return commesseTable.useAll();
}

commesseTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setCommesse(commesseTable.getAll());
});
