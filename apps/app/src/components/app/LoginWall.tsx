/**
 * LoginWall — global modal that fronts auth-only features (commenting,
 * feedback, voting). The app itself is open to anonymous demo visitors;
 * any contribution flow that would write to the real backend funnels
 * through `useLoginWall().require(reason)` so we can explain the gate
 * and bounce them to /login.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, MessageSquarePlus, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pulse-hr/ui/primitives/dialog";
import { Button } from "@pulse-hr/ui/primitives/button";

export type LoginWallReason = "comment" | "feedback" | "vote" | "generic";

const COPY: Record<LoginWallReason, { title: string; description: string }> = {
  comment: {
    title: "Comments are members-only",
    description:
      "Pulse is a public demo so anyone can poke around the product. To leave a comment for the team — even on the demo data — you need a free account. It takes a minute and your feedback goes straight to the maintainers.",
  },
  feedback: {
    title: "Sign in to share feedback",
    description:
      "The feedback board is where we triage every idea, bug and roast. We tie posts to an account so we can follow up with you, weigh votes and avoid spam.",
  },
  vote: {
    title: "Sign in to vote",
    description:
      "Voting power scales with how much feedback you've shared. Sign in to claim yours and weigh which Labs features ship next.",
  },
  generic: {
    title: "Sign in to continue",
    description:
      "Pulse HR is open for browsing in demo mode, but this action talks to the real backend. Sign in (or create a free account) to continue.",
  },
};

type LoginWallContextValue = {
  require: (reason?: LoginWallReason) => void;
};

const LoginWallContext = createContext<LoginWallContextValue | null>(null);

export function useLoginWall(): LoginWallContextValue {
  const ctx = useContext(LoginWallContext);
  if (!ctx) throw new Error("useLoginWall must be used inside <LoginWallProvider>");
  return ctx;
}

export function LoginWallProvider({ children }: { children: ReactNode }) {
  const [reason, setReason] = useState<LoginWallReason | null>(null);
  const navigate = useNavigate();

  const require = useCallback((next: LoginWallReason = "generic") => {
    setReason(next);
  }, []);

  const close = useCallback(() => setReason(null), []);

  const goLogin = useCallback(() => {
    setReason(null);
    navigate({ to: "/login", search: {} });
  }, [navigate]);

  const goSignup = useCallback(() => {
    setReason(null);
    navigate({ to: "/signup" });
  }, [navigate]);

  const value = useMemo<LoginWallContextValue>(() => ({ require }), [require]);
  const copy = reason ? COPY[reason] : null;

  return (
    <LoginWallContext.Provider value={value}>
      {children}
      <Dialog open={reason !== null} onOpenChange={(o) => (o ? null : close())}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto sm:mx-0 mb-2 h-10 w-10 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
              {reason === "comment" ? (
                <MessageSquarePlus className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            <DialogTitle>{copy?.title ?? "Sign in"}</DialogTitle>
            <DialogDescription>{copy?.description}</DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-medium">Heads up</strong> — Pulse is currently a
            frontend-only mock. The whole product runs in your browser; the only thing the backend
            actually stores is your feedback. That's the part that needs an account.
          </div>
          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="ghost" onClick={close} type="button">
              Keep exploring
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={goSignup} type="button">
                Create account
              </Button>
              <Button onClick={goLogin} type="button" className="press-scale">
                Sign in
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LoginWallContext.Provider>
  );
}
