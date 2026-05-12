import { useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { type Employee } from "@/lib/mock-data";
import { useEmployee, useEmployees } from "@/lib/tables/employees";

function tenureYears(joinDate: string): number {
  const days = (Date.now() - new Date(joinDate).getTime()) / 86_400_000;
  return Math.max(0, days / 365.25);
}

function levelFor(salary: number): string {
  if (salary >= 90_000) return "L5";
  if (salary >= 70_000) return "L4";
  if (salary >= 55_000) return "L3";
  if (salary >= 40_000) return "L2";
  return "L1";
}

function focusBarsFor(emp: Employee): number[] {
  // Deterministic 12-week pseudo-series from employee id so the chart is stable.
  const seed = Array.from(emp.id).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const out: number[] = [];
  for (let i = 0; i < 12; i++) {
    out.push(28 + ((seed * (i + 7)) % 20));
  }
  return out;
}

function firstName(full: string): string {
  return full.split(" ")[0] ?? full;
}
function lastName(full: string): string {
  const parts = full.split(" ");
  return parts.length > 1 ? parts.slice(1).join(" ") : "";
}

function statusInk(status: Employee["status"]): string {
  switch (status) {
    case "active":
      return "var(--spark)";
    case "remote":
      return "var(--fg-2)";
    case "on_leave":
      return "var(--muted-foreground)";
    case "offboarding":
      return "var(--muted-foreground)";
  }
}

const SKILL_PRESET: Array<[string, number]> = [
  ["Design system", 92],
  ["Visual", 88],
  ["Research", 72],
  ["Front-end", 54],
  ["Leadership", 65],
];

const ACTIVITY_PRESET: Array<[string, string, "spark" | undefined]> = [
  ["06 mag", "Kudos da Marco", "spark"],
  ["03 mag", "Review L4 → L5", undefined],
  ["28 apr", "Mentor di Sara", undefined],
  ["20 apr", "Workshop DS v3", undefined],
  ["12 apr", "1:1 con Davide", undefined],
];

export function PersonEditorialSpread({ employeeId }: { employeeId: string }) {
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
  return <Spread employee={employee} />;
}

function Spread({ employee }: { employee: Employee }) {
  const navigate = useNavigate();
  const all = useEmployees();
  const idx = useMemo(() => all.findIndex((e) => e.id === employee.id), [all, employee.id]);

  const focus = useMemo(() => focusBarsFor(employee), [employee]);
  const focusMax = Math.max(...focus);
  const focusTotal = focus.reduce((a, b) => a + b, 0);

  // ⌘E to edit
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        navigate({ to: "/people/$employeeId/edit", params: { employeeId: employee.id } });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [employee.id, navigate]);

  return (
    <div
      className="p-4 md:p-6"
      style={{ minHeight: "calc(100vh - 3.5rem)" }}
    >
      <button
        type="button"
        onClick={() => navigate({ to: "/people" })}
        className="t-mono"
        style={{
          color: "var(--muted-foreground)",
          padding: "4px 10px",
          borderRadius: 999,
          border: "1px solid var(--line)",
          background: "transparent",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        ← EMPLOYEES
      </button>

      <main
        className="grid gap-8"
        style={{
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* LEFT — portrait + meta + focus + docs */}
        <section className="flex flex-col gap-3.5 min-h-0">
          <div
            className="placeholder-img"
            style={{ width: "100%", height: 380, borderRadius: 18 }}
          >
            <span className="cap t-mono-sm">RITRATTO · {employee.name.toUpperCase()}</span>
          </div>

          <div
            className="grid pt-3"
            style={{
              gridTemplateColumns: "1fr 1fr 1fr",
              borderTop: "1px solid var(--line-strong)",
            }}
          >
            {[
              ["TENURE", `${tenureYears(employee.joinDate).toFixed(1)} a`],
              ["LIVELLO", levelFor(employee.salary)],
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
                  style={{ fontSize: 22, marginTop: 4, letterSpacing: "-0.02em" }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>

          {/* Focus chart */}
          <div
            className="flex flex-col gap-2.5"
            style={{
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "14px 16px",
            }}
          >
            <div className="flex justify-between">
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                FOCUS · 12 SETT
              </span>
              <span className="t-mono" style={{ color: "var(--spark)" }}>
                {focusTotal}h
              </span>
            </div>
            <div className="flex items-end gap-1" style={{ height: 56 }}>
              {focus.map((f, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${(f / focusMax) * 100}%`,
                    background: i === focus.length - 1 ? "var(--spark)" : "var(--fg)",
                    borderRadius: "2px 2px 0 0",
                    minHeight: 4,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Documents */}
          <div
            className="flex flex-col gap-2"
            style={{
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "14px 16px",
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              DOCUMENTI · 4
            </span>
            {["Contratto firmato", "Codice fiscale", "IBAN aggiornato", "NDA"].map((d, i) => (
              <div
                key={i}
                className="flex justify-between items-center"
                style={{
                  padding: "4px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--line)",
                }}
              >
                <span
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 16,
                  }}
                >
                  {d}
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  PDF →
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT */}
        <section className="flex flex-col gap-4 min-h-0">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                EMP · {String(idx + 1).padStart(3, "0")} / {String(all.length).padStart(3, "0")}
              </span>
              <span className="dot" />
              <span className="t-mono" style={{ color: statusInk(employee.status) }}>
                {employee.status.toUpperCase().replace("_", " ")}
              </span>
              <span style={{ flex: 1 }} />
              <button
                type="button"
                className="pill pill-ghost pill-sm"
                onClick={() =>
                  navigate({
                    to: "/people/$employeeId/edit",
                    params: { employeeId: employee.id },
                  })
                }
              >
                ⌘E Modifica
              </button>
              <button type="button" className="pill pill-ghost pill-sm">
                ⌘L Leave
              </button>
              <button type="button" className="pill pill-dark pill-sm">
                Avvia 1:1
              </button>
            </div>
            <h1
              style={{
                margin: "12px 0 0",
                fontFamily: "Fraunces, ui-serif, serif",
                fontWeight: 400,
                fontSize: "clamp(40px, 10vw, 96px)",
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
                marginTop: 18,
                maxWidth: 480,
                color: "var(--fg-2)",
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 19,
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
              }}
            >
              {employee.role}, {employee.location}.{" "}
              {tenureYears(employee.joinDate).toFixed(1)} anni in PulseHR.
              {employee.manager ? ` Riporta a ${employee.manager}.` : ""}
            </p>
          </div>

          <div
            className="grid pt-4"
            style={{
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              borderTop: "1px solid var(--line-strong)",
            }}
          >
            <DetailField label="RUOLO" value={employee.role} />
            <DetailField label="DIPARTIMENTO" value={employee.department} />
            <DetailField label="EMAIL" value={employee.email} mono />
            <DetailField label="TEL" value={employee.phone || "—"} mono />
            <DetailField
              label="START"
              value={new Date(employee.joinDate).toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              mono
            />
            <DetailField label="LOCATION" value={employee.location} />
            <DetailField label="RAL" value={`€ ${employee.salary.toLocaleString("it-IT")}`} />
            <DetailField label="CONTRATTO" value={employee.employmentType} />
          </div>

          {/* Skills + Activity */}
          <div
            className="grid pt-4"
            style={{
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              borderTop: "1px solid var(--line-strong)",
            }}
          >
            <div className="flex flex-col gap-2">
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                SKILL
              </span>
              {SKILL_PRESET.map((s, i) => (
                <div
                  key={i}
                  className="grid items-center gap-2"
                  style={{ gridTemplateColumns: "100px 1fr 30px" }}
                >
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 15,
                    }}
                  >
                    {s[0]}
                  </span>
                  <div style={{ height: 4, background: "var(--line)", borderRadius: 999 }}>
                    <div
                      style={{
                        width: `${s[1]}%`,
                        height: "100%",
                        background: i === 0 ? "var(--spark)" : "var(--fg)",
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <span
                    className="t-mono"
                    style={{ textAlign: "right", color: "var(--muted-foreground)" }}
                  >
                    {s[1]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5 overflow-hidden">
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                ATTIVITÀ RECENTE
              </span>
              {ACTIVITY_PRESET.map((a, i) => (
                <div
                  key={i}
                  className="grid"
                  style={{
                    gridTemplateColumns: "60px 1fr",
                    gap: 10,
                    padding: "6px 0",
                    borderTop: i === 0 ? "none" : "1px solid var(--line)",
                  }}
                >
                  <span
                    className="t-mono"
                    style={{ color: a[2] === "spark" ? "var(--spark)" : "var(--muted-foreground)" }}
                  >
                    {a[0]}
                  </span>
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 15,
                    }}
                  >
                    {a[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function DetailField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
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
