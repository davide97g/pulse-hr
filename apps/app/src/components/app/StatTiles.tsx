import { Card } from "@pulse-hr/ui/primitives/card";
import { cn } from "@/lib/utils";

export interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}

/** Large KPI tile used on the top of list/summary routes. */
export function StatTile({ icon, label, value, accent }: StatTileProps) {
  return (
    <Card
      className={cn(
        "p-4 press-scale hover:shadow-md transition-shadow",
        accent && "border-primary/40",
      )}
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-display tabular-nums mt-1">{value}</div>
    </Card>
  );
}

export interface MiniStatProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  /** `bare` = inline row in a grid; `card` = bordered box (profile grid). */
  variant?: "bare" | "card";
}

/** Compact 4-up stat used in team/profile panels. */
export function MiniStat({ icon, value, label, variant = "bare" }: MiniStatProps) {
  return (
    <div className={cn("text-center", variant === "card" && "border rounded-md py-2")}>
      <div className="text-sm font-semibold tabular-nums flex items-center justify-center gap-1">
        <span className="text-muted-foreground">{icon}</span>
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
