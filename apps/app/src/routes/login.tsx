import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useClerk, useSignIn } from "@clerk/react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { AuthLayout } from "@/components/app/AuthLayout";

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

type Stage = "credentials" | "trust";

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
  const [stage, setStage] = useState<Stage>("credentials");
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
      // New-device challenge — Clerk's Client Trust upgrade replaces the
      // previous needs_second_factor behaviour for accounts without MFA.
      if (signIn.status === "needs_client_trust") {
        const ok = await sendTrustCode();
        if (ok) setStage("trust");
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
      toast("Additional step required", { description: signIn.status ?? "Retry" });
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

  return (
    <AuthLayout
      title={stage === "trust" ? "Verify this device." : "Welcome back."}
      subtitle={
        stage === "trust"
          ? `New device detected. We sent a 6-digit code to ${signIn.identifier ?? email}.`
          : "Sign in to your Pulse HR workspace."
      }
      footer={
        stage === "credentials" ? (
          <>
            New to Pulse HR?{" "}
            <Link to="/signup" className="text-foreground font-medium hover:underline">
              Create an account →
            </Link>
          </>
        ) : undefined
      }
    >
      {stage === "credentials" && (
        <form onSubmit={submit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9"
                autoComplete="username"
                inputMode="email"
                enterKeyHint="next"
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
                name="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 pr-9"
                autoComplete="current-password"
                enterKeyHint="go"
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

      {stage === "trust" && (
        <form onSubmit={verifyTrust} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="trust-code">Verification code</Label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="trust-code"
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
              onClick={resendTrust}
              disabled={loading}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Resend code
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="press-scale"
              disabled={loading}
              onClick={() => {
                setCode("");
                setStage("credentials");
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
    </AuthLayout>
  );
}
