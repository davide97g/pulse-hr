import { createFileRoute } from "@tanstack/react-router";
import { LeaveEditorial } from "@/components/leave/LeaveEditorial";

export const Route = createFileRoute("/leave")({
  head: () => ({ meta: [{ title: "Riposo — Pulse HR" }] }),
  component: LeavePage,
});

function LeavePage() {
  return <LeaveEditorial />;
}
