import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { useGoals } from "@/lib/tables/goals";
import { useKudos } from "@/lib/tables/kudos";
import { useChallenges } from "@/lib/tables/challenges";
import { useAchievements } from "@/lib/tables/achievements";
import { Avatar } from "@/components/app/AppShell";
import { growthSummaryFor } from "@/lib/growth";
import type { AchievementTier, Goal } from "@/lib/mock-data";

const MONTHS_IT = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
function fmt(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT[d.getMonth()].toLowerCase()}`;
}

const TIER_GLYPH: Record<AchievementTier, string> = {
  gold: "★",
  platinum: "★",
  silver: "◆",
  bronze: "◇",
};

function localizeStatus(s: Goal["status"]): string {
  if (s === "hit") return "DONE";
  if (s === "missed") return "MISSED";
  return "IN CORSO";
}

export function GrowthSkillPath({ employeeId }: { employeeId: string }) {
  const employees = useEmployees();
  const goals = useGoals();
  const kudos = useKudos();
  const challenges = useChallenges();
  const achievements = useAchievements();
  const nav = useNavigate({ from: "/growth" });

  const focus = employeeById(employeeId) ?? employees[0];

  // growthSummaryFor reads from live mock-data bindings that the table
  // subscribers keep in sync — re-run when any of those tables change.
  const summary = useMemo(
    () => (focus ? growthSummaryFor(focus.id) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focus, kudos, achievements, goals],
  );
  const myGoals = useMemo(
    () => (focus ? goals.filter((g) => g.employeeId === focus.id).slice(0, 4) : []),
    [goals, focus],
  );
  const myAchievements = useMemo(
    () => (focus ? achievements.filter((a) => a.employeeId === focus.id) : []),
    [achievements, focus],
  );
  const myKudos = useMemo(
    () =>
      focus
        ? kudos
            .filter((k) => k.toId === focus.id)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 4)
        : [],
    [kudos, focus],
  );
  const myChallenges = useMemo(
    () =>
      focus
        ? challenges
            .filter((c) => c.employeeId === focus.id && c.status === "open")
            .slice(0, 1)
        : [],
    [challenges, focus],
  );

  if (!focus) {
    return (
      <div className="p-6 text-center" style={{ color: "var(--muted-foreground)" }}>
        <span className="t-mono">NESSUNA PERSONA SELEZIONATA</span>
      </div>
    );
  }

  const level = summary?.level;
  const next = summary?.next;
  const progress = summary ? Math.round(summary.progressPct) : 0;

  return (
    <div className="flex flex-col gap-4 min-h-0">
      <div className="flex items-center" style={{ gap: 12 }}>
        <Avatar initials={focus.initials} size={48} />
        <div className="flex flex-col">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            PERCORSO · {focus.name.toUpperCase()} · {level?.name ?? "—"}
            {next ? ` → ${next.name}` : ""}
          </span>
          <span
            style={{
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 28,
              letterSpacing: "-0.02em",
            }}
          >
            Da {level?.name ?? "—"} a {next?.name ?? "—"}
            <span style={{ color: "var(--spark)" }}>.</span>
          </span>
        </div>
        <span style={{ flex: 1 }} />
        {employees.length > 1 && (
          <select
            value={focus.id}
            onChange={(e) =>
              nav({
                search: (prev) => ({
                  ...prev,
                  tab: "paths",
                  employee: e.target.value,
                }),
              })
            }
            className="t-mono"
            style={{
              padding: "8px 12px",
              border: "1px solid var(--line-strong)",
              borderRadius: 999,
              background: "transparent",
              color: "var(--fg)",
            }}
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Path bar (XP-derived levels) */}
      <div className="flex">
        {[
          { name: "Seedling", min: 0 },
          { name: "Rookie", min: 100 },
          { name: "Climber", min: 250 },
          { name: "Senior", min: 500 },
          { name: "Lead", min: 900 },
          { name: "Principal", min: 1500 },
        ].map((lv, i, arr) => {
          const xp = summary?.xp.total ?? 0;
          const isCurrent = level?.name === lv.name;
          const isDone = !isCurrent && xp >= lv.min && (arr[i + 1] ? xp >= arr[i + 1].min : true);
          const status: "done" | "current" | "future" = isCurrent
            ? "current"
            : isDone
              ? "done"
              : "future";
          return (
            <div
              key={lv.name}
              className="flex flex-col"
              style={{
                flex: 1,
                gap: 8,
                paddingRight: 14,
                borderTop: "2px solid",
                borderColor:
                  status === "done"
                    ? "var(--fg)"
                    : status === "current"
                      ? "var(--spark)"
                      : "var(--line-strong)",
                paddingTop: 12,
              }}
            >
              <span
                className="t-mono"
                style={{
                  color:
                    status === "current"
                      ? "var(--spark)"
                      : status === "future"
                        ? "var(--muted-foreground)"
                        : "var(--fg)",
                }}
              >
                {lv.min} XP
              </span>
              <span
                style={{
                  fontFamily: '"Fraunces", ui-serif, serif',
                  fontStyle: status === "current" ? "italic" : "normal",
                  fontSize: 22,
                  letterSpacing: "-0.02em",
                  color: status === "future" ? "var(--muted-foreground)" : "var(--fg)",
                }}
              >
                {lv.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats strip */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          border: "1px solid var(--line-strong)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <Stat label="LIVELLO" value={level?.name ?? "—"} />
        <Stat label="XP" value={String(summary?.xp.total ?? 0)} />
        <Stat label="AVANZAMENTO" value={`${progress}%`} accent />
        <Stat
          label="PROSSIMO"
          value={next ? `${next.xpMin - (summary?.xp.total ?? 0)} XP` : "—"}
        />
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1.2fr 1fr 1fr", flex: 1, minHeight: 0 }}>
        {/* Competencies live in Skills Matrix now. */}
        <section className="flex flex-col gap-3 min-h-0">
          <span className="t-h3-sans">Competenze</span>
          <button
            type="button"
            onClick={() => nav({ to: "/skills" }).catch(() => {})}
            className="text-left p-4 group transition-colors hover:bg-muted/40"
            style={{ border: "1px solid var(--line)", borderRadius: 14, cursor: "pointer" }}
          >
            <span
              className="t-mono"
              style={{ color: "var(--muted-foreground)", display: "block" }}
            >
              {(focus?.name?.split(" ")[0] ?? "Anna").toUpperCase()}'S COMPETENCIES · LIVE IN SKILLS MATRIX
            </span>
            <div
              style={{
                fontFamily: '"Fraunces", ui-serif, serif',
                fontWeight: 400,
                margin: "8px 0 6px",
                fontSize: 30,
                letterSpacing: "-0.025em",
                lineHeight: 1,
              }}
            >
              <span style={{ fontStyle: "italic" }}>Hard & soft skills.</span>
              <span style={{ color: "var(--spark)" }}>.</span>
            </div>
            <span className="t-mono" style={{ color: "var(--fg)", display: "block" }}>
              4-level ladder · self-assessment + manager validation
            </span>
            <span
              className="t-mono"
              style={{
                color: "var(--spark)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 14,
              }}
            >
              Open Skills Matrix
              <span
                aria-hidden
                style={{ transition: "transform 160ms ease-out" }}
                className="group-hover:translate-x-1 inline-block"
              >
                →
              </span>
            </span>
          </button>
        </section>

        {/* Goals */}
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
                    fontFamily: '"Fraunces", ui-serif, serif',
                    fontStyle: "italic",
                    fontSize: 18,
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
              <span
                className="t-mono"
                style={{ color: "var(--muted-foreground)", padding: "14px 0" }}
              >
                NESSUN OBIETTIVO
              </span>
            )}
          </div>
        </section>

        {/* Recognitions */}
        <section className="flex flex-col gap-3 min-h-0">
          <span className="t-h3-sans">Riconoscimenti</span>
          <div
            className="p-3.5 flex flex-col"
            style={{ gap: 8, border: "1px solid var(--line)", borderRadius: 12 }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ACHIEVEMENTS · {myAchievements.length}
            </span>
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              {myAchievements.length === 0 && (
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  ANCORA NESSUNO
                </span>
              )}
              {myAchievements.slice(0, 8).map((a) => {
                const accent =
                  a.tier === "gold" || a.tier === "platinum"
                    ? "var(--spark)"
                    : "var(--line-strong)";
                return (
                  <span
                    key={a.id}
                    title={a.title}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      border: `1px solid ${accent}`,
                      background:
                        a.tier === "gold" || a.tier === "platinum"
                          ? "color-mix(in oklch, var(--spark) 12%, transparent)"
                          : "transparent",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: '"Fraunces", ui-serif, serif',
                      fontSize: 16,
                      color:
                        a.tier === "gold" || a.tier === "platinum"
                          ? "var(--spark)"
                          : "var(--muted-foreground)",
                    }}
                  >
                    {TIER_GLYPH[a.tier]}
                  </span>
                );
              })}
            </div>
          </div>

          <div
            className="p-3.5 flex flex-col"
            style={{ gap: 8, border: "1px solid var(--line)", borderRadius: 12, flex: 1, minHeight: 0 }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ULTIMI KUDOS · {summary?.kudosReceived ?? 0}
            </span>
            <div className="flex flex-col overflow-auto" style={{ gap: 8 }}>
              {myKudos.map((k, i) => {
                const f = employeeById(k.fromId);
                return (
                  <div
                    key={k.id}
                    className="grid items-center"
                    style={{
                      gridTemplateColumns: "20px 1fr 50px",
                      gap: 8,
                      paddingTop: i === 0 ? 0 : 6,
                      borderTop: i === 0 ? "none" : "1px solid var(--line)",
                    }}
                  >
                    {f && <Avatar initials={f.initials} size={20} />}
                    <span
                      style={{
                        fontFamily: '"Fraunces", ui-serif, serif',
                        fontStyle: "italic",
                        fontSize: 14,
                        lineHeight: 1.3,
                      }}
                    >
                      {k.message}
                    </span>
                    <span
                      className="t-mono"
                      style={{ color: "var(--muted-foreground)", textAlign: "right" }}
                    >
                      {fmt(k.date)}
                    </span>
                  </div>
                );
              })}
              {myKudos.length === 0 && (
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  ANCORA NESSUNO
                </span>
              )}
            </div>
          </div>

          {myChallenges[0] && (
            <div
              className="p-3.5"
              style={{
                border: "1px solid var(--spark)",
                background: "color-mix(in oklch, var(--spark) 10%, transparent)",
                borderRadius: 12,
              }}
            >
              <span className="t-mono">CHALLENGE COLLEGATA</span>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: '"Fraunces", ui-serif, serif',
                  fontStyle: "italic",
                  fontSize: 18,
                  lineHeight: 1.2,
                }}
              >
                {myChallenges[0].title}
              </div>
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                Scade {fmt(myChallenges[0].dueAt)} · +{myChallenges[0].xpReward} XP
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="p-4" style={{ borderRight: "1px solid var(--line)" }}>
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div
        className="t-num"
        style={{
          fontSize: 28,
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
