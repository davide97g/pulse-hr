import { STRENGTH_COLORS } from "@/lib/colors";
import type { StrengthTag } from "@/lib/growth";

export interface StrengthsRadarProps {
  points: { tag: StrengthTag; value: number }[];
  size?: number;
  showLegend?: boolean;
}

/**
 * SVG radar chart for the 5 strength tags. Extracted from growth.tsx so
 * /people panel, /profile, and anywhere else can reuse the same look.
 */
export function StrengthsRadar({
  points,
  size = 280,
  showLegend = true,
}: StrengthsRadarProps) {
  const pad = size * (36 / 220);
  const r = size * (72 / 220);
  const cx = size / 2;
  const cy = size / 2;
  const angle = (i: number) => (i / points.length) * 2 * Math.PI - Math.PI / 2;
  const pt = (i: number, v: number) => {
    const d = (v / 100) * r;
    return [cx + Math.cos(angle(i)) * d, cy + Math.sin(angle(i)) * d] as const;
  };
  const path =
    points
      .map((p, i) => {
        const [x, y] = pt(i, p.value);
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ") + " Z";
  const labelRadius = r + size * (16 / 220);

  return (
    <div className="flex items-center gap-5">
      <svg
        width={size}
        height={size}
        viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`}
        className="shrink-0 overflow-visible"
        role="img"
        aria-label="Strengths radar"
      >
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <circle
            key={f}
            cx={cx}
            cy={cy}
            r={r * f}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.1"
          />
        ))}
        {points.map((p, i) => {
          const [x, y] = pt(i, 100);
          return (
            <line
              key={p.tag}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.08"
            />
          );
        })}
        <path
          d={path}
          fill="color-mix(in oklch, var(--primary) 18%, transparent)"
          stroke="var(--primary)"
          strokeWidth="1.5"
        />
        {points.map((p, i) => {
          const [x, y] = pt(i, p.value);
          return (
            <circle key={p.tag} cx={x} cy={y} r="3" fill={STRENGTH_COLORS[p.tag]} />
          );
        })}
        {points.map((p, i) => {
          const [x, y] = pt(i, (labelRadius / r) * 100);
          return (
            <text
              key={p.tag}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-current text-[10px] font-medium uppercase tracking-wider"
              style={{ fontFeatureSettings: '"tnum"' }}
            >
              {p.tag}
            </text>
          );
        })}
      </svg>

      {showLegend && (
        <div className="w-[200px] space-y-2.5">
          {points.map((p) => (
            <div key={p.tag} className="flex items-center gap-2.5 text-sm">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: STRENGTH_COLORS[p.tag] }}
              />
              <span className="capitalize flex-1">{p.tag}</span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {p.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
