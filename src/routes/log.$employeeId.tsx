import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { EmployeeRecapCard } from "@/components/log/EmployeeRecapCard";
import { employees, employeeLogHealth, managerAsks, logSessions } from "@/lib/mock-data";

export const Route = createFileRoute("/log/$employeeId")({
  head: ({ params }) => ({ meta: [{ title: `Recap — ${params.employeeId} — Pulse HR` }] }),
  component: LogEmployeeRoute,
});

function LogEmployeeRoute() {
  const { employeeId } = Route.useParams();
  const employee = employees.find((e) => e.id === employeeId);
  const health = employeeLogHealth.find((h) => h.employeeId === employeeId);
  const asks = managerAsks.filter((a) => a.employeeId === employeeId);
  const sessions = logSessions.filter((s) => s.employeeId === employeeId);

  if (!employee || !health) {
    return (
      <div className="p-6">
        <Link
          to="/log"
          search={{ view: "team" }}
          className="text-sm text-muted-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to team
        </Link>
        <p className="mt-6 text-muted-foreground">Report not found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Link
        to="/log"
        search={{ view: "team" }}
        className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to team
      </Link>
      <PageHeader
        title={<span>{employee.name}</span>}
        description="Summary only — raw log is private."
      />
      <EmployeeRecapCard employee={employee} health={health} asks={asks} sessions={sessions} />
    </div>
  );
}
