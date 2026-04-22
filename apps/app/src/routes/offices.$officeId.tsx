import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Clock,
  Armchair,
  DoorOpen,
  Wrench,
  MapPin,
  CalendarDays,
  Plus,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import { RoomGantt } from "@/components/app/RoomGantt";
import { SeatMap } from "@/components/app/SeatMap";
import { BookingDialog, type BookingDialogPrefill } from "@/components/app/BookingDialog";
import { useBookings } from "@/components/app/BookingsContext";
import {
  officeById,
  roomsByOffice,
  seatsByOffice,
  closures,
  closureFor,
  officeLocalNow,
  officeUtilization,
} from "@/lib/offices";
import { cn } from "@/lib/utils";

interface OfficeSearch {
  date?: string;
  tab?: "rooms" | "seats";
}

export const Route = createFileRoute("/offices/$officeId")({
  head: () => ({ meta: [{ title: "Office — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): OfficeSearch => ({
    date: typeof s.date === "string" ? s.date : undefined,
    tab: s.tab === "rooms" || s.tab === "seats" ? s.tab : undefined,
  }),
  component: OfficeDetail,
});

const TODAY = "2026-04-18";

function OfficeDetail() {
  const { officeId } = Route.useParams();
  const nav = useNavigate({ from: "/offices/$officeId" });
  const search = useSearch({ from: "/offices/$officeId" });
  const date = search.date ?? TODAY;
  const tab = search.tab ?? "rooms";
  const { bookings } = useBookings();

  const [prefill, setPrefill] = useState<BookingDialogPrefill | null>(null);
  const openBook = (p: BookingDialogPrefill) => setPrefill(p);
  const closeBook = () => setPrefill(null);

  const office = officeById(officeId);
  const dayClosure = office ? closureFor("office", office.id, date) : null;

  const utilization = office ? officeUtilization(office.id, date) : null;
  const pct = utilization === null ? null : Math.round(utilization * 100);

  const dayBookingCount = useMemo(
    () =>
      bookings.filter((b) => b.officeId === officeId && b.date === date && b.status !== "cancelled")
        .length,
    [bookings, officeId, date],
  );

  const shiftDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    nav({ search: (p) => ({ ...p, date: d.toISOString().slice(0, 10) }) });
  };

  if (!office) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="Office not found"
          description="The workspace you're looking for doesn't exist."
          action={
            <Link to="/offices">
              <Button>Back to overview</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const upcoming = closures
    .filter(
      (c) =>
        (c.scopeKind === "office" && c.scopeId === office.id) ||
        (c.scopeKind === "room" && roomsByOffice(office.id).some((r) => r.id === c.scopeId)),
    )
    .filter((c) => c.to >= TODAY)
    .sort((a, b) => a.from.localeCompare(b.from))
    .slice(0, 4);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <Link
        to="/offices"
        className="text-xs text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 press-scale"
      >
        <ArrowLeft className="h-3 w-3" /> All offices
      </Link>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>{office.emoji}</span>
            {office.name}
          </span>
        }
        description={
          <span className="inline-flex items-center gap-2 flex-wrap">
            <MapPin className="h-3.5 w-3.5" />
            {office.address} · {office.timezone}
            <span className="inline-flex items-center gap-1 ml-2">
              <Clock className="h-3 w-3" /> Local {officeLocalNow(office)}
            </span>
          </span>
        }
        actions={
          <Button
            size="sm"
            onClick={() => openBook({ officeId: office.id, resourceKind: "room", date })}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Book a room
          </Button>
        }
      />

      <Card className="p-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm font-semibold">
            {new Date(date + "T12:00:00").toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <span className="text-[11px] text-muted-foreground">{date}</span>
          <div className="ml-auto inline-flex items-center gap-1">
            <button
              onClick={() => shiftDate(-1)}
              className="h-8 w-8 rounded-md border hover:bg-muted grid place-items-center press-scale"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => nav({ search: (p) => ({ ...p, date: undefined }) })}
              className="h-8 px-3 text-xs rounded-md border hover:bg-muted press-scale"
            >
              Today
            </button>
            <button
              onClick={() => shiftDate(1)}
              className="h-8 w-8 rounded-md border hover:bg-muted grid place-items-center press-scale"
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {dayClosure && (
          <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2 text-sm">
            <Wrench className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-destructive">
                Office closed today — {dayClosure.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {dayClosure.note ?? "Bookings disabled."}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <MiniMetric label="Utilization" value={pct === null ? "–" : `${pct}%`} accent />
          <MiniMetric label="Bookings" value={dayBookingCount.toString()} />
          <MiniMetric label="Rooms" value={roomsByOffice(office.id).length.toString()} />
          <MiniMetric label="Seats" value={office.seatCapacity.toString()} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3">
        <Card className="p-4">
          <Tabs
            value={tab}
            onValueChange={(v) =>
              nav({ search: (p) => ({ ...p, tab: v === "rooms" ? undefined : "seats" }) })
            }
          >
            <TabsList>
              <TabsTrigger value="rooms">
                <DoorOpen className="h-3 w-3 mr-1.5" />
                Rooms ({roomsByOffice(office.id).length})
              </TabsTrigger>
              <TabsTrigger value="seats">
                <Armchair className="h-3 w-3 mr-1.5" />
                Seats ({seatsByOffice(office.id).length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="rooms" className="mt-4">
              <RoomGantt
                officeId={office.id}
                date={date}
                onBook={(opts) =>
                  openBook({
                    officeId: office.id,
                    resourceKind: "room",
                    resourceId: opts.roomId,
                    date,
                    startTime: opts.startTime,
                    endTime: opts.endTime,
                  })
                }
              />
            </TabsContent>
            <TabsContent value="seats" className="mt-4">
              <SeatMap
                officeId={office.id}
                date={date}
                onBook={(seatId) => {
                  openBook({
                    officeId: office.id,
                    resourceKind: "seat",
                    resourceId: seatId,
                    date,
                    startTime: office.openingHours.open,
                    endTime: office.openingHours.close,
                  });
                }}
              />
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-primary" />
              <div className="font-semibold text-sm">Today in this office</div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">People on site</span>
                <span className="font-mono tabular-nums font-medium">
                  {
                    bookings.filter(
                      (b) =>
                        b.officeId === office.id && b.date === date && b.resourceKind === "seat",
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Room hours booked</span>
                <span className="font-mono tabular-nums font-medium">
                  {bookings
                    .filter(
                      (b) =>
                        b.officeId === office.id && b.date === date && b.resourceKind === "room",
                    )
                    .reduce((a, b) => {
                      const [sh, sm] = b.startTime.split(":").map(Number);
                      const [eh, em] = b.endTime.split(":").map(Number);
                      return a + (eh * 60 + em - (sh * 60 + sm)) / 60;
                    }, 0)
                    .toFixed(1)}
                  h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Open hours</span>
                <span className="font-mono tabular-nums">
                  {office.openingHours.open}–{office.openingHours.close}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="h-4 w-4 text-warning" />
              <div className="font-semibold text-sm">Upcoming closures</div>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-xs text-muted-foreground">Nothing planned.</div>
            ) : (
              <ul className="space-y-2 stagger-in">
                {upcoming.map((c) => (
                  <li key={c.id} className="rounded-md border p-2 text-[12px]">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold",
                          c.kind === "maintenance" && "bg-warning/15 text-warning",
                          c.kind === "holiday" && "bg-info/15 text-info",
                          c.kind === "event" && "bg-primary/15 text-primary",
                        )}
                      >
                        {c.kind}
                      </span>
                      <span className="ml-auto font-mono tabular-nums text-muted-foreground">
                        {c.from}
                        {c.from !== c.to ? ` → ${c.to}` : ""}
                      </span>
                    </div>
                    <div className="mt-1 font-medium">{c.title}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <DoorOpen className="h-4 w-4 text-primary" />
              <div className="font-semibold text-sm">Room list</div>
            </div>
            <ul className="space-y-1 stagger-in">
              {roomsByOffice(office.id).map((r) => (
                <li key={r.id}>
                  <Link
                    to="/offices/$officeId/$roomId"
                    params={{ officeId: office.id, roomId: r.id }}
                    search={{ date }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted press-scale text-xs"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="font-medium">{r.name}</span>
                    <span className="text-muted-foreground">
                      · {r.kind} · cap {r.capacity}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <BookingDialog open={!!prefill} onClose={closeBook} prefill={prefill ?? undefined} />
    </div>
  );
}

function MiniMetric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-md border p-2.5", accent && "border-primary/40")}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
      <div className="text-lg font-display tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
