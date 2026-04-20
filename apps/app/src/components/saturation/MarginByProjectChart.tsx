import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";
import { Card } from "@/components/ui/card";
import { commesse } from "@/lib/mock-data";
import { projectMargin } from "@/lib/projects";

const fmt = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `€${(n / 1_000).toFixed(0)}k`;
  return `€${n.toFixed(0)}`;
};

export function MarginByProjectChart() {
  const data = useMemo(
    () =>
      commesse
        .map((p) => {
          const m = projectMargin(p);
          return {
            id: p.id,
            name: p.name.length > 20 ? `${p.name.slice(0, 20)}…` : p.name,
            margin: m.margin,
            revenue: m.revenue,
            cost: m.cost,
            color: p.color,
          };
        })
        .sort((a, b) => b.margin - a.margin),
    [],
  );

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold">Margin by project</div>
          <div className="text-xs text-muted-foreground">Revenue − cost, year to date.</div>
        </div>
      </div>
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 40, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={fmt}
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 10 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--foreground)",
              }}
              itemStyle={{ color: "var(--foreground)" }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
              formatter={(v: number) => fmt(v)}
            />
            <Bar dataKey="margin" radius={[4, 4, 4, 4]}>
              {data.map((d) => (
                <Cell key={d.id} fill={d.margin >= 0 ? d.color : "var(--destructive)"} />
              ))}
              <LabelList
                dataKey="margin"
                position="right"
                formatter={(v: number) => fmt(v)}
                style={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
