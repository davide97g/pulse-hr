import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { billableSplit } from "@/lib/projects";

export function BillableSplitDonut() {
  const split = useMemo(() => billableSplit(), []);
  const data = [
    { name: "Billable", value: split.billable, color: "oklch(0.65 0.16 220)" },
    { name: "Internal", value: split.internal, color: "oklch(0.75 0.08 260)" },
  ];
  const pct = split.total > 0 ? Math.round((split.billable / split.total) * 100) : 0;

  return (
    <Card className="p-5">
      <div className="mb-3">
        <div className="text-sm font-semibold">Billable vs internal</div>
        <div className="text-xs text-muted-foreground">
          Share of tracked hours going to client work.
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--foreground)",
                }}
                itemStyle={{ color: "var(--foreground)" }}
                labelStyle={{ color: "var(--foreground)" }}
                formatter={(v: number) => `${v}h`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 min-w-[140px]">
          <div className="text-3xl font-semibold tabular-nums">{pct}%</div>
          <div className="text-[11px] text-muted-foreground">
            billable of {split.total.toFixed(0)}h
          </div>
          <div className="h-px bg-border" />
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
              <span className="flex-1">{d.name}</span>
              <span className="tabular-nums font-mono">{d.value.toFixed(0)}h</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
