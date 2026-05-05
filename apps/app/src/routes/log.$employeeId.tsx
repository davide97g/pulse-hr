import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { EmployeeRecapCard } from "@/components/log/EmployeeRecapCard";
import type { EmployeeLogHealth } from "@/lib/mock-data";
import { useEmployees } from "@/lib/tables/employees";
import { useManagerAsks } from "@/lib/tables/managerAsks";
import { useLogSessions } from "@/lib/tables/logSessions";
import { useLogMessages } from "@/lib/tables/logMessages";
import { computeRecap } from "@/lib/log-recap";

export const Route = createFileRoute("/log/$employeeId")({
  head: ({ params }) => ({ meta: [{ title: `Recap — ${params.employeeId} — Pulse HR` }] }),
  component: LogEmployeeRoute,
});

function LogEmployeeRoute() {
  const { employeeId } = Route.useParams();
  const employees = useEmployees();
  const allAsks = useManagerAsks();
  const allSessions = useLogSessions();
  const allMsgs = useLogMessages();
  const employee = employees.find((e) => e.id === employeeId);
  const asks = useMemo(() => allAsks.filter((a) => a.employeeId === employeeId), [allAsks, employeeId]);
  const sessions = useMemo(
    () => allSessions.filter((s) => s.employeeId === employeeId),
    [allSessions, employeeId],
  );
  const msgs = useMemo(() => allMsgs.filter((m) => m.employeeId === employeeId), [allMsgs, employeeId]);
  const recap = useMemo(
    () => computeRecap(employee?.name ?? "Employee", msgs),
    [employee?.name, msgs],
  );
  const health: EmployeeLogHealth | null = employee
    ? {
        employeeId: employee.id,
        score: recap.score,
        trend: recap.trend,
        lastLogAt: recap.lastLogAt,
        lastSentiment: recap.lastSentiment,
        openAsks: asks.filter((a) => a.status === "pending").length,
        recap: recap.summary,
        recapUpdatedAt: recap.recapUpdatedAt,
        sparkline: recap.sparkline,
        recapTopics: recap.topics,
        topicContribution: recap.topicContribution,
        dimensions: recap.dimensions,
        dailyMeans: recap.dailyMeans,
        messageCount: recap.messageCount,
        confidence: recap.confidence,
        managerSummary: recap.managerSummary,
        drivers: recap.drivers,
        suggestedActions: recap.suggestedActions,
      }
    : null;

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
