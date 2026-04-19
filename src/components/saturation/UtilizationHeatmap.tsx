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
    if (pct === 0) return "oklch(0.95 0.01 260)";
    if (pct <= 40) return `oklch(0.85 0.08 155)`;
    if (pct <= 70) return `oklch(0.78 0.12 155)`;
    if (pct <= 100) return `oklch(0.68 0.16 130)`;
    if (pct <= 130) return `oklch(0.7 0.16 70)`;
    return `oklch(0.6 0.2 25)`;
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
                    {cells.map((pct, i) => (
                      <td key={i} className="p-0.5">
                        <button
                          onClick={() => setSelected({ employeeId: emp.id, week: weekList[i] })}
                          className={cn(
                            "h-7 w-10 rounded-sm border border-border/50 flex items-center justify-center text-[9px] font-mono transition hover:scale-110",
                            pct > 100 && "text-white font-semibold",
                          )}
                          style={{ backgroundColor: cellColor(pct) }}
                          title={`${emp.name} · ${weekList[i].toDateString()} · ${pct}%`}
                        >
                          {pct > 0 ? pct : ""}
                        </button>
                      </td>
                    ))}
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
    if (pct === 0) return "oklch(0.95 0.01 260)";
    if (pct <= 40) return `oklch(0.85 0.08 155)`;
    if (pct <= 70) return `oklch(0.78 0.12 155)`;
    if (pct <= 100) return `oklch(0.68 0.16 130)`;
    if (pct <= 130) return `oklch(0.7 0.16 70)`;
    return `oklch(0.6 0.2 25)`;
  };
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
      {items.map((i) => (
        <div key={i.pct} className="flex items-center gap-1">
          <span
            className="h-3 w-4 rounded-sm border border-border/40"
            style={{ backgroundColor: cellColor(i.pct) }}
          />
          {i.label}
        </div>
      ))}
    </div>
  );
}
