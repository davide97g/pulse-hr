import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type GanttBar = {
  id: string;
  start: string; // ISO YYYY-MM-DD
  end: string; // ISO YYYY-MM-DD
  label: string;
  subtitle?: string;
  color: string;
  progress?: number; // 0–1 overlay
  onClick?: () => void;
  tone?: "solid" | "soft";
};

export type GanttRow = {
  id: string;
  label: React.ReactNode;
  sublabel?: React.ReactNode;
  bars: GanttBar[];
};

export type GanttDependency = { from: string; to: string };

export function Gantt({
  rows,
  rangeStart,
  rangeEnd,
  unit = "week",
  className,
  dependencies = [],
  labelWidth = 200,
  today = new Date(),
  emptyMessage = "Nothing to schedule yet.",
}: {
  rows: GanttRow[];
  rangeStart: string;
  rangeEnd: string;
  unit?: "day" | "week" | "month";
  className?: string;
  dependencies?: GanttDependency[];
  labelWidth?: number;
  today?: Date;
  emptyMessage?: string;
}) {
  const { days, headers } = useMemo(
    () => buildAxis(rangeStart, rangeEnd, unit),
    [rangeStart, rangeEnd, unit],
  );
  const startTs = new Date(rangeStart).getTime();
  const totalMs = new Date(rangeEnd).getTime() - startTs;
  const rowHeight = 64;
  const columnWidth = unit === "day" ? 36 : unit === "week" ? 60 : 110;
  const totalWidth = columnWidth * headers.length;

  const pctFor = (iso: string) => {
    const t = new Date(iso).getTime();
    return Math.max(0, Math.min(1, (t - startTs) / totalMs));
  };

  const todayPct = pctFor(today.toISOString().slice(0, 10));

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      <div className="overflow-x-auto scrollbar-thin">
        <div style={{ width: labelWidth + totalWidth }}>
          {/* Header */}
          <div className="flex text-xs border-b sticky top-0 bg-card/95 backdrop-blur z-[1]">
            <div
              className="shrink-0 font-medium text-muted-foreground px-4 py-2 border-r"
              style={{ width: labelWidth }}
            >
              Timeline · {unit}
            </div>
            <div className="flex" style={{ width: totalWidth }}>
              {headers.map((h) => (
                <div
                  key={h.key}
                  className="border-r px-2 py-2 text-muted-foreground"
                  style={{ width: columnWidth }}
                >
                  <div className="font-medium text-[11px] text-foreground">{h.primary}</div>
                  <div className="text-[10px]">{h.secondary}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="relative">
            {/* Today line */}
            {todayPct > 0 && todayPct < 1 && (
              <div
                className="absolute top-0 bottom-0 w-px bg-destructive/60 pointer-events-none z-[2]"
                style={{ left: labelWidth + totalWidth * todayPct }}
              >
                <div className="absolute -top-2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] px-1 rounded-sm">
                  TODAY
                </div>
              </div>
            )}

            {rows.map((row, idx) => (
              <div
                key={row.id}
                className={cn("flex items-center", idx !== rows.length - 1 && "border-b")}
                style={{ height: rowHeight }}
              >
                <div className="shrink-0 px-4 py-2 border-r truncate" style={{ width: labelWidth }}>
                  <div className="text-sm font-medium truncate">{row.label}</div>
                  {row.sublabel && (
                    <div className="text-[11px] text-muted-foreground truncate">{row.sublabel}</div>
                  )}
                </div>
                <div className="relative h-full" style={{ width: totalWidth }}>
                  {/* Column dividers */}
                  {headers.map((h, i) => (
                    <div
                      key={h.key}
                      className="absolute top-0 bottom-0 border-r border-border/50 pointer-events-none"
                      style={{ left: columnWidth * (i + 1) }}
                    />
                  ))}
                  {row.bars.map((bar) => {
                    const left = pctFor(bar.start) * totalWidth;
                    const right = pctFor(bar.end) * totalWidth;
                    const width = Math.max(6, right - left);
                    const soft = bar.tone === "soft";
                    return (
                      <div
                        key={bar.id}
                        className="group absolute top-1/2 -translate-y-1/2"
                        style={{ left, width, height: rowHeight - 16 }}
                      >
                        <button
                          type="button"
                          onClick={bar.onClick}
                          className={cn(
                            "w-full h-full rounded-md text-[11px] px-2 py-1.5 text-left border transition press-scale overflow-hidden",
                            bar.onClick && "hover:brightness-110 cursor-pointer",
                          )}
                          style={{
                            backgroundColor: soft
                              ? `color-mix(in oklch, ${bar.color} 18%, transparent)`
                              : bar.color,
                            borderColor: soft
                              ? `color-mix(in oklch, ${bar.color} 35%, transparent)`
                              : bar.color,
                            color: soft ? undefined : "white",
                          }}
                        >
                          <div className="truncate font-medium leading-tight">{bar.label}</div>
                          {bar.subtitle && (
                            <div className="truncate opacity-85 text-[10px] leading-tight mt-0.5">
                              {bar.subtitle}
                            </div>
                          )}
                          {typeof bar.progress === "number" && (
                            <div
                              className="absolute bottom-0 left-0 h-1 rounded-b"
                              style={{
                                width: `${bar.progress * 100}%`,
                                backgroundColor: "rgba(255,255,255,0.55)",
                              }}
                            />
                          )}
                        </button>
                        {/* Rich hover card — full data, no truncation */}
                        <div className="pointer-events-none absolute left-0 bottom-full mb-2 min-w-[220px] max-w-[320px] rounded-md border bg-popover text-popover-foreground shadow-pop px-3 py-2 text-xs opacity-0 translate-y-1 transition group-hover:opacity-100 group-hover:translate-y-0 z-[3]">
                          <div className="font-semibold mb-0.5 break-words">{bar.label}</div>
                          {bar.subtitle && (
                            <div className="text-muted-foreground mb-1 break-words">
                              {bar.subtitle}
                            </div>
                          )}
                          <div className="font-mono tabular-nums text-[11px] text-muted-foreground">
                            {bar.start} → {bar.end}
                          </div>
                          {typeof bar.progress === "number" && (
                            <div className="mt-1 text-[11px] tabular-nums">
                              Progress: {Math.round(bar.progress * 100)}%
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Dependency arrows (simple straight connectors) */}
            {dependencies.length > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none"
                width="100%"
                height="100%"
                style={{ left: labelWidth, width: totalWidth, top: 0 }}
              >
                {dependencies.map((dep) => {
                  const fromPos = findBarPosition(rows, dep.from, pctFor, totalWidth, rowHeight);
                  const toPos = findBarPosition(rows, dep.to, pctFor, totalWidth, rowHeight);
                  if (!fromPos || !toPos) return null;
                  const midX = (fromPos.endX + toPos.startX) / 2;
                  return (
                    <g
                      key={`${dep.from}-${dep.to}`}
                      stroke="var(--muted-foreground)"
                      strokeWidth="1.25"
                      fill="none"
                      opacity="0.55"
                    >
                      <path
                        d={`M ${fromPos.endX} ${fromPos.y} H ${midX} V ${toPos.y} H ${toPos.startX}`}
                      />
                      <circle
                        cx={toPos.startX}
                        cy={toPos.y}
                        r={2.5}
                        fill="var(--muted-foreground)"
                      />
                    </g>
                  );
                })}
              </svg>
            )}

            {void days}
          </div>
        </div>
      </div>
    </div>
  );
}

function findBarPosition(
  rows: GanttRow[],
  barId: string,
  pctFor: (iso: string) => number,
  totalWidth: number,
  rowHeight: number,
) {
  for (let i = 0; i < rows.length; i++) {
    const bar = rows[i].bars.find((b) => b.id === barId);
    if (bar) {
      return {
        startX: pctFor(bar.start) * totalWidth,
        endX: pctFor(bar.end) * totalWidth,
        y: i * rowHeight + rowHeight / 2,
      };
    }
  }
  return null;
}

function buildAxis(start: string, end: string, unit: "day" | "week" | "month") {
  const s = new Date(start);
  const e = new Date(end);
  const days: Date[] = [];
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  if (unit === "day") {
    return {
      days,
      headers: days.map((d) => ({
        key: d.toISOString().slice(0, 10),
        primary: String(d.getDate()),
        secondary: d.toLocaleDateString(undefined, { month: "short" }),
      })),
    };
  }
  if (unit === "week") {
    const weeks: Date[] = [];
    const cursor = new Date(s);
    cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7)); // Monday
    while (cursor <= e) {
      weeks.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }
    return {
      days,
      headers: weeks.map((w) => ({
        key: w.toISOString().slice(0, 10),
        primary: `W${isoWeek(w)}`,
        secondary: w.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      })),
    };
  }
  // month
  const months: Date[] = [];
  const cursor = new Date(s.getFullYear(), s.getMonth(), 1);
  while (cursor <= e) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return {
    days,
    headers: months.map((m) => ({
      key: m.toISOString().slice(0, 7),
      primary: m.toLocaleDateString(undefined, { month: "short" }),
      secondary: String(m.getFullYear()),
    })),
  };
}

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
}
