import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSignUp } from "@clerk/react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Building2,
  User,
  Users,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/app/AuthLayout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your workspace — Pulse HR" }] }),
  component: Signup,
});

const SIZE_OPTIONS = ["1–10", "11–50", "51–200", "201–500", "500+"] as const;

function Signup() {
  const nav = useNavigate();
  const { signUp, fetchStatus } = useSignUp();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [account, setAccount] = useState({ name: "", email: "", password: "", show: false });
  const [company, setCompany] = useState({
    name: "",
    size: "11–50" as (typeof SIZE_OPTIONS)[number],
    country: "Italy",
  });
  const [role, setRole] = useState<"founder" | "hr" | "finance" | "other">("hr");
  const [loading, setLoading] = useState(false);

  const canNext =
    step === 1
      ? account.name.trim().length > 1 &&
        account.email.includes("@") &&
        account.password.length >= 8
      : step === 2
        ? company.name.trim().length > 1
        : true;

  const startSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canNext || loading) return;
    setLoading(true);
    try {
      const [firstName, ...rest] = account.name.trim().split(" ");
      const lastName = rest.join(" ") || undefined;
      const createRes = await signUp.create({
        emailAddress: account.email,
        password: account.password,
        firstName,
        lastName,
      });
      if (createRes.error) {
        toast.error("Couldn't create account", { description: createRes.error.message });
        return;
      }
      const sendRes = await signUp.verifications.sendEmailCode();
      if (sendRes.error) {
        toast.error("Couldn't send verification code", { description: sendRes.error.message });
        return;
      }
      setVerifying(true);
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const verifyRes = await signUp.verifications.verifyEmailCode({ code });
      if (verifyRes.error) {
        toast.error("Invalid code", { description: verifyRes.error.message });
        return;
      }
      if (signUp.status !== "complete") {
        toast.error("Additional sign-up step required", { description: signUp.status ?? "Retry" });
        return;
      }
      const finRes = await signUp.finalize();
      if (finRes.error) {
        toast.error("Couldn't activate session", { description: finRes.error.message });
        return;
      }
      setVerifying(false);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    const res = await signUp.verifications.sendEmailCode();
    if (res.error) toast.error("Couldn't resend", { description: res.error.message });
    else toast("New code sent");
  };

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Workspace created", {
        description: `Welcome to ${company.name || "Pulse HR"}!`,
      });
      setLoading(false);
      nav({ to: "/" });
    }, 900);
  };

  const sidePanel = <SignupSide step={step} />;

  return (
    <AuthLayout
      title={
        verifying
          ? "Check your inbox."
          : step === 1
            ? "Start free."
            : step === 2
              ? "Tell us about your team."
              : "Pick your flavor."
      }
      subtitle={
        verifying
          ? `We sent a 6-digit code to ${account.email}. Paste it below to continue.`
          : step === 1
            ? "Create a Pulse HR workspace in under a minute. No credit card required."
            : step === 2
              ? "We'll set sensible defaults based on your region and team size."
              : "We'll pre-configure the workspace for how you'll use it."
      }
      side={sidePanel}
      footer={
        step === 1 && !verifying ? (
          <>
            Already have an account?{" "}
            <Link to="/login" className="text-foreground font-medium hover:underline">
              Sign in →
            </Link>
          </>
        ) : undefined
      }
    >
      <div className="flex items-center gap-2 mb-7">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "h-7 w-7 rounded-full grid place-items-center text-xs font-medium transition-colors shrink-0",
                n < step
                  ? "bg-success text-success-foreground"
                  : n === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {n < step ? <Check className="h-3.5 w-3.5" /> : n}
            </div>
            {n !== 3 && <div className={cn("h-px flex-1", n < step ? "bg-success" : "bg-border")} />}
          </div>
        ))}
      </div>

      {step === 1 && !verifying && (
        <form onSubmit={startSignUp} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={account.name}
              onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))}
              placeholder="Alex Carter"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              value={account.email}
              onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))}
              placeholder="alex@company.co"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Password</Label>
            <div className="relative">
              <Input
                id="pw"
                type={account.show ? "text" : "password"}
                value={account.password}
                onChange={(e) => setAccount((a) => ({ ...a, password: e.target.value }))}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setAccount((a) => ({ ...a, show: !a.show }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {account.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength value={account.password} />
          </div>
          {/* Clerk bot-protection mount target */}
          <div id="clerk-captcha" />
          <Button
            type="submit"
            disabled={!canNext || loading || fetchStatus === "fetching"}
            className="w-full h-11 press-scale"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending code…
              </>
            ) : (
              <>
                Continue <ArrowRight className="h-4 w-4 ml-1.5" />
              </>
            )}
          </Button>
        </form>
      )}

      {step === 1 && verifying && (
        <form onSubmit={verify} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Verification code</Label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                autoFocus
                className="pl-9 tracking-[0.4em] font-mono"
              />
            </div>
            <button
              type="button"
              onClick={resend}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Resend code
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="press-scale"
              onClick={() => {
                setVerifying(false);
                setCode("");
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={code.length < 6 || loading}
              className="flex-1 h-11 press-scale"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  Verify <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cname">Company name</Label>
            <Input
              id="cname"
              value={company.name}
              onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))}
              placeholder="Acme Inc."
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Team size</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCompany((c) => ({ ...c, size: s }))}
                  className={cn(
                    "h-10 rounded-md text-xs border press-scale transition-colors",
                    company.size === s
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "hover:bg-muted",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Headquarters country</Label>
            <Input
              id="country"
              value={company.country}
              onChange={(e) => setCompany((c) => ({ ...c, country: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="press-scale"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button
              type="button"
              disabled={!canNext}
              className="flex-1 h-11 press-scale"
              onClick={() => setStep(3)}
            >
              Continue <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { v: "founder", l: "Founder / CEO", i: Building2 },
                { v: "hr", l: "HR / People ops", i: User },
                { v: "finance", l: "Finance / Payroll", i: Users },
                { v: "other", l: "Something else", i: User },
              ] as const
            ).map((o) => {
              const Icon = o.i;
              return (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setRole(o.v)}
                  className={cn(
                    "p-4 rounded-md border text-left press-scale transition-colors",
                    role === o.v ? "border-primary bg-primary/5" : "hover:bg-muted/40",
                  )}
                >
                  <Icon className="h-5 w-5 mb-2 text-primary" />
                  <div className="text-sm font-medium">{o.l}</div>
                </button>
              );
            })}
          </div>

          <div className="rounded-md border p-4 bg-info/5 border-info/20 text-xs text-muted-foreground">
            We'll create a sample workspace with mock employees and commesse so you can explore every
            flow instantly. Import your real data anytime from Settings.
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="press-scale"
              onClick={() => setStep(2)}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button
              type="button"
              disabled={loading}
              className="flex-1 h-11 press-scale"
              onClick={submit}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Spinning up your workspace…
                </>
              ) : (
                <>
                  Create workspace <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

function PasswordStrength({ value }: { value: string }) {
  const hasLen = value.length >= 8;
  const hasNum = /\d/.test(value);
  const hasMix = /[a-z]/.test(value) && /[A-Z]/.test(value);
  const hasSym = /[^a-zA-Z0-9]/.test(value);
  const score = [hasLen, hasNum, hasMix, hasSym].filter(Boolean).length;
  const label = ["", "Weak", "Okay", "Good", "Strong"][score];
  return (
    <div className="pt-1 space-y-1">
      <div className="h-1 rounded-full bg-muted overflow-hidden flex gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "flex-1 transition-colors",
              i <= score
                ? score <= 1
                  ? "bg-destructive"
                  : score === 2
                    ? "bg-warning"
                    : score === 3
                      ? "bg-info"
                      : "bg-success"
                : "bg-transparent",
            )}
          />
        ))}
      </div>
      {value && (
        <div className="text-[11px] text-muted-foreground">
          {label} · add {hasMix ? "" : "mixed case, "}
          {hasNum ? "" : "a number, "}
          {hasSym ? "" : "a symbol"}.
        </div>
      )}
    </div>
  );
}

function SignupSide({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    {
      k: "Create account",
      d: "Name, email, password. Nothing else — we'll figure out the rest together.",
    },
    {
      k: "Shape your workspace",
      d: "Tell us your size and country. We pre-fill payroll regions, currencies and compliance.",
    },
    {
      k: "Pick your flavor",
      d: "We tune the default dashboards and workflows for how your role uses Pulse.",
    },
  ];
  return (
    <div>
      <div className="flex gap-0.5 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#b4ff39]" />
        ))}
      </div>
      <h2 className="font-display text-4xl leading-tight max-w-md">
        Your workspace, <em className="italic text-[#b4ff39]">live in 60 seconds</em>.
      </h2>
      <div className="mt-10 space-y-5 max-w-md">
        {steps.map((s, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const active = n === step;
          const done = n < step;
          return (
            <div
              key={s.k}
              className={cn(
                "flex items-start gap-4 rounded-lg p-4 transition-colors",
                active && "bg-white/[0.04]",
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-md grid place-items-center text-xs font-medium shrink-0",
                  done
                    ? "bg-[#b4ff39] text-[#0b0b0d]"
                    : active
                      ? "bg-white text-[#0b0b0d]"
                      : "bg-white/10 text-white/70",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : n}
              </div>
              <div>
                <div className={cn("text-sm font-medium", active ? "text-white" : "text-white/80")}>
                  {s.k}
                </div>
                <div className="text-xs text-white/50 mt-1 leading-relaxed">{s.d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
