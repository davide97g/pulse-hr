import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
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
import { projectsTable, useProjects } from "@/lib/tables/projects";
import { useClients } from "@/lib/tables/clients";
import { allocationsTable, useAllocations } from "@/lib/tables/allocations";
import { activitiesTable, useActivities } from "@/lib/tables/activities";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { ProjectForm } from "@/components/pm/ProjectForm";
import { type Project, type ProjectStatus } from "@/lib/mock-data";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "ATTIVA",
  at_risk: "A RISCHIO",
  on_hold: "PAUSA",
  draft: "BOZZA",
  done: "CHIUSA",
  closed: "ARCHIVIATA",
};

const STATUS_TONE: Record<ProjectStatus, string> = {
  active: "var(--spark)",
  at_risk: "var(--destructive)",
  on_hold: "var(--muted-foreground)",
  draft: "var(--muted-foreground)",
  done: "var(--muted-foreground)",
  closed: "var(--muted-foreground)",
};

const FILTERS: Array<{ key: "all" | ProjectStatus; label: string }> = [
  { key: "all", label: "TUTTE" },
  { key: "active", label: "ATTIVE" },
  { key: "at_risk", label: "RISCHIO" },
  { key: "on_hold", label: "PAUSA" },
  { key: "draft", label: "BOZZA" },
  { key: "done", label: "CHIUSE" },
];

const MONTHS_AXIS = ["GEN", "MAR", "MAG", "LUG", "SET", "NOV"];

const HOURS_PER_DAY = 8;
const fmtDays = (h: number) => {
  const d = h / HOURS_PER_DAY;
  return d >= 100 || Number.isInteger(d) ? `${Math.round(d)}gg` : `${d.toFixed(1)}gg`;
};

function monthOffset(iso: string, anchorYear: number): number {
  const d = new Date(iso);
  return (d.getFullYear() - anchorYear) * 12 + d.getMonth() + d.getDate() / 31;
}

export function ProjectsEditorial() {
  const navigate = useNavigate();
  const projects = useProjects();
  const clients = useClients();
  const allocations = useAllocations();
  const activities = useActivities();
  const employees = useEmployees();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | ProjectStatus>("all");
  const [projectForm, setProjectForm] = useState<{
    open: boolean;
    initial?: Project | null;
  }>({ open: false });
  const [toRemove, setToRemove] = useState<Project | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("ph-projects-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const today = useMemo(() => new Date(), []);
  const anchorYear = today.getFullYear();
  const todayOffset = today.getMonth() + today.getDate() / 31;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return projects
      .filter((p) => filter === "all" || p.status === filter)
      .filter(
        (p) =>
          !term ||
          p.name.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term) ||
          p.client.toLowerCase().includes(term),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [projects, q, filter]);

  const summary = useMemo(() => {
    const active = projects.filter((p) => p.status === "active").length;
    const atRisk = projects.filter((p) => p.status === "at_risk").length;
    const totBudget = projects.reduce((s, p) => s + p.budgetHours, 0);
    const totBurned = projects.reduce((s, p) => s + p.burnedHours, 0);
    return {
      total: projects.length,
      active,
      atRisk,
      totBudgetDays: Math.round(totBudget / HOURS_PER_DAY),
      totBurnedDays: Math.round(totBurned / HOURS_PER_DAY),
      utilization: totBudget > 0 ? Math.round((totBurned / totBudget) * 100) : 0,
    };
  }, [projects]);

  const statusBreakdown = useMemo(() => {
    const counts: Array<[ProjectStatus, number]> = (
      ["active", "at_risk", "on_hold", "draft", "done"] as ProjectStatus[]
    ).map((s) => [s, projects.filter((p) => p.status === s).length]);
    return counts;
  }, [projects]);

  const upcoming = useMemo(() => {
    const now = today.getTime();
    return projects
      .filter((p) => p.status !== "closed" && p.status !== "done" && p.status !== "draft")
      .map((p) => ({ p, days: Math.round((new Date(p.endDate).getTime() - now) / 86_400_000) }))
      .filter((x) => x.days >= -2 && x.days <= 60)
      .sort((a, b) => a.days - b.days)
      .slice(0, 5);
  }, [projects, today]);

  const upsertProject = (p: Project) => {
    const exists = projectsTable.getAll().some((x) => x.id === p.id);
    if (exists) projectsTable.update(p.id, p);
    else projectsTable.add(p);
    toast.success(`Project «${p.name}» salvata`);
  };

  const removeProject = (p: Project) => {
    const relAllocations = allocationsTable.getAll().filter((a) => a.projectId === p.id);
    const relActivities = activitiesTable.getAll().filter((a) => a.projectId === p.id);
    projectsTable.remove(p.id);
    for (const a of relAllocations) allocationsTable.remove(a.id);
    for (const a of relActivities) activitiesTable.remove(a.id);
    toast(`Rimossa ${p.name}`, {
      description:
        relAllocations.length || relActivities.length
          ? `${relAllocations.length} allocazioni e ${relActivities.length} attività rimosse`
          : undefined,
      action: {
        label: "Annulla",
        onClick: () => {
          projectsTable.add(p);
          for (const a of relAllocations) allocationsTable.add(a);
          for (const a of relActivities) activitiesTable.add(a);
        },
      },
    });
  };

  const monthLabel = today.toLocaleDateString("it-IT", { month: "long", year: "numeric" });

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-5 min-h-full">
      {/* HEADER */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            PROJECTS · {monthLabel.toUpperCase()} · {summary.active} ATTIVE
            {summary.atRisk > 0 && (
              <>
                {" · "}
                <span style={{ color: "var(--destructive)" }}>{summary.atRisk} A RISCHIO</span>
              </>
            )}{" "}
            · {summary.totBudgetDays}gg STIMATI
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "8px 0 0",
              fontSize: "clamp(40px, 11vw, 92px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Projects</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="pill pill-dark pill-sm"
            onClick={() => setProjectForm({ open: true, initial: null })}
          >
            + Nuova
          </button>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex-1 min-w-[240px] flex items-center gap-2.5"
          style={{
            border: "1px solid var(--line-strong)",
            borderRadius: 999,
            padding: "8px 14px",
            background: "var(--bg)",
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ⌕
          </span>
          <input
            id="ph-projects-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca per codice, nome, cliente…"
            className="flex-1 bg-transparent border-0 outline-none"
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 17,
              color: "var(--fg)",
            }}
          />
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {q ? "" : "/"}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className="t-mono"
                style={{
                  padding: "5px 10px",
                  borderRadius: 999,
                  border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--paper)" : "var(--fg-2)",
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* IMPACT GRID — 80% atlas + 20% rail */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "minmax(0, 4fr) minmax(0, 1fr)" }}
      >
        {/* BURN ATLAS */}
        <section
          style={{
            border: "1px solid var(--line-strong)",
            borderRadius: 18,
            padding: "20px 22px",
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Atlas KPIs */}
          <div
            className="grid gap-4 items-center"
            style={{
              gridTemplateColumns: "1.2fr repeat(4, 1fr)",
              paddingBottom: 14,
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div>
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                BURN ATLAS
              </span>
              <div
                style={{
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontStyle: "italic",
                  fontSize: 24,
                  letterSpacing: "-0.02em",
                  marginTop: 4,
                  lineHeight: 1.05,
                }}
              >
                {summary.active} attività,
                <br />
                una vista <span style={{ color: "var(--spark)" }}>sola</span>.
              </div>
            </div>
            <KpiTile label="STIMA" value={`${summary.totBudgetDays}gg`} sub={`${summary.total} project`} />
            <KpiTile
              label="BRUCIATO"
              value={`${summary.totBurnedDays}gg`}
              sub={`${summary.utilization}% del totale`}
            />
            <KpiTile
              label="RISCHIO"
              value={`${summary.atRisk}`}
              sub={summary.atRisk === 0 ? "tutto a posto" : "da rivedere"}
              spark={summary.atRisk > 0}
            />
            <KpiTile
              label="UTILIZZO"
              value={`${summary.utilization}%`}
              sub={`${employees.length} persone`}
            />
          </div>

          {/* Time axis */}
          <div
            className="grid gap-3 items-center"
            style={{ gridTemplateColumns: "200px 1fr 110px" }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              PROJECT · CLIENTE
            </span>
            <div style={{ position: "relative", height: 18 }}>
              {MONTHS_AXIS.map((m, i) => (
                <span
                  key={m}
                  className="t-mono"
                  style={{
                    position: "absolute",
                    left: `${(i / (MONTHS_AXIS.length - 1)) * 100}%`,
                    transform: "translateX(-50%)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {m}
                </span>
              ))}
              <span
                className="t-mono"
                style={{
                  position: "absolute",
                  left: `${(todayOffset / 11) * 100}%`,
                  transform: "translateX(-50%)",
                  color: "var(--spark)",
                  fontWeight: 700,
                }}
              >
                OGGI
              </span>
            </div>
            <span
              className="t-mono"
              style={{ color: "var(--muted-foreground)", textAlign: "right" }}
            >
              STIMA / BURN
            </span>
          </div>

          {/* Lanes */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overflow: "auto",
              paddingRight: 4,
              maxHeight: 480,
            }}
          >
            {filtered.length === 0 ? (
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
                {q || filter !== "all" ? "NESSUNA PROJECT — PULISCI I FILTRI" : "NESSUNA PROJECT"}
              </div>
            ) : (
              filtered.map((p) => {
                const sx = Math.max(0, monthOffset(p.startDate, anchorYear));
                const ex = Math.min(11.99, monthOffset(p.endDate, anchorYear));
                const span = Math.max(2, (ex - sx) / 11) * 100;
                const left = (sx / 11) * 100;
                const burnPct = Math.min(150, Math.round((p.burnedHours / Math.max(1, p.budgetHours)) * 100));
                const over = burnPct > 100;
                const isAtRisk = p.status === "at_risk";
                const isPaused = p.status === "on_hold";
                const isDraft = p.status === "draft";
                const burnFraction = Math.min(
                  1,
                  p.burnedHours / Math.max(1, p.budgetHours),
                );
                const plannedSpan = ex - sx;
                const burnedSpan = plannedSpan * burnFraction;
                const burnedWidth = (Math.min(burnedSpan, todayOffset - sx) / 11) * 100;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      navigate({ to: "/projects/$projectId", params: { projectId: p.id } })
                    }
                    className="grid gap-3 items-center text-left"
                    style={
                      {
                        gridTemplateColumns: "200px 1fr 110px",
                        background: "transparent",
                        border: 0,
                        padding: "6px 0",
                        cursor: "pointer",
                      } as CSSProperties
                    }
                  >
                    <div className="min-w-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            background: STATUS_TONE[p.status],
                            flexShrink: 0,
                          }}
                        />
                        <span
                          className="truncate"
                          style={{
                            fontFamily: "Fraunces, ui-serif, serif",
                            fontStyle: "italic",
                            fontSize: 17,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {p.name}
                        </span>
                      </div>
                      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                        {(clients.find((c) => c.id === p.clientId)?.name ?? p.client) + " · " + p.code}
                      </span>
                    </div>

                    <div
                      style={{
                        position: "relative",
                        height: 28,
                        background: "var(--bg-2)",
                        borderRadius: 4,
                        border: "1px solid var(--line)",
                      }}
                    >
                      {/* today line */}
                      <span
                        style={{
                          position: "absolute",
                          left: `${(todayOffset / 11) * 100}%`,
                          top: -4,
                          bottom: -4,
                          width: 1,
                          background: "var(--spark)",
                          opacity: 0.7,
                        }}
                      />
                      {/* planned duration */}
                      <div
                        style={{
                          position: "absolute",
                          left: `${left}%`,
                          width: `${span}%`,
                          top: 5,
                          bottom: 5,
                          background: isPaused
                            ? "repeating-linear-gradient(45deg, var(--ink-3) 0 4px, transparent 4px 8px)"
                            : isDraft
                              ? "repeating-linear-gradient(90deg, var(--ink-3) 0 2px, transparent 2px 5px)"
                              : "var(--ink-3)",
                          opacity: 0.5,
                          borderRadius: 3,
                        }}
                      />
                      {/* burned portion */}
                      {!isDraft && (
                        <div
                          style={{
                            position: "absolute",
                            left: `${left}%`,
                            width: `${Math.max(0, burnedWidth)}%`,
                            top: 5,
                            bottom: 5,
                            background: isAtRisk || over ? "var(--spark)" : "var(--fg)",
                            borderRadius: 3,
                          }}
                        />
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className="t-num"
                        style={{
                          fontSize: 18,
                          letterSpacing: "-0.02em",
                          color: over ? "var(--spark)" : "var(--fg)",
                          fontWeight: over ? 700 : 400,
                        }}
                      >
                        {burnPct}%
                      </span>
                      <span
                        className="t-mono"
                        style={{ color: "var(--muted-foreground)", fontSize: 9 }}
                      >
                        {fmtDays(p.burnedHours)}/{fmtDays(p.budgetHours)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Legend */}
          <div
            className="flex flex-wrap gap-4"
            style={{ paddingTop: 10, borderTop: "1px solid var(--line)" }}
          >
            {[
              ["■", "var(--ink-3)", "DURATA PIANIFICATA"],
              ["■", "var(--fg)", "GIORNI BRUCIATI"],
              ["■", "var(--spark)", "SFORAMENTO / RISCHIO"],
              ["▏", "var(--spark)", "OGGI"],
            ].map(([sym, col, label]) => (
              <span
                key={label}
                className="t-mono inline-flex items-center gap-1.5"
                style={{ color: "var(--muted-foreground)" }}
              >
                <span style={{ color: col, fontSize: 14 }}>{sym}</span>
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* INSIGHT RAIL */}
        <aside className="flex flex-col gap-3 min-h-0">
          {/* SIGNAL */}
          {summary.atRisk > 0 ? (
            <div
              className="rail-spark"
              style={{
                border: "1px solid var(--spark)",
                background: "color-mix(in oklch, var(--spark) 10%, transparent)",
                borderRadius: 14,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span className="t-mono">SEGNALE · OGGI</span>
              <div
                style={{
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontStyle: "italic",
                  fontSize: 18,
                  lineHeight: 1.2,
                }}
              >
                <span className="t-num" style={{ fontStyle: "normal" }}>
                  {summary.atRisk}
                </span>{" "}
                project a rischio richiedono attenzione.
              </div>
            </div>
          ) : (
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "12px 14px",
              }}
            >
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                NESSUN SEGNALE
              </span>
              <div
                style={{
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontStyle: "italic",
                  fontSize: 16,
                  marginTop: 4,
                }}
              >
                Tutti i project entro budget.
              </div>
            </div>
          )}

          {/* STATUS BREAKDOWN */}
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              STATUS · {summary.total} TOTALI
            </span>
            <div className="flex flex-col gap-1">
              {statusBreakdown.map(([s, n]) => (
                <div
                  key={s}
                  className="grid gap-1.5 items-center"
                  style={{ gridTemplateColumns: "70px 1fr 22px" }}
                >
                  <span className="t-mono" style={{ color: STATUS_TONE[s], fontSize: 9 }}>
                    {STATUS_LABEL[s]}
                  </span>
                  <div style={{ height: 4, background: "var(--line)", borderRadius: 999 }}>
                    <div
                      style={{
                        width: `${(n / Math.max(1, summary.total)) * 100}%`,
                        height: "100%",
                        background: STATUS_TONE[s],
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <span className="t-num" style={{ fontSize: 11, textAlign: "right" }}>
                    {n}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div
            style={{
              border: "1px solid var(--line-strong)",
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              AZIONI RAPIDE
            </span>
            <button
              type="button"
              onClick={() => setProjectForm({ open: true, initial: null })}
              className="flex items-center justify-between"
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: "var(--ink)",
                color: "var(--paper)",
                border: 0,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                + Nuova project
              </span>
              <span className="t-mono" style={{ color: "var(--spark)" }}>
                ⌘N
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/activities" })}
              className="flex items-center justify-between"
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: "transparent",
                color: "var(--fg)",
                border: "1px solid var(--line)",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontStyle: "italic",
                  fontSize: 16,
                }}
              >
                + Nuova attività
              </span>
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                →
              </span>
            </button>
          </div>

          {/* DEADLINES */}
          <div
            style={{
              flex: 1,
              minHeight: 120,
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              SCADENZE · 60G
            </span>
            {upcoming.length === 0 ? (
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                NESSUNA NEI PROSSIMI 60 GIORNI
              </span>
            ) : (
              upcoming.map(({ p, days }, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    navigate({ to: "/projects/$projectId", params: { projectId: p.id } })
                  }
                  className="grid gap-2 items-baseline text-left"
                  style={{
                    gridTemplateColumns: "60px 1fr",
                    background: "transparent",
                    border: 0,
                    padding: "6px 0",
                    borderTop: i === 0 ? "none" : "1px solid var(--line)",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="t-mono"
                    style={{
                      color: days < 7 ? "var(--spark)" : "var(--muted-foreground)",
                    }}
                  >
                    {days < 0 ? `${Math.abs(days)}g fa` : days === 0 ? "oggi" : `+${days}g`}
                  </span>
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 14,
                      lineHeight: 1.2,
                    }}
                  >
                    {p.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* COMPACT LIST */}
      <section
        style={{
          border: "1px solid var(--line)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          className="grid gap-3 items-center"
          style={{
            gridTemplateColumns: "200px 1fr 1fr 200px 80px 110px",
            padding: "10px 14px",
            borderBottom: "1px solid var(--line-strong)",
            background: "var(--bg-2)",
          }}
        >
          {["CODICE", "PROJECT", "CLIENTE", "BURN", "ATTIVITÀ", "STATO"].map((h, i) => (
            <span
              key={h}
              className="t-mono"
              style={{
                color: "var(--muted-foreground)",
                textAlign: i >= 4 ? "right" : "left",
              }}
            >
              {h}
            </span>
          ))}
        </div>
        {filtered.map((p) => {
          const owner = employeeById(p.ownerId);
          const teamSize = new Set(
            allocations.filter((a) => a.projectId === p.id).map((a) => a.employeeId),
          ).size;
          const projAct = activities.filter((a) => a.projectId === p.id);
          const open = projAct.filter(
            (a) => a.status !== "done" && a.status !== "blocked",
          ).length;
          const burnPct = Math.min(
            999,
            Math.round((p.burnedHours / Math.max(1, p.budgetHours)) * 100),
          );
          const over = burnPct > 100;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                navigate({ to: "/projects/$projectId", params: { projectId: p.id } })
              }
              className="grid gap-3 items-center text-left w-full"
              style={{
                gridTemplateColumns: "200px 1fr 1fr 200px 80px 110px",
                padding: "12px 14px",
                borderBottom: "1px solid var(--line)",
                background: "transparent",
                border: 0,
                cursor: "pointer",
              }}
            >
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {p.code}
              </span>
              <div className="min-w-0">
                <div
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 17,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {p.name}
                </div>
                {owner && (
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    {owner.name} · {teamSize} {teamSize === 1 ? "PERSONA" : "PERSONE"}
                  </span>
                )}
              </div>
              <span className="t-mono" style={{ color: "var(--fg-2)" }}>
                {clients.find((c) => c.id === p.clientId)?.name ?? p.client}
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="t-num"
                    style={{
                      fontSize: 13,
                      color: over ? "var(--spark)" : "var(--fg)",
                    }}
                  >
                    {fmtDays(p.burnedHours)} / {fmtDays(p.budgetHours)}
                  </span>
                  <span
                    className="t-mono"
                    style={{
                      color: over
                        ? "var(--spark)"
                        : burnPct > 85
                          ? "var(--fg)"
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
                      background: over ? "var(--spark)" : "var(--fg)",
                    }}
                  />
                </div>
              </div>
              <span className="t-num" style={{ fontSize: 16, textAlign: "right" }}>
                {open}
                <span className="t-mono" style={{ marginLeft: 4, color: "var(--muted-foreground)" }}>
                  / {projAct.length}
                </span>
              </span>
              <span
                className="t-mono"
                style={{ textAlign: "right", color: STATUS_TONE[p.status] }}
              >
                {STATUS_LABEL[p.status]}
              </span>
            </button>
          );
        })}
      </section>

      <ProjectForm
        open={projectForm.open}
        onClose={() => setProjectForm({ open: false })}
        onSave={upsertProject}
        initial={projectForm.initial}
      />

      <AlertDialog open={!!toRemove} onOpenChange={(v) => !v && setToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare {toRemove?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Verranno rimosse anche allocazioni e attività collegate.
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
    </div>
  );
}

function KpiTile({
  label,
  value,
  sub,
  spark,
}: {
  label: string;
  value: string;
  sub: string;
  spark?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        paddingLeft: 14,
        borderLeft: "1px solid var(--line)",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div
        className="t-num"
        style={{
          fontSize: 30,
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
          color: spark ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </div>
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {sub}
      </span>
    </div>
  );
}
