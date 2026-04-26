import { Sparkles, Lock, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Employee, EmployeeLogHealth, ManagerAsk, LogSession } from "@/lib/mock-data";
import { EmployeeScoreBadge } from "@/components/score/EmployeeScoreBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@pulse-hr/ui/primitives/tooltip";
import { SentimentRadar } from "./SentimentRadar";
import { cn } from "@/lib/utils";

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
  const sessionTopics = Array.from(new Set(sessions.flatMap((s) => s.topics))).slice(0, 6);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        <div className="iridescent-border rounded-2xl">
          <div className="rounded-[calc(1rem-1px)] bg-card p-5">
            <div className="flex items-start gap-4">
              <EmployeeScoreBadge employeeId={employee.id} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    AI recap
                  </span>
                  <TrendBadge trend={health.trend} />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground cursor-help">
                        <Lock className="h-3 w-3" /> Summary only — raw log stays with{" "}
                        {employee.name.split(" ")[0]}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Managers only see AI summaries. Raw conversations stay with the employee.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="mt-2 text-base leading-relaxed">{health.recap}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(health.recapTopics.length > 0
                    ? health.recapTopics.map((t) => `${t.topic} · ${t.count}`)
                    : sessionTopics
                  ).map((label) => (
                    <span
                      key={label}
                      className="rounded-full border bg-background px-2 py-0.5 text-[11px] uppercase tracking-wide"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                {health.lastLogAt && (
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Last log {formatDistanceToNow(new Date(health.lastLogAt), { addSuffix: true })}{" "}
                    · recap refreshed{" "}
                    {formatDistanceToNow(new Date(health.recapUpdatedAt), { addSuffix: true })} ·
                    based on {health.messageCount} signal{health.messageCount === 1 ? "" : "s"}
                  </p>
                )}
              </div>
              <div className="hidden md:block w-44 shrink-0">
                <SentimentRadar values={health.dimensions} />
              </div>
            </div>
          </div>
        </div>

        <DimensionsGrid dimensions={health.dimensions} />

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
    </TooltipProvider>
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

function DimensionsGrid({
  dimensions,
}: {
  dimensions: EmployeeLogHealth["dimensions"];
}) {
  const items: { key: keyof EmployeeLogHealth["dimensions"]; label: string; invert?: boolean }[] = [
    { key: "energy", label: "Energy" },
    { key: "engagement", label: "Engagement" },
    { key: "alignment", label: "Alignment" },
    { key: "stress", label: "Stress", invert: true },
  ];
  return (
    <section className="grid gap-2 grid-cols-2 md:grid-cols-4">
      {items.map((it) => {
        const v = dimensions[it.key];
        const display = it.invert ? -v : v;
        return (
          <div key={it.key} className="rounded-xl border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {it.label}
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span
                className={cn(
                  "font-display text-2xl",
                  display > 0.15 && "text-success",
                  display < -0.15 && "text-destructive",
                )}
              >
                {display > 0 ? "+" : ""}
                {display.toFixed(2)}
              </span>
            </div>
            <Bar value={display} />
          </div>
        );
      })}
    </section>
  );
}

function Bar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, ((value + 1) / 2) * 100));
  return (
    <div className="relative mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
      <div className="absolute inset-y-0 left-1/2 w-px bg-foreground/20" />
      <div
        className={cn(
          "absolute inset-y-0",
          value >= 0 ? "left-1/2 bg-success" : "right-1/2 bg-destructive",
        )}
        style={{
          width: `${Math.abs(pct - 50)}%`,
        }}
      />
    </div>
  );
}
