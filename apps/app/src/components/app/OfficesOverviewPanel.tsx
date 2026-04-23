import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  Plus,
  TrendingUp,
  Wrench,
  DoorOpen,
  Armchair,
  Clock,
} from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pulse-hr/ui/primitives/tabs";
import { StatTile } from "@/components/app/StatTiles";
import { OfficeHeatmap, type HeatmapMode } from "@/components/app/OfficeHeatmap";
import { BookingDialog, type BookingDialogPrefill } from "@/components/app/BookingDialog";
import { useBookings } from "@/components/app/BookingsContext";
import {
  offices,
  closures,
  officeUtilization,
  roomsByOffice,
  seatsByOffice,
  officeLocalNow,
  officeById,
  homeOfficeFor,
} from "@/lib/offices";
import { cn } from "@/lib/utils";

const ME = "e1";
const TODAY = "2026-04-19";

export function OfficesOverviewPanel() {
  const nav = useNavigate({ from: "/offices" });
  const search = useSearch({ from: "/offices" }) as {
    date?: string;
    mode?: HeatmapMode;
    office?: string;
    all?: boolean;
  };
  const from = search.date ?? TODAY;
  const mode: HeatmapMode = search.mode ?? "combined";
  const showAll = !!search.all;
  const myOffice = useMemo(() => homeOfficeFor(ME), []);
  const selectedOfficeId = showAll ? null : (search.office ?? myOffice?.id ?? offices[0].id);
  const visibleOffices = useMemo(
    () => (selectedOfficeId ? offices.filter((o) => o.id === selectedOfficeId) : offices),
    [selectedOfficeId],
  );

  const setMode = (m: HeatmapMode) =>
    nav({ search: (prev) => ({ ...prev, mode: m === "combined" ? undefined : m }) });
  const pickOffice = (id: string) =>
    nav({ search: (prev) => ({ ...prev, office: id, all: undefined }) });
  const toggleAll = () =>
    nav({
      search: (prev) => ({
        ...prev,
        all: prev.all ? undefined : true,
        office: prev.all ? (myOffice?.id ?? offices[0].id) : undefined,
      }),
    });
  const shiftDate = (days: number) => {
    const d = new Date(from);
    d.setDate(d.getDate() + days);
    nav({ search: (prev) => ({ ...prev, date: d.toISOString().slice(0, 10) }) });
  };

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<BookingDialogPrefill | null>(null);
  const { bookings } = useBookings();

  const openBookAt = (officeId: string, date: string) => {
    setBookingPrefill({
      officeId,
      date,
      resourceKind: mode === "seats" ? "seat" : "room",
    });
    setBookingOpen(true);
  };
  const openFreshBooking = () => {
    setBookingPrefill(null);
    setBookingOpen(true);
  };

  const kpis = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const scope = visibleOffices;
    const scopeIds = new Set(scope.map((o) => o.id));
    const totalSeats = scope.reduce((a, o) => a + o.seatCapacity, 0);
    const bookedSeats = bookings.filter(
      (b) =>
        b.resourceKind === "seat" &&
        b.date === today &&
        b.status !== "cancelled" &&
        scopeIds.has(b.officeId),
    ).length;
    const bookedRooms = bookings.filter(
      (b) =>
        b.resourceKind === "room" &&
        b.date === today &&
        b.status !== "cancelled" &&
        scopeIds.has(b.officeId),
    ).length;
    const maint = closures.filter((c) => {
      if (today < c.from || today > c.to) return false;
      if (c.scopeKind === "office") return scopeIds.has(c.scopeId);
      return true;
    }).length;
    const blended =
      scope.reduce((a, o) => a + (officeUtilization(o.id, today) ?? 0), 0) /
      Math.max(1, scope.length);
    return {
      totalSeats,
      bookedSeats,
      bookedRooms,
      maint,
      pctBlended: Math.round(blended * 100),
    };
  }, [bookings, visibleOffices]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mr-1">
          Viewing
        </div>
        <div className="flex flex-wrap gap-1.5">
          {offices.map((o) => {
            const active = !showAll && selectedOfficeId === o.id;
            const isMine = myOffice?.id === o.id;
            return (
              <button
                key={o.id}
                onClick={() => pickOffice(o.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border press-scale transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "hover:border-primary/40 hover:bg-primary/[0.03]",
                )}
                title={isMine ? `${o.name} · your home office` : o.name}
              >
                <span className="text-sm leading-none">{o.emoji}</span>
                <span>{o.name}</span>
                {isMine && (
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-primary/80 bg-primary/15 px-1 py-0.5 rounded">
                    You
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleAll}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border press-scale transition-colors",
              showAll
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "hover:border-primary/40 hover:bg-primary/[0.03]",
            )}
          >
            <TrendingUp className="h-3 w-3" /> Show all spaces
          </button>
          <Button size="sm" onClick={openFreshBooking}>
            <Plus className="h-4 w-4 mr-1.5" /> Book a space
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          icon={<TrendingUp className="h-4 w-4" />}
          label="Avg utilization today"
          value={`${kpis.pctBlended}%`}
          accent
        />
        <StatTile
          icon={<Armchair className="h-4 w-4" />}
          label="Seats booked"
          value={`${kpis.bookedSeats} / ${kpis.totalSeats}`}
        />
        <StatTile
          icon={<DoorOpen className="h-4 w-4" />}
          label="Room bookings today"
          value={`${kpis.bookedRooms}`}
        />
        <StatTile
          icon={<Wrench className="h-4 w-4" />}
          label="Active closures"
          value={`${kpis.maint}`}
        />
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm font-semibold">Availability · next 14 days</div>
          <span className="text-[11px] text-muted-foreground">
            Click any cell to book in that office for that day.
          </span>
          <div className="ml-auto inline-flex rounded-md border p-0.5 bg-background">
            <button
              onClick={() => shiftDate(-7)}
              className="h-7 px-2 text-xs rounded-sm hover:bg-muted press-scale"
            >
              ← Prev week
            </button>
            <button
              onClick={() => nav({ search: (p) => ({ ...p, date: undefined }) })}
              className="h-7 px-2 text-xs rounded-sm hover:bg-muted press-scale"
            >
              Today
            </button>
            <button
              onClick={() => shiftDate(7)}
              className="h-7 px-2 text-xs rounded-sm hover:bg-muted press-scale"
            >
              Next week →
            </button>
          </div>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as HeatmapMode)}>
          <TabsList>
            <TabsTrigger value="combined">
              <TrendingUp className="h-3 w-3 mr-1.5" />
              Combined
            </TabsTrigger>
            <TabsTrigger value="rooms">
              <DoorOpen className="h-3 w-3 mr-1.5" />
              Rooms
            </TabsTrigger>
            <TabsTrigger value="seats">
              <Armchair className="h-3 w-3 mr-1.5" />
              Seats
            </TabsTrigger>
          </TabsList>
          <TabsContent value="combined" className="mt-4">
            <OfficeHeatmap
              from={from}
              days={14}
              mode="combined"
              officeIds={selectedOfficeId ? [selectedOfficeId] : undefined}
              onCellClick={openBookAt}
            />
          </TabsContent>
          <TabsContent value="rooms" className="mt-4">
            <OfficeHeatmap
              from={from}
              days={14}
              mode="rooms"
              officeIds={selectedOfficeId ? [selectedOfficeId] : undefined}
              onCellClick={openBookAt}
            />
          </TabsContent>
          <TabsContent value="seats" className="mt-4">
            <OfficeHeatmap
              from={from}
              days={14}
              mode="seats"
              officeIds={selectedOfficeId ? [selectedOfficeId] : undefined}
              onCellClick={openBookAt}
            />
          </TabsContent>
        </Tabs>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-primary" />
            <div className="font-semibold text-sm">Office snapshot · now</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleOffices.map((o) => {
              const today = new Date().toISOString().slice(0, 10);
              const u = officeUtilization(o.id, today);
              const pct = u === null ? null : Math.round(u * 100);
              const rs = roomsByOffice(o.id).length;
              const ss = seatsByOffice(o.id).length;
              return (
                <Link
                  key={o.id}
                  to="/offices/$officeId"
                  params={{ officeId: o.id }}
                  className="group rounded-lg border p-3 press-scale hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div
                    className="absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl pointer-events-none"
                    style={{ backgroundColor: o.color, opacity: 0.22 }}
                    aria-hidden
                  />
                  <div className="relative">
                    <div className="flex items-start gap-2">
                      <div className="text-xl leading-none">{o.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{o.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {o.city} · {officeLocalNow(o)} local
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-lg font-display tabular-nums",
                            pct === null
                              ? "text-muted-foreground"
                              : pct > 80
                                ? "text-destructive"
                                : pct > 50
                                  ? "text-warning"
                                  : "text-success",
                          )}
                        >
                          {pct === null ? "–" : `${pct}%`}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          today
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <DoorOpen className="h-3 w-3" /> {rs} rooms
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Armchair className="h-3 w-3" /> {ss} seats
                      </span>
                      <span className="inline-flex items-center gap-1 ml-auto">
                        <Clock className="h-3 w-3" /> {o.openingHours.open}–{o.openingHours.close}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="h-4 w-4 text-warning" />
            <div className="font-semibold text-sm">Upcoming closures</div>
          </div>
          <ClosuresList visibleOfficeIds={visibleOffices.map((o) => o.id)} />
        </Card>
      </div>

      <BookingDialog
        open={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          setBookingPrefill(null);
        }}
        prefill={bookingPrefill ?? undefined}
      />
    </div>
  );
}

function ClosuresList({ visibleOfficeIds }: { visibleOfficeIds: string[] }) {
  const scoped = closures.filter((c) => {
    const scopedIds = new Set(visibleOfficeIds);
    if (c.scopeKind === "office") return scopedIds.has(c.scopeId);
    for (const id of scopedIds) {
      if (roomsByOffice(id).some((r) => r.id === c.scopeId)) return true;
    }
    return false;
  });
  if (scoped.length === 0) {
    return <div className="text-sm text-muted-foreground">All spaces open.</div>;
  }
  return (
    <ul className="space-y-2 stagger-in">
      {scoped.map((c) => {
        const target = c.scopeKind === "office" ? officeById(c.scopeId) : null;
        const name = target ? `${target.emoji} ${target.name}` : `Room · ${c.scopeId}`;
        return (
          <li key={c.id} className="rounded-md border p-2.5 text-xs">
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
              <span className="font-medium">{name}</span>
              <span className="ml-auto font-mono tabular-nums text-muted-foreground">
                {c.from}
                {c.from !== c.to ? ` → ${c.to}` : ""}
              </span>
            </div>
            <div className="mt-1 text-muted-foreground">{c.title}</div>
            {c.note && <div className="text-[11px] text-muted-foreground/80 mt-0.5">{c.note}</div>}
          </li>
        );
      })}
    </ul>
  );
}
