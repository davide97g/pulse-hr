import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { DoorOpen, Repeat } from "lucide-react";
import { employeeById } from "@/lib/mock-data";
import {
  roomsByOffice, officeById, closureFor, type Booking,
} from "@/lib/offices";
import { useBookings } from "@/components/app/BookingsContext";
import { cn } from "@/lib/utils";

interface Props {
  officeId: string;
  date: string;
  /** Called when user clicks an empty slot to open booking dialog. */
  onBook: (opts: { roomId: string; startTime: string; endTime: string }) => void;
}

/** Gantt-style day view. x-axis = time 08:00–20:00, rows = rooms. */
export function RoomGantt({ officeId, date, onBook }: Props) {
  const office = officeById(officeId);
  const { bookings } = useBookings();
  const rms = useMemo(() => roomsByOffice(officeId), [officeId]);
  if (!office) return null;

  // Half-hour slots from openingHours
  const [oh, om] = office.openingHours.open.split(":").map(Number);
  const [ch, cm] = office.openingHours.close.split(":").map(Number);
  const startMin = oh * 60 + om;
  const endMin = ch * 60 + cm;
  const totalMin = endMin - startMin;
  const slotStep = 30;
  const slotCount = Math.ceil(totalMin / slotStep);
  const slots = Array.from({ length: slotCount }, (_, i) => {
    const m = startMin + i * slotStep;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  });

  const officeClosure = closureFor("office", officeId, date);

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <div
        className="relative grid gap-y-1 min-w-[720px]"
        style={{ gridTemplateColumns: `160px repeat(${slotCount}, minmax(24px, 1fr))` }}
      >
        {/* header */}
        <div />
        {slots.map((s, i) => (
          <div
            key={s}
            className={cn(
              "text-[9px] text-muted-foreground tabular-nums pb-1",
              i % 2 === 0 ? "text-foreground/60" : "opacity-40",
            )}
          >
            {i % 2 === 0 ? s : ""}
          </div>
        ))}

        {rms.map((room) => {
          const roomClosure = officeClosure ?? closureFor("room", room.id, date);
          const dayBookings: Booking[] = bookings
            .filter(
              (b) =>
                b.resourceId === room.id &&
                b.date === date &&
                b.status !== "cancelled",
            )
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={room.id} className="contents">
              <Link
                to="/offices/$officeId/$roomId"
                params={{ officeId, roomId: room.id }}
                search={{ date }}
                className="flex items-center gap-2 pr-3 min-w-0 hover:underline-offset-2 hover:underline press-scale"
                title={`Open ${room.name}`}
              >
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: room.color }} />
                <span className="text-sm font-medium truncate">{room.name}</span>
                <span className="text-[10px] text-muted-foreground">· cap {room.capacity}</span>
              </Link>

              {/* Track */}
              <div
                className="relative h-10 col-span-full rounded-md bg-muted/40 border"
                style={{
                  gridColumn: `2 / span ${slotCount}`,
                  marginLeft: 0,
                }}
              >
                {/* 30-min grid lines */}
                <div className="absolute inset-0 flex">
                  {slots.map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const nextMin = startMin + (i + 2) * slotStep; // default 1h
                        const endH = Math.min(endMin, nextMin);
                        const endLabel = `${String(Math.floor(endH / 60)).padStart(2, "0")}:${String(endH % 60).padStart(2, "0")}`;
                        onBook({ roomId: room.id, startTime: s, endTime: endLabel });
                      }}
                      className={cn(
                        "flex-1 border-r last:border-r-0 border-transparent hover:bg-primary/[0.06]",
                        i % 2 === 0 && "border-border/40",
                      )}
                      title={`Book ${room.name} at ${s}`}
                    />
                  ))}
                </div>

                {/* Closure overlay */}
                {roomClosure && (
                  <div
                    className="absolute inset-0 rounded-md"
                    title={`${roomClosure.kind} — ${roomClosure.title}`}
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent 0 6px, color-mix(in oklch, var(--destructive) 30%, transparent) 6px 12px)",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-destructive">
                      <DoorOpen className="h-3 w-3 mr-1" /> {roomClosure.title}
                    </div>
                  </div>
                )}

                {/* Bookings */}
                {dayBookings.map((b) => {
                  const [bh, bm] = b.startTime.split(":").map(Number);
                  const [eh, em] = b.endTime.split(":").map(Number);
                  const s = Math.max(0, bh * 60 + bm - startMin);
                  const e = Math.min(totalMin, eh * 60 + em - startMin);
                  const leftPct = (s / totalMin) * 100;
                  const widthPct = Math.max(((e - s) / totalMin) * 100, 2);
                  const owner = employeeById(b.userId);
                  return (
                    <div
                      key={b.id}
                      className="absolute top-1 bottom-1 rounded border text-[10px] overflow-hidden pop-in"
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        backgroundColor: `${room.color.replace(")", " / 0.18)")}`,
                        borderColor: `${room.color.replace(")", " / 0.6)")}`,
                      }}
                      title={`${b.title ?? "Busy"} · ${b.startTime}–${b.endTime}${owner ? " · " + owner.name : ""}`}
                    >
                      <div className="px-1.5 py-1 h-full flex items-center gap-1 min-w-0">
                        <span className="font-semibold truncate" style={{ color: room.color }}>
                          {b.title ?? "Busy"}
                        </span>
                        {b.recurring && <Repeat className="h-2.5 w-2.5 text-muted-foreground shrink-0" />}
                        <span className="text-muted-foreground tabular-nums shrink-0 ml-auto">
                          {b.startTime}–{b.endTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
