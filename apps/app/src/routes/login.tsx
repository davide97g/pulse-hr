import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
  const [email, setEmail] = useState("alex@acme.co");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Welcome back, Alex", { description: "Redirecting to dashboard…" });
      setLoading(false);
      nav({ to: "/" });
    }, 900);
  };

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Sign in to your Pulse HR workspace."
      footer={
        <>New to Pulse HR? <Link to="/signup" className="text-foreground font-medium hover:underline">Create an account →</Link></>
      }
    >
      <div className="grid grid-cols-2 gap-2 mb-5">
        <button
          onClick={() => toast.success("Signing in with Google…")}
          className="h-10 rounded-md border bg-card hover:bg-muted press-scale flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
          <GoogleIcon />Google
        </button>
        <button
          onClick={() => toast.success("Signing in with SSO…")}
          className="h-10 rounded-md border bg-card hover:bg-muted press-scale flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
          <Lock className="h-4 w-4" />SSO
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="bg-background px-3">or continue with email</span>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <div className="relative">
            <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="pl-9" autoComplete="email" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button type="button" onClick={() => toast("Password reset email sent")} className="text-xs text-muted-foreground hover:text-foreground">Forgot?</button>
          </div>
          <div className="relative">
            <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password" type={show ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)} required className="pl-9 pr-9"
              autoComplete="current-password" placeholder="••••••••"
            />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="h-4 w-4 rounded border-border" />
          <span>Remember this device for 30 days</span>
        </label>

        <Button type="submit" disabled={loading} className="w-full h-11 press-scale">
          {loading
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in…</>
            : <>Sign in <ArrowRight className="h-4 w-4 ml-1.5" /></>}
        </Button>
      </form>

      <p className="text-[11px] text-muted-foreground text-center mt-5">
        By continuing you agree to our <a href="#" className="underline underline-offset-2">Terms</a> and <a href="#" className="underline underline-offset-2">Privacy Policy</a>.
      </p>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 8 3l5.7-5.7C33.6 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.1 8 3l5.7-5.7C33.6 6.1 29 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5 0 9.5-1.9 12.9-5l-6-4.9c-2 1.3-4.4 2-6.9 2-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 40 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6 4.9c-.4.4 6.5-4.7 6.5-14.5 0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
