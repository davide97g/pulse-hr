import type { ReactNode } from "react";
import { Card } from "../primitives/card";
import { cn } from "../lib/cn";

export type StatCardSize = "sm" | "md" | "lg" | "editorial";
export type StatCardVariant = "card" | "bare";
export type StatCardDeltaTone = "positive" | "negative" | "neutral";

export interface StatCardProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  deltaTone?: StatCardDeltaTone;
  action?: ReactNode;
  accent?: boolean;
  size?: StatCardSize;
  variant?: StatCardVariant;
  className?: string;
}

const SIZE_PADDING: Record<StatCardSize, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
  editorial: "p-6",
};

const VALUE_CLASS: Record<StatCardSize, string> = {
  sm: "text-base font-semibold tabular-nums",
  md: "text-2xl text-numeric",
  lg: "text-display",
  editorial: "t-num text-[96px] leading-[0.9] tracking-[-0.04em]",
};

const ICON_CLASS: Record<StatCardSize, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  editorial: "h-5 w-5",
};

const DELTA_TONE: Record<StatCardDeltaTone, string> = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
};

/**
 * Single canonical stat card. Replaces the StatTile / MiniStat / bespoke
 * KpiCard family. Pick a `size` rather than a different component.
 *
 *   sm  → compact 4-up panels (was MiniStat)
 *   md  → list/summary headers (was StatTile)
 *   lg  → dashboard hero (was the bespoke KpiCard)
 */
export function StatCard({
  icon,
  label,
  value,
  delta,
  deltaTone = "neutral",
  action,
  accent,
  size = "md",
  variant = "card",
  className,
}: StatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-label min-w-0">
          {icon && (
            <span className={cn("shrink-0", ICON_CLASS[size])} aria-hidden>
              {icon}
            </span>
          )}
          <span className="truncate">{label}</span>
        </div>
        {action && <div className="shrink-0 text-caption">{action}</div>}
      </div>
      <div className={cn("mt-3", VALUE_CLASS[size])}>{value}</div>
      {delta && <div className={cn("mt-2 text-caption", DELTA_TONE[deltaTone])}>{delta}</div>}
    </>
  );

  if (variant === "bare") {
    return <div className={cn("flex flex-col", className)}>{body}</div>;
  }

  return (
    <Card
      className={cn(
        "press-scale transition-shadow hover:shadow-md",
        SIZE_PADDING[size],
        accent && "border-primary/40",
        className,
      )}
    >
      {body}
    </Card>
  );
}
