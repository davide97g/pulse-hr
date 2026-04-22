import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isWeekend,
  isAfter,
  isSameDay,
  parseISO,
  format,
  startOfDay,
  subWeeks,
  addDays,
  differenceInCalendarDays,
} from "date-fns";
import type { Locale } from "date-fns";
import { enUS, enGB, it, fr, es, de, ptBR, ja, zhCN } from "date-fns/locale";
import {
  holidaysSeed,
  leaveRequests as leaveSeed,
  commessaById,
  type TimesheetEntry,
  type LeaveRequest,
  type Holiday,
} from "./mock-data";

export type DayStatus =
  | "future"
  | "weekend"
  | "holiday"
  | "sick"
  | "vacation"
  | "personal"
  | "parental"
  | "filled"
  | "partial"
  | "missing";

export interface DayInfo {
  date: Date;
  iso: string;
  inMonth: boolean;
  status: DayStatus;
  hours: number;
  entries: TimesheetEntry[];
  leave?: LeaveRequest;
  holiday?: Holiday;
}

export const TARGET_HOURS_PER_DAY = 8;

// ── locale helpers ──────────────────────────────────────────────────────
const LOCALE_MAP: Record<string, Locale> = {
  "en-US": enUS,
  "en-GB": enGB,
  en: enUS,
  "it-IT": it,
  it: it,
  "fr-FR": fr,
  fr: fr,
  "es-ES": es,
  es: es,
  "de-DE": de,
  de: de,
  "pt-BR": ptBR,
  pt: ptBR,
  "ja-JP": ja,
  ja: ja,
  "zh-CN": zhCN,
  zh: zhCN,
};

export function getLocale(): Locale {
  if (typeof navigator === "undefined") return enUS;
  const lang = (navigator.language || "en-US").replace("_", "-");
  return LOCALE_MAP[lang] ?? LOCALE_MAP[lang.split("-")[0]] ?? enUS;
}

export function getWeekStartsOn(): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  const l = getLocale();
  const wso = l.options?.weekStartsOn;
  return (wso ?? 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function weekdayLabels(): string[] {
  const start = startOfWeek(new Date(), { weekStartsOn: getWeekStartsOn() });
  return Array.from({ length: 7 }).map((_, i) =>
    format(addDays(start, i), "EEEEEE", { locale: getLocale() }),
  );
}

// ── month matrix ────────────────────────────────────────────────────────
export function getMonthMatrix(month: Date): Date[] {
  const wso = getWeekStartsOn();
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: wso });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: wso });
  return eachDayOfInterval({ start, end });
}

// ── day info derivation ─────────────────────────────────────────────────
function leaveCoversDate(leave: LeaveRequest, d: Date): boolean {
  const from = parseISO(leave.from);
  const to = parseISO(leave.to);
  const day = startOfDay(d);
  return day >= startOfDay(from) && day <= startOfDay(to);
}

export function getDayInfo(
  date: Date,
  employeeId: string,
  entries: TimesheetEntry[],
  month: Date,
  opts: { leaves?: LeaveRequest[]; holidays?: Holiday[]; today?: Date } = {},
): DayInfo {
  const leaves = opts.leaves ?? leaveSeed;
  const holidays = opts.holidays ?? holidaysSeed;
  const today = opts.today ?? new Date();

  const iso = format(date, "yyyy-MM-dd");
  const inMonth =
    date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
  const dayEntries = entries.filter((e) => e.employeeId === employeeId && e.date === iso);
  const hours = dayEntries.reduce((acc, e) => acc + e.hours, 0);

  const holiday = holidays.find((h) => h.date === iso);
  const leave = leaves.find(
    (l) => l.employeeId === employeeId && l.status === "approved" && leaveCoversDate(l, date),
  );

  let status: DayStatus;
  if (holiday) {
    status = "holiday";
  } else if (leave) {
    const t = leave.type.toLowerCase() as "sick" | "vacation" | "personal" | "parental";
    status = t;
  } else if (isWeekend(date)) {
    status = "weekend";
  } else if (isAfter(startOfDay(date), startOfDay(today)) && !isSameDay(date, today)) {
    status = "future";
  } else if (hours >= TARGET_HOURS_PER_DAY) {
    status = "filled";
  } else if (hours > 0) {
    status = "partial";
  } else {
    status = "missing";
  }

  return { date, iso, inMonth, status, hours, entries: dayEntries, leave, holiday };
}

// ── aggregates ──────────────────────────────────────────────────────────
export interface MonthStats {
  logged: number;
  target: number;
  variance: number;
  workdays: number;
  filledDays: number;
  partialDays: number;
  missingDays: number;
  leaveDays: number;
  holidayDays: number;
  fillPct: number;
  byCommessa: { commessaId: string; hours: number; color: string; code: string }[];
}

export function getMonthStats(
  month: Date,
  employeeId: string,
  entries: TimesheetEntry[],
  opts: { leaves?: LeaveRequest[]; holidays?: Holiday[]; today?: Date } = {},
): MonthStats {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  let workdays = 0,
    filledDays = 0,
    partialDays = 0,
    missingDays = 0,
    leaveDays = 0,
    holidayDays = 0;
  const hoursByCommessa = new Map<string, number>();

  for (const d of days) {
    const info = getDayInfo(d, employeeId, entries, month, opts);
    if (info.status === "holiday") holidayDays++;
    if (["sick", "vacation", "personal", "parental"].includes(info.status)) leaveDays++;
    if (info.status === "filled") {
      workdays++;
      filledDays++;
    }
    if (info.status === "partial") {
      workdays++;
      partialDays++;
    }
    if (info.status === "missing") {
      workdays++;
      missingDays++;
    }
    if (info.status === "future" && !isWeekend(d)) workdays++;
    for (const e of info.entries) {
      hoursByCommessa.set(e.commessaId, (hoursByCommessa.get(e.commessaId) ?? 0) + e.hours);
    }
  }

  const logged = [...hoursByCommessa.values()].reduce((a, b) => a + b, 0);
  const target = workdays * TARGET_HOURS_PER_DAY;
  const variance = logged - target;
  const fillPct = workdays === 0 ? 0 : Math.round((filledDays / workdays) * 100);

  const byCommessa = [...hoursByCommessa.entries()]
    .map(([commessaId, hours]) => {
      const c = commessaById(commessaId);
      return { commessaId, hours, color: c?.color ?? "var(--muted)", code: c?.code ?? commessaId };
    })
    .sort((a, b) => b.hours - a.hours);

  return {
    logged,
    target,
    variance,
    workdays,
    filledDays,
    partialDays,
    missingDays,
    leaveDays,
    holidayDays,
    fillPct,
    byCommessa,
  };
}

// ── selection helpers ───────────────────────────────────────────────────
export function datesBetween(a: Date, b: Date): Date[] {
  const start = a < b ? a : b;
  const end = a < b ? b : a;
  return eachDayOfInterval({ start, end });
}

export function prevWeekEntries(
  month: Date,
  employeeId: string,
  entries: TimesheetEntry[],
): { from: string; to: string; rows: TimesheetEntry[] } {
  const wso = getWeekStartsOn();
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: wso });
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: wso });
  const rows = entries.filter((e) => {
    if (e.employeeId !== employeeId) return false;
    const d = parseISO(e.date);
    return d >= lastWeekStart && d <= lastWeekEnd;
  });
  return { from: format(lastWeekStart, "yyyy-MM-dd"), to: format(lastWeekEnd, "yyyy-MM-dd"), rows };
}

export function missingWorkdaysInRange(
  from: Date,
  to: Date,
  employeeId: string,
  entries: TimesheetEntry[],
  month: Date,
  opts: { leaves?: LeaveRequest[]; holidays?: Holiday[]; today?: Date } = {},
): Date[] {
  return eachDayOfInterval({ start: from, end: to }).filter((d) => {
    const info = getDayInfo(d, employeeId, entries, month, opts);
    return info.status === "missing";
  });
}

export function nDaysFromNow(offset: number): Date {
  return addDays(new Date(), offset);
}

export function diffDays(a: Date, b: Date): number {
  return differenceInCalendarDays(a, b);
}

// ── team synthesis ──────────────────────────────────────────────────────
// Deterministic synthetic entries for team calendar demo (not persisted).
export function synthesizeTeamEntries(employeeIds: string[], month: Date): TimesheetEntry[] {
  const out: TimesheetEntry[] = [];
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  const commesse = ["cm1", "cm2", "cm3", "cm4", "cm6"];
  let uid = 0;
  employeeIds.forEach((eid, idx) => {
    for (const d of days) {
      if (isWeekend(d)) continue;
      // Seeded pseudorandom: some days missing, some partial, most filled
      const seed = (parseInt(eid.replace(/\D/g, ""), 10) * 13 + d.getDate() * 7) % 10;
      if (seed < 1) continue; // missing
      const c = commesse[(idx + d.getDate()) % commesse.length];
      const hours = seed < 3 ? 4 : seed < 5 ? 6 : 8;
      out.push({
        id: `team-${eid}-${format(d, "yyyyMMdd")}-${++uid}`,
        employeeId: eid,
        commessaId: c,
        date: format(d, "yyyy-MM-dd"),
        hours,
        description: "Synthetic",
        billable: true,
        status: "approved",
      });
    }
  });
  return out;
}
