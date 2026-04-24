import type { Meta, StoryObj } from "@storybook/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@pulse-hr/ui/primitives/card";

const meta: Meta = {
  title: "Patterns/KPI strip",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

type Kpi = {
  label: string;
  value: string;
  unit?: string;
  delta: number;
};

const KPIS: Kpi[] = [
  { label: "Utilization", value: "78.4", unit: "%", delta: 2.1 },
  { label: "Logged hours", value: "1,284", unit: "h", delta: -3.6 },
  { label: "Forecast burn", value: "€41,820", delta: 0 },
  { label: "Active commesse", value: "18", delta: 1 },
];

function Trend({ delta }: { delta: number }) {
  const Icon =
    delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const color =
    delta > 0
      ? "text-success"
      : delta < 0
        ? "text-destructive"
        : "text-muted-foreground";
  const sign = delta > 0 ? "+" : "";
  return (
    <div
      className={`flex items-center gap-1 text-xs font-mono tabular-nums ${color}`}
    >
      <Icon className="h-3 w-3" />
      {sign}
      {delta.toFixed(1)}%
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {KPIS.map((k) => (
        <Card key={k.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {k.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="font-display text-4xl tracking-tight tabular-nums">
              {k.value}
              {k.unit && (
                <span className="text-lg text-muted-foreground ml-0.5">
                  {k.unit}
                </span>
              )}
            </div>
            <Trend delta={k.delta} />
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
