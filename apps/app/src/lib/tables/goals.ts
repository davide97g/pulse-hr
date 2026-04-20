import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { goalsSeed, __setGoalsSeed, type Goal } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = goalsSeed;

export const goalsTable = createTable<Goal>("goals", seed, "g");

export function useGoals(): Goal[] {
  return goalsTable.useAll();
}

goalsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setGoalsSeed(goalsTable.getAll());
});
