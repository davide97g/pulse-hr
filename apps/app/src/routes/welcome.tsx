import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  ClipboardList,
  Coins,
  Loader2,
  Rocket,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { DEFAULT_WORKSPACE_NAME, createWorkspace, useWorkspaceStatus } from "@/lib/workspace";
import { employeesTable, makeEmployee } from "@/lib/tables/employees";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — Pulse HR" }] }),
  component: Welcome,
});

type OnboardingRole = "admin" | "hr" | "manager" | "finance" | "employee";

const ROLES: {
  id: OnboardingRole;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "admin", label: "Admin", desc: "Workspace owner, full access", icon: Shield },
  { id: "hr", label: "HR / People ops", desc: "Hiring, onboarding, growth", icon: UsersRound },
  { id: "manager", label: "Manager", desc: "Team, time, projects", icon: Briefcase },
  { id: "finance", label: "Finance", desc: "Payroll, expenses, reports", icon: Wallet },
  { id: "employee", label: "Employee", desc: "Day-to-day contributor view", icon: Users },
];

const GOALS = [
  { id: "hire", label: "Hire faster", icon: UserPlus },
  { id: "retain", label: "Retain top talent", icon: Sparkles },
  { id: "automate", label: "Automate HR ops", icon: Rocket },
  { id: "budget", label: "Control budget & margin", icon: Coins },
  { id: "engage", label: "Boost engagement", icon: TrendingUp },
  { id: "compliance", label: "Stay compliant", icon: ClipboardList },
  { id: "plan", label: "Plan capacity", icon: Target },
] as const;

type Step = 0 | 1 | 2 | 3;

function Welcome() {
  const navigate = useNavigate();
  const status = useWorkspaceStatus();
  const { user } = useUser();

  const [step, setStep] = useState<Step>(0);
  const [role, setRole] = useState<OnboardingRole | null>(null);
  const [goals, setGoals] = useState<Set<string>>(new Set());
  const [name, setName] = useState(DEFAULT_WORKSPACE_NAME);
  const [colleagues, setColleagues] = useState<string[]>(["", "", ""]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status.ready) navigate({ to: "/", replace: true });
  }, [status.ready, navigate]);

  const canNext =
    step === 0
      ? role !== null
      : step === 1
        ? goals.size > 0
        : step === 2
          ? name.trim().length > 1
          : true;

  const toggleGoal = (id: string) =>
    setGoals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const finish = async () => {
    if (creating || !role) return;
    setCreating(true);

    const cleanColleagues = colleagues.map((c) => c.trim()).filter(Boolean);

    try {
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...(user.unsafeMetadata ?? {}),
            role,
            goals: Array.from(goals),
            workspaceName: name.trim() || DEFAULT_WORKSPACE_NAME,
            colleagues: cleanColleagues,
          },
        });
      }
    } catch (err) {
      console.warn("welcome: failed to persist onboarding metadata", err);
    }

    try {
      createWorkspace(name);
      if (cleanColleagues.length) {
        const today = new Date().toISOString().slice(0, 10);
        for (const cname of cleanColleagues) {
          employeesTable.add(
            makeEmployee({
              name: cname,
              email: `${cname.toLowerCase().replace(/\s+/g, ".")}@${(name || "acme").toLowerCase().replace(/[^a-z0-9]/g, "")}.co`,
              role: "Teammate",
              department: "Your team",
              location: "Remote",
              status: "active",
              joinDate: today,
              salary: 0,
              phone: "",
              employmentType: "Full-time",
            }),
          );
        }
      }
      toast.success(`${name || DEFAULT_WORKSPACE_NAME} is ready`, {
        icon: <Sparkles className="h-4 w-4" />,
      });
      navigate({ to: "/", replace: true });
    } catch (err) {
      console.warn(err);
      setCreating(false);
      toast.error("Could not create workspace");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-2xl p-8 fade-in">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-display font-semibold">Welcome to Pulse</h1>
            <p className="text-sm text-muted-foreground">
              {
                [
                  "Pick the role that best fits you.",
                  "What do you want to get out of Pulse?",
                  "Name your workspace.",
                  "Add a few teammates (optional).",
                ][step]
              }
            </p>
          </div>
        </div>

        <Stepper step={step} />

        <div className="mt-6 min-h-[260px]">
          {step === 0 && <RoleStep role={role} onPick={setRole} />}
          {step === 1 && <GoalsStep selected={goals} onToggle={toggleGoal} />}
          {step === 2 && <WorkspaceStep value={name} onChange={setName} disabled={creating} />}
          {step === 3 && (
            <ColleaguesStep
              values={colleagues}
              onChange={(i, v) =>
                setColleagues((prev) => prev.map((x, idx) => (idx === i ? v : x)))
              }
            />
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
            disabled={step === 0 || creating}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              className="press-scale"
              disabled={!canNext}
              onClick={() => setStep((s) => (s + 1) as Step)}
            >
              Continue <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="press-scale"
              disabled={creating || !status.hasUser}
              onClick={finish}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating workspace…
                </>
              ) : (
                <>
                  Create workspace <Check className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  return (
    <div className="mt-6 flex items-center gap-2">
      {[0, 1, 2, 3].map((n) => (
        <div key={n} className="flex items-center gap-2 flex-1">
          <div
            className={cn(
              "h-6 w-6 rounded-full grid place-items-center text-[11px] font-medium transition-colors shrink-0",
              n < step
                ? "bg-success text-success-foreground"
                : n === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {n < step ? <Check className="h-3 w-3" /> : n + 1}
          </div>
          {n !== 3 && <div className={cn("h-px flex-1", n < step ? "bg-success" : "bg-border")} />}
        </div>
      ))}
    </div>
  );
}

function RoleStep({
  role,
  onPick,
}: {
  role: OnboardingRole | null;
  onPick: (r: OnboardingRole) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {ROLES.map((r) => {
        const Icon = r.icon;
        const active = role === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onPick(r.id)}
            className={cn(
              "p-4 rounded-md border text-left press-scale transition-colors flex items-start gap-3",
              active ? "border-primary bg-primary/5" : "hover:bg-muted/40",
            )}
          >
            <Icon
              className={cn("h-5 w-5 mt-0.5", active ? "text-primary" : "text-muted-foreground")}
            />
            <div>
              <div className="text-sm font-medium">{r.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function GoalsStep({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-3">Pick one or more.</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {GOALS.map((g) => {
          const Icon = g.icon;
          const active = selected.has(g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onToggle(g.id)}
              className={cn(
                "p-3 rounded-md border text-left press-scale transition-colors flex items-center gap-3",
                active ? "border-primary bg-primary/5" : "hover:bg-muted/40",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              <div className="text-sm flex-1">{g.label}</div>
              <div
                className={cn(
                  "h-4 w-4 rounded-sm border grid place-items-center transition-colors",
                  active ? "bg-primary border-primary text-primary-foreground" : "border-border",
                )}
              >
                {active && <Check className="h-3 w-3" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WorkspaceStep({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="ws-name">Workspace name</Label>
        <Input
          id="ws-name"
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={DEFAULT_WORKSPACE_NAME}
          disabled={disabled}
        />
      </div>
      <div className="rounded-md border border-info/20 bg-info/5 p-3 text-xs text-muted-foreground">
        We'll seed a sample organisation so every feature has realistic data. Everything lives in
        your browser — reset any time.
      </div>
    </div>
  );
}

function ColleaguesStep({
  values,
  onChange,
}: {
  values: string[];
  onChange: (i: number, v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Optional — we'll add them to your employees list so the demo feels familiar.
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-1.5">
          <Label htmlFor={`col-${i}`}>Teammate {i + 1}</Label>
          <Input
            id={`col-${i}`}
            value={values[i]}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={["Maya Rossi", "Kai Bennett", "Elena Diaz"][i]}
          />
        </div>
      ))}
    </div>
  );
}
