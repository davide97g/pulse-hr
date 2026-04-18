import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays, CalendarClock, History, ShieldCheck, DoorOpen, Armchair,
  Plus, Trash2, Pencil, Filter, ArrowUpRight, X, Repeat,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { NewBadge } from "@/components/app/NewBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { BookingDialog, type BookingDialogPrefill } from "@/components/app/BookingDialog";
import { useBookings } from "@/components/app/BookingsContext";
import {
  offices, officeById, roomById, seatById, minutesBetween, type Booking,
} from "@/lib/offices";
import { employeeById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ME = "e1";
/** Demo: treat ME as admin — wire to real role once auth exists. */
const IS_ADMIN = true;
const TODAY = "2026-04-18";

type Tab = "upcoming" | "past" | "all";

interface ReservationsSearch {
  tab?: Tab;
  office?: string;
  user?: string;
  kind?: "room" | "seat";
  q?: string;
}

export const Route = createFileRoute("/reservations")({
  head: () => ({ meta: [{ title: "Reservations — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): ReservationsSearch => ({
    tab:
      s.tab === "upcoming" || s.tab === "past" || s.tab === "all"
        ? s.tab
        : undefined,
    office: typeof s.office === "string" ? s.office : undefined,
    user: typeof s.user === "string" ? s.user : undefined,
    kind:
      s.kind === "room" || s.kind === "seat" ? s.kind : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: Reservations,
});

function Reservations() {
  const nav = useNavigate({ from: "/reservations" });
  const search = useSearch({ from: "/reservations" });
  const tab: Tab = search.tab ?? "upcoming";
  const officeFilter = search.office ?? "all";
  const userFilter = search.user ?? "all";
  const kindFilter = search.kind ?? "all";
  const q = search.q ?? "";

  const setTab = (t: string) =>
    nav({ search: (prev) => ({ ...prev, tab: t === "upcoming" ? undefined : (t as Tab) }) });
  const setOffice = (v: string) =>
    nav({ search: (prev) => ({ ...prev, office: v === "all" ? undefined : v }) });
  const setUser = (v: string) =>
    nav({ search: (prev) => ({ ...prev, user: v === "all" ? undefined : v }) });
  const setKind = (v: string) =>
    nav({
      search: (prev) => ({
        ...prev,
        kind: v === "all" ? undefined : (v as "room" | "seat"),
      }),
    });
  const setQ = (v: string) =>
    nav({ search: (prev) => ({ ...prev, q: v || undefined }) });

  const { bookings, cancelBooking, restoreBooking } = useBookings();
  const [prefill, setPrefill] = useState<BookingDialogPrefill | null>(null);
  const [toCancel, setToCancel] = useState<Booking | null>(null);

  // ── filter pipeline ───────────────────────────────────────────────
  const scoped = useMemo(() => {
    let list = bookings.filter((b) => b.status !== "cancelled");
    if (tab !== "all") {
      list = list.filter((b) => b.userId === ME);
    }
    if (tab === "upcoming") list = list.filter((b) => b.date >= TODAY);
    if (tab === "past") list = list.filter((b) => b.date < TODAY);

    if (officeFilter !== "all") list = list.filter((b) => b.officeId === officeFilter);
    if (kindFilter !== "all") list = list.filter((b) => b.resourceKind === kindFilter);
    if (userFilter !== "all") list = list.filter((b) => b.userId === userFilter);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((b) => {
        const title = (b.title ?? "").toLowerCase();
        const owner = employeeById(b.userId)?.name.toLowerCase() ?? "";
        const room = b.resourceKind === "room" ? roomById(b.resourceId)?.name.toLowerCase() ?? "" : "";
        const seat = b.resourceKind === "seat" ? seatById(b.resourceId)?.label.toLowerCase() ?? "" : "";
        return (
          title.includes(needle) ||
          owner.includes(needle) ||
          room.includes(needle) ||
          seat.includes(needle)
        );
      });
    }
    // Sort: upcoming ascending, past descending
    list = [...list].sort((a, b) => {
      const av = a.date + a.startTime;
      const bv = b.date + b.startTime;
      return tab === "past" ? bv.localeCompare(av) : av.localeCompare(bv);
    });
    return list;
  }, [bookings, tab, officeFilter, userFilter, kindFilter, q]);

  const kpis = useMemo(() => {
    const mine = bookings.filter((b) => b.userId === ME && b.status !== "cancelled");
    const mineUpcoming = mine.filter((b) => b.date >= TODAY).length;
    const minePast = mine.filter((b) => b.date < TODAY).length;
    const allUpcoming = bookings.filter(
      (b) => b.date >= TODAY && b.status !== "cancelled",
    ).length;
    return { mineUpcoming, minePast, allUpcoming };
  }, [bookings]);

  const userOptions = useMemo(() => {
    const ids = new Set(bookings.map((b) => b.userId));
    return [...ids]
      .map((id) => employeeById(id))
      .filter((e): e is NonNullable<typeof e> => !!e)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  const cancel = (b: Booking) => {
    cancelBooking(b.id);
    toast("Reservation cancelled", {
      description:
        b.resourceKind === "room"
          ? `${roomById(b.resourceId)?.name ?? "Room"} · ${b.date} ${b.startTime}–${b.endTime}`
          : `Seat ${seatById(b.resourceId)?.label ?? ""} · ${b.date}`,
      action: {
        label: "Undo",
        onClick: () => restoreBooking(b),
      },
    });
  };

  const reschedule = (b: Booking) => {
    setPrefill({
      officeId: b.officeId,
      resourceKind: b.resourceKind,
      resourceId: b.resourceId,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      title: b.title,
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1280px] mx-auto fade-in">
      <PageHeader
        title={<><span>Reservations</span><NewBadge /></>}
        description="Your upcoming and past workspace bookings. Cancel, reschedule, or spin up a new one."
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/offices"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 press-scale"
            >
              Offices overview <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Button size="sm" onClick={() => setPrefill({})}>
              <Plus className="h-4 w-4 mr-1.5" /> New reservation
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard icon={<CalendarClock className="h-4 w-4" />} label="Your upcoming" value={kpis.mineUpcoming} accent />
        <KpiCard icon={<History className="h-4 w-4" />} label="Your past" value={kpis.minePast} />
        {IS_ADMIN && (
          <KpiCard icon={<ShieldCheck className="h-4 w-4" />} label="All upcoming" value={kpis.allUpcoming} />
        )}
        <KpiCard icon={<DoorOpen className="h-4 w-4" />} label="Active spaces" value={offices.length} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="upcoming"><CalendarClock className="h-3.5 w-3.5 mr-1.5" />Upcoming</TabsTrigger>
          <TabsTrigger value="past"><History className="h-3.5 w-3.5 mr-1.5" />Past</TabsTrigger>
          {IS_ADMIN && (
            <TabsTrigger value="all"><ShieldCheck className="h-3.5 w-3.5 mr-1.5" />All (admin)</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card className="p-3 mb-3 flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="relative flex-1 min-w-[220px]">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title, room, seat, person…"
                className="h-9"
              />
            </div>
            <Select value={officeFilter} onValueChange={setOffice}>
              <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All offices</SelectItem>
                {offices.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.emoji} {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={kindFilter} onValueChange={setKind}>
              <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Rooms + seats</SelectItem>
                <SelectItem value="room">Rooms only</SelectItem>
                <SelectItem value="seat">Seats only</SelectItem>
              </SelectContent>
            </Select>
            {tab === "all" && IS_ADMIN && (
              <Select value={userFilter} onValueChange={setUser}>
                <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  {userOptions.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Card>

          {scoped.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="h-6 w-6" />}
              title={
                tab === "upcoming"
                  ? "No upcoming reservations"
                  : tab === "past"
                    ? "No past reservations match"
                    : "No reservations match"
              }
              description={
                tab === "upcoming"
                  ? "Book a room or desk to get started."
                  : "Try widening the filters."
              }
              action={
                tab === "upcoming" ? (
                  <Button size="sm" onClick={() => setPrefill({})}>
                    <Plus className="h-4 w-4 mr-1.5" /> New reservation
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Card className="p-0 overflow-hidden">
              <ul className="divide-y stagger-in">
                {scoped.map((b) => (
                  <ReservationRow
                    key={b.id}
                    b={b}
                    showOwner={tab === "all"}
                    isPast={b.date < TODAY}
                    canMutate={b.userId === ME || (tab === "all" && IS_ADMIN)}
                    onCancel={() => setToCancel(b)}
                    onReschedule={() => reschedule(b)}
                  />
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <BookingDialog
        open={!!prefill}
        onClose={() => setPrefill(null)}
        prefill={prefill ?? undefined}
      />

      <AlertDialog open={!!toCancel} onOpenChange={(o) => !o && setToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this reservation?</AlertDialogTitle>
            <AlertDialogDescription>
              {toCancel && (
                <span>
                  {toCancel.resourceKind === "room"
                    ? roomById(toCancel.resourceId)?.name
                    : `Seat ${seatById(toCancel.resourceId)?.label}`}
                  {" · "}
                  {toCancel.date} {toCancel.startTime}–{toCancel.endTime}. You can undo from the toast.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toCancel) cancel(toCancel);
                setToCancel(null);
              }}
            >
              Cancel reservation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function KpiCard({
  icon, label, value, accent,
}: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return (
    <Card className={cn("p-4", accent && "iridescent-border")}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {icon}{label}
      </div>
      <div className="text-2xl font-display tabular-nums mt-1">{value}</div>
    </Card>
  );
}

function ReservationRow({
  b, showOwner, isPast, canMutate, onCancel, onReschedule,
}: {
  b: Booking;
  showOwner: boolean;
  isPast: boolean;
  canMutate: boolean;
  onCancel: () => void;
  onReschedule: () => void;
}) {
  const office = officeById(b.officeId);
  const room = b.resourceKind === "room" ? roomById(b.resourceId) : null;
  const seat = b.resourceKind === "seat" ? seatById(b.resourceId) : null;
  const owner = employeeById(b.userId);
  const mins = minutesBetween(b.startTime, b.endTime);
  const attendees = b.attendees
    .map((id) => employeeById(id))
    .filter((e): e is NonNullable<typeof e> => !!e);

  return (
    <li className={cn("px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors", isPast && "opacity-75")}>
      <div
        className="relative h-10 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: room?.color ?? office?.color ?? "oklch(0.6 0.1 260)" }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {b.resourceKind === "room" ? (
            <DoorOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          ) : (
            <Armchair className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
          <div className="text-sm font-medium truncate">
            {b.title ?? (room ? `Meeting · ${room.name}` : `Desk · ${seat?.label ?? ""}`)}
          </div>
          {b.recurring && (
            <span title={`Recurring ${b.recurring}`} className="text-muted-foreground">
              <Repeat className="h-3 w-3" />
            </span>
          )}
          <span
            className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: office ? `${office.color.replace(")", " / 0.15)")}` : undefined,
              color: office?.color,
            }}
          >
            {office?.emoji} {office?.name ?? "—"}
          </span>
          {b.status === "tentative" && (
            <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-warning/15 text-warning">
              tentative
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
          <span className="font-mono tabular-nums">{b.date}</span>
          <span className="font-mono tabular-nums">{b.startTime}–{b.endTime}</span>
          <span>· {mins}m</span>
          {room && <span>· {room.kind} · cap {room.capacity}</span>}
          {seat && <span>· zone {seat.zone}</span>}
        </div>
      </div>

      {showOwner && owner && (
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <Avatar initials={owner.initials} color={owner.avatarColor} size={22} />
          <span className="text-xs text-muted-foreground">{owner.name.split(" ")[0]}</span>
        </div>
      )}

      {attendees.length > 0 && (
        <div className="hidden md:flex -space-x-1.5 shrink-0">
          {attendees.slice(0, 4).map((a) => (
            <div
              key={a.id}
              title={a.name}
              className="ring-2 ring-background rounded-full"
            >
              <Avatar initials={a.initials} color={a.avatarColor} size={22} />
            </div>
          ))}
          {attendees.length > 4 && (
            <span className="grid place-items-center h-[22px] w-[22px] rounded-full bg-muted text-[10px] ring-2 ring-background">
              +{attendees.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 shrink-0">
        {b.resourceKind === "room" && room && office && (
          <Link
            to="/offices/$officeId/$roomId"
            params={{ officeId: office.id, roomId: room.id }}
            search={{ date: b.date }}
            className="h-8 w-8 rounded-md grid place-items-center hover:bg-muted text-muted-foreground press-scale"
            title="Open room"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
        {canMutate && !isPast && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onReschedule}
            title="Reschedule"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        {canMutate && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={onCancel}
            title={isPast ? "Delete entry" : "Cancel"}
          >
            {isPast ? <Trash2 className="h-3.5 w-3.5" /> : <X className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </li>
  );
}
