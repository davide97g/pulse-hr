import { useEffect, useRef, useState, type ReactNode } from "react";
import confetti from "canvas-confetti";
import { startHealthPolling, hasBooted, markBootComplete } from "@/lib/server-wake";
import { useOfflineMode } from "@/lib/offline-mode";
import { ParticleField } from "./ParticleField";
import { Button } from "@/components/ui/button";

type Phase = "warm" | "waking" | "error";

const GRACE_MS = 2000;

export function ServerBoot({ children }: { children: ReactNode }) {
  const alreadyBooted = useRef(hasBooted());
  const [phase, setPhase] = useState<Phase>(() => (alreadyBooted.current ? "warm" : "warm"));
  const [attempt, setAttempt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const { enable: enableOffline } = useOfflineMode();

  useEffect(() => {
    if (alreadyBooted.current) return;

    let showTimer: ReturnType<typeof setTimeout> | null = null;
    let clockTimer: ReturnType<typeof setInterval> | null = null;
    let showed = false;
    const start = Date.now();

    showTimer = setTimeout(() => {
      showed = true;
      setPhase((p) => (p === "warm" ? "waking" : p));
      clockTimer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    }, GRACE_MS);

    const polling = startHealthPolling({
      onAttempt: setAttempt,
    });

    polling.promise.then((result) => {
      if (showTimer) clearTimeout(showTimer);
      if (clockTimer) clearInterval(clockTimer);
      if (result === "awake") {
        markBootComplete();
        if (showed) {
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              startVelocity: 28,
              origin: { y: 0.55 },
              colors: ["#b4ff39", "#39e1ff", "#c06bff", "#ff6b9a"],
              scalar: 0.8,
            });
          } catch {
            /* noop */
          }
        }
        setPhase("warm");
      } else if (result === "timeout") {
        setPhase("error");
      }
    });

    return () => {
      polling.stop();
      if (showTimer) clearTimeout(showTimer);
      if (clockTimer) clearInterval(clockTimer);
    };
  }, []);

  const handleRetry = () => {
    setPhase("warm");
    window.location.reload();
  };

  const handleOffline = () => {
    enableOffline();
    markBootComplete();
    setPhase("warm");
  };

  if (phase === "warm") return <>{children}</>;

  if (phase === "error") {
    return (
      <BootScreen
        variant="error"
        title="Our server is taking longer than usual"
        subtitle="It's probably still spinning up — Render free tier can be slow. You can retry or continue with an offline preview."
        meta={`Timed out after ${elapsed}s · ${attempt} attempts`}
        actions={
          <>
            <Button onClick={handleRetry} className="press-scale">
              Retry now
            </Button>
            <Button variant="outline" onClick={handleOffline} className="press-scale">
              Continue offline
            </Button>
            <a
              className="text-xs text-muted-foreground hover:underline font-mono"
              href="https://status.pulsehr.it"
              target="_blank"
              rel="noreferrer"
            >
              status.pulsehr.it ↗
            </a>
          </>
        }
      />
    );
  }

  return (
    <BootScreen
      variant="waking"
      title="Waking up your workspace"
      subtitle="Our server was sleeping — free-tier cold starts usually take 20–40 seconds. Hang tight."
      meta={`${elapsed}s · attempt ${attempt}`}
      actions={
        <Button variant="ghost" onClick={handleOffline} className="press-scale text-xs">
          Skip & use offline preview
        </Button>
      }
    />
  );
}

function BootScreen({
  variant,
  title,
  subtitle,
  meta,
  actions,
}: {
  variant: "waking" | "error";
  title: string;
  subtitle: string;
  meta: string;
  actions: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden">
      <div className="absolute inset-0">
        <ParticleField variant={variant} density="normal" size="full" />
      </div>
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-4 px-6 text-center fade-in">
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-full blur-2xl opacity-60"
            style={{
              background:
                variant === "error"
                  ? "radial-gradient(circle, var(--destructive, #ff6b9a) 0%, transparent 70%)"
                  : "radial-gradient(circle, var(--labs, #b4ff39) 0%, transparent 70%)",
            }}
          />
          <div className="relative h-14 w-14 rounded-2xl border bg-card shadow-card flex items-center justify-center pop-in">
            <div
              className={
                variant === "waking"
                  ? "pulse-dot h-2.5 w-2.5 rounded-full bg-[color:var(--labs,#b4ff39)]"
                  : "h-2.5 w-2.5 rounded-full bg-destructive"
              }
            />
          </div>
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground max-w-sm">{subtitle}</p>
        <p className="font-mono text-[11px] text-muted-foreground/80">{meta}</p>
        <div className="mt-2 flex flex-col items-center gap-2">{actions}</div>
      </div>
    </div>
  );
}
