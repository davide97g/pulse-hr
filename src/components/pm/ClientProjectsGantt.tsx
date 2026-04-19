import { useNavigate } from "@tanstack/react-router";
import { Gantt, type GanttRow } from "./Gantt";
import type { Commessa } from "@/lib/mock-data";

export function ClientProjectsGantt({
  projects,
  rangeStart,
  rangeEnd,
}: {
  projects: Commessa[];
  rangeStart: string;
  rangeEnd: string;
}) {
  const nav = useNavigate();
  const rows: GanttRow[] = projects.map((p) => {
    const burnPct = Math.min(1, p.burnedHours / Math.max(1, p.budgetHours));
    return {
      id: p.id,
      label: p.name,
      sublabel: `${p.burnedHours}/${p.budgetHours}h · ${p.status}`,
      bars: [
        {
          id: p.id,
          start: p.startDate,
          end: p.endDate,
          label: p.name,
          subtitle: p.code,
          color: p.color,
          progress: burnPct,
          onClick: () => nav({ to: "/projects/$projectId", params: { projectId: p.id } }),
        },
      ],
    };
  });
  return (
    <Gantt
      rows={rows}
      rangeStart={rangeStart}
      rangeEnd={rangeEnd}
      unit="month"
      emptyMessage="No projects for this client yet."
    />
  );
}
