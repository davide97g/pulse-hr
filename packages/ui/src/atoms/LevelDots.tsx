import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { LevelSegmentsValue } from "./LevelSegments";

const FILLED: Record<LevelSegmentsValue, number> = {
  novice: 1,
  practitioner: 2,
  expert: 3,
  master: 4,
};

export interface LevelDotsProps {
  level: LevelSegmentsValue;
  className?: string;
  style?: CSSProperties;
}

/**
 * 4-pip dot indicator (●●●○) — denser, quieter cousin of `LevelSegments`,
 * used in surfaces where the row is already typographically heavy. Master
 * pip gets a soft spark glow.
 */
export function LevelDots({ level, className, style }: LevelDotsProps) {
  const idx = FILLED[level];
  return (
    <span className={cn("lv-dots", className)} style={style}>
      {[1, 2, 3, 4].map((i) => {
        const on = i <= idx;
        const master = on && level === "master";
        return <span key={i} className={cn("pip", on && "on", master && "master")} />;
      })}
    </span>
  );
}
