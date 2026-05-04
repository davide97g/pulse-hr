import { Gantt, type GanttRow, type GanttDependency } from "./Gantt";
import { activityStatusMeta } from "@/lib/activity-status";
import { employeeById, type Activity, type Commessa } from "@/lib/mock-data";

export function ProjectActivitiesGantt({
  project,
  activities,
  onActivityClick,
}: {
  project: Commessa;
  activities: Activity[];
  onActivityClick?: (a: Activity) => void;
}) {
  const datedActivities = activities.filter(
    (a): a is Activity & { startDate: string; endDate: string } =>
      Boolean(a.startDate && a.endDate),
  );
  const rows: GanttRow[] = datedActivities.map((a) => {
    const status = activityStatusMeta[a.status];
    const assignee = a.assigneeId ? employeeById(a.assigneeId) : null;

    return {
      id: a.id,
      label: a.title,
      sublabel: status.label,
      bars: [
        {
          id: a.id,
          start: a.startDate,
          end: a.endDate,
          label: a.title,
          subtitle: status.ganttLabel,
          details: [
            { label: "Status", value: status.label },
            { label: "Assigned to", value: assignee?.name ?? "Unassigned" },
          ],
          color: status.tone,
          progress: status.progress,
          onClick: onActivityClick ? () => onActivityClick(a) : undefined,
        },
      ],
    };
  });
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
