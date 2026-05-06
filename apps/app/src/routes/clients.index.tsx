import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Building2,
  Trash2,
  MoreHorizontal,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  FileDown,
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
import { Avatar, PageHeader } from "@/components/app/AppShell";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { SkeletonRows } from "@pulse-hr/ui/atoms/SkeletonList";
import { employeeById, primaryContact, type Client } from "@/lib/mock-data";
import { clientsTable, useClients } from "@/lib/tables/clients";
import { commesseTable, useCommesse } from "@/lib/tables/commesse";
import { ClientForm } from "@/components/pm/ClientForm";
import { useBulkSelect, BulkBar, RowCheckbox, HeaderCheckbox } from "@/components/app/bulk";
import { clientMargin } from "@/lib/projects";
import { cn } from "@/lib/utils";

type ClientsSearch = { q?: string };

export const Route = createFileRoute("/clients/")({
  head: () => ({ meta: [{ title: "Clients — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): ClientsSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
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
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

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

  const bulk = useBulkSelect(filteredClients);

  const bulkDelete = () => {
    const targets = bulk.selectedRows;
    if (targets.length === 0) return;
    const relatedByClient = new Map<string, ReturnType<typeof commesseTable.getAll>>();
    for (const c of targets) {
      const related = commesseTable.getAll().filter((p) => p.clientId === c.id);
      relatedByClient.set(c.id, related);
      clientsTable.remove(c.id);
      for (const p of related) commesseTable.remove(p.id);
    }
    bulk.clear();
    const projectCount = Array.from(relatedByClient.values()).reduce(
      (n, list) => n + list.length,
      0,
    );
    toast(`Removed ${targets.length} client${targets.length === 1 ? "" : "s"}`, {
      description: projectCount ? `${projectCount} project(s) also removed` : undefined,
      action: {
        label: "Undo",
        onClick: () => {
          for (const c of targets) {
            clientsTable.add(c);
            for (const p of relatedByClient.get(c.id) ?? []) commesseTable.add(p);
          }
        },
      },
    });
  };

  const bulkExport = () => {
    const rows = bulk.selectedRows;
    if (rows.length === 0) return;
    const cols = ["id", "name", "industry", "accountOwnerId", "notes"];
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = [
      cols.join(","),
      ...rows.map((r) => cols.map((c) => esc(r[c as keyof Client])).join(",")),
    ].join("\n");
    const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-${rows.length}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} row${rows.length === 1 ? "" : "s"}`);
  };

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
    <div className="p-4 md:p-6 fade-in space-y-5">
      <PageHeader
        eyebrow="WORK · CLIENTI · ANAGRAFICA"
        title={
          <>
            <span className="spark-mark">Clienti</span>
            <span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
          </>
        }
        description="Account, contatti, referenti."
        actions={
          <>
            <Button variant="outline" onClick={() => nav({ to: "/projects" })}>
              <Briefcase className="h-4 w-4 mr-2" />
              View projects
            </Button>
            <Button onClick={() => setClientForm({ open: true, initial: null })}>
              <Plus className="h-4 w-4 mr-2" />
              New client
            </Button>
          </>
        }
      />

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
            tone={q ? "filter" : "welcome"}
            icon={<Building2 className="h-5 w-5" />}
            title={q ? "No clients match" : "No clients yet"}
            description={q ? "Try clearing the search, or add a new client." : "Add the first client to get started."}
            action={
              <Button onClick={() => setClientForm({ open: true, initial: null })}>
                <Plus className="h-4 w-4 mr-2" />
                New client
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin [&_table]:min-w-[760px]">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="w-10 px-3 py-2.5">
                    <HeaderCheckbox
                      allSelected={bulk.allSelected}
                      someSelected={bulk.someSelected}
                      onToggle={() => bulk.toggleAll(filteredClients)}
                    />
                  </th>
                  <th className="text-left font-medium px-5 py-2.5">Client</th>
                  <th className="text-left font-medium px-3 py-2.5">Industry</th>
                  <th className="text-left font-medium px-3 py-2.5">Owner</th>
                  <th className="text-left font-medium px-3 py-2.5">Reference person</th>
                  <th className="text-right font-medium px-3 py-2.5">Projects</th>
                  <th className="text-left font-medium px-3 py-2.5">Health</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody className="stagger-in">
                {filteredClients.map((c) => {
                  const projectsForClient = projects.filter((p) => p.clientId === c.id);
                  const owner = employeeById(c.accountOwnerId);
                  const primary = primaryContact(c);
                  return (
                    <tr
                      key={c.id}
                      className="border-t hover:bg-muted/30 cursor-pointer group"
                      onClick={() => nav({ to: "/clients/$clientId", params: { clientId: c.id } })}
                    >
                      <td className="px-3 py-3" onClick={(ev) => ev.stopPropagation()}>
                        <RowCheckbox
                          checked={bulk.isSelected(c.id)}
                          onChange={() => bulk.toggle(c.id)}
                          label={`Select ${c.name}`}
                        />
                      </td>
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
                            <div className="text-xs text-muted-foreground truncate max-w-[260px]">
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
                      <td className="px-3 py-3 text-xs">
                        {primary ? (
                          <div className="leading-tight">
                            <div className="font-medium text-foreground">{primary.name}</div>
                            <div className="text-muted-foreground">
                              {primary.role ?? primary.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
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
                                  nav({
                                    to: "/projects",
                                    search: { client: c.id },
                                  })
                                }
                              >
                                View projects
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
        <BulkBar
          count={bulk.count}
          onClear={bulk.clear}
          noun="client"
          actions={[
            {
              label: "Export CSV",
              icon: <FileDown className="h-3.5 w-3.5" />,
              onClick: bulkExport,
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-3.5 w-3.5" />,
              onClick: bulkDelete,
              tone: "destructive",
            },
          ]}
        />
      </Card>

      <ClientForm
        open={clientForm.open}
        onClose={() => setClientForm({ open: false, initial: null })}
        onSave={upsertClient}
        initial={clientForm.initial}
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

export default ClientsPage;
