import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { activities, __setActivities, type Activity } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = activities;

export const activitiesTable = createTable<Activity>("activities", seed, "ac");

export function useActivities(): Activity[] {
  return activitiesTable.useAll();
}

activitiesTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setActivities(activitiesTable.getAll());
});
