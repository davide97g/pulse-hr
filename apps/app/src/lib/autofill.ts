import {
  addDays,
  differenceInMinutes,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
  isWeekend,
} from "date-fns";
import {
  commesse,
  mockCalendarEvents,
  focusSessionsSeed,
  type CalendarEvent,
  type TimesheetEntry,
} from "./mock-data";
import { getWeekStartsOn } from "./timesheet";

export type AutofillSource = "calendar" | "focus" | "gap";

export interface AutofillDraft {
  tempId: string;
  date: string; // YYYY-MM-DD
  commessaId: string;
  hours: number;
  description: string;
  billable: boolean;
  source: AutofillSource;
  confidence: number; // 0..1
  eventIds?: string[]; // back-reference
}

// Hours attributable per event (duration in hours, rounded to .25)
function eventHours(ev: CalendarEvent): number {
  const start = parseISO(`${ev.date}T${ev.startedAt}`);
  const end = parseISO(`${ev.date}T${ev.endedAt}`);
  const mins = Math.max(15, differenceInMinutes(end, start));
  return Math.round((mins / 60) * 4) / 4;
}

// Resolve a commessaHint ("cm1", partial name) to a concrete commessa id.
function resolveCommessa(hint: string | undefined, fallbackId: string): string {
  if (!hint) return fallbackId;
  const direct = commesse.find((c) => c.id === hint);
  if (direct) return direct.id;
  const lower = hint.toLowerCase();
  const fuzzy = commesse.find(
    (c) => c.name.toLowerCase().includes(lower) || c.code.toLowerCase().includes(lower),
  );
  return fuzzy?.id ?? fallbackId;
}

export interface GenerateOptions {
  targetHoursPerDay?: number;
  defaultCommessaId?: string;
  existingEntries?: TimesheetEntry[];
  today?: Date;
}

/**
 * Produce a reviewable draft timesheet for the ISO week that `anchor` falls in.
 * Sources: synthetic calendar events, focus sessions, and gap-fillers up to
 * targetHoursPerDay. Never touches existing entries — caller can still dedupe.
 */
export function generateWeekDraft(
  anchor: Date,
  employeeId: string,
  opts: GenerateOptions = {},
): AutofillDraft[] {
  const target = opts.targetHoursPerDay ?? 8;
  const fallback = opts.defaultCommessaId ?? commesse[0].id;
  const wso = getWeekStartsOn();
  const weekStart = startOfWeek(anchor, { weekStartsOn: wso });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: wso });
  const existing = opts.existingEntries ?? [];

  const drafts: AutofillDraft[] = [];
  let uid = 0;
  const nextId = () => `af-${Date.now()}-${++uid}`;

  for (let d = weekStart; d <= weekEnd; d = addDays(d, 1)) {
    if (isWeekend(d)) continue;
    const iso = format(d, "yyyy-MM-dd");

    // Already have entries? Skip — we don't double-book.
    const already = existing.filter((e) => e.employeeId === employeeId && e.date === iso);
    if (already.length > 0) continue;

    // 1) Pull calendar events for the day
    const dayEvents = mockCalendarEvents.filter(
      (e) => e.date === iso && (!e.attendees || e.attendees.includes(employeeId)),
    );
    let booked = 0;
    for (const ev of dayEvents) {
      const hrs = eventHours(ev);
      const commessaId = resolveCommessa(ev.commessaHint, fallback);
      drafts.push({
        tempId: nextId(),
        date: iso,
        commessaId,
        hours: hrs,
        description: ev.title,
        billable: commessaId !== "cm4", // internal commessa → non-billable
        source: "calendar",
        confidence: 0.9,
        eventIds: [ev.id],
      });
      booked += hrs;
    }

    // 2) Pull focus sessions for the day
    const focus = focusSessionsSeed.filter((f) => f.employeeId === employeeId && f.date === iso);
    for (const f of focus) {
      drafts.push({
        tempId: nextId(),
        date: iso,
        commessaId: f.commessaId,
        hours: Math.round((f.durationMin / 60) * 4) / 4,
        description: f.note ?? "Focused work",
        billable: true,
        source: "focus",
        confidence: 0.85,
      });
      booked += f.durationMin / 60;
    }

    // 3) Fill the gap up to target with a single low-confidence guess
    const gap = target - booked;
    if (gap >= 1) {
      drafts.push({
        tempId: nextId(),
        date: iso,
        commessaId: fallback,
        hours: Math.round(gap * 4) / 4,
        description: "Deep work — filling gap",
        billable: true,
        source: "gap",
        confidence: 0.4,
      });
    }
  }

  return drafts;
}

export function weekLabel(anchor: Date): string {
  const wso = getWeekStartsOn();
  const from = startOfWeek(anchor, { weekStartsOn: wso });
  const to = endOfWeek(anchor, { weekStartsOn: wso });
  return `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`;
}
