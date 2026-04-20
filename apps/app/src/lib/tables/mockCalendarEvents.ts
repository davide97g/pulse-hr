import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { mockCalendarEvents, __setMockCalendarEvents, type CalendarEvent } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = mockCalendarEvents;

export const mockCalendarEventsTable = createTable<CalendarEvent>("mockCalendarEvents", seed, "ce");

export function useMockCalendarEvents(): CalendarEvent[] {
  return mockCalendarEventsTable.useAll();
}

mockCalendarEventsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setMockCalendarEvents(mockCalendarEventsTable.getAll());
});
