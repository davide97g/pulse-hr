import { useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ZAxis,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card } from "@pulse-hr/ui/primitives/card";
import { personValue } from "@/lib/projects";
const fmt = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000) return `€${(n / 1_000).toFixed(0)}k`;
  return `€${n.toFixed(0)}`;
};

export function CostValueScatter() {
  const data = useMemo(
    () =>
      personValue()
        .filter((p) => p.hours > 0)
        .map((p) => ({
          name: p.name,
          cost: Math.round(p.cost),
          revenue: Math.round(p.revenue),
          hours: Math.round(p.hours),
        })),
    [],
  );

  const medianCost = median(data.map((d) => d.cost));
  const medianRev = median(data.map((d) => d.revenue));

  // Quadrant-driven color: high revenue + low cost → primary (leverage);
  // high cost + low revenue → destructive (watch); rest → muted.
  const dotFill = (d: (typeof data)[number]) => {
    if (d.revenue >= medianRev && d.cost <= medianCost) return "var(--primary)";
    if (d.revenue < medianRev && d.cost > medianCost) return "var(--destructive)";
    return "var(--chart-muted)";
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold">Cost vs value</div>
          <div className="text-xs text-muted-foreground">
            Each dot is a person — size = hours delivered.
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>↗ high-leverage</span>
          <span>↘ watch</span>
        </div>
      </div>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              dataKey="cost"
              name="Cost"
              tickFormatter={fmt}
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 10 }}
            ></XAxis>
            <YAxis
              type="number"
              dataKey="revenue"
              name="Revenue"
              tickFormatter={fmt}
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 10 }}
            />
            <ZAxis dataKey="hours" range={[40, 320]} />
            <ReferenceLine x={medianCost} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
            <ReferenceLine y={medianRev} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--foreground)",
              }}
              itemStyle={{ color: "var(--foreground)" }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 4 }}
              formatter={(v: number, k: string) => (k === "hours" ? `${v}h` : fmt(v))}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ""}
            />
            <Scatter data={data} shape="circle" fillOpacity={0.85}>
              {data.map((d, i) => (
                <Cell key={i} fill={dotFill(d)} stroke="var(--card)" strokeWidth={1.5} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
