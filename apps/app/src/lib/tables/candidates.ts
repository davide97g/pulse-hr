import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { candidates, __setCandidates, type Candidate } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = candidates;

export const candidatesTable = createTable<Candidate>("candidates", seed, "c");

export function useCandidates(): Candidate[] {
  return candidatesTable.useAll();
}

candidatesTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setCandidates(candidatesTable.getAll());
});
