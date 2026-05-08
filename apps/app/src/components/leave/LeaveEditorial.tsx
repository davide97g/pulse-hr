import { useMemo } from "react";
import { toast } from "sonner";
import { useLeaveRequests, leaveTable } from "@/lib/tables/leave";
import { type LeaveRequest } from "@/lib/mock-data";
import { useDraft } from "@/lib/use-draft";

const ME = "e1";
const VACATION_ALLOWANCE = 24;
const PERMIT_ALLOWANCE = 32;

const TYPES: Array<LeaveRequest["type"]> = ["Vacation", "Sick", "Personal", "Parental"];

const MONTHS_IT_SHORT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtRange(from: string, to: string): string {
  const f = new Date(from);
  const t = new Date(to);
  if (f.getMonth() === t.getMonth())
    return `${String(f.getDate()).padStart(2, "0")}–${String(t.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[f.getMonth()]}`;
  return `${String(f.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[f.getMonth()]} – ${String(t.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[t.getMonth()]}`;
}
function localizeType(t: LeaveRequest["type"]): string {
  return { Vacation: "Ferie", Sick: "Malattia", Personal: "Permesso", Parental: "Parentale" }[t];
}
function localizeStatus(s: LeaveRequest["status"]): string {
  return { pending: "in revisione", approved: "approvato", rejected: "rifiutato" }[s];
}

export function LeaveEditorial() {
  const all = useLeaveRequests();
  const mine = useMemo(() => all.filter((l) => l.employeeId === ME), [all]);

  const usedVacation = mine
    .filter((l) => l.type === "Vacation" && l.status === "approved")
    .reduce((s, l) => s + l.days, 0);
  const remaining = Math.max(0, VACATION_ALLOWANCE - usedVacation);
  const sickDays = mine.filter((l) => l.type === "Sick" && l.status === "approved").reduce((s, l) => s + l.days, 0);
  const permitHours = mine.filter((l) => l.type === "Personal" && l.status === "approved").reduce((s, l) => s + l.days * 8, 0);

  const today = new Date().toISOString().slice(0, 10);
  const { draft, setDraft, clearDraft } = useDraft<{
    type: LeaveRequest["type"];
    from: string;
    to: string;
    reason: string;
  }>("pulsehr.draft.leave-new", {
    type: "Vacation",
    from: today,
    to: today,
    reason: "",
  });

  function submit() {
    const f = new Date(draft.from);
    const t = new Date(draft.to);
    const days = Math.max(1, Math.round((t.getTime() - f.getTime()) / 86_400_000) + 1);
    const r: LeaveRequest = {
      id: `l-${Date.now()}`,
      employeeId: ME,
      type: draft.type,
      from: draft.from,
      to: draft.to,
      days,
      status: "pending",
      reason: draft.reason || `${localizeType(draft.type)} · ${days}gg`,
      submittedAt: new Date().toISOString(),
    };
    leaveTable.add(r);
    toast.success("Richiesta inviata", { description: "In coda di approvazione." });
    clearDraft();
  }

  const history = useMemo(
    () =>
      [...mine]
        .sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime())
        .slice(0, 8),
    [mine],
  );

  return (
    <div className="ph p-4 md:p-6 grid gap-10 min-h-[calc(100vh-3.5rem)]" style={{ gridTemplateColumns: "1.05fr 1fr" }}>
      <section className="flex flex-col justify-between gap-8">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            FERIE & PERMESSI · ANNO {new Date().getFullYear()}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(96px, 11vw, 144px)",
              letterSpacing: "-0.05em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Riposo</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              maxWidth: 470,
              marginTop: 22,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.35,
            }}
          >
            Hai {remaining} giorni residui.{" "}
            {remaining > 0 ? "Suggeriamo di pianificare almeno una settimana entro l'estate." : "Hai usato tutto il monte ferie di quest'anno."}
          </p>
        </div>
        <div
          className="grid gap-0 pt-6"
          style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--line-strong)" }}
        >
          <BalanceCell label="FERIE" value={String(remaining)} sub={`/ ${VACATION_ALLOWANCE} GG`} accent first />
          <BalanceCell
            label="PERMESSI"
            value={String(Math.max(0, PERMIT_ALLOWANCE - permitHours))}
            sub={`/ ${PERMIT_ALLOWANCE} ORE`}
          />
          <BalanceCell label="MALATTIA" value={String(sickDays)} sub="GG USATI" />
        </div>
      </section>

      <section className="flex flex-col gap-5 min-h-0">
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <span className="t-h3-sans">Nuova richiesta</span>
          <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <FormField label="TIPO">
              <select
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as LeaveRequest["type"] })}
                style={inputStyle}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {localizeType(t)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="DAL">
              <input
                type="date"
                value={draft.from}
                onChange={(e) => setDraft({ ...draft, from: e.target.value })}
                style={inputStyle}
              />
            </FormField>
            <FormField label="AL">
              <input
                type="date"
                value={draft.to}
                onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                style={inputStyle}
              />
            </FormField>
            <FormField label="MOTIVO">
              <input
                type="text"
                placeholder="Settimana di stacco"
                value={draft.reason}
                onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
                style={inputStyle}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="pill pill-ghost pill-sm">
              Salva bozza
            </button>
            <button type="button" className="pill pill-spark pill-sm" onClick={submit}>
              Invia <span className="arr">→</span>
            </button>
          </div>
        </div>

        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            STORICO
          </span>
          <div className="overflow-auto pr-1">
            {history.map((r, i) => (
              <div
                key={r.id}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "120px 1fr 60px 110px",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < history.length - 1 ? "1px solid var(--line)" : "none",
                }}
              >
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {fmtRange(r.from, r.to)}
                </span>
                <span
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 17,
                  }}
                >
                  {localizeType(r.type)}
                </span>
                <span className="t-num" style={{ textAlign: "right", fontSize: 16 }}>
                  {r.days < 1 ? `${r.days * 8}h` : `${r.days}gg`}
                </span>
                <span
                  className="t-mono"
                  style={{
                    color:
                      r.status === "approved"
                        ? "var(--muted-foreground)"
                        : r.status === "pending"
                          ? "var(--spark)"
                          : "var(--muted-foreground)",
                    textAlign: "right",
                  }}
                >
                  {localizeStatus(r.status)}
                </span>
              </div>
            ))}
            {history.length === 0 && (
              <div className="p-6 text-center" style={{ color: "var(--muted-foreground)" }}>
                <span className="t-mono">NESSUNA RICHIESTA</span>
              </div>
            )}
          </div>
          {void fmtDate}
        </div>
      </section>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "10px 12px",
  background: "transparent",
  color: "var(--fg)",
  outline: "none",
  width: "100%",
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function BalanceCell({
  label,
  value,
  sub,
  accent,
  first,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  first?: boolean;
}) {
  return (
    <div
      style={{
        paddingLeft: first ? 0 : 14,
        borderLeft: first ? "none" : "1px solid var(--line)",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span
          className="t-num"
          style={{
            fontSize: 44,
            letterSpacing: "-0.03em",
            color: accent ? "var(--spark)" : "var(--fg)",
          }}
        >
          {value}
        </span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {sub}
        </span>
      </div>
    </div>
  );
}
