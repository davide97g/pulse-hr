interface SparkBurstProps {
  size?: number;
  density?: number;
  dotSize?: number;
  withDots?: boolean;
  withRing?: boolean;
  withLines?: boolean;
}

export function SparkBurst({
  size = 280,
  density = 14,
  dotSize = 7,
  withDots = true,
  withRing = true,
  withLines = true,
}: SparkBurstProps) {
  const r = size / 2;
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let i = 0; i < density; i++) {
    const a = (i / density) * Math.PI * 2;
    const len = 0.35 + (i % 3 === 0 ? 0.2 : 0) + (i % 5 === 0 ? 0.1 : 0);
    lines.push({
      x1: Math.cos(a) * r * 0.18,
      y1: Math.sin(a) * r * 0.18,
      x2: Math.cos(a) * r * (0.18 + len),
      y2: Math.sin(a) * r * (0.18 + len),
    });
  }
  const dots: Array<{ cx: number; cy: number; rr: number }> = [];
  for (let i = 0; i < density * 1.5; i++) {
    const a = (i / (density * 1.5)) * Math.PI * 2 + 0.1;
    const seeded = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const d = 0.55 + Math.abs(seeded) * 0.4;
    dots.push({
      cx: Math.cos(a) * r * d,
      cy: Math.sin(a) * r * d,
      rr: 2 + (i % 4 === 0 ? 2 : 0),
    });
  }

  return (
    <svg
      viewBox={`${-r} ${-r} ${size} ${size}`}
      width={size}
      height={size}
      style={{ overflow: "visible" }}
      aria-hidden
    >
      {withRing && (
        <circle
          cx="0"
          cy="0"
          r={r * 0.42}
          fill="none"
          stroke="var(--spark)"
          strokeWidth="1.5"
          strokeDasharray="2 5"
          opacity="0.55"
        />
      )}
      {withLines &&
        lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="var(--spark)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.85}
          />
        ))}
      {withDots &&
        dots.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.rr}
            fill="var(--spark)"
            opacity={0.7 + (i % 3) * 0.1}
          />
        ))}
      <circle cx="0" cy="0" r={dotSize * 1.4} fill="var(--ink)" />
      <circle cx="0" cy="0" r={dotSize * 0.6} fill="var(--spark)" />
    </svg>
  );
}
