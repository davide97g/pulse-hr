import { useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import { useProjects, projectsTable } from "@/lib/tables/projects";
import { useAllocations } from "@/lib/tables/allocations";
import { useActivities, activitiesTable } from "@/lib/tables/activities";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { ActivityDialog } from "@/components/pm/ActivityDialog";
import { ProjectForm } from "@/components/pm/ProjectForm";
import { clientById, type Activity, type ActivityStatus, type Project } from "@/lib/mock-data";

const MONTHS_IT_SHORT = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

const HOURS_PER_DAY = 8;
const fmtDays = (h: number) => {
  const d = h / HOURS_PER_DAY;
  return d >= 100 || Number.isInteger(d) ? `${Math.round(d)}gg` : `${d.toFixed(1)}gg`;
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtShort(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT_SHORT[d.getMonth()]}`;
}

const STATUS_LABEL: Record<ActivityStatus, string> = {
  todo: "TODO",
  in_progress: "IN COR.",
  review: "REVIEW",
  done: "DONE",
  blocked: "BLOCC.",
};

const STATUS_COLOR: Record<ActivityStatus, string> = {
  todo: "var(--fg-2)",
  in_progress: "var(--fg)",
  review: "var(--fg-2)",
  done: "var(--muted-foreground)",
  blocked: "var(--spark)",
};

type Tab = "activities" | "team" | "history";

export function ProjectEditorial({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const projects = useProjects();
  const allocations = useAllocations();
  const activities = useActivities();
  const employees = useEmployees();
  const project = projects.find((p) => p.id === projectId);

  const [tab, setTab] = useState<Tab>("activities");
  const [activityDialog, setActivityDialog] = useState<{
    open: boolean;
    initial: Activity | null;
  }>({ open: false, initial: null });
  const [editingProject, setEditingProject] = useState(false);

  const team = useMemo(() => {
    if (!project) return [];
    const ids = new Set(
      allocations.filter((a) => a.projectId === project.id).map((a) => a.employeeId),
    );
    return employees.filter((e) => ids.has(e.id));
  }, [allocations, employees, project]);

  const projectActivities = useMemo(
    () =>
      activities
        .filter((a) => a.projectId === projectId)
        .sort((a, b) => {
          const order = ["in_progress", "review", "blocked", "todo", "done"] as ActivityStatus[];
          const da = order.indexOf(a.status);
          const db = order.indexOf(b.status);
          if (da !== db) return da - db;
          const ad = a.endDate ? new Date(a.endDate).getTime() : Infinity;
          const bd = b.endDate ? new Date(b.endDate).getTime() : Infinity;
          return ad - bd;
        }),
    [activities, projectId],
  );

  const burnedHours = project?.burnedHours ?? 0;
  const budgetHours = project?.budgetHours ?? 0;

  // Burn-up: 12 weekly samples interpolating start→today
  const burn = useMemo(() => {
    const steps = 12;
    return Array.from({ length: steps }, (_, i) => {
      const t = (i + 1) / steps;
      const ease = 1 - Math.pow(1 - t, 1.6);
      return Math.round(burnedHours * ease);
    });
  }, [burnedHours]);
  const plan = useMemo(() => {
    const steps = 12;
    return Array.from({ length: steps }, (_, i) =>
      Math.round(((i + 1) / steps) * budgetHours),
    );
  }, [budgetHours]);

  if (!project) {
    return (
      <div className="p-12 flex flex-col items-center gap-4 min-h-[60vh] justify-center">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          PROJECT NON TROVATA
        </span>
        <button
          type="button"
          className="pill pill-ghost pill-sm"
          onClick={() => navigate({ to: "/projects" })}
        >
          ← Torna alle projects
        </button>
      </div>
    );
  }

  const client = clientById(project.clientId);
  const owner = employeeById(project.ownerId);
  const burnPct = Math.min(
    999,
    Math.round((project.burnedHours / Math.max(1, project.budgetHours)) * 100),
  );
  const over = burnPct > 100;
  const remainingDays = Math.max(0, project.budgetHours - project.burnedHours) / HOURS_PER_DAY;
  const marginPct = project.budgetHours
    ? Math.round(((project.budgetHours - project.burnedHours) / project.budgetHours) * 100)
    : 0;
  const teamFte = team.length || 0;

  const onSaveActivity = (a: Activity) => {
    const exists = activitiesTable.getAll().some((x) => x.id === a.id);
    if (exists) {
      activitiesTable.update(a.id, a);
      toast.success("Attività aggiornata");
    } else {
      activitiesTable.add(a);
      toast.success("Attività creata");
    }
  };

  const onSaveProject = (p: Project) => {
    projectsTable.update(p.id, p);
    toast.success(`Project «${p.name}» aggiornata`);
  };

  const titleParts = project.name.split(" ");
  const titleLead = titleParts.slice(0, Math.ceil(titleParts.length / 2)).join(" ");
  const titleTail = titleParts.slice(Math.ceil(titleParts.length / 2)).join(" ");

  return (
    <div
      className="ph p-4 md:p-6 grid gap-8 min-h-full"
      style={{ gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.3fr)" }}
    >
      {/* LEFT */}
      <section className="flex flex-col gap-5 min-w-0">
        {/* breadcrumb + actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => navigate({ to: "/projects" })}
            className="t-mono"
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid var(--line)",
              background: "transparent",
              color: "var(--muted-foreground)",
              cursor: "pointer",
            }}
          >
            ← PROJECTS
          </button>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {project.code}
          </span>
          <span className="dot" />
          <span className="t-mono" style={{ color: "var(--fg-2)" }}>
            {project.status.replace("_", " ").toUpperCase()}
          </span>
          <span className="flex-1" />
          <button
            type="button"
            className="pill pill-ghost pill-sm"
            onClick={() => setEditingProject(true)}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Modifica
          </button>
          <button
            type="button"
            className="pill pill-dark pill-sm"
            onClick={() => setActivityDialog({ open: true, initial: null })}
          >
            <Plus className="h-3 w-3 mr-1" />
            Attività
          </button>
        </div>

        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              fontSize: "clamp(56px, 7vw, 80px)",
              lineHeight: 0.86,
              letterSpacing: "-0.045em",
            }}
          >
            {titleLead}
            <br />
            <span style={{ fontStyle: "italic" }}>{titleTail || project.code}</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 14,
              maxWidth: 460,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 18,
              lineHeight: 1.35,
              letterSpacing: "-0.01em",
            }}
          >
            {client?.name ?? "Progetto interno"}.{" "}
            {teamFte > 0 ? `${teamFte} ${teamFte === 1 ? "persona" : "persone"} allocate, ` : ""}
            stima <span style={{ color: "var(--spark)" }}>{fmtDays(project.budgetHours)}</span>.
          </p>
        </div>

        {/* KPI band */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            borderTop: "1px solid var(--line-strong)",
            borderBottom: "1px solid var(--line)",
            padding: "14px 0",
          }}
        >
          <KpiCell label="STIMA" value={fmtDays(project.budgetHours)} sub={`${project.budgetHours}h`} first />
          <KpiCell
            label="BURN"
            value={fmtDays(project.burnedHours)}
            sub={`${burnPct}%`}
            spark={over}
          />
          <KpiCell
            label={over ? "SFORAMENTO" : "RIMANE"}
            value={over ? `${burnPct - 100}%` : `${fmtDays(remainingDays * HOURS_PER_DAY)}`}
            sub={`margine ${marginPct >= 0 ? "+" : ""}${marginPct}%`}
            spark={over}
          />
          <KpiCell
            label="TEAM"
            value={String(teamFte || "—")}
            sub={`${projectActivities.length} attività`}
          />
        </div>

        {/* Burn-up chart */}
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div className="flex justify-between items-baseline">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              BURN-UP · 12 SETT
            </span>
            <span
              className="t-mono"
              style={{ color: over ? "var(--spark)" : "var(--muted-foreground)" }}
            >
              {fmtDays(project.burnedHours)} bruciati
            </span>
          </div>
          <BurnUpChart burn={burn} plan={plan} max={Math.max(...plan, ...burn) || 1} />
          <div className="flex justify-between">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="t-mono"
                style={{ color: "var(--muted-foreground)", fontSize: 9 }}
              >
                S{i + 1}
              </span>
            ))}
          </div>
        </div>

        {/* meta strip */}
        <div
          className="grid gap-5 pt-4"
          style={{
            gridTemplateColumns: "1fr 1fr",
            borderTop: "1px solid var(--line-strong)",
          }}
        >
          <div className="flex flex-col gap-2">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              CLIENTE · CONTATTO
            </span>
            {client ? (
              <button
                type="button"
                onClick={() => navigate({ to: "/clients/$clientId", params: { clientId: client.id } })}
                className="flex items-center gap-2.5 text-left"
                style={{
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <span
                  className="ph-avatar ph-avatar-sm"
                  style={{ flexShrink: 0 }}
                >
                  {client.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 17,
                    }}
                  >
                    {client.name}
                  </div>
                </div>
              </button>
            ) : (
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                CLIENTE INTERNO
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              FINESTRA · TAG
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="t-num" style={{ fontSize: 14 }}>
                {fmtShort(project.startDate)} → {fmtShort(project.endDate)}
              </span>
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="chip"
                  style={{ border: "1px solid var(--line-strong)" }}
                >
                  {t.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT */}
      <section className="flex flex-col gap-4 min-w-0">
        {/* Tabs */}
        <div
          className="flex gap-5 flex-wrap"
          style={{ paddingBottom: 4, borderBottom: "1px solid var(--line-strong)" }}
        >
          {(
            [
              ["activities", "Attività", projectActivities.length],
              ["team", "Team", teamFte],
              ["history", "Storico", null],
            ] as Array<[Tab, string, number | null]>
          ).map(([id, label, n]) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                style={{
                  padding: "8px 0",
                  marginBottom: -1,
                  background: "transparent",
                  border: 0,
                  borderBottom: `2px solid ${active ? "var(--ink)" : "transparent"}`,
                  fontFamily: active ? "Inter, sans-serif" : "Fraunces, ui-serif, serif",
                  fontStyle: active ? "normal" : "italic",
                  fontSize: 17,
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--fg)" : "var(--muted-foreground)",
                  cursor: "pointer",
                  display: "inline-flex",
                  gap: 6,
                  alignItems: "baseline",
                }}
              >
                {label}
                {n !== null && (
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tab === "activities" && (
          <div className="flex flex-col gap-1 flex-1 min-h-0 overflow-auto">
            {projectActivities.length === 0 ? (
              <div
                className="t-mono"
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "var(--muted-foreground)",
                  border: "1px dashed var(--line)",
                  borderRadius: 12,
                }}
              >
                NESSUNA ATTIVITÀ — INIZIA CON «+ ATTIVITÀ»
              </div>
            ) : (
              projectActivities.map((a) => {
                const assignee = a.assigneeId ? employeeById(a.assigneeId) : null;
                return (
                  <div
                    key={a.id}
                    className="grid gap-3 items-center"
                    style={
                      {
                        gridTemplateColumns: "70px 1fr 90px 110px 28px",
                        padding: "11px 6px",
                        borderBottom: "1px solid var(--line)",
                        background:
                          a.status === "blocked"
                            ? "color-mix(in oklch, var(--spark) 5%, transparent)"
                            : "transparent",
                      } as CSSProperties
                    }
                  >
                    <span
                      className="t-mono"
                      style={{ color: STATUS_COLOR[a.status] }}
                    >
                      {STATUS_LABEL[a.status]}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/activities/$activityId",
                          params: { activityId: a.id },
                        })
                      }
                      className="text-left min-w-0"
                      style={{
                        background: "transparent",
                        border: 0,
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "Fraunces, ui-serif, serif",
                          fontStyle: "italic",
                          fontSize: 17,
                          letterSpacing: "-0.01em",
                          color: a.status === "done" ? "var(--muted-foreground)" : "var(--fg)",
                          textDecoration: a.status === "done" ? "line-through" : "none",
                        }}
                      >
                        {a.title}
                      </div>
                    </button>
                    <span className="t-num" style={{ fontSize: 13, textAlign: "right" }}>
                      {fmtDays(a.estimateHours)}
                    </span>
                    <span
                      className="t-mono"
                      style={{ color: "var(--muted-foreground)", textAlign: "right" }}
                    >
                      {assignee?.name.split(" ")[0] ?? "—"} · {fmtShort(a.endDate)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActivityDialog({ open: true, initial: a })}
                      aria-label="Modifica"
                      style={{
                        background: "transparent",
                        border: 0,
                        color: "var(--muted-foreground)",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "team" && (
          <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-auto">
            <div className="flex justify-between items-baseline">
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                TEAM ALLOCATO · {teamFte}
              </span>
              {owner && (
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  Owner · {owner.name}
                </span>
              )}
            </div>
            {team.length === 0 ? (
              <div
                className="t-mono"
                style={{
                  padding: 32,
                  textAlign: "center",
                  color: "var(--muted-foreground)",
                  border: "1px dashed var(--line)",
                  borderRadius: 12,
                }}
              >
                NESSUNA ALLOCAZIONE
              </div>
            ) : (
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                {team.map((emp) => {
                  const allocs = allocations.filter(
                    (a) => a.projectId === project.id && a.employeeId === emp.id,
                  );
                  const totalPct = allocs.reduce((s, a) => s + (a.percent ?? 0), 0);
                  return (
                    <div
                      key={emp.id}
                      className="flex items-center gap-2.5"
                      style={{
                        padding: "10px 12px",
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                      }}
                    >
                      <span className="ph-avatar ph-avatar-sm">{emp.initials}</span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className="truncate"
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 500,
                            fontSize: 13,
                          }}
                        >
                          {emp.name}
                        </span>
                        <span
                          className="t-mono"
                          style={{ color: "var(--muted-foreground)", fontSize: 9 }}
                        >
                          {emp.role}
                        </span>
                      </div>
                      <span className="t-num" style={{ fontSize: 13 }}>
                        {totalPct ? `${totalPct}%` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-auto">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              CRONOLOGIA
            </span>
            <div
              style={{
                padding: 18,
                border: "1px solid var(--line)",
                borderRadius: 12,
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 16,
                color: "var(--muted-foreground)",
              }}
            >
              Inizio: {fmtDate(project.startDate)} · Fine prevista: {fmtDate(project.endDate)}.
              Burn corrente: {fmtDays(project.burnedHours)} di {fmtDays(project.budgetHours)}.
            </div>
          </div>
        )}
      </section>

      <ActivityDialog
        open={activityDialog.open}
        onClose={() => setActivityDialog({ open: false, initial: null })}
        onSave={(a) => {
          // Always preserve projectId tie when creating from this view
          onSaveActivity({ ...a, projectId: project.id });
        }}
        initial={activityDialog.initial}
        projectId={project.id}
      />

      <ProjectForm
        open={editingProject}
        onClose={() => setEditingProject(false)}
        onSave={onSaveProject}
        initial={project}
      />
    </div>
  );
}

function KpiCell({
  label,
  value,
  sub,
  first,
  spark,
}: {
  label: string;
  value: string;
  sub?: string;
  first?: boolean;
  spark?: boolean;
}) {
  return (
    <div
      style={{
        paddingLeft: first ? 0 : 14,
        borderLeft: first ? "none" : "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div
        className="t-num"
        style={{
          fontSize: 28,
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          color: spark ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </div>
      {sub && (
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

function BurnUpChart({
  burn,
  plan,
  max,
}: {
  burn: number[];
  plan: number[];
  max: number;
}) {
  const w = 600;
  const h = 140;
  const pad = 10;
  const pt = (arr: number[], i: number) =>
    `${(i / (arr.length - 1)) * w} ${pad + (h - pad) * (1 - arr[i]! / max)}`;
  const planPath = "M " + plan.map((_, i) => pt(plan, i)).join(" L ");
  const burnPath = "M " + burn.map((_, i) => pt(burn, i)).join(" L ");
  const areaPath =
    burnPath + ` L ${w} ${h + pad - 10} L 0 ${h + pad - 10} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h + pad}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: 140 }}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <line
          key={g}
          x1={0}
          x2={w}
          y1={pad + g * (h - pad)}
          y2={pad + g * (h - pad)}
          stroke="var(--line)"
          strokeDasharray="2 4"
        />
      ))}
      <path d={planPath} fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d={areaPath} fill="color-mix(in oklch, var(--spark) 22%, transparent)" />
      <path d={burnPath} fill="none" stroke="var(--spark)" strokeWidth="2.5" />
    </svg>
  );
}
