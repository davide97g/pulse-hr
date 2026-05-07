import { ArrowLeft } from "lucide-react";

const APP_URL = import.meta.env.VITE_APP_URL ?? "https://app.pulsehr.it";

function buildLoginUrl(): string {
  const redirect = encodeURIComponent(window.location.href);
  return `${APP_URL}/login?redirect_url=${redirect}`;
}

const FLOATS: {
  x: string;
  y: string;
  w: number;
  rot: number;
  body: string;
  kind: "IDEA" | "COMMENT" | "IMPROVEMENT";
  votes: number;
}[] = [
  { x: "4%", y: "14%", w: 220, rot: -4, body: "add a calendar view dedicated to holiday coverage", kind: "IDEA", votes: 24 },
  { x: "76%", y: "11%", w: 250, rot: 3, body: "/reports — this does not make any sense to me", kind: "COMMENT", votes: 7 },
  { x: "5%", y: "62%", w: 240, rot: 5, body: "approve button should be primary lime green", kind: "IMPROVEMENT", votes: 12 },
  { x: "78%", y: "60%", w: 210, rot: -6, body: "org chart is missing — make it", kind: "IDEA", votes: 31 },
  { x: "16%", y: "39%", w: 180, rot: 8, body: "/people/e11", kind: "COMMENT", votes: 2 },
  { x: "86%", y: "40%", w: 170, rot: -3, body: 'unify "/calendar" route', kind: "IDEA", votes: 5 },
];

const KIND_BG: Record<string, { bg: string; fg: string }> = {
  IDEA: { bg: "rgba(180,255,57,.18)", fg: "var(--spark)" },
  IMPROVEMENT: { bg: "rgba(180,255,57,.10)", fg: "var(--spark)" },
  COMMENT: { bg: "rgba(96,165,250,.15)", fg: "#93c5fd" },
};

export function SignedOutGate() {
  const onSignIn = () => window.location.assign(buildLoginUrl());

  return (
    <div className="room-dark relative min-h-screen overflow-hidden bg-[#0a0907] text-[var(--paper)]">
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 h-16 px-7 z-10 flex items-center justify-between border-b border-white/5 bg-[#0a0907]/85 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <a
            href={APP_URL}
            className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase font-mono text-white/55 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Pulse
          </a>
          <span className="h-4 w-px bg-white/10" />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg tracking-[-0.02em]">Pulse</span>
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--spark)]"
              style={{ boxShadow: "0 0 12px var(--spark)" }}
            />
            <span className="font-display text-lg tracking-[-0.02em] text-[var(--spark)]">
              Feedback
            </span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[var(--spark)]/12 text-[var(--spark)] font-mono text-[9px] tracking-[0.12em] uppercase font-semibold">
              Labs · Beta
            </span>
          </div>
        </div>
        <span className="text-[10px] tracking-[0.12em] uppercase font-mono text-white/40">
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
              className="absolute rounded-2xl border p-3.5 backdrop-blur-md shadow-[0_24px_60px_-20px_rgba(0,0,0,.6)]"
              style={{
                left: f.x,
                top: f.y,
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
          );
        })}
      </div>

      {/* Center modal */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[min(520px,92vw)] p-10 md:p-12 rounded-3xl border border-white/8 backdrop-blur-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(20,18,14,.92), rgba(10,9,7,.92))",
          boxShadow:
            "0 60px 120px -20px rgba(0,0,0,.8), 0 0 0 1px rgba(180,255,57,.08)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-9">
          <span
            className="h-2 w-2 rounded-full bg-[var(--spark)]"
            style={{ boxShadow: "0 0 16px var(--spark)" }}
          />
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--spark)] font-semibold">
            Feedback · Labs
          </span>
        </div>

        <h1
          className="font-display font-light text-5xl md:text-[68px] leading-[0.86] tracking-[-0.045em] mb-2"
        >
          The wall
          <br />
          <span className="italic font-light text-[var(--spark)] tracking-[-0.05em]">
            that listens.
          </span>
        </h1>
        <p className="text-sm md:text-[14px] leading-[1.55] text-white/60 mt-5 mb-9 max-w-[380px]">
          Every pin, every proposal, every "this is broken" — collected, voted on, shipped or
          quietly killed. Sign in with your work email.
        </p>

        <button
          type="button"
          onClick={onSignIn}
          className="w-full h-[52px] rounded-xl bg-[var(--spark)] text-[#0a1400] text-sm font-bold tracking-tight press-scale flex items-center justify-center gap-2"
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
          className="block text-center h-12 rounded-xl border border-white/10 bg-white/5 text-[13px] leading-[48px] hover:bg-white/8"
        >
          Create an account →
        </a>

        <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/40">
            Bitrock · Workspace
          </span>
          <span className="text-[11px] text-white/50">
            Need an invite?{" "}
            <span className="text-[var(--spark)] cursor-pointer">Ask your admin →</span>
          </span>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="absolute inset-x-0 bottom-0 h-12 z-10 px-6 border-t border-white/5 bg-black/40 flex items-center justify-center gap-6 text-[10px] tracking-[0.12em] uppercase font-mono">
        <span className="text-white/55">247 proposals</span>
        <span className="text-white/15">·</span>
        <span className="text-white/55">1.2K votes this week</span>
        <span className="text-white/15">·</span>
        <span className="text-white/55">34 shipped</span>
        <span className="text-white/15">·</span>
        <span className="text-[var(--spark)]">↓ scroll once you're in</span>
      </div>
    </div>
  );
}
