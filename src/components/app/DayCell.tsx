import { forwardRef } from "react";
import { isSameDay, format } from "date-fns";
import { Umbrella, Thermometer, PartyPopper, Sprout, UserRound, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DayInfo, DayStatus } from "@/lib/timesheet";
import { commessaById } from "@/lib/mock-data";

const STATUS_BG: Record<DayStatus, string> = {
  filled:   "bg-success/10 hover:bg-success/15 border-success/20",
  partial:  "bg-warning/10 hover:bg-warning/15 border-warning/25",
  missing:  "bg-destructive/[0.07] hover:bg-destructive/10 border-destructive/20",
  sick:     "bg-info/10 hover:bg-info/15 border-info/25",
  vacation: "bg-primary/10 hover:bg-primary/15 border-primary/25",
  personal: "bg-primary/5 hover:bg-primary/10 border-primary/20",
  parental: "bg-primary/5 hover:bg-primary/10 border-primary/20",
  holiday:  "bg-accent hover:bg-accent/80 border-border [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,color-mix(in_oklch,var(--color-border)_50%,transparent)_4px,color-mix(in_oklch,var(--color-border)_50%,transparent)_5px)]",
  weekend:  "bg-muted/30 hover:bg-muted/50 border-transparent",
  future:   "bg-background hover:bg-muted/30 border-border/60 border-dashed",
};

const STATUS_ICON: Partial<Record<DayStatus, React.ReactNode>> = {
  vacation: <Umbrella className="h-3 w-3" />,
  sick:     <Thermometer className="h-3 w-3" />,
  holiday:  <PartyPopper className="h-3 w-3" />,
  parental: <Sprout className="h-3 w-3" />,
  personal: <UserRound className="h-3 w-3" />,
  missing:  <AlertCircle className="h-3 w-3" />,
};

interface Props {
  info: DayInfo;
  month: Date;
  today?: Date;
  selected?: boolean;
  inRange?: boolean;
  tabIndex?: number;
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
  dim?: boolean;
  commessaFilter?: string | null;
}

export const DayCell = forwardRef<HTMLButtonElement, Props>(function DayCell(
  { info, today = new Date(), selected, inRange, tabIndex, onClick, onKeyDown, onFocus, dim, commessaFilter },
  ref,
) {
  const isToday = isSameDay(info.date, today);
  const label = format(info.date, "d");
  const icon = STATUS_ICON[info.status];

  const matchesFilter = !commessaFilter || info.entries.some(e => e.commessaId === commessaFilter);
  const muted = dim || !info.inMonth || !matchesFilter;

  // Unique commesse used this day, up to 4 dots
  const commesse = Array.from(new Set(info.entries.map(e => e.commessaId)))
    .map(id => commessaById(id))
    .filter((x): x is NonNullable<typeof x> => !!x)
    .slice(0, 4);

  return (
    <button
      ref={ref}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      tabIndex={tabIndex ?? -1}
      aria-selected={selected}
      aria-current={isToday ? "date" : undefined}
      aria-label={`${format(info.date, "EEEE, MMMM d")} · ${info.status}${info.hours ? ` · ${info.hours}h` : ""}`}
      className={cn(
        "group relative aspect-square sm:aspect-[4/3] w-full p-1.5 sm:p-2 rounded-md border text-left transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10",
        STATUS_BG[info.status],
        muted && "opacity-40",
        isToday && "ring-2 ring-primary/70 ring-offset-1 ring-offset-background",
        selected && "ring-2 ring-primary scale-[1.02]",
        inRange && !selected && "ring-1 ring-primary/40",
      )}
    >
      {/* Day number + icon */}
      <div className="flex items-start justify-between gap-1">
        <span
          className={cn(
            "font-mono text-sm tabular-nums leading-none",
            isToday ? "text-primary font-semibold" : "text-foreground/80",
            info.status === "missing" && "text-destructive/80",
          )}
        >
          {label}
        </span>
        {icon && (
          <span
            className={cn(
              "text-muted-foreground shrink-0",
              info.status === "sick" && "text-info",
              info.status === "vacation" && "text-primary",
              info.status === "personal" && "text-primary",
              info.status === "parental" && "text-primary",
              info.status === "missing" && "text-destructive/70",
            )}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Hours */}
      {info.hours > 0 && (
        <div className="absolute bottom-1.5 left-1.5 text-[11px] sm:text-xs font-mono tabular-nums font-medium">
          {info.hours.toFixed(1)}
          <span className="text-muted-foreground">h</span>
        </div>
      )}

      {/* Commessa dots */}
      {commesse.length > 0 && (
        <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
          {commesse.map(c => (
            <span
              key={c.id}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: c.color }}
              title={c.code}
            />
          ))}
        </div>
      )}

      {/* Holiday name ribbon */}
      {info.holiday && info.inMonth && (
        <div className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] text-muted-foreground truncate">
          {info.holiday.name}
        </div>
      )}
    </button>
  );
});
