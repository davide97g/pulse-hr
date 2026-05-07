import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  payrollRuns,
  payslips,
  __setPayrollRuns,
  type PayrollRun,
} from "@/lib/mock-data";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { commesse } from "@/lib/mock-data";

const MONTHS_IT_FULL = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

function localizePeriod(period: string): { italian: string; eyebrow: string } {
  // "April 2026" → "Aprile" / "APRILE 2026"
  const idx = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ].findIndex((m) => period.startsWith(m));
  if (idx === -1) return { italian: period, eyebrow: period.toUpperCase() };
  const month = MONTHS_IT_FULL[idx];
  const year = period.slice(period.indexOf(" ") + 1);
  return { italian: month, eyebrow: `${month.toUpperCase()} ${year}` };
}

function projectFor(empId: string): string {
  return commesse.find((c) => c.ownerId === empId)?.code ?? "—";
}

export function PayrollEditorial() {
  const employees = useEmployees();

  // Pick the most actionable run: scheduled/draft first, else the latest.
  const initialRunId =
    payrollRuns.find((r) => r.status === "scheduled" || r.status === "draft")?.id ??
    payrollRuns[0]?.id ??
    "";
  const [runId, setRunId] = useState(initialRunId);

  const run = payrollRuns.find((r) => r.id === runId) ?? payrollRuns[0];
  const period = useMemo(() => localizePeriod(run?.period ?? ""), [run?.period]);

  const runSlips = useMemo(
    () => payslips.filter((p) => p.runId === run?.id),
    [run?.id],
  );

  const totals = useMemo(() => {
    const gross = runSlips.reduce((s, p) => s + p.gross, 0);
    const net = runSlips.reduce((s, p) => s + p.net, 0);
    const tax = runSlips.reduce((s, p) => s + p.tax, 0);
    const benefits = runSlips.reduce((s, p) => s + p.benefits, 0);
    return { gross, net, tax, benefits };
  }, [runSlips]);

  const anomalies = runSlips.filter((p) => p.status === "hold").length;
  const commesseCount = commesse.filter((c) => c.status === "active").length;

  function approveRun() {
    if (!run) return;
    const next = payrollRuns.map((r) =>
      r.id === run.id ? { ...r, status: "processing" as PayrollRun["status"] } : r,
    );
    __setPayrollRuns(next);
    toast.success(`Run di ${period.italian} approvata`, {
      description: "In elaborazione.",
    });
  }

  if (!run) {
    return (
      <div className="p-12 text-center" style={{ color: "var(--muted-foreground)" }}>
        <span className="t-mono">NESSUNA RUN</span>
      </div>
    );
  }

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-6 min-h-[calc(100vh-3.5rem)]">
      {/* Run picker */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          RUN
        </span>
        {payrollRuns.slice(0, 6).map((r) => {
          const active = r.id === runId;
          const local = localizePeriod(r.period);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRunId(r.id)}
              className="t-mono"
              style={{
                padding: "5px 10px",
                borderRadius: 999,
                border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
                background: active ? "var(--ink)" : "transparent",
                color: active ? "var(--paper)" : "var(--muted-foreground)",
                cursor: "pointer",
              }}
            >
              {local.italian.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Hero */}
      <div className="grid items-end gap-8" style={{ gridTemplateColumns: "1fr auto" }}>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              RUN · {run.employees} BUSTE · ELABORAZIONE{" "}
              {new Date(run.date).toLocaleDateString("it-IT", { day: "2-digit", month: "short" }).toUpperCase()}
            </span>
            <span className="dot" />
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {run.status === "scheduled" || run.status === "draft"
                ? "IN REVISIONE"
                : run.status.toUpperCase()}
            </span>
          </div>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(72px, 9vw, 124px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>{period.italian}</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 16,
              maxWidth: 540,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 20,
              lineHeight: 1.35,
            }}
          >
            Run preliminare. {anomalies > 0 ? `${anomalies} anomali${anomalies === 1 ? "a" : "e"} da chiarire prima dell'invio.` : "Nessuna anomalia rilevata."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            NETTO TOTALE
          </span>
          <span
            className="t-num"
            style={{
              fontSize: "clamp(64px, 7vw, 96px)",
              lineHeight: 0.95,
              letterSpacing: "-0.045em",
            }}
          >
            € {(totals.net / 1000).toFixed(1)}k
          </span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            LORDO € {(totals.gross / 1000).toFixed(0)}k · CONTRIBUTI €{" "}
            {(totals.tax / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Breakdown strip */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <BreakdownCell value={String(run.employees)} label="BUSTE TOTALI" />
        <BreakdownCell value={String(commesseCount)} label="COMMESSE" />
        <BreakdownCell value={String(anomalies)} label="ANOMALIE" accent={anomalies > 0 ? "warn" : undefined} />
        <BreakdownCell value="100%" label="COMPLIANCE" accent="spark" last />
      </div>

      {/* Buste list */}
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 14,
          flex: 1,
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          className="tab-row head"
          style={
            {
              "--cols": "40px 1.4fr 1fr 130px 130px 90px",
              background: "var(--bg-2)",
            } as React.CSSProperties
          }
        >
          <span></span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>DIPENDENTE</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>RUOLO</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>COMMESSA</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>NETTO</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>STATO</span>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {runSlips.map((slip) => {
            const emp = employeeById(slip.employeeId) ?? employees.find((e) => e.id === slip.employeeId);
            if (!emp) return null;
            const isHold = slip.status === "hold";
            return (
              <div
                key={slip.id}
                className="tab-row"
                style={
                  {
                    "--cols": "40px 1.4fr 1fr 130px 130px 90px",
                    "--row-pad": "12px",
                    alignItems: "center",
                  } as React.CSSProperties
                }
              >
                <span className="ph-avatar ph-avatar-sm">{emp.initials}</span>
                <span className="t-body" style={{ fontWeight: 500 }}>{emp.name}</span>
                <span
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 16,
                    color: "var(--fg-2)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {emp.role}
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {projectFor(emp.id)}
                </span>
                <span
                  className="t-num"
                  style={{
                    textAlign: "right",
                    fontSize: 18,
                    color: isHold ? "var(--spark)" : "var(--fg)",
                  }}
                >
                  € {slip.net.toLocaleString("it-IT")}
                </span>
                <span
                  className="t-mono"
                  style={{
                    textAlign: "right",
                    color: isHold ? "var(--spark)" : "var(--muted-foreground)",
                  }}
                >
                  {isHold ? "REV" : "OK"}
                </span>
              </div>
            );
          })}
          {runSlips.length === 0 && (
            <div className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
              <span className="t-mono">NESSUNA BUSTA</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          ⌘⏎ INVIA RUN · ⌘E ESPORTA F24 · ⌘\ ANOMALIE
        </span>
        <span className="flex-1" />
        <button type="button" className="pill pill-ghost pill-sm">
          Esporta CSV
        </button>
        <button type="button" className="pill pill-ghost pill-sm">
          Anteprima F24
        </button>
        <button
          type="button"
          className="pill pill-spark pill-sm"
          onClick={approveRun}
          disabled={run.status !== "scheduled" && run.status !== "draft"}
        >
          {run.status === "scheduled" || run.status === "draft" ? "Approva e invia" : "Già elaborata"}{" "}
          <span className="arr">→</span>
        </button>
      </div>
    </div>
  );
}

function BreakdownCell({
  value,
  label,
  accent,
  last,
}: {
  value: string;
  label: string;
  accent?: "spark" | "warn";
  last?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-1.5"
      style={{
        padding: "18px 22px",
        borderRight: last ? "none" : "1px solid var(--line)",
      }}
    >
      <span
        className="t-num"
        style={{
          fontSize: 36,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: accent === "spark" ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </span>
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
    </div>
  );
}
