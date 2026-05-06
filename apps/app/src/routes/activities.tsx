import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ListChecks,
  Search,
  Briefcase,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { Textarea } from "@pulse-hr/ui/primitives/textarea";
import { Avatar, PageHeader, StatusBadge } from "@/components/app/AppShell";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { SkeletonRows } from "@pulse-hr/ui/atoms/SkeletonList";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { Button } from "@pulse-hr/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@pulse-hr/ui/primitives/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@pulse-hr/ui/primitives/alert-dialog";
import { activitiesTable, useActivities } from "@/lib/tables/activities";
import { useCommesse } from "@/lib/tables/commesse";
import { activityStatusLabel, activityStatusOptions } from "@/lib/activity-status";
import {
  employeeById,
  employees,
  type Activity,
  type ActivityStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ActivitiesSearch = {
  q?: string;
  assignee?: string;
  status?: ActivityStatus;
  project?: string;
  scope?: "mine" | "all";
  period?: "week" | "month" | "quarter" | "all";
};

const STATUSES: ActivityStatus[] = activityStatusOptions;

export const Route = createFileRoute("/activities")({
  validateSearch: (s: Record<string, unknown>): ActivitiesSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    assignee: typeof s.assignee === "string" ? s.assignee : undefined,
    status: typeof s.status === "string" ? (s.status as ActivityStatus) : undefined,
    project: typeof s.project === "string" ? s.project : undefined,
    scope: (s.scope as ActivitiesSearch["scope"]) || undefined,
    period: (s.period as ActivitiesSearch["period"]) || undefined,
  }),
  head: () => ({ meta: [{ title: "Activities — Pulse HR" }] }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const nav = useNavigate({ from: "/activities" });
  const search = Route.useSearch();
  const setSearch = (patch: Partial<ActivitiesSearch>) =>
    nav({ search: (prev) => ({ ...prev, ...patch }) });

  const activities = useActivities();
  const projects = useCommesse();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Activity | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Activity | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  // First-employee fallback for "Mine" filter — no real "current user" in mock.
  const me = employees[0];
  const meId = me?.id;
  const scope = search.scope ?? "mine";
  const period = search.period ?? "month";
  const q = search.q ?? "";

  const periodWindow = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === "week") start.setDate(now.getDate() - now.getDay());
    else if (period === "month") start.setDate(1);
    else if (period === "quarter") {
      const m = now.getMonth();
      start.setMonth(m - (m % 3));
      start.setDate(1);
    }
    const end = new Date(start);
    if (period === "week") end.setDate(start.getDate() + 7);
    else if (period === "month") end.setMonth(start.getMonth() + 1);
    else if (period === "quarter") end.setMonth(start.getMonth() + 3);
    else return null;
    return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)] as const;
  }, [period]);

  const filtered = useMemo(() => {
    return activities
      .filter((a) => {
        if (search.status && a.status !== search.status) return false;
        if (search.project && a.projectId !== search.project) return false;
        if (search.assignee && a.assigneeId !== search.assignee) return false;
        if (scope === "mine" && a.assigneeId !== meId) return false;
        if (periodWindow) {
          const start = a.startDate ?? "";
          const end = a.endDate ?? "";
          // Keep if no period (treat as ongoing) or any overlap with window
          if (start && end) {
            if (end < periodWindow[0] || start > periodWindow[1]) return false;
          }
        }
        if (q) {
          const blob = `${a.title} ${a.description ?? ""}`.toLowerCase();
          if (!blob.includes(q.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => (a.endDate ?? "").localeCompare(b.endDate ?? ""));
  }, [activities, search, scope, periodWindow, q, meId]);

  return (
    <div className="p-4 md:p-6 fade-in space-y-5">
      <PageHeader
        eyebrow="WORK · ATTIVITÀ · CRONOLOGIA"
        title={
          <>
            Quello che <span className="spark-mark">accade</span>
            <span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
          </>
        }
        description="Ogni attività, su ogni commessa."
        actions={
          <Button
            size="sm"
            className="press-scale"
            disabled={projects.length === 0}
            onClick={() => setEditing("new")}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New activity
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b">
          <ScopeToggle
            value={scope}
            onChange={(v) => setSearch({ scope: v === "mine" ? undefined : v })}
          />
          <PeriodToggle
            value={period}
            onChange={(v) => setSearch({ period: v === "month" ? undefined : v })}
          />
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              className="pl-9"
              value={q}
              onChange={(e) => setSearch({ q: e.target.value || undefined })}
            />
          </div>
          <select
            className="h-9 px-3 text-sm bg-background border rounded-md"
            value={search.project ?? ""}
            onChange={(e) => setSearch({ project: e.target.value || undefined })}
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="h-9 px-3 text-sm bg-background border rounded-md"
            value={search.status ?? ""}
            onChange={(e) =>
              setSearch({
                status: (e.target.value || undefined) as ActivityStatus | undefined,
              })
            }
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {activityStatusLabel(s)}
              </option>
            ))}
          </select>
          <select
            className="h-9 px-3 text-sm bg-background border rounded-md"
            value={search.assignee ?? ""}
            onChange={(e) => setSearch({ assignee: e.target.value || undefined })}
          >
            <option value="">All assignees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <SkeletonRows rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            tone="filter"
            icon={<ListChecks className="h-5 w-5" />}
            title="No activities match"
            description="Try widening the period or clearing filters."
            action={
              <Button
                variant="outline"
                onClick={() =>
                  nav({
                    search: { scope: "all", period: "all" } satisfies ActivitiesSearch,
                  })
                }
              >
                Show all
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin [&_table]:min-w-[820px]">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left font-medium px-5 py-2.5">Activity</th>
                  <th className="text-left font-medium px-3 py-2.5">Project</th>
                  <th className="text-left font-medium px-3 py-2.5">Assignee</th>
                  <th className="text-left font-medium px-3 py-2.5">Status</th>
                  <th className="text-right font-medium px-3 py-2.5">Hours</th>
                  <th className="text-right font-medium px-3 py-2.5">End</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="stagger-in">
                {filtered.map((a) => {
                  const project = projects.find((pr) => pr.id === a.projectId);
                  const assignee = a.assigneeId ? employeeById(a.assigneeId) : null;
                  return (
                    <tr
                      key={a.id}
                      className={cn("border-t hover:bg-muted/30 cursor-pointer")}
                      onClick={() => {
                        nav({
                          to: "/activities/$activityId",
                          params: { activityId: a.id },
                        });
                      }}
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium">{a.title}</div>
                        {a.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {a.description}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {project && (
                          <Link
                            to="/projects/$projectId"
                            params={{ projectId: project.id }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-muted-foreground hover:underline inline-flex items-center gap-1.5"
                          >
                            <Briefcase className="h-3 w-3" />
                            {project.name}
                          </Link>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {assignee ? (
                          <span className="inline-flex items-center gap-2">
                            <Avatar
                              initials={assignee.initials}
                              color={assignee.avatarColor}
                              size={20}
                            />
                            {assignee.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-xs">
                        {a.estimateHours}h
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-xs">
                        {a.endDate ?? "—"}
                      </td>
                      <td className="px-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditing(a)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setToDelete(a)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <SidePanel
        open={editing !== null}
        onClose={() => setEditing(null)}
        width={460}
        title={editing === "new" ? "New activity" : editing ? "Edit activity" : ""}
      >
        {editing !== null && (
          <ActivityForm
            initial={editing === "new" ? null : editing}
            projects={projects}
            onCancel={() => setEditing(null)}
            onSave={(data) => {
              if (editing === "new") {
                const created = activitiesTable.add({
                  ...data,
                  dependencies: [],
                  order: activities.length + 1,
                });
                toast.success("Activity created", { description: created.title });
              } else {
                activitiesTable.update(editing.id, data);
                toast.success("Activity updated");
              }
              setEditing(null);
            }}
          />
        )}
      </SidePanel>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete activity?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete && `"${toDelete.title}" will be removed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) {
                  const snap = toDelete;
                  activitiesTable.remove(snap.id);
                  toast("Activity deleted", {
                    action: {
                      label: "Undo",
                      onClick: () => activitiesTable.add(snap),
                    },
                  });
                }
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface ActivityFormData {
  projectId: string;
  title: string;
  description?: string;
  status: ActivityStatus;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
  estimateHours: number;
  ticketLink?: Activity["ticketLink"];
}

function ActivityForm({
  initial,
  projects,
  onCancel,
  onSave,
}: {
  initial: Activity | null;
  projects: { id: string; name: string }[];
  onCancel: () => void;
  onSave: (data: ActivityFormData) => void;
}) {
  const [projectId, setProjectId] = useState(initial?.projectId ?? projects[0]?.id ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<ActivityStatus>(initial?.status ?? "todo");
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [estimateHours, setEstimateHours] = useState(initial?.estimateHours ?? 4);

  const valid = projectId && title.trim().length > 0 && estimateHours > 0;

  return (
    <div className="p-5 md:p-6 pb-8 space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="ac-title">Title</Label>
        <Input
          id="ac-title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ac-desc">Description</Label>
        <Textarea
          id="ac-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional context, scope, links."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Project</Label>
          <select
            className="h-9 w-full px-3 text-sm bg-background border rounded-md"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <select
            className="h-9 w-full px-3 text-sm bg-background border rounded-md"
            value={status}
            onChange={(e) => setStatus(e.target.value as ActivityStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {activityStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Assignee</Label>
        <select
          className="h-9 w-full px-3 text-sm bg-background border rounded-md"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Unassigned</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ac-start">Start</Label>
          <Input
            id="ac-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ac-end">End</Label>
          <Input
            id="ac-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ac-hours">Hours</Label>
          <Input
            id="ac-hours"
            type="number"
            min={0.5}
            step={0.5}
            value={estimateHours}
            onChange={(e) => setEstimateHours(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 mt-1 border-t border-border">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={!valid}
          onClick={() =>
            onSave({
              projectId,
              title: title.trim(),
              description: description.trim() || undefined,
              status,
              assigneeId: assigneeId || undefined,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
              estimateHours,
              ticketLink: initial?.ticketLink,
            })
          }
        >
          {initial ? "Save changes" : "Create activity"}
        </Button>
      </div>
    </div>
  );
}

function ScopeToggle({
  value,
  onChange,
}: {
  value: "mine" | "all";
  onChange: (v: "mine" | "all") => void;
}) {
  return (
    <div className="inline-flex rounded-md border bg-background p-0.5 text-xs">
      {(["mine", "all"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "px-2.5 py-1 rounded font-medium transition",
            value === v ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {v === "mine" ? "Mine" : "All"}
        </button>
      ))}
    </div>
  );
}

function PeriodToggle({
  value,
  onChange,
}: {
  value: "week" | "month" | "quarter" | "all";
  onChange: (v: "week" | "month" | "quarter" | "all") => void;
}) {
  return (
    <div className="inline-flex rounded-md border bg-background p-0.5 text-xs">
      {(["week", "month", "quarter", "all"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "px-2.5 py-1 rounded font-medium transition capitalize",
            value === v ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
