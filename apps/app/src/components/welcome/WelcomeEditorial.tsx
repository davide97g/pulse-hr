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
  { id: "small", label: "Small team", blurb: "10 people · finding each other's rhythm." },
  { id: "medium", label: "Growing team", blurb: "25 people · learning to stay in sync." },
  { id: "large", label: "Bigger team", blurb: "100 people · keeping the human signal alive." },
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

  function advanceStep(next: 2 | 3) {
    window.setTimeout(() => setStep(next), 450);
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
      className="ph grid h-dvh overflow-hidden grid-cols-1 lg:[grid-template-columns:minmax(0,1.1fr)_minmax(0,1fr)] pt-safe pb-safe pl-safe pr-safe"
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
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            v0.7.2
          </span>
        </header>

        <div>
          <h1
            style={{
              margin: 0,
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

        <div>
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
        </div>
      </section>

      {/* RIGHT — poster */}
      <section
        className="relative hidden lg:block"
        style={{ background: "var(--bg-2)", padding: 24 }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 18,
            overflow: "hidden",
            background: "var(--bg)",
          }}
        >
          <img
            src="/welcome-poster.png"
            alt="A solitary figure standing in a sunlit clearing surrounded by lush foliage"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
        <a
          href="https://i.pinimg.com/1200x/7d/e3/ca/7de3cae3414ac39a43315f2f5629fcd0.jpg"
          target="_blank"
          rel="noopener noreferrer"
          className="t-mono absolute"
          style={{
            bottom: 48,
            left: 48,
            color: "var(--muted-foreground)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          IMAGE · PINTEREST ↗
        </a>
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
                  if (e.key === "Enter") advanceStep(2);
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
                <Button onClick={() => advanceStep(2)} disabled={wsName.trim().length === 0}>
                  Continue →
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <Button variant="ghost" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button onClick={() => advanceStep(3)}>Continue →</Button>
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
