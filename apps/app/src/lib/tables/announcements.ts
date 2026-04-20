import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { announcements, __setAnnouncements, type Announcement } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = announcements;

export const announcementsTable = createTable<Announcement>("announcements", seed, "an");

export function useAnnouncements(): Announcement[] {
  return announcementsTable.useAll();
}

announcementsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setAnnouncements(announcementsTable.getAll());
});
