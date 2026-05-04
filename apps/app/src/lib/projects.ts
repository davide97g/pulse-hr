import {
  activities,
  allocations,
  clients,
  commesse,
  employees,
  employeeById,
  clientById,
  projectById,
  timesheetEntries,
  type Activity,
  type Allocation,
  type Client,
  type Commessa,
  type Employee,
} from "./mock-data";

const FTE_HOURS_PER_YEAR = 1800;
const HOURS_PER_WEEK = 40;

export const employeeCostRate = (e: Employee): number => e.salary / FTE_HOURS_PER_YEAR;
export const employeeAnnualCost = (e: Employee): number => e.salary;

export function clientName(project: Commessa, clientList: Client[] = clients): string {
  const c = clientList.find((x) => x.id === project.clientId);
  return c?.name ?? project.client;
}

export function getClientProjects(clientId: string, list: Commessa[] = commesse): Commessa[] {
  return list.filter((p) => p.clientId === clientId);
}

export function projectTeam(projectId: string, allocs: Allocation[] = allocations): Allocation[] {
  return allocs.filter((a) => a.projectId === projectId);
}

export function projectTotalPercent(projectId: string, allocs: Allocation[] = allocations): number {
  return projectTeam(projectId, allocs).reduce((s, a) => s + a.percent, 0);
}

/** Overlap in weeks between [aStart,aEnd] and [bStart,bEnd]. */
function overlapWeeks(aStart: string, aEnd: string, bStart: string, bEnd: string): number {
  const s = new Date(Math.max(new Date(aStart).getTime(), new Date(bStart).getTime()));
  const e = new Date(Math.min(new Date(aEnd).getTime(), new Date(bEnd).getTime()));
  if (e <= s) return 0;
  return (e.getTime() - s.getTime()) / (7 * 24 * 60 * 60 * 1000);
}

export function allocationHours(a: Allocation, weeks: number): number {
  return (a.percent / 100) * HOURS_PER_WEEK * weeks;
}

export function allocationCost(a: Allocation, weeks: number, emp?: Employee): number {
  const e = emp ?? employeeById(a.employeeId);
  if (!e) return 0;
  return allocationHours(a, weeks) * employeeCostRate(e);
}

export function allocationRevenue(a: Allocation, weeks: number, project?: Commessa): number {
  const p = project ?? projectById(a.projectId);
  if (!p) return 0;
  const rate = a.billableRate ?? p.defaultBillableRate;
  return allocationHours(a, weeks) * rate;
}

export interface ProjectMargin {
  projectId: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPct: number;
  totalHours: number;
}

/** Margin over [project.startDate, min(today, project.endDate)]. */
export function projectMargin(project: Commessa, today = new Date()): ProjectMargin {
  const team = projectTeam(project.id);
  const todayISO = today.toISOString().slice(0, 10);
  let revenue = 0;
  let cost = 0;
  let hours = 0;
  for (const a of team) {
    const endCap = project.endDate < todayISO ? project.endDate : todayISO;
    const weeks = overlapWeeks(a.startDate, a.endDate, project.startDate, endCap);
    if (weeks <= 0) continue;
    const emp = employeeById(a.employeeId);
    if (!emp) continue;
    revenue += allocationRevenue(a, weeks, project);
    cost += allocationCost(a, weeks, emp);
    hours += allocationHours(a, weeks);
  }
  const margin = revenue - cost;
  const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;
  return { projectId: project.id, revenue, cost, margin, marginPct, totalHours: hours };
}

export function clientMargin(clientId: string, today = new Date()) {
  const projects = getClientProjects(clientId);
  return projects.reduce<ProjectMargin>(
    (acc, p) => {
      const m = projectMargin(p, today);
      return {
        projectId: clientId,
        revenue: acc.revenue + m.revenue,
        cost: acc.cost + m.cost,
        margin: acc.margin + m.margin,
        marginPct: 0,
        totalHours: acc.totalHours + m.totalHours,
      };
    },
    { projectId: clientId, revenue: 0, cost: 0, margin: 0, marginPct: 0, totalHours: 0 },
  );
}

/** Monday of the ISO week containing `d`. */
export function weekStart(d: Date): Date {
  const out = new Date(d);
  const day = (out.getDay() + 6) % 7; // Monday=0
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - day);
  return out;
}

export function weekRange(start: Date, count: number): Date[] {
  const base = weekStart(start);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i * 7);
    return d;
  });
}

/** Sum of allocation percent for an employee during the week containing weekOf. */
export function personWeeklyLoad(
  employeeId: string,
  weekOf: Date,
  allocs: Allocation[] = allocations,
): number {
  const start = weekStart(weekOf);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);
  return allocs
    .filter((a) => a.employeeId === employeeId)
    .filter((a) => !(a.endDate < startISO || a.startDate >= endISO))
    .reduce((s, a) => s + a.percent, 0);
}

export function orgUtilization(today = new Date(), activeOnly = true): number {
  const pool = activeOnly ? employees.filter((e) => e.status !== "offboarding") : employees;
  if (pool.length === 0) return 0;
  const totalLoad = pool.reduce((s, e) => s + personWeeklyLoad(e.id, today), 0);
  return totalLoad / pool.length;
}

/** Hours split billable vs internal, from current timesheet entries. */
export function billableSplit() {
  let billable = 0;
  let internal = 0;
  for (const t of timesheetEntries) {
    if (t.billable) billable += t.hours;
    else internal += t.hours;
  }
  return { billable, internal, total: billable + internal };
}

/** Aggregates cost/revenue per employee across all active allocations (to today). */
export interface PersonValue {
  employeeId: string;
  name: string;
  department: string;
  hours: number;
  cost: number;
  revenue: number;
  margin: number;
}
export function personValue(today = new Date()): PersonValue[] {
  return employees.map((e) => {
    let cost = 0;
    let revenue = 0;
    let hours = 0;
    const todayISO = today.toISOString().slice(0, 10);
    for (const a of allocations.filter((x) => x.employeeId === e.id)) {
      const p = projectById(a.projectId);
      if (!p) continue;
      const endCap = a.endDate < todayISO ? a.endDate : todayISO;
      const weeks = overlapWeeks(a.startDate, endCap, a.startDate, endCap);
      if (weeks <= 0) continue;
      hours += allocationHours(a, weeks);
      cost += allocationCost(a, weeks, e);
      revenue += allocationRevenue(a, weeks, p);
    }
    return {
      employeeId: e.id,
      name: e.name,
      department: e.department,
      hours,
      cost,
      revenue,
      margin: revenue - cost,
    };
  });
}

export function projectActivities(projectId: string, list: Activity[] = activities): Activity[] {
  return list.filter((a) => a.projectId === projectId).sort((a, b) => a.order - b.order);
}

export { clientById, projectById };
