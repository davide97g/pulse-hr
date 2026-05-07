import { createFileRoute } from "@tanstack/react-router";
import { TimesheetCalendar } from "@/components/calendar/TimesheetCalendar";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Pulse HR" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  return <TimesheetCalendar />;
}
