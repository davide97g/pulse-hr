import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Clock, DoorOpen, Plus, Tv, Users, Presentation, Phone,
  Repeat, Wrench, Wand2, Monitor, Projector, PhoneCall, Fan,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import { BookingDialog, type BookingDialogPrefill } from "@/components/app/BookingDialog";
import { useBookings } from "@/components/app/BookingsContext";
import {
  roomById, officeById, closureFor, dateRange, bookingsFor,
  utilizationBucket, BUCKET_COLOR, minutesBetween, type Amenity, type Room,
} from "@/lib/offices";
import { employeeById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface RoomSearch {
  date?: string;
}

export const Route = createFileRoute("/offices/$officeId/$roomId")({
  head: () => ({ meta: [{ title: "Room — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): RoomSearch => ({
    date: typeof s.date === "string" ? s.date : undefined,
  }),
  component: RoomDrilldown,
});

const TODAY = "2026-04-18";

const AMENITY_ICON: Record<Amenity, React.ComponentType<{ className?: string }>> = {
  tv: Tv,
  whiteboard: Presentation,
  speakerphone: PhoneCall,
  monitor: Monitor,
  ac: Fan,
  "standing-desk": Users,
  videoconf: DoorOpen,
  projector: Projector,
};

function RoomDrilldown() {
  const { officeId, roomId } = Route.useParams();
  const nav = useNavigate({ from: "/offices/$officeId/$roomId" });
  const search = useSearch({ from: "/offices/$officeId/$roomId" });
  const anchor = search.date ?? TODAY;
  const { bookings } = useBookings();

  const room = roomById(roomId);
  const office = officeById(officeId);

  const [prefill, setPrefill] = useState<BookingDialogPrefill | null>(null);

  // Monday-anchored week (7 days starting from the Monday on/before anchor)
  const weekStart = useMemo(() => {
    const d = new Date(anchor + "T12:00:00");
    const dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow);
    return d.toISOString().slice(0, 10);
  }, [anchor]);
  const days = useMemo(() => dateRange(weekStart, 7), [weekStart]);

  if (!room || !office) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <EmptyState
          icon={<DoorOpen className="h-6 w-6" />}
          title="Room not found"
          description="This room is no longer available."
          action={<Link to="/offices"><Button>Back to overview</Button></Link>}
        />
      </div>
    );
  }

  const [oh, om] = office.openingHours.open.split(":").map(Number);
  const [ch, cm] = office.openingHours.close.split(":").map(Number);
  const startMin = oh * 60 + om;
  const endMin = ch * 60 + cm;
  const slotLen = 30;
  const slotsPerDay = Math.ceil((endMin - startMin) / slotLen);
  const slotLabels = Array.from({ length: slotsPerDay }, (_, i) => {
    const m = startMin + i * slotLen;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  });

  const shiftWeek = (days: number) => {
    const d = new Date(anchor + "T12:00:00");
    d.setDate(d.getDate() + days);
    nav({ search: (p) => ({ ...p, date: d.toISOString().slice(0, 10) }) });
  };

  const allWeekBookings = bookings.filter(
    (b) => b.resourceId === room.id && days.includes(b.date) && b.status !== "cancelled",
  );
  const auditTrail = [...bookings]
    .filter((b) => b.resourceId === room.id && b.status !== "cancelled")
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime))
    .slice(0, 10);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <Link
        to="/offices/$officeId"
        params={{ officeId: office.id }}
        className="text-xs text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 press-scale"
      >
        <ArrowLeft className="h-3 w-3" /> {office.emoji} {office.name}
      </Link>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: room.color }} />
            {room.name}
          </span>
        }
        description={
          <span className="inline-flex items-center gap-2 flex-wrap text-xs">
            <span className="capitalize">{room.kind}</span> · capacity {room.capacity}
            <span className="ml-1 inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {office.openingHours.open}–{office.openingHours.close} ({office.timezone})</span>
          </span>
        }
        actions={
          <Button size="sm" onClick={() => setPrefill({
            officeId: office.id,
            resourceKind: "room",
            resourceId: room.id,
            date: anchor,
          })}>
            <Plus className="h-4 w-4 mr-1.5" /> Book this room
          </Button>
        }
      />

      <Card className="p-4 mb-4">
        <AmenityBar room={room} />
      </Card>

      <Card className="p-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Wand2 className="h-4 w-4 text-primary" />
          <div className="text-sm font-semibold">Week heatmap · {weekStart}</div>
          <span className="text-[11px] text-muted-foreground">Click any half-hour slot to prefill the booking form.</span>
          <div className="ml-auto inline-flex items-center gap-1">
            <button onClick={() => shiftWeek(-7)} className="h-8 px-3 rounded-md border hover:bg-muted press-scale text-xs">← Prev</button>
            <button
              onClick={() => nav({ search: (p) => ({ ...p, date: undefined }) })}
              className="h-8 px-3 rounded-md border hover:bg-muted press-scale text-xs"
            >
              Today
            </button>
            <button onClick={() => shiftWeek(7)} className="h-8 px-3 rounded-md border hover:bg-muted press-scale text-xs">Next →</button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <div
            className="grid gap-0.5 min-w-[680px]"
            style={{
              gridTemplateColumns: `60px repeat(${days.length}, minmax(56px, 1fr))`,
            }}
          >
            {/* header */}
            <div />
            {days.map((d) => {
              const date = new Date(d + "T12:00:00");
              const today = d === new Date().toISOString().slice(0, 10);
              return (
                <div
                  key={d}
                  className={cn(
                    "text-center text-[10px] tabular-nums py-1",
                    today ? "text-primary font-semibold" : "text-muted-foreground",
                  )}
                >
                  <div className="font-medium uppercase">{date.toLocaleDateString(undefined, { weekday: "short" })}</div>
                  <div className="opacity-70">{date.getDate()}</div>
                </div>
              );
            })}

            {slotLabels.map((label, row) => {
              const showLabel = row % 2 === 0;
              return (
                <div key={`r-${row}`} className="contents">
                  <div className="text-[9px] text-muted-foreground pr-1 text-right tabular-nums self-start pt-0.5">
                    {showLabel ? label : ""}
                  </div>
                  {days.map((date) => {
                    const dayBookings = bookingsFor(room.id, date, allWeekBookings);
                    const slotStartMin = startMin + row * slotLen;
                    const slotEndMin = slotStartMin + slotLen;
                    const match = dayBookings.find((b) => {
                      const [bh, bm] = b.startTime.split(":").map(Number);
                      const [eh, em] = b.endTime.split(":").map(Number);
                      const s = bh * 60 + bm;
                      const e = eh * 60 + em;
                      return slotStartMin < e && s < slotEndMin;
                    });
                    const closed =
                      closureFor("office", office.id, date) ||
                      closureFor("room", room.id, date);
                    const ratio = match
                      ? 1
                      : closed
                        ? null
                        : 0;
                    const bucket = utilizationBucket(ratio);
                    return (
                      <button
                        key={`${date}-${row}`}
                        type="button"
                        onClick={() => {
                          if (closed || match) return;
                          const startLabel = `${String(Math.floor(slotStartMin / 60)).padStart(2, "0")}:${String(slotStartMin % 60).padStart(2, "0")}`;
                          const endLabelMin = Math.min(endMin, slotStartMin + 60);
                          const endLabel = `${String(Math.floor(endLabelMin / 60)).padStart(2, "0")}:${String(endLabelMin % 60).padStart(2, "0")}`;
                          setPrefill({
                            officeId: office.id,
                            resourceKind: "room",
                            resourceId: room.id,
                            date,
                            startTime: startLabel,
                            endTime: endLabel,
                            title: "",
                          });
                        }}
                        title={
                          closed
                            ? `Closed · ${date}`
                            : match
                              ? `${match.title ?? "Busy"} · ${match.startTime}–${match.endTime}`
                              : `${date} · ${slotLabels[row]} · free`
                        }
                        className={cn(
                          "h-4 rounded-[3px] border border-transparent",
                          closed ? "cursor-not-allowed" : match ? "cursor-not-allowed" : "hover:ring-2 hover:ring-primary/40 cursor-pointer",
                        )}
                        style={{
                          backgroundColor: BUCKET_COLOR[bucket],
                          backgroundImage: closed
                            ? "repeating-linear-gradient(45deg, transparent 0 3px, color-mix(in oklch, var(--destructive) 25%, transparent) 3px 6px)"
                            : undefined,
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <div className="font-semibold text-sm">This week's schedule</div>
            <span className="ml-auto text-[11px] text-muted-foreground">{allWeekBookings.length} bookings</span>
          </div>
          {allWeekBookings.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              Nothing booked this week. Claim a slot.
            </div>
          ) : (
            <ul className="divide-y stagger-in">
              {allWeekBookings
                .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
                .map((b) => {
                  const owner = employeeById(b.userId);
                  return (
                    <li key={b.id} className="py-2.5 flex items-center gap-3">
                      {owner && (
                        <Avatar initials={owner.initials} color={owner.avatarColor} size={28} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate flex items-center gap-1.5">
                          {b.title ?? "Busy"}
                          {b.recurring && <Repeat className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {owner?.name ?? "—"} · {b.date} · {b.startTime}–{b.endTime}
                        </div>
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {minutesBetween(b.startTime, b.endTime)}m
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div className="font-semibold text-sm">Recent activity</div>
          </div>
          {auditTrail.length === 0 ? (
            <div className="text-xs text-muted-foreground">No bookings yet.</div>
          ) : (
            <ul className="space-y-2">
              {auditTrail.map((b) => {
                const owner = employeeById(b.userId);
                return (
                  <li key={b.id} className="text-[11px] flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                    <span className="font-medium">{owner?.name.split(" ")[0] ?? "—"}</span>
                    <span className="text-muted-foreground truncate">{b.title ?? "booked"}</span>
                    <span className="ml-auto font-mono tabular-nums text-muted-foreground">{b.date}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <BookingDialog
        open={!!prefill}
        onClose={() => setPrefill(null)}
        prefill={prefill ?? undefined}
      />
    </div>
  );
}

function AmenityBar({ room }: { room: Room }) {
  if (room.amenities.length === 0) {
    return <div className="text-xs text-muted-foreground">No listed amenities.</div>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {room.amenities.map((a) => {
        const Icon = AMENITY_ICON[a] ?? Tv;
        return (
          <span
            key={a}
            className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border bg-muted/30"
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="capitalize">{a.replace("-", " ")}</span>
          </span>
        );
      })}
    </div>
  );
}
