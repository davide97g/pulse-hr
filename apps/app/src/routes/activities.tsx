import { createFileRoute } from "@tanstack/react-router";
import { ActivitiesEditorial } from "@/components/activities/ActivitiesEditorial";

export const Route = createFileRoute("/activities")({
  head: () => ({ meta: [{ title: "Attività — Pulse HR" }] }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  return <ActivitiesEditorial />;
}
