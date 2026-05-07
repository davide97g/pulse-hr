import { useMemo } from "react";
import { useActivities } from "@/lib/tables/activities";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { commesse, type Activity } from "@/lib/mock-data";

const MONTHS_IT_SHORT = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
const WEEKDAYS_IT = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];

function statusVerb(status: Activity["status"]): { verb: string; spark?: boolean } {
  switch (status) {
    case "done":
      return { verb: "ha completato" };
    case "in_progress":
      return { verb: "sta lavorando a", spark: true };
    case "review":
      return { verb: "ha mandato in review" };
    case "blocked":
      return { verb: "ha segnalato bloccato", spark: true };
    case "todo":
      return { verb: "ha aperto" };
    default:
      return { verb: "ha aggiornato" };
  }
}

function fmtTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function ActivitiesEditorial() {
  const activities = useActivities();
  const employees = useEmployees();

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const todaysActivities = useMemo(() => {
    return [...activities]
      .filter((a) => a.assigneeId)
      .sort((a, b) => {
        const ad = a.endDate ? new Date(a.endDate).getTime() : 0;
        const bd = b.endDate ? new Date(b.endDate).getTime() : 0;
        return bd - ad;
      })
      .slice(0, 12);
  }, [activities]);

  const stats = useMemo(() => {
    return {
      open: activities.filter((a) => a.status === "in_progress").length,
      review: activities.filter((a) => a.status === "review").length,
      done: activities.filter((a) => a.status === "done").length,
    };
  }, [activities]);

  const dateMono = `${WEEKDAYS_IT[today.getDay()]} ${String(today.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[today.getMonth()]}`;
  void todayStart;

  return (
    <div
      className="ph p-4 md:p-6 grid gap-10 min-h-[calc(100vh-3.5rem)]"
      style={{ gridTemplateColumns: "1.1fr 1fr" }}
    >
      <section className="flex flex-col justify-between gap-8">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {dateMono} · {todaysActivities.length} EVENTI
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(80px, 10vw, 124px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Attività</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 18,
              maxWidth: 460,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 20,
              lineHeight: 1.35,
            }}
          >
            Cosa è successo nel workspace.
          </p>
        </div>
        <div
          className="grid pt-6"
          style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--line-strong)" }}
        >
          <Stat label="IN CORSO" value={stats.open} first />
          <Stat label="REVIEW" value={stats.review} />
          <Stat label="COMPLETATE" value={stats.done} accent />
        </div>
      </section>

      <section className="min-h-0 overflow-hidden flex flex-col">
        <div
          className="overflow-auto flex flex-col"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          {todaysActivities.map((a) => {
            const emp = a.assigneeId ? employeeById(a.assigneeId) ?? employees.find((e) => e.id === a.assigneeId) : null;
            if (!emp) return null;
            const project = commesse.find((c) => c.id === a.projectId);
            const v = statusVerb(a.status);
            return (
              <div
                key={a.id}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "60px 32px 1fr auto",
                  gap: 14,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span
                  className="t-mono"
                  style={{ color: v.spark ? "var(--spark)" : "var(--muted-foreground)" }}
                >
                  {fmtTime(a.endDate ?? a.startDate)}
                </span>
                <span className="ph-avatar ph-avatar-sm">{emp.initials}</span>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="t-body" style={{ fontWeight: 500 }}>
                    {emp.name.split(" ")[0]}
                  </span>
                  <span
                    className="t-body"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {v.verb}
                  </span>
                  <span
                    className="t-body"
                    style={{
                      color: "var(--fg-2)",
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 16,
                    }}
                  >
                    {a.title}
                  </span>
                </div>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {project?.code ?? "—"}
                </span>
              </div>
            );
          })}
          {todaysActivities.length === 0 && (
            <div className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
              <span className="t-mono">NESSUNA ATTIVITÀ</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  first,
}: {
  label: string;
  value: number;
  accent?: boolean;
  first?: boolean;
}) {
  return (
    <div
      style={{
        paddingLeft: first ? 0 : 14,
        borderLeft: first ? "none" : "1px solid var(--line)",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div
        className="t-num mt-1"
        style={{
          fontSize: 32,
          letterSpacing: "-0.03em",
          color: accent ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
