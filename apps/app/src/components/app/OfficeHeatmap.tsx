import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  offices,
  dateRange,
  officeUtilization,
  roomUtilization,
  seatUtilization,
  utilizationBucket,
  BUCKET_COLOR,
  closureFor,
  seatsByOffice,
  roomsByOffice,
  isWeekend,
} from "@/lib/offices";
import { cn } from "@/lib/utils";

export type HeatmapMode = "combined" | "rooms" | "seats";

export interface OfficeHeatmapProps {
  from: string;
  days: number;
  mode: HeatmapMode;
  /** Restrict to a subset of offices; defaults to all. */
  officeIds?: string[];
  /** If provided, clicking a cell invokes this instead of navigating. */
  onCellClick?: (officeId: string, date: string) => void;
}

interface Cell {
  date: string;
  u: number | null;
  bucket: ReturnType<typeof utilizationBucket>;
  note?: string;
  striped?: boolean;
}

export function OfficeHeatmap({ from, days, mode, officeIds, onCellClick }: OfficeHeatmapProps) {
  const cols = useMemo(() => dateRange(from, days), [from, days]);
  const rows = useMemo(
    () => (officeIds ? offices.filter((o) => officeIds.includes(o.id)) : offices),
    [officeIds],
  );

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div
        className="grid gap-1 min-w-[720px] stagger-in"
        style={{
          gridTemplateColumns: `180px repeat(${cols.length}, minmax(36px, 1fr))`,
        }}
      >
        {/* header row */}
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium self-end pl-1">
          Office
        </div>
        {cols.map((d, i) => {
          const date = new Date(d + "T12:00:00");
          const today = d === new Date().toISOString().slice(0, 10);
          const prev = i > 0 ? new Date(cols[i - 1] + "T12:00:00") : null;
          const showMonth = i === 0 || (prev && prev.getMonth() !== date.getMonth());
          const monthLabel = date.toLocaleDateString(undefined, { month: "short" });
          return (
            <div
              key={d}
              className={cn(
                "text-center text-[10px] tabular-nums",
                today ? "text-primary font-semibold" : "text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "text-[9px] uppercase tracking-wider font-semibold mb-0.5 h-3",
                  showMonth ? "text-foreground/80" : "opacity-0",
                )}
                aria-hidden={!showMonth}
              >
                {showMonth ? monthLabel : "."}
              </div>
              <div className="font-medium">
                {date.toLocaleDateString(undefined, { weekday: "short" })[0]}
              </div>
              <div className="opacity-70">{date.getDate()}</div>
            </div>
          );
        })}

        {/* data rows */}
        {rows.map((office) => {
          const cells: Cell[] = cols.map((date) => {
            const closure = closureFor("office", office.id, date);
            if (closure) {
              return { date, u: null, bucket: "closed", note: closure.title, striped: true };
            }
            if (isWeekend(date)) {
              return { date, u: null, bucket: "closed", note: "Weekend" };
            }
            let u: number | null = null;
            if (mode === "combined") u = officeUtilization(office.id, date);
            else if (mode === "rooms") {
              const rs = roomsByOffice(office.id);
              u = rs.length
                ? rs.reduce((a, r) => a + (roomUtilization(r.id, date) ?? 0), 0) / rs.length
                : 0;
            } else {
              const ss = seatsByOffice(office.id);
              const booked = ss.filter((s) => seatUtilization(s.id, date) === 1).length;
              u = ss.length ? booked / ss.length : 0;
            }
            return { date, u, bucket: utilizationBucket(u) };
          });
          return (
            <RowFragment key={office.id} office={office} cells={cells} onCellClick={onCellClick} />
          );
        })}
      </div>

      <Legend />
    </div>
  );
}

function RowFragment({
  office,
  cells,
  onCellClick,
}: {
  office: (typeof offices)[number];
  cells: Cell[];
  onCellClick?: (officeId: string, date: string) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 pl-1 pr-2 py-1.5">
        <span className="text-base leading-none">{office.emoji}</span>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{office.name}</div>
          <div className="text-[10px] text-muted-foreground truncate">
            {office.city} · {office.timezone.split("/").pop()}
          </div>
        </div>
      </div>
      {cells.map((cell) => (
        <HeatCell key={cell.date} officeId={office.id} cell={cell} onCellClick={onCellClick} />
      ))}
    </>
  );
}

function HeatCell({
  officeId,
  cell,
  onCellClick,
}: {
  officeId: string;
  cell: Cell;
  onCellClick?: (officeId: string, date: string) => void;
}) {
  const pct = cell.u === null ? null : Math.round(cell.u * 100);
  const label = cell.note ? cell.note : pct !== null ? `${pct}%` : "";
  const today = cell.date === new Date().toISOString().slice(0, 10);
  const isClosed = cell.bucket === "closed";
  const clickable = !!onCellClick && !isClosed;
  const className = cn(
    "relative h-11 rounded-md border transition-colors grid place-items-center text-[10px] font-mono tabular-nums",
    clickable && "cursor-pointer hover:ring-2 hover:ring-primary/40 hover:border-primary/40",
    !onCellClick && !isClosed && "hover:border-primary/40",
    today && "ring-1 ring-primary/60",
    isClosed && "cursor-not-allowed opacity-70",
  );
  const style = {
    backgroundColor: BUCKET_COLOR[cell.bucket],
    backgroundImage: cell.striped
      ? "repeating-linear-gradient(45deg, transparent 0 4px, color-mix(in oklch, var(--destructive) 20%, transparent) 4px 8px)"
      : undefined,
    borderColor: "color-mix(in oklch, currentColor 8%, transparent)",
  };
  const content = (
    <span
      className={cn(
        "pointer-events-none",
        cell.bucket === "full" || cell.bucket === "high" ? "text-white" : "text-foreground/70",
      )}
    >
      {cell.u === null ? "–" : pct}
    </span>
  );
  const title = `${cell.date} · ${label}${onCellClick && !isClosed ? " · click to book" : ""}`;

  if (onCellClick) {
    return (
      <button
        type="button"
        disabled={isClosed}
        onClick={() => !isClosed && onCellClick(officeId, cell.date)}
        className={className}
        style={style}
        title={title}
      >
        {content}
      </button>
    );
  }
  return (
    <Link
      to="/offices/$officeId"
      params={{ officeId }}
      search={{ date: cell.date }}
      className={className}
      style={style}
      title={title}
    >
      {content}
    </Link>
  );
}

function Legend() {
  const items: { label: string; bucket: keyof typeof BUCKET_COLOR }[] = [
    { label: "< 40%", bucket: "low" },
    { label: "40–75%", bucket: "medium" },
    { label: "75–99%", bucket: "high" },
    { label: "Full", bucket: "full" },
    { label: "Closed", bucket: "closed" },
  ];
  return (
    <div className="flex items-center gap-3 mt-3 flex-wrap text-[11px] text-muted-foreground">
      <span className="uppercase tracking-wider text-[10px]">Legend</span>
      {items.map((it) => (
        <span key={it.bucket} className="inline-flex items-center gap-1.5">
          <span
            className="h-3 w-5 rounded-sm border"
            style={{
              backgroundColor: BUCKET_COLOR[it.bucket],
              backgroundImage:
                it.bucket === "closed"
                  ? "repeating-linear-gradient(45deg, transparent 0 4px, color-mix(in oklch, var(--destructive) 20%, transparent) 4px 8px)"
                  : undefined,
            }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}
