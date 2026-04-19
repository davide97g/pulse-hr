import { Gantt, type GanttRow, type GanttDependency } from "./Gantt";
import type { Activity, Commessa } from "@/lib/mock-data";

const statusTone: Record<Activity["status"], string> = {
  todo: "var(--muted-foreground)",
  in_progress: "var(--info)",
  review: "var(--warning)",
  done: "var(--success)",
  blocked: "var(--destructive)",
};

export function ProjectActivitiesGantt({
  project,
  activities,
  onActivityClick,
}: {
  project: Commessa;
  activities: Activity[];
  onActivityClick?: (a: Activity) => void;
}) {
  const datedActivities = activities.filter((a) => a.startDate && a.endDate);
  const rows: GanttRow[] = datedActivities.map((a) => ({
    id: a.id,
    label: a.title,
    sublabel: a.status,
    bars: [
      {
        id: a.id,
        start: a.startDate!,
        end: a.endDate!,
        label: a.title,
        subtitle: a.status,
        color: statusTone[a.status],
        progress:
          a.status === "done"
            ? 1
            : a.status === "in_progress"
              ? 0.5
              : a.status === "review"
                ? 0.8
                : 0,
        onClick: onActivityClick ? () => onActivityClick(a) : undefined,
      },
    ],
  }));
  const dependencies: GanttDependency[] = activities.flatMap((a) =>
    (a.dependencies ?? []).map((dep) => ({ from: dep, to: a.id })),
  );
  return (
    <Gantt
      rows={rows}
      rangeStart={project.startDate}
      rangeEnd={project.endDate}
      unit="week"
      dependencies={dependencies}
      emptyMessage="Add dated activities to see them on the timeline."
    />
  );
}
