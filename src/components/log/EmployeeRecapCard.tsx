import { Sparkles, Lock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Employee, EmployeeLogHealth, ManagerAsk, LogSession } from "@/lib/mock-data";
import { EmployeeScoreBadge } from "@/components/score/EmployeeScoreBadge";

export function EmployeeRecapCard({
  employee,
  health,
  asks,
  sessions,
}: {
  employee: Employee;
  health: EmployeeLogHealth;
  asks: ManagerAsk[];
  sessions: LogSession[];
}) {
  const pending = asks.filter((a) => a.status === "pending");
  const answered = asks.filter((a) => a.status === "answered");
  const topics = Array.from(new Set(sessions.flatMap((s) => s.topics))).slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="iridescent-border rounded-2xl">
        <div className="rounded-[calc(1rem-1px)] bg-card p-5">
          <div className="flex items-start gap-4">
            <EmployeeScoreBadge employeeId={employee.id} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  AI recap
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  <Lock className="h-3 w-3" /> Summary only — raw log stays with{" "}
                  {employee.name.split(" ")[0]}
                </span>
              </div>
              <p className="mt-2 text-base leading-relaxed">{health.recap}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topics.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border bg-background px-2 py-0.5 text-[11px] uppercase tracking-wide"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {health.lastLogAt && (
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Last log {formatDistanceToNow(new Date(health.lastLogAt), { addSuffix: true })} ·
                  recap refreshed{" "}
                  {formatDistanceToNow(new Date(health.recapUpdatedAt), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold">Pending asks ({pending.length})</h3>
          {pending.length === 0 ? (
            <p className="text-xs text-muted-foreground mt-2">None open.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {pending.map((a) => (
                <li key={a.id} className="text-sm">
                  <div className="font-medium">{a.topic}</div>
                  <div className="text-xs text-muted-foreground">
                    Sent {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    {a.dueAt && ` · due ${format(new Date(a.dueAt), "MMM d")}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold">Answered ({answered.length})</h3>
          {answered.length === 0 ? (
            <p className="text-xs text-muted-foreground mt-2">No answers yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {answered.map((a) => (
                <li key={a.id} className="text-sm">
                  <div className="font-medium">{a.topic}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.answerSummary}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
