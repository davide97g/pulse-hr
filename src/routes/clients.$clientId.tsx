import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Globe,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Avatar, PageHeader, StatusBadge } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import { ClientForm } from "@/components/pm/ClientForm";
import { ProjectForm } from "@/components/pm/ProjectForm";
import { ClientProjectsGantt } from "@/components/pm/ClientProjectsGantt";
import {
  clients as clientSeed,
  commesse as projectSeed,
  allocations as allocationSeed,
  employeeById,
  type Client,
  type Commessa,
} from "@/lib/mock-data";
import { clientMargin, projectTeam } from "@/lib/projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clients/$clientId")({
  head: () => ({ meta: [{ title: "Client — Pulse HR" }] }),
  component: ClientDetail,
});

const fmtEUR = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function ClientDetail() {
  const { clientId } = useParams({ from: "/clients/$clientId" });
  const nav = useNavigate();
  const [clients, setClients] = useState<Client[]>(clientSeed);
  const [projects, setProjects] = useState<Commessa[]>(projectSeed);
  const [editOpen, setEditOpen] = useState(false);
  const [projectForm, setProjectForm] = useState(false);
  const [toDelete, setToDelete] = useState(false);

  const client = clients.find((c) => c.id === clientId);
  const clientProjects = useMemo(
    () => projects.filter((p) => p.clientId === clientId),
    [projects, clientId],
  );
  const owner = client ? employeeById(client.accountOwnerId) : null;
  const margin = useMemo(() => (client ? clientMargin(client.id) : null), [client, projects]);
  const uniqueTeam = useMemo(() => {
    const ids = new Set<string>();
    for (const p of clientProjects)
      for (const a of allocationSeed.filter((al) => al.projectId === p.id)) ids.add(a.employeeId);
    return ids.size;
  }, [clientProjects]);

  if (!client) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Briefcase className="h-5 w-5" />}
          title="Client not found"
          description="It may have been removed."
          action={
            <Button onClick={() => nav({ to: "/clients" })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to clients
            </Button>
          }
        />
      </div>
    );
  }

  const saveClient = (next: Client) =>
    setClients((list) => list.map((c) => (c.id === next.id ? next : c)));
  const saveProject = (next: Commessa) =>
    setProjects((list) => {
      const exists = list.some((p) => p.id === next.id);
      return exists ? list.map((p) => (p.id === next.id ? next : p)) : [next, ...list];
    });
  const removeClient = () => {
    toast(`${client.name} removed`);
    nav({ to: "/clients", search: { section: "clients" } });
  };

  const rangeStart = clientProjects.reduce(
    (min, p) => (p.startDate < min ? p.startDate : min),
    "9999-12-31",
  );
  const rangeEnd = clientProjects.reduce(
    (max, p) => (p.endDate > max ? p.endDate : max),
    "0000-01-01",
  );

  return (
    <div className="p-4 md:p-6 fade-in space-y-5">
      <div>
        <Link
          to="/clients"
          search={{ section: "clients" }}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          All clients
        </Link>
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              <span
                className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: client.colorToken }}
              >
                {client.name
                  .split(" ")
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              {client.name}
              <Badge variant="outline" className="text-[10px]">
                {client.industry}
              </Badge>
            </span>
          }
          description={client.notes}
          actions={
            <>
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={() => setProjectForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New project
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile
              icon={<Briefcase className="h-4 w-4" />}
              label="Projects"
              value={clientProjects.length}
            />
            <KpiTile icon={<Users className="h-4 w-4" />} label="Team members" value={uniqueTeam} />
            <KpiTile
              icon={<Clock className="h-4 w-4" />}
              label="Hours (YTD)"
              value={margin ? margin.totalHours.toFixed(0) : "—"}
            />
            <KpiTile
              icon={<TrendingUp className="h-4 w-4" />}
              label="Margin (YTD)"
              value={margin ? fmtEUR.format(margin.margin) : "—"}
              tone={margin && margin.margin > 0 ? "good" : "warn"}
            />
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Account owner
          </div>
          {owner ? (
            <div className="flex items-center gap-3">
              <Avatar initials={owner.initials} color={owner.avatarColor} size={36} employeeId={owner.id} />
              <div>
                <div className="font-medium text-sm">{owner.name}</div>
                <div className="text-xs text-muted-foreground">{owner.role}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">—</div>
          )}
          <div className="h-px bg-border my-3" />
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              {client.contactEmail}
            </div>
            {client.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                {client.website}
              </div>
            )}
            <div className="text-muted-foreground">Contact: {client.contactName}</div>
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Project roadmap</div>
            <div className="text-xs text-muted-foreground">
              Every project for {client.name} on a single timeline.
            </div>
          </div>
        </div>
        {clientProjects.length > 0 ? (
          <ClientProjectsGantt
            projects={clientProjects}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
          />
        ) : (
          <Card className="p-8">
            <EmptyState
              icon={<Briefcase className="h-5 w-5" />}
              title="No projects yet"
              description={`Start the first engagement for ${client.name}.`}
              action={
                <Button onClick={() => setProjectForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New project
                </Button>
              }
            />
          </Card>
        )}
      </div>

      {clientProjects.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b text-sm font-semibold">Projects</div>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-5 py-2.5">Project</th>
                <th className="text-left font-medium px-3 py-2.5">Status</th>
                <th className="text-left font-medium px-3 py-2.5">Team</th>
                <th className="text-left font-medium px-3 py-2.5">Burn</th>
                <th className="text-right font-medium px-3 py-2.5">End</th>
              </tr>
            </thead>
            <tbody className="stagger-in">
              {clientProjects.map((p) => {
                const team = projectTeam(p.id).length;
                const burnPct = Math.round((p.burnedHours / Math.max(1, p.budgetHours)) * 100);
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
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {p.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-3 py-3 text-xs">{team}</td>
                    <td className="px-3 py-3 w-40">
                      <div className="text-[11px] tabular-nums mb-0.5">{burnPct}%</div>
                      <div className="h-1.5 bg-muted rounded overflow-hidden">
                        <div
                          className="h-full rounded"
                          style={{
                            width: `${Math.min(100, burnPct)}%`,
                            backgroundColor: burnPct > 100 ? "var(--destructive)" : p.color,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right text-xs tabular-nums">{p.endDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <ClientForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={saveClient}
        initial={client}
      />
      <ProjectForm
        open={projectForm}
        onClose={() => setProjectForm(false)}
        onSave={saveProject}
        lockedClientId={client.id}
      />
      <AlertDialog open={toDelete} onOpenChange={(v) => !v && setToDelete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {client.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This also removes every project linked to this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={removeClient}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function KpiTile({
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
    <div>
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
    </div>
  );
}
