import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSignUp } from "@clerk/react";
import { ArrowRight, ArrowLeft, Check, Loader2, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { AuthLayout } from "@/components/app/AuthLayout";
import { CompanyProfileForm } from "@/components/app/CompanyProfileForm";
import { useCompanyProfileStore } from "@/components/app/CompanyProfileStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your account — Pulse HR" }] }),
  component: Signup,
});

type Stage = "account" | "verify" | "questionnaire";

function Signup() {
  const nav = useNavigate();
  const { signUp, fetchStatus } = useSignUp();
  const { profile, loading: profileLoading } = useCompanyProfileStore();
  const [stage, setStage] = useState<Stage>("account");
  const [code, setCode] = useState("");
  const [account, setAccount] = useState({ name: "", email: "", password: "", show: false });
  const [loading, setLoading] = useState(false);

  // If a returning user already filled (or skipped) the questionnaire we keep
  // signup at "create account → verify email → workspace" — questionnaire only
  // appears the first time, never again.
  const questionnaireDone = !profileLoading && profile !== undefined;

  const canStart =
    account.name.trim().length > 1 &&
    account.email.includes("@") &&
    account.password.length >= 8;

  const goToWorkspace = () => nav({ to: "/welcome" });

  // After verifying the email, jump straight to /welcome if the questionnaire
  // was already completed in a prior session.
  useEffect(() => {
    if (stage === "questionnaire" && questionnaireDone) goToWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, questionnaireDone]);

  const startSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canStart || loading) return;
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
      setStage("verify");
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
      // Profile state hydrates async after the user is signed in; the effect
      // above will route forward once we know whether to show the form.
      setStage("questionnaire");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    const res = await signUp.verifications.sendEmailCode();
    if (res.error) toast.error("Couldn't resend", { description: res.error.message });
    else toast("New code sent");
  };

  const totalSteps = 3 as const;
  const stepIndex = stage === "account" ? 1 : stage === "verify" ? 1 : 2;

  return (
    <AuthLayout
      title={
        stage === "account"
          ? "Start free."
          : stage === "verify"
            ? "Check your inbox."
            : "Tell us about your company."
      }
      subtitle={
        stage === "account"
          ? "Create a Pulse HR account in under a minute. No credit card required."
          : stage === "verify"
            ? `We sent a 6-digit code to ${account.email}. Paste it below to continue.`
            : "Optional — answer four questions to double your voting power. We'll only ask once."
      }
      side={<SignupSide stage={stage} />}
      footer={
        stage === "account" ? (
          <>
            Already have an account?{" "}
            <Link to="/login" className="text-foreground font-medium hover:underline">
              Sign in →
            </Link>
          </>
        ) : undefined
      }
    >
      <Stepper current={stepIndex} total={totalSteps} />

      {stage === "account" && (
        <form onSubmit={startSignUp} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              name="name"
              value={account.name}
              onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))}
              placeholder="Alex Carter"
              autoComplete="name"
              enterKeyHint="next"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={account.email}
              onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))}
              placeholder="alex@company.co"
              autoComplete="username"
              inputMode="email"
              enterKeyHint="next"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Password</Label>
            <div className="relative">
              <Input
                id="pw"
                name="new-password"
                type={account.show ? "text" : "password"}
                value={account.password}
                onChange={(e) => setAccount((a) => ({ ...a, password: e.target.value }))}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                enterKeyHint="go"
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
            disabled={!canStart || loading || fetchStatus === "fetching"}
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

      {stage === "verify" && (
        <form onSubmit={verify} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Verification code</Label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="code"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                enterKeyHint="go"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
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
                setStage("account");
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

      {stage === "questionnaire" && !questionnaireDone && (
        <CompanyProfileForm
          onSubmitted={goToWorkspace}
          onSkipped={goToWorkspace}
          submitLabel="Continue to workspace"
        />
      )}

      {stage === "questionnaire" && questionnaireDone && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your workspace…
        </div>
      )}
    </AuthLayout>
  );
}

function Stepper({ current, total }: { current: 1 | 2; total: 3 }) {
  return (
    <div className="flex items-center gap-2 mb-7">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div key={n} className="flex items-center gap-2 flex-1">
          <div
            className={cn(
              "h-7 w-7 rounded-full grid place-items-center text-xs font-medium transition-colors shrink-0",
              n < current
                ? "bg-success text-success-foreground"
                : n === current
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {n < current ? <Check className="h-3.5 w-3.5" /> : n}
          </div>
          {n !== total && (
            <div className={cn("h-px flex-1", n < current ? "bg-success" : "bg-border")} />
          )}
        </div>
      ))}
    </div>
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

function SignupSide({ stage }: { stage: Stage }) {
  const steps: { k: string; d: string; matches: Stage[] }[] = [
    {
      k: "Create account",
      d: "Name, email, password. Nothing else — we'll figure out the rest together.",
      matches: ["account", "verify"],
    },
    {
      k: "Tell us about your company",
      d: "One quick optional questionnaire — earn double voting power. Asked only once.",
      matches: ["questionnaire"],
    },
    {
      k: "Build your workspace",
      d: "Pick a role, name your demo workspace, and you're in.",
      matches: [],
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
          const active = s.matches.includes(stage);
          // anything strictly before the active step is "done"
          const activeIdx = steps.findIndex((x) => x.matches.includes(stage));
          const done = activeIdx >= 0 && i < activeIdx;
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
                {done ? <Check className="h-4 w-4" /> : i + 1}
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
