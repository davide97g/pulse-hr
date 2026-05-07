import { createFileRoute } from "@tanstack/react-router";
import { PersonEditorialSpread } from "@/components/people/PersonEditorialSpread";

export const Route = createFileRoute("/people_/$employeeId")({
  head: ({ params }) => ({ meta: [{ title: `Persona — ${params.employeeId} — Pulse HR` }] }),
  component: EmployeeDetailRoute,
});

function EmployeeDetailRoute() {
  const { employeeId } = Route.useParams();
  return <PersonEditorialSpread employeeId={employeeId} />;
}
