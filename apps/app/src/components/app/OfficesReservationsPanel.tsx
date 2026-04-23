import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  CalendarClock,
  History,
  ShieldCheck,
  DoorOpen,
  Armchair,
  Plus,
  Trash2,
  Pencil,
  Filter,
  ArrowUpRight,
  X,
  Repeat,
} from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pulse-hr/ui/primitives/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@pulse-hr/ui/primitives/alert-dialog";
import { Avatar } from "@/components/app/AppShell";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { BookingDialog, type BookingDialogPrefill } from "@/components/app/BookingDialog";
import { useBookings } from "@/components/app/BookingsContext";
import {
  offices,
  officeById,
  roomById,
  seatById,
  minutesBetween,
  type Booking,
} from "@/lib/offices";
import { employeeById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ME = "e1";
const IS_ADMIN = true;
const TODAY = "2026-04-19";

type ResTab = "upcoming" | "past" | "all";

export function OfficesReservationsPanel() {
  const nav = useNavigate({ from: "/offices" });
  const search = useSearch({ from: "/offices" }) as {
    rtab?: ResTab;
    roffice?: string;
    ruser?: string;
    rkind?: "room" | "seat";
    rq?: string;
  };
  const tab: ResTab = search.rtab ?? "upcoming";
  const officeFilter = search.roffice ?? "all";
  const userFilter = search.ruser ?? "all";
  const kindFilter = search.rkind ?? "all";
  const q = search.rq ?? "";

  const setTab = (t: string) =>
    nav({ search: (prev) => ({ ...prev, rtab: t === "upcoming" ? undefined : (t as ResTab) }) });
  const setOffice = (v: string) =>
    nav({ search: (prev) => ({ ...prev, roffice: v === "all" ? undefined : v }) });
  const setUser = (v: string) =>
    nav({ search: (prev) => ({ ...prev, ruser: v === "all" ? undefined : v }) });
  const setKind = (v: string) =>
    nav({
      search: (prev) => ({ ...prev, rkind: v === "all" ? undefined : (v as "room" | "seat") }),
    });
  const setQ = (v: string) => nav({ search: (prev) => ({ ...prev, rq: v || undefined }) });

  const { bookings, cancelBooking, restoreBooking } = useBookings();
  const [prefill, setPrefill] = useState<BookingDialogPrefill | null>(null);
  const [toCancel, setToCancel] = useState<Booking | null>(null);

  const scoped = useMemo(() => {
    let list = bookings.filter((b) => b.status !== "cancelled");
    if (tab !== "all") list = list.filter((b) => b.userId === ME);
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
        const room =
          b.resourceKind === "room" ? (roomById(b.resourceId)?.name.toLowerCase() ?? "") : "";
        const seat =
          b.resourceKind === "seat" ? (seatById(b.resourceId)?.label.toLowerCase() ?? "") : "";
        return (
          title.includes(needle) ||
          owner.includes(needle) ||
          room.includes(needle) ||
          seat.includes(needle)
        );
      });
    }
    list = [...list].sort((a, b) => {
      const av = a.date + a.startTime;
      const bv = b.date + b.startTime;
      return tab === "past" ? bv.localeCompare(av) : av.localeCompare(bv);
    });
    return list;
  }, [bookings, tab, officeFilter, userFilter, kindFilter, q]);

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
      action: { label: "Undo", onClick: () => restoreBooking(b) },
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
    <div className="space-y-3">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past">
            <History className="h-3.5 w-3.5 mr-1.5" />
            Past
          </TabsTrigger>
          {IS_ADMIN && (
            <TabsTrigger value="all">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              All (admin)
            </TabsTrigger>
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
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue />
              </SelectTrigger>
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
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Rooms + seats</SelectItem>
                <SelectItem value="room">Rooms only</SelectItem>
                <SelectItem value="seat">Seats only</SelectItem>
              </SelectContent>
            </Select>
            {tab === "all" && IS_ADMIN && (
              <Select value={userFilter} onValueChange={setUser}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
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
            <Button size="sm" onClick={() => setPrefill({})}>
              <Plus className="h-4 w-4 mr-1.5" /> New
            </Button>
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
                  {toCancel.date} {toCancel.startTime}–{toCancel.endTime}. You can undo from the
                  toast.
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

function ReservationRow({
  b,
  showOwner,
  isPast,
  canMutate,
  onCancel,
  onReschedule,
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
    <li
      className={cn(
        "px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors",
        isPast && "opacity-75",
      )}
    >
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
          <span className="font-mono tabular-nums">
            {b.startTime}–{b.endTime}
          </span>
          <span>· {mins}m</span>
          {room && (
            <span>
              · {room.kind} · cap {room.capacity}
            </span>
          )}
          {seat && <span>· zone {seat.zone}</span>}
        </div>
      </div>

      {showOwner && owner && (
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <Avatar
            initials={owner.initials}
            color={owner.avatarColor}
            size={22}
            employeeId={owner.id}
          />
          <span className="text-xs text-muted-foreground">{owner.name.split(" ")[0]}</span>
        </div>
      )}

      {attendees.length > 0 && (
        <div className="hidden md:flex -space-x-1.5 shrink-0">
          {attendees.slice(0, 4).map((a) => (
            <div key={a.id} title={a.name} className="ring-2 ring-background rounded-full">
              <Avatar initials={a.initials} color={a.avatarColor} size={22} employeeId={a.id} />
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
