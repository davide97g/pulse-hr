import { createContext, useContext, useState, type ReactNode } from "react";
import { SidePanel } from "@/components/app/SidePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/app/AppShell";
import { employees } from "@/lib/mock-data";
import { toast } from "sonner";
import { Calendar, Receipt, UserPlus, Briefcase, Check } from "lucide-react";

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
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const submit = () => {
    toast.success("Employee added", { description: `${name || "New employee"} will receive an onboarding email.`, icon: <UserPlus className="h-4 w-4" /> });
    onDone();
  };
  return (
    <>
      <FormBody>
        <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40">
          <UserPlus className="h-5 w-5 text-primary" />
          <div className="text-sm text-muted-foreground">An invite will be sent and an onboarding workflow created.</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>First name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Emma" /></div>
          <div className="space-y-1.5"><Label>Last name</Label><Input placeholder="Wilson" /></div>
        </div>
        <div className="space-y-1.5"><Label>Work email</Label><Input type="email" placeholder="emma@acme.co" /></div>
        <div className="space-y-1.5"><Label>Role</Label><Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Engineer" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Department</Label><Input placeholder="Engineering" /></div>
          <div className="space-y-1.5"><Label>Manager</Label><Input placeholder="Sarah Chen" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Start date</Label><Input type="date" defaultValue="2025-05-06" /></div>
          <div className="space-y-1.5"><Label>Salary</Label><Input placeholder="95000" /></div>
        </div>
      </FormBody>
      <Footer onCancel={onDone} onSubmit={submit} label="Add & invite" />
    </>
  );
}

function RequestLeaveForm({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState("Vacation");
  const submit = () => {
    toast.success("Leave request submitted", { description: `Sent to your manager for approval.`, icon: <Calendar className="h-4 w-4" /> });
    onDone();
  };
  return (
    <>
      <FormBody>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {["Vacation","Sick","Personal","Parental"].map(t => (
              <button key={t} onClick={() => setType(t)} className={`text-xs py-2 rounded-md border ${type === t ? "border-primary bg-primary/5 text-primary font-medium" : "hover:bg-muted"}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>From</Label><Input type="date" defaultValue="2025-04-25" /></div>
          <div className="space-y-1.5"><Label>To</Label><Input type="date" defaultValue="2025-04-29" /></div>
        </div>
        <div className="rounded-md bg-info/5 border border-info/20 p-3 text-xs">
          <div className="font-medium text-info">3 working days</div>
          <div className="text-muted-foreground mt-0.5">You have <strong>13 vacation days</strong> remaining after this.</div>
        </div>
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

function SubmitExpenseForm({ onDone }: { onDone: () => void }) {
  const [cat, setCat] = useState("Travel");
  const submit = () => {
    toast.success("Expense submitted", { description: "Sent to manager for review.", icon: <Receipt className="h-4 w-4" /> });
    onDone();
  };
  return (
    <>
      <FormBody>
        <div className="space-y-1.5"><Label>Description</Label><Input placeholder="Client dinner" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Amount</Label><Input placeholder="150.00" /></div>
          <div className="space-y-1.5"><Label>Currency</Label><Input defaultValue="USD" /></div>
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {["Travel","Meals","Software","Equipment"].map(c => (
              <button key={c} onClick={() => setCat(c)} className={`text-xs py-2 rounded-md border ${cat === c ? "border-primary bg-primary/5 text-primary font-medium" : "hover:bg-muted"}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5"><Label>Date</Label><Input type="date" defaultValue="2025-04-17" /></div>
        <div className="space-y-1.5">
          <Label>Receipt</Label>
          <div className="border-2 border-dashed rounded-md p-6 text-center hover:bg-muted/40 cursor-pointer">
            <div className="text-2xl mb-1">📎</div>
            <div className="text-sm font-medium">Drop receipt or click to upload</div>
            <div className="text-xs text-muted-foreground mt-0.5">PDF, JPG up to 10MB</div>
          </div>
        </div>
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
