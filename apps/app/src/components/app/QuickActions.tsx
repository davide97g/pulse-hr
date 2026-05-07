import { Avatar } from "@/components/app/AppShell";
import { computeLeaveDays, type CoverageForDate, coverageForRange } from "@/lib/leave";
import { employeeById, type JobPosting } from "@/lib/mock-data";
import { employeesTable, makeEmployee } from "@/lib/tables/employees";
import { jobPostingsTable } from "@/lib/tables/jobPostings";
import { leaveTable } from "@/lib/tables/leave";
import { cn } from "@/lib/utils";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { Textarea } from "@pulse-hr/ui/primitives/textarea";
import { format, parseISO } from "date-fns";
import {
  Briefcase,
  Calendar,
  CalendarClock,
  CalendarRange,
  UserPlus,
  Users
} from "lucide-react";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ActionId =
  | "add-employee"
  | "request-leave"
  | "post-job"
  | null;

interface Ctx {
  open: (id: ActionId) => void;
}
const QuickActionCtx = createContext<Ctx>({ open: () => { } });
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
      <SidePanel
        open={active === "request-leave"}
        onClose={close}
        title="Request leave"
        width={480}
      >
        <RequestLeaveForm onDone={close} />
      </SidePanel>
      <SidePanel open={active === "post-job"} onClose={close} title="Post a job" width={520}>
        <PostJobForm onDone={close} />
      </SidePanel>
    </QuickActionCtx.Provider>
  );
}

function FormBody({ children }: { children: ReactNode }) {
  return <div className="p-5 space-y-4">{children}</div>;
}
function Footer({
  onCancel,
  onSubmit,
  label = "Submit",
  disabled,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <div className="px-5 py-3 border-t flex justify-end gap-2 sticky bottom-0 bg-card">
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSubmit} disabled={disabled}>
        {label}
      </Button>
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
          <div className="text-sm text-muted-foreground">
            Adds the employee to the directory and every linked view.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>First name</Label>
            <Input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Emma" />
          </div>
          <div className="space-y-1.5">
            <Label>Last name</Label>
            <Input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Wilson" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Work email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="emma@acme.co"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Senior Engineer"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Engineering"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Manager</Label>
            <Input
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="Sarah Chen"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Start date</Label>
            <Input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Salary</Label>
            <Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="95000" />
          </div>
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
      return coverageForRange(parseISO(from), parseISO(granularity === "half" ? from : to), {
        excludeEmployeeId: ME_ID,
      });
    } catch {
      return [];
    }
  }, [from, to, granularity]);

  const worstCoverage = coverage.reduce<CoverageForDate | null>(
    (acc, d) => (!acc || d.coveragePct < acc.coveragePct ? d : acc),
    null,
  );
  const conflictCount = coverage.reduce((acc, d) => acc + d.onLeave.length, 0);

  const submit = () => {
    leaveTable.add({
      employeeId: ME_ID,
      type: type as "Vacation" | "Sick" | "Personal" | "Parental",
      from,
      to: granularity === "half" ? from : to,
      days,
      status: "pending",
      reason: "",
      submittedAt: new Date().toISOString(),
      granularity,
      halfPeriod: granularity === "half" ? halfPeriod : undefined,
    });
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
            {["Vacation", "Sick", "Personal", "Parental"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`text-xs py-2 rounded-md border press-scale ${type === t ? "border-primary bg-primary/5 text-primary font-medium" : "hover:bg-muted"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Duration</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {(["full", "half"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`text-xs py-2 rounded-md border press-scale inline-flex items-center justify-center gap-1.5 ${granularity === g ? "border-primary bg-primary/5 text-primary font-medium" : "hover:bg-muted"}`}
              >
                {g === "full" ? (
                  <CalendarRange className="h-3.5 w-3.5" />
                ) : (
                  <CalendarClock className="h-3.5 w-3.5" />
                )}
                {g === "full" ? "Full day" : "Half day"}
              </button>
            ))}
          </div>
          {granularity === "half" && (
            <div className="inline-flex rounded-md border p-0.5 bg-muted/30 mt-1 fade-in">
              {(["AM", "PM"] as const).map((p) => (
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
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={granularity === "half"}
            />
          </div>
        </div>

        <div className="rounded-md bg-info/5 border border-info/20 p-3 text-xs">
          <div className="font-medium text-info">
            {granularity === "half" ? (
              <>
                Half day · {halfPeriod} ({days} working day)
              </>
            ) : (
              <>
                {days} working day{days === 1 ? "" : "s"}
              </>
            )}
          </div>
          <div className="text-muted-foreground mt-0.5">
            You have <strong>{(13 - days).toFixed(1)} vacation days</strong> remaining after this.
          </div>
        </div>

        <CoveragePreview coverage={coverage} worst={worstCoverage} conflicts={conflictCount} />

        <div className="space-y-1.5">
          <Label>Reason (optional)</Label>
          <Textarea placeholder="Family trip" rows={3} />
        </div>
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
  coverage,
  worst,
  conflicts,
}: {
  coverage: CoverageForDate[];
  worst: CoverageForDate | null;
  conflicts: number;
}) {
  if (coverage.length === 0) return null;

  const tone =
    !worst || worst.coveragePct >= 75 ? "ok" : worst.coveragePct >= 60 ? "warn" : "alert";

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
          {conflicts === 0 ? (
            "No conflicts · team fully covered"
          ) : (
            <>
              {conflicts} teammate{conflicts === 1 ? "" : "s"} already out during this range
            </>
          )}
        </span>
        {worst && (
          <span
            className={cn(
              "ml-auto font-mono tabular-nums",
              tone === "warn" && "text-warning",
              tone === "alert" && "text-destructive",
            )}
          >
            min {worst.coveragePct}%
          </span>
        )}
      </div>
      <ul className="space-y-1">
        {coverage.slice(0, 7).map((d) => (
          <li key={d.date.toISOString()} className="flex items-center gap-2">
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground w-14 shrink-0">
              {format(d.date, "EEE d")}
            </span>
            <div className="flex -space-x-1.5 flex-1 min-w-0">
              {d.onLeave.slice(0, 6).map((l) => {
                const emp = employeeById(l.employeeId);
                if (!emp) return null;
                return (
                  <div
                    key={l.id}
                    title={`${emp.name} · ${l.type}`}
                    className="ring-2 ring-background rounded-full"
                  >
                    <Avatar
                      initials={emp.initials}
                      color={emp.avatarColor}
                      size={18}
                      employeeId={emp.id}
                    />
                  </div>
                );
              })}
              {d.onLeave.length > 6 && (
                <span className="ml-1 text-[10px] text-muted-foreground">
                  +{d.onLeave.length - 6}
                </span>
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


function PostJobForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("Remote — EU");
  const [type, setType] = useState<JobPosting["type"]>("Full-time");
  const [salary, setSalary] = useState("");
  const [owner, setOwner] = useState("Sarah Chen");
  const [description, setDescription] = useState("");
  const valid = title.trim().length > 0 && description.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    const j: JobPosting = {
      title: title.trim(),
      department: department.trim() || "Engineering",
      location: location.trim() || "Remote",
      type,
      salary: salary.trim(),
      owner: owner.trim() || "Sarah Chen",
      description: description.trim(),
      id: `j-${Date.now()}`,
      applicants: 0,
      posted: new Date().toISOString().slice(0, 10),
      status: "draft",
    };
    jobPostingsTable.add(j);
    toast.success("Job created", {
      description: "Saved as draft. Publish from Recruiting when ready.",
      icon: <Briefcase className="h-4 w-4" />,
    });
    onDone();
  };

  return (
    <>
      <FormBody>
        <div className="space-y-1.5">
          <Label>Job title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Senior Frontend Engineer"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Engineering"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Remote — EU"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Employment</Label>
            <div className="flex gap-1.5">
              {(["Full-time", "Part-time", "Contractor"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "flex-1 text-xs py-2 rounded-md border press-scale",
                    type === t
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "hover:bg-muted",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Salary range</Label>
            <Input
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="$80k – $110k"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="About the role…"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Hiring manager</Label>
          <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Name" />
        </div>
      </FormBody>
      <Footer onCancel={onDone} onSubmit={submit} label="Save draft" disabled={!valid} />
    </>
  );
}

