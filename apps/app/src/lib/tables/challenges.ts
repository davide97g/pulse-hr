import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { challengesSeed, __setChallengesSeed, type Challenge } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = challengesSeed;

export const challengesTable = createTable<Challenge>("challenges", seed, "ch");

export function useChallenges(): Challenge[] {
  return challengesTable.useAll();
}

challengesTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setChallengesSeed(challengesTable.getAll());
});
