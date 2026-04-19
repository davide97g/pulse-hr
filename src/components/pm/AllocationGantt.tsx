import { Gantt, type GanttRow } from "./Gantt";
import { allocations, commesse, employees, employeeById, projectById } from "@/lib/mock-data";

export function AllocationGantt({
  rangeStart,
  rangeEnd,
  filterProjectId,
}: {
  rangeStart: string;
  rangeEnd: string;
  filterProjectId?: string;
}) {
  const relevant = filterProjectId
    ? allocations.filter((a) => a.projectId === filterProjectId)
    : allocations;
  const byEmployee = new Map<string, typeof allocations>();
  for (const a of relevant) {
    const arr = byEmployee.get(a.employeeId) ?? [];
    arr.push(a);
    byEmployee.set(a.employeeId, arr);
  }
  const rows: GanttRow[] = [...byEmployee.entries()].map(([empId, allocs]) => {
    const emp = employeeById(empId) ?? employees.find((e) => e.id === empId);
    return {
      id: empId,
      label: emp?.name ?? empId,
      sublabel: emp?.role,
      bars: allocs.map((a) => {
        const p = projectById(a.projectId) ?? commesse.find((c) => c.id === a.projectId);
        return {
          id: a.id,
          start: a.startDate,
          end: a.endDate,
          label: p?.name ?? a.projectId,
          subtitle: `${a.percent}% · ${a.type}`,
          color: p?.color ?? "oklch(0.6 0.08 260)",
          tone: a.percent < 30 ? ("soft" as const) : ("solid" as const),
        };
      }),
    };
  });
  return (
    <Gantt
      rows={rows}
      rangeStart={rangeStart}
      rangeEnd={rangeEnd}
      unit="week"
      emptyMessage="No allocations in this range."
    />
  );
}
