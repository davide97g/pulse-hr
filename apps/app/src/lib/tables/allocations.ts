import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { allocations, __setAllocations, type Allocation } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = allocations;

export const allocationsTable = createTable<Allocation>("allocations", seed, "al");

export function useAllocations(): Allocation[] {
  return allocationsTable.useAll();
}

allocationsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setAllocations(allocationsTable.getAll());
});
