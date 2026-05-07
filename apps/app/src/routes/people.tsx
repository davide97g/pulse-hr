import { createFileRoute } from "@tanstack/react-router";
import { PeopleEditorialList } from "@/components/people/PeopleEditorialList";

export const Route = createFileRoute("/people")({
  head: () => ({ meta: [{ title: "Persone — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>) => s as Record<string, string>,
  component: People,
});

function People() {
  return <PeopleEditorialList />;
}
