import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "../../lib/api-client";

const APP_URL = import.meta.env.VITE_APP_URL ?? "https://app.pulsehr.it";

function buildLoginUrl(): string {
  const redirect = encodeURIComponent(window.location.href);
  return `${APP_URL}/login?redirect_url=${redirect}`;
}

type PublicStats = {
  proposals: number;
  votesThisWeek: number;
  shipped: number;
};

/** Pretty-print a vote count: 1234 → "1.2K", 980 → "980". */
function formatVotes(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 10 ? k.toFixed(0) : k.toFixed(1)}K`;
}

function usePublicStats(): PublicStats | null {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    apiFetch("/public/feedback-stats", { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PublicStats | null) => {
        if (data) setStats(data);
      })
      .catch(() => {
        // Silent fail — footer just stays in placeholder state.
      });
    return () => ctrl.abort();
  }, []);

  return stats;
}

type Drift = 1 | 2 | 3 | 4 | 5 | 6;
const FLOATS: {
  x: string;
  y: string;
  w: number;
  rot: number;
  body: string;
  kind: "IDEA" | "COMMENT" | "IMPROVEMENT";
  votes: number;
  drift: Drift;
  dur: number;
  delay: number;
}[] = [
  { x: "3%",  y: "12%", w: 220, rot: -4, body: "add a calendar view dedicated to holiday coverage", kind: "IDEA",        votes: 24, drift: 1, dur: 22, delay: 0 },
  { x: "76%", y: "10%", w: 250, rot: 3,  body: "/reports — this does not make any sense to me",     kind: "COMMENT",     votes: 7,  drift: 2, dur: 26, delay: -4 },
  { x: "4%",  y: "60%", w: 240, rot: 5,  body: "approve button should be primary lime green",       kind: "IMPROVEMENT", votes: 12, drift: 3, dur: 30, delay: -9 },
  { x: "78%", y: "58%", w: 210, rot: -6, body: "org chart is missing — make it",                    kind: "IDEA",        votes: 31, drift: 4, dur: 24, delay: -2 },
  { x: "14%", y: "38%", w: 180, rot: 8,  body: "/people/e11",                                       kind: "COMMENT",     votes: 2,  drift: 5, dur: 28, delay: -12 },
  { x: "86%", y: "39%", w: 170, rot: -3, body: 'unify "/calendar" route',                           kind: "IDEA",        votes: 5,  drift: 6, dur: 32, delay: -6 },
  { x: "32%", y: "6%",  w: 190, rot: -7, body: "dark mode for the printable payslip pls",           kind: "IMPROVEMENT", votes: 9,  drift: 2, dur: 34, delay: -14 },
  { x: "62%", y: "82%", w: 200, rot: 6,  body: "kudos: marta carried Q3 retro",                     kind: "COMMENT",     votes: 18, drift: 3, dur: 27, delay: -7 },
  { x: "8%",  y: "84%", w: 175, rot: -8, body: "saturation heatmap should warn at 90%",             kind: "IDEA",        votes: 14, drift: 1, dur: 29, delay: -11 },
  { x: "88%", y: "82%", w: 165, rot: 4,  body: "/log ⌘⏎ does not always publish",                   kind: "COMMENT",     votes: 3,  drift: 5, dur: 25, delay: -3 },
  { x: "44%", y: "88%", w: 215, rot: -2, body: "expose growth challenges API to managers",          kind: "IDEA",        votes: 22, drift: 4, dur: 31, delay: -16 },
  { x: "50%", y: "2%",  w: 195, rot: 5,  body: "moments ticker is too fast on 4k",                  kind: "IMPROVEMENT", votes: 6,  drift: 6, dur: 33, delay: -5 },
];

const KIND_BG: Record<string, { bg: string; fg: string }> = {
  IDEA: { bg: "rgba(180,255,57,.18)", fg: "var(--spark)" },
  IMPROVEMENT: { bg: "rgba(180,255,57,.10)", fg: "var(--spark)" },
  COMMENT: { bg: "rgba(96,165,250,.15)", fg: "#93c5fd" },
};

export function SignedOutGate() {
  const onSignIn = () => window.location.assign(buildLoginUrl());
  const stats = usePublicStats();

  return (
    <div className="room-dark relative min-h-dvh md:overflow-hidden bg-[#0a0907] text-[var(--paper)] flex flex-col pl-safe pr-safe">
      {/* Top bar */}
      <div className="md:absolute md:inset-x-0 md:top-0 md:h-16 md:px-7 md:z-10 px-4 z-30 sticky top-0 pt-safe flex items-center justify-between border-b border-white/5 bg-[#0a0907]/90 backdrop-blur-md">
        <div className="h-14 md:h-16 flex items-center gap-3 md:gap-3.5 min-w-0">
          <a
            href={APP_URL}
            className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase font-mono text-white/55 hover:text-white tap-target no-tap-highlight h-9"
          >
            <ArrowLeft className="h-3 w-3 shrink-0" />
            <span className="hidden sm:inline">Open app</span>
          </a>
          <span className="h-4 w-px bg-white/10 hidden sm:block" />
          <div
            className="flex items-baseline gap-1.5 min-w-0"
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontWeight: 500,
              letterSpacing: "-0.04em",
              fontSize: 22,
              lineHeight: 1,
            }}
            aria-label="Pulse Feedback"
          >
            <span>pulse</span>
            <span style={{ fontStyle: "normal", fontWeight: 400 }}>·</span>
            <span className="text-[var(--spark)]">feedback</span>
            <span className="ml-1.5 hidden sm:inline px-1.5 py-0.5 rounded-full bg-[var(--spark)]/12 text-[var(--spark)] font-mono text-[9px] tracking-[0.12em] uppercase font-semibold not-italic">
              Labs · Beta
            </span>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase font-mono text-white/40">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-[var(--spark)]/80 pulse-soft"
            style={{ boxShadow: "0 0 8px var(--spark)" }}
          />
          not signed in
        </span>
      </div>

      {/* Drifting background wall */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-55 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(60% 80% at 20% 10%, color-mix(in oklch, var(--spark) 12%, transparent) 0%, transparent 60%), radial-gradient(40% 60% at 90% 90%, color-mix(in oklch, var(--spark) 8%, transparent) 0%, transparent 60%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 hidden md:block opacity-90 pointer-events-none">
        {FLOATS.map((f, i) => {
          const k = KIND_BG[f.kind];
          return (
            <div
              key={i}
              className="absolute will-change-transform feedback-drift"
              style={{
                left: f.x,
                top: f.y,
                animationName: `feedback-drift-${f.drift}`,
                animationDuration: `${f.dur}s`,
                animationDelay: `${f.delay}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
              }}
            >
              <div
                className="rounded-2xl border p-3.5 backdrop-blur-md shadow-[0_24px_60px_-20px_rgba(0,0,0,.6)]"
                style={{
                  width: f.w,
                  transform: `rotate(${f.rot}deg)`,
                  background: "rgba(20,18,14,.7)",
                  borderColor: "rgba(255,255,255,.08)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-1.5 py-0.5 rounded-full font-mono text-[9px] tracking-[0.1em] font-semibold"
                    style={{ background: k.bg, color: k.fg }}
                  >
                    {f.kind}
                  </span>
                  <span className="font-mono text-[9px] text-white/45">▲ {f.votes}</span>
                </div>
                <div className="text-[12px] leading-snug text-white/80">{f.body}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Center modal — flows in document on mobile, absolute-centered on md+ */}
      <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20 w-full md:w-[min(520px,92vw)] mx-auto md:mx-0 my-auto p-6 sm:p-8 md:p-12 md:rounded-3xl md:border md:border-white/8 md:backdrop-blur-2xl flex-1 md:flex-none flex flex-col justify-center"
        style={{
          background: "linear-gradient(180deg, rgba(20,18,14,.92), rgba(10,9,7,.92))",
          boxShadow:
            "0 60px 120px -20px rgba(0,0,0,.8), 0 0 0 1px rgba(180,255,57,.08)",
        }}
      >
        <div className="max-w-md mx-auto md:mx-0 w-full">
        <div className="flex items-center gap-2.5 mb-7 md:mb-9">
          <span
            className="h-2 w-2 rounded-full bg-[var(--spark)] pulse-soft"
            style={{ boxShadow: "0 0 16px var(--spark)" }}
          />
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--spark)] font-semibold">
            Feedback · Labs
          </span>
        </div>

        <h1 className="font-display font-light text-[clamp(40px,11vw,68px)] leading-[0.88] tracking-[-0.045em] mb-2">
          The wall
          <br />
          <span className="italic font-light text-[var(--spark)] tracking-[-0.05em]">
            that listens.
          </span>
        </h1>
        <p className="text-[13px] sm:text-sm md:text-[14px] leading-[1.55] text-white/60 mt-5 mb-7 md:mb-9 max-w-[380px]">
          Every pin, every proposal, every "this is broken" — collected, voted on, shipped or
          quietly killed. Sign in with your work email.
        </p>

        <button
          type="button"
          onClick={onSignIn}
          className="w-full h-[52px] rounded-xl bg-[var(--spark)] text-[#0a1400] text-sm font-bold tracking-tight press-scale flex items-center justify-center gap-2 tap-target no-tap-highlight"
          style={{ boxShadow: "0 14px 30px -10px var(--spark)" }}
        >
          Sign in →
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/8" />
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/40">
            or
          </span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        <a
          href={`${APP_URL}/signup`}
          className="block text-center h-12 rounded-xl border border-white/10 bg-white/5 text-[13px] leading-[48px] hover:bg-white/8 tap-target no-tap-highlight"
        >
          Create an account →
        </a>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="md:absolute md:inset-x-0 md:bottom-0 md:h-12 md:z-10 md:px-6 px-4 py-3 md:py-0 pb-safe border-t border-white/5 bg-black/40 flex items-center justify-center gap-3 md:gap-6 text-[9px] md:text-[10px] tracking-[0.12em] uppercase font-mono flex-wrap">
        <span className="text-white/55">
          {stats ? stats.proposals.toLocaleString("en-US") : "—"} proposals
        </span>
        <span className="text-white/15">·</span>
        <span className="text-white/55">
          {stats ? formatVotes(stats.votesThisWeek) : "—"} votes this week
        </span>
        <span className="text-white/15 hidden md:inline">·</span>
        <span className="text-white/55 hidden md:inline">
          {stats ? stats.shipped.toLocaleString("en-US") : "—"} shipped
        </span>
        <span className="text-white/15 hidden md:inline">·</span>
        <span className="text-[var(--spark)] hidden md:inline">↓ scroll once you're in</span>
      </div>
    </div>
  );
}
