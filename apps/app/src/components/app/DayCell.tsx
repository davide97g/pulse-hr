import { forwardRef } from "react";
import { isSameDay, format } from "date-fns";
import { Umbrella, Thermometer, PartyPopper, Sprout, UserRound, AlertCircle } from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { DayInfo, DayStatus } from "@/lib/timesheet";
import { commessaById } from "@/lib/mock-data";

const STATUS_BG: Record<DayStatus, string> = {
  filled:   "bg-success/10 hover:bg-success/15 border-success/20",
  partial:  "bg-warning/10 hover:bg-warning/15 border-warning/25",
  missing:  "bg-destructive/[0.07] hover:bg-destructive/10 border-destructive/20",
  sick:     "bg-cal-sick/12 hover:bg-cal-sick/20 border-cal-sick/30",
  vacation: "bg-cal-vacation/12 hover:bg-cal-vacation/20 border-cal-vacation/30",
  personal: "bg-cal-personal/12 hover:bg-cal-personal/20 border-cal-personal/30",
  parental: "bg-cal-parental/12 hover:bg-cal-parental/20 border-cal-parental/30",
  holiday:  "bg-cal-holiday/10 hover:bg-cal-holiday/15 border-cal-holiday/30 [background-image:repeating-linear-gradient(45deg,transparent,transparent_4px,color-mix(in_oklch,var(--color-border)_50%,transparent)_4px,color-mix(in_oklch,var(--color-border)_50%,transparent)_5px)]",
  weekend:  "bg-muted/30 hover:bg-muted/50 border-transparent",
  future:   "bg-background hover:bg-muted/30 border-border/60 border-dashed",
};

const STATUS_ICON: Partial<Record<DayStatus, React.ReactNode>> = {
  vacation: <Umbrella className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  sick:     <Thermometer className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  holiday:  <PartyPopper className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  parental: <Sprout className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  personal: <UserRound className="h-[18px] w-[18px]" strokeWidth={1.75} />,
  missing:  <AlertCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />,
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

  // Hover summary worth rendering?
  const hasTooltip =
    info.entries.length > 0 ||
    !!info.leave ||
    !!info.holiday ||
    info.status === "missing";

  const cell = (
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
        "group relative aspect-square sm:aspect-auto sm:h-[84px] w-full p-1.5 rounded-md border text-left transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:z-10",
        STATUS_BG[info.status],
        muted && "opacity-40",
        isToday && "ring-2 ring-primary/70 ring-offset-1 ring-offset-background",
        selected && "ring-2 ring-primary scale-[1.02]",
        inRange && !selected && "ring-1 ring-primary/40",
      )}
    >
      {/* Top row: day number + status icon */}
      <div className="flex items-start justify-between gap-1">
        <span
          className={cn(
            "font-mono text-base tabular-nums leading-none",
            isToday ? "text-primary font-semibold" : "text-foreground/85",
            info.status === "missing" && "text-destructive/80",
          )}
        >
          {label}
        </span>
        {icon && (
          <span
            className={cn(
              "text-muted-foreground shrink-0 opacity-90",
              info.status === "sick" && "text-cal-sick",
              info.status === "vacation" && "text-cal-vacation",
              info.status === "personal" && "text-cal-personal",
              info.status === "parental" && "text-cal-parental",
              info.status === "holiday" && "text-cal-holiday",
              info.status === "missing" && "text-destructive/80",
            )}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Holiday / leave caption (only when no hours logged, top row) */}
      {info.inMonth && info.hours === 0 && (info.holiday || info.leave) && (
        <div className="mt-1 text-[10px] text-muted-foreground truncate">
          {info.holiday?.name ?? info.leave?.type}
        </div>
      )}

      {/* Bottom row: hours + commessa dots */}
      {(info.hours > 0 || commesse.length > 0) && (
        <div className="absolute bottom-1.5 left-2 right-2 flex items-end justify-between gap-1">
          {info.hours > 0 ? (
            <span className="font-mono text-sm tabular-nums font-medium leading-none">
              {info.hours.toFixed(1)}
              <span className="text-muted-foreground">h</span>
            </span>
          ) : <span />}
          {commesse.length > 0 && (
            <span className="flex gap-0.5">
              {commesse.map(c => (
                <span
                  key={c.id}
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: c.color, boxShadow: `0 0 4px ${c.color}40` }}
                  title={c.code}
                />
              ))}
            </span>
          )}
        </div>
      )}
    </button>
  );

  if (!hasTooltip) return cell;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{cell}</TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[280px] p-0 overflow-hidden bg-popover text-popover-foreground border shadow-pop"
      >
        <HoverSummary info={info} />
      </TooltipContent>
    </Tooltip>
  );
});

function HoverSummary({ info }: { info: DayInfo }) {
  const leaveTone: Record<string, string> = {
    Sick:     "text-cal-sick",
    Vacation: "text-cal-vacation",
    Personal: "text-cal-personal",
    Parental: "text-cal-parental",
  };
  return (
    <div className="text-xs bg-popover text-popover-foreground">
      <div className="px-3 py-2 border-b flex items-center justify-between gap-2">
        <div className="font-semibold text-popover-foreground">{format(info.date, "EEE, MMM d")}</div>
        {info.hours > 0 && (
          <div className="font-mono tabular-nums text-[11px] text-popover-foreground">{info.hours.toFixed(1)}h</div>
        )}
      </div>

      {info.holiday && (
        <div className="px-3 py-2 border-b text-[11px]">
          <span className="font-medium text-cal-holiday">🎉 {info.holiday.name}</span>
          <span className="text-muted-foreground"> · {info.holiday.country}</span>
        </div>
      )}

      {info.leave && (
        <div className="px-3 py-2 border-b text-[11px]">
          <span className={cn("font-medium", leaveTone[info.leave.type] ?? "text-foreground")}>
            {info.leave.type}
          </span>
          {info.leave.granularity === "half" && (
            <span className="text-muted-foreground"> · Half day ({info.leave.halfPeriod})</span>
          )}
          {info.leave.reason && <span className="text-muted-foreground"> · {info.leave.reason}</span>}
        </div>
      )}

      {info.status === "missing" && !info.holiday && !info.leave && (
        <div className="px-3 py-2 border-b text-[11px] text-destructive">
          Missing hours — click to log.
        </div>
      )}

      {info.entries.length > 0 && (
        <ul className="max-h-[220px] overflow-y-auto scrollbar-thin divide-y">
          {info.entries.map(e => {
            const c = commessaById(e.commessaId);
            return (
              <li key={e.id} className="px-3 py-2 flex items-start gap-2">
                <span
                  className="w-0.5 self-stretch rounded-full shrink-0"
                  style={{ backgroundColor: c?.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{c?.code}</span>
                    <span className="font-mono text-[10px] tabular-nums font-medium ml-auto text-popover-foreground">
                      {e.hours}h{!e.billable && " · internal"}
                    </span>
                  </div>
                  <div className="text-[11px] leading-snug mt-0.5 text-popover-foreground">{e.description}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {info.entries.length === 0 && info.hours === 0 && info.status !== "missing" && (
        <div className="px-3 py-2 text-[11px] text-muted-foreground">
          No entries.
        </div>
      )}
    </div>
  );
}
