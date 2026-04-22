import {
  parseISO,
  startOfDay,
  eachDayOfInterval,
  differenceInCalendarDays,
  isWeekend,
} from "date-fns";
import {
  leaveRequests as defaultLeaves,
  employees,
  type LeaveRequest,
  type LeaveGranularity,
} from "./mock-data";

export interface CoverageForDate {
  date: Date;
  onLeave: LeaveRequest[]; // approved requests active that date, excluding the requester
  coveragePct: number; // % of team NOT on leave
}

function leaveCoversDate(leave: LeaveRequest, d: Date): boolean {
  const from = startOfDay(parseISO(leave.from));
  const to = startOfDay(parseISO(leave.to));
  const day = startOfDay(d);
  return day >= from && day <= to;
}

/** Approved leave requests overlapping the given date. */
export function leaveOverlapOn(
  date: Date,
  leaves: LeaveRequest[] = defaultLeaves,
  excludeEmployeeId?: string,
): LeaveRequest[] {
  return leaves.filter(
    (l) =>
      l.status === "approved" && l.employeeId !== excludeEmployeeId && leaveCoversDate(l, date),
  );
}

/** Percentage of `totalTeamSize` not on approved leave for this date. */
export function teamCoveragePct(
  date: Date,
  totalTeamSize: number = employees.length,
  leaves: LeaveRequest[] = defaultLeaves,
): number {
  const out = leaveOverlapOn(date, leaves);
  if (totalTeamSize === 0) return 100;
  return Math.round(((totalTeamSize - out.length) / totalTeamSize) * 100);
}

/** Coverage summary for every day in an inclusive range. */
export function coverageForRange(
  from: Date,
  to: Date,
  opts: { leaves?: LeaveRequest[]; excludeEmployeeId?: string; teamSize?: number } = {},
): CoverageForDate[] {
  const leaves = opts.leaves ?? defaultLeaves;
  const teamSize = opts.teamSize ?? employees.length;
  if (!from || !to || from > to) return [];
  return eachDayOfInterval({ start: from, end: to }).map((d) => ({
    date: d,
    onLeave: leaveOverlapOn(d, leaves, opts.excludeEmployeeId),
    coveragePct: teamCoveragePct(d, teamSize, leaves),
  }));
}

/** Working-day count for a leave window, respecting granularity. */
export function computeLeaveDays(
  from: string,
  to: string,
  granularity: LeaveGranularity = "full",
): number {
  try {
    const f = parseISO(from);
    const t = parseISO(to);
    if (granularity === "half") return 0.5;
    const total = Math.max(0, differenceInCalendarDays(t, f)) + 1;
    // Count workdays only (Mon–Fri)
    let workdays = 0;
    for (let i = 0; i < total; i++) {
      const d = new Date(f);
      d.setDate(f.getDate() + i);
      if (!isWeekend(d)) workdays++;
    }
    return workdays;
  } catch {
    return 0;
  }
}
