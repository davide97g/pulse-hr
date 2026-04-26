import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Layers,
  Calendar,
  Users as UsersIcon,
  ListChecks,
  Mail,
  ExternalLink,
  HelpCircle,
  Plus,
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
import { Avatar, PageHeader } from "@/components/app/AppShell";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import {
  employeeById,
  type Activity,
  type Plan,
} from "@/lib/mock-data";
import { useClients } from "@/lib/tables/clients";
import { useCommesse } from "@/lib/tables/commesse";
import { plansTable, usePlans } from "@/lib/tables/plans";
import { activitiesTable, useActivities } from "@/lib/tables/activities";
import { useAllocations } from "@/lib/tables/allocations";
import { ActivityBoard } from "@/components/pm/ActivityBoard";
import { PlanForm } from "@/components/pm/PlanForm";
import { PlanContactsEditor } from "@/components/pm/PlanContactsEditor";
import { PlanDocsEditor } from "@/components/pm/PlanDocsEditor";
import { PlanFaqEditor } from "@/components/pm/PlanFaqEditor";
import { PlanTeamEditor } from "@/components/pm/PlanTeamEditor";
import { CapacityBar } from "@/components/pm/CapacityBar";
import { employeeCapacityRow } from "@/lib/capacity";

type PlanSection = "overview" | "activities" | "team" | "contacts" | "faq";
type PlanSearch = { tab?: PlanSection };

export const Route = createFileRoute("/projects/$projectId/plans/$planId")({
  head: () => ({ meta: [{ title: "Plan — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): PlanSearch => ({
    tab: (s.tab as PlanSection) || undefined,
  }),
  component: PlanDetail,
});

function PlanDetail() {
  const { projectId, planId } = useParams({ from: "/projects/$projectId/plans/$planId" });
  const nav = useNavigate({ from: "/projects/$projectId/plans/$planId" });
  const search = Route.useSearch();
  const section = search.tab ?? "overview";
  const setSection = (v: string) =>
    nav({
      search: (prev) => ({
        ...prev,
        tab: v === "overview" ? undefined : (v as PlanSection),
      }),
    });

  const projects = useCommesse();
  const clients = useClients();
  const allocations = useAllocations();
  const plans = usePlans();
  const activities = useActivities();

  const [editOpen, setEditOpen] = useState(false);
  const [toDelete, setToDelete] = useState(false);

  const plan = plans.find((p) => p.id === planId);
  const project = projects.find((p) => p.id === projectId);
  const client = project ? clients.find((c) => c.id === project.clientId) : null;
  const planActivities = useMemo(
    () => activities.filter((a) => a.planId === planId).sort((a, b) => a.order - b.order),
    [activities, planId],
  );

  if (!plan || !project) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Layers className="h-5 w-5" />}
          title="Plan not found"
          action={
            <Button onClick={() => nav({ to: "/projects/$projectId", params: { projectId } })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to project
            </Button>
          }
        />
      </div>
    );
  }

  const savePlan = (next: Plan) => {
    plansTable.update(next.id, next);
    toast.success(`Plan “${next.name}” saved`);
  };
  const removePlan = () => {
    const orphanedActs = activitiesTable.getAll().filter((a) => a.planId === plan.id);
    plansTable.remove(plan.id);
    for (const a of orphanedActs) activitiesTable.remove(a.id);
    toast(`Removed ${plan.name}`, {
      description: orphanedActs.length
        ? `${orphanedActs.length} activit${orphanedActs.length === 1 ? "y" : "ies"} also removed`
        : undefined,
      action: {
        label: "Undo",
        onClick: () => {
          plansTable.add(plan);
          for (const a of orphanedActs) activitiesTable.add(a);
        },
      },
    });
    nav({ to: "/projects/$projectId", params: { projectId } });
  };

  const updateActivities = (next: Activity[]) => {
    const others = activitiesTable.getAll().filter((a) => a.planId !== plan.id);
    activitiesTable.replace([...others, ...next]);
  };
  const patch = (delta: Partial<Plan>) => savePlan({ ...plan, ...delta });

  return (
    <div className="p-4 md:p-6 fade-in space-y-5">
      <div>
        <Link
          to="/projects/$projectId"
          params={{ projectId }}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          {project.name}
        </Link>
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-muted-foreground" />
              {plan.name}
              <Badge variant="outline" className="text-[10px] uppercase">
                {plan.status}
              </Badge>
            </span>
          }
          description={
            <span className="text-xs">
              {client?.name} · <span className="font-mono">{project.code}</span> ·{" "}
              {plan.startDate} → {plan.endDate}
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          icon={<Calendar className="h-4 w-4" />}
          label="Period"
          value={`${plan.startDate.slice(5)} → ${plan.endDate.slice(5)}`}
        />
        <StatTile
          icon={<UsersIcon className="h-4 w-4" />}
          label="Team"
          value={plan.team.length}
        />
        <StatTile
          icon={<ListChecks className="h-4 w-4" />}
          label="Activities"
          value={planActivities.length}
        />
        <StatTile
          icon={<HelpCircle className="h-4 w-4" />}
          label="FAQ entries"
          value={plan.faq.length}
        />
      </div>

      <Tabs value={section} onValueChange={setSection}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities ({planActivities.length})</TabsTrigger>
          <TabsTrigger value="team">Team ({plan.team.length})</TabsTrigger>
          <TabsTrigger value="contacts">Contacts &amp; Docs</TabsTrigger>
          <TabsTrigger value="faq">FAQ ({plan.faq.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-5 space-y-4">
          <Card className="p-5">
            <div className="font-semibold text-sm mb-2">Description</div>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {plan.description || "No description yet."}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm">Capacity</div>
              <div className="text-[11px] text-muted-foreground">
                Project allocations × overlap with plan period
              </div>
            </div>
            {plan.team.length === 0 ? (
              <div className="text-xs text-muted-foreground">No team members yet.</div>
            ) : (
              <div className="space-y-3">
                {plan.team.map((m) => {
                  const e = employeeById(m.employeeId);
                  const row = employeeCapacityRow(
                    m.employeeId,
                    project.id,
                    plan.startDate,
                    plan.endDate,
                    { activities, plans, allocations },
                  );
                  return (
                    <div key={m.employeeId} className="flex items-center gap-3">
                      {e && <Avatar initials={e.initials} color={e.avatarColor} size={28} />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium truncate">
                            {e?.name ?? m.employeeId}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            · {m.role}
                          </span>
                        </div>
                        <CapacityBar
                          capacity={row.capacityHours}
                          assigned={row.assignedHours}
                          compact
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="pt-5">
          {planActivities.length === 0 && (
            <Card className="p-5 mb-4">
              <EmptyState
                icon={<ListChecks className="h-5 w-5" />}
                title="No activities yet"
                description="Add activities — they're scheduled within this plan and consume capacity from project allocations."
              />
            </Card>
          )}
          <ActivityBoard
            planId={plan.id}
            activities={planActivities}
            onChange={updateActivities}
          />
        </TabsContent>

        <TabsContent value="team" className="pt-5">
          <Card className="p-5">
            <PlanTeamEditor
              team={plan.team}
              projectId={project.id}
              allocations={allocations}
              onChange={(team) => patch({ team })}
            />
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="pt-5 space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="font-semibold text-sm">Contacts</div>
            </div>
            <PlanContactsEditor
              planId={plan.id}
              contacts={plan.contacts}
              clientContacts={client?.contacts ?? []}
              onChange={(contacts) => patch({ contacts })}
            />
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <div className="font-semibold text-sm">Documentation</div>
            </div>
            <PlanDocsEditor planId={plan.id} docs={plan.docs} onChange={(docs) => patch({ docs })} />
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="pt-5">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm">FAQ</div>
            </div>
            <PlanFaqEditor planId={plan.id} faq={plan.faq} onChange={(faq) => patch({ faq })} />
          </Card>
        </TabsContent>
      </Tabs>

      <PlanForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={savePlan}
        initial={plan}
        project={project}
      />
      <AlertDialog open={toDelete} onOpenChange={(v) => !v && setToDelete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {plan.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Activities under this plan will also be removed (you can undo from the toast).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={removePlan}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wide">
        <span className="h-6 w-6 rounded-md flex items-center justify-center bg-muted">{icon}</span>
        {label}
      </div>
      <div className="text-xl font-semibold mt-1 tabular-nums">{value}</div>
    </Card>
  );
}

// Suppress unused import warnings
void Plus;
