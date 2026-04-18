import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { employees, type Employee } from "./mock-data";

export type MomentKind = "birthday" | "anniversary";

export interface Moment {
  kind: MomentKind;
  employee: Employee;
  /** Absolute date of this moment's occurrence, in the same year as `anchor`. */
  date: Date;
  /** Days until `date`, from `anchor` (negative = already happened). */
  daysAway: number;
  /** For anniversary: how many years. For birthday: age-ish (joinDate-derived, cosmetic). */
  years: number;
  /** Preformatted relative label: "Today", "Tomorrow", "in 4 days". */
  relative: string;
}

function nextOccurrence(monthDay: string, anchor: Date): Date {
  const [m, d] = monthDay.split("-").map(n => parseInt(n, 10));
  const year = anchor.getFullYear();
  const thisYear = new Date(year, m - 1, d);
  if (differenceInCalendarDays(thisYear, anchor) < -1) {
    return new Date(year + 1, m - 1, d);
  }
  return thisYear;
}

function relativeLabel(daysAway: number): string {
  if (daysAway === 0) return "Today";
  if (daysAway === 1) return "Tomorrow";
  if (daysAway === -1) return "Yesterday";
  if (daysAway > 0) return `in ${daysAway} day${daysAway === 1 ? "" : "s"}`;
  return `${Math.abs(daysAway)} days ago`;
}

/**
 * Return upcoming birthdays + work anniversaries within `windowDays` before/after
 * `anchor`, sorted nearest-first.
 */
export function upcomingMoments(
  anchor: Date = new Date(),
  windowDays = 14,
): Moment[] {
  const out: Moment[] = [];

  for (const emp of employees) {
    // Anniversary (always present — from joinDate)
    if (emp.joinDate) {
      const joined = parseISO(emp.joinDate);
      const monthDay = format(joined, "MM-dd");
      const date = nextOccurrence(monthDay, anchor);
      const daysAway = differenceInCalendarDays(date, anchor);
      if (Math.abs(daysAway) <= windowDays) {
        out.push({
          kind: "anniversary",
          employee: emp,
          date,
          daysAway,
          years: date.getFullYear() - joined.getFullYear(),
          relative: relativeLabel(daysAway),
        });
      }
    }

    // Birthday (optional field)
    if (emp.birthday) {
      const date = nextOccurrence(emp.birthday, anchor);
      const daysAway = differenceInCalendarDays(date, anchor);
      if (Math.abs(daysAway) <= windowDays) {
        out.push({
          kind: "birthday",
          employee: emp,
          date,
          daysAway,
          years: date.getFullYear() - parseISO(emp.joinDate).getFullYear() + 25, // cosmetic age offset
          relative: relativeLabel(daysAway),
        });
      }
    }
  }

  return out.sort((a, b) => a.daysAway - b.daysAway);
}

/**
 * Total count of upcoming moments (used by sidebar dot).
 */
export function upcomingCount(anchor: Date = new Date(), windowDays = 14): number {
  return upcomingMoments(anchor, windowDays).filter(m => m.daysAway >= 0).length;
}
