import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/app/AppShell";
import { SidePanel } from "@/components/app/SidePanel";
import { employees, allocations, commesse, employeeById } from "@/lib/mock-data";
import { personWeeklyLoad, weekRange } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function UtilizationHeatmap({ startDate, weeks = 12 }: { startDate: Date; weeks?: number }) {
  const [selected, setSelected] = useState<{ employeeId: string; week: Date } | null>(null);
  const weekList = useMemo(() => weekRange(startDate, weeks), [startDate, weeks]);
  const active = employees.filter((e) => e.status !== "offboarding");

  const cellsByEmployee = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const e of active) {
      map.set(
        e.id,
        weekList.map((w) => personWeeklyLoad(e.id, w)),
      );
    }
    return map;
  }, [weekList, active]);

  const cellColor = (pct: number) => {
    if (pct === 0) return null; // renders as muted surface, theme-aware
    if (pct <= 40) return `oklch(0.82 0.1 155)`;
    if (pct <= 70) return `oklch(0.72 0.14 150)`;
    if (pct <= 100) return `oklch(0.62 0.17 135)`;
    if (pct <= 130) return `oklch(0.68 0.18 70)`;
    return `oklch(0.58 0.21 25)`;
  };

  const selectedAllocs = selected
    ? allocations.filter((a) => {
        if (a.employeeId !== selected.employeeId) return false;
        const wStart = selected.week;
        const wEnd = new Date(wStart);
        wEnd.setDate(wEnd.getDate() + 7);
        return !(new Date(a.endDate) < wStart || new Date(a.startDate) >= wEnd);
      })
    : [];

  const selectedEmployee = selected ? employeeById(selected.employeeId) : null;

  return (
    <>
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Utilization heatmap</div>
            <div className="text-xs text-muted-foreground">
              Next {weeks} weeks — click a cell for allocation detail.
            </div>
          </div>
          <HeatmapLegend />
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="text-xs">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium sticky left-0 bg-card z-[1] min-w-[180px]">
                  Person
                </th>
                {weekList.map((w) => (
                  <th
                    key={w.toISOString()}
                    className="px-1 py-2 text-muted-foreground font-medium text-[10px] tabular-nums"
                  >
                    {w.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.map((emp) => {
                const cells = cellsByEmployee.get(emp.id) ?? [];
                return (
                  <tr key={emp.id} className="border-t">
                    <td className="px-3 py-1.5 sticky left-0 bg-card z-[1]">
                      <div className="flex items-center gap-2">
                        <Avatar initials={emp.initials} color={emp.avatarColor} size={22} />
                        <div>
                          <div className="font-medium text-xs">{emp.name}</div>
                          <div className="text-[10px] text-muted-foreground">{emp.department}</div>
                        </div>
                      </div>
                    </td>
                    {cells.map((pct, i) => {
                      const bg = cellColor(pct);
                      const idle = bg === null;
                      const burnout = pct > 130;
                      return (
                        <td key={i} className="p-0.5">
                          <button
                            onClick={() => setSelected({ employeeId: emp.id, week: weekList[i] })}
                            className={cn(
                              "h-7 w-10 rounded-sm border flex items-center justify-center text-[10px] font-mono font-semibold transition hover:scale-110",
                              idle
                                ? "bg-muted/40 border-border/60 text-muted-foreground/50"
                                : burnout
                                  ? "text-white border-black/20"
                                  : "text-black/80 border-black/10",
                            )}
                            style={idle ? undefined : { backgroundColor: bg! }}
                            title={`${emp.name} · ${weekList[i].toDateString()} · ${pct}%`}
                          >
                            {pct > 0 ? pct : ""}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <SidePanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={
          selectedEmployee
            ? `${selectedEmployee.name} — week of ${selected?.week.toDateString().slice(4)}`
            : ""
        }
      >
        <div className="p-5 space-y-3">
          {selectedAllocs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No active allocations in this week.</div>
          ) : (
            selectedAllocs.map((a) => {
              const p = commesse.find((x) => x.id === a.projectId);
              return (
                <div key={a.id} className="flex items-center gap-3 text-sm border rounded-md p-3">
                  <div
                    className="h-10 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: p?.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{p?.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {a.type} · {a.startDate} → {a.endDate}
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">{a.percent}%</div>
                </div>
              );
            })
          )}
          {selectedAllocs.length > 0 && (
            <div className="pt-3 border-t text-sm flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold tabular-nums">
                {selectedAllocs.reduce((s, a) => s + a.percent, 0)}%
              </span>
            </div>
          )}
        </div>
      </SidePanel>
    </>
  );
}

function HeatmapLegend() {
  const items = [
    { pct: 0, label: "idle" },
    { pct: 40, label: "light" },
    { pct: 70, label: "healthy" },
    { pct: 100, label: "full" },
    { pct: 130, label: "over" },
    { pct: 150, label: "burnout" },
  ];
  const cellColor = (pct: number) => {
    if (pct === 0) return null; // renders as muted surface, theme-aware
    if (pct <= 40) return `oklch(0.82 0.1 155)`;
    if (pct <= 70) return `oklch(0.72 0.14 150)`;
    if (pct <= 100) return `oklch(0.62 0.17 135)`;
    if (pct <= 130) return `oklch(0.68 0.18 70)`;
    return `oklch(0.58 0.21 25)`;
  };
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
      {items.map((i) => {
        const bg = cellColor(i.pct);
        return (
          <div key={i.pct} className="flex items-center gap-1">
            <span
              className={cn(
                "h-3 w-4 rounded-sm border",
                bg ? "border-black/10" : "bg-muted/40 border-border/60",
              )}
              style={bg ? { backgroundColor: bg } : undefined}
            />
            {i.label}
          </div>
        );
      })}
    </div>
  );
}
