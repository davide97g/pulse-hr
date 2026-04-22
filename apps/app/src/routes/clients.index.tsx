import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Briefcase,
  Building2,
  Trash2,
  MoreHorizontal,
  TrendingUp,
  AlertTriangle,
  Mail,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { NewBadge } from "@/components/app/NewBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, PageHeader, StatusBadge } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import { SkeletonRows } from "@/components/app/SkeletonList";
import { employeeById, type Client, type Commessa } from "@/lib/mock-data";
import { clientsTable, useClients } from "@/lib/tables/clients";
import { commesseTable, useCommesse } from "@/lib/tables/commesse";
import { ClientForm } from "@/components/pm/ClientForm";
import { ProjectForm } from "@/components/pm/ProjectForm";
import { clientMargin, projectMargin, projectTeam } from "@/lib/projects";
import { cn } from "@/lib/utils";

type ClientsSearch = { section?: "clients" | "projects"; q?: string; client?: string };

export const Route = createFileRoute("/clients/")({
  head: () => ({ meta: [{ title: "Clients & Projects — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): ClientsSearch => ({
    section: (s.section as ClientsSearch["section"]) || undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    client: typeof s.client === "string" ? s.client : undefined,
  }),
  component: ClientsPage,
});

const fmtEUR = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function ClientsPage() {
  const nav = useNavigate({ from: "/clients" });
  const search = Route.useSearch();
  const section = search.section ?? "overview";
  const q = search.q ?? "";
  const setSearch = (patch: Partial<ClientsSearch>) =>
    nav({ search: (prev) => ({ ...prev, ...patch }) });

  const clients = useClients();
  const projects = useCommesse();
  const [loading, setLoading] = useState(true);
  const [clientForm, setClientForm] = useState<{ open: boolean; initial?: Client | null }>({
    open: false,
    initial: null,
  });
  const [projectForm, setProjectForm] = useState<{
    open: boolean;
    initial?: Commessa | null;
    lockedClientId?: string;
  }>({ open: false });
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Commessa | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  const filteredClients = useMemo(
    () =>
      clients.filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.industry.toLowerCase().includes(q.toLowerCase()),
      ),
    [clients, q],
  );
  const filteredProjects = useMemo(
    () =>
      projects
        .filter((p) => !search.client || p.clientId === search.client)
        .filter(
          (p) =>
            !q ||
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.code.toLowerCase().includes(q.toLowerCase()),
        ),
    [projects, q, search.client],
  );

  // ── CRUD ──
  const upsertClient = (c: Client) => {
    const exists = clientsTable.getAll().some((x) => x.id === c.id);
    if (exists) clientsTable.update(c.id, c);
    else clientsTable.add(c);
    toast.success(`Client “${c.name}” saved`);
  };
  const removeClient = (c: Client) => {
    const relatedProjects = commesseTable.getAll().filter((p) => p.clientId === c.id);
    clientsTable.remove(c.id);
    for (const p of relatedProjects) commesseTable.remove(p.id);
    toast(`Removed ${c.name}`, {
      description: relatedProjects.length
        ? `${relatedProjects.length} project(s) also removed`
        : undefined,
      action: {
        label: "Undo",
        onClick: () => {
          clientsTable.add(c);
          for (const p of relatedProjects) commesseTable.add(p);
        },
      },
    });
  };
  const upsertProject = (p: Commessa) => {
    const exists = commesseTable.getAll().some((x) => x.id === p.id);
    if (exists) commesseTable.update(p.id, p);
    else commesseTable.add(p);
    toast.success(`Project “${p.name}” saved`);
  };
  const removeProject = (p: Commessa) => {
    commesseTable.remove(p.id);
    toast(`Removed ${p.name}`, {
      action: { label: "Undo", onClick: () => commesseTable.add(p) },
    });
  };

  // ── KPIs ──
  const kpi = useMemo(() => {
    const activeProjects = projects.filter(
      (p) => p.status === "active" || p.status === "at_risk",
    ).length;
    const atRisk = projects.filter((p) => p.status === "at_risk" || p.status === "on_hold").length;
    const totalMargin = clients.reduce((s, c) => s + clientMargin(c.id).margin, 0);
    return {
      clientCount: clients.length,
      activeProjects,
      atRisk,
      totalMargin,
    };
  }, [clients, projects]);

  return (
    <div className="p-4 md:p-6 fade-in">
      <PageHeader
        title={
          <>
            Clients &amp; Projects <NewBadge />
          </>
        }
        description="Manage client accounts, their projects, teams, and delivery plans in one place."
        actions={
          <>
            <Button variant="outline" onClick={() => setClientForm({ open: true, initial: null })}>
              <Building2 className="h-4 w-4 mr-2" />
              New client
            </Button>
            <Button onClick={() => setProjectForm({ open: true, initial: null })}>
              <Plus className="h-4 w-4 mr-2" />
              New project
            </Button>
          </>
        }
      />

      <Tabs
        value={section}
        onValueChange={(v) =>
          setSearch({ section: v === "overview" ? undefined : (v as ClientsSearch["section"]) })
        }
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients ({clients.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              icon={<Building2 className="h-4 w-4" />}
              label="Clients"
              value={kpi.clientCount}
            />
            <KpiCard
              icon={<Briefcase className="h-4 w-4" />}
              label="Active projects"
              value={kpi.activeProjects}
            />
            <KpiCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="At risk / on hold"
              value={kpi.atRisk}
              tone="warn"
            />
            <KpiCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Margin YTD"
              value={fmtEUR.format(kpi.totalMargin)}
              tone="good"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">Top clients by margin</div>
                <Badge variant="outline" className="font-mono text-xs">
                  YTD
                </Badge>
              </div>
              <MarginList clients={clients} />
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">Projects by status</div>
              </div>
              <StatusBreakdown projects={projects} />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="pt-5">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 p-3 border-b">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search clients…"
                  className="pl-9"
                  value={q}
                  onChange={(e) => setSearch({ q: e.target.value || undefined })}
                />
              </div>
            </div>
            {loading ? (
              <SkeletonRows rows={5} />
            ) : filteredClients.length === 0 ? (
              <EmptyState
                icon={<Building2 className="h-5 w-5" />}
                title="No clients match"
                description="Try clearing the search, or add a new client."
                action={
                  <Button onClick={() => setClientForm({ open: true, initial: null })}>
                    <Plus className="h-4 w-4 mr-2" />
                    New client
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto scrollbar-thin [&_table]:min-w-[700px]">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground bg-muted/40">
                    <tr>
                      <th className="text-left font-medium px-5 py-2.5">Client</th>
                      <th className="text-left font-medium px-3 py-2.5">Industry</th>
                      <th className="text-left font-medium px-3 py-2.5">Owner</th>
                      <th className="text-right font-medium px-3 py-2.5">Projects</th>
                      <th className="text-left font-medium px-3 py-2.5">Health</th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody className="stagger-in">
                    {filteredClients.map((c) => {
                      const projectsForClient = projects.filter((p) => p.clientId === c.id);
                      const owner = employeeById(c.accountOwnerId);
                      return (
                        <tr
                          key={c.id}
                          className="border-t hover:bg-muted/30 cursor-pointer"
                          onClick={() =>
                            nav({ to: "/clients/$clientId", params: { clientId: c.id } })
                          }
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-medium text-xs"
                                style={{ backgroundColor: c.colorToken }}
                              >
                                {c.name
                                  .split(" ")
                                  .map((p) => p[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{c.name}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[240px]">
                                  {c.notes}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">{c.industry}</td>
                          <td className="px-3 py-3">
                            {owner ? (
                              <span className="inline-flex items-center gap-2 text-xs">
                                <Avatar
                                  initials={owner.initials}
                                  color={owner.avatarColor}
                                  size={22}
                                />
                                {owner.name}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-xs">
                            {projectsForClient.length}
                          </td>
                          <td className="px-3 py-3">
                            <HealthPill score={c.healthScore} />
                          </td>
                          <td className="px-2 py-3">
                            <div onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setClientForm({ open: true, initial: c })}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setProjectForm({
                                        open: true,
                                        initial: null,
                                        lockedClientId: c.id,
                                      })
                                    }
                                  >
                                    <Plus className="h-3.5 w-3.5 mr-2" />
                                    Add project
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setClientToDelete(c)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="pt-5">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 p-3 border-b">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects…"
                  className="pl-9"
                  value={q}
                  onChange={(e) => setSearch({ q: e.target.value || undefined })}
                />
              </div>
              <select
                className="h-9 px-3 text-sm bg-background border rounded-md"
                value={search.client ?? ""}
                onChange={(e) => setSearch({ client: e.target.value || undefined })}
              >
                <option value="">All clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {loading ? (
              <SkeletonRows rows={6} />
            ) : filteredProjects.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="h-5 w-5" />}
                title="No projects"
                description="Create the first project for this workspace."
                action={
                  <Button onClick={() => setProjectForm({ open: true })}>
                    <Plus className="h-4 w-4 mr-2" />
                    New project
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto scrollbar-thin [&_table]:min-w-[900px]">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground bg-muted/40">
                    <tr>
                      <th className="text-left font-medium px-5 py-2.5">Project</th>
                      <th className="text-left font-medium px-3 py-2.5">Client</th>
                      <th className="text-left font-medium px-3 py-2.5">Owner</th>
                      <th className="text-left font-medium px-3 py-2.5">Team</th>
                      <th className="text-left font-medium px-3 py-2.5">Burn</th>
                      <th className="text-left font-medium px-3 py-2.5">Status</th>
                      <th className="w-12" />
                    </tr>
                  </thead>
                  <tbody className="stagger-in">
                    {filteredProjects.map((p) => {
                      const owner = employeeById(p.ownerId);
                      const client = clients.find((c) => c.id === p.clientId);
                      const team = projectTeam(p.id).length;
                      const burnPct = Math.min(
                        100,
                        Math.round((p.burnedHours / Math.max(1, p.budgetHours)) * 100),
                      );
                      return (
                        <tr
                          key={p.id}
                          className="border-t hover:bg-muted/30 cursor-pointer"
                          onClick={() =>
                            nav({ to: "/projects/$projectId", params: { projectId: p.id } })
                          }
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-8 w-1.5 rounded-full"
                                style={{ backgroundColor: p.color }}
                              />
                              <div>
                                <div className="font-medium">{p.name}</div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {p.code}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <Link
                              to="/clients/$clientId"
                              params={{ clientId: p.clientId }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm hover:underline"
                            >
                              {client?.name ?? p.client}
                            </Link>
                          </td>
                          <td className="px-3 py-3">
                            {owner ? (
                              <span className="inline-flex items-center gap-2 text-xs">
                                <Avatar
                                  initials={owner.initials}
                                  color={owner.avatarColor}
                                  size={22}
                                />
                                {owner.name}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-3 py-3 text-xs">{team}</td>
                          <td className="px-3 py-3 w-44">
                            <div className="text-xs tabular-nums mb-1">
                              {p.burnedHours} / {p.budgetHours}h
                            </div>
                            <div className="h-1.5 bg-muted rounded overflow-hidden">
                              <div
                                className="h-full rounded"
                                style={{
                                  width: `${burnPct}%`,
                                  background:
                                    burnPct > 100
                                      ? "var(--destructive)"
                                      : burnPct > 85
                                        ? "var(--warning)"
                                        : p.color,
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="px-2 py-3">
                            <div onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setProjectForm({ open: true, initial: p })}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setProjectToDelete(p)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <ClientForm
        open={clientForm.open}
        onClose={() => setClientForm({ open: false, initial: null })}
        onSave={upsertClient}
        initial={clientForm.initial}
      />
      <ProjectForm
        open={projectForm.open}
        onClose={() => setProjectForm({ open: false })}
        onSave={upsertProject}
        initial={projectForm.initial}
        lockedClientId={projectForm.lockedClientId}
      />
      <AlertDialog open={!!clientToDelete} onOpenChange={(v) => !v && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {clientToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This also removes every project linked to this client (you can undo from the toast).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (clientToDelete) removeClient(clientToDelete);
                setClientToDelete(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!projectToDelete} onOpenChange={(v) => !v && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {projectToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              All allocations and activities under this project will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (projectToDelete) removeProject(projectToDelete);
                setProjectToDelete(null);
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

function KpiCard({
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
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div
          className={cn(
            "h-7 w-7 rounded-md flex items-center justify-center",
            tone === "good"
              ? "bg-success/10 text-success"
              : tone === "warn"
                ? "bg-warning/10 text-warning"
                : "bg-muted text-foreground",
          )}
        >
          {icon}
        </div>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-semibold tracking-tight mt-2">{value}</div>
    </Card>
  );
}

function HealthPill({ score }: { score: number }) {
  const tone = score >= 80 ? "success" : score >= 60 ? "warning" : "destructive";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
        tone === "success" && "bg-success/10 text-success border-success/30",
        tone === "warning" && "bg-warning/10 text-warning border-warning/30",
        tone === "destructive" && "bg-destructive/10 text-destructive border-destructive/30",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {score}
    </span>
  );
}

function MarginList({ clients }: { clients: Client[] }) {
  const rows = clients
    .map((c) => ({ client: c, margin: clientMargin(c.id).margin }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 5);
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.margin)));
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div
          key={r.client.id}
          className="grid grid-cols-[120px_1fr_90px] gap-3 items-center text-xs"
        >
          <div className="truncate font-medium">{r.client.name}</div>
          <div className="h-2 bg-muted rounded overflow-hidden">
            <div
              className="h-full rounded"
              style={{
                width: `${(Math.abs(r.margin) / max) * 100}%`,
                backgroundColor: r.client.colorToken,
              }}
            />
          </div>
          <div className="tabular-nums text-right">{fmtEUR.format(r.margin)}</div>
        </div>
      ))}
    </div>
  );
}

function StatusBreakdown({ projects }: { projects: Commessa[] }) {
  const groups = ["active", "at_risk", "on_hold", "done", "draft", "closed"] as const;
  return (
    <div className="space-y-2">
      {groups.map((s) => {
        const items = projects.filter((p) => p.status === s);
        if (!items.length) return null;
        return (
          <div key={s} className="flex items-center gap-3 text-xs">
            <div className="w-24">
              <StatusBadge status={s} />
            </div>
            <div className="flex-1 text-muted-foreground truncate">
              {items.map((p) => p.name).join(" • ")}
            </div>
            <div className="tabular-nums font-mono">{items.length}</div>
          </div>
        );
      })}
    </div>
  );
}

export default ClientsPage;

// Suppress unused import warnings for icons we may not use on every render
void Mail;
void Globe;
