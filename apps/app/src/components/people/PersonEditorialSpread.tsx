import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { type Employee, type EmployeeStatus, departments, commesse } from "@/lib/mock-data";
import { employeesTable, useEmployee, useEmployees } from "@/lib/tables/employees";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pulse-hr/ui/primitives/dialog";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";

const STATUSES: Array<[EmployeeStatus, string]> = [
  ["active", "Active"],
  ["remote", "Remote"],
  ["on_leave", "On leave"],
  ["offboarding", "Offboarding"],
];

function seniorityFromJoin(join: string): string {
  const j = new Date(join);
  const now = new Date();
  const days = Math.floor((now.getTime() - j.getTime()) / 86_400_000);
  if (days < 30) return `${days} gg`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mesi`;
  const y = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0 ? `${y} anni` : `${y}a ${rem}m`;
}

function projectFor(empId: string): string {
  return commesse.find((c) => c.ownerId === empId)?.code ?? "—";
}

export function PersonEditorialSpread({ employeeId }: { employeeId: string }) {
  const employee = useEmployee(employeeId);
  if (!employee) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div style={{ color: "var(--muted-foreground)" }} className="t-mono">
          PERSONA NON TROVATA
        </div>
      </div>
    );
  }
  return <Spread employee={employee} />;
}

function Spread({ employee }: { employee: Employee }) {
  const navigate = useNavigate();
  const all = useEmployees();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<Employee> | null>(null);

  const idx = useMemo(
    () => all.findIndex((e) => e.id === employee.id),
    [all, employee.id],
  );

  function startEdit() {
    setDraft({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      manager: employee.manager,
      location: employee.location,
      status: employee.status,
      joinDate: employee.joinDate,
      salary: employee.salary,
    });
    setEditing(true);
  }

  function commitEdit() {
    if (!draft) return;
    employeesTable.update(employee.id, draft);
    setEditing(false);
    setDraft(null);
    toast.success(`${draft.name ?? employee.name} aggiornato`);
  }

  return (
    <div
      className="ph room-light"
      style={{
        minHeight: "calc(100vh - 3.5rem)",
        padding: "32px 24px",
      }}
    >
      <main
        className="grid gap-10"
        style={{
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* LEFT — portrait + meta column */}
        <section className="flex flex-col gap-4 min-h-0">
          <button
            type="button"
            onClick={() => navigate({ to: "/people" })}
            className="t-mono self-start"
            style={{
              color: "var(--muted-foreground)",
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid var(--line)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            ← PERSONE
          </button>

          <div
            className="placeholder-img"
            style={{
              width: "100%",
              minHeight: 480,
              borderRadius: 22,
            }}
          >
            <span className="cap t-mono-sm">RITRATTO · {employee.name.toUpperCase()}</span>
          </div>

          <div
            className="grid gap-0 pt-4"
            style={{
              gridTemplateColumns: "1fr 1fr 1fr",
              borderTop: "1px solid var(--line)",
            }}
          >
            {[
              ["IN AZIENDA", seniorityFromJoin(employee.joinDate)],
              ["COMMESSA", projectFor(employee.id)],
              ["MANAGER", employee.manager ?? "—"],
            ].map(([l, v], i) => (
              <div
                key={i}
                style={{
                  paddingLeft: i === 0 ? 0 : 12,
                  borderLeft: i === 0 ? "none" : "1px solid var(--line)",
                }}
              >
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {l}
                </span>
                <div
                  className="t-num"
                  style={{ fontSize: 22, marginTop: 6, letterSpacing: "-0.02em" }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT — typographic spread */}
        <section className="flex flex-col justify-between min-h-0">
          <div>
            <div className="flex items-center gap-3">
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                PERSONA · {String(idx + 1).padStart(3, "0")} / {String(all.length).padStart(3, "0")}
              </span>
              <span className="dot" />
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {employee.status.toUpperCase().replace("_", " ")}
              </span>
            </div>
            <h1
              style={{
                margin: "20px 0 0",
                fontFamily: "Fraunces, ui-serif, serif",
                fontWeight: 400,
                fontSize: "clamp(72px, 8vw, 124px)",
                lineHeight: 0.86,
                letterSpacing: "-0.045em",
              }}
            >
              {firstName(employee.name)}
              <br />
              <span style={{ fontStyle: "italic" }}>{lastName(employee.name)}</span>
              <span style={{ color: "var(--spark)" }}>.</span>
            </h1>
            <p
              style={{
                marginTop: 24,
                maxWidth: 480,
                color: "var(--fg-2)",
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 22,
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
              }}
            >
              {employee.role}, {employee.location}.
              {employee.status === "active" && " Operativa al momento."}
              {employee.status === "remote" && " In remoto questa settimana."}
              {employee.status === "on_leave" && " In leave."}
              {employee.status === "offboarding" && " In offboarding."}
            </p>
          </div>

          <div
            className="grid gap-6 pt-5 mt-6"
            style={{
              gridTemplateColumns: "1fr 1fr",
              borderTop: "1px solid var(--line-strong)",
            }}
          >
            <DetailBlock label="RUOLO" value={employee.role} />
            <DetailBlock label="DIPARTIMENTO" value={employee.department} />
            <DetailBlock label="EMAIL" value={employee.email} mono />
            <DetailBlock label="LOCATION" value={employee.location} />
            <DetailBlock
              label="START"
              value={new Date(employee.joinDate).toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              mono
            />
            <DetailBlock label="RAL" value={`€ ${employee.salary.toLocaleString("it-IT")}`} />
          </div>

          <div className="flex items-center gap-2.5 mt-7 flex-wrap">
            <button type="button" className="pill pill-dark" onClick={startEdit}>
              Modifica scheda
            </button>
            <button type="button" className="pill pill-ghost">
              Avvia 1:1
            </button>
            <button type="button" className="pill pill-ghost">
              Kudos
            </button>
            <span className="flex-1" />
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ⌘E MODIFICA · ⌘L LEAVE
            </span>
          </div>
        </section>
      </main>

      <Dialog open={editing} onOpenChange={(o) => !o && setEditing(false)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Modifica scheda · {employee.name}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nome">
                <Input value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </Field>
              <Field label="Ruolo">
                <Input value={draft.role ?? ""} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input value={draft.email ?? ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              </Field>
              <Field label="Telefono">
                <Input value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
              </Field>
              <Field label="Dipartimento">
                <select
                  value={draft.department ?? ""}
                  onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                  className="border rounded-md p-2 bg-transparent"
                  style={{ borderColor: "var(--line-strong)" }}
                >
                  {departments.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Stato">
                <select
                  value={draft.status ?? "active"}
                  onChange={(e) =>
                    setDraft({ ...draft, status: e.target.value as EmployeeStatus })
                  }
                  className="border rounded-md p-2 bg-transparent"
                  style={{ borderColor: "var(--line-strong)" }}
                >
                  {STATUSES.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Location">
                <Input
                  value={draft.location ?? ""}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                />
              </Field>
              <Field label="RAL">
                <Input
                  type="number"
                  value={draft.salary ?? 0}
                  onChange={(e) => setDraft({ ...draft, salary: Number(e.target.value) })}
                />
              </Field>
            </div>
          )}
          <DialogFooter>
            <button type="button" className="pill pill-ghost pill-sm" onClick={() => setEditing(false)}>
              Annulla
            </button>
            <button type="button" className="pill pill-spark pill-sm" onClick={commitEdit}>
              Salva
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailBlock({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: mono ? "JetBrains Mono, ui-monospace, monospace" : "Inter, sans-serif",
          fontSize: mono ? 14 : 17,
          fontWeight: 500,
          letterSpacing: mono ? "0.01em" : "-0.01em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </Label>
      {children}
    </div>
  );
}

function firstName(full: string): string {
  return full.split(" ")[0] ?? full;
}
function lastName(full: string): string {
  const parts = full.split(" ");
  return parts.length > 1 ? parts.slice(1).join(" ") : "";
}
