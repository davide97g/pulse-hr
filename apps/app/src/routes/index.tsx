import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Constellation } from "@/components/dashboard/Constellation";
import { buildConstellationPeople, countByDept } from "@/components/dashboard/buildPeople";
import { lensFor } from "@/components/dashboard/lenses";
import { useT, useI18n } from "@pulse-hr/shared/i18n";
import { cardsFor, type CardSignals } from "@/components/dashboard/cards";
import { useDashboardLens } from "@/components/dashboard/useDashboardLens";
import type { LensId } from "@/components/dashboard/types";
import {
  projects,
  candidates,
  kudosSeed,
  oneOnOnesSeed,
  growthNotesSeed,
  managerAsks,
} from "@/lib/mock-data";
import { offices } from "@/lib/offices";
import { useEmployees } from "@/lib/tables/employees";
import { useLeaveRequests } from "@/lib/tables/leave";
import { useTheme } from "@pulse-hr/ui/theme";
import { THEMES } from "@pulse-hr/ui/theme";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Pulse HR" }] }),
  component: Dashboard,
});

const WEEKDAYS_IT = [
  "DOMENICA",
  "LUNEDÌ",
  "MARTEDÌ",
  "MERCOLEDÌ",
  "GIOVEDÌ",
  "VENERDÌ",
  "SABATO",
];
const MONTHS_IT_SHORT = [
  "GEN",
  "FEB",
  "MAR",
  "APR",
  "MAG",
  "GIU",
  "LUG",
  "AGO",
  "SET",
  "OTT",
  "NOV",
  "DIC",
];

function getISOWeek(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86_400_000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    )
  );
}

function Dashboard() {
  const t = useT();
  const { locale } = useI18n();
  const employees = useEmployees();
  const leaveRequests = useLeaveRequests();
  const { lens, setLens } = useDashboardLens();
  const { theme } = useTheme();
  const dark = (THEMES.find((th) => th.id === theme)?.mode ?? "dark") === "dark";

  const people = useMemo(
    () => buildConstellationPeople(employees, projects),
    [employees],
  );

  const signals = useMemo<CardSignals>(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const pendingLeaves = leaveRequests.filter((l) => l.status === "pending");
    const activeProjects = projects.filter((c) => c.status === "active");
    const sat = activeProjects.length
      ? activeProjects.reduce(
          (s, c) => s + (c.budgetHours > 0 ? c.burnedHours / c.budgetHours : 0),
          0,
        ) / activeProjects.length
      : 0;
    const atRiskCount = activeProjects.filter(
      (c) => c.budgetHours > 0 && c.burnedHours / c.budgetHours >= 0.8,
    ).length;
    const sortedByBurn = [...activeProjects]
      .filter((c) => c.budgetHours > 0)
      .sort((a, b) => b.burnedHours / b.budgetHours - a.burnedHours / a.budgetHours);
    const top = sortedByBurn[0];
    const candidatesActive = candidates.filter((c) => c.stage !== "Hired").length;
    const offers = candidates.filter((c) => c.stage === "Offer").length;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const kudosThisMonth = kudosSeed.filter((k) => new Date(k.date) >= monthStart).length;
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const kudosLastMonth = kudosSeed.filter(
      (k) => new Date(k.date) >= lastMonthStart && new Date(k.date) < monthStart,
    ).length;
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86_400_000);
    const oneOnOneOpen = oneOnOnesSeed.filter((o) => new Date(o.date) >= fourteenDaysAgo).length;
    const oneOnOneLate = oneOnOnesSeed.filter((o) => new Date(o.date) < fourteenDaysAgo).length;
    const growthOpen = growthNotesSeed.length;
    const week = getISOWeek(now);
    const outToday = employees.filter((e) => e.status === "on_leave").length;
    const newLeaves = pendingLeaves.length;
    const officesOpen = offices.length;
    const busiest = offices[0];
    void managerAsks;
    void today;
    void top;

    return {
      pendingLeavesCount: pendingLeaves.length,
      pendingLeavesToApprove: pendingLeaves.length,
      recruitingCandidates: candidatesActive,
      recruitingOffers: offers,
      pulseResponseRate: 0.87,
      pulseDeltaPp: 6,
      oneOnOneOpen,
      oneOnOneLate,
      kudosThisMonth,
      kudosDelta: kudosThisMonth - kudosLastMonth,
      growthOpen,
      momentsToday: 3,
      timesheetsToClose: 4,
      weekNumber: week,
      outToday,
      newLeaveRequests: newLeaves,
      meetingsToday: 23,
      meetingConflicts: 2,
      satMeanPct: Math.round(sat * 100),
      projectsAtRisk: atRiskCount,
      officesOpen,
      officesTotal: offices.length || 0,
      busiestOfficeName: busiest?.name?.split(",")[0] ?? "—",
      busiestOfficePct: 92,
    };
  }, [employees, leaveRequests]);

  const cards = useMemo(() => cardsFor(lens, signals, t), [lens, signals, t]);

  const topProjectCode = useMemo(() => {
    const active = projects.filter((c) => c.status === "active" && c.budgetHours > 0);
    const sorted = [...active].sort(
      (a, b) => b.burnedHours / b.budgetHours - a.burnedHours / a.budgetHours,
    );
    return sorted[0]?.code ?? "—";
  }, []);

  const captionMono = useMemo(() => {
    const WEEKDAYS_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const MONTHS_EN = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const now = new Date();
    const day = now.getDate();
    const wd = locale === "it" ? WEEKDAYS_IT[now.getDay()] : WEEKDAYS_EN[now.getDay()];
    const m = locale === "it" ? MONTHS_IT_SHORT[now.getMonth()] : MONTHS_EN[now.getMonth()];
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const peopleLabel = locale === "it" ? "PERSONE" : "PEOPLE";
    const projectsLabel = "PROJECTS";
    if (lens === "sentiment") {
      const responded = locale === "it" ? "RISPOSTA" : "RESPONDED";
      return `PULSE SURVEY · ${people.length} ${peopleLabel} · 87% ${responded} · WEEK ${signals.weekNumber}`;
    }
    if (lens === "presence") {
      const live = locale === "it" ? "TIMBRATURE LIVE" : "LIVE PRESENCE";
      return `${wd} ${day} ${m} · ${hh}:${mm} · ${live}`;
    }
    return `${people.length} ${peopleLabel} · ${projects.length} ${projectsLabel} · ${day} ${m}, ${hh}:${mm}`;
  }, [lens, people.length, signals.weekNumber, locale]);

  const narrative = useMemo(() => {
    const it = locale === "it";
    if (lens === "sentiment") {
      const atRisk = people.filter((p) => p.surveyResponded && p.sentiment < 2.5).length;
      return it ? (
        <>
          Pocket di <span className="spark-mark">stress in OPS</span> dopo la run di aprile.
          {` ${atRisk}`} persone sotto soglia: programmare 1-on-1 con i lead questa settimana.
        </>
      ) : (
        <>
          Pocket of <span className="spark-mark">stress in OPS</span> after the April run.
          {` ${atRisk}`} people below threshold: book 1-on-1s with leads this week.
        </>
      );
    }
    if (lens === "presence") {
      const onsite = people.filter((p) => p.presence === "OFFICE").length;
      const total = people.length || 1;
      const pct = Math.round((onsite / total) * 100);
      return it ? (
        <>
          <span className="spark-mark">{pct}% del team operativo</span> stamattina.
          Tre stand-up coperti senza buchi; coda OPS al completo per la demo cliente.
        </>
      ) : (
        <>
          <span className="spark-mark">{pct}% of the team on-site</span> this morning.
          Three stand-ups fully covered; OPS bench ready for the client demo.
        </>
      );
    }
    const over = people.filter((p) => p.sat > 1.05).length;
    if (it) {
      return (
        <>
          {over === 0 ? "Nessuno" : `${over} person${over === 1 ? "a" : "e"}`} sopra capacità,
          principalmente su{" "}
          <strong style={{ fontStyle: "normal" }}>{topProjectCode}</strong>. Il resto
          del corpo lavora a un ritmo <span className="spark-mark">sostenibile</span>.
        </>
      );
    }
    return (
      <>
        {over === 0 ? "Nobody" : `${over} ${over === 1 ? "person" : "people"}`} above capacity,
        mostly on{" "}
        <strong style={{ fontStyle: "normal" }}>{topProjectCode}</strong>. The rest of the team
        runs at a <span className="spark-mark">sustainable</span> pace.
      </>
    );
  }, [lens, people, topProjectCode, locale]);

  const lensConfig = useMemo(() => {
    const cfg = lensFor(lens, dark, {
      narrative,
      captionMono,
      totalPeople: people.length,
    });
    const it = locale === "it";
    const localizedHeadline: [string, string, string] =
      lens === "workload"
        ? [t("dashboard.title.workload.0"), t("dashboard.title.workload.1"), "."]
        : lens === "sentiment"
          ? [t("dashboard.title.sentiment.0"), t("dashboard.title.sentiment.1"), "."]
          : it
            ? ["L'azienda è ", "qui", "."]
            : ["The company is ", "here", "."];
    const localizedEyebrow =
      lens === "workload"
        ? t("dashboard.eyebrow.workload")
        : lens === "sentiment"
          ? t("dashboard.eyebrow.sentiment")
          : t("dashboard.eyebrow.presence");
    const kpiLabelMap: Record<string, [string, string]> = {
      workload: ["AVG SATURATION", "SATURAZIONE MEDIA"],
      sentiment: ["AVG ENPS / MOOD", "ENPS / MOOD MEDIO"],
      presence: ["LIVE PRESENCE", "PRESENZA LIVE"],
    };
    const legendLabelMap: Record<string, [string, string]> = {
      workload: ["LOAD PER PERSON", "CARICO PER PERSONA"],
      sentiment: ["WELLBEING PER PERSON", "BENESSERE PER PERSONA"],
      presence: ["STATE PER PERSON", "STATO PER PERSONA"],
    };
    const localizedKpiLabel = kpiLabelMap[lens][it ? 1 : 0];
    const localizedLegendLabel = legendLabelMap[lens][it ? 1 : 0];
    const triadLabelsByLens: Record<string, [string, string, string]> = {
      workload: it
        ? ["OVER", "BILANCIATI", "IDLE"]
        : ["OVER", "BALANCED", "IDLE"],
      sentiment: it
        ? ["A RISCHIO", "NEUTRI", "FELICI"]
        : ["AT RISK", "NEUTRAL", "HAPPY"],
      presence: it
        ? ["IN UFFICIO", "REMOTI", "ASSENTI"]
        : ["ON-SITE", "REMOTE", "AWAY"],
    };
    const triadLabels = triadLabelsByLens[lens];
    const originalTriad = cfg.statTriad;
    return {
      ...cfg,
      headline: localizedHeadline,
      eyebrow: localizedEyebrow,
      kpiLabel: localizedKpiLabel,
      legendLabel: localizedLegendLabel,
      statTriad: (ppl: typeof people) => {
        const orig = originalTriad(ppl);
        return orig.map(([, value, accent], i) => [triadLabels[i] ?? "", value, accent]) as typeof orig;
      },
    };
  }, [lens, dark, narrative, captionMono, people.length, t, locale]);

  return (
    <div className="p-4 md:p-6 flex flex-col" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
      <Constellation
        people={people}
        lens={lensConfig}
        cards={cards}
        dark={dark}
        deptCounts={countByDept(people)}
        lensSwitcher={<LensSwitcher value={lens} onChange={setLens} />}
      />
    </div>
  );
}

function LensSwitcher({ value, onChange }: { value: LensId; onChange: (l: LensId) => void }) {
  const t = useT();
  const items: Array<[LensId, string]> = [
    ["workload", t("dashboard.eyebrow.workload")],
    ["sentiment", t("dashboard.eyebrow.sentiment")],
    ["presence", t("dashboard.eyebrow.presence")],
  ];
  return (
    <div
      className="flex items-center gap-0.5 rounded-full p-0.5"
      style={{ border: "1px solid var(--line)" }}
    >
      {items.map(([id, label]) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="t-mono"
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              cursor: "pointer",
              background: active ? "var(--fg)" : "transparent",
              color: active ? "var(--bg)" : "var(--muted-foreground)",
              border: "none",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
