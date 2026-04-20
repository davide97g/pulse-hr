import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useClerk, useSignIn } from "@clerk/react";
import { ArrowRight, Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/app/AuthLayout";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Pulse HR" }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const clerk = useClerk();
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

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
        toast.success("Welcome back", { description: "Redirecting to dashboard…" });
        nav({ to: "/" });
        return;
      }
      if (signIn.status === "complete") {
        const fin = await signIn.finalize();
        if (fin.error) {
          toast.error("Couldn't activate session", { description: fin.error.message });
          return;
        }
        toast.success("Welcome back", { description: "Redirecting to dashboard…" });
        nav({ to: "/" });
        return;
      }
      toast("Additional step required", { description: signIn.status ?? "Retry" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Sign in to your Pulse HR workspace."
      footer={
        <>
          New to Pulse HR?{" "}
          <Link to="/signup" className="text-foreground font-medium hover:underline">
            Create an account →
          </Link>
        </>
      }
    >
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
