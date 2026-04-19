import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Minus, Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeScoreBadge } from "@/components/score/EmployeeScoreBadge";
import { EmployeeHoverCard } from "@/components/score/EmployeeHoverCard";
import { employees, employeeLogHealth, type EmployeeLogHealth } from "@/lib/mock-data";
import { AskTopicDialog } from "./AskTopicDialog";
import { cn } from "@/lib/utils";

export function ManagerLogView() {
  const rows = employees.map((e) => ({
    employee: e,
    health: employeeLogHealth.find((h) => h.employeeId === e.id)!,
  }));
  const [askFor, setAskFor] = useState<string | null>(null);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
      <div className="grid gap-3 stagger-in grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ employee, health }) => (
          <article
            key={employee.id}
            className="group rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-3">
              <EmployeeHoverCard employeeId={employee.id}>
                <div className="shrink-0">
                  <EmployeeScoreBadge employeeId={employee.id} showInfo={false} />
                </div>
              </EmployeeHoverCard>
              <div className="flex-1 min-w-0">
                <Link
                  to="/log/$employeeId"
                  params={{ employeeId: employee.id }}
                  className="font-medium hover:underline truncate block"
                >
                  {employee.name}
                </Link>
                <div className="text-xs text-muted-foreground truncate">{employee.role}</div>
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  <TrendBadge trend={health.trend} />
                  {health.lastLogAt && (
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(health.lastLogAt), { addSuffix: true })}
                    </span>
                  )}
                  {health.openAsks > 0 && (
                    <span className="rounded-full bg-primary/10 text-primary px-1.5 py-0.5">
                      {health.openAsks} open ask{health.openAsks === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/90 line-clamp-2">{health.recap}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Summary only
              </span>
              <Button size="sm" variant="outline" onClick={() => setAskFor(employee.id)}>
                <MessageSquare className="h-3.5 w-3.5 mr-1" /> Ask topic
              </Button>
            </div>
          </article>
        ))}
      </div>
      {askFor && (
        <AskTopicDialog employeeId={askFor} open onOpenChange={(o) => !o && setAskFor(null)} />
      )}
    </div>
  );
}

function TrendBadge({ trend }: { trend: EmployeeLogHealth["trend"] }) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
        trend === "up" && "bg-success/15 text-success",
        trend === "down" && "bg-destructive/15 text-destructive",
        trend === "flat" && "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="h-3 w-3" />
      {trend}
    </span>
  );
}
