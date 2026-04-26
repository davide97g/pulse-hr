import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import type { Employee, EmployeeLogHealth } from "@/lib/mock-data";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@pulse-hr/ui/primitives/tooltip";
import { cn } from "@/lib/utils";

export interface SentimentHeatmapProps {
  rows: { employee: Employee; health: EmployeeLogHealth }[];
}

export function SentimentHeatmap({ rows }: SentimentHeatmapProps) {
  const days = rows[0]?.health.dailyMeans ?? [];
  return (
    <section className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">14-day sentiment heatmap</h3>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Legend />
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <div
          className="grid items-center gap-y-1"
          style={{
            gridTemplateColumns: `minmax(140px, 180px) repeat(${days.length}, minmax(16px, 1fr))`,
          }}
        >
          <div />
          {days.map((d) => (
            <div
              key={d.date}
              className="text-[9px] text-center text-muted-foreground tabular-nums"
              title={d.date}
            >
              {format(new Date(d.date), "d")}
            </div>
          ))}
          {rows.map(({ employee, health }) => (
            <RowCells key={employee.id} employee={employee} health={health} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RowCells({ employee, health }: { employee: Employee; health: EmployeeLogHealth }) {
  return (
    <>
      <Link
        to="/log/$employeeId"
        params={{ employeeId: employee.id }}
        className="text-xs truncate hover:underline pr-2"
        title={employee.name}
      >
        {employee.name}
      </Link>
      {health.dailyMeans.map((d) => (
        <Tooltip key={d.date}>
          <TooltipTrigger asChild>
            <Link
              to="/log/$employeeId"
              params={{ employeeId: employee.id }}
              className="block h-5 mx-px rounded-sm transition hover:ring-1 hover:ring-primary/60"
              style={{ background: cellColor(d.overall, d.count) }}
              aria-label={`${employee.name} on ${d.date}: ${d.count} signals, overall ${d.overall.toFixed(2)}`}
            />
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-[11px]">
              <div className="font-medium">{format(new Date(d.date), "EEE, MMM d")}</div>
              <div className="text-muted-foreground">
                {d.count === 0 ? "no signal" : `${d.count} signal${d.count === 1 ? "" : "s"}`}
              </div>
              {d.count > 0 && (
                <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
                  <span>Overall</span>
                  <span className={cn("text-right tabular-nums", num(d.overall))}>
                    {d.overall.toFixed(2)}
                  </span>
                  <span>Energy</span>
                  <span className={cn("text-right tabular-nums", num(d.energy))}>
                    {d.energy.toFixed(2)}
                  </span>
                  <span>Stress</span>
                  <span className={cn("text-right tabular-nums", num(-d.stress))}>
                    {d.stress.toFixed(2)}
                  </span>
                  <span>Engagement</span>
                  <span className={cn("text-right tabular-nums", num(d.engagement))}>
                    {d.engagement.toFixed(2)}
                  </span>
                  <span>Alignment</span>
                  <span className={cn("text-right tabular-nums", num(d.alignment))}>
                    {d.alignment.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      ))}
    </>
  );
}

function num(v: number): string {
  if (v > 0.15) return "text-success";
  if (v < -0.15) return "text-destructive";
  return "text-muted-foreground";
}

function cellColor(overall: number, count: number): string {
  if (count === 0) return "color-mix(in oklch, var(--muted) 60%, transparent)";
  if (overall > 0.05) {
    const a = Math.min(1, 0.25 + overall * 0.75);
    return `color-mix(in oklch, var(--success, oklch(0.7 0.18 145)) ${Math.round(a * 100)}%, transparent)`;
  }
  if (overall < -0.05) {
    const a = Math.min(1, 0.25 + Math.abs(overall) * 0.75);
    return `color-mix(in oklch, var(--destructive) ${Math.round(a * 100)}%, transparent)`;
  }
  return "color-mix(in oklch, var(--muted-foreground) 25%, transparent)";
}

function Legend() {
  return (
    <span className="inline-flex items-center gap-1">
      <span>low</span>
      <span className="inline-flex h-2 w-3 rounded-sm bg-destructive/70" />
      <span className="inline-flex h-2 w-3 rounded-sm bg-muted-foreground/30" />
      <span
        className="inline-flex h-2 w-3 rounded-sm"
        style={{ background: "color-mix(in oklch, var(--success, oklch(0.7 0.18 145)) 70%, transparent)" }}
      />
      <span>high</span>
    </span>
  );
}
