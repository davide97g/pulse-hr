import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { type Employee, type EmployeeStatus } from "@/lib/mock-data";
import { employeesTable, makeEmployee } from "@/lib/tables/employees";

const DRAFT_KEY = "pulsehr.employee-new-draft.v1";

type ContractKind = "INDETERMINATO" | "DETERMINATO" | "PIVA";

interface Draft {
  step: number;
  firstName: string;
  lastName: string;
  email: string;
  fiscalCode: string;
  joinDate: string;
  location: string;
  contractKind: ContractKind;
  contractEnd?: string;
  manager?: string;
  department: string;
  role: string;
  level: string;
  salary: string;
  notes: string;
  status: EmployeeStatus;
}

const EMPTY_DRAFT: Draft = {
  step: 1,
  firstName: "",
  lastName: "",
  email: "",
  fiscalCode: "",
  joinDate: new Date().toISOString().slice(0, 10),
  location: "Milano · IT",
  contractKind: "INDETERMINATO",
  manager: "",
  department: "",
  role: "",
  level: "L3",
  salary: "",
  notes: "",
  status: "active",
};

const STEPS: Array<[string, string]> = [
  ["01", "Anagrafica"],
  ["02", "Contratto"],
  ["03", "Compenso"],
  ["04", "Onboarding"],
  ["05", "Conferma"],
];

const CONTRACTS: Array<[ContractKind, string, string]> = [
  ["INDETERMINATO", "INDETERMINATO", "CCNL Commercio"],
  ["DETERMINATO", "DETERMINATO", "12 mesi"],
  ["PIVA", "P.IVA", "Collaborazione"],
];

function readDraft(): Draft {
  if (typeof localStorage === "undefined") return EMPTY_DRAFT;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_DRAFT;
    return { ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<Draft>) };
  } catch {
    return EMPTY_DRAFT;
  }
}

function writeDraft(d: Draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function EmployeeNewWizard() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft>(() => readDraft());
  const [savedAt, setSavedAt] = useState<string>("—");
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    writeDraft(draft);
    setSavedAt(new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
  }, [draft]);

  const stepNum = draft.step;
  const stepIdx = stepNum - 1;
  const stepProgress = (stepNum / STEPS.length) * 100;

  const valid = useMemo(() => {
    if (stepNum === 1)
      return draft.firstName.trim() !== "" && draft.lastName.trim() !== "";
    if (stepNum === 2) return draft.contractKind != null;
    if (stepNum === 3) return draft.salary.trim() !== "" && !Number.isNaN(Number(draft.salary));
    return true;
  }, [draft, stepNum]);

  function patch(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function next() {
    if (!valid) {
      toast.error("Completa i campi obbligatori prima di continuare");
      return;
    }
    if (stepNum < STEPS.length) patch({ step: stepNum + 1 });
    else commit();
  }

  function back() {
    if (stepNum > 1) patch({ step: stepNum - 1 });
    else navigate({ to: "/people" });
  }

  function commit() {
    const fullName = `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim();
    if (!fullName) {
      toast.error("Nome obbligatorio");
      return;
    }
    const employmentType: Employee["employmentType"] =
      draft.contractKind === "PIVA"
        ? "Contractor"
        : draft.contractKind === "DETERMINATO"
          ? "Full-time"
          : "Full-time";
    const created = employeesTable.add(
      makeEmployee({
        name: fullName,
        email:
          draft.email.trim() ||
          `${draft.firstName.toLowerCase().trim()}.${draft.lastName.toLowerCase().trim()}@pulsehr.it`,
        role: draft.role.trim() || "Team member",
        department: draft.department.trim() || "—",
        manager: draft.manager?.trim() || undefined,
        location: draft.location.trim() || "Remote",
        status: draft.status,
        joinDate: draft.joinDate,
        salary: Number(draft.salary) || 0,
        phone: "",
        employmentType,
      }),
    );
    clearDraft();
    toast.success(`${created.name} aggiunto al team`, {
      action: {
        label: "Apri scheda",
        onClick: () =>
          navigate({ to: "/people/$employeeId", params: { employeeId: created.id } }),
      },
    });
    navigate({ to: "/people" });
  }

  return (
    <div className="p-4 md:p-6" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
      <main
        className="grid"
        style={{
          gridTemplateColumns: "240px minmax(0, 1fr)",
          gap: 36,
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {/* Steps rail */}
        <aside className="flex flex-col gap-3.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            NUOVO · STEP {String(stepNum).padStart(2, "0")} / 05
          </span>
          <div style={{ height: 4, background: "var(--line)", borderRadius: 999 }}>
            <div
              style={{
                width: `${stepProgress}%`,
                height: "100%",
                background: "var(--spark)",
                borderRadius: 999,
                transition: "width 220ms ease",
              }}
            />
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {STEPS.map(([num, label], i) => {
              const active = i === stepIdx;
              const done = i < stepIdx;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => done && patch({ step: i + 1 })}
                  className="grid items-center text-left"
                  style={{
                    gridTemplateColumns: "32px 1fr auto",
                    gap: 8,
                    padding: "8px 0",
                    borderBottom: "1px solid var(--line)",
                    border: 0,
                    borderBottomWidth: 1,
                    borderBottomStyle: "solid",
                    borderBottomColor: "var(--line)",
                    background: "transparent",
                    cursor: done ? "pointer" : "default",
                  }}
                >
                  <span
                    className="t-mono"
                    style={{
                      color: active
                        ? "var(--spark)"
                        : done
                          ? "var(--fg)"
                          : "var(--muted-foreground)",
                    }}
                  >
                    {num}
                  </span>
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: active ? "italic" : "normal",
                      fontSize: 18,
                      color: done ? "var(--muted-foreground)" : "var(--fg)",
                      textDecoration: done ? "line-through" : "none",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    className="t-mono"
                    style={{
                      color: active
                        ? "var(--spark)"
                        : done
                          ? "var(--muted-foreground)"
                          : "var(--muted-foreground)",
                    }}
                  >
                    {active ? "ATTIVO" : done ? "DONE" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Form */}
        <section className="flex flex-col gap-4 min-h-0">
          <div>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              STEP {String(stepNum).padStart(2, "0")} · {STEPS[stepIdx][1].toUpperCase()}
            </span>
            <h1
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontWeight: 400,
                margin: "8px 0 0",
                fontSize: "clamp(48px, 6vw, 72px)",
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
              }}
            >
              {stepNum === 1 && (
                <>
                  Chi <span style={{ fontStyle: "italic" }}>è</span>
                  <span style={{ color: "var(--spark)" }}>?</span>
                </>
              )}
              {stepNum === 2 && (
                <>
                  Come <span style={{ fontStyle: "italic" }}>lavoriamo</span>
                  <span style={{ color: "var(--spark)" }}>?</span>
                </>
              )}
              {stepNum === 3 && (
                <>
                  Quanto <span style={{ fontStyle: "italic" }}>guadagna</span>
                  <span style={{ color: "var(--spark)" }}>?</span>
                </>
              )}
              {stepNum === 4 && (
                <>
                  Pronta a <span style={{ fontStyle: "italic" }}>partire</span>
                  <span style={{ color: "var(--spark)" }}>?</span>
                </>
              )}
              {stepNum === 5 && (
                <>
                  <span style={{ fontStyle: "italic" }}>Confermiamo</span>
                  <span style={{ color: "var(--spark)" }}>.</span>
                </>
              )}
            </h1>
          </div>

          {stepNum === 1 && (
            <Step1
              draft={draft}
              onChange={patch}
            />
          )}
          {stepNum === 2 && <Step2 draft={draft} onChange={patch} />}
          {stepNum === 3 && <Step3 draft={draft} onChange={patch} />}
          {stepNum === 4 && <Step4 draft={draft} onChange={patch} />}
          {stepNum === 5 && <Step5 draft={draft} />}

          {/* Footer */}
          <div
            className="flex gap-3 items-center pt-4"
            style={{ borderTop: "1px solid var(--line-strong)", marginTop: 6 }}
          >
            <button type="button" className="pill pill-ghost" onClick={back}>
              {stepNum === 1 ? "Annulla" : "← Indietro"}
            </button>
            <span style={{ flex: 1 }} />
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              BOZZA SALVATA · {savedAt}
            </span>
            <button type="button" className="pill pill-dark" onClick={next}>
              {stepNum < STEPS.length ? "Continua →" : "Aggiungi"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  mono,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <input
        type={type ?? "text"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "transparent",
          border: "none",
          borderBottom: "1px solid var(--line-strong)",
          outline: "none",
          padding: "8px 0",
          fontFamily: mono ? "JetBrains Mono, ui-monospace, monospace" : "Inter, sans-serif",
          fontSize: mono ? 15 : 19,
          fontWeight: 500,
          color: "var(--fg)",
        }}
      />
    </div>
  );
}

function Step1({ draft, onChange }: { draft: Draft; onChange: (p: Partial<Draft>) => void }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <FormField label="NOME" value={draft.firstName} onChange={(v) => onChange({ firstName: v })} placeholder="Elena" />
      <FormField label="COGNOME" value={draft.lastName} onChange={(v) => onChange({ lastName: v })} placeholder="Manzi" />
      <FormField label="EMAIL" mono value={draft.email} onChange={(v) => onChange({ email: v })} placeholder="elena@pulsehr.it" />
      <FormField
        label="CODICE FISCALE"
        mono
        value={draft.fiscalCode}
        onChange={(v) => onChange({ fiscalCode: v.toUpperCase() })}
        placeholder="MNZLNE94L52F205D"
      />
      <FormField label="DATA INIZIO" mono type="date" value={draft.joinDate} onChange={(v) => onChange({ joinDate: v })} />
      <FormField label="SEDE" value={draft.location} onChange={(v) => onChange({ location: v })} />
    </div>
  );
}

function Step2({ draft, onChange }: { draft: Draft; onChange: (p: Partial<Draft>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          TIPO CONTRATTO
        </span>
        <div className="grid gap-2.5 mt-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {CONTRACTS.map(([k, primary, sub]) => {
            const active = draft.contractKind === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => onChange({ contractKind: k })}
                className="text-left"
                style={{
                  border: `1px solid ${active ? "var(--spark)" : "var(--line)"}`,
                  background: active
                    ? "color-mix(in oklch, var(--spark) 8%, transparent)"
                    : "transparent",
                  borderRadius: 14,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  cursor: "pointer",
                }}
              >
                <span
                  className="t-mono"
                  style={{ color: active ? "var(--spark)" : "var(--muted-foreground)" }}
                >
                  {primary}
                </span>
                <span
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 18,
                  }}
                >
                  {sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {draft.contractKind === "DETERMINATO" && (
        <FormField
          label="SCADENZA"
          mono
          type="date"
          value={draft.contractEnd ?? ""}
          onChange={(v) => onChange({ contractEnd: v })}
        />
      )}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <FormField label="MANAGER" value={draft.manager ?? ""} onChange={(v) => onChange({ manager: v })} placeholder="Marco Rinaldi" />
        <FormField label="DIPARTIMENTO" value={draft.department} onChange={(v) => onChange({ department: v })} placeholder="Engineering" />
      </div>
      <FormField label="RUOLO" value={draft.role} onChange={(v) => onChange({ role: v })} placeholder="Senior Engineer" />
    </div>
  );
}

function Step3({ draft, onChange }: { draft: Draft; onChange: (p: Partial<Draft>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <FormField label="LIVELLO" value={draft.level} onChange={(v) => onChange({ level: v })} placeholder="L3" />
        <FormField label="RAL (€)" mono type="number" value={draft.salary} onChange={(v) => onChange({ salary: v })} placeholder="48000" />
      </div>
      <p
        style={{
          fontFamily: "Fraunces, ui-serif, serif",
          fontStyle: "italic",
          fontSize: 17,
          color: "var(--muted-foreground)",
          maxWidth: 540,
        }}
      >
        Il livello è derivato dalla seniority del ruolo, ma puoi sovrascrivere. RAL inserita lorda
        annua.
      </p>
    </div>
  );
}

function Step4({ draft, onChange }: { draft: Draft; onChange: (p: Partial<Draft>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          STATO INIZIALE
        </span>
        <div className="flex gap-2 mt-2 flex-wrap">
          {(["active", "remote"] as const).map((s) => {
            const active = draft.status === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ status: s })}
                className="t-mono"
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--paper)" : "var(--fg-2)",
                  cursor: "pointer",
                }}
              >
                {s === "active" ? "ATTIVA" : "REMOTE"}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          NOTE INTERNE
        </span>
        <textarea
          value={draft.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={4}
          style={{
            border: "1px solid var(--line-strong)",
            borderRadius: 12,
            padding: "12px 14px",
            background: "transparent",
            outline: "none",
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 17,
            lineHeight: 1.4,
            color: "var(--fg-2)",
            resize: "vertical",
          }}
          placeholder="Onboarding affidato a…"
        />
      </div>
    </div>
  );
}

function Step5({ draft }: { draft: Draft }) {
  const fullName = `${draft.firstName} ${draft.lastName}`.trim() || "—";
  return (
    <div className="flex flex-col gap-3 pt-2">
      <Recap label="NOME" value={fullName} />
      <Recap label="EMAIL" value={draft.email || "—"} mono />
      <Recap label="DATA INIZIO" value={draft.joinDate} mono />
      <Recap label="SEDE" value={draft.location} />
      <Recap
        label="CONTRATTO"
        value={`${draft.contractKind}${draft.contractEnd ? ` · scad. ${draft.contractEnd}` : ""}`}
      />
      <Recap label="DIPARTIMENTO" value={draft.department || "—"} />
      <Recap label="RUOLO" value={draft.role || "—"} />
      <Recap label="LIVELLO" value={draft.level} />
      <Recap label="RAL" value={draft.salary ? `€ ${Number(draft.salary).toLocaleString("it-IT")}` : "—"} />
    </div>
  );
}

function Recap({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="grid items-baseline gap-4"
      style={{
        gridTemplateColumns: "160px 1fr",
        padding: "8px 0",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: mono ? "JetBrains Mono, ui-monospace, monospace" : "Inter, sans-serif",
          fontSize: mono ? 14 : 18,
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}
