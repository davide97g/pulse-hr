import type { CSSProperties } from "react";
import { cn } from "../lib/cn";

export type LevelSegmentsValue = "novice" | "practitioner" | "expert" | "master";

const FILLED: Record<LevelSegmentsValue, number> = {
  novice: 1,
  practitioner: 2,
  expert: 3,
  master: 4,
};

export interface LevelSegmentsProps {
  level: LevelSegmentsValue;
  /** Cell width. Named sizes match the canonical scale; pass a number for custom widths. */
  size?: "xs" | "sm" | "md" | number;
  className?: string;
  style?: CSSProperties;
}

const SIZE_PX: Record<"xs" | "sm" | "md", number> = { xs: 12, sm: 18, md: 22 };

/**
 * 4-cell filled-segments level indicator. The last cell turns spark-lime only
 * when the level is `master`; lower levels fill with `var(--fg)`. Empty cells
 * sit on `var(--bg-2)` with `var(--line)` borders.
 */
export function LevelSegments({ level, size = "md", className, style }: LevelSegmentsProps) {
  const w = typeof size === "number" ? size : SIZE_PX[size];
  const idx = FILLED[level];
  return (
    <span
      className={cn("lv-seg", className)}
      style={{ ["--w" as string]: `${w}px`, ...style }}
    >
      {[1, 2, 3, 4].map((i) => {
        const on = i <= idx;
        const master = on && level === "master";
        return <span key={i} className={cn("seg", on && "on", master && "master")} />;
      })}
    </span>
  );
}
