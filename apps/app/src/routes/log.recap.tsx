import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Lock,
  Minus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/app/AppShell";
import { useTheme } from "@pulse-hr/ui/theme";
import {
  employees,
  employeeLogHealth,
  type Employee,
  type EmployeeLogHealth,
} from "@/lib/mock-data";
import { SentimentRadar } from "@/components/log/SentimentRadar";
import { SentimentHeatmap } from "@/components/log/SentimentHeatmap";
import { EmployeeScoreBadge } from "@/components/score/EmployeeScoreBadge";
import { Button } from "@pulse-hr/ui/primitives/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@pulse-hr/ui/primitives/tooltip";
import { cn } from "@/lib/utils";

const ME_ID = employees[0].id;

export const Route = createFileRoute("/log/recap")({
  head: () => ({ meta: [{ title: "Sentiment recap — Pulse HR" }] }),
  component: LogRecapRoute,
});

function LogRecapRoute() {
  const { theme } = useTheme();
  const isManager = theme === "manager" || theme === "hr" || theme === "admin";
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const me = employees.find((e) => e.id === ME_ID);
  const myHealth = employeeLogHealth.find((h) => h.employeeId === ME_ID);

  const reports = useMemo(
    () =>
      employees
        .filter((e) => e.id !== ME_ID)
        .map((e) => ({
          employee: e,
          health: employeeLogHealth.find((h) => h.employeeId === e.id)!,
        }))
        .filter((r) => r.health),
    [],
  );

  if (!me || !myHealth) {
    return <div className="p-6 text-muted-foreground">No recap data.</div>;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <PageHeader
            title={
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Sentiment recap
              </span>
            }
            description={
              isManager
                ? "Your own recap and a fast scan across your team."
                : "Your private recap, computed from your own check-ins."
            }
          />
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/log">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to chat
              </Link>
            </Button>
          </div>
        </div>

        {!ready ? (
          <div className="space-y-3">
            <div className="h-40 rounded-xl bg-muted animate-pulse" />
            <div className="h-32 rounded-xl bg-muted animate-pulse" />
          </div>
        ) : (
          <>
            <SelfRecapSection employee={me} health={myHealth} />

            {isManager && (
              <ManagerSection
                rows={reports}
                myRow={{ employee: me, health: myHealth }}
              />
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

function SelfRecapSection({
  employee,
  health,
}: {
  employee: Employee;
  health: EmployeeLogHealth;
}) {
  const messageCount = health.messageCount;
  return (
    <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="iridescent-border rounded-2xl">
        <div className="rounded-[calc(1rem-1px)] bg-card p-5">
          <div className="flex items-start gap-4">
            <EmployeeScoreBadge employeeId={employee.id} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Your recap
                </span>
                <TrendBadge trend={health.trend} />
              </div>
              <p className="mt-2 text-base leading-relaxed">{health.recap}</p>
              {health.recapTopics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {health.recapTopics.map((t) => (
                    <span
                      key={t.topic}
                      className="rounded-full border bg-background px-2 py-0.5 text-[11px] uppercase tracking-wide"
                    >
                      {t.topic} · {t.count}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[11px] text-muted-foreground">
                Recap refreshed{" "}
                {formatDistanceToNow(new Date(health.recapUpdatedAt), { addSuffix: true })} · based
                on {messageCount} signal{messageCount === 1 ? "" : "s"}
                {health.lastLogAt && (
                  <>
                    {" "}· last log{" "}
                    {formatDistanceToNow(new Date(health.lastLogAt), { addSuffix: true })}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2 grid-cols-2 md:grid-cols-4">
            <DimTile label="Energy" value={health.dimensions.energy} />
            <DimTile label="Engagement" value={health.dimensions.engagement} />
            <DimTile label="Alignment" value={health.dimensions.alignment} />
            <DimTile label="Stress" value={health.dimensions.stress} invert />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          How you've been
        </div>
        <SentimentRadar values={health.dimensions} />
        <Sparkline values={health.sparkline} />
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <KpiTiny label="Score" value={`${health.score}`} />
          <KpiTiny
            label="Trend"
            value={health.trend === "up" ? "↑" : health.trend === "down" ? "↓" : "→"}
          />
          <KpiTiny label="Logs 14d" value={`${countActiveDays(health)}`} />
        </div>
      </div>

      <div className="lg:col-span-2">
        <SentimentHeatmap rows={[{ employee, health }]} />
      </div>
    </section>
  );
}

function ManagerSection({
  rows,
  myRow,
}: {
  rows: { employee: Employee; health: EmployeeLogHealth }[];
  myRow: { employee: Employee; health: EmployeeLogHealth };
}) {
  const allRows = [myRow, ...rows];
  const teamAvg = avg(rows.map((r) => r.health.score));
  const positive = rows.filter((r) => r.health.dimensions.overall > 0.1).length;
  const atRisk = rows.filter(
    (r) => r.health.trend === "down" || r.health.dimensions.stress > 0.4,
  ).length;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm uppercase tracking-wide text-muted-foreground">
          Reports — sentiment
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground cursor-help">
              <Lock className="h-3 w-3" /> Summary only — raw chats stay with employees
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Managers see scores, trends, and one-line summaries. The raw conversation never
            leaves the employee.
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KpiBig
          icon={<TrendingUp className="h-4 w-4" />}
          label="Team avg score"
          value={`${Math.round(teamAvg)}`}
          sub={`${rows.length} report${rows.length === 1 ? "" : "s"}`}
        />
        <KpiBig
          icon={<ArrowUpRight className="h-4 w-4 text-success" />}
          label="Positive now"
          value={`${positive}`}
          sub="reports overall > +0.10"
        />
        <KpiBig
          icon={<ArrowDownRight className="h-4 w-4 text-destructive" />}
          label="At risk"
          value={`${atRisk}`}
          sub="trending down or strained"
        />
        <KpiBig
          icon={<Sparkles className="h-4 w-4 text-primary" />}
          label="Signals tracked"
          value={`${rows.reduce((s, r) => s + r.health.messageCount, 0)}`}
          sub="across last 28 days"
        />
      </div>

      <SentimentHeatmap rows={allRows} />

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 stagger-in">
        {rows.map(({ employee, health }) => (
          <Link
            key={employee.id}
            to="/log/$employeeId"
            params={{ employeeId: employee.id }}
            className="group rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-3">
              <EmployeeScoreBadge employeeId={employee.id} showInfo={false} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate group-hover:underline">{employee.name}</div>
                <div className="text-xs text-muted-foreground truncate">{employee.role}</div>
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  <TrendBadge trend={health.trend} />
                  {health.lastLogAt && (
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(health.lastLogAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 w-16">
                <SentimentRadar values={health.dimensions} size={68} showLabels={false} />
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/90 line-clamp-2">{health.recap}</p>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              <MiniDim label="EN" value={health.dimensions.energy} />
              <MiniDim label="EG" value={health.dimensions.engagement} />
              <MiniDim label="AL" value={health.dimensions.alignment} />
              <MiniDim label="ST" value={health.dimensions.stress} invert />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DimTile({
  label,
  value,
  invert,
}: {
  label: string;
  value: number;
  invert?: boolean;
}) {
  const display = invert ? -value : value;
  return (
    <div className="rounded-xl border bg-background/60 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 font-display text-2xl",
          display > 0.15 && "text-success",
          display < -0.15 && "text-destructive",
        )}
      >
        {display > 0 ? "+" : ""}
        {display.toFixed(2)}
      </div>
      <Bar value={display} />
    </div>
  );
}

function MiniDim({
  label,
  value,
  invert,
}: {
  label: string;
  value: number;
  invert?: boolean;
}) {
  const display = invert ? -value : value;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "rounded-md border px-1.5 py-0.5 text-center cursor-help",
            display > 0.15 && "border-success/40 text-success",
            display < -0.15 && "border-destructive/40 text-destructive",
          )}
        >
          <div className="text-[9px] uppercase tracking-wide opacity-70">{label}</div>
          <div className="text-[11px] tabular-nums">{display.toFixed(1)}</div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {label === "EN"
          ? "Energy"
          : label === "EG"
            ? "Engagement"
            : label === "AL"
              ? "Alignment"
              : "Stress (inverted)"}
        : {display.toFixed(2)}
      </TooltipContent>
    </Tooltip>
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
        style={{ width: `${Math.abs(pct - 50)}%` }}
      />
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

function KpiBig({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <article className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-display text-3xl">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </article>
  );
}

function KpiTiny({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/40 px-2 py-1">
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display text-lg leading-none mt-0.5">{value}</div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const w = 260;
  const h = 44;
  const pad = 3;
  const xs = values.map((_, i) => pad + (i * (w - pad * 2)) / (values.length - 1));
  const ys = values.map((v) => h / 2 - v * (h / 2 - pad));
  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`)
    .join(" ");
  return (
    <div className="mt-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
        14d sentiment
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-11">
        <line
          x1={0}
          y1={h / 2}
          x2={w}
          y2={h / 2}
          stroke="currentColor"
          strokeOpacity={0.15}
          className="text-muted-foreground"
        />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary"
        />
      </svg>
      <div className="mt-1 flex justify-between text-[9px] text-muted-foreground tabular-nums">
        <span>{format(new Date(Date.now() - 13 * 86400000), "MMM d")}</span>
        <span>today</span>
      </div>
    </div>
  );
}

function avg(xs: number[]): number {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
}

function countActiveDays(h: EmployeeLogHealth): number {
  return h.dailyMeans.filter((d) => d.count > 0).length;
}

