import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EditorialPage } from "@/components/app/layouts/EditorialPage";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { Eyebrow } from "@pulse-hr/ui/atoms/Eyebrow";
import { AvatarDisplay } from "@pulse-hr/ui/atoms/AvatarDisplay";
import { payrollRuns } from "@/lib/mock-data";
import { useEmployees } from "@/lib/tables/employees";
import { toast } from "sonner";

export const Route = createFileRoute("/payroll")({
  head: () => ({ meta: [{ title: "Payroll — Pulse HR" }] }),
  component: PayrollPage,
});

function PayrollPage() {
  const employees = useEmployees();
  const navigate = useNavigate();
  const [selectedRunId, setSelectedRunId] = useState(payrollRuns[0]?.id);

  const run = useMemo(
    () => payrollRuns.find((r) => r.id === selectedRunId) ?? payrollRuns[0],
    [selectedRunId],
  );
  if (!run) {
    return (
      <EditorialPage title="Payroll" eyebrowText="MONEY · NESSUNA RUN">
        <p className="t-body-lg" style={{ color: "var(--muted-foreground)" }}>
          Non hai ancora avviato nessuna run di payroll.
        </p>
      </EditorialPage>
    );
  }

  const total = run.gross;
  const net = run.net;
  const taxes = run.gross - run.net;

  // Build a payslip row for each active employee (mock — split the gross
  // proportionally so the demo numbers add up to `run.gross`).
  const eligible = employees.filter((e) => e.status === "active" || e.status === "remote");
  const baseShare = total / Math.max(eligible.length, 1);
  const payslips = eligible.map((e, i) => {
    // tiny deterministic spread so numbers vary
    const variance = ((i * 137) % 1300) - 650;
    const gross = Math.round(baseShare + variance);
    const anomaly = i % 11 === 0 || i % 13 === 0;
    return { employee: e, gross, anomaly };
  });
  const anomalies = payslips.filter((p) => p.anomaly);

  return (
    <EditorialPage
      eyebrow={
        <Eyebrow
          tag={
            <span className="tag-spark">
              <span
                className="dot"
                style={{ background: "var(--spark-ink)", boxShadow: "none" }}
              />
              {run.status.toUpperCase()}
            </span>
          }
          note={`· ${run.employees} DIPENDENTI · ${anomalies.length} ANOMALIE`}
        >
          MONEY · RUN {run.period.toUpperCase()}
        </Eyebrow>
      }
      actions={
        <>
          <EditorialPill kind="ghost" size="sm" onClick={() => navigate({ to: "/expenses" })}>
            Spese
          </EditorialPill>
          <EditorialPill
            kind="spark"
            size="sm"
            arrow
            onClick={() => toast.success(`Run ${run.period} approvata`, { description: "Invio cedolini in coda." })}
          >
            Approva run
          </EditorialPill>
        </>
      }
      title={
        <>
          <span className="t-num">€&nbsp;{total.toLocaleString("it-IT")}</span>
          <span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
        </>
      }
      italic={false}
      summary={
        <>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            BREAKDOWN · {run.period}
          </span>
          <p className="t-body-lg" style={{ marginTop: 8, color: "var(--fg-2)" }}>
            <strong style={{ fontWeight: 600 }}>€{net.toLocaleString("it-IT")}</strong> netto verrà
            accreditato il {new Date(run.date).toLocaleDateString("it-IT", { day: "numeric", month: "long" })};
            {anomalies.length > 0 && (
              <>
                {" "}
                <span className="spark-mark" style={{ fontWeight: 600 }}>
                  {anomalies.length} cedolin{anomalies.length === 1 ? "o" : "i"} richiede revisione
                </span>
              </>
            )}
            .
          </p>
        </>
      }
    >
      {/* Run pills */}
      <div className="flex gap-2 flex-wrap">
        {payrollRuns.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRunId(r.id)}
            className={r.id === selectedRunId ? "pill pill-dark pill-sm" : "pill pill-ghost pill-sm"}
          >
            {r.period}
          </button>
        ))}
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <BreakdownCell label="Lordo totale" value={`€ ${total.toLocaleString("it-IT")}`} blend />
        <BreakdownCell label="Imposte e contributi" value={`€ ${taxes.toLocaleString("it-IT")}`} />
        <BreakdownCell label="Netto in busta" value={`€ ${net.toLocaleString("it-IT")}`} />
      </div>

      {/* Anomalies rail */}
      {anomalies.length > 0 && (
        <div className="rail-spark">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ⚠ ANOMALIE
          </span>
          <ul className="mt-2 flex flex-col gap-1">
            {anomalies.slice(0, 3).map((a) => (
              <li key={a.employee.id} className="t-body-lg" style={{ fontStyle: "italic", fontFamily: "Fraunces, ui-serif, serif", fontSize: 18 }}>
                {a.employee.name} · €{a.gross.toLocaleString("it-IT")}{" "}
                <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
                  · scostamento previsto
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Payslips table */}
      <div className="solid-card overflow-hidden">
        <div
          className="tab-row head"
          style={{
            ["--cols" as string]: "40px 1fr 160px 120px 80px",
            color: "var(--muted-foreground)",
          }}
        >
          <span />
          <span className="t-mono">Dipendente</span>
          <span className="t-mono">Ruolo</span>
          <span className="t-mono text-right">Lordo €</span>
          <span className="t-mono text-right">Stato</span>
        </div>
        {payslips.map((p) => (
          <div
            key={p.employee.id}
            className="tab-row"
            style={{ ["--cols" as string]: "40px 1fr 160px 120px 80px" }}
          >
            <span className="flex items-center">
              <AvatarDisplay initials={p.employee.initials} size="sm" />
            </span>
            <span style={{ fontFamily: "Fraunces, ui-serif, serif", fontStyle: "italic", fontSize: 16 }}>
              {p.employee.name}
            </span>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {p.employee.role}
            </span>
            <span className="t-num text-right">€ {p.gross.toLocaleString("it-IT")}</span>
            <span className="text-right">
              {p.anomaly ? (
                <span className="tag-attention">⚠</span>
              ) : (
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  OK
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </EditorialPage>
  );
}

function BreakdownCell({ label, value, blend }: { label: string; value: string; blend?: boolean }) {
  return (
    <div className="solid-card p-5 flex flex-col gap-2">
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span
        className="t-num"
        style={{
          fontSize: 48,
          letterSpacing: "-0.03em",
          color: blend ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
