import { useMemo } from "react";
import { useGoals } from "@/lib/tables/goals";
import { useEmployees } from "@/lib/tables/employees";
import type { Goal } from "@/lib/mock-data";

const ME = "e1";

const LEVELS: Array<[string, string, "done" | "current" | "next" | "future"]> = [
  ["L1", "Junior", "done"],
  ["L2", "Mid", "done"],
  ["L3", "Senior", "done"],
  ["L4", "Senior+", "current"],
  ["L5", "Lead", "next"],
  ["L6", "Principal", "future"],
];

const SKILLS: Array<[string, number, string]> = [
  ["Product strategy", 0.85, "Lead di feature complete"],
  ["Design systems", 0.92, "Mantiene tokens + governance"],
  ["Cross-team facilitation", 0.55, "Workshop, alignement"],
  ["Mentorship", 0.4, "Onboarding di 1 persona junior"],
  ["Business acumen", 0.3, "Capisce P&L del team"],
];

function localizeStatus(s: Goal["status"]): string {
  if (s === "hit") return "DONE";
  if (s === "missed") return "MISSED";
  return "IN CORSO";
}

export function GrowthEditorial() {
  const goals = useGoals();
  const employees = useEmployees();
  const me = employees.find((e) => e.id === ME);

  const myGoals = useMemo(() => {
    const filtered = goals.filter((g) => g.employeeId === ME);
    if (filtered.length > 0) return filtered.slice(0, 4);
    // Fallback when no goals seeded for current user.
    return goals.slice(0, 4);
  }, [goals]);

  const advancement = useMemo(() => {
    if (myGoals.length === 0) return 62;
    return Math.round(myGoals.reduce((s, g) => s + g.progress, 0) / myGoals.length);
  }, [myGoals]);

  const nextReview = useMemo(() => {
    const r = new Date();
    r.setDate(r.getDate() + 14);
    return r.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
  }, []);

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-7 min-h-[calc(100vh-3.5rem)]">
      <div className="grid items-end gap-6" style={{ gridTemplateColumns: "1fr auto" }}>
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            PERCORSO DI CRESCITA · {me?.name?.toUpperCase() ?? "—"} · L4 → L5
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(64px, 8vw, 116px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Crescere</span>,<br />
            un livello alla volta<span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "auto auto auto", borderLeft: "1px solid var(--line)" }}>
          <Stat label="LIVELLO" value="L4" />
          <Stat label="PROSSIMA REVIEW" value={nextReview} />
          <Stat label="AVANZAMENTO" value={`${advancement}%`} accent last />
        </div>
      </div>

      {/* Path bar */}
      <div className="flex gap-0">
        {LEVELS.map(([code, name, st]) => (
          <div
            key={code}
            className="flex flex-col gap-2"
            style={{
              flex: 1,
              paddingRight: 14,
              borderTop: "2px solid",
              borderColor:
                st === "done" ? "var(--fg)" : st === "current" ? "var(--spark)" : "var(--line-strong)",
              paddingTop: 12,
            }}
          >
            <span
              className="t-mono"
              style={{
                color:
                  st === "current"
                    ? "var(--spark)"
                    : st === "future"
                      ? "var(--muted-foreground)"
                      : "var(--fg)",
              }}
            >
              {code}
            </span>
            <span
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: st === "current" ? "italic" : "normal",
                fontSize: 26,
                letterSpacing: "-0.02em",
                color: st === "future" ? "var(--muted-foreground)" : "var(--fg)",
              }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Skills + objectives */}
      <div className="grid gap-7" style={{ gridTemplateColumns: "1.2fr 1fr", flex: 1, minHeight: 0 }}>
        <section className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <span className="t-h3-sans">Competenze · L5</span>
          <div className="flex flex-col gap-3 overflow-auto pr-1">
            {SKILLS.map(([n, p, d]) => (
              <div key={n} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "14px 18px" }}>
                <div className="flex items-baseline justify-between">
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 20,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {n}
                  </span>
                  <span
                    className="t-num"
                    style={{ fontSize: 16, color: p >= 0.7 ? "var(--spark)" : "var(--fg)" }}
                  >
                    {Math.round(p * 100)}%
                  </span>
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 3,
                    borderRadius: 999,
                    background: "var(--bg-3)",
                    marginTop: 10,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: `${p * 100}%`,
                      height: "100%",
                      background: p >= 0.7 ? "var(--spark)" : "var(--fg)",
                      borderRadius: 999,
                    }}
                  />
                </div>
                <span className="t-mono mt-2 block" style={{ color: "var(--muted-foreground)" }}>
                  {d}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3 min-h-0">
          <span className="t-h3-sans">Obiettivi · {myGoals[0]?.quarter ?? "Q2 2026"}</span>
          <div className="flex flex-col overflow-auto pr-1">
            {myGoals.map((g, i) => (
              <div
                key={g.id}
                className="grid items-baseline"
                style={{
                  gridTemplateColumns: "32px 1fr auto",
                  gap: 12,
                  padding: "14px 0",
                  borderBottom: i < myGoals.length - 1 ? "1px solid var(--line)" : "none",
                }}
              >
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 19,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {g.title}
                </span>
                <span
                  className="t-mono"
                  style={{
                    color:
                      g.status === "hit"
                        ? "var(--spark)"
                        : g.status === "active"
                          ? "var(--fg)"
                          : "var(--muted-foreground)",
                  }}
                >
                  {localizeStatus(g.status)}
                </span>
              </div>
            ))}
            {myGoals.length === 0 && (
              <div className="p-6 text-center" style={{ color: "var(--muted-foreground)" }}>
                <span className="t-mono">NESSUN OBIETTIVO</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-auto">
            <button type="button" className="pill pill-ghost pill-sm">
              Aggiungi obiettivo
            </button>
            <button type="button" className="pill pill-spark pill-sm">
              Avvia 1:1 <span className="arr">→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  last,
}: {
  label: string;
  value: string;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <div
      style={{
        padding: "8px 22px",
        borderRight: last ? "none" : "1px solid var(--line)",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div
        className="t-num"
        style={{
          fontSize: 32,
          marginTop: 4,
          letterSpacing: "-0.03em",
          color: accent ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
