import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useI18n } from "@pulse-hr/shared/i18n";
import { useKudos } from "@/lib/tables/kudos";
import { useChallenges } from "@/lib/tables/challenges";
import { useOneOnOnes } from "@/lib/tables/oneOnOnes";
import { useAchievements } from "@/lib/tables/achievements";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { leaderboard, growthSummaryFor } from "@/lib/growth";
import { Avatar } from "@/components/app/AppShell";
import { cn } from "@/lib/utils";
import type { GrowthTab } from "./GrowthTabs";

const MONTHS_IT = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
const MONTHS_EN = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function isoWeekStart(d: Date): Date {
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  const dow = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - dow);
  return t;
}

function addWeeks(d: Date, n: number): Date {
  const t = new Date(d);
  t.setDate(t.getDate() + n * 7);
  return t;
}

export function GrowthOverview({
  onOpenNewKudos,
  onOpenNewChallenge,
}: {
  onOpenNewKudos: () => void;
  onOpenNewChallenge: () => void;
}) {
  const kudos = useKudos();
  const challenges = useChallenges();
  const oneOnOnes = useOneOnOnes();
  const achievements = useAchievements();
  const employees = useEmployees();
  const nav = useNavigate({ from: "/growth" });
  const { locale } = useI18n();
  const MONTHS = locale === "it" ? MONTHS_IT : MONTHS_EN;

  // 12 weeks ending on this week
  const weeks = useMemo(() => {
    const today = new Date();
    const currentStart = isoWeekStart(today);
    const out: Array<{ start: Date; ach: number; chl: number; kud: number; label: string }> = [];
    for (let i = 11; i >= 0; i--) {
      const start = addWeeks(currentStart, -i);
      const end = addWeeks(start, 1);
      const inRange = (iso: string) => {
        const t = new Date(iso).getTime();
        return t >= start.getTime() && t < end.getTime();
      };
      const week = Math.floor(
        (start.getTime() - new Date(start.getFullYear(), 0, 1).getTime()) / (7 * 86400000),
      ) + 1;
      out.push({
        start,
        ach: achievements.filter((a) => inRange(a.awardedAt)).length,
        chl: challenges.filter((c) => inRange(c.createdAt) || inRange(c.dueAt)).length,
        kud: kudos.filter((k) => inRange(k.date)).length,
        label: `S${String(week).padStart(2, "0")}`,
      });
    }
    return out;
  }, [achievements, challenges, kudos]);

  const monthKudos = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return kudos.filter((k) => new Date(k.date) >= start).length;
  }, [kudos]);

  const prevMonthKudos = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    return kudos.filter((k) => {
      const t = new Date(k.date);
      return t >= start && t < end;
    }).length;
  }, [kudos]);

  const newAchievementsThisMonth = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return achievements.filter((a) => new Date(a.awardedAt) >= start).length;
  }, [achievements]);

  const openChallenges = challenges.filter((c) => c.status === "open").length;
  const closingSoon = useMemo(() => {
    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(horizon.getDate() + 7);
    return challenges.filter(
      (c) => c.status === "open" && new Date(c.dueAt) <= horizon && new Date(c.dueAt) >= now,
    ).length;
  }, [challenges]);

  const growthScore = useMemo(() => {
    const summaries = employees
      .map((e) => growthSummaryFor(e.id))
      .filter((s): s is NonNullable<ReturnType<typeof growthSummaryFor>> => !!s);
    if (summaries.length === 0) return 0;
    const avg = summaries.reduce((a, s) => a + s.progressPct, 0) / summaries.length;
    return Math.round(avg);
  }, [employees]);

  const topMovers = useMemo(() => {
    return leaderboard("monthly").slice(0, 4);
  }, []);

  const deptMix = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthOnly = kudos.filter((k) => new Date(k.date) >= start);
    const totals = new Map<string, number>();
    for (const k of monthOnly) {
      const e = employeeById(k.toId);
      if (!e) continue;
      totals.set(e.department, (totals.get(e.department) ?? 0) + 1);
    }
    const max = Math.max(1, ...Array.from(totals.values()));
    return Array.from(totals.entries())
      .map(([dept, count]) => ({ dept, count, pct: (count / max) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [kudos]);

  const upcomingReviews = useMemo(() => {
    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(horizon.getDate() + 14);
    return oneOnOnes
      .filter((o) => {
        const t = new Date(o.date);
        return t >= now && t <= horizon;
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [oneOnOnes]);

  const stalePeople = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 60);
    const lastKudoBy = new Map<string, number>();
    for (const k of kudos) {
      const t = new Date(k.date).getTime();
      const prev = lastKudoBy.get(k.toId) ?? 0;
      if (t > prev) lastKudoBy.set(k.toId, t);
    }
    return employees.filter((e) => {
      const last = lastKudoBy.get(e.id);
      return !last || last < cutoff.getTime();
    }).length;
  }, [employees, kudos]);

  const goToTab = (tab: GrowthTab, employee?: string) =>
    nav({
      search: (prev) => ({
        ...prev,
        tab: tab === "overview" ? undefined : tab,
        employee: employee ?? undefined,
      }),
    });

  // Chart math
  const maxKud = Math.max(1, ...weeks.map((w) => w.kud));
  const maxAch = Math.max(1, ...weeks.map((w) => w.ach));
  const yMax = Math.max(24, maxKud);

  const chartW = 1080;
  const chartH = 360;
  const innerLeft = 30;
  const innerRight = chartW - 30;
  const innerTop = 20;
  const innerBottom = 300;

  const xFor = (i: number) =>
    innerLeft + (i / Math.max(1, weeks.length - 1)) * (innerRight - innerLeft);
  const yFor = (v: number) =>
    innerTop + (innerBottom - innerTop) * (1 - v / yMax);

  const kudosPts = weeks.map((w, i) => [xFor(i), yFor(w.kud)]);
  const kudosArea =
    `M ${kudosPts[0][0]} ${kudosPts[0][1]} ` +
    kudosPts
      .slice(1)
      .map((p) => `L ${p[0]} ${p[1]}`)
      .join(" ") +
    ` L ${kudosPts[kudosPts.length - 1][0]} ${innerBottom}` +
    ` L ${kudosPts[0][0]} ${innerBottom} Z`;
  const kudosLine =
    `M ${kudosPts[0][0]} ${kudosPts[0][1]} ` +
    kudosPts
      .slice(1)
      .map((p) => `L ${p[0]} ${p[1]}`)
      .join(" ");

  const lastWeekKud = weeks[weeks.length - 1]?.kud ?? 0;
  const prevWeekKud = weeks[weeks.length - 2]?.kud ?? 0;
  const trendDelta =
    prevWeekKud === 0
      ? 0
      : Math.round(((lastWeekKud - prevWeekKud) / Math.max(1, prevWeekKud)) * 100);

  const kudosDelta = monthKudos - prevMonthKudos;
  const kpis: Array<[string, string, string, boolean]> = [
    [
      locale === "it" ? "KUDOS · MESE" : "KUDOS · MONTH",
      String(monthKudos),
      locale === "it"
        ? `${kudosDelta >= 0 ? "+" : ""}${kudosDelta} vs scorso mese`
        : `${kudosDelta >= 0 ? "+" : ""}${kudosDelta} vs last month`,
      true,
    ],
    [
      "ACHIEVEMENTS",
      String(achievements.length),
      locale === "it"
        ? `+${newAchievementsThisMonth} nuovi`
        : `+${newAchievementsThisMonth} new`,
      false,
    ],
    [
      locale === "it" ? "CHALLENGES ATTIVE" : "ACTIVE CHALLENGES",
      String(openChallenges),
      locale === "it" ? `${closingSoon} in scadenza` : `${closingSoon} closing soon`,
      false,
    ],
    [
      "GROWTH SCORE",
      String(growthScore),
      locale === "it" ? `${weeks.length} sett` : `${weeks.length} wks`,
      true,
    ],
  ];

  return (
    <div className="flex flex-col gap-4 min-h-0">
      {/* KPI band */}
      <div
        className="grid grid-cols-2 md:grid-cols-4"
        style={{
          border: "1px solid var(--line-strong)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {kpis.map(([label, value, sub, spark], i) => (
          <div
            key={label}
            className={cn(
              "p-4 flex flex-col gap-1",
              i % 2 === 0 ? "border-r border-[var(--line)]" : "",
              i < 2 ? "border-b md:border-b-0 border-[var(--line)]" : "",
              "md:border-r md:[&:nth-child(4)]:border-r-0",
            )}
            style={{
              background: spark
                ? "color-mix(in oklch, var(--spark) 8%, transparent)"
                : "transparent",
              borderRightColor: "var(--line)",
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {label}
            </span>
            <span
              className="t-num"
              style={{ fontSize: 38, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {value}
            </span>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {sub}
            </span>
          </div>
        ))}
      </div>

      <div
        className="grid gap-4 grid-cols-1 lg:[grid-template-columns:minmax(0,4fr)_minmax(0,1fr)]"
        style={{ flex: 1, minHeight: 0 }}
      >
        {/* LEFT */}
        <section className="flex flex-col gap-3 min-h-0">
          {/* Growth River */}
          <div
            className="flex flex-col gap-3 p-5"
            style={{
              border: "1px solid var(--line-strong)",
              borderRadius: 18,
              background: "var(--bg)",
              minHeight: 320,
            }}
          >
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <div>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  GROWTH RIVER · 12 SETTIMANE · KUDOS / CHALLENGES / ACHIEVEMENTS
                </span>
                <div
                  style={{
                    fontFamily: '"Fraunces", ui-serif, serif',
                    fontStyle: "italic",
                    fontSize: 26,
                    marginTop: 4,
                    letterSpacing: "-0.025em",
                    lineHeight: 1.1,
                    maxWidth: 680,
                  }}
                >
                  La squadra è{" "}
                  <span
                    style={{
                      color: trendDelta >= 0 ? "var(--spark)" : "var(--muted-foreground)",
                      fontStyle: "normal",
                      fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                      fontSize: 20,
                    }}
                  >
                    {trendDelta >= 0 ? "+" : ""}
                    {trendDelta}%
                  </span>{" "}
                  rispetto alla settimana scorsa.
                </div>
              </div>
              <div className="flex gap-3 items-center flex-wrap">
                <LegendKey color="var(--spark)" label="KUDOS" />
                <LegendKey color="var(--fg)" label="CHALLENGES" />
                <LegendKey color="var(--muted-foreground)" label="ACHIEVEMENTS" dashed />
              </div>
            </div>

            <div
              className="grid"
              style={{ gridTemplateColumns: "44px 1fr", gap: 12, flex: 1, minHeight: 0 }}
            >
              <div
                className="flex flex-col justify-between items-end"
                style={{ padding: "12px 0 32px" }}
              >
                {[yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0].map(
                  (y) => (
                    <span
                      key={y}
                      className="t-mono"
                      style={{ color: "var(--muted-foreground)", fontSize: 9 }}
                    >
                      {y}
                    </span>
                  ),
                )}
              </div>

              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                preserveAspectRatio="none"
                style={{ width: "100%", height: "100%", minHeight: 220 }}
              >
                {[0, 0.25, 0.5, 0.75, 1].map((g) => (
                  <line
                    key={g}
                    x1="0"
                    x2={chartW}
                    y1={innerTop + g * (innerBottom - innerTop)}
                    y2={innerTop + g * (innerBottom - innerTop)}
                    stroke="var(--line)"
                    strokeDasharray={g === 1 ? "0" : "2 5"}
                  />
                ))}

                <path
                  d={kudosArea}
                  fill="color-mix(in oklch, var(--spark) 26%, transparent)"
                />
                <path d={kudosLine} fill="none" stroke="var(--spark)" strokeWidth="3" />
                {kudosPts.map((p, i) => (
                  <circle
                    key={i}
                    cx={p[0]}
                    cy={p[1]}
                    r={i === kudosPts.length - 1 ? 8 : 3}
                    fill="var(--spark)"
                    stroke={i === kudosPts.length - 1 ? "var(--bg)" : "none"}
                    strokeWidth="2"
                  />
                ))}
                {lastWeekKud > 0 && (
                  <text
                    x={kudosPts[kudosPts.length - 1][0] + 14}
                    y={kudosPts[kudosPts.length - 1][1] + 5}
                    fontFamily='"JetBrains Mono", ui-monospace, monospace'
                    fontSize="14"
                    fill="var(--fg)"
                    fontWeight="600"
                  >
                    {lastWeekKud} kudos
                  </text>
                )}

                {weeks.map((w, i) => {
                  const x = xFor(i) - 14;
                  const h = (w.chl / Math.max(1, ...weeks.map((ww) => ww.chl))) * 80;
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={innerBottom - h}
                      width="28"
                      height={h}
                      fill="var(--fg)"
                      opacity={i === weeks.length - 1 ? 1 : 0.18}
                    />
                  );
                })}

                {weeks.map((w, i) => {
                  const x = xFor(i);
                  const y =
                    innerTop +
                    (innerBottom - innerTop) * (1 - w.ach / Math.max(1, maxAch));
                  const sz = w.ach >= Math.max(2, maxAch * 0.6) ? 9 : 6;
                  return (
                    <g key={i}>
                      <polygon
                        points={`${x},${y - sz} ${x + sz},${y} ${x},${y + sz} ${x - sz},${y}`}
                        fill="var(--bg)"
                        stroke="var(--muted-foreground)"
                        strokeWidth="1.5"
                      />
                      {w.ach >= Math.max(2, maxAch * 0.7) && (
                        <text
                          x={x}
                          y={y - 14}
                          textAnchor="middle"
                          fontFamily='"JetBrains Mono", ui-monospace, monospace'
                          fontSize="10"
                          fill="var(--muted-foreground)"
                        >
                          {w.ach}
                        </text>
                      )}
                    </g>
                  );
                })}

                <line
                  x1={xFor(weeks.length - 1)}
                  x2={xFor(weeks.length - 1)}
                  y1="0"
                  y2={innerBottom}
                  stroke="var(--spark)"
                  strokeDasharray="2 4"
                />
                <text
                  x={xFor(weeks.length - 1)}
                  y="14"
                  textAnchor="end"
                  fontFamily='"JetBrains Mono", ui-monospace, monospace'
                  fontSize="10"
                  fill="var(--spark)"
                >
                  OGGI ←
                </text>
              </svg>
            </div>

            <div
              className="grid"
              style={{ gridTemplateColumns: "44px 1fr", gap: 12 }}
            >
              <span />
              <div className="flex justify-between" style={{ padding: "0 4px" }}>
                {weeks.map((w, i) => (
                  <span
                    key={i}
                    className="t-mono"
                    style={{
                      color: i === weeks.length - 1 ? "var(--spark)" : "var(--muted-foreground)",
                      fontSize: 9,
                    }}
                  >
                    {w.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Top movers + dept mix */}
          <div className="grid gap-3 grid-cols-1 sm:[grid-template-columns:1.4fr_1fr]" style={{ minHeight: 168 }}>
            <div
              className="p-4 flex flex-col gap-2"
              style={{ border: "1px solid var(--line)", borderRadius: 14, background: "var(--bg)" }}
            >
              <div className="flex justify-between items-baseline">
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  TOP MOVERS · MESE
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  RANK · DELTA
                </span>
              </div>
              <div className="flex flex-col gap-1 stagger-in">
                {topMovers.map((m, i) => (
                  <button
                    key={m.employee.id}
                    type="button"
                    onClick={() => goToTab("paths", m.employee.id)}
                    className="grid items-center text-left"
                    style={{
                      gridTemplateColumns: "20px 24px 1fr 90px 60px 60px",
                      gap: 10,
                      padding: "5px 0",
                      borderTop: i === 0 ? "none" : "1px solid var(--line)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      className="t-num"
                      style={{ fontSize: 18, color: "var(--muted-foreground)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Avatar initials={m.employee.initials} size={24} />
                    <div className="flex flex-col">
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{m.employee.name}</span>
                      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                        {m.employee.department}
                      </span>
                    </div>
                    <Spark p={Math.min(1, m.xp / 500)} />
                    <span className="t-num" style={{ fontSize: 14, textAlign: "right" }}>
                      {m.xp}xp
                    </span>
                    <span
                      className="t-mono"
                      style={{ textAlign: "right", color: "var(--spark)" }}
                    >
                      +{m.kudos}
                    </span>
                  </button>
                ))}
                {topMovers.length === 0 && (
                  <span
                    className="t-mono"
                    style={{ color: "var(--muted-foreground)", padding: "8px 0" }}
                  >
                    NESSUN MOVIMENTO QUESTO MESE
                  </span>
                )}
              </div>
            </div>

            <div
              className="p-4 flex flex-col gap-2"
              style={{ border: "1px solid var(--line)", borderRadius: 14, background: "var(--bg)" }}
            >
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {locale === "it" ? "KUDOS PER DIPARTIMENTO" : "KUDOS BY DEPARTMENT"} · {MONTHS[new Date().getMonth()]}
              </span>
              <div className="flex flex-col gap-1.5">
                {deptMix.map((d, i) => (
                  <div
                    key={d.dept}
                    className="grid items-center"
                    style={{ gridTemplateColumns: "70px 1fr 28px", gap: 8 }}
                  >
                    <span className="t-mono" style={{ fontSize: 10 }}>
                      {d.dept}
                    </span>
                    <div
                      style={{
                        height: 8,
                        background: "var(--line)",
                        borderRadius: 999,
                      }}
                    >
                      <div
                        style={{
                          width: `${d.pct}%`,
                          height: "100%",
                          background: i === 0 ? "var(--spark)" : "var(--fg)",
                          borderRadius: 999,
                        }}
                      />
                    </div>
                    <span className="t-num" style={{ fontSize: 13, textAlign: "right" }}>
                      {d.count}
                    </span>
                  </div>
                ))}
                {deptMix.length === 0 && (
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    NESSUN KUDOS QUESTO MESE
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <aside className="flex flex-col gap-3 min-h-0">
          <div
            className="p-4 flex flex-col gap-1.5"
            style={{
              border: "1px solid var(--spark)",
              background: "color-mix(in oklch, var(--spark) 10%, transparent)",
              borderRadius: 14,
            }}
          >
            <span className="t-mono">INSIGHT · OGGI</span>
            <div
              style={{
                fontFamily: '"Fraunces", ui-serif, serif',
                fontStyle: "italic",
                fontSize: 22,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {lastWeekKud > 0
                ? locale === "it"
                  ? `+${lastWeekKud} kudos questa settimana.`
                  : `+${lastWeekKud} kudos this week.`
                : locale === "it"
                  ? "Settimana tranquilla — invita un kudos."
                  : "Quiet week — drop a kudos."}
            </div>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              Trend {trendDelta >= 0 ? "+" : ""}
              {trendDelta}% vs settimana scorsa
            </span>
          </div>

          <div
            className="p-4 flex flex-col gap-2"
            style={{ border: "1px solid var(--line-strong)", borderRadius: 14 }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              REVIEW IN ARRIVO · 14 GG
            </span>
            {upcomingReviews.length === 0 && (
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                NESSUNA
              </span>
            )}
            {upcomingReviews.map((r) => {
              const e = employeeById(r.employeeId);
              if (!e) return null;
              const d = new Date(r.date);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => goToTab("paths", e.id)}
                  className="grid items-center text-left"
                  style={{
                    gridTemplateColumns: "20px 1fr 70px",
                    gap: 8,
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  <Avatar initials={e.initials} size={20} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{e.name.split(" ")[0]}</span>
                  <span
                    className="t-mono"
                    style={{ color: "var(--muted-foreground)", textAlign: "right" }}
                  >
                    {String(d.getDate()).padStart(2, "0")} {MONTHS[d.getMonth()].toLowerCase()}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="p-4 flex flex-col gap-1.5"
            style={{ border: "1px solid var(--line-strong)", borderRadius: 14 }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {locale === "it" ? "AZIONI RAPIDE" : "QUICK ACTIONS"}
            </span>
            {[
              {
                sym: "+",
                label: locale === "it" ? "Crea kudos" : "Create kudos",
                k: "⌘K",
                on: onOpenNewKudos,
              },
              {
                sym: "◇",
                label: locale === "it" ? "Apri challenge" : "Open challenge",
                k: "⌘L",
                on: onOpenNewChallenge,
              },
              {
                sym: "★",
                label: locale === "it" ? "Vai ad achievements" : "Go to achievements",
                k: "⌘A",
                on: () => goToTab("achievements"),
              },
              { sym: "↗", label: "Skill paths", k: "⌘1", on: () => goToTab("paths") },
            ].map((a, i) => (
              <button
                key={a.label}
                type="button"
                onClick={a.on}
                className="grid items-center text-left"
                style={{
                  gridTemplateColumns: "22px 1fr 36px",
                  gap: 10,
                  padding: "6px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--line)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span
                  className="t-mono"
                  style={{ color: "var(--spark)", fontSize: 16 }}
                >
                  {a.sym}
                </span>
                <span
                  style={{
                    fontFamily: '"Fraunces", ui-serif, serif',
                    fontStyle: "italic",
                    fontSize: 17,
                  }}
                >
                  {a.label}
                </span>
                <span
                  className="t-mono"
                  style={{ color: "var(--muted-foreground)", textAlign: "right" }}
                >
                  {a.k}
                </span>
              </button>
            ))}
          </div>

          <div
            className="p-3 flex flex-col gap-1"
            style={{ border: "1px dashed var(--line-strong)", borderRadius: 14 }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ATTENZIONE
            </span>
            <span
              style={{
                fontFamily: '"Fraunces", ui-serif, serif',
                fontStyle: "italic",
                fontSize: 16,
                lineHeight: 1.25,
              }}
            >
              {stalePeople > 0
                ? `${stalePeople} persone non ricevono kudos da oltre 60 giorni.`
                : "Tutti hanno ricevuto un kudos negli ultimi 60 giorni."}
            </span>
            {stalePeople > 0 && (
              <button
                type="button"
                onClick={() => goToTab("kudos")}
                className="t-mono"
                style={{
                  color: "var(--spark)",
                  marginTop: 4,
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                Vedi muro →
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function LegendKey({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center" style={{ gap: 6 }}>
      <span
        style={{
          width: 14,
          height: 3,
          background: dashed ? "transparent" : color,
          borderTop: dashed ? `2px dashed ${color}` : "none",
          display: "inline-block",
        }}
      />
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
    </span>
  );
}

function Spark({ p }: { p: number }) {
  return (
    <div style={{ height: 4, background: "var(--line)", borderRadius: 999, width: "100%" }}>
      <div
        style={{
          width: `${p * 100}%`,
          height: "100%",
          background: p >= 0.7 ? "var(--spark)" : "var(--fg)",
          borderRadius: 999,
        }}
      />
    </div>
  );
}
