import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useExpenses, expensesTable } from "@/lib/tables/expenses";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { commesse, type Expense } from "@/lib/mock-data";

const STATUS_FILTERS: Array<Expense["status"] | "all"> = ["all", "pending", "approved", "rejected", "reimbursed"];

function statusLabel(s: Expense["status"]): string {
  switch (s) {
    case "pending":
      return "PENDING";
    case "approved":
      return "APPROVATA";
    case "rejected":
      return "RIFIUTATA";
    case "reimbursed":
      return "RIMBORSATA";
  }
}

function projectFor(empId: string): string {
  return commesse.find((c) => c.ownerId === empId)?.code ?? "—";
}

function formatAmount(amount: number, currency: Expense["currency"]): string {
  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  return `${symbol} ${amount.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ExpensesEditorial() {
  const expenses = useExpenses();
  const employees = useEmployees();
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");

  const summary = useMemo(() => {
    const sum = (st: Expense["status"]) =>
      expenses.filter((x) => x.status === st).reduce((a, x) => a + x.amount, 0);
    return {
      pending: sum("pending"),
      approved: sum("approved"),
      rejected: sum("rejected"),
      total: expenses.reduce((a, x) => a + x.amount, 0),
    };
  }, [expenses]);

  const visible = useMemo(() => {
    if (filter === "all") return expenses;
    return expenses.filter((e) => e.status === filter);
  }, [expenses, filter]);

  function update(id: string, patch: Partial<Expense>, label: string) {
    expensesTable.update(id, patch);
    toast.success(label);
  }

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-6 min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            NOTE SPESE · {summary.pending > 0 ? `€ ${summary.pending.toFixed(0)} DA APPROVARE` : "TUTTO APPROVATO"}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(72px, 9vw, 116px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Spese</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button type="button" className="pill pill-ghost pill-sm">
            Esporta
          </button>
          <button type="button" className="pill pill-dark pill-sm">
            + Spesa
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => {
          const active = filter === s;
          const label = s === "all" ? "TUTTE" : statusLabel(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
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
              {label}
            </button>
          );
        })}
      </div>

      {/* Summary band */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: "1px solid var(--line-strong)",
          borderBottom: "1px solid var(--line-strong)",
          padding: "20px 0",
        }}
      >
        <SummaryCell label="IN CODA" value={`€ ${summary.pending.toFixed(0)}`} accent="spark" first />
        <SummaryCell label="APPROVATE" value={`€ ${summary.approved.toFixed(0)}`} />
        <SummaryCell label="RIFIUTATE" value={`€ ${summary.rejected.toFixed(0)}`} />
        <SummaryCell label="TOTALE" value={`€ ${summary.total.toFixed(0)}`} />
      </div>

      {/* List */}
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
              "--cols": "40px 1.2fr 1.6fr 110px 100px 110px 120px",
              background: "var(--bg-2)",
            } as React.CSSProperties
          }
        >
          <span></span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>PERSONA</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>VOCE</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>IMPORTO</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>COMMESSA</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>STATO</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>AZIONE</span>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {visible.map((e) => {
            const emp = employeeById(e.employeeId) ?? employees.find((emp) => emp.id === e.employeeId);
            if (!emp) return null;
            const pending = e.status === "pending";
            const rejected = e.status === "rejected";
            return (
              <div
                key={e.id}
                className="tab-row"
                style={
                  {
                    "--cols": "40px 1.2fr 1.6fr 110px 100px 110px 120px",
                    "--row-pad": "13px",
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
                    fontSize: 17,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {e.description}
                </span>
                <span className="t-num" style={{ textAlign: "right", fontSize: 17 }}>
                  {formatAmount(e.amount, e.currency)}
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {projectFor(emp.id)}
                </span>
                <span
                  className="t-mono"
                  style={{
                    textAlign: "right",
                    color: pending ? "var(--spark)" : rejected ? "var(--muted-foreground)" : "var(--fg-2)",
                  }}
                >
                  {statusLabel(e.status)}
                </span>
                <div className="flex gap-1.5 justify-end">
                  {pending && (
                    <>
                      <button
                        type="button"
                        className="t-mono"
                        onClick={() => update(e.id, { status: "approved" }, `Approvata · ${e.description}`)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: "1px solid var(--spark)",
                          background: "transparent",
                          color: "var(--spark)",
                          cursor: "pointer",
                        }}
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        className="t-mono"
                        onClick={() => update(e.id, { status: "rejected" }, `Rifiutata · ${e.description}`)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: "1px solid var(--line-strong)",
                          background: "transparent",
                          color: "var(--muted-foreground)",
                          cursor: "pointer",
                        }}
                      >
                        NO
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {visible.length === 0 && (
            <div className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
              <span className="t-mono">NESSUNA SPESA</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCell({
  label,
  value,
  accent,
  first,
}: {
  label: string;
  value: string;
  accent?: "spark";
  first?: boolean;
}) {
  return (
    <div
      style={{
        paddingLeft: first ? 0 : 18,
        borderLeft: first ? "none" : "1px solid var(--line)",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div
        className="t-num"
        style={{
          fontSize: 38,
          marginTop: 4,
          letterSpacing: "-0.03em",
          color: accent === "spark" ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
