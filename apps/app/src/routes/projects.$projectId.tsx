import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Users as UsersIcon,
  Calendar,
  TrendingUp,
  Briefcase,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Badge } from "@pulse-hr/ui/primitives/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pulse-hr/ui/primitives/tabs";
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
import { Avatar, PageHeader, StatusBadge } from "@/components/app/AppShell";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import {
  integrationsSeed,
  employeeById,
  type Allocation,
  type Commessa,
  type IntegrationConnection,
  type Plan,
} from "@/lib/mock-data";
import { useClients } from "@/lib/tables/clients";
import { commesseTable, useCommesse } from "@/lib/tables/commesse";
import { allocationsTable, useAllocations } from "@/lib/tables/allocations";
import { plansTable, usePlans } from "@/lib/tables/plans";
import { activitiesTable, useActivities } from "@/lib/tables/activities";
import { projectMargin, projectActivities } from "@/lib/projects";
import { ProjectForm } from "@/components/pm/ProjectForm";
import { TeamPanel } from "@/components/pm/TeamPanel";
import { ProjectActivitiesGantt } from "@/components/pm/ProjectActivitiesGantt";
import { LinkedIssuesPanel } from "@/components/pm/LinkedIssuesPanel";
import { IntegrationConnectCard } from "@/components/pm/IntegrationConnectCard";
import { PlanForm } from "@/components/pm/PlanForm";
import { cn } from "@/lib/utils";

type ProjectSection =
  | "overview"
  | "plans"
  | "gantt"
  | "team"
  | "integrations";

type ProjectSearch = { section?: ProjectSection };

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({ meta: [{ title: "Project — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): ProjectSearch => ({
    section: (s.section as ProjectSection) || undefined,
  }),
  component: ProjectDetail,
});

const fmtEUR = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const PLAN_STATUS_TONE: Record<Plan["status"], string> = {
  active: "var(--success)",
  on_hold: "var(--warning)",
  done: "var(--muted-foreground)",
  draft: "var(--muted-foreground)",
};

function ProjectDetail() {
  const { projectId } = useParams({ from: "/projects/$projectId" });
  const nav = useNavigate({ from: "/projects/$projectId" });
  const search = Route.useSearch();
  const section = search.section ?? "overview";

  const projects = useCommesse();
  const clients = useClients();
  const allocations = useAllocations();
  const plans = usePlans();
  const activities = useActivities();

  const [connections, setConnections] = useState<IntegrationConnection[]>(integrationsSeed);
  const [editOpen, setEditOpen] = useState(false);
  const [toDelete, setToDelete] = useState(false);
  const [planForm, setPlanForm] = useState<{ open: boolean; initial?: Plan | null }>({
    open: false,
  });
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const project = projects.find((p) => p.id === projectId);
  const projectTeamAllocs = useMemo(
    () => allocations.filter((a) => a.projectId === projectId),
    [allocations, projectId],
  );
  const projectPlans = useMemo(
    () => plans.filter((p) => p.projectId === projectId).sort((a, b) => a.order - b.order),
    [plans, projectId],
  );
  const projectActs = useMemo(
    () => projectActivities(projectId, activities, plans),
    [activities, plans, projectId],
  );
  const margin = useMemo(
    () => (project ? projectMargin(project) : null),
    [project, allocations],
  );
  const client = project ? clients.find((c) => c.id === project.clientId) : null;
  const owner = project ? employeeById(project.ownerId) : null;
  const connectedProviders = connections
    .filter((c) => c.status === "connected")
    .map((c) => c.provider);

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Briefcase className="h-5 w-5" />}
          title="Project not found"
          action={
            <Button onClick={() => nav({ to: "/projects" })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        />
      </div>
    );
  }

  const setSection = (v: string) =>
    nav({
      search: (prev) => ({
        ...prev,
        section: v === "overview" ? undefined : (v as ProjectSection),
      }),
    });

  const saveProject = (p: Commessa) => {
    commesseTable.update(p.id, p);
    toast.success(`Project “${p.name}” saved`);
  };
  const updateTeam = (next: Allocation[]) => {
    const others = allocationsTable.getAll().filter((a) => a.projectId !== projectId);
    allocationsTable.replace([...others, ...next]);
  };
  const updateConnection = (c: IntegrationConnection) =>
    setConnections((list) => list.map((x) => (x.provider === c.provider ? c : x)));
  const removeProject = () => {
    const snapshot = project;
    commesseTable.remove(snapshot.id);
    toast(`Removed ${snapshot.name}`, {
      action: { label: "Undo", onClick: () => commesseTable.add(snapshot) },
    });
    nav({ to: "/projects" });
  };

  const upsertPlan = (p: Plan) => {
    const exists = plansTable.getAll().some((x) => x.id === p.id);
    if (exists) plansTable.update(p.id, p);
    else plansTable.add(p);
    toast.success(`Plan “${p.name}” saved`);
  };
  const removePlan = (p: Plan) => {
    const orphanedActs = activitiesTable.getAll().filter((a) => a.planId === p.id);
    plansTable.remove(p.id);
    for (const a of orphanedActs) activitiesTable.remove(a.id);
    toast(`Removed ${p.name}`, {
      description: orphanedActs.length
        ? `${orphanedActs.length} activit${orphanedActs.length === 1 ? "y" : "ies"} also removed`
        : undefined,
      action: {
        label: "Undo",
        onClick: () => {
          plansTable.add(p);
          for (const a of orphanedActs) activitiesTable.add(a);
        },
      },
    });
  };

  const burnPct = Math.round((project.burnedHours / Math.max(1, project.budgetHours)) * 100);

  return (
    <div className="p-4 md:p-6 fade-in space-y-5">
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          All projects
        </Link>
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: project.color }} />
              {project.name}
              <span className="font-mono text-xs text-muted-foreground">{project.code}</span>
              <StatusBadge status={project.status} />
            </span>
          }
          description={
            <span className="flex items-center gap-2 text-xs">
              Client:{" "}
              {client ? (
                <Link
                  to="/clients/$clientId"
                  params={{ clientId: client.id }}
                  className="hover:underline"
                >
                  {client.name}
                </Link>
              ) : (
                "—"
              )}
              {" · "}
              {project.startDate} → {project.endDate}
              {" · "}
              Default rate €{project.defaultBillableRate}/h
            </span>
          }
          actions={
            <>
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                className="text-destructive"
                onClick={() => setToDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          }
        />
      </div>

      <Tabs value={section} onValueChange={setSection}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans ({projectPlans.length})</TabsTrigger>
          <TabsTrigger value="team">Team ({projectTeamAllocs.length})</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <OverviewTile
              icon={<UsersIcon className="h-4 w-4" />}
              label="Team size"
              value={projectTeamAllocs.length}
            />
            <OverviewTile
              icon={<Calendar className="h-4 w-4" />}
              label="Burn"
              value={`${burnPct}%`}
              tone={burnPct > 100 ? "warn" : undefined}
            />
            <OverviewTile
              icon={<Layers className="h-4 w-4" />}
              label="Plans"
              value={projectPlans.length}
            />
            <OverviewTile
              icon={<TrendingUp className="h-4 w-4" />}
              label="Margin YTD"
              value={margin ? fmtEUR.format(margin.margin) : "—"}
              tone={margin && margin.margin > 0 ? "good" : "warn"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">Budget burn</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {project.burnedHours} / {project.budgetHours}h
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, burnPct)}%`,
                    background:
                      burnPct > 100
                        ? "var(--destructive)"
                        : burnPct > 85
                          ? "var(--warning)"
                          : project.color,
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
                <MiniStat
                  label="Revenue YTD"
                  value={margin ? fmtEUR.format(margin.revenue) : "—"}
                />
                <MiniStat label="Cost YTD" value={margin ? fmtEUR.format(margin.cost) : "—"} />
                <MiniStat
                  label="Margin %"
                  value={margin ? `${margin.marginPct.toFixed(0)}%` : "—"}
                />
              </div>
            </Card>

            <Card className="p-5">
              <div className="font-semibold text-sm mb-3">Owner</div>
              {owner ? (
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={owner.initials}
                    color={owner.avatarColor}
                    size={36}
                    employeeId={owner.id}
                  />
                  <div>
                    <div className="font-medium text-sm">{owner.name}</div>
                    <div className="text-xs text-muted-foreground">{owner.role}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}
              {project.tags.length > 0 && (
                <>
                  <div className="h-px bg-border my-3" />
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>

          <Card className="p-5">
            <div className="font-semibold text-sm mb-3">Upcoming activities</div>
            {projectActs.filter((a) => a.status !== "done").slice(0, 5).length === 0 ? (
              <div className="text-xs text-muted-foreground">Nothing upcoming.</div>
            ) : (
              <div className="space-y-2">
                {projectActs
                  .filter((a) => a.status !== "done")
                  .slice(0, 5)
                  .map((a) => {
                    const assignee = a.assigneeId ? employeeById(a.assigneeId) : null;
                    const plan = plans.find((p) => p.id === a.planId);
                    return (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 text-sm py-2 border-b last:border-0"
                      >
                        <StatusBadge status={a.status} />
                        <div className="flex-1 truncate">
                          <div className="font-medium truncate">{a.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {plan?.name}
                            {a.description ? ` · ${a.description}` : ""}
                          </div>
                        </div>
                        {assignee && (
                          <Avatar
                            initials={assignee.initials}
                            color={assignee.avatarColor}
                            size={22}
                          />
                        )}
                        {a.endDate && (
                          <div className="text-[11px] text-muted-foreground tabular-nums">
                            {a.endDate.slice(5)}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="pt-5 space-y-4">
          <Card className="overflow-hidden">
            <div className="px-5 py-3 border-b text-sm font-semibold flex items-center justify-between">
              <span>Plans</span>
              <Button size="sm" onClick={() => setPlanForm({ open: true, initial: null })}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New plan
              </Button>
            </div>
            {projectPlans.length === 0 ? (
              <EmptyState
                icon={<Layers className="h-5 w-5" />}
                title="No plans yet"
                description="Plans group activities, team roles, contacts and docs by phase or workstream."
                action={
                  <Button onClick={() => setPlanForm({ open: true, initial: null })}>
                    <Plus className="h-4 w-4 mr-2" />
                    New plan
                  </Button>
                }
              />
            ) : (
              <div className="divide-y stagger-in">
                {projectPlans.map((p) => {
                  const acts = projectActs.filter((a) => a.planId === p.id);
                  const done = acts.filter((a) => a.status === "done").length;
                  return (
                    <div
                      key={p.id}
                      className="px-5 py-4 flex items-start gap-4 hover:bg-muted/30 cursor-pointer"
                      onClick={() =>
                        nav({
                          to: "/projects/$projectId/plans/$planId",
                          params: { projectId: project.id, planId: p.id },
                        })
                      }
                    >
                      <span
                        className="h-2 w-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: PLAN_STATUS_TONE[p.status] }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">{p.name}</div>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {p.status}
                          </Badge>
                        </div>
                        {p.description && (
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {p.description}
                          </div>
                        )}
                        <div className="text-[11px] text-muted-foreground mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
                          <span>
                            {p.startDate} → {p.endDate}
                          </span>
                          <span>{p.team.length} on team</span>
                          <span>
                            {acts.length} activit{acts.length === 1 ? "y" : "ies"}
                            {acts.length > 0 && ` · ${done} done`}
                          </span>
                          {p.docs.length > 0 && <span>{p.docs.length} doc(s)</span>}
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPlanForm({ open: true, initial: p })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setPlanToDelete(p)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground self-center shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="team" className="pt-5">
          <TeamPanel project={project} team={projectTeamAllocs} onChange={updateTeam} />
        </TabsContent>

        <TabsContent value="gantt" className="pt-5 space-y-4">
          <div className="text-xs text-muted-foreground">
            Weekly timeline of scheduled activities across all plans, with dependency arrows. Click
            a bar to open it.
          </div>
          <ProjectActivitiesGantt project={project} activities={projectActs} />
        </TabsContent>

        <TabsContent value="integrations" className="pt-5 space-y-4">
          <Card className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Linked external work</div>
              <div className="text-xs text-muted-foreground">
                Pull issues from Jira and Linear that relate to this project.
              </div>
            </div>
            <Link
              to="/settings"
              search={{ tab: "integrations" }}
              className="text-xs text-primary hover:underline"
            >
              Manage integrations →
            </Link>
          </Card>
          <LinkedIssuesPanel projectId={project.id} connectedProviders={connectedProviders} />
          {!connectedProviders.length && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((c) => (
                <IntegrationConnectCard
                  key={c.provider}
                  provider={c.provider}
                  connection={c}
                  onChange={updateConnection}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProjectForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={saveProject}
        initial={project}
      />
      <PlanForm
        open={planForm.open}
        onClose={() => setPlanForm({ open: false, initial: null })}
        onSave={upsertPlan}
        initial={planForm.initial ?? null}
        project={project}
      />
      <AlertDialog open={toDelete} onOpenChange={(v) => !v && setToDelete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {project.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Allocations, plans and activities under this project will be removed too.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={removeProject}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!planToDelete} onOpenChange={(v) => !v && setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {planToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Activities under this plan will also be removed (you can undo from the toast).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (planToDelete) removePlan(planToDelete);
                setPlanToDelete(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function OverviewTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?: "good" | "warn";
}) {
  return (
    <Card
      className={cn(
        "p-4 pop-in",
        tone === "good" && "border-success/30",
        tone === "warn" && "border-warning/30",
      )}
    >
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wide">
        <span
          className={cn(
            "h-6 w-6 rounded-md flex items-center justify-center",
            tone === "good"
              ? "bg-success/10 text-success"
              : tone === "warn"
                ? "bg-warning/10 text-warning"
                : "bg-muted",
          )}
        >
          {icon}
        </span>
        {label}
      </div>
      <div
        className={cn(
          "text-xl font-semibold mt-1 tabular-nums",
          tone === "good" && "text-success",
          tone === "warn" && "text-warning",
        )}
      >
        {value}
      </div>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="font-semibold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
