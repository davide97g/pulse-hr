import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { format, parseISO } from "date-fns";
import { SidePanel } from "@/components/app/SidePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/app/AppShell";
import { employees, employeeById } from "@/lib/mock-data";
import { employeesTable, makeEmployee } from "@/lib/tables/employees";
import { coverageForRange, computeLeaveDays, type CoverageForDate } from "@/lib/leave";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Calendar, Receipt, UserPlus, Briefcase, Check, CalendarRange, CalendarClock, Users, Sparkles,
} from "lucide-react";

type ActionId = "add-employee" | "request-leave" | "submit-expense" | "post-job" | "run-payroll" | null;

interface Ctx {
  open: (id: ActionId) => void;
}
const QuickActionCtx = createContext<Ctx>({ open: () => {} });
export const useQuickAction = () => useContext(QuickActionCtx);

export function QuickActionProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActionId>(null);
  const close = () => setActive(null);

  return (
    <QuickActionCtx.Provider value={{ open: setActive }}>
      {children}

      <SidePanel open={active === "add-employee"} onClose={close} title="Add employee" width={520}>
        <AddEmployeeForm onDone={close} />
      </SidePanel>
      <SidePanel open={active === "request-leave"} onClose={close} title="Request leave" width={480}>
        <RequestLeaveForm onDone={close} />
      </SidePanel>
      <SidePanel open={active === "submit-expense"} onClose={close} title="Submit expense" width={480}>
        <SubmitExpenseForm onDone={close} />
      </SidePanel>
      <SidePanel open={active === "post-job"} onClose={close} title="Post a job" width={520}>
        <PostJobForm onDone={close} />
      </SidePanel>
      <SidePanel open={active === "run-payroll"} onClose={close} title="Run payroll" width={520}>
        <RunPayrollForm onDone={close} />
      </SidePanel>
    </QuickActionCtx.Provider>
  );
}

function FormBody({ children }: { children: ReactNode }) {
  return <div className="p-5 space-y-4">{children}</div>;
}
function Footer({ onCancel, onSubmit, label = "Submit" }: { onCancel: () => void; onSubmit: () => void; label?: string }) {
  return (
    <div className="px-5 py-3 border-t flex justify-end gap-2 sticky bottom-0 bg-card">
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      <Button onClick={onSubmit}>{label}</Button>
    </div>
  );
}

function AddEmployeeForm({ onDone }: { onDone: () => void }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [manager, setManager] = useState("");
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [salary, setSalary] = useState("");

  const submit = () => {
    const fullName = `${first.trim()} ${last.trim()}`.trim();
    if (!fullName) {
      toast.error("Name is required");
      return;
    }
    const created = employeesTable.add(
      makeEmployee({
        name: fullName,
        email: email.trim() || `${first.toLowerCase() || "new"}@acme.co`,
        role: role.trim() || "Team member",
        department: department.trim() || "—",
        manager: manager.trim() || undefined,
        location: "Remote",
        status: "active",
        joinDate,
        salary: Number(salary) || 0,
        phone: "",
        employmentType: "Full-time",
      }),
    );
    toast.success("Employee added", {
      description: `${created.name} is now in the directory.`,
      icon: <UserPlus className="h-4 w-4" />,
    });
    onDone();
  };

  return (
    <>
      <FormBody>
        <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40">
          <UserPlus className="h-5 w-5 text-primary" />
          <div className="text-sm text-muted-foreground">Adds the employee to the directory and every linked view.</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>First name</Label><Input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Emma" /></div>
          <div className="space-y-1.5"><Label>Last name</Label><Input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Wilson" /></div>
        </div>
        <div className="space-y-1.5"><Label>Work email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="emma@acme.co" /></div>
        <div className="space-y-1.5"><Label>Role</Label><Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Engineer" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Department</Label><Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Engineering" /></div>
          <div className="space-y-1.5"><Label>Manager</Label><Input value={manager} onChange={(e) => setManager(e.target.value)} placeholder="Sarah Chen" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Start date</Label><Input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Salary</Label><Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="95000" /></div>
        </div>
      </FormBody>
      <Footer onCancel={onDone} onSubmit={submit} label="Add & invite" />
    </>
  );
}

function RequestLeaveForm({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState("Vacation");
  const [granularity, setGranularity] = useState<"full" | "half">("full");
  const [halfPeriod, setHalfPeriod] = useState<"AM" | "PM">("AM");
  const todayIso = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(todayIso);
  const [to, setTo] = useState(todayIso);

  useEffect(() => {
    if (granularity === "half") setTo(from);
  }, [granularity, from]);

  const days = computeLeaveDays(from, to, granularity);
  const coverage = useMemo(() => {
    try {
      return coverageForRange(parseISO(from), parseISO(granularity === "half" ? from : to), { excludeEmployeeId: ME_ID });
    } catch { return []; }
  }, [from, to, granularity]);

  const worstCoverage = coverage.reduce<CoverageForDate | null>(
    (acc, d) => (!acc || d.coveragePct < acc.coveragePct ? d : acc),
    null,
  );
  const conflictCount = coverage.reduce((acc, d) => acc + d.onLeave.length, 0);

  const submit = () => {
    toast.success("Leave request submitted", {
      description: `${granularity === "half" ? `Half day · ${halfPeriod}` : `${days} working day${days === 1 ? "" : "s"}`} · ${from}${granularity === "half" ? "" : ` → ${to}`}`,
      icon: <Calendar className="h-4 w-4" />,
    });
    onDone();
  };

  return (
    <>
      <FormBody>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {["Vacation","Sick","Personal","Parental"].map(t => (
              <button key={t} type="button" onClick={() => setType(t)} className={`text-xs py-2 rounded-md border press-scale ${type === t ? "border-primary bg-primary/5 text-primary font-medium" : "hover:bg-muted"}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Duration</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {(["full", "half"] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`text-xs py-2 rounded-md border press-scale inline-flex items-center justify-center gap-1.5 ${granularity === g ? "border-primary bg-primary/5 text-primary font-medium" : "hover:bg-muted"}`}
              >
                {g === "full" ? <CalendarRange className="h-3.5 w-3.5" /> : <CalendarClock className="h-3.5 w-3.5" />}
                {g === "full" ? "Full day" : "Half day"}
              </button>
            ))}
          </div>
          {granularity === "half" && (
            <div className="inline-flex rounded-md border p-0.5 bg-muted/30 mt-1 fade-in">
              {(["AM", "PM"] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setHalfPeriod(p)}
                  className={`px-3 h-7 text-[11px] rounded-sm press-scale ${halfPeriod === p ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>From</Label>
            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              disabled={granularity === "half"}
            />
          </div>
        </div>

        <div className="rounded-md bg-info/5 border border-info/20 p-3 text-xs">
          <div className="font-medium text-info">
            {granularity === "half"
              ? <>Half day · {halfPeriod} ({days} working day)</>
              : <>{days} working day{days === 1 ? "" : "s"}</>}
          </div>
          <div className="text-muted-foreground mt-0.5">You have <strong>{(13 - days).toFixed(1)} vacation days</strong> remaining after this.</div>
        </div>

        <CoveragePreview coverage={coverage} worst={worstCoverage} conflicts={conflictCount} />

        <div className="space-y-1.5"><Label>Reason (optional)</Label><Textarea placeholder="Family trip" rows={3} /></div>
        <div className="space-y-1.5">
          <Label>Approver</Label>
          <div className="flex items-center gap-2 p-2 border rounded-md">
            <Avatar initials="SC" color="oklch(0.7 0.15 30)" size={24} />
            <span className="text-sm">Sarah Chen</span>
          </div>
        </div>
      </FormBody>
      <Footer onCancel={onDone} onSubmit={submit} label="Submit request" />
    </>
  );
}

const ME_ID = "e1";

function CoveragePreview({
  coverage, worst, conflicts,
}: { coverage: CoverageForDate[]; worst: CoverageForDate | null; conflicts: number }) {
  if (coverage.length === 0) return null;

  const tone =
    !worst || worst.coveragePct >= 75 ? "ok"
    : worst.coveragePct >= 60 ? "warn"
    : "alert";

  return (
    <div
      className={cn(
        "rounded-md border p-3 text-xs space-y-2",
        tone === "ok" && "bg-success/5 border-success/20",
        tone === "warn" && "bg-warning/5 border-warning/25",
        tone === "alert" && "bg-destructive/5 border-destructive/25",
      )}
    >
      <div className="flex items-center gap-2">
        <Users className="h-3.5 w-3.5" />
        <span className="font-medium">
          {conflicts === 0
            ? "No conflicts · team fully covered"
            : <>{conflicts} teammate{conflicts === 1 ? "" : "s"} already out during this range</>}
        </span>
        {worst && (
          <span className={cn(
            "ml-auto font-mono tabular-nums",
            tone === "warn" && "text-warning",
            tone === "alert" && "text-destructive",
          )}>
            min {worst.coveragePct}%
          </span>
        )}
      </div>
      <ul className="space-y-1">
        {coverage.slice(0, 7).map(d => (
          <li key={d.date.toISOString()} className="flex items-center gap-2">
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground w-14 shrink-0">
              {format(d.date, "EEE d")}
            </span>
            <div className="flex -space-x-1.5 flex-1 min-w-0">
              {d.onLeave.slice(0, 6).map(l => {
                const emp = employeeById(l.employeeId);
                if (!emp) return null;
                return (
                  <div key={l.id} title={`${emp.name} · ${l.type}`} className="ring-2 ring-background rounded-full">
                    <Avatar initials={emp.initials} color={emp.avatarColor} size={18} employeeId={emp.id} />
                  </div>
                );
              })}
              {d.onLeave.length > 6 && (
                <span className="ml-1 text-[10px] text-muted-foreground">+{d.onLeave.length - 6}</span>
              )}
              {d.onLeave.length === 0 && (
                <span className="text-[10px] text-muted-foreground">clear</span>
              )}
            </div>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground w-10 text-right">
              {d.coveragePct}%
            </span>
          </li>
        ))}
        {coverage.length > 7 && (
          <li className="text-[10px] text-muted-foreground">+{coverage.length - 7} more days</li>
        )}
      </ul>
    </div>
  );
}

const OCR_SAMPLES: { description: string; amount: string; currency: string; category: string; date: string; vendor: string }[] = [
  { description: "Client dinner · Acme Corp",  amount: "184.50", currency: "USD", category: "Meals",     date: "2026-04-17", vendor: "Osteria Milano" },
  { description: "Figma annual license",        amount: "180.00", currency: "USD", category: "Software",  date: "2026-04-15", vendor: "Figma Inc." },
  { description: "Standing desk · Jarvis",      amount: "620.00", currency: "USD", category: "Equipment", date: "2026-04-12", vendor: "Fully" },
  { description: "Flight MXP → SFO",            amount: "1240.00", currency: "USD", category: "Travel",    date: "2026-04-02", vendor: "Delta" },
];

function SubmitExpenseForm({ onDone }: { onDone: () => void }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [cat, setCat] = useState("Travel");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [ocr, setOcr] = useState<{ vendor: string; confidence: number } | null>(null);
  const [scanning, setScanning] = useState(false);

  const runOcr = () => {
    setScanning(true);
    setOcr(null);
    setTimeout(() => {
      const sample = OCR_SAMPLES[Math.floor(Math.random() * OCR_SAMPLES.length)];
      setDescription(sample.description);
      setAmount(sample.amount);
      setCurrency(sample.currency);
      setCat(sample.category);
      setDate(sample.date);
      setOcr({ vendor: sample.vendor, confidence: Math.floor(88 + Math.random() * 10) });
      setScanning(false);
      toast.success("Receipt scanned", {
        description: `${sample.vendor} · ${sample.currency} ${sample.amount}`,
        icon: <Sparkles className="h-4 w-4" />,
      });
    }, 1100);
  };

  const submit = () => {
    toast.success("Expense submitted", { description: "Sent to manager for review.", icon: <Receipt className="h-4 w-4" /> });
    onDone();
  };

  return (
    <>
      <FormBody>
        <div className="space-y-1.5">
          <Label>Receipt</Label>
          <button
            type="button"
            onClick={runOcr}
            disabled={scanning}
            className={cn(
              "w-full border-2 border-dashed rounded-md p-5 text-center hover:bg-muted/40 press-scale transition-colors relative overflow-hidden",
              scanning && "pointer-events-none",
            )}
          >
            {scanning ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <div className="text-sm font-medium">Scanning receipt…</div>
                <div className="text-[11px] text-muted-foreground">Extracting vendor, amount, and date</div>
              </div>
            ) : ocr ? (
              <div className="flex flex-col items-center gap-1 py-2">
                <div className="text-2xl">🧾</div>
                <div className="text-sm font-medium inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Parsed · {ocr.vendor}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  AI confidence {ocr.confidence}% · click to re-scan
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 py-2">
                <div className="text-2xl">📎</div>
                <div className="text-sm font-medium inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Drop receipt — AI fills the form
                </div>
                <div className="text-[11px] text-muted-foreground">PDF, JPG up to 10MB · OCR preview</div>
              </div>
            )}
          </button>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Client dinner" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Amount</Label><Input value={amount} onChange={e => setAmount(e.target.value)} placeholder="150.00" /></div>
          <div className="space-y-1.5"><Label>Currency</Label><Input value={currency} onChange={e => setCurrency(e.target.value)} /></div>
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {["Travel","Meals","Software","Equipment"].map(c => (
              <button key={c} type="button" onClick={() => setCat(c)} className={`text-xs py-2 rounded-md border press-scale ${cat === c ? "border-primary bg-primary/5 text-primary font-medium" : "hover:bg-muted"}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      </FormBody>
      <Footer onCancel={onDone} onSubmit={submit} label="Submit for approval" />
    </>
  );
}

function PostJobForm({ onDone }: { onDone: () => void }) {
  const submit = () => {
    toast.success("Job posted", { description: "Live on careers page in a few seconds.", icon: <Briefcase className="h-4 w-4" /> });
    onDone();
  };
  return (
    <>
      <FormBody>
        <div className="space-y-1.5"><Label>Job title</Label><Input placeholder="Senior Frontend Engineer" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Department</Label><Input placeholder="Engineering" /></div>
          <div className="space-y-1.5"><Label>Location</Label><Input placeholder="Remote — EU" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Employment</Label><Input defaultValue="Full-time" /></div>
          <div className="space-y-1.5"><Label>Salary range</Label><Input placeholder="$80k – $110k" /></div>
        </div>
        <div className="space-y-1.5"><Label>Description</Label><Textarea rows={5} placeholder="About the role…" /></div>
        <div className="space-y-1.5">
          <Label>Hiring manager</Label>
          <div className="flex items-center gap-2 p-2 border rounded-md">
            <Avatar initials="SC" color="oklch(0.7 0.15 30)" size={24} />
            <span className="text-sm">Sarah Chen</span>
          </div>
        </div>
      </FormBody>
      <Footer onCancel={onDone} onSubmit={submit} label="Publish job" />
    </>
  );
}

function RunPayrollForm({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"review" | "processing" | "done">("review");
  const start = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("done");
      toast.success("Payroll completed", { description: "12 employees paid • $89,200 total" });
    }, 2200);
  };
  return (
    <div className="p-5">
      {step === "review" && (
        <>
          <div className="rounded-md border p-4 mb-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Period</div>
            <div className="text-lg font-semibold">April 2025</div>
            <div className="grid grid-cols-3 gap-3 mt-3 text-center">
              <div><div className="text-xl font-semibold">12</div><div className="text-xs text-muted-foreground">Employees</div></div>
              <div><div className="text-xl font-semibold">$124.5k</div><div className="text-xs text-muted-foreground">Gross</div></div>
              <div><div className="text-xl font-semibold">$89.2k</div><div className="text-xs text-muted-foreground">Net</div></div>
            </div>
          </div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Includes</div>
          <div className="space-y-1.5 mb-5">
            {["Withholding tax","Social security","Pension contributions","F24 module (Italy)"].map(s => (
              <div key={s} className="flex items-center gap-2 text-sm"><Check className="h-3.5 w-3.5 text-success" />{s}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={onDone}>Cancel</Button>
            <Button className="flex-1" onClick={start}>Run payroll</Button>
          </div>
        </>
      )}
      {step === "processing" && (
        <div className="py-12 text-center">
          <div className="h-12 w-12 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
          <div className="font-semibold">Processing payroll…</div>
          <div className="text-sm text-muted-foreground mt-1">Calculating taxes and net pay for 12 employees</div>
        </div>
      )}
      {step === "done" && (
        <div className="py-12 text-center">
          <div className="h-14 w-14 mx-auto rounded-full bg-success text-white flex items-center justify-center mb-4">
            <Check className="h-7 w-7" />
          </div>
          <div className="font-semibold text-lg">Payroll completed</div>
          <div className="text-sm text-muted-foreground mt-1">$89,200 paid to 12 employees</div>
          <Button className="mt-5" onClick={onDone}>Done</Button>
        </div>
      )}
    </div>
  );
}
