import { cn } from "@/lib/utils";

export function CapacityBar({
  capacity,
  assigned,
  label,
  compact,
}: {
  capacity: number;
  assigned: number;
  label?: string;
  compact?: boolean;
}) {
  const pct = capacity <= 0 ? (assigned > 0 ? 100 : 0) : Math.min(100, (assigned / capacity) * 100);
  const over = assigned > capacity && capacity > 0;
  const high = !over && pct > 85;
  const tone = over ? "var(--destructive)" : high ? "var(--warning)" : "var(--primary)";
  return (
    <div className={cn("grid gap-1", compact && "gap-0.5")}>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="truncate">{label}</span>
        <span className={cn("tabular-nums", over && "text-destructive font-medium")}>
          {assigned.toFixed(0)} / {capacity.toFixed(0)}h
        </span>
      </div>
      <div className={cn("h-1.5 bg-muted rounded overflow-hidden", compact && "h-1")}>
        <div
          className="h-full rounded transition-all"
          style={{ width: `${pct}%`, background: tone }}
        />
      </div>
    </div>
  );
}
