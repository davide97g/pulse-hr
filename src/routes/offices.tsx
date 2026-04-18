import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Building2, CalendarDays, Plus, TrendingUp, Wrench, DoorOpen, Armchair, Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/app/AppShell";
import { NewBadge } from "@/components/app/NewBadge";
import { StatTile } from "@/components/app/StatTiles";
import { OfficeHeatmap, type HeatmapMode } from "@/components/app/OfficeHeatmap";
import { BookingDialog } from "@/components/app/BookingDialog";
import { useBookings } from "@/components/app/BookingsContext";
import {
  offices, closures, officeUtilization, roomsByOffice, seatsByOffice,
  officeLocalDate, officeLocalNow, officeById, homeOfficeFor,
} from "@/lib/offices";
import { cn } from "@/lib/utils";

interface OfficesSearch {
  date?: string;
  mode?: HeatmapMode;
  office?: string;
  all?: boolean;
}

export const Route = createFileRoute("/offices")({
  head: () => ({ meta: [{ title: "Offices — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): OfficesSearch => ({
    date: typeof s.date === "string" ? s.date : undefined,
    mode:
      s.mode === "rooms" || s.mode === "seats" || s.mode === "combined"
        ? s.mode
        : undefined,
    office: typeof s.office === "string" ? s.office : undefined,
    all: s.all === true || s.all === "1" || s.all === "true" ? true : undefined,
  }),
  component: OfficesOverview,
});

const TODAY = "2026-04-18";
const ME = "e1";

function OfficesOverview() {
  const nav = useNavigate({ from: "/offices" });
  const search = useSearch({ from: "/offices" });
  const from = search.date ?? TODAY;
  const mode: HeatmapMode = search.mode ?? "combined";
  const showAll = !!search.all;
  const myOffice = useMemo(() => homeOfficeFor(ME), []);
  const selectedOfficeId = showAll
    ? null
    : (search.office ?? myOffice?.id ?? offices[0].id);
  const visibleOffices = useMemo(
    () => (selectedOfficeId ? offices.filter(o => o.id === selectedOfficeId) : offices),
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
  const { bookings } = useBookings();

  // KPIs for today. Scoped to the filter (single office or all).
  const kpis = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const scope = visibleOffices;
    const scopeIds = new Set(scope.map(o => o.id));
    const totalSeats = scope.reduce((a, o) => a + o.seatCapacity, 0);
    const bookedSeats = bookings.filter(
      (b) => b.resourceKind === "seat" && b.date === today && b.status !== "cancelled" && scopeIds.has(b.officeId),
    ).length;
    const bookedRooms = bookings.filter(
      (b) => b.resourceKind === "room" && b.date === today && b.status !== "cancelled" && scopeIds.has(b.officeId),
    ).length;
    const maint = closures.filter((c) => {
      if (today < c.from || today > c.to) return false;
      if (c.scopeKind === "office") return scopeIds.has(c.scopeId);
      // Room closure: include if its office is in scope.
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
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title={<><span>Offices</span><NewBadge /></>}
        description="Real-time overview of your workspace. Heatmap, closures, and one-click bookings."
        actions={
          <Button size="sm" onClick={() => setBookingOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Book a space
          </Button>
        }
      />

      <Card className="p-3 mb-4 flex flex-wrap items-center gap-2">
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
        <div className="ml-auto">
          <button
            onClick={toggleAll}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border press-scale transition-colors",
              showAll
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "hover:border-primary/40 hover:bg-primary/[0.03]",
            )}
            title="Show utilization across every office"
          >
            <TrendingUp className="h-3 w-3" />
            Show all spaces
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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

      <Card className="p-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm font-semibold">Availability · next 14 days</div>
          <span className="text-[11px] text-muted-foreground">Click any cell to drill into that office.</span>
          <div className="ml-auto inline-flex rounded-md border p-0.5 bg-background">
            <button onClick={() => shiftDate(-7)} className="h-7 px-2 text-xs rounded-sm hover:bg-muted press-scale">← Prev week</button>
            <button
              onClick={() => nav({ search: (p) => ({ ...p, date: undefined }) })}
              className="h-7 px-2 text-xs rounded-sm hover:bg-muted press-scale"
            >
              Today
            </button>
            <button onClick={() => shiftDate(7)} className="h-7 px-2 text-xs rounded-sm hover:bg-muted press-scale">Next week →</button>
          </div>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as HeatmapMode)}>
          <TabsList>
            <TabsTrigger value="combined"><TrendingUp className="h-3 w-3 mr-1.5" />Combined</TabsTrigger>
            <TabsTrigger value="rooms"><DoorOpen className="h-3 w-3 mr-1.5" />Rooms</TabsTrigger>
            <TabsTrigger value="seats"><Armchair className="h-3 w-3 mr-1.5" />Seats</TabsTrigger>
          </TabsList>
          <TabsContent value="combined" className="mt-4">
            <OfficeHeatmap from={from} days={14} mode="combined" officeIds={selectedOfficeId ? [selectedOfficeId] : undefined} />
          </TabsContent>
          <TabsContent value="rooms" className="mt-4">
            <OfficeHeatmap from={from} days={14} mode="rooms" officeIds={selectedOfficeId ? [selectedOfficeId] : undefined} />
          </TabsContent>
          <TabsContent value="seats" className="mt-4">
            <OfficeHeatmap from={from} days={14} mode="seats" officeIds={selectedOfficeId ? [selectedOfficeId] : undefined} />
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
                            pct === null ? "text-muted-foreground" : pct > 80 ? "text-destructive" : pct > 50 ? "text-warning" : "text-success",
                          )}
                        >
                          {pct === null ? "–" : `${pct}%`}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">today</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><DoorOpen className="h-3 w-3" /> {rs} rooms</span>
                      <span className="inline-flex items-center gap-1"><Armchair className="h-3 w-3" /> {ss} seats</span>
                      <span className="inline-flex items-center gap-1 ml-auto"><Clock className="h-3 w-3" /> {o.openingHours.open}–{o.openingHours.close}</span>
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
          <ul className="space-y-2 stagger-in">
            {(() => {
              const scopedIds = new Set(visibleOffices.map(o => o.id));
              const scoped = closures.filter(c =>
                c.scopeKind === "office"
                  ? scopedIds.has(c.scopeId)
                  : scopedIds.has(
                      roomsByOffice(
                        offices.find(o => roomsByOffice(o.id).some(r => r.id === c.scopeId))?.id ?? "",
                      )[0]?.officeId ?? "",
                    ),
              );
              if (scoped.length === 0) {
                return <li className="text-sm text-muted-foreground">All spaces open.</li>;
              }
              return null;
            })()}
            {closures
              .filter((c) => {
                const scopedIds = new Set(visibleOffices.map((o) => o.id));
                if (c.scopeKind === "office") return scopedIds.has(c.scopeId);
                // Room closure: look up the room to get its office.
                for (const o of visibleOffices) {
                  if (roomsByOffice(o.id).some((r) => r.id === c.scopeId)) return true;
                }
                return false;
              })
              .map((c) => {
              const target =
                c.scopeKind === "office"
                  ? officeById(c.scopeId)
                  : null;
              const name = target
                ? `${target.emoji} ${target.name}`
                : `Room · ${c.scopeId}`;
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
                      {c.from}{c.from !== c.to ? ` → ${c.to}` : ""}
                    </span>
                  </div>
                  <div className="mt-1 text-muted-foreground">{c.title}</div>
                  {c.note && <div className="text-[11px] text-muted-foreground/80 mt-0.5">{c.note}</div>}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <BookingDialog open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
