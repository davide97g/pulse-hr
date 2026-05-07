import { createFileRoute } from "@tanstack/react-router";
import { EmployeeNewWizard } from "@/components/people/EmployeeNewWizard";

export const Route = createFileRoute("/people_/new")({
  head: () => ({ meta: [{ title: "Nuovo dipendente — Pulse HR" }] }),
  component: NewEmployeeRoute,
});

function NewEmployeeRoute() {
  return <EmployeeNewWizard />;
}
