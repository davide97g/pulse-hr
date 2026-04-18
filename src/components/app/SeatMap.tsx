import { useMemo } from "react";
import { Armchair, Monitor, StretchHorizontal } from "lucide-react";
import { employeeById } from "@/lib/mock-data";
import {
  seatsByOffice, closureFor, type Booking, type Seat,
} from "@/lib/offices";
import { useBookings } from "@/components/app/BookingsContext";
import { cn } from "@/lib/utils";

const ME = "e1";

interface Props {
  officeId: string;
  date: string;
  onBook: (seatId: string) => void;
}

interface TileState {
  seat: Seat;
  status: "free" | "yours" | "taken" | "closed";
  booking?: Booking;
}

export function SeatMap({ officeId, date, onBook }: Props) {
  const { bookings } = useBookings();
  const all = useMemo(() => seatsByOffice(officeId), [officeId]);
  const closure = closureFor("office", officeId, date);

  const tiles: TileState[] = useMemo(() => {
    return all.map((seat) => {
      if (closure) return { seat, status: "closed" };
      const b = bookings.find(
        (x) =>
          x.resourceId === seat.id &&
          x.date === date &&
          x.status !== "cancelled",
      );
      if (!b) return { seat, status: "free" };
      if (b.userId === ME) return { seat, status: "yours", booking: b };
      return { seat, status: "taken", booking: b };
    });
  }, [all, bookings, date, closure]);

  // Group by zone
  const byZone = useMemo(() => {
    const m = new Map<string, TileState[]>();
    for (const t of tiles) {
      if (!m.has(t.seat.zone)) m.set(t.seat.zone, []);
      m.get(t.seat.zone)!.push(t);
    }
    return [...m.entries()];
  }, [tiles]);

  const freeCount = tiles.filter((t) => t.status === "free").length;
  const totalCount = tiles.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {closure ? (
            <span className="text-destructive font-medium">
              Closed — {closure.title}
            </span>
          ) : (
            <>
              <span className="font-medium text-foreground tabular-nums">{freeCount}</span>{" "}
              of {totalCount} seats free
            </>
          )}
        </span>
        <span className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-success/25 border border-success/40" /> Free
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary/30 border border-primary/50" /> Yours
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-muted border" /> Taken
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {byZone.map(([zone, ts]) => (
          <div key={zone} className="rounded-lg border p-3 bg-card">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
              Zone {zone}
              <span className="ml-auto font-mono tabular-nums">
                {ts.filter((t) => t.status === "free").length}/{ts.length}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 stagger-in">
              {ts.map((t) => (
                <SeatTile key={t.seat.id} tile={t} onBook={onBook} disabled={t.status !== "free"} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeatTile({
  tile, onBook, disabled,
}: { tile: TileState; onBook: (id: string) => void; disabled: boolean }) {
  const { seat, status, booking } = tile;
  const owner = booking ? employeeById(booking.userId) : null;
  return (
    <button
      type="button"
      disabled={disabled && status !== "yours"}
      onClick={() => status === "free" && onBook(seat.id)}
      className={cn(
        "relative h-12 rounded-md border grid place-items-center press-scale transition-colors text-[10px] font-mono tabular-nums",
        status === "free" && "bg-success/10 border-success/40 hover:bg-success/20 cursor-pointer",
        status === "yours" && "bg-primary/15 border-primary/50 text-primary",
        status === "taken" && "bg-muted border-border text-muted-foreground cursor-default",
        status === "closed" && "bg-destructive/10 border-destructive/30 text-destructive/70 cursor-not-allowed",
      )}
      title={
        status === "free"
          ? `Seat ${seat.label} · free`
          : status === "yours"
            ? `Seat ${seat.label} · your booking`
            : status === "taken"
              ? `Seat ${seat.label} · ${owner?.name ?? "taken"}`
              : `Seat ${seat.label} · closed`
      }
    >
      <Armchair className="h-3 w-3 absolute top-1 left-1 opacity-60" />
      {seat.monitor && <Monitor className="h-2.5 w-2.5 absolute top-1 right-1 opacity-60" />}
      {seat.standing && <StretchHorizontal className="h-2.5 w-2.5 absolute bottom-1 right-1 opacity-60" />}
      <span>{seat.label}</span>
    </button>
  );
}
