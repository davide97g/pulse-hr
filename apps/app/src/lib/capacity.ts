import {
  activities as activitiesSeed,
  allocations as allocationsSeed,
  type Activity,
  type Allocation,
} from "./mock-data";

const HOURS_PER_DAY = 8;

const isoToDate = (s: string): Date => new Date(`${s}T00:00:00Z`);

/** Mon-Fri days between two ISO yyyy-mm-dd dates (inclusive of start, exclusive of end+1). */
export function workingDaysBetween(startISO: string, endISO: string): number {
  if (!startISO || !endISO) return 0;
  const start = isoToDate(startISO);
  const end = isoToDate(endISO);
  if (end < start) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getUTCDay();
    if (day !== 0 && day !== 6) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

function overlap(aStart: string, aEnd: string, bStart: string, bEnd: string): [string, string] | null {
  const s = aStart > bStart ? aStart : bStart;
  const e = aEnd < bEnd ? aEnd : bEnd;
  return s <= e ? [s, e] : null;
}

/**
 * Capacity (hours) an employee has on a project for a given window, derived from
 * project allocations. Each allocation contributes percent × workingDaysInOverlap × 8h.
 */
export function employeeCapacityOnProject(
  employeeId: string,
  projectId: string,
  windowStartISO: string,
  windowEndISO: string,
  allocs: Allocation[] = allocationsSeed,
): number {
  let hours = 0;
  for (const a of allocs) {
    if (a.employeeId !== employeeId || a.projectId !== projectId) continue;
    const o = overlap(a.startDate, a.endDate, windowStartISO, windowEndISO);
    if (!o) continue;
    const days = workingDaysBetween(o[0], o[1]);
    hours += (a.percent / 100) * days * HOURS_PER_DAY;
  }
  return hours;
}

/**
 * Hours already booked to an employee on a project across activities whose period
 * overlaps the window. We pro-rate each activity's estimateHours by overlap days
 * vs activity span.
 */
export function employeeAssignedHours(
  employeeId: string,
  projectId: string,
  windowStartISO: string,
  windowEndISO: string,
  acts: Activity[] = activitiesSeed,
  excludeActivityId?: string,
): number {
  let hours = 0;
  for (const act of acts) {
    if (act.id === excludeActivityId) continue;
    if (act.assigneeId !== employeeId) continue;
    if (act.projectId !== projectId) continue;
    const start = act.startDate;
    const end = act.endDate;
    if (!start || !end) {
      // No period — count fully in window
      hours += act.estimateHours;
      continue;
    }
    const o = overlap(start, end, windowStartISO, windowEndISO);
    if (!o) continue;
    const span = workingDaysBetween(start, end);
    const part = workingDaysBetween(o[0], o[1]);
    if (span === 0) hours += act.estimateHours;
    else hours += act.estimateHours * (part / span);
  }
  return hours;
}

export interface EmployeeCapacityRow {
  capacityHours: number;
  assignedHours: number;
  availableHours: number;
}

export function employeeCapacityRow(
  employeeId: string,
  projectId: string,
  windowStartISO: string,
  windowEndISO: string,
  opts?: {
    excludeActivityId?: string;
    activities?: Activity[];
    allocations?: Allocation[];
  },
): EmployeeCapacityRow {
  const cap = employeeCapacityOnProject(
    employeeId,
    projectId,
    windowStartISO,
    windowEndISO,
    opts?.allocations,
  );
  const assigned = employeeAssignedHours(
    employeeId,
    projectId,
    windowStartISO,
    windowEndISO,
    opts?.activities,
    opts?.excludeActivityId,
  );
  return {
    capacityHours: cap,
    assignedHours: assigned,
    availableHours: cap - assigned,
  };
}
