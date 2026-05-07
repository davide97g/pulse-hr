import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { achievementsSeed, __setAchievementsSeed, type Achievement } from "@/lib/mock-data";

const seed = achievementsSeed;

export const achievementsTable = createTable<Achievement>("achievements", seed, "ach");

export function useAchievements(): Achievement[] {
  return achievementsTable.useAll();
}

achievementsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setAchievementsSeed(achievementsTable.getAll());
});
