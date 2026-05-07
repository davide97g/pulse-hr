import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Constellation } from "@/components/dashboard/Constellation";
import { buildConstellationPeople, DEPT_TOTALS } from "@/components/dashboard/buildPeople";
import { lensFor } from "@/components/dashboard/lenses";
import { cardsFor, type CardSignals } from "@/components/dashboard/cards";
import { useDashboardLens } from "@/components/dashboard/useDashboardLens";
import type { LensId } from "@/components/dashboard/types";
import {
  commesse,
  payrollRuns,
  candidates,
  kudosSeed,
  oneOnOnesSeed,
  growthNotesSeed,
  managerAsks,
} from "@/lib/mock-data";
import { offices } from "@/lib/offices";
import { useEmployees } from "@/lib/tables/employees";
import { useLeaveRequests } from "@/lib/tables/leave";
import { useExpenses } from "@/lib/tables/expenses";
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
  const employees = useEmployees();
  const leaveRequests = useLeaveRequests();
  const expenses = useExpenses();
  const { lens, setLens } = useDashboardLens();
  const { theme } = useTheme();
  const dark = (THEMES.find((t) => t.id === theme)?.mode ?? "dark") === "dark";

  const people = useMemo(
    () => buildConstellationPeople(employees, commesse),
    [employees],
  );

  const signals = useMemo<CardSignals>(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const pendingLeaves = leaveRequests.filter((l) => l.status === "pending");
    const pendingExpenses = expenses.filter((e) => e.status === "pending");
    const upcomingPayroll =
      payrollRuns.find((r) => r.status === "scheduled" || r.status === "draft") ??
      payrollRuns[0];
    const expensesAmount = pendingExpenses.reduce((s, e) => s + (e.amount ?? 0), 0);
    const activeCommesse = commesse.filter((c) => c.status === "active");
    const sat = activeCommesse.length
      ? activeCommesse.reduce(
          (s, c) => s + (c.budgetHours > 0 ? c.burnedHours / c.budgetHours : 0),
          0,
        ) / activeCommesse.length
      : 0;
    const atRiskCount = activeCommesse.filter(
      (c) => c.budgetHours > 0 && c.burnedHours / c.budgetHours >= 0.8,
    ).length;
    const sortedByBurn = [...activeCommesse]
      .filter((c) => c.budgetHours > 0)
      .sort((a, b) => b.burnedHours / b.budgetHours - a.burnedHours / a.budgetHours);
    const top = sortedByBurn[0];
    const burnK = top ? Math.round(top.burnedHours * 0.12) : 0;
    const planPct = top
      ? Math.round((top.burnedHours / top.budgetHours - 1) * 100)
      : 0;
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

    return {
      pendingLeavesCount: pendingLeaves.length,
      pendingLeavesToApprove: pendingLeaves.length,
      pendingExpensesAmount: Math.round(expensesAmount),
      pendingExpensesCount: pendingExpenses.length,
      payrollAmountK: upcomingPayroll ? Math.round(upcomingPayroll.gross / 1000) : 0,
      payrollPeriod: upcomingPayroll?.period ?? "—",
      payrollStatus: upcomingPayroll
        ? upcomingPayroll.status === "scheduled" || upcomingPayroll.status === "draft"
          ? "in revisione"
          : upcomingPayroll.status
        : "—",
      forecastBurnK: burnK,
      forecastVsPlanPct: planPct,
      forecastCommessaCode: top?.code ?? "—",
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
      commesseAtRisk: atRiskCount,
      officesOpen,
      officesTotal: offices.length || 0,
      busiestOfficeName: busiest?.name?.split(",")[0] ?? "—",
      busiestOfficePct: 92,
    };
  }, [employees, leaveRequests, expenses]);

  const cards = useMemo(() => cardsFor(lens, signals), [lens, signals]);

  const captionMono = useMemo(() => {
    const now = new Date();
    const day = now.getDate();
    const wd = WEEKDAYS_IT[now.getDay()];
    const m = MONTHS_IT_SHORT[now.getMonth()];
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    if (lens === "sentiment") {
      return `PULSE SURVEY · ${people.length} PERSONE · 87% RISPOSTA · WEEK ${signals.weekNumber}`;
    }
    if (lens === "presence") {
      return `${wd} ${day} ${m} · ${hh}:${mm} · TIMBRATURE LIVE`;
    }
    return `${people.length} PERSONE · ${commesse.length} COMMESSE · ${day} ${m}, ${hh}:${mm}`;
  }, [lens, people.length, signals.weekNumber]);

  const narrative = useMemo(() => {
    if (lens === "sentiment") {
      const atRisk = people.filter((p) => p.surveyResponded && p.sentiment < 2.5).length;
      return (
        <>
          Pocket di <span className="spark-mark">stress in OPS</span> dopo la run di aprile.
          {` ${atRisk}`} persone sotto soglia: programmare 1-on-1 con i lead questa settimana.
        </>
      );
    }
    if (lens === "presence") {
      const onsite = people.filter((p) => p.presence === "OFFICE").length;
      const total = people.length || 1;
      const pct = Math.round((onsite / total) * 100);
      return (
        <>
          <span className="spark-mark">{pct}% del team operativo</span> stamattina.
          Tre stand-up coperti senza buchi; coda OPS al completo per la demo cliente.
        </>
      );
    }
    const over = people.filter((p) => p.sat > 1.05).length;
    return (
      <>
        {over === 0 ? "Nessuno" : `${over} person${over === 1 ? "a" : "e"}`} sopra capacità,
        principalmente su{" "}
        <strong style={{ fontStyle: "normal" }}>{signals.forecastCommessaCode}</strong>. Il resto
        del corpo lavora a un ritmo <span className="spark-mark">sostenibile</span>.
      </>
    );
  }, [lens, people, signals.forecastCommessaCode]);

  const lensConfig = useMemo(
    () =>
      lensFor(lens, dark, {
        narrative,
        captionMono,
        totalPeople: people.length,
      }),
    [lens, dark, narrative, captionMono, people.length],
  );

  return (
    <div className="p-4 md:p-6 flex flex-col" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
      <Constellation
        people={people}
        lens={lensConfig}
        cards={cards}
        dark={dark}
        deptCounts={DEPT_TOTALS}
        lensSwitcher={<LensSwitcher value={lens} onChange={setLens} />}
      />
    </div>
  );
}

function LensSwitcher({ value, onChange }: { value: LensId; onChange: (l: LensId) => void }) {
  const items: Array<[LensId, string]> = [
    ["workload", "Workload"],
    ["sentiment", "Sentiment"],
    ["presence", "Presenza"],
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
