import { ArrowDownRight, ArrowUpRight, MessageCircle, ShieldAlert, Smile } from "lucide-react";
import type { EmployeeLogHealth } from "@/lib/mock-data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@pulse-hr/ui/primitives/tooltip";
import { cn } from "@/lib/utils";

export interface TeamPulseStripProps {
  health: EmployeeLogHealth[];
  openAsks: number;
}

export function TeamPulseStrip({ health, openAsks }: TeamPulseStripProps) {
  const avgScore = avg(health.map((h) => h.score));
  const positive7d = pctPositiveLast7Days(health);
  const atRisk = health.filter(
    (h) => h.trend === "down" || h.score < 55 || h.dimensions.stress > 0.4,
  ).length;
  const trending =
    avgScore > 70 ? ("up" as const) : avgScore < 55 ? ("down" as const) : ("flat" as const);

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      <Tile
        icon={<Smile className="h-4 w-4" />}
        label="Avg team score"
        value={`${Math.round(avgScore)}`}
        accent="from-primary/15 to-primary/0"
        sub={
          <span className="inline-flex items-center gap-1 text-[11px]">
            {trending === "up" && (
              <span className="text-success inline-flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" /> trending up
              </span>
            )}
            {trending === "down" && (
              <span className="text-destructive inline-flex items-center gap-0.5">
                <ArrowDownRight className="h-3 w-3" /> trending down
              </span>
            )}
            {trending === "flat" && <span className="text-muted-foreground">steady</span>}
          </span>
        }
        tooltip="Average of all team members' computed health scores (0–100)."
      />
      <Tile
        icon={<Smile className="h-4 w-4" />}
        label="Positive last 7d"
        value={`${Math.round(positive7d * 100)}%`}
        accent="from-emerald-500/15 to-emerald-500/0"
        sub="of daily check-ins"
        tooltip="Share of days in the last 7 days where team mean overall sentiment was positive."
      />
      <Tile
        icon={<MessageCircle className="h-4 w-4" />}
        label="Open asks"
        value={`${openAsks}`}
        accent="from-sky-500/15 to-sky-500/0"
        sub={openAsks === 0 ? "all clear" : "awaiting answer"}
        tooltip="Manager-initiated topics still pending an answer."
      />
      <Tile
        icon={<ShieldAlert className="h-4 w-4" />}
        label="At risk"
        value={`${atRisk}`}
        accent="from-rose-500/15 to-rose-500/0"
        sub={atRisk === 0 ? "no flags" : "downward or strained"}
        tooltip="Reports trending down, scoring under 55, or showing high stress signals."
      />
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  sub,
  accent,
  tooltip,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
  accent: string;
  tooltip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <article
          className={cn(
            "relative overflow-hidden rounded-xl border bg-card p-4 cursor-help",
          )}
        >
          <span
            aria-hidden
            className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", accent)}
          />
          <div className="relative flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            {icon}
            {label}
          </div>
          <div className="relative mt-2 font-display text-3xl">{value}</div>
          {sub && <div className="relative mt-1 text-xs text-muted-foreground">{sub}</div>}
        </article>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function avg(xs: number[]): number {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
}

function pctPositiveLast7Days(health: EmployeeLogHealth[]): number {
  if (health.length === 0) return 0;
  const days = 7;
  const allDaily: number[] = [];
  for (const h of health) {
    const last = h.dailyMeans.slice(-days);
    for (const d of last) {
      if (d.count > 0) allDaily.push(d.overall);
    }
  }
  if (allDaily.length === 0) return 0;
  const positive = allDaily.filter((v) => v > 0.1).length;
  return positive / allDaily.length;
}
