import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  GitBranch,
  Pencil,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@pulse-hr/ui/primitives/badge";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Card } from "@pulse-hr/ui/primitives/card";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { Avatar, PageHeader } from "@/components/app/AppShell";
import { ActivityDialog } from "@/components/pm/ActivityDialog";
import { IntegrationBadge } from "@/components/pm/IntegrationBadge";
import { activityStatusMeta } from "@/lib/activity-status";
import { activitiesTable, useActivities } from "@/lib/tables/activities";
import { useCommesse } from "@/lib/tables/commesse";
import { employeeById, type Activity } from "@/lib/mock-data";

export const Route = createFileRoute("/activities_/$activityId")({
  head: ({ params }) => ({ meta: [{ title: `Activity ${params.activityId} — Pulse HR` }] }),
  component: ActivityDetailPage,
});

function ActivityDetailPage() {
  const { activityId } = useParams({ from: "/activities_/$activityId" });
  const nav = useNavigate({ from: "/activities_/$activityId" });
  const activities = useActivities();
  const projects = useCommesse();
  const [editing, setEditing] = useState(false);

  const activity = activities.find((a) => a.id === activityId);
  const project = activity ? projects.find((p) => p.id === activity.projectId) : null;
  const assignee = activity?.assigneeId ? employeeById(activity.assigneeId) : null;
  const dependencies = activity
    ? activity.dependencies
        .map((id) => activities.find((a) => a.id === id))
        .filter((a): a is NonNullable<typeof a> => Boolean(a))
    : [];
  const dependents = activity ? activities.filter((a) => a.dependencies.includes(activity.id)) : [];

  if (!activity) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          icon={<Calendar className="h-5 w-5" />}
          title="Activity not found"
          description="The activity may have been removed or is not available in this workspace."
          action={
            <Button onClick={() => nav({ to: "/activities" })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to activities
            </Button>
          }
        />
      </div>
    );
  }

  const statusMeta = activityStatusMeta[activity.status];

  return (
    <div className="p-4 md:p-6 fade-in space-y-5">
      <Link
        to="/activities"
        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3 mr-1" />
        All activities
      </Link>

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {activity.title}
            <Badge
              variant="outline"
              className="font-medium"
              style={{
                color: statusMeta.tone,
                borderColor: `color-mix(in oklch, ${statusMeta.tone} 35%, transparent)`,
                backgroundColor: `color-mix(in oklch, ${statusMeta.tone} 12%, transparent)`,
              }}
            >
              {statusMeta.label}
            </Badge>
          </span>
        }
        description={
          <span className="flex flex-wrap items-center gap-2 text-xs">
            {project ? (
              <Link
                to="/projects/$projectId"
                params={{ projectId: project.id }}
                search={{ section: "activities" }}
                className="inline-flex items-center gap-1 hover:underline"
              >
                <Briefcase className="h-3 w-3" />
                {project.name}
              </Link>
            ) : (
              "Project unavailable"
            )}
            <span>·</span>
            <span>{statusMeta.label}</span>
            <span>·</span>
            <span>{activity.estimateHours}h estimate</span>
          </span>
        }
        actions={
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 space-y-5">
          <section>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Description
            </div>
            <p className="text-sm leading-6 text-foreground">
              {activity.description || "No description provided."}
            </p>
          </section>

          <section>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Schedule
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <DetailTile
                icon={<Calendar className="h-4 w-4" />}
                label="Start"
                value={activity.startDate ?? "Unscheduled"}
              />
              <DetailTile
                icon={<Calendar className="h-4 w-4" />}
                label="End"
                value={activity.endDate ?? "Unscheduled"}
              />
              <DetailTile
                icon={<Clock className="h-4 w-4" />}
                label="Estimate"
                value={`${activity.estimateHours}h`}
              />
            </div>
          </section>

          {(dependencies.length > 0 || dependents.length > 0) && (
            <section>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Dependencies
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DependencyList title="Waiting on" activities={dependencies} />
                <DependencyList title="Unlocks" activities={dependents} />
              </div>
            </section>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Assignee
              </div>
              {assignee ? (
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={assignee.initials}
                    color={assignee.avatarColor}
                    size={36}
                    employeeId={assignee.id}
                  />
                  <div>
                    <div className="font-medium text-sm">{assignee.name}</div>
                    <div className="text-xs text-muted-foreground">{assignee.role}</div>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Unassigned
                </div>
              )}
            </div>

            <div className="h-px bg-border" />

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Status
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: statusMeta.tone }}
                />
                <span className="text-sm font-medium">{statusMeta.label}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Linked work
            </div>
            {activity.ticketLink ? (
              <a
                href={activity.ticketLink.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm hover:underline"
              >
                <IntegrationBadge
                  provider={activity.ticketLink.provider}
                  issueKey={activity.ticketLink.key}
                />
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            ) : (
              <div className="text-sm text-muted-foreground">No external issue linked.</div>
            )}
          </Card>
        </div>
      </div>

      <ActivityDialog
        open={editing}
        onClose={() => setEditing(false)}
        onSave={(next) => {
          activitiesTable.update(activity.id, next);
          toast.success("Activity updated");
        }}
        initial={activity}
        projectId={activity.projectId}
      />
    </div>
  );
}

function DetailTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-medium text-sm tabular-nums">{value}</div>
    </div>
  );
}

function DependencyList({ title, activities }: { title: string; activities: Activity[] }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
        {title}
      </div>
      {activities.length === 0 ? (
        <div className="text-xs text-muted-foreground">None</div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              to="/activities/$activityId"
              params={{ activityId: activity.id }}
              className="flex items-center justify-between gap-3 text-sm rounded-md px-2 py-1.5 hover:bg-muted"
            >
              <span className="truncate">{activity.title}</span>
              <Badge variant="outline" className="shrink-0 text-[10px]">
                <GitBranch className="h-3 w-3 mr-1" />
                {activityStatusMeta[activity.status].label}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
