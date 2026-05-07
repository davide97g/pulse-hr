import { useMemo } from "react";
import { useEmployees } from "@/lib/tables/employees";
import type { Employee } from "@/lib/mock-data";

const MONTHS_IT_SHORT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

interface Moment {
  emp: Employee;
  kind: "birthday" | "anniversary";
  date: Date;
  daysAhead: number;
  detail: string;
}

function nextOccurrence(monthDay: string, fromYear: number): Date {
  // monthDay = "MM-DD"
  const [m, d] = monthDay.split("-").map(Number);
  const candidate = new Date(fromYear, (m ?? 1) - 1, d ?? 1);
  return candidate;
}

function buildMoments(employees: Employee[]): Moment[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today.getTime() + 31 * 86_400_000);
  const moments: Moment[] = [];

  for (const emp of employees) {
    if (emp.birthday) {
      const thisYear = nextOccurrence(emp.birthday, today.getFullYear());
      const target = thisYear < today ? nextOccurrence(emp.birthday, today.getFullYear() + 1) : thisYear;
      if (target <= horizon) {
        const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
        const age = today.getFullYear() - new Date(emp.joinDate).getFullYear();
        moments.push({
          emp,
          kind: "birthday",
          date: target,
          daysAhead: days,
          detail: `Compleanno · ${age} anni in azienda`,
        });
      }
    }

    if (emp.joinDate) {
      const join = new Date(emp.joinDate);
      const annivThisYear = new Date(today.getFullYear(), join.getMonth(), join.getDate());
      const annivTarget =
        annivThisYear < today ? new Date(today.getFullYear() + 1, join.getMonth(), join.getDate()) : annivThisYear;
      if (annivTarget <= horizon) {
        const days = Math.round((annivTarget.getTime() - today.getTime()) / 86_400_000);
        const years = annivTarget.getFullYear() - join.getFullYear();
        if (years > 0) {
          moments.push({
            emp,
            kind: "anniversary",
            date: annivTarget,
            daysAhead: days,
            detail: `${years} ann${years === 1 ? "o" : "i"} in azienda`,
          });
        }
      }
    }
  }

  return moments.sort((a, b) => a.daysAhead - b.daysAhead);
}

function fmtMomentDate(d: Date, daysAhead: number): string {
  if (daysAhead === 0) return "oggi";
  if (daysAhead === 1) return "domani · 1 g";
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[d.getMonth()]} · ${daysAhead} gg`;
}

export function MomentsEditorial() {
  const employees = useEmployees();
  const moments = useMemo(() => buildMoments(employees), [employees]);
  const today = useMemo(() => moments.find((m) => m.daysAhead === 0), [moments]);
  const upcoming = useMemo(() => moments.filter((m) => m.daysAhead > 0).slice(0, 12), [moments]);

  const todayDate = new Date();
  const todayMono = `MAR ${String(todayDate.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[todayDate.getMonth()].toUpperCase()}`;

  return (
    <div
      className="ph p-4 md:p-6 grid gap-10 min-h-[calc(100vh-3.5rem)]"
      style={{ gridTemplateColumns: "1.1fr 1fr" }}
    >
      {/* Today's moment hero */}
      <section className="flex flex-col justify-between gap-8">
        {today ? (
          <>
            <div>
              <span className="t-mono" style={{ color: "var(--spark)" }}>
                ⏤ OGGI · {todayMono} ⏤
              </span>
              <h1
                style={{
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontWeight: 400,
                  margin: "10px 0 0",
                  fontSize: "clamp(80px, 10vw, 132px)",
                  letterSpacing: "-0.045em",
                  lineHeight: 0.86,
                }}
              >
                {today.kind === "birthday" ? "Auguri" : "Anniversario"},
                <br />
                <span style={{ fontStyle: "italic" }}>{today.emp.name.split(" ")[0]}</span>
                <span style={{ color: "var(--spark)" }}>.</span>
              </h1>
              <p
                style={{
                  marginTop: 24,
                  maxWidth: 460,
                  color: "var(--fg-2)",
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontStyle: "italic",
                  fontSize: 24,
                  lineHeight: 1.35,
                }}
              >
                {today.emp.name} {today.kind === "birthday" ? "compie gli anni oggi" : "festeggia un anniversario"}.{" "}
                {today.emp.role} a {today.emp.location}.
              </p>
              <div className="mt-7 flex items-center gap-3">
                <span className="ph-avatar ph-avatar-lg">{today.emp.initials}</span>
                <div className="flex flex-col">
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    {today.emp.role.toUpperCase()} · {today.emp.location.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 24,
                      marginTop: 4,
                    }}
                  >
                    {today.emp.name}
                  </span>
                </div>
              </div>
            </div>
            <div
              className="flex gap-3 flex-wrap pt-6"
              style={{ borderTop: "1px solid var(--line-strong)" }}
            >
              <button type="button" className="pill pill-spark">
                🎂 Manda auguri
              </button>
              <button type="button" className="pill pill-ghost">
                + Kudos a {today.emp.name.split(" ")[0]}
              </button>
              <button type="button" className="pill pill-ghost">
                Vedi profilo
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              MAR {todayMono} · NIENTE OGGI
            </span>
            <h1
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontWeight: 400,
                margin: 0,
                fontSize: "clamp(80px, 10vw, 132px)",
                letterSpacing: "-0.045em",
                lineHeight: 0.86,
              }}
            >
              <span style={{ fontStyle: "italic" }}>Calma</span>
              <span style={{ color: "var(--spark)" }}>.</span>
            </h1>
            <p
              style={{
                maxWidth: 460,
                color: "var(--fg-2)",
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 22,
                lineHeight: 1.4,
              }}
            >
              Nessun compleanno o anniversario oggi. Guarda i prossimi 30 giorni a destra.
            </p>
          </div>
        )}
      </section>

      {/* Upcoming feed */}
      <section className="flex flex-col gap-3.5 min-h-0">
        <div className="flex justify-between items-baseline">
          <span className="t-h3-sans">In arrivo</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            30 GIORNI
          </span>
        </div>
        <div
          className="flex-1 min-h-0 overflow-auto"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          {upcoming.map((m) => (
            <div
              key={`${m.emp.id}-${m.kind}`}
              className="grid items-center"
              style={{
                gridTemplateColumns: "44px 1fr auto",
                gap: 14,
                padding: "16px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span className="ph-avatar ph-avatar-sm">{m.emp.initials}</span>
              <div>
                <div
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 19,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {m.emp.name}
                </div>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {m.detail.toUpperCase()}
                </span>
              </div>
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {fmtMomentDate(m.date, m.daysAhead)}
              </span>
            </div>
          ))}
          {upcoming.length === 0 && (
            <div className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
              <span className="t-mono">NESSUN MOMENTO NEI PROSSIMI 30 GIORNI</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
