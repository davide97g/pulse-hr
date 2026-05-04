import { memo } from "react";
import { cn } from "@/lib/utils";

export interface RadarDimensions {
  energy: number;
  stress: number;
  engagement: number;
  alignment: number;
}

const AXES: { key: keyof RadarDimensions; label: string; invert?: boolean }[] = [
  { key: "energy", label: "Energy" },
  { key: "engagement", label: "Engagement" },
  { key: "alignment", label: "Alignment" },
  { key: "stress", label: "Stress", invert: true },
];

export const SentimentRadar = memo(SentimentRadarImpl, (a, b) =>
  a.size === b.size &&
  a.showLabels === b.showLabels &&
  a.className === b.className &&
  a.values.energy === b.values.energy &&
  a.values.stress === b.values.stress &&
  a.values.engagement === b.values.engagement &&
  a.values.alignment === b.values.alignment,
);

function SentimentRadarImpl({
  values,
  size = 160,
  showLabels = true,
  className,
}: {
  values: RadarDimensions;
  size?: number;
  showLabels?: boolean;
  className?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.7;
  const labelR = (size / 2) * 0.92;

  // Normalize each axis to [0, 1]: invert stress so high-stress shrinks the chart.
  const norm = AXES.map((a) => {
    const raw = values[a.key];
    const v = a.invert ? -raw : raw;
    return Math.max(0, Math.min(1, (v + 1) / 2));
  });

  const points = AXES.map((_, i) => {
    const angle = -Math.PI / 2 + (i / AXES.length) * Math.PI * 2;
    const v = norm[i];
    return [cx + Math.cos(angle) * r * v, cy + Math.sin(angle) * r * v] as const;
  });

  const polygon = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn("w-full h-auto", className)}
      role="img"
      aria-label="Sentiment radar"
    >
      {[0.33, 0.66, 1].map((step) => (
        <polygon
          key={step}
          points={AXES.map((_, i) => {
            const angle = -Math.PI / 2 + (i / AXES.length) * Math.PI * 2;
            return `${(cx + Math.cos(angle) * r * step).toFixed(1)},${(cy + Math.sin(angle) * r * step).toFixed(1)}`;
          }).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          className="text-muted-foreground"
        />
      ))}
      {AXES.map((_, i) => {
        const angle = -Math.PI / 2 + (i / AXES.length) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * r}
            y2={cy + Math.sin(angle) * r}
            stroke="currentColor"
            strokeOpacity={0.1}
            className="text-muted-foreground"
          />
        );
      })}
      <polygon
        points={polygon}
        fill="currentColor"
        fillOpacity={0.18}
        stroke="currentColor"
        strokeWidth={1.25}
        className="text-primary"
      />
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={2.4}
          fill="currentColor"
          className="text-primary"
        />
      ))}
      {showLabels &&
        AXES.map((a, i) => {
          const angle = -Math.PI / 2 + (i / AXES.length) * Math.PI * 2;
          const x = cx + Math.cos(angle) * labelR;
          const y = cy + Math.sin(angle) * labelR;
          return (
            <text
              key={a.key}
              x={x}
              y={y}
              fontSize={9}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}
            >
              {a.label}
            </text>
          );
        })}
    </svg>
  );
}
