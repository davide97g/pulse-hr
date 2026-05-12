import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pulse-hr/ui/primitives/dialog";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { Button } from "@pulse-hr/ui/primitives/button";
import { toast } from "sonner";
import {
  createWorkspace,
  setWorkspaceName,
  setCompanySize,
  DEFAULT_WORKSPACE_NAME,
  DEFAULT_COMPANY_SIZE,
  COMPANY_SIZE_HEADCOUNT,
  type CompanySize,
} from "@/lib/workspace";
import { employeesTable, makeEmployee } from "@/lib/tables/employees";
import { generateEmployees } from "@/lib/generate-employees";
import type { Employee } from "@/lib/mock-data";

interface DraftEmployee {
  name: string;
  email: string;
  role: string;
}
const EMPTY_EMP: DraftEmployee = { name: "", email: "", role: "" };

const SIZE_OPTIONS: Array<{
  id: CompanySize;
  label: string;
  blurb: string;
}> = [
  { id: "small", label: "Startup", blurb: "10 people · early team finding fit." },
  { id: "medium", label: "Scale-up", blurb: "25 people · growing across functions." },
  { id: "large", label: "Mid-market", blurb: "100 people · multiple departments." },
];

export function WelcomeEditorial() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [wsName, setWsName] = useState(DEFAULT_WORKSPACE_NAME);
  const [size, setSize] = useState<CompanySize>(DEFAULT_COMPANY_SIZE);
  const [emps, setEmps] = useState<DraftEmployee[]>([
    { ...EMPTY_EMP },
    { ...EMPTY_EMP },
    { ...EMPTY_EMP },
  ]);

  function reset() {
    setStep(1);
    setWsName(DEFAULT_WORKSPACE_NAME);
    setSize(DEFAULT_COMPANY_SIZE);
    setEmps([{ ...EMPTY_EMP }, { ...EMPTY_EMP }, { ...EMPTY_EMP }]);
  }

  function updateEmp(i: number, patch: Partial<DraftEmployee>) {
    setEmps((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function finish() {
    const name = wsName.trim() || DEFAULT_WORKSPACE_NAME;
    createWorkspace(name);
    setWorkspaceName(name);
    setCompanySize(size);

    const today = new Date().toISOString().slice(0, 10);
    const manual: Employee[] = emps
      .filter((e) => e.name.trim().length > 0)
      .map((e, idx) => ({
        ...makeEmployee({
          name: e.name.trim(),
          email:
            e.email.trim() ||
            `${e.name.trim().toLowerCase().replace(/\s+/g, ".")}@${name
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")}.co`,
          role: e.role.trim() || "Employee",
          department: "Operations",
          location: "Milan",
          status: "active",
          joinDate: today,
          salary: 50000,
          phone: "",
          employmentType: "Full-time",
        }),
        id: `e${idx + 1}`,
      }));

    const headcount = COMPANY_SIZE_HEADCOUNT[size];
    const roster = generateEmployees({
      workspaceName: name,
      manualEmployees: manual,
      count: headcount,
    });
    employeesTable.replace(roster);

    toast.success(`Workspace «${name}» ready · ${headcount} people`);
    setOpen(false);
    reset();
    navigate({ to: "/" });
  }

  return (
    <div
      className="ph grid min-h-dvh grid-cols-1 lg:[grid-template-columns:minmax(0,1.1fr)_minmax(0,1fr)] pt-safe pb-safe pl-safe pr-safe"
    >
      {/* LEFT */}
      <section
        className="flex flex-col justify-between gap-10 lg:gap-0"
        style={{ padding: "clamp(28px, 5vw, 56px) clamp(20px, 5vw, 64px)" }}
      >
        <header className="flex items-center gap-3.5">
          <span
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: "-0.04em",
            }}
          >
            pulse<span style={{ fontStyle: "normal" }}>·</span>hr
          </span>
          <span className="dot" />
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            v0.7.2 · LIVE
          </span>
        </header>

        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            WELCOME · EN · MILAN
          </span>
          <h1
            style={{
              margin: "18px 0 0",
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              fontSize: "clamp(54px, 14vw, 144px)",
              lineHeight: 0.86,
              letterSpacing: "-0.045em",
            }}
          >
            HR for people <span style={{ fontStyle: "italic" }}>who hate</span>
            <br />
            HR<span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 24,
              maxWidth: 520,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: "clamp(17px, 4.5vw, 22px)",
              lineHeight: 1.4,
              letterSpacing: "-0.005em",
            }}
          >
            People, Work, Money in one workspace. Modular by choice, keyboard-first by nature,
            open by principle.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div
            className="grid pt-6"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
              borderTop: "1px solid var(--line-strong)",
            }}
          >
            {(
              [
                ["01", "PEOPLE", "People, leave, kudos."],
                ["02", "WORK", "Projects, timesheet, calendar."],
                ["03", "REPORTS", "Utilization and margins."],
              ] as Array<[string, string, string]>
            ).map(([n, t, d], i) => (
              <div
                key={n}
                style={{
                  paddingLeft: i === 0 ? 0 : 18,
                  borderLeft: i === 0 ? "none" : "1px solid var(--line)",
                }}
              >
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {n} · {t}
                </span>
                <p
                  style={{
                    marginTop: 8,
                    color: "var(--fg-2)",
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 17,
                    lineHeight: 1.35,
                  }}
                >
                  {d}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-2.5 items-center flex-wrap">
            <button
              id="welcome-cta"
              type="button"
              className="pill pill-spark"
              onClick={() => {
                reset();
                setOpen(true);
              }}
            >
              Get started <span className="arr">→</span>
            </button>
            <span className="flex-1" />
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ⌘K SEARCH · ⌘J STATUS LOG
            </span>
          </div>
        </div>
      </section>

      {/* RIGHT — poster */}
      <section
        className="relative hidden lg:block"
        style={{ background: "var(--bg-2)", padding: 24 }}
      >
        <div
          className="placeholder-img"
          style={{ width: "100%", height: "100%", borderRadius: 18 }}
        >
          <span className="cap t-mono-sm">POSTER · TEAM @ MILAN</span>
        </div>
        <span
          className="t-mono"
          style={{
            position: "absolute",
            top: 48,
            right: 48,
            border: "1px solid var(--line-strong)",
            padding: "5px 12px",
            borderRadius: 999,
            color: "var(--fg)",
            background: "var(--bg)",
          }}
        >
          MILAN ·{" "}
          {new Date()
            .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            .toUpperCase()}
        </span>
        <div
          className="absolute flex justify-between items-end"
          style={{ bottom: 48, left: 48, right: 48 }}
        >
          <div>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              EDITION 19 / 2026
            </span>
            <div
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 28,
                marginTop: 4,
                color: "var(--fg)",
              }}
            >
              «People, first.»
            </div>
          </div>
          <span
            className="t-num"
            style={{
              fontSize: 64,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "var(--fg)",
            }}
          >
            142
          </span>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {step === 1
                ? "Name your workspace"
                : step === 2
                  ? "How big is your company?"
                  : "Add your first teammates"}
            </DialogTitle>
            <DialogDescription>
              {step === 1
                ? "This is the name people see in the sidebar and reports."
                : step === 2
                  ? "We'll seed a realistic roster at the size you pick — dashboard, reports, and people pages reflect it."
                  : "Optional — add up to three teammates now. You can invite more later."}
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="grid gap-3 py-2">
              <Label htmlFor="ws-name">Workspace name</Label>
              <Input
                id="ws-name"
                autoFocus
                value={wsName}
                placeholder={DEFAULT_WORKSPACE_NAME}
                onChange={(e) => setWsName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setStep(2);
                }}
              />
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-2 py-2">
              {SIZE_OPTIONS.map((opt) => {
                const active = size === opt.id;
                const headcount = COMPANY_SIZE_HEADCOUNT[opt.id];
                return (
                  <button
                    key={opt.id}
                    id={`size-${opt.id}`}
                    type="button"
                    onClick={() => setSize(opt.id)}
                    className="grid items-center gap-3 rounded-md p-3 text-left"
                    style={{
                      gridTemplateColumns: "auto 1fr auto",
                      border: `1px solid ${active ? "var(--spark)" : "var(--line)"}`,
                      background: active
                        ? "color-mix(in oklch, var(--spark) 8%, transparent)"
                        : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      className="t-num"
                      style={{
                        fontSize: 32,
                        letterSpacing: "-0.04em",
                        color: active ? "var(--spark)" : "var(--fg)",
                      }}
                    >
                      {headcount}
                    </span>
                    <span className="flex flex-col">
                      <span
                        style={{
                          fontFamily: "Fraunces, ui-serif, serif",
                          fontStyle: "italic",
                          fontSize: 18,
                          color: "var(--fg)",
                        }}
                      >
                        {opt.label}
                      </span>
                      <span
                        className="t-mono"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {opt.blurb}
                      </span>
                    </span>
                    <span
                      className="t-mono"
                      style={{
                        color: active ? "var(--spark)" : "var(--muted-foreground)",
                      }}
                    >
                      {active ? "SELECTED" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
              {emps.map((emp, i) => (
                <div
                  key={i}
                  className="grid gap-2 rounded-md border p-3"
                  style={{ borderColor: "var(--line)" }}
                >
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    TEAMMATE {String(i + 1).padStart(2, "0")}
                  </span>
                  <Input
                    id={`teammate-${i}-name`}
                    placeholder="Full name"
                    value={emp.name}
                    onChange={(e) => updateEmp(i, { name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Email (optional)"
                      type="email"
                      value={emp.email}
                      onChange={(e) => updateEmp(i, { email: e.target.value })}
                    />
                    <Input
                      placeholder="Role (optional)"
                      value={emp.role}
                      onChange={(e) => updateEmp(i, { role: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            {step === 1 && (
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setStep(2)} disabled={wsName.trim().length === 0}>
                  Continue →
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <Button variant="ghost" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button onClick={() => setStep(3)}>Continue →</Button>
              </>
            )}
            {step === 3 && (
              <>
                <Button variant="ghost" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button variant="outline" onClick={finish}>
                  Skip
                </Button>
                <Button onClick={finish}>Create workspace</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
