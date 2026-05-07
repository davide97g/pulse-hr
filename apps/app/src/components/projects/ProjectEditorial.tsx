import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProjects } from "@/lib/tables/projects";
import { useAllocations } from "@/lib/tables/allocations";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { clientById, type Project } from "@/lib/mock-data";

const MONTHS_IT_SHORT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function ProjectEditorial({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const projects = useProjects();
  const allocations = useAllocations();
  const employees = useEmployees();
  const project = projects.find((c) => c.id === projectId);

  const team = useMemo(() => {
    if (!project) return [];
    const ids = new Set(allocations.filter((a) => a.projectId === project.id).map((a) => a.employeeId));
    return employees.filter((e) => ids.has(e.id));
  }, [allocations, employees, project]);

  if (!project) return <NotFound onBack={() => navigate({ to: "/projects" })} />;
  return <Spread project={project} team={team} />;
}

function Spread({
  project,
  team,
}: {
  project: Project;
  team: ReturnType<typeof useEmployees>;
}) {
  const navigate = useNavigate();
  const client = clientById(project.clientId);
  const owner = employeeById(project.ownerId);
  const burnedK = Math.round((project.burnedHours * (project.defaultBillableRate || 0)) / 1000);
  const budgetK = Math.round((project.budgetHours * (project.defaultBillableRate || 0)) / 1000);
  const margin = budgetK > 0 ? Math.round(((budgetK - burnedK) / budgetK) * 100) : 0;
  const teamFte = team.length || 0;

  const titleParts = project.name.split(" ");
  const titleLead = titleParts.slice(0, Math.ceil(titleParts.length / 2)).join(" ");
  const titleTail = titleParts.slice(Math.ceil(titleParts.length / 2)).join(" ");

  return (
    <div
      className="ph p-4 md:p-6 grid gap-9 min-h-[calc(100vh-3.5rem)]"
      style={{ gridTemplateColumns: "1.1fr 1fr" }}
    >
      <section className="flex flex-col justify-between gap-8">
        <div>
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
              alignSelf: "flex-start",
            }}
          >
            ← PROJECTS
          </button>
          <div className="flex gap-3 items-center mt-4">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              PROJECT · {project.code}
            </span>
            <span className="dot" />
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {project.status.toUpperCase().replace("_", " ")}
            </span>
          </div>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "16px 0 0",
              fontSize: "clamp(64px, 8vw, 108px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.88,
            }}
          >
            {titleLead}
            <br />
            <span style={{ fontStyle: "italic" }}>{titleTail || project.code}</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 22,
              maxWidth: 480,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.35,
            }}
          >
            {client?.name ?? "Cliente interno"}. {teamFte > 0 ? `${teamFte} persone, ` : ""}
            budget € {budgetK}k.
          </p>
        </div>

        <div
          className="grid pt-6"
          style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--line-strong)" }}
        >
          <KpiCell label="TEAM" value={`${teamFte || "—"} FTE`} first />
          <KpiCell label="INIZIO" value={fmtDate(project.startDate)} />
          <KpiCell label="FINE" value={fmtDate(project.endDate)} />
          <KpiCell label="BUDGET" value={`€ ${budgetK}k`} firstRow first />
          <KpiCell label="SPESO" value={`€ ${burnedK}k`} firstRow />
          <KpiCell
            label="MARGINE"
            value={`${margin >= 0 ? "+" : ""}${margin}%`}
            firstRow
            accent={margin >= 0}
          />
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div
          className="placeholder-img"
          style={{ width: "100%", flex: 1, minHeight: 320, borderRadius: 22 }}
        >
          <span className="cap t-mono-sm">POSTER · {project.code}</span>
        </div>
        <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px" }}>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            TEAM
          </span>
          <div className="flex gap-2.5 items-center mt-3 flex-wrap">
            {team.slice(0, 8).map((emp) => (
              <span key={emp.id} className="ph-avatar">
                {emp.initials}
              </span>
            ))}
            {team.length > 8 && (
              <span className="t-mono ml-2" style={{ color: "var(--muted-foreground)" }}>
                +{team.length - 8}
              </span>
            )}
            {team.length === 0 && (
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                NESSUNA ALLOCAZIONE
              </span>
            )}
          </div>
        </div>
        {owner && (
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px" }}>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              RESPONSABILE
            </span>
            <div className="flex gap-3 items-center mt-3">
              <span className="ph-avatar">{owner.initials}</span>
              <div>
                <div
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 19,
                  }}
                >
                  {owner.name}
                </div>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {owner.role.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-12 flex flex-col items-center gap-4 min-h-[60vh] justify-center">
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        PROJECT NON TROVATA
      </span>
      <button type="button" className="pill pill-ghost pill-sm" onClick={onBack}>
        ← Torna alle projects
      </button>
    </div>
  );
}

function KpiCell({
  label,
  value,
  accent,
  first,
  firstRow,
}: {
  label: string;
  value: string;
  accent?: boolean;
  first?: boolean;
  firstRow?: boolean;
}) {
  return (
    <div
      style={{
        paddingTop: firstRow ? 14 : 0,
        paddingLeft: first ? 0 : 12,
        borderLeft: first ? "none" : "1px solid var(--line)",
        marginBottom: !firstRow ? 14 : 0,
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div
        className="t-num"
        style={{
          fontSize: 22,
          marginTop: 4,
          letterSpacing: "-0.02em",
          color: accent ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
