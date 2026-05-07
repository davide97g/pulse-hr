import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { type Employee, type EmployeeStatus } from "@/lib/mock-data";
import { employeesTable, useEmployee } from "@/lib/tables/employees";

type Tab = "Anagrafica" | "Contratto" | "Compenso" | "Permessi" | "Documenti";

const TABS: Tab[] = ["Anagrafica", "Contratto", "Compenso", "Permessi", "Documenti"];

interface DraftFields {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  manager: string;
  location: string;
  status: EmployeeStatus;
  joinDate: string;
  salary: number;
  employmentType: Employee["employmentType"];
  level: string;
  notes: string;
}

function levelFor(salary: number): string {
  if (salary >= 90_000) return "L5";
  if (salary >= 70_000) return "L4";
  if (salary >= 55_000) return "L3";
  if (salary >= 40_000) return "L2";
  return "L1";
}

function fromEmployee(e: Employee): DraftFields {
  return {
    name: e.name,
    email: e.email,
    phone: e.phone,
    role: e.role,
    department: e.department,
    manager: e.manager ?? "",
    location: e.location,
    status: e.status,
    joinDate: e.joinDate,
    salary: e.salary,
    employmentType: e.employmentType,
    level: levelFor(e.salary),
    notes: "",
  };
}

interface DiffRow {
  label: string;
  was: string;
  now: string;
  field: keyof DraftFields;
}

function buildDiff(orig: DraftFields, draft: DraftFields): DiffRow[] {
  const out: DiffRow[] = [];
  const map: Array<[keyof DraftFields, string, (v: DraftFields[keyof DraftFields]) => string]> = [
    ["name", "NOME", (v) => String(v)],
    ["role", "RUOLO", (v) => String(v)],
    ["department", "DIPARTIMENTO", (v) => String(v)],
    ["manager", "MANAGER", (v) => String(v) || "—"],
    ["email", "EMAIL", (v) => String(v)],
    ["phone", "TELEFONO", (v) => String(v) || "—"],
    ["location", "LOCATION", (v) => String(v)],
    ["status", "STATO", (v) => String(v).toUpperCase().replace("_", " ")],
    ["joinDate", "START", (v) => String(v)],
    ["salary", "RAL", (v) => `€ ${Number(v).toLocaleString("it-IT")}`],
    ["employmentType", "CONTRATTO", (v) => String(v)],
    ["level", "LIVELLO", (v) => String(v)],
  ];
  for (const [key, label, fmt] of map) {
    if (orig[key] !== draft[key]) {
      out.push({
        label,
        was: fmt(orig[key]),
        now: fmt(draft[key]),
        field: key,
      });
    }
  }
  return out;
}

export function EmployeeEditDiff({ employeeId }: { employeeId: string }) {
  const employee = useEmployee(employeeId);
  if (!employee) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          PERSONA NON TROVATA
        </div>
      </div>
    );
  }
  return <Editor employee={employee} />;
}

function Editor({ employee }: { employee: Employee }) {
  const navigate = useNavigate();
  const original = useMemo(() => fromEmployee(employee), [employee]);
  const [draft, setDraft] = useState<DraftFields>(original);
  const [tab, setTab] = useState<Tab>("Anagrafica");
  const diff = buildDiff(original, draft);
  const dirty = diff.length > 0;

  // ⌘S to save
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
      if (e.key === "Escape") {
        cancel();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  function patch(p: Partial<DraftFields>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function save() {
    if (!dirty) {
      toast.info("Nessuna modifica da salvare");
      return;
    }
    const updates: Partial<Employee> = {
      name: draft.name,
      email: draft.email,
      phone: draft.phone,
      role: draft.role,
      department: draft.department,
      manager: draft.manager.trim() || undefined,
      location: draft.location,
      status: draft.status,
      joinDate: draft.joinDate,
      salary: draft.salary,
      employmentType: draft.employmentType,
    };
    employeesTable.update(employee.id, updates);
    toast.success(`${draft.name} aggiornato`, {
      description: `${diff.length} ${diff.length === 1 ? "modifica" : "modifiche"} salvate`,
    });
    navigate({ to: "/people/$employeeId", params: { employeeId: employee.id } });
  }

  function cancel() {
    if (dirty) {
      const ok = window.confirm("Modifiche non salvate. Annullare?");
      if (!ok) return;
    }
    navigate({ to: "/people/$employeeId", params: { employeeId: employee.id } });
  }

  const effectiveDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 1);
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  }, []);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
      {/* Header */}
      <div className="grid items-end gap-4" style={{ gridTemplateColumns: "1fr auto" }}>
        <div>
          <span className="t-mono" style={{ color: dirty ? "var(--spark)" : "var(--muted-foreground)" }}>
            {dirty ? `● MODIFICA · ${diff.length} ${diff.length === 1 ? "CAMPO" : "CAMPI"} MODIFICATI · NON SALVATO` : "● MODIFICA"}
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
            <span style={{ fontStyle: "italic" }}>{employee.name}</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" className="pill pill-ghost pill-sm" onClick={cancel}>
            Annulla
          </button>
          <button type="button" className="pill pill-ghost pill-sm">
            Storico modifiche
          </button>
          <button type="button" className="pill pill-dark pill-sm" onClick={save} disabled={!dirty}>
            ⌘S Salva
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6" style={{ borderBottom: "1px solid var(--line-strong)" }}>
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                padding: "8px 0",
                marginBottom: -1,
                borderBottom: `2px solid ${active ? "var(--ink)" : "transparent"}`,
                fontFamily: active ? "Inter" : "Fraunces, ui-serif, serif",
                fontStyle: active ? "normal" : "italic",
                fontSize: 17,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--fg)" : "var(--muted-foreground)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div
        className="grid gap-8 pr-2"
        style={{
          gridTemplateColumns: "1.4fr 1fr",
          flex: 1,
          minHeight: 0,
        }}
      >
        <section className="flex flex-col gap-4">
          {tab === "Anagrafica" && (
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <EditField
                label="NOME"
                was={original.name}
                value={draft.name}
                onChange={(v) => patch({ name: v })}
              />
              <EditField
                label="EMAIL"
                mono
                was={original.email}
                value={draft.email}
                onChange={(v) => patch({ email: v })}
              />
              <EditField
                label="TELEFONO"
                mono
                was={original.phone}
                value={draft.phone}
                onChange={(v) => patch({ phone: v })}
              />
              <EditField
                label="LOCATION"
                was={original.location}
                value={draft.location}
                onChange={(v) => patch({ location: v })}
              />
            </div>
          )}

          {tab === "Contratto" && (
            <>
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                CONTRATTO · {draft.employmentType.toUpperCase()}
              </span>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <EditField
                  label="LIVELLO"
                  was={original.level}
                  value={draft.level}
                  onChange={(v) => patch({ level: v })}
                />
                <EditFieldSelect
                  label="TIPO"
                  was={original.employmentType}
                  value={draft.employmentType}
                  options={["Full-time", "Part-time", "Contractor"] as const}
                  onChange={(v) => patch({ employmentType: v as Employee["employmentType"] })}
                />
                <EditField
                  label="START"
                  mono
                  type="date"
                  was={original.joinDate}
                  value={draft.joinDate}
                  onChange={(v) => patch({ joinDate: v })}
                />
                <EditField
                  label="MANAGER"
                  was={original.manager || "—"}
                  value={draft.manager}
                  onChange={(v) => patch({ manager: v })}
                />
                <EditField
                  label="DIPARTIMENTO"
                  was={original.department}
                  value={draft.department}
                  onChange={(v) => patch({ department: v })}
                />
                <EditField
                  label="RUOLO"
                  was={original.role}
                  value={draft.role}
                  onChange={(v) => patch({ role: v })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  NOTE INTERNE
                </span>
                <textarea
                  value={draft.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
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
                />
              </div>
            </>
          )}

          {tab === "Compenso" && (
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <EditField
                label="LIVELLO"
                was={original.level}
                value={draft.level}
                onChange={(v) => patch({ level: v })}
              />
              <EditField
                label="RAL (€)"
                mono
                type="number"
                was={`€ ${original.salary.toLocaleString("it-IT")}`}
                value={String(draft.salary)}
                onChange={(v) => patch({ salary: Number(v) || 0 })}
              />
            </div>
          )}

          {tab === "Permessi" && (
            <EditFieldSelect
              label="STATO"
              was={original.status.toUpperCase().replace("_", " ")}
              value={draft.status}
              options={["active", "remote", "on_leave", "offboarding"] as const}
              onChange={(v) => patch({ status: v as EmployeeStatus })}
              labelFor={(v) => v.toUpperCase().replace("_", " ")}
            />
          )}

          {tab === "Documenti" && (
            <div
              className="p-8 text-center"
              style={{
                border: "1px dashed var(--line)",
                borderRadius: 14,
                color: "var(--muted-foreground)",
              }}
            >
              <span className="t-mono">DRAG & DROP O CLICCA — placeholder</span>
            </div>
          )}
        </section>

        {/* RIGHT — diff panel */}
        <aside
          className="flex flex-col gap-3.5 pl-6"
          style={{ borderLeft: "1px solid var(--line)" }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            RIEPILOGO MODIFICHE · {diff.length}
          </span>
          {diff.length === 0 && (
            <div
              className="p-6 text-center"
              style={{
                border: "1px dashed var(--line)",
                borderRadius: 12,
                color: "var(--muted-foreground)",
              }}
            >
              <span className="t-mono">NESSUNA MODIFICA</span>
            </div>
          )}
          {diff.map((d, i) => (
            <div
              key={i}
              style={{
                border: "1px solid var(--spark)",
                background: "color-mix(in oklch, var(--spark) 5%, transparent)",
                borderRadius: 12,
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span className="t-mono" style={{ color: "var(--spark)" }}>
                {d.label}
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  style={{
                    fontFamily: "JetBrains Mono, ui-monospace, monospace",
                    fontSize: 14,
                    color: "var(--muted-foreground)",
                    textDecoration: "line-through",
                  }}
                >
                  {d.was || "—"}
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  →
                </span>
                <span style={{ fontFamily: "Inter", fontSize: 17, fontWeight: 600 }}>{d.now}</span>
              </div>
            </div>
          ))}
          <span style={{ flex: 1 }} />
          <div className="pt-3.5" style={{ borderTop: "1px solid var(--line-strong)" }}>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              EFFETTIVO DAL
            </span>
            <div
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 28,
                marginTop: 4,
              }}
            >
              {effectiveDate}
            </div>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              <button type="button" className="pill pill-ghost pill-sm">
                Notifica {employee.name.split(" ")[0]}
              </button>
              <button type="button" className="pill pill-ghost pill-sm">
                Notifica payroll
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EditField({
  label,
  was,
  value,
  onChange,
  mono,
  type,
}: {
  label: string;
  was: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  type?: string;
}) {
  const changed = String(was) !== String(value);
  return (
    <div className="flex flex-col gap-1">
      <span className="t-mono" style={{ color: changed ? "var(--spark)" : "var(--muted-foreground)" }}>
        {label}
        {changed && " · MOD"}
      </span>
      <input
        type={type ?? "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: "none",
          borderBottom: `1px solid ${changed ? "var(--spark)" : "var(--line-strong)"}`,
          background: "transparent",
          outline: "none",
          padding: "8px 0",
          fontFamily: mono ? "JetBrains Mono, ui-monospace, monospace" : "Inter, sans-serif",
          fontSize: mono ? 15 : 19,
          fontWeight: 500,
          color: "var(--fg)",
        }}
      />
      {changed && (
        <span className="t-mono" style={{ color: "var(--muted-foreground)", fontSize: 9 }}>
          era · {was || "—"}
        </span>
      )}
    </div>
  );
}

function EditFieldSelect<T extends string>({
  label,
  was,
  value,
  options,
  onChange,
  labelFor,
}: {
  label: string;
  was: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  labelFor?: (v: T) => string;
}) {
  const display = labelFor ? labelFor(value) : String(value);
  const changed = display !== was && String(value) !== was;
  return (
    <div className="flex flex-col gap-1">
      <span className="t-mono" style={{ color: changed ? "var(--spark)" : "var(--muted-foreground)" }}>
        {label}
        {changed && " · MOD"}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        style={{
          border: "none",
          borderBottom: `1px solid ${changed ? "var(--spark)" : "var(--line-strong)"}`,
          background: "transparent",
          outline: "none",
          padding: "8px 0",
          fontSize: 17,
          fontWeight: 500,
          color: "var(--fg)",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labelFor ? labelFor(o) : o}
          </option>
        ))}
      </select>
      {changed && (
        <span className="t-mono" style={{ color: "var(--muted-foreground)", fontSize: 9 }}>
          era · {was || "—"}
        </span>
      )}
    </div>
  );
}
