import type { ActivityStatus } from "@/lib/mock-data";

export const activityStatusMeta: Record<
  ActivityStatus,
  { label: string; ganttLabel: string; tone: string; progress: number }
> = {
  todo: {
    label: "To do",
    ganttLabel: "Ready to start",
    tone: "var(--muted-foreground)",
    progress: 0,
  },
  in_progress: {
    label: "In progress",
    ganttLabel: "In flight",
    tone: "var(--info)",
    progress: 0.5,
  },
  review: {
    label: "In review",
    ganttLabel: "Awaiting review",
    tone: "var(--warning)",
    progress: 0.8,
  },
  done: {
    label: "Done",
    ganttLabel: "Completed",
    tone: "var(--success)",
    progress: 1,
  },
  blocked: {
    label: "Blocked",
    ganttLabel: "Blocked",
    tone: "var(--destructive)",
    progress: 0,
  },
};

export const activityStatusOptions = Object.keys(activityStatusMeta) as ActivityStatus[];

export function activityStatusLabel(status: ActivityStatus): string {
  return activityStatusMeta[status].label;
}
