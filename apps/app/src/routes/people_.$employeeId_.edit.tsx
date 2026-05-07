import { createFileRoute } from "@tanstack/react-router";
import { EmployeeEditDiff } from "@/components/people/EmployeeEditDiff";

export const Route = createFileRoute("/people_/$employeeId_/edit")({
  head: ({ params }) => ({ meta: [{ title: `Modifica ${params.employeeId} — Pulse HR` }] }),
  component: EditRoute,
});

function EditRoute() {
  const { employeeId } = Route.useParams();
  return <EmployeeEditDiff employeeId={employeeId} />;
}
