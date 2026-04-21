import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTour, markTourCompleted, type Tour, type TourStep } from "@/lib/tours";

type TourCtx = {
  activeTour: Tour | null;
  stepIndex: number;
  start: (tourId: string) => void;
  stop: (opts?: { completed?: boolean }) => void;
  next: () => void;
  prev: () => void;
};

const Ctx = createContext<TourCtx | null>(null);

export function useTour(): TourCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTour must be used inside <TourProvider>");
  return ctx;
}

type Rect = { top: number; left: number; width: number; height: number };

const PADDING = 8;
const CARD_WIDTH = 340;
const CARD_GAP = 14;

export function TourProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const activeTour = useMemo(() => (activeId ? (getTour(activeId) ?? null) : null), [activeId]);
  const step: TourStep | null = activeTour?.steps[stepIndex] ?? null;

  const start = useCallback(
    (tourId: string) => {
      const t = getTour(tourId);
      if (!t) return;
      setActiveId(tourId);
      setStepIndex(0);
      if (t.steps[0]?.route) {
        navigate({ to: t.steps[0].route });
      }
    },
    [navigate],
  );

  const stop = useCallback(
    (opts?: { completed?: boolean }) => {
      if (opts?.completed && activeId) markTourCompleted(activeId);
      setActiveId(null);
      setStepIndex(0);
    },
    [activeId],
  );

  const next = useCallback(() => {
    if (!activeTour) return;
    const nextIdx = stepIndex + 1;
    if (nextIdx >= activeTour.steps.length) {
      stop({ completed: true });
      return;
    }
    const nextStep = activeTour.steps[nextIdx];
    if (nextStep.route) navigate({ to: nextStep.route });
    setStepIndex(nextIdx);
  }, [activeTour, stepIndex, stop, navigate]);

  const prev = useCallback(() => {
    if (!activeTour || stepIndex === 0) return;
    const prevIdx = stepIndex - 1;
    const prevStep = activeTour.steps[prevIdx];
    if (prevStep.route) navigate({ to: prevStep.route });
    setStepIndex(prevIdx);
  }, [activeTour, stepIndex, navigate]);

  useEffect(() => {
    if (!activeTour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        stop();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTour, next, prev, stop]);

  const value = useMemo(
    () => ({ activeTour, stepIndex, start, stop, next, prev }),
    [activeTour, stepIndex, start, stop, next, prev],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {activeTour && step && <TourOverlay tour={activeTour} step={step} stepIndex={stepIndex} />}
    </Ctx.Provider>
  );
}

function TourOverlay({ tour, step, stepIndex }: { tour: Tour; step: TourStep; stepIndex: number }) {
  const { next, prev, stop } = useTour();
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1024,
    h: typeof window !== "undefined" ? window.innerHeight : 768,
  });
  useEffect(() => {
    if (!step.target) {
      setRect(null);
      return;
    }
    // Poll for up to ~3s so skeleton-loading routes (~420ms) have time to
    // mount their real targets.
    let tries = 0;
    let timer = 0;
    const locate = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        return;
      }
      if (tries++ < 60) {
        timer = window.setTimeout(locate, 50);
      } else {
        setRect(null);
      }
    };
    locate();
    return () => window.clearTimeout(timer);
  }, [step.target, stepIndex]);

  useEffect(() => {
    if (!step.target) return;
    const onResize = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [step.target]);

  const total = tour.steps.length;
  const isLast = stepIndex === total - 1;
  const isCentered = !rect;

  const cardPos = useMemo(() => {
    if (!rect) {
      return {
        top: viewport.h / 2 - 120,
        left: viewport.w / 2 - CARD_WIDTH / 2,
      };
    }
    const placement = step.placement ?? "auto";
    // Prefer bottom; fall back to top; clamp inside viewport.
    const tryBottom = rect.top + rect.height + CARD_GAP;
    const tryTop = rect.top - CARD_GAP - 180;
    let top = tryBottom;
    if (
      placement === "top" ||
      (placement !== "bottom" && tryBottom + 180 > viewport.h && tryTop > 16)
    ) {
      top = tryTop;
    }
    let left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    if (placement === "right") left = rect.left + rect.width + CARD_GAP;
    if (placement === "left") left = rect.left - CARD_WIDTH - CARD_GAP;
    left = Math.max(12, Math.min(left, viewport.w - CARD_WIDTH - 12));
    top = Math.max(12, Math.min(top, viewport.h - 200));
    return { top, left };
  }, [rect, viewport, step.placement]);

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Backdrop with a cut-out spotlight */}
      <div className="absolute inset-0 pointer-events-auto" onClick={() => stop()}>
        <svg className="absolute inset-0 w-full h-full" aria-hidden>
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left - PADDING}
                  y={rect.top - PADDING}
                  width={rect.width + PADDING * 2}
                  height={rect.height + PADDING * 2}
                  rx={10}
                  ry={10}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="oklch(0.15 0.02 260 / 0.55)"
            mask="url(#tour-mask)"
          />
        </svg>
      </div>

      {/* Spotlight ring */}
      {rect && (
        <div
          className="absolute rounded-[10px] ring-2 ring-primary/90 pointer-events-none pop-in"
          style={{
            top: rect.top - PADDING,
            left: rect.left - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
            boxShadow:
              "0 0 0 9999px transparent, 0 0 24px 4px color-mix(in oklch, var(--primary) 45%, transparent)",
          }}
        />
      )}

      {/* Step card */}
      <div
        className={cn(
          "absolute pointer-events-auto rounded-xl border bg-popover text-popover-foreground shadow-pop pop-in",
          isCentered && "max-w-[92vw]",
        )}
        style={{ top: cardPos.top, left: cardPos.left, width: CARD_WIDTH }}
        role="dialog"
        aria-labelledby="tour-title"
      >
        <div className="flex items-start justify-between gap-2 px-4 pt-3.5 pb-1">
          <div className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
            {tour.name} · {stepIndex + 1}/{total}
          </div>
          <button
            onClick={() => stop()}
            className="h-6 w-6 -mr-1 -mt-0.5 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground"
            aria-label="Close tour"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div id="tour-title" className="font-semibold text-[15px] leading-tight">
            {step.title}
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{step.body}</p>
          {step.docHref && (
            <Link
              to={step.docHref}
              onClick={() => stop()}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Read the docs
            </Link>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-1 border-t mt-1">
          <div className="flex items-center gap-1">
            {tour.steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === stepIndex ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {stepIndex > 0 && (
              <Button variant="ghost" size="sm" onClick={prev} className="h-8 px-2 text-xs">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={next} className="h-8 px-3 text-xs">
              {isLast ? "Finish" : "Next"}
              {!isLast && <ArrowRight className="h-3.5 w-3.5 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
