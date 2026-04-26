import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Briefcase,
  Trash2,
  MoreHorizontal,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@pulse-hr/ui/primitives/dropdown-menu";
import { Avatar, PageHeader, StatusBadge } from "@/components/app/AppShell";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { SkeletonRows } from "@pulse-hr/ui/atoms/SkeletonList";
import { employeeById, type Commessa, type ProjectStatus } from "@/lib/mock-data";
import { commesseTable, useCommesse } from "@/lib/tables/commesse";
import { useClients } from "@/lib/tables/clients";
import { ProjectForm } from "@/components/pm/ProjectForm";
import { projectTeam } from "@/lib/projects";

type ProjectsSearch = { q?: string; client?: string; status?: ProjectStatus };

export const Route = createFileRoute("/projects/")({
  head: () => ({ meta: [{ title: "Projects — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): ProjectsSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    client: typeof s.client === "string" ? s.client : undefined,
    status: typeof s.status === "string" ? (s.status as ProjectStatus) : undefined,
  }),
  component: ProjectsIndex,
});

function ProjectsIndex() {
  const nav = useNavigate({ from: "/projects/" });
  const search = Route.useSearch();
  const setSearch = (patch: Partial<ProjectsSearch>) =>
    nav({ search: (prev: ProjectsSearch) => ({ ...prev, ...patch }) });

  const projects = useCommesse();
  const clients = useClients();
  const [loading, setLoading] = useState(true);
  const [projectForm, setProjectForm] = useState<{
    open: boolean;
    initial?: Commessa | null;
    lockedClientId?: string;
  }>({ open: false });
  const [projectToDelete, setProjectToDelete] = useState<Commessa | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  const q = search.q ?? "";
  const filtered = useMemo(
    () =>
      projects
        .filter((p) => !search.client || p.clientId === search.client)
        .filter((p) => !search.status || p.status === search.status)
        .filter(
          (p) =>
            !q ||
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.code.toLowerCase().includes(q.toLowerCase()),
        ),
    [projects, q, search.client, search.status],
  );

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

  const STATUSES: ProjectStatus[] = ["active", "at_risk", "on_hold", "draft", "done", "closed"];

  return (
    <div className="p-4 md:p-6 fade-in space-y-5">
      <PageHeader
        title="Projects"
        description="Every active engagement across all clients."
        actions={
          <Button onClick={() => setProjectForm({ open: true, initial: null })}>
            <Plus className="h-4 w-4 mr-2" />
            New project
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-3 border-b">
          <div className="relative flex-1 min-w-[200px]">
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
          <select
            className="h-9 px-3 text-sm bg-background border rounded-md"
            value={search.status ?? ""}
            onChange={(e) =>
              setSearch({ status: (e.target.value || undefined) as ProjectStatus | undefined })
            }
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <SkeletonRows rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            tone={q || search.client || search.status ? "filter" : "welcome"}
            icon={<Briefcase className="h-5 w-5" />}
            title={q || search.client || search.status ? "No matches" : "No projects yet"}
            description={
              q || search.client || search.status
                ? "Try clearing filters or change the search."
                : "Create the first project for this workspace."
            }
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
                {filtered.map((p) => {
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
                      onClick={() => nav({ to: "/projects/$projectId", params: { projectId: p.id } })}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-1.5 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">{p.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          to="/clients/$clientId"
                          params={{ clientId: p.clientId }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm hover:underline inline-flex items-center gap-1.5"
                        >
                          <Building2 className="h-3 w-3 text-muted-foreground" />
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

      <ProjectForm
        open={projectForm.open}
        onClose={() => setProjectForm({ open: false })}
        onSave={upsertProject}
        initial={projectForm.initial}
        lockedClientId={projectForm.lockedClientId}
      />
      <AlertDialog open={!!projectToDelete} onOpenChange={(v) => !v && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {projectToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              All plans, allocations and activities under this project will also be removed.
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

export default ProjectsIndex;
