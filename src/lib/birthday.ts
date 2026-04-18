import type { Employee } from "./mock-data";

/** Today's "MM-DD" in the user's locale. */
export function todayMMDD(now: Date = new Date()): string {
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

/** True if the employee's birthday matches today (MM-DD). */
export function isBirthday(e: Pick<Employee, "birthday">, now: Date = new Date()): boolean {
  return !!e.birthday && e.birthday === todayMMDD(now);
}

export const BIRTHDAY_BOOST_MULTIPLIER = 1.25;
