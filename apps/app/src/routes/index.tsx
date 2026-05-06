import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { EditorialPage } from "@/components/app/layouts/EditorialPage";
import { ModuleSpread } from "@pulse-hr/ui/atoms/ModuleSpread";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { Eyebrow } from "@pulse-hr/ui/atoms/Eyebrow";
import { CompanyProfileBanner } from "@/components/app/CompanyProfileBanner";
import { commesse, managerAsks, payrollRuns } from "@/lib/mock-data";
import { useEmployees } from "@/lib/tables/employees";
import { useLeaveRequests } from "@/lib/tables/leave";
import { useExpenses } from "@/lib/tables/expenses";
import { useFirstName } from "@/lib/current-user";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Pulse HR" }] }),
  component: Dashboard,
});

const WEEKDAYS_IT = ["DOMENICA", "LUNEDÌ", "MARTEDÌ", "MERCOLEDÌ", "GIOVEDÌ", "VENERDÌ", "SABATO"];
const MONTHS_IT = [
  "GENNAIO",
  "FEBBRAIO",
  "MARZO",
  "APRILE",
  "MAGGIO",
  "GIUGNO",
  "LUGLIO",
  "AGOSTO",
  "SETTEMBRE",
  "OTTOBRE",
  "NOVEMBRE",
  "DICEMBRE",
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
  const firstName = useFirstName();
  const navigate = useNavigate();

  const pendingLeaves = leaveRequests.filter((l) => l.status === "pending");
  const pendingExpenses = expenses.filter((e) => e.status === "pending");
  const onboardingCount = employees.filter(
    (e) => e.status === "onboarding" || e.status === "remote",
  ).length;
  const onLeaveCount = employees.filter((e) => e.status === "on_leave").length;
  const openAsks = managerAsks.filter((a) => a.status === "pending").length;

  const activeCommesse = commesse.filter((c) => c.status === "active");
  const saturationFor = (c: (typeof commesse)[number]) =>
    c.budgetHours > 0 ? c.burnedHours / c.budgetHours : 0;
  const saturated = activeCommesse.filter((c) => saturationFor(c) >= 0.8);
  const atRisk = activeCommesse.filter(
    (c) => saturationFor(c) >= 0.7 && saturationFor(c) < 0.8,
  );
  const avgSaturation = Math.round(
    (activeCommesse.reduce((s, c) => s + saturationFor(c), 0) /
      Math.max(activeCommesse.length, 1)) *
      100,
  );
  const weekHours = useMemo(
    () => Math.round(activeCommesse.reduce((s, c) => s + Math.min(c.budgetHours, 40), 0) * 0.6),
    [activeCommesse],
  );

  const upcomingPayroll =
    payrollRuns.find((r) => r.status === "scheduled" || r.status === "draft") ?? payrollRuns[0];
  const expensesAmount = pendingExpenses.reduce((s, e) => s + (e.amount ?? 0), 0);

  const now = new Date();
  const date = `${WEEKDAYS_IT[now.getDay()]} — ${now.getDate()} ${MONTHS_IT[now.getMonth()]} ${now.getFullYear()}`;
  const week = `WEEK ${getISOWeek(now)}`;
  const onlineCount = Math.max(employees.length - onLeaveCount - 2, 0);

  return (
    <EditorialPage
      eyebrow={
        <Eyebrow
          tag={
            <span className="tag-spark">
              <span className="dot" style={{ background: "var(--spark-ink)", boxShadow: "none" }} />{" "}
              {onlineCount} ONLINE
            </span>
          }
          note={pendingLeaves.length ? `· ${pendingLeaves.length} APPROVAZIONI APERTE` : undefined}
        >
          {date} · {week}
        </Eyebrow>
      }
      actions={
        <>
          <EditorialPill kind="ghost" size="sm" onClick={() => navigate({ to: "/reports" })}>
            Esporta
          </EditorialPill>
          <EditorialPill
            kind="spark"
            size="sm"
            arrow
            onClick={() => navigate({ to: "/projects" })}
          >
            + Nuova commessa
          </EditorialPill>
        </>
      }
      title={
        <>
          Buongiorno,
          <br />
          <span style={{ fontStyle: "italic" }} className="spark-mark">
            {firstName}
          </span>
          <span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
        </>
      }
      summary={
        <>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            SOMMARIO · 03 MODULI
          </span>
          <p className="t-body-lg" style={{ marginTop: 8, color: "var(--fg-2)" }}>
            Hai{" "}
            <strong style={{ fontWeight: 600 }}>
              {pendingLeaves.length + pendingExpenses.length} approvazioni
            </strong>{" "}
            in coda
            {saturated.length > 0 && (
              <>
                ,{" "}
                <span className="spark-mark" style={{ fontWeight: 600 }}>
                  {saturated.length} commess
                  {saturated.length === 1 ? "a è" : "e sono"} a saturazione
                </span>
              </>
            )}
            {upcomingPayroll && <>, run {upcomingPayroll.period} in revisione</>}.
          </p>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModuleSpread
          eyebrow="01 · PEOPLE"
          kicker="Persone, leave, kudos"
          big={String(employees.length)}
          bigCaption="dipendenti attivi"
          metrics={[
            [`+${onboardingCount}`, "in onboarding", onboardingCount > 0],
            [String(pendingLeaves.length), "leave aperte"],
            [String(openAsks), "manager asks"],
          ]}
          footer={
            onLeaveCount === 0
              ? "Tutti operativi questa settimana"
              : `${onLeaveCount} in leave questa settimana`
          }
          onViewAll={() => navigate({ to: "/people" })}
        />
        <ModuleSpread
          eyebrow="02 · WORK"
          kicker="Commesse, focus, forecast"
          big={String(avgSaturation)}
          bigBlend
          bigCaption="% saturazione"
          metrics={[
            [String(activeCommesse.length), "commesse attive"],
            [`${weekHours}h`, "questa settimana"],
            [String(atRisk.length + saturated.length), "in rischio", saturated.length > 0],
          ]}
          footer="Saturazione team in salita di 4 punti"
          attention={saturated[0]?.code}
          onViewAll={() => navigate({ to: "/projects" })}
        />
        <ModuleSpread
          eyebrow="03 · MONEY"
          kicker="Payroll, spese, fatture"
          big={upcomingPayroll ? `€ ${(upcomingPayroll.gross / 1000).toFixed(0)}k` : "—"}
          bigCaption={`payroll ${upcomingPayroll?.period ?? "—"}`}
          metrics={[
            [
              upcomingPayroll
                ? new Date(upcomingPayroll.date).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "short",
                  })
                : "—",
              "run prevista",
              true,
            ],
            [`€ ${(expensesAmount / 1000).toFixed(1)}k`, "spese da approvare"],
            [String(pendingExpenses.length), "anomalie"],
          ]}
          footer={`In revisione · ${employees[0]?.name ?? "—"}`}
          cta={upcomingPayroll?.status === "scheduled" || upcomingPayroll?.status === "draft"}
          ctaLabel="Approva run"
          onCta={() => navigate({ to: "/payroll" })}
          onViewAll={() => navigate({ to: "/payroll" })}
        />
      </div>

      <CompanyProfileBanner />

      <div
        className="solid-card flex items-center justify-between p-5 mt-2"
        style={{ borderRadius: 18 }}
      >
        <div className="flex flex-col gap-1">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            FORECAST · {activeCommesse[0]?.code ?? "—"}
          </span>
          <span
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontSize: 22,
              fontStyle: "italic",
            }}
          >
            Burn projection a fine quarter
          </span>
        </div>
        <Link to="/forecast" className="pill pill-ghost pill-sm">
          Apri forecast →
        </Link>
      </div>
    </EditorialPage>
  );
}
