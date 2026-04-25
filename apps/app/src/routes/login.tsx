import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useClerk, useSignIn } from "@clerk/react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { AuthLayout } from "@/components/app/AuthLayout";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): { redirect_url?: string } => {
    const v = typeof s.redirect_url === "string" ? s.redirect_url : undefined;
    return v !== undefined ? { redirect_url: v } : {};
  },
  component: Login,
});

const FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL ?? "https://feedback.pulsehr.it";

function safeRedirectUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const target = new URL(raw);
    const allowed = new URL(FEEDBACK_URL);
    if (target.origin === allowed.origin) return target.toString();
  } catch {
    return null;
  }
  return null;
}

type SecondFactorStrategy = "totp" | "backup_code" | "phone_code" | "email_code";

type Stage =
  | { kind: "credentials" }
  | { kind: "trust" }
  | { kind: "mfa-pick"; strategies: SecondFactorStrategy[] }
  | { kind: "mfa-code"; strategy: SecondFactorStrategy; safeIdentifier?: string };

const STRATEGY_META: Record<
  SecondFactorStrategy,
  { label: string; description: string; icon: typeof KeyRound; requiresSend: boolean }
> = {
  totp: {
    label: "Authenticator app",
    description: "Use the 6-digit code from your authenticator app.",
    icon: KeyRound,
    requiresSend: false,
  },
  phone_code: {
    label: "SMS code",
    description: "We'll text a 6-digit code to your phone.",
    icon: Smartphone,
    requiresSend: true,
  },
  email_code: {
    label: "Email code",
    description: "We'll email a 6-digit code.",
    icon: Mail,
    requiresSend: true,
  },
  backup_code: {
    label: "Backup code",
    description: "Use one of the backup codes you saved during setup.",
    icon: MessageSquare,
    requiresSend: false,
  },
};

function pickPreferred(strategies: SecondFactorStrategy[]): SecondFactorStrategy | null {
  const order: SecondFactorStrategy[] = ["totp", "phone_code", "email_code", "backup_code"];
  for (const s of order) if (strategies.includes(s)) return s;
  return strategies[0] ?? null;
}

function Login() {
  const nav = useNavigate();
  const clerk = useClerk();
  const { signIn, fetchStatus } = useSignIn();
  const search = Route.useSearch();
  const redirectUrl = safeRedirectUrl(search.redirect_url);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<Stage>({ kind: "credentials" });
  const [code, setCode] = useState("");

  const goPostLogin = () => {
    if (redirectUrl) {
      window.location.assign(redirectUrl);
    } else {
      nav({ to: "/" });
    }
  };

  const finalizeAndGo = async () => {
    const fin = await signIn.finalize();
    if (fin.error) {
      toast.error("Couldn't activate session", { description: fin.error.message });
      return false;
    }
    toast.success("Welcome back", { description: "Redirecting…" });
    goPostLogin();
    return true;
  };

  const sendTrustCode = async () => {
    const send = await signIn.emailCode.sendCode();
    if (send.error) {
      toast.error("Couldn't send verification code", { description: send.error.message });
      return false;
    }
    toast("New device — check your email", {
      description: `We sent a 6-digit code to ${signIn.identifier ?? email}.`,
      icon: <ShieldCheck className="h-4 w-4" />,
    });
    return true;
  };

  const collectSecondFactorStrategies = (): SecondFactorStrategy[] => {
    const supported = signIn.supportedSecondFactors ?? [];
    const out: SecondFactorStrategy[] = [];
    for (const f of supported) {
      const s = f.strategy;
      if (s === "totp" || s === "backup_code" || s === "phone_code" || s === "email_code") {
        if (!out.includes(s)) out.push(s);
      }
    }
    return out;
  };

  const safeIdentifierFor = (strategy: SecondFactorStrategy): string | undefined => {
    const f = (signIn.supportedSecondFactors ?? []).find((x) => x.strategy === strategy);
    if (!f) return undefined;
    return "safeIdentifier" in f ? (f.safeIdentifier as string | undefined) : undefined;
  };

  const startStrategy = async (strategy: SecondFactorStrategy) => {
    if (loading) return;
    setLoading(true);
    setCode("");
    try {
      if (strategy === "phone_code") {
        const res = await signIn.mfa.sendPhoneCode();
        if (res.error) {
          toast.error("Couldn't send SMS", { description: res.error.message });
          return;
        }
      } else if (strategy === "email_code") {
        const res = await signIn.mfa.sendEmailCode();
        if (res.error) {
          toast.error("Couldn't send email", { description: res.error.message });
          return;
        }
      }
      setStage({ kind: "mfa-code", strategy, safeIdentifier: safeIdentifierFor(strategy) });
    } finally {
      setLoading(false);
    }
  };

  const enterMfa = async () => {
    const strategies = collectSecondFactorStrategies();
    if (strategies.length === 0) {
      toast.error("Two-factor required, no supported method available", {
        description: "Sign in via clerk.com to manage your factors.",
      });
      return;
    }
    if (strategies.length === 1) {
      await startStrategy(strategies[0]);
      return;
    }
    const preferred = pickPreferred(strategies);
    // If the preferred is non-send (totp/backup), jump straight in.
    if (preferred && !STRATEGY_META[preferred].requiresSend) {
      setStage({
        kind: "mfa-code",
        strategy: preferred,
        safeIdentifier: safeIdentifierFor(preferred),
      });
      return;
    }
    setStage({ kind: "mfa-pick", strategies });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await signIn.reset();
      const { error } = await signIn.password({ identifier: email, password });
      if (error) {
        toast.error("Couldn't sign you in", { description: error.message ?? "Check credentials" });
        return;
      }
      if (signIn.existingSession?.sessionId) {
        await clerk.setActive({ session: signIn.existingSession.sessionId });
        toast.success("Welcome back", { description: "Redirecting…" });
        goPostLogin();
        return;
      }
      if (signIn.status === "complete") {
        await finalizeAndGo();
        return;
      }
      if (signIn.status === "needs_client_trust") {
        const ok = await sendTrustCode();
        if (ok) setStage({ kind: "trust" });
        return;
      }
      if (signIn.status === "needs_second_factor") {
        await enterMfa();
        return;
      }
      if (signIn.status === "needs_first_factor") {
        toast.error("Extra verification required", {
          description: "This account requires a step we don't yet support — sign in via clerk.com.",
        });
        return;
      }
      toast("Additional step required", { description: signIn.status ?? "Retry" });
    } finally {
      setLoading(false);
    }
  };

  const verifyTrust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || code.length < 6) return;
    setLoading(true);
    try {
      const { error } = await signIn.emailCode.verifyCode({ code });
      if (error) {
        toast.error("Invalid code", { description: error.message ?? "Try again" });
        return;
      }
      if (signIn.existingSession?.sessionId) {
        await clerk.setActive({ session: signIn.existingSession.sessionId });
        toast.success("Device verified", { description: "Redirecting…" });
        goPostLogin();
        return;
      }
      if (signIn.status === "complete") {
        await finalizeAndGo();
        return;
      }
      if (signIn.status === "needs_second_factor") {
        await enterMfa();
        return;
      }
      toast("Additional step required", { description: signIn.status ?? "Retry" });
    } finally {
      setLoading(false);
    }
  };

  const verifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (stage.kind !== "mfa-code") return;
    const minLen = stage.strategy === "backup_code" ? 4 : 6;
    if (code.length < minLen) return;
    setLoading(true);
    try {
      const params = { code };
      const res =
        stage.strategy === "totp"
          ? await signIn.mfa.verifyTOTP(params)
          : stage.strategy === "backup_code"
            ? await signIn.mfa.verifyBackupCode(params)
            : stage.strategy === "phone_code"
              ? await signIn.mfa.verifyPhoneCode(params)
              : await signIn.mfa.verifyEmailCode(params);
      if (res.error) {
        toast.error("Invalid code", { description: res.error.message ?? "Try again" });
        return;
      }
      if (signIn.existingSession?.sessionId) {
        await clerk.setActive({ session: signIn.existingSession.sessionId });
        toast.success("Welcome back", { description: "Redirecting…" });
        goPostLogin();
        return;
      }
      if (signIn.status === "complete") {
        await finalizeAndGo();
        return;
      }
      toast("Additional step required", { description: signIn.status ?? "Retry" });
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (stage.kind !== "mfa-code") return;
    if (!STRATEGY_META[stage.strategy].requiresSend) {
      toast("This factor doesn't need a resend — use your authenticator app.");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res =
        stage.strategy === "phone_code"
          ? await signIn.mfa.sendPhoneCode()
          : await signIn.mfa.sendEmailCode();
      if (res.error) toast.error("Couldn't resend", { description: res.error.message });
      else toast("New code sent");
    } finally {
      setLoading(false);
    }
  };

  const resendTrust = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await sendTrustCode();
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────
  const title =
    stage.kind === "trust"
      ? "Verify this device."
      : stage.kind === "mfa-pick"
        ? "Two-factor authentication."
        : stage.kind === "mfa-code"
          ? STRATEGY_META[stage.strategy].label
          : "Welcome back.";

  const subtitle =
    stage.kind === "trust"
      ? `New device detected. We sent a 6-digit code to ${signIn.identifier ?? email}.`
      : stage.kind === "mfa-pick"
        ? "Pick a verification method to continue."
        : stage.kind === "mfa-code"
          ? stage.strategy === "totp"
            ? "Open your authenticator app and enter the 6-digit code."
            : stage.strategy === "backup_code"
              ? "Enter one of the backup codes you saved."
              : `We sent a 6-digit code to ${stage.safeIdentifier ?? "your device"}.`
          : "Sign in to your Pulse HR workspace.";

  return (
    <AuthLayout
      title={title}
      subtitle={subtitle}
      footer={
        stage.kind === "credentials" ? (
          <>
            New to Pulse HR?{" "}
            <Link to="/signup" className="text-foreground font-medium hover:underline">
              Create an account →
            </Link>
          </>
        ) : undefined
      }
    >
      {stage.kind === "credentials" && (
        <form onSubmit={submit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9"
                autoComplete="email"
                placeholder="you@company.co"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={() => toast("Use the 'Forgot?' flow on clerk.com reset page")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 pr-9"
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <span>Remember this device for 30 days</span>
          </label>

          <Button
            type="submit"
            disabled={loading || fetchStatus === "fetching"}
            className="w-full h-11 press-scale"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in <ArrowRight className="h-4 w-4 ml-1.5" />
              </>
            )}
          </Button>
        </form>
      )}

      {stage.kind === "trust" && (
        <form onSubmit={verifyTrust} className="space-y-4 mt-2">
          <CodeField
            id="trust-code"
            value={code}
            onChange={setCode}
            placeholder="123456"
            maxLen={6}
            digitsOnly
          />
          <button
            type="button"
            onClick={resendTrust}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Resend code
          </button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="press-scale"
              disabled={loading}
              onClick={() => {
                setCode("");
                setStage({ kind: "credentials" });
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={code.length < 6 || loading || fetchStatus === "fetching"}
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

      {stage.kind === "mfa-pick" && (
        <div className="space-y-3 mt-2">
          {stage.strategies.map((s) => {
            const meta = STRATEGY_META[s];
            const Icon = meta.icon;
            return (
              <button
                key={s}
                type="button"
                disabled={loading}
                onClick={() => startStrategy(s)}
                className={cn(
                  "w-full p-4 rounded-md border text-left press-scale transition-colors flex items-start gap-3",
                  "hover:bg-muted/40 disabled:opacity-50",
                )}
              >
                <Icon className="h-5 w-5 mt-0.5 text-primary" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{meta.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{meta.description}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5" />
              </button>
            );
          })}
          <Button
            type="button"
            variant="outline"
            className="w-full press-scale"
            disabled={loading}
            onClick={() => setStage({ kind: "credentials" })}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to sign in
          </Button>
        </div>
      )}

      {stage.kind === "mfa-code" && (
        <form onSubmit={verifyMfa} className="space-y-4 mt-2">
          <CodeField
            id="mfa-code"
            value={code}
            onChange={setCode}
            placeholder={stage.strategy === "backup_code" ? "abcd-efgh" : "123456"}
            maxLen={stage.strategy === "backup_code" ? 12 : 6}
            digitsOnly={stage.strategy !== "backup_code"}
          />
          {STRATEGY_META[stage.strategy].requiresSend && (
            <button
              type="button"
              onClick={resend}
              disabled={loading}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Resend code
            </button>
          )}
          {collectSecondFactorStrategies().length > 1 && (
            <button
              type="button"
              onClick={() => setStage({ kind: "mfa-pick", strategies: collectSecondFactorStrategies() })}
              disabled={loading}
              className="text-xs text-muted-foreground hover:text-foreground block"
            >
              Use another method
            </button>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="press-scale"
              disabled={loading}
              onClick={() => {
                setCode("");
                setStage({ kind: "credentials" });
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={
                code.length < (stage.strategy === "backup_code" ? 4 : 6) ||
                loading ||
                fetchStatus === "fetching"
              }
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

      <p className="text-[11px] text-muted-foreground text-center mt-5">
        By continuing you agree to our{" "}
        <a href="#" className="underline underline-offset-2">
          Terms
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-2">
          Privacy Policy
        </a>
        .
      </p>
      <p className="text-[10px] text-muted-foreground/60 text-center mt-2 font-mono tabular-nums">
        v{APP_VERSION}
      </p>
    </AuthLayout>
  );
}

function CodeField({
  id,
  value,
  onChange,
  placeholder,
  maxLen,
  digitsOnly,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  maxLen: number;
  digitsOnly: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>Code</Label>
      <div className="relative">
        <KeyRound className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          inputMode={digitsOnly ? "numeric" : "text"}
          autoComplete="one-time-code"
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            const cleaned = digitsOnly ? raw.replace(/\D/g, "") : raw.replace(/\s+/g, "");
            onChange(cleaned.slice(0, maxLen));
          }}
          placeholder={placeholder}
          autoFocus
          className="pl-9 tracking-[0.4em] font-mono"
        />
      </div>
    </div>
  );
}
