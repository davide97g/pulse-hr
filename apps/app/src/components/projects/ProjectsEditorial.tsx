import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
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
import { Input } from "@pulse-hr/ui/primitives/input";
import { projectsTable, useProjects } from "@/lib/tables/projects";
import { useClients } from "@/lib/tables/clients";
import { allocationsTable, useAllocations } from "@/lib/tables/allocations";
import { activitiesTable, useActivities } from "@/lib/tables/activities";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { ProjectForm } from "@/components/pm/ProjectForm";
import {
  type Project,
  type ProjectStatus,
} from "@/lib/mock-data";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "ATTIVA",
  at_risk: "A RISCHIO",
  on_hold: "IN PAUSA",
  draft: "BOZZA",
  done: "CHIUSA",
  closed: "ARCHIVIATA",
};

function statusTone(status: ProjectStatus): string {
  switch (status) {
    case "active":
      return "var(--fg)";
    case "at_risk":
      return "var(--destructive)";
    case "on_hold":
      return "var(--muted-foreground)";
    case "draft":
      return "var(--muted-foreground)";
    case "done":
      return "var(--spark)";
    case "closed":
      return "var(--muted-foreground)";
    default:
      return "var(--muted-foreground)";
  }
}

const STATUS_ORDER: ProjectStatus[] = [
  "active",
  "at_risk",
  "on_hold",
  "draft",
  "done",
  "closed",
];

export function ProjectsEditorial() {
  const navigate = useNavigate();
  const projects = useProjects();
  const clients = useClients();
  const allocations = useAllocations();
  const activities = useActivities();
  const employees = useEmployees();

  const [q, setQ] = useState("");
  const [clientId, setClientId] = useState<string | "">("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [projectForm, setProjectForm] = useState<{
    open: boolean;
    initial?: Project | null;
    lockedClientId?: string;
  }>({ open: false });
  const [toRemove, setToRemove] = useState<Project | null>(null);

  // simple keyboard shortcut: '/' to focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        const el = document.getElementById("ph-projects-search") as HTMLInputElement | null;
        el?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return projects
      .filter((p) => !clientId || p.clientId === clientId)
      .filter((p) => !status || p.status === status)
      .filter(
        (p) =>
          !term ||
          p.name.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [projects, q, clientId, status]);

  const summary = useMemo(() => {
    const active = projects.filter((p) => p.status === "active").length;
    const atRisk = projects.filter((p) => p.status === "at_risk").length;
    const budgetK = Math.round(
      projects.reduce(
        (s, p) => s + p.budgetHours * (p.defaultBillableRate || 0),
        0,
      ) / 1000,
    );
    const burnedK = Math.round(
      projects.reduce(
        (s, p) => s + p.burnedHours * (p.defaultBillableRate || 0),
        0,
      ) / 1000,
    );
    return { active, atRisk, budgetK, burnedK };
  }, [projects]);

  const upsertProject = (p: Project) => {
    const exists = projectsTable.getAll().some((x) => x.id === p.id);
    if (exists) projectsTable.update(p.id, p);
    else projectsTable.add(p);
    toast.success(`Project “${p.name}” salvata`);
  };

  const removeProject = (p: Project) => {
    const relatedAllocations = allocationsTable
      .getAll()
      .filter((a) => a.projectId === p.id);
    const relatedActivities = activitiesTable
      .getAll()
      .filter((a) => a.projectId === p.id);
    projectsTable.remove(p.id);
    for (const a of relatedAllocations) allocationsTable.remove(a.id);
    for (const a of relatedActivities) activitiesTable.remove(a.id);
    toast(`Rimossa ${p.name}`, {
      description:
        relatedAllocations.length || relatedActivities.length
          ? `${relatedAllocations.length} allocazion${relatedAllocations.length === 1 ? "e" : "i"} e ${relatedActivities.length} attività rimosse`
          : undefined,
      action: {
        label: "Annulla",
        onClick: () => {
          projectsTable.add(p);
          for (const a of relatedAllocations) allocationsTable.add(a);
          for (const a of relatedActivities) activitiesTable.add(a);
        },
      },
    });
  };

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-6 min-h-[calc(100vh-3.5rem)]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            PROJECTS · {summary.active} ATTIVI · €{summary.burnedK}K SPESI / €{summary.budgetK}K BUDGET
            {summary.atRisk > 0 && (
              <>
                {" · "}
                <span style={{ color: "var(--destructive)" }}>
                  {summary.atRisk} A RISCHIO
                </span>
              </>
            )}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(72px, 9vw, 124px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Projects</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 14,
              maxWidth: 520,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 19,
              lineHeight: 1.35,
            }}
          >
            Ogni engagement attivo, su tutti i clienti.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="pill pill-dark pill-sm"
            onClick={() => setProjectForm({ open: true, initial: null })}
          >
            + Project
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          id="ph-projects-search"
          placeholder="Cerca projects… (premi /)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-[280px]"
        />
        <select
          className="h-9 px-3 text-sm bg-background border rounded-md"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="">Tutti i clienti</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="h-9 px-3 text-sm bg-background border rounded-md"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus | "")}
        >
          <option value="">Tutti gli stati</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        {(q || clientId || status) && (
          <button
            type="button"
            className="pill pill-ghost pill-sm"
            onClick={() => {
              setQ("");
              setClientId("");
              setStatus("");
            }}
          >
            Pulisci filtri
          </button>
        )}
      </div>

      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 14,
          flex: 1,
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          className="tab-row head"
          style={
            {
              "--cols": "10px 1.6fr 1fr 1fr 220px 130px 110px 36px",
              background: "var(--bg-2)",
            } as React.CSSProperties
          }
        >
          <span></span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            PROJECT
          </span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            CLIENTE
          </span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            RESPONSABILE
          </span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            BURN
          </span>
          <span
            className="t-mono"
            style={{ color: "var(--muted-foreground)", textAlign: "right" }}
          >
            ATTIVITÀ
          </span>
          <span
            className="t-mono"
            style={{ color: "var(--muted-foreground)", textAlign: "right" }}
          >
            STATO
          </span>
          <span></span>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {filtered.length === 0 ? (
            <div
              className="t-mono p-10 text-center"
              style={{ color: "var(--muted-foreground)" }}
            >
              {q || clientId || status
                ? "NESSUNA PROJECT — PULISCI I FILTRI"
                : "NESSUNA PROJECT"}
            </div>
          ) : (
            filtered.map((p) => {
              const owner = employeeById(p.ownerId);
              const client = clients.find((c) => c.id === p.clientId);
              const teamSize = new Set(
                allocations.filter((a) => a.projectId === p.id).map((a) => a.employeeId),
              ).size;
              const projectActivities = activities.filter((a) => a.projectId === p.id);
              const openActivities = projectActivities.filter(
                (a) => a.status !== "done" && a.status !== "blocked",
              ).length;
              const burnPct = Math.min(
                999,
                Math.round((p.burnedHours / Math.max(1, p.budgetHours)) * 100),
              );
              const overspend = burnPct > 100;
              return (
                <div
                  key={p.id}
                  className="tab-row"
                  onClick={() =>
                    navigate({
                      to: "/projects/$projectId",
                      params: { projectId: p.id },
                    })
                  }
                  style={
                    {
                      "--cols": "10px 1.6fr 1fr 1fr 220px 130px 110px 36px",
                      "--row-pad": "14px",
                      alignItems: "center",
                      cursor: "pointer",
                    } as React.CSSProperties
                  }
                >
                  <span
                    style={{
                      width: 4,
                      height: 28,
                      borderRadius: 4,
                      background: p.color,
                    }}
                  />
                  <div className="min-w-0">
                    <div
                      style={{
                        fontFamily: "Fraunces, ui-serif, serif",
                        letterSpacing: "-0.02em",
                        fontSize: 17,
                        fontWeight: 500,
                        lineHeight: 1.15,
                      }}
                    >
                      {p.name}
                    </div>
                    <span
                      className="t-mono"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {p.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate({
                        to: "/clients/$clientId",
                        params: { clientId: p.clientId },
                      });
                    }}
                    className="t-mono text-left"
                    style={{
                      background: "transparent",
                      border: 0,
                      color: "var(--fg-2)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {client?.name ?? p.client}
                  </button>
                  {owner ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="ph-avatar ph-avatar-sm">{owner.initials}</span>
                      <span
                        className="truncate"
                        style={{
                          fontFamily: "Fraunces, ui-serif, serif",
                          fontStyle: "italic",
                          fontSize: 16,
                        }}
                      >
                        {owner.name}
                      </span>
                    </div>
                  ) : (
                    <span
                      className="t-mono"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      —
                    </span>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="t-num"
                        style={{
                          fontSize: 13,
                          color: overspend ? "var(--destructive)" : "var(--fg)",
                        }}
                      >
                        {p.burnedHours}/{p.budgetHours}h
                      </span>
                      <span
                        className="t-mono"
                        style={{
                          color: overspend
                            ? "var(--destructive)"
                            : burnPct > 85
                              ? "var(--warning, var(--fg))"
                              : "var(--muted-foreground)",
                        }}
                      >
                        {burnPct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 3,
                        background: "var(--line)",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, burnPct)}%`,
                          height: "100%",
                          background: overspend
                            ? "var(--destructive)"
                            : burnPct > 85
                              ? "var(--warning, var(--fg))"
                              : p.color,
                        }}
                      />
                    </div>
                    <span
                      className="t-mono"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {teamSize} {teamSize === 1 ? "PERSONA" : "PERSONE"}
                    </span>
                  </div>
                  <span
                    className="t-num"
                    style={{ textAlign: "right", fontSize: 16 }}
                  >
                    {openActivities}
                    <span
                      className="t-mono"
                      style={{
                        marginLeft: 4,
                        color: "var(--muted-foreground)",
                      }}
                    >
                      / {projectActivities.length}
                    </span>
                  </span>
                  <span
                    className="t-mono"
                    style={{
                      textAlign: "right",
                      color: statusTone(p.status),
                    }}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="t-mono"
                        style={{
                          background: "transparent",
                          border: 0,
                          color: "var(--muted-foreground)",
                          cursor: "pointer",
                          padding: "0 4px",
                          lineHeight: 1,
                        }}
                        aria-label="Menu project"
                      >
                        ···
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          setProjectForm({ open: true, initial: p })
                        }
                      >
                        Modifica
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate({
                            to: "/projects/$projectId",
                            params: { projectId: p.id },
                          })
                        }
                      >
                        Apri dettaglio
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setToRemove(p)}
                      >
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ProjectForm
        open={projectForm.open}
        onClose={() => setProjectForm({ open: false })}
        onSave={upsertProject}
        initial={projectForm.initial}
        lockedClientId={projectForm.lockedClientId}
      />

      <AlertDialog
        open={!!toRemove}
        onOpenChange={(v) => !v && setToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare {toRemove?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Verranno rimosse anche le allocazioni e le attività collegate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toRemove) removeProject(toRemove);
                setToRemove(null);
              }}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {employees.length === 0 && null}
    </div>
  );
}
