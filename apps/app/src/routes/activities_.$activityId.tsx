import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";
import { toast } from "sonner";
import { ActivityDialog } from "@/components/pm/ActivityDialog";
import { activityStatusMeta } from "@/lib/activity-status";
import { activitiesTable, useActivities } from "@/lib/tables/activities";
import { useProjects } from "@/lib/tables/projects";
import { employeeById, type Activity, type ActivityStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/activities_/$activityId")({
  head: ({ params }) => ({ meta: [{ title: `Activity ${params.activityId} — Pulse HR` }] }),
  component: ActivityDetailPage,
});

const HOURS_PER_DAY = 8;
const fmtDays = (h: number) => {
  const d = h / HOURS_PER_DAY;
  return d >= 100 || Number.isInteger(d) ? `${Math.round(d)}gg` : `${d.toFixed(1)}gg`;
};

const MONTHS_IT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
};

function ActivityDetailPage() {
  const { activityId } = Route.useParams();
  const nav = useNavigate();
  const activities = useActivities();
  const projects = useProjects();
  const [editing, setEditing] = useState(false);

  const activity = activities.find((a) => a.id === activityId);
  const project = activity ? projects.find((p) => p.id === activity.projectId) : null;
  const assignee = activity?.assigneeId ? employeeById(activity.assigneeId) : null;
  const dependencies = activity
    ? activity.dependencies
        .map((id) => activities.find((a) => a.id === id))
        .filter((a): a is Activity => Boolean(a))
    : [];
  const dependents = activity
    ? activities.filter((a) => a.dependencies.includes(activity.id))
    : [];

  if (!activity) {
    return (
      <div className="p-12 flex flex-col items-center gap-4 min-h-[60vh] justify-center">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          ATTIVITÀ NON TROVATA
        </span>
        <button
          type="button"
          className="pill pill-ghost pill-sm"
          onClick={() => nav({ to: "/activities" })}
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Torna alle attività
        </button>
      </div>
    );
  }

  const statusMeta = activityStatusMeta[activity.status];
  const status: ActivityStatus = activity.status;

  return (
    <div className="ph p-4 md:p-6 grid gap-9 min-h-full"
      style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)" }}
    >
      {/* LEFT */}
      <section className="flex flex-col gap-5 min-w-0">
        <Link
          to="/activities"
          className="t-mono inline-flex items-center"
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid var(--line)",
            color: "var(--muted-foreground)",
            alignSelf: "flex-start",
          }}
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          ATTIVITÀ
        </Link>

        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {project?.code ?? "—"} · {statusMeta.label.toUpperCase()}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "8px 0 0",
              fontSize: "clamp(48px, 6vw, 64px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
            }}
          >
            <span style={{ fontStyle: "italic" }}>{activity.title}</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>

        {activity.description && (
          <div
            style={{
              border: "1px solid var(--line-strong)",
              borderRadius: 12,
              padding: "12px 14px",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 16,
              lineHeight: 1.4,
              color: "var(--fg-2)",
            }}
          >
            {activity.description}
          </div>
        )}

        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div className="flex flex-col gap-1.5">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              STATO
            </span>
            <div
              style={{
                borderBottom: "1px solid var(--line-strong)",
                paddingBottom: 8,
                fontFamily: "Fraunces, ui-serif, serif",
                fontSize: 22,
              }}
            >
              {statusMeta.label}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              STIMA
            </span>
            <div
              style={{
                borderBottom: "1px solid var(--line-strong)",
                paddingBottom: 8,
                fontFamily: "Fraunces, ui-serif, serif",
                fontSize: 22,
              }}
            >
              <span className="t-num">{fmtDays(activity.estimateHours)}</span>
              <span
                className="t-mono"
                style={{ color: "var(--muted-foreground)", marginLeft: 6 }}
              >
                {activity.estimateHours}h
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              SCADENZA
            </span>
            <div
              style={{
                borderBottom: "1px solid var(--line-strong)",
                paddingBottom: 8,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 16,
              }}
            >
              {fmtDate(activity.endDate)}
            </div>
          </div>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="flex flex-col gap-1.5">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              PROJECT
            </span>
            {project ? (
              <Link
                to="/projects/$projectId"
                params={{ projectId: project.id }}
                className="flex items-center gap-2"
                style={{
                  borderBottom: "1px solid var(--line-strong)",
                  paddingBottom: 8,
                }}
              >
                <span
                  className="chip"
                  style={{ border: "1px solid var(--line-strong)", background: "var(--bg-2)" }}
                >
                  {project.code}
                </span>
                <span
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 18,
                  }}
                >
                  {project.name}
                </span>
              </Link>
            ) : (
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                —
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ASSEGNATARIO
            </span>
            <div
              className="flex items-center gap-2"
              style={{
                borderBottom: "1px solid var(--line-strong)",
                paddingBottom: 8,
              }}
            >
              {assignee ? (
                <>
                  <span className="ph-avatar ph-avatar-xs">{assignee.initials}</span>
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 18,
                    }}
                  >
                    {assignee.name}
                  </span>
                </>
              ) : (
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  NON ASSEGNATA
                </span>
              )}
            </div>
          </div>
        </div>

        {(dependencies.length > 0 || dependents.length > 0) && (
          <div className="flex flex-col gap-2">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              DIPENDENZE · {dependencies.length + dependents.length}
            </span>
            <div className="flex flex-col gap-1.5">
              {dependencies.map((d) => (
                <DepRow key={`dep-${d.id}`} kind="Aspetta" activity={d} />
              ))}
              {dependents.map((d) => (
                <DepRow key={`unl-${d.id}`} kind="Sblocca" activity={d} />
              ))}
            </div>
          </div>
        )}

        <div
          className="flex gap-2.5 items-center mt-2"
          style={{ borderTop: "1px solid var(--line-strong)", paddingTop: 16 }}
        >
          <button
            type="button"
            className="pill pill-ghost"
            onClick={() => nav({ to: "/activities" })}
          >
            ← Torna
          </button>
          <span className="flex-1" />
          <button
            type="button"
            className="pill pill-dark"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3 w-3 mr-1.5" />
            Modifica
          </button>
        </div>
        {status && null}
      </section>

      {/* RIGHT */}
      <aside
        className="flex flex-col gap-5 min-h-0"
        style={{ borderLeft: "1px solid var(--line)", paddingLeft: 28 }}
      >
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          CONTESTO
        </span>

        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            FINESTRA
          </span>
          <div
            className="t-num"
            style={{ fontSize: 18 }}
          >
            {fmtDate(activity.startDate)} → {fmtDate(activity.endDate)}
          </div>
        </div>

        {activity.ticketLink && (
          <div className="flex flex-col gap-1.5">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              TICKET COLLEGATO
            </span>
            <a
              href={activity.ticketLink.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2"
              style={{
                padding: "8px 12px",
                border: "1px solid var(--line-strong)",
                borderRadius: 999,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                width: "fit-content",
                color: "var(--fg)",
              }}
            >
              {activity.ticketLink.provider.toUpperCase()} · {activity.ticketLink.key}
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
          </div>
        )}

        {project && (
          <div className="flex flex-col gap-1.5">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ALTRE ATTIVITÀ DEL PROJECT
            </span>
            <div className="flex flex-col gap-1.5">
              {activities
                .filter((a) => a.projectId === project.id && a.id !== activity.id)
                .slice(0, 5)
                .map((a) => {
                  const m = activityStatusMeta[a.status];
                  return (
                    <Link
                      key={a.id}
                      to="/activities/$activityId"
                      params={{ activityId: a.id }}
                      className="grid gap-2 items-baseline"
                      style={{
                        gridTemplateColumns: "70px 1fr auto",
                        padding: "8px 10px",
                        border: "1px solid var(--line)",
                        borderRadius: 10,
                      }}
                    >
                      <span
                        className="t-mono"
                        style={{
                          color:
                            a.status === "blocked"
                              ? "var(--spark)"
                              : "var(--muted-foreground)",
                        }}
                      >
                        {m.label.toUpperCase()}
                      </span>
                      <span
                        className="truncate"
                        style={{
                          fontFamily: "Fraunces, ui-serif, serif",
                          fontStyle: "italic",
                          fontSize: 14,
                        }}
                      >
                        {a.title}
                      </span>
                      <span
                        className="t-mono"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {fmtDays(a.estimateHours)}
                      </span>
                    </Link>
                  );
                })}
              {activities.filter((a) => a.projectId === project.id && a.id !== activity.id)
                .length === 0 && (
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  NESSUN’ALTRA ATTIVITÀ
                </span>
              )}
            </div>
          </div>
        )}
      </aside>

      <ActivityDialog
        open={editing}
        onClose={() => setEditing(false)}
        onSave={(next) => {
          activitiesTable.update(activity.id, next);
          toast.success("Attività aggiornata");
        }}
        initial={activity}
        projectId={activity.projectId}
      />
    </div>
  );
}

function DepRow({ kind, activity }: { kind: string; activity: Activity }) {
  const m = activityStatusMeta[activity.status];
  return (
    <Link
      to="/activities/$activityId"
      params={{ activityId: activity.id }}
      className="grid gap-3 items-center"
      style={{
        gridTemplateColumns: "70px 1fr 80px",
        padding: "8px 10px",
        border: "1px solid var(--line)",
        borderRadius: 10,
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {kind.toUpperCase()}
      </span>
      <span
        className="truncate"
        style={{
          fontFamily: "Fraunces, ui-serif, serif",
          fontStyle: "italic",
          fontSize: 15,
        }}
      >
        {activity.title}
      </span>
      <span
        className="t-mono"
        style={{ color: "var(--muted-foreground)", textAlign: "right" }}
      >
        {m.label.toUpperCase()}
      </span>
    </Link>
  );
}
