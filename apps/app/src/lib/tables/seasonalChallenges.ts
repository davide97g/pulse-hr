import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { seasonalChallengesSeed, __setSeasonalChallengesSeed, type SeasonalChallenge } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = seasonalChallengesSeed;

export const seasonalChallengesTable = createTable<SeasonalChallenge>("seasonalChallenges", seed, "sc");

export function useSeasonalChallenges(): SeasonalChallenge[] {
  return seasonalChallengesTable.useAll();
}

seasonalChallengesTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setSeasonalChallengesSeed(seasonalChallengesTable.getAll());
});
