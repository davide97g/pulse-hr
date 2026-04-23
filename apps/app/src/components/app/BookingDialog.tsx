import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  Users as UsersIcon,
  AlertTriangle,
  CheckCircle2,
  Building2,
  DoorOpen,
  Armchair,
  Wand2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pulse-hr/ui/primitives/dialog";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import { useBookings } from "@/components/app/BookingsContext";
import { RoomAmenities, SeatFeatures } from "@/components/app/AmenityIcons";
import {
  offices,
  officeById,
  roomsByOffice,
  roomById,
  seatsByOffice,
  seatById,
  closureFor,
  officeLocalDate,
  minutesBetween,
  type Booking,
} from "@/lib/offices";
import { employees, employeeById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ME = "e1";

export interface BookingDialogPrefill {
  officeId?: string;
  resourceKind?: "room" | "seat";
  resourceId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  title?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  prefill?: BookingDialogPrefill;
}

const HALF_HOURS = (() => {
  const list: string[] = [];
  for (let h = 7; h <= 21; h++) {
    list.push(`${String(h).padStart(2, "0")}:00`);
    list.push(`${String(h).padStart(2, "0")}:30`);
  }
  return list;
})();

export function BookingDialog({ open, onClose, prefill }: Props) {
  const { addBooking, findConflictFor } = useBookings();

  const [officeId, setOfficeId] = useState<string>(prefill?.officeId ?? offices[0].id);
  const [kind, setKind] = useState<"room" | "seat">(prefill?.resourceKind ?? "room");
  const [resourceId, setResourceId] = useState<string>(prefill?.resourceId ?? "");
  const [date, setDate] = useState<string>(
    prefill?.date ?? officeLocalDate(officeById(prefill?.officeId ?? offices[0].id)!),
  );
  const [startTime, setStartTime] = useState<string>(prefill?.startTime ?? "09:00");
  const [endTime, setEndTime] = useState<string>(prefill?.endTime ?? "10:00");
  const [title, setTitle] = useState<string>(prefill?.title ?? "");
  const [attendees, setAttendees] = useState<string[]>([ME]);

  // Reset when opened with new prefill
  useEffect(() => {
    if (!open) return;
    const o = prefill?.officeId ?? offices[0].id;
    setOfficeId(o);
    setKind(prefill?.resourceKind ?? "room");
    setResourceId(
      prefill?.resourceId ??
        (prefill?.resourceKind === "seat"
          ? (seatsByOffice(o)[0]?.id ?? "")
          : (roomsByOffice(o)[0]?.id ?? "")),
    );
    setDate(prefill?.date ?? officeLocalDate(officeById(o)!));
    setStartTime(prefill?.startTime ?? "09:00");
    setEndTime(prefill?.endTime ?? "10:00");
    setTitle(prefill?.title ?? "");
    setAttendees([ME]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // When office changes, default resource
  useEffect(() => {
    if (!open) return;
    if (kind === "room") {
      const first = roomsByOffice(officeId)[0];
      if (first && !roomsByOffice(officeId).some((r) => r.id === resourceId))
        setResourceId(first.id);
    } else {
      const first = seatsByOffice(officeId)[0];
      if (first && !seatsByOffice(officeId).some((s) => s.id === resourceId))
        setResourceId(first.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officeId, kind, open]);

  const office = officeById(officeId);
  const room = kind === "room" ? roomById(resourceId) : null;
  const seat = kind === "seat" ? seatById(resourceId) : null;

  const closure = useMemo(() => {
    if (!office) return null;
    const oc = closureFor("office", office.id, date);
    if (oc) return oc;
    if (kind === "room" && resourceId) {
      return closureFor("room", resourceId, date);
    }
    return null;
  }, [office, kind, resourceId, date]);

  const conflict = useMemo(() => {
    if (!resourceId || !date || !startTime || !endTime) return null;
    return findConflictFor(resourceId, date, startTime, endTime);
  }, [findConflictFor, resourceId, date, startTime, endTime]);

  const duration = minutesBetween(startTime, endTime);
  const invalidRange = duration <= 0;
  const canSubmit = !!resourceId && !!office && !invalidRange && !closure && !conflict;

  const submit = () => {
    if (!canSubmit || !office) return;
    const { booking } = addBooking({
      resourceId,
      resourceKind: kind,
      userId: ME,
      officeId,
      date,
      startTime,
      endTime,
      title:
        title.trim() || (kind === "room" ? `Meeting · ${office.city}` : `Desk · ${office.city}`),
      attendees,
      status: "confirmed",
    });
    const resourceName =
      kind === "room" ? `${office.name} · ${room?.name}` : `${office.name} · seat ${seat?.label}`;
    toast.success("Booked", {
      description: `${resourceName} · ${date} · ${booking.startTime}–${booking.endTime}`,
      icon: <CheckCircle2 className="h-4 w-4" />,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[560px] rounded-xl">
        <div>
          <DialogHeader className="mb-4">
            <DialogTitle className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-primary/10 text-primary grid place-items-center">
                <Wand2 className="h-4 w-4" />
              </div>
              Book a workspace
            </DialogTitle>
            <DialogDescription className="text-[12px]">
              Rooms, seats, and events. Times shown in office-local timezone.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider">Office</Label>
              <Select value={officeId} onValueChange={setOfficeId}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {offices.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      <span className="inline-flex items-center gap-2">
                        <span>{o.emoji}</span>
                        <span>{o.name}</span>
                        <span className="text-[10px] text-muted-foreground">· {o.timezone}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 inline-flex rounded-md border p-0.5 bg-background w-full">
              <button
                type="button"
                onClick={() => setKind("room")}
                className={cn(
                  "flex-1 h-8 text-xs rounded-sm inline-flex items-center justify-center gap-1.5 press-scale",
                  kind === "room"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <DoorOpen className="h-3.5 w-3.5" /> Room
              </button>
              <button
                type="button"
                onClick={() => setKind("seat")}
                className={cn(
                  "flex-1 h-8 text-xs rounded-sm inline-flex items-center justify-center gap-1.5 press-scale",
                  kind === "seat"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Armchair className="h-3.5 w-3.5" /> Seat
              </button>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider">
                {kind === "room" ? "Room" : "Seat"}
              </Label>
              <Select value={resourceId} onValueChange={setResourceId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {kind === "room"
                    ? roomsByOffice(officeId).map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          <span className="inline-flex items-center gap-2 min-w-0">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: r.color }}
                            />
                            <span className="truncate">{r.name}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              · cap {r.capacity}
                            </span>
                            <RoomAmenities room={r} size="xs" className="ml-1" />
                          </span>
                        </SelectItem>
                      ))
                    : seatsByOffice(officeId).map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="inline-flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[11px] shrink-0">{s.label}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              · zone {s.zone}
                            </span>
                            <SeatFeatures seat={s} size="xs" className="ml-1" />
                          </span>
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider">Date</Label>
              <div className="relative">
                <CalendarDays className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider">Duration</Label>
              <div className="text-xs text-muted-foreground h-9 flex items-center tabular-nums">
                {invalidRange ? "—" : `${Math.round(duration)} min`}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider">Start</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="h-9">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HALF_HOURS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider">End</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="h-9">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HALF_HOURS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {kind === "room" && (
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Sprint planning, 1:1, call with partner…"
                  className="h-9"
                />
              </div>
            )}

            {kind === "room" && (
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <UsersIcon className="h-3 w-3" /> Attendees ({attendees.length})
                </Label>
                <div className="flex flex-wrap gap-1.5 max-h-[90px] overflow-y-auto scrollbar-thin p-1 border rounded-md">
                  {employees.map((e) => {
                    const checked = attendees.includes(e.id);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() =>
                          setAttendees((prev) =>
                            checked ? prev.filter((x) => x !== e.id) : [...prev, e.id],
                          )
                        }
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border press-scale",
                          checked ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted",
                        )}
                      >
                        <span
                          className="h-4 w-4 rounded-full grid place-items-center text-[8px] font-medium text-white"
                          style={{ backgroundColor: e.avatarColor }}
                        >
                          {e.initials}
                        </span>
                        {e.name.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {closure && (
              <div className="col-span-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-[11px] flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-destructive">Closed — {closure.kind}</div>
                  <div className="text-muted-foreground">
                    {closure.title}
                    {closure.note ? ` · ${closure.note}` : ""}
                  </div>
                </div>
              </div>
            )}

            {!closure && conflict && (
              <div className="col-span-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-[11px] flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-destructive">
                    Conflicts with “{conflict.title ?? "existing booking"}”
                  </div>
                  <div className="text-muted-foreground">
                    {employeeById(conflict.userId)?.name.split(" ")[0] ?? "Someone"} ·{" "}
                    {conflict.startTime}–{conflict.endTime}
                  </div>
                </div>
              </div>
            )}

            {!closure && !conflict && !invalidRange && (
              <div className="col-span-2 rounded-md border border-success/30 bg-success/5 p-2.5 text-[11px] flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-success">Slot is clear</div>
                  <div className="text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {office?.emoji} {office?.name}
                    </span>
                    {office && ` · ${office.timezone}`}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-5">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!canSubmit}>
              {kind === "room" ? "Book room" : "Book seat"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
