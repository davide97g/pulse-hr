import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/app/AppShell";
import { employees } from "@/lib/mock-data";
import { personWeeklyLoad, weekRange } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function UtilizationTrendChart({
  startDate,
  weeks = 12,
  hoveredEmployeeId,
  onHoverEmployee,
}: {
  startDate: Date;
  weeks?: number;
  hoveredEmployeeId: string | null;
  onHoverEmployee: (id: string | null) => void;
}) {
  const active = useMemo(() => employees.filter((e) => e.status !== "offboarding"), []);
  const weekList = useMemo(() => weekRange(startDate, weeks), [startDate, weeks]);

  // Row per week: { date, e1: 60, e2: 100, ... }
  const data = useMemo(() => {
    return weekList.map((w) => {
      const row: Record<string, number | string> = {
        date: w.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      };
      for (const e of active) row[e.id] = personWeeklyLoad(e.id, w);
      return row;
    });
  }, [weekList, active]);

  const someHovered = !!hoveredEmployeeId;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold">Utilization over time</div>
          <div className="text-xs text-muted-foreground">
            Weekly allocation % per person — hover a line or a name to isolate.
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_180px] gap-4">
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 16, bottom: 4, left: -8 }}
              onMouseLeave={() => onHoverEmployee(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="var(--muted-foreground)"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `${v}%`}
                domain={[0, (max: number) => Math.max(120, Math.ceil(max / 20) * 20)]}
              />
              <ReferenceLine
                y={100}
                stroke="var(--warning)"
                strokeDasharray="3 3"
                strokeOpacity={0.6}
                label={{ value: "100%", fill: "var(--warning)", fontSize: 10, position: "right" }}
              />
              <Tooltip
                cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number, name: string) => {
                  const emp = active.find((e) => e.id === name);
                  return [`${v}%`, emp?.name ?? name];
                }}
                labelFormatter={(l) => `Week of ${l}`}
              />
              {active.map((e) => {
                const isHovered = hoveredEmployeeId === e.id;
                const dimmed = someHovered && !isHovered;
                return (
                  <Line
                    key={e.id}
                    type="monotone"
                    dataKey={e.id}
                    stroke={e.avatarColor}
                    strokeWidth={isHovered ? 3 : 1.75}
                    strokeOpacity={dimmed ? 0.12 : 0.95}
                    dot={isHovered ? { r: 3.5, fill: e.avatarColor, strokeWidth: 0 } : false}
                    activeDot={{
                      r: 5,
                      fill: e.avatarColor,
                      stroke: "var(--card)",
                      strokeWidth: 2,
                      onMouseEnter: () => onHoverEmployee(e.id),
                    }}
                    isAnimationActive={false}
                    onMouseEnter={() => onHoverEmployee(e.id)}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend list */}
        <div className="space-y-1 max-h-[320px] overflow-y-auto scrollbar-thin pr-1">
          {active.map((e) => {
            const isHovered = hoveredEmployeeId === e.id;
            const dimmed = someHovered && !isHovered;
            return (
              <button
                key={e.id}
                type="button"
                onMouseEnter={() => onHoverEmployee(e.id)}
                onMouseLeave={() => onHoverEmployee(null)}
                onFocus={() => onHoverEmployee(e.id)}
                onBlur={() => onHoverEmployee(null)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition text-xs",
                  isHovered && "bg-muted",
                  dimmed ? "opacity-40" : "opacity-100",
                  "hover:bg-muted/60",
                )}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: e.avatarColor }}
                />
                <Avatar initials={e.initials} color={e.avatarColor} size={18} />
                <span className="truncate flex-1 font-medium">{e.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
