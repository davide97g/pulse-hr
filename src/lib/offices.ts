// ── Types ──────────────────────────────────────────────────────────────
export type OfficeTZ = string; // IANA, e.g. "Europe/Rome"

export interface Office {
  id: string;
  name: string;
  city: string;
  country: string;
  timezone: OfficeTZ;
  /** Total seat capacity (not counting room seats). */
  seatCapacity: number;
  /** 24h clock for local-office time. */
  openingHours: { open: string; close: string };
  color: string; // oklch
  emoji: string;
  address: string;
  photo?: string;
}

export type RoomKind = "meeting" | "phone" | "focus" | "event";
export type Amenity =
  | "tv" | "whiteboard" | "speakerphone" | "monitor" | "ac"
  | "standing-desk" | "videoconf" | "projector";

export interface Room {
  id: string;
  officeId: string;
  name: string;
  kind: RoomKind;
  capacity: number;
  amenities: Amenity[];
  color: string; // oklch
}

export interface Seat {
  id: string;
  officeId: string;
  zone: string; // e.g. "A", "B", "Quiet"
  label: string; // e.g. "A-12"
  wifi: boolean;
  monitor: boolean;
  standing: boolean;
}

export type BookingStatus = "confirmed" | "tentative" | "cancelled";

export interface Booking {
  id: string;
  resourceId: string;
  resourceKind: "room" | "seat";
  userId: string;
  officeId: string;
  /** YYYY-MM-DD in office-local timezone. */
  date: string;
  /** HH:mm in office-local timezone. */
  startTime: string;
  endTime: string;
  title?: string;
  attendees: string[];
  status: BookingStatus;
  recurring?: "weekly" | "daily";
}

export type ClosureKind = "maintenance" | "holiday" | "event";

export interface Closure {
  id: string;
  scopeKind: "office" | "room";
  scopeId: string;
  /** Inclusive range; single-day when from === to. */
  from: string;
  to: string;
  kind: ClosureKind;
  title: string;
  note?: string;
}

// ── Seed data (today = 2026-04-18) ─────────────────────────────────────
export const offices: Office[] = [
  {
    id: "of-mil",
    name: "Milan HQ",
    city: "Milan",
    country: "Italy",
    timezone: "Europe/Rome",
    seatCapacity: 32,
    openingHours: { open: "08:00", close: "20:00" },
    color: "oklch(0.65 0.18 340)",
    emoji: "🇮🇹",
    address: "Via Tortona 37, Milan",
  },
  {
    id: "of-ber",
    name: "Berlin Studio",
    city: "Berlin",
    country: "Germany",
    timezone: "Europe/Berlin",
    seatCapacity: 24,
    openingHours: { open: "08:00", close: "19:00" },
    color: "oklch(0.6 0.16 220)",
    emoji: "🇩🇪",
    address: "Torstraße 171, Berlin",
  },
  {
    id: "of-sf",
    name: "San Francisco Loft",
    city: "San Francisco",
    country: "USA",
    timezone: "America/Los_Angeles",
    seatCapacity: 20,
    openingHours: { open: "08:00", close: "20:00" },
    color: "oklch(0.7 0.15 30)",
    emoji: "🇺🇸",
    address: "Folsom St 500, SF",
  },
  {
    id: "of-rem",
    name: "Remote Hub · Lisbon",
    city: "Lisbon",
    country: "Portugal",
    timezone: "Europe/Lisbon",
    seatCapacity: 14,
    openingHours: { open: "09:00", close: "18:00" },
    color: "oklch(0.65 0.15 155)",
    emoji: "🇵🇹",
    address: "Rua do Alecrim 12, Lisbon",
  },
];

export const officeById = (id: string) => offices.find(o => o.id === id);

export const rooms: Room[] = [
  // Milan
  { id: "rm-mil-atlas",  officeId: "of-mil", name: "Atlas",    kind: "meeting", capacity: 10, amenities: ["tv","whiteboard","videoconf","speakerphone"], color: "oklch(0.7 0.15 30)" },
  { id: "rm-mil-helix",  officeId: "of-mil", name: "Helix",    kind: "meeting", capacity: 6,  amenities: ["tv","whiteboard","videoconf"], color: "oklch(0.72 0.17 295)" },
  { id: "rm-mil-ion",    officeId: "of-mil", name: "Ion",      kind: "phone",   capacity: 1,  amenities: ["monitor","ac"], color: "oklch(0.65 0.18 340)" },
  { id: "rm-mil-nova",   officeId: "of-mil", name: "Nova",     kind: "phone",   capacity: 1,  amenities: ["monitor"], color: "oklch(0.6 0.16 220)" },
  { id: "rm-mil-aula",   officeId: "of-mil", name: "Aula",     kind: "event",   capacity: 40, amenities: ["tv","projector","speakerphone","ac"], color: "oklch(0.78 0.18 85)" },
  { id: "rm-mil-focus",  officeId: "of-mil", name: "Focus Pod", kind: "focus",   capacity: 2, amenities: ["monitor","standing-desk","ac"], color: "oklch(0.65 0.15 155)" },

  // Berlin
  { id: "rm-ber-kepler", officeId: "of-ber", name: "Kepler",   kind: "meeting", capacity: 8,  amenities: ["tv","whiteboard","videoconf"], color: "oklch(0.7 0.15 30)" },
  { id: "rm-ber-bauhaus",officeId: "of-ber", name: "Bauhaus",  kind: "meeting", capacity: 12, amenities: ["tv","whiteboard","speakerphone","videoconf"], color: "oklch(0.72 0.17 295)" },
  { id: "rm-ber-booth",  officeId: "of-ber", name: "Booth",    kind: "phone",   capacity: 1,  amenities: ["monitor"], color: "oklch(0.65 0.18 340)" },
  { id: "rm-ber-lab",    officeId: "of-ber", name: "Lab",      kind: "focus",   capacity: 4,  amenities: ["monitor","whiteboard"], color: "oklch(0.65 0.15 155)" },

  // SF
  { id: "rm-sf-golden",  officeId: "of-sf",  name: "Golden",   kind: "meeting", capacity: 10, amenities: ["tv","whiteboard","videoconf","speakerphone"], color: "oklch(0.78 0.18 85)" },
  { id: "rm-sf-bay",     officeId: "of-sf",  name: "Bay",      kind: "meeting", capacity: 6,  amenities: ["tv","whiteboard"], color: "oklch(0.6 0.16 220)" },
  { id: "rm-sf-pod-a",   officeId: "of-sf",  name: "Pod A",    kind: "phone",   capacity: 1,  amenities: ["monitor"], color: "oklch(0.65 0.18 340)" },
  { id: "rm-sf-pod-b",   officeId: "of-sf",  name: "Pod B",    kind: "phone",   capacity: 1,  amenities: ["monitor"], color: "oklch(0.65 0.18 340)" },

  // Remote Hub
  { id: "rm-rem-sala",   officeId: "of-rem", name: "Sala Verde", kind: "meeting", capacity: 6, amenities: ["tv","whiteboard"], color: "oklch(0.65 0.15 155)" },
  { id: "rm-rem-booth",  officeId: "of-rem", name: "Booth",    kind: "phone",   capacity: 1,  amenities: ["monitor"], color: "oklch(0.65 0.18 340)" },
  { id: "rm-rem-sun",    officeId: "of-rem", name: "Sun Room", kind: "event",   capacity: 20, amenities: ["tv","projector","speakerphone"], color: "oklch(0.78 0.18 85)" },
];

export const roomById = (id: string) => rooms.find(r => r.id === id);
export const roomsByOffice = (officeId: string) => rooms.filter(r => r.officeId === officeId);

/** Generate seats for every office based on capacity. */
function makeSeats(): Seat[] {
  const out: Seat[] = [];
  for (const o of offices) {
    const zones = ["A", "B", "Quiet"];
    for (let i = 0; i < o.seatCapacity; i++) {
      const zone = zones[Math.floor(i / Math.ceil(o.seatCapacity / zones.length))] ?? "A";
      const idx = (i % Math.ceil(o.seatCapacity / zones.length)) + 1;
      out.push({
        id: `st-${o.id}-${zone}-${idx}`,
        officeId: o.id,
        zone,
        label: `${zone}-${String(idx).padStart(2, "0")}`,
        wifi: true,
        monitor: i % 3 !== 0,
        standing: zone === "Quiet" && i % 4 === 0,
      });
    }
  }
  return out;
}
export const seats: Seat[] = makeSeats();

export const seatById = (id: string) => seats.find(s => s.id === id);
export const seatsByOffice = (officeId: string) => seats.filter(s => s.officeId === officeId);

// ── Home-office assignment per employee (mock) ────────────────────────
export const HOME_OFFICE: Record<string, string> = {
  e1: "of-mil",
  e2: "of-mil",
  e3: "of-ber",
  e4: "of-ber",
  e5: "of-rem",
  e6: "of-sf",
  e7: "of-mil",
  e8: "of-ber",
  e9: "of-mil",
  e10: "of-sf",
  e11: "of-ber",
  e12: "of-rem",
};
export function homeOfficeFor(userId: string): Office | null {
  const id = HOME_OFFICE[userId];
  return id ? (officeById(id) ?? null) : null;
}

// ── Bookings (next 14 days from 2026-04-18) ──────────────────────────
function addDays(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
const TODAY = "2026-04-18";

export const bookings: Booking[] = [
  // ── Milan room bookings ───────────────────────────────────────────
  { id: "bk-1",  resourceId: "rm-mil-atlas",  resourceKind: "room", userId: "e1", officeId: "of-mil", date: TODAY,               startTime: "09:00", endTime: "10:00", title: "Platform standup", attendees: ["e1","e9","e4"], status: "confirmed", recurring: "daily" },
  { id: "bk-2",  resourceId: "rm-mil-atlas",  resourceKind: "room", userId: "e3", officeId: "of-mil", date: TODAY,               startTime: "10:30", endTime: "12:00", title: "Cutover rehearsal", attendees: ["e1","e9"], status: "confirmed" },
  { id: "bk-3",  resourceId: "rm-mil-helix",  resourceKind: "room", userId: "e2", officeId: "of-mil", date: TODAY,               startTime: "14:00", endTime: "15:00", title: "Design critique", attendees: ["e2","e1"], status: "confirmed" },
  { id: "bk-4",  resourceId: "rm-mil-aula",   resourceKind: "room", userId: "e3", officeId: "of-mil", date: TODAY,               startTime: "16:00", endTime: "17:30", title: "All-hands", attendees: ["e1","e2","e3","e9","e4"], status: "confirmed" },
  { id: "bk-5",  resourceId: "rm-mil-ion",    resourceKind: "room", userId: "e9", officeId: "of-mil", date: TODAY,               startTime: "11:00", endTime: "11:30", title: "Call w/ vendor", attendees: ["e9"], status: "confirmed" },
  { id: "bk-6",  resourceId: "rm-mil-atlas",  resourceKind: "room", userId: "e1", officeId: "of-mil", date: addDays(TODAY, 1),   startTime: "09:00", endTime: "10:00", title: "Platform standup", attendees: ["e1","e9","e4"], status: "confirmed", recurring: "daily" },
  { id: "bk-7",  resourceId: "rm-mil-helix",  resourceKind: "room", userId: "e7", officeId: "of-mil", date: addDays(TODAY, 1),   startTime: "11:00", endTime: "12:00", title: "Roadmap review", attendees: ["e7","e1"], status: "confirmed" },
  { id: "bk-8",  resourceId: "rm-mil-focus",  resourceKind: "room", userId: "e9", officeId: "of-mil", date: addDays(TODAY, 2),   startTime: "10:00", endTime: "12:00", title: "Deep work", attendees: ["e9"], status: "confirmed" },
  { id: "bk-9",  resourceId: "rm-mil-aula",   resourceKind: "room", userId: "e3", officeId: "of-mil", date: addDays(TODAY, 4),   startTime: "09:30", endTime: "12:00", title: "Design town hall", attendees: ["e2","e3","e8","e12"], status: "tentative" },

  // ── Milan seat bookings ───────────────────────────────────────────
  { id: "bk-10", resourceId: "st-of-mil-A-01", resourceKind: "seat", userId: "e1", officeId: "of-mil", date: TODAY,             startTime: "09:00", endTime: "18:00", attendees: [], status: "confirmed" },
  { id: "bk-11", resourceId: "st-of-mil-A-02", resourceKind: "seat", userId: "e9", officeId: "of-mil", date: TODAY,             startTime: "09:00", endTime: "18:00", attendees: [], status: "confirmed" },
  { id: "bk-12", resourceId: "st-of-mil-A-03", resourceKind: "seat", userId: "e2", officeId: "of-mil", date: TODAY,             startTime: "09:00", endTime: "18:00", attendees: [], status: "confirmed" },
  { id: "bk-13", resourceId: "st-of-mil-B-01", resourceKind: "seat", userId: "e3", officeId: "of-mil", date: TODAY,             startTime: "09:00", endTime: "18:00", attendees: [], status: "confirmed" },
  { id: "bk-14", resourceId: "st-of-mil-B-02", resourceKind: "seat", userId: "e7", officeId: "of-mil", date: TODAY,             startTime: "09:00", endTime: "18:00", attendees: [], status: "confirmed" },
  { id: "bk-15", resourceId: "st-of-mil-Quiet-01", resourceKind: "seat", userId: "e4", officeId: "of-mil", date: TODAY,         startTime: "09:00", endTime: "18:00", attendees: [], status: "confirmed" },
  { id: "bk-16", resourceId: "st-of-mil-A-04", resourceKind: "seat", userId: "e1", officeId: "of-mil", date: addDays(TODAY, 1), startTime: "09:00", endTime: "18:00", attendees: [], status: "confirmed", recurring: "weekly" },
  { id: "bk-17", resourceId: "st-of-mil-A-05", resourceKind: "seat", userId: "e9", officeId: "of-mil", date: addDays(TODAY, 1), startTime: "09:00", endTime: "18:00", attendees: [], status: "confirmed" },
  { id: "bk-18", resourceId: "st-of-mil-B-03", resourceKind: "seat", userId: "e2", officeId: "of-mil", date: addDays(TODAY, 1), startTime: "09:00", endTime: "18:00", attendees: [], status: "confirmed" },

  // ── Berlin room bookings ──────────────────────────────────────────
  { id: "bk-20", resourceId: "rm-ber-kepler", resourceKind: "room", userId: "e4",  officeId: "of-ber", date: TODAY,             startTime: "10:00", endTime: "11:00", title: "Interview — senior eng", attendees: ["e4","e3","e8"], status: "confirmed" },
  { id: "bk-21", resourceId: "rm-ber-kepler", resourceKind: "room", userId: "e4",  officeId: "of-ber", date: TODAY,             startTime: "14:00", endTime: "15:00", title: "Architecture review", attendees: ["e4","e1"], status: "confirmed" },
  { id: "bk-22", resourceId: "rm-ber-bauhaus",resourceKind: "room", userId: "e2",  officeId: "of-ber", date: TODAY,             startTime: "13:00", endTime: "14:30", title: "Brand review", attendees: ["e2","e12"], status: "confirmed" },
  { id: "bk-23", resourceId: "rm-ber-kepler", resourceKind: "room", userId: "e4",  officeId: "of-ber", date: addDays(TODAY, 3), startTime: "09:30", endTime: "10:30", title: "Sprint planning", attendees: ["e4","e1"], status: "confirmed" },
  { id: "bk-24", resourceId: "rm-ber-booth",  resourceKind: "room", userId: "e4",  officeId: "of-ber", date: TODAY,             startTime: "11:30", endTime: "12:00", title: "Call", attendees: ["e4"], status: "confirmed" },

  // ── Berlin seats ──────────────────────────────────────────────────
  { id: "bk-30", resourceId: "st-of-ber-A-01", resourceKind: "seat", userId: "e4", officeId: "of-ber", date: TODAY,             startTime: "09:00", endTime: "18:00", attendees: [], status: "confirmed" },
  { id: "bk-31", resourceId: "st-of-ber-A-02", resourceKind: "seat", userId: "e2", officeId: "of-ber", date: TODAY,             startTime: "09:00", endTime: "18:00", attendees: [], status: "confirmed" },
  { id: "bk-32", resourceId: "st-of-ber-B-01", resourceKind: "seat", userId: "e11", officeId: "of-ber", date: TODAY,            startTime: "09:00", endTime: "18:00", attendees: [], status: "confirmed" },

  // ── SF bookings ──────────────────────────────────────────────────
  { id: "bk-40", resourceId: "rm-sf-golden",  resourceKind: "room", userId: "e6",  officeId: "of-sf", date: TODAY,              startTime: "09:00", endTime: "10:00", title: "Pipeline review", attendees: ["e6"], status: "confirmed" },
  { id: "bk-41", resourceId: "rm-sf-golden",  resourceKind: "room", userId: "e6",  officeId: "of-sf", date: TODAY,              startTime: "14:00", endTime: "15:30", title: "Customer demo", attendees: ["e6","e10"], status: "confirmed" },
  { id: "bk-42", resourceId: "rm-sf-bay",     resourceKind: "room", userId: "e10", officeId: "of-sf", date: addDays(TODAY, 2),  startTime: "10:00", endTime: "11:00", title: "Data sync", attendees: ["e10","e6"], status: "confirmed" },
  { id: "bk-43", resourceId: "st-of-sf-A-01", resourceKind: "seat", userId: "e6",  officeId: "of-sf", date: TODAY,              startTime: "09:00", endTime: "17:00", attendees: [], status: "confirmed" },
  { id: "bk-44", resourceId: "st-of-sf-A-02", resourceKind: "seat", userId: "e10", officeId: "of-sf", date: TODAY,              startTime: "09:00", endTime: "17:00", attendees: [], status: "confirmed" },

  // ── Lisbon ──────────────────────────────────────────────────────
  { id: "bk-50", resourceId: "rm-rem-sala",   resourceKind: "room", userId: "e5", officeId: "of-rem", date: TODAY,              startTime: "10:00", endTime: "11:00", title: "Finance sync", attendees: ["e5"], status: "confirmed" },
  { id: "bk-51", resourceId: "st-of-rem-A-01",resourceKind: "seat", userId: "e5", officeId: "of-rem", date: TODAY,              startTime: "09:00", endTime: "17:00", attendees: [], status: "confirmed" },
];

// ── Closures (maintenance / holidays) ────────────────────────────────
export const closures: Closure[] = [
  // Milan — elevator maintenance on Apr 20
  { id: "cl-1", scopeKind: "office", scopeId: "of-mil", from: addDays(TODAY, 2), to: addDays(TODAY, 2), kind: "maintenance", title: "Elevator maintenance", note: "AM hours impacted." },
  // Milan — event blocks Aula Apr 22
  { id: "cl-2", scopeKind: "room", scopeId: "rm-mil-aula", from: addDays(TODAY, 4), to: addDays(TODAY, 4), kind: "event", title: "Partner summit", note: "Room fully booked by event team." },
  // SF — holiday Apr 25
  { id: "cl-3", scopeKind: "office", scopeId: "of-sf", from: addDays(TODAY, 7), to: addDays(TODAY, 7), kind: "holiday", title: "Patriots' Day (observed)" },
  // Berlin — deep clean weekend
  { id: "cl-4", scopeKind: "office", scopeId: "of-ber", from: addDays(TODAY, 8), to: addDays(TODAY, 9), kind: "maintenance", title: "Deep clean weekend", note: "Doors closed Sat–Sun." },
  // Lisbon — workshop Apr 24
  { id: "cl-5", scopeKind: "room", scopeId: "rm-rem-sun", from: addDays(TODAY, 6), to: addDays(TODAY, 6), kind: "event", title: "Customer workshop" },
];

// ── Helpers ──────────────────────────────────────────────────────────
export function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export function minutesOpen(office: Office): number {
  return minutesBetween(office.openingHours.open, office.openingHours.close);
}

export function isWeekend(date: string): boolean {
  const d = new Date(date + "T12:00:00");
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function closureFor(scopeKind: "office" | "room", scopeId: string, date: string): Closure | null {
  return closures.find(
    c => c.scopeKind === scopeKind && c.scopeId === scopeId && date >= c.from && date <= c.to,
  ) ?? null;
}

/** Utilization 0..1 for a room on a date. `null` when closed. */
export function roomUtilization(roomId: string, date: string): number | null {
  const r = roomById(roomId);
  if (!r) return null;
  const office = officeById(r.officeId);
  if (!office) return null;
  if (isWeekend(date)) return null;
  if (closureFor("office", r.officeId, date)) return null;
  if (closureFor("room", r.id, date)) return 1; // treat as fully closed → show as red/striped
  const dayBookings = bookings.filter(
    b => b.resourceId === r.id && b.date === date && b.status !== "cancelled",
  );
  const used = dayBookings.reduce((a, b) => a + minutesBetween(b.startTime, b.endTime), 0);
  return Math.min(1, used / minutesOpen(office));
}

/** Utilization 0..1 for an office on a date (rooms + seats blended). */
export function officeUtilization(officeId: string, date: string): number | null {
  const office = officeById(officeId);
  if (!office) return null;
  if (isWeekend(date)) return null;
  if (closureFor("office", officeId, date)) return null;
  const dayBookings = bookings.filter(
    b => b.officeId === officeId && b.date === date && b.status !== "cancelled",
  );
  // Seats: booked count / capacity.
  const seatBooked = new Set(dayBookings.filter(b => b.resourceKind === "seat").map(b => b.resourceId)).size;
  const seatFactor = office.seatCapacity > 0 ? seatBooked / office.seatCapacity : 0;

  // Rooms: avg utilization across rooms.
  const rs = roomsByOffice(officeId);
  const roomAvg =
    rs.length > 0
      ? rs.reduce((a, r) => a + (roomUtilization(r.id, date) ?? 0), 0) / rs.length
      : 0;

  // Blend 60% seats / 40% rooms — seats drive office density more.
  return Math.min(1, seatFactor * 0.6 + roomAvg * 0.4);
}

/** Seat utilization on a date = 1 if booked by anyone, else 0 (day-granularity). */
export function seatUtilization(seatId: string, date: string): number | null {
  const s = seatById(seatId);
  if (!s) return null;
  if (isWeekend(date)) return null;
  if (closureFor("office", s.officeId, date)) return null;
  return bookings.some(
    b => b.resourceId === seatId && b.date === date && b.status !== "cancelled",
  ) ? 1 : 0;
}

export function dateRange(fromISO: string, days: number): string[] {
  return Array.from({ length: days }, (_, i) => addDays(fromISO, i));
}

/** Color bucket for a utilization value. */
export function utilizationBucket(u: number | null): "closed" | "low" | "medium" | "high" | "full" {
  if (u === null) return "closed";
  if (u >= 1) return "full";
  if (u >= 0.75) return "high";
  if (u >= 0.4) return "medium";
  return "low";
}

export const BUCKET_COLOR: Record<ReturnType<typeof utilizationBucket>, string> = {
  closed:  "oklch(0.3 0.02 260 / 0.15)",
  low:     "oklch(0.78 0.18 130 / 0.55)",
  medium:  "oklch(0.78 0.18 85 / 0.7)",
  high:    "oklch(0.72 0.17 55 / 0.75)",
  full:    "oklch(0.65 0.2 25 / 0.8)",
};

/** Format a HH:mm from office-local to display string. */
export function formatTime(hhmm: string): string {
  return hhmm;
}

/** Render a Date object as HH:mm in a specific office timezone. */
export function officeLocalNow(office: Office, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: office.timezone,
  }).format(now);
}

/** Return office-local date string "YYYY-MM-DD" for a given Date. */
export function officeLocalDate(office: Office, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: office.timezone,
  }).formatToParts(now);
  const y = parts.find(p => p.type === "year")?.value;
  const m = parts.find(p => p.type === "month")?.value;
  const d = parts.find(p => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

/** Overlap check between a candidate slot and existing bookings for a resource. */
export function findConflict(
  resourceId: string,
  date: string,
  startTime: string,
  endTime: string,
  ignoreBookingId?: string,
  bookingList: Booking[] = bookings,
): Booking | null {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const s = toMin(startTime);
  const e = toMin(endTime);
  if (e <= s) return null;
  return (
    bookingList.find(b => {
      if (b.id === ignoreBookingId) return false;
      if (b.resourceId !== resourceId) return false;
      if (b.date !== date) return false;
      if (b.status === "cancelled") return false;
      const bs = toMin(b.startTime);
      const be = toMin(b.endTime);
      return s < be && bs < e;
    }) ?? null
  );
}

export function bookingsFor(resourceId: string, date: string, list: Booking[] = bookings): Booking[] {
  return list
    .filter(b => b.resourceId === resourceId && b.date === date && b.status !== "cancelled")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}
