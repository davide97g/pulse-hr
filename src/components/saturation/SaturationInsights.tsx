import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  TrendingDown,
  UserX,
  Flame,
  Briefcase,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { commesse, employees, clients, employeeById } from "@/lib/mock-data";
import { projectMargin, personWeeklyLoad, weekRange } from "@/lib/projects";
import { cn } from "@/lib/utils";

type Severity = "critical" | "warning" | "info";

interface Insight {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  action?: { label: string; href: string; params?: Record<string, string> };
  icon: React.ReactNode;
}

const fmtEUR = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function SaturationInsights() {
  const insights = useMemo(() => computeInsights(), []);
  const critical = insights.filter((i) => i.severity === "critical");
  const warnings = insights.filter((i) => i.severity === "warning");
  const info = insights.filter((i) => i.severity === "info");

  if (insights.length === 0) {
    return (
      <Card className="p-10">
        <div className="flex flex-col items-center text-center gap-3">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <div className="font-semibold">Nothing on fire right now</div>
          <div className="text-sm text-muted-foreground max-w-md">
            No projects bleeding margin, no-one flagged as under- or over-utilised, no clients
            slipping.
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <CountCard tone="critical" count={critical.length} label="Critical" icon={<Flame className="h-4 w-4" />} />
        <CountCard tone="warning" count={warnings.length} label="Warnings" icon={<AlertTriangle className="h-4 w-4" />} />
        <CountCard tone="info" count={info.length} label="Heads-up" icon={<TrendingDown className="h-4 w-4" />} />
      </div>
      <div className="space-y-2">
        {[...critical, ...warnings, ...info].map((i) => (
          <InsightRow key={i.id} insight={i} />
        ))}
      </div>
    </div>
  );
}

function CountCard({
  tone,
  count,
  label,
  icon,
}: {
  tone: Severity;
  count: number;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "p-4 flex items-center gap-3",
        tone === "critical" && "border-destructive/40 bg-destructive/5",
        tone === "warning" && "border-warning/40 bg-warning/5",
        tone === "info" && "border-info/40 bg-info/5",
      )}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-md flex items-center justify-center",
          tone === "critical" && "bg-destructive/10 text-destructive",
          tone === "warning" && "bg-warning/10 text-warning",
          tone === "info" && "bg-info/10 text-info",
        )}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-semibold tabular-nums">{count}</div>
        <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</div>
      </div>
    </Card>
  );
}

function InsightRow({ insight }: { insight: Insight }) {
  return (
    <Card
      className={cn(
        "p-4 flex items-center gap-4 transition hover:bg-muted/30",
        insight.severity === "critical" && "border-l-4 border-l-destructive",
        insight.severity === "warning" && "border-l-4 border-l-warning",
        insight.severity === "info" && "border-l-4 border-l-info",
      )}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-md flex items-center justify-center shrink-0",
          insight.severity === "critical" && "bg-destructive/10 text-destructive",
          insight.severity === "warning" && "bg-warning/10 text-warning",
          insight.severity === "info" && "bg-info/10 text-info",
        )}
      >
        {insight.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-sm">{insight.title}</div>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-medium",
              insight.severity === "critical" && "border-destructive/40 text-destructive",
              insight.severity === "warning" && "border-warning/40 text-warning",
              insight.severity === "info" && "border-info/40 text-info",
            )}
          >
            {insight.severity}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{insight.detail}</div>
      </div>
      {insight.action && (
        <Link
          to={insight.action.href as "/projects/$projectId"}
          params={insight.action.params as { projectId: string }}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
        >
          {insight.action.label}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}
    </Card>
  );
}

function computeInsights(): Insight[] {
  const out: Insight[] = [];
  const today = new Date();

  // 1. Projects with negative/low margin
  for (const p of commesse) {
    const m = projectMargin(p, today);
    if (p.defaultBillableRate === 0) continue; // internal, skip margin checks
    if (m.revenue > 0 && m.margin < 0) {
      out.push({
        id: `margin-neg-${p.id}`,
        severity: "critical",
        icon: <TrendingDown className="h-4 w-4" />,
        title: `${p.name} is losing money`,
        detail: `Margin ${fmtEUR.format(m.margin)} on ${fmtEUR.format(m.revenue)} revenue YTD — costs exceed billings. Review rates or staffing mix.`,
        action: { label: "Open project", href: "/projects/$projectId", params: { projectId: p.id } },
      });
    } else if (m.revenue > 0 && m.marginPct < 15) {
      out.push({
        id: `margin-low-${p.id}`,
        severity: "warning",
        icon: <TrendingDown className="h-4 w-4" />,
        title: `${p.name}: margin below 15%`,
        detail: `Current margin ${m.marginPct.toFixed(0)}% (${fmtEUR.format(m.margin)}). Consider reviewing allocation rates.`,
        action: { label: "Review", href: "/projects/$projectId", params: { projectId: p.id } },
      });
    }
  }

  // 2. Budget burn over 100%
  for (const p of commesse) {
    const burnPct = (p.burnedHours / Math.max(1, p.budgetHours)) * 100;
    if (burnPct > 100) {
      out.push({
        id: `burn-${p.id}`,
        severity: "critical",
        icon: <Flame className="h-4 w-4" />,
        title: `${p.name} over budget`,
        detail: `${p.burnedHours}h burned of ${p.budgetHours}h budgeted (${burnPct.toFixed(0)}%). Scope or budget conversation needed.`,
        action: { label: "Open project", href: "/projects/$projectId", params: { projectId: p.id } },
      });
    }
  }

  // 3. At-risk or on-hold projects
  for (const p of commesse) {
    if (p.status === "at_risk") {
      out.push({
        id: `status-risk-${p.id}`,
        severity: "warning",
        icon: <AlertTriangle className="h-4 w-4" />,
        title: `${p.name} flagged at risk`,
        detail: `Status set to at_risk. Owner: ${p.manager}.`,
        action: { label: "Investigate", href: "/projects/$projectId", params: { projectId: p.id } },
      });
    } else if (p.status === "on_hold") {
      out.push({
        id: `status-hold-${p.id}`,
        severity: "info",
        icon: <Briefcase className="h-4 w-4" />,
        title: `${p.name} on hold`,
        detail: `Project paused — allocated team (${p.manager}) may be freeable for other work.`,
        action: { label: "Open project", href: "/projects/$projectId", params: { projectId: p.id } },
      });
    }
  }

  // 4. Under-used people (< 40% weekly load)
  const active = employees.filter((e) => e.status !== "offboarding");
  for (const e of active) {
    const load = personWeeklyLoad(e.id, today);
    if (load === 0) {
      out.push({
        id: `bench-${e.id}`,
        severity: "warning",
        icon: <UserX className="h-4 w-4" />,
        title: `${e.name} is on the bench`,
        detail: `No active allocations this week. Consider staffing to an open project.`,
      });
    } else if (load < 40) {
      out.push({
        id: `under-${e.id}`,
        severity: "info",
        icon: <UserX className="h-4 w-4" />,
        title: `${e.name} under-utilised`,
        detail: `Only ${load}% allocated this week. Capacity available for additional work.`,
      });
    } else if (load > 100) {
      out.push({
        id: `over-${e.id}`,
        severity: "critical",
        icon: <Flame className="h-4 w-4" />,
        title: `${e.name} is overbooked`,
        detail: `${load}% allocation this week — burnout risk. Rebalance commitments.`,
      });
    }
  }

  // 5. Declining utilisation trend (next 12 weeks)
  const weeks = weekRange(today, 12);
  for (const e of active) {
    const loads = weeks.map((w) => personWeeklyLoad(e.id, w));
    const firstHalf = avg(loads.slice(0, 6));
    const secondHalf = avg(loads.slice(6));
    if (firstHalf > 0 && secondHalf < firstHalf - 30) {
      out.push({
        id: `trend-${e.id}`,
        severity: "info",
        icon: <TrendingDown className="h-4 w-4" />,
        title: `${e.name}: load dropping`,
        detail: `Falls from ~${firstHalf.toFixed(0)}% in the next 6 weeks to ~${secondHalf.toFixed(0)}% after. Roll-offs with no follow-up work.`,
      });
    }
  }

  // 6. Clients with low health
  for (const c of clients) {
    if (c.healthScore < 60) {
      out.push({
        id: `health-${c.id}`,
        severity: c.healthScore < 50 ? "critical" : "warning",
        icon: <AlertTriangle className="h-4 w-4" />,
        title: `${c.name} health ${c.healthScore}`,
        detail: `Account health below threshold. Owner ${employeeById(c.accountOwnerId)?.name ?? "—"} should check in.`,
      });
    }
  }

  return out;
}

function avg(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((s, v) => s + v, 0) / xs.length;
}

