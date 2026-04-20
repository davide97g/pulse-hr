import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { managerAsks, __setManagerAsks, type ManagerAsk } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = managerAsks;

export const managerAsksTable = createTable<ManagerAsk>("managerAsks", seed, "ma");

export function useManagerAsks(): ManagerAsk[] {
  return managerAsksTable.useAll();
}

managerAsksTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setManagerAsks(managerAsksTable.getAll());
});
