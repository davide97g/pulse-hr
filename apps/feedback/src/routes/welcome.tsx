import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUrlParam } from "@/lib/useUrlParam";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — Pulse Feedback" }] }),
  component: WelcomePage,
});

type Step = "manifesto" | "drift" | "interests";

const STEP_ORDER: Step[] = ["manifesto", "drift", "interests"];

function WelcomePage() {
  const [stepRaw, setStepRaw] = useUrlParam("step");
  const step: Step = (STEP_ORDER as string[]).includes(stepRaw ?? "")
    ? (stepRaw as Step)
    : "manifesto";
  const setStep = (s: Step) => setStepRaw(s);
  const navigate = useNavigate();

  const finish = () => navigate({ to: "/" });

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a0907] text-[var(--paper)]">
      {step === "manifesto" && <Manifesto onNext={() => setStep("drift")} onSkip={finish} />}
      {step === "drift" && (
        <DriftWall onNext={() => setStep("interests")} onSkip={finish} />
      )}
      {step === "interests" && <Interests onFinish={finish} />}

      <ProgressDots current={step} />
    </div>
  );
}

function ProgressDots({ current }: { current: Step }) {
  const idx = STEP_ORDER.indexOf(current);
  return (
    <div className="absolute left-1/2 bottom-7 -translate-x-1/2 flex gap-2">
      {STEP_ORDER.map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-8 h-[3px] rounded-sm",
            i < idx ? "bg-[var(--spark)] opacity-50" : i === idx ? "bg-[var(--spark)]" : "bg-white/15",
          )}
        />
      ))}
    </div>
  );
}

function Manifesto({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const rules = [
    { n: "01", k: "PIN", t: "See something off? Pin it from any screen.", s: "⌘⇧K from anywhere in Pulse." },
    { n: "02", k: "VOTE", t: "Vote with intent. Voting power compounds.", s: "Your weight grows with the questionnaire." },
    { n: "03", k: "PROPOSE", t: "Got an idea? Open a proposal.", s: "Title, body, scope. The wall does the rest." },
    { n: "04", k: "SHIP", t: "Admins triage. Lime means it ships.", s: "Open → Triaged → Planned → Shipped." },
  ];

  return (
    <div className="px-6 md:px-20 pt-20 md:pt-28 pb-24">
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20">
        <div>
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--spark)] mb-6">
            Step 01 / 03 · Manifesto
          </div>
          <h1 className="font-display font-light text-6xl md:text-[108px] leading-[0.86] tracking-[-0.045em] mb-6">
            We don't
            <br />
            <span className="text-[var(--spark)]">collect</span> feedback.
            <br />
            <span className="italic tracking-[-0.05em]">We listen.</span>
          </h1>
          <p className="text-base leading-[1.6] text-white/70 max-w-[440px] mb-10">
            Pulse Feedback is the open kitchen of the product. Every comment lands on a public wall.
            Every vote moves it up. Every shipped card is a receipt — proof that someone read what
            you wrote.
          </p>
          <div className="flex gap-3.5 flex-wrap">
            <button
              type="button"
              onClick={onNext}
              className="h-12 px-6 rounded-full bg-[var(--spark)] text-[#0a1400] font-bold text-sm press-scale flex items-center gap-2"
              style={{ boxShadow: "0 14px 30px -10px var(--spark)" }}
            >
              I'm in — show me the wall
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="h-12 px-5 rounded-full border border-white/15 text-[13px] hover:bg-white/5"
            >
              Skip tour
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:pt-10">
          {rules.map((r, i) => (
            <div
              key={i}
              className={cn(
                "p-5 rounded-2xl border grid grid-cols-[auto_1fr] gap-5 items-start",
                i === 0
                  ? "border-[var(--spark)]"
                  : "border-white/8",
              )}
              style={{
                background:
                  i === 0
                    ? "color-mix(in oklch, var(--spark) 14%, #0a0907)"
                    : "rgba(20,18,14,.6)",
              }}
            >
              <div
                className={cn(
                  "font-display font-light text-5xl leading-[0.9] tracking-[-0.045em]",
                  i === 0 ? "text-[var(--spark)]" : "text-white/40",
                )}
              >
                {r.n}
              </div>
              <div>
                <div
                  className={cn(
                    "font-mono text-[10px] tracking-[0.12em] uppercase mb-2",
                    i === 0 ? "text-[var(--spark)]" : "text-white/50",
                  )}
                >
                  · {r.k}
                </div>
                <div className="font-display text-[22px] leading-[1.2] tracking-[-0.02em] mb-1.5">
                  {r.t}
                </div>
                <div className="text-xs text-white/50">{r.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const DRIFT_TILES: {
  k: "IDEA" | "COMMENT" | "IMPROVEMENT";
  body: string;
  votes: number;
  h: number;
  route?: string;
  spark?: boolean;
  shipped?: boolean;
}[][] = [
  [
    { k: "IDEA", body: "Holidays calendar — view dedicated to coverage and operative continuity", votes: 24, h: 200, route: "/calendar", spark: true },
    { k: "COMMENT", body: "this does not make any sense to me", votes: 7, h: 90, route: "/reports" },
    { k: "IMPROVEMENT", body: "unify /calendar route under a single generic page", votes: 12, h: 140 },
    { k: "IDEA", body: "org chart — make it", votes: 31, h: 80, spark: true },
    { k: "COMMENT", body: "/people/e11 — bio missing", votes: 2, h: 70 },
  ],
  [
    { k: "IMPROVEMENT", body: "approve button should be primary lime green", votes: 18, h: 120, spark: true },
    { k: "IDEA", body: "Pulse Pulse → daily digest at 09:00, surfacing what your team voted on overnight", votes: 44, h: 230, spark: true },
    { k: "COMMENT", body: "shipped 4/27", votes: 3, h: 60, shipped: true },
    { k: "IMPROVEMENT", body: "avatar contrast in dark mode", votes: 9, h: 110 },
  ],
  [
    { k: "COMMENT", body: "/payroll — number doesn't match export", votes: 14, h: 130 },
    { k: "IDEA", body: "1:1 templates by manager preset, with auto-recap", votes: 27, h: 180, spark: true },
    { k: "IMPROVEMENT", body: 'rename "Triaged" → "Reviewed"', votes: 5, h: 90 },
    { k: "COMMENT", body: "love the new editorial vibe ❤", votes: 11, h: 80 },
    { k: "IDEA", body: "voting power leaderboard", votes: 6, h: 100 },
  ],
  [
    { k: "IDEA", body: "Slack bot — propose from a thread without leaving Slack", votes: 38, h: 200, spark: true },
    { k: "COMMENT", body: '/reports — chart axis is cropped on 13" laptops', votes: 8, h: 110 },
    { k: "IMPROVEMENT", body: "allow markdown in proposals", votes: 16, h: 90 },
    { k: "COMMENT", body: "shipped 5/02", votes: 4, h: 60, shipped: true },
  ],
  [
    { k: "IMPROVEMENT", body: "cmd+k should focus search, not propose", votes: 21, h: 130 },
    { k: "IDEA", body: "Pin to a specific PR — link feedback to the merge", votes: 33, h: 160, spark: true },
    { k: "COMMENT", body: "/people — table sticky header please", votes: 13, h: 100 },
    { k: "IDEA", body: "export wall to Notion weekly", votes: 19, h: 120 },
    { k: "COMMENT", body: "love it", votes: 1, h: 60 },
  ],
  [
    { k: "COMMENT", body: "/timesheet rounding edge case at 23:59", votes: 6, h: 120 },
    { k: "IDEA", body: "Quiet voting — anonymous mode, audit-trail only for admins", votes: 48, h: 230, spark: true },
    { k: "IMPROVEMENT", body: "softer shadows on cards", votes: 7, h: 80 },
    { k: "COMMENT", body: "shipped 4/12", votes: 2, h: 60, shipped: true },
  ],
];
const DRIFT_SPEEDS = [40, 55, 32, 48, 60, 38];
const DRIFT_OFFSETS = [0, -60, -20, -100, -40, -80];

function DriftWall({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="relative h-[calc(100vh-3.5rem)] overflow-hidden">
      <style>{`
        @keyframes fbDriftUp { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        .fb-driftcol { animation: fbDriftUp linear infinite; }
      `}</style>

      {/* Header overlay */}
      <div
        className="absolute inset-x-0 top-0 z-20 px-6 md:px-20 pt-10 md:pt-12 pb-8 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg,#0a0907 0%, rgba(10,9,7,.85) 60%, transparent 100%)",
        }}
      >
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--spark)] mb-3.5">
              Step 02 / 03 · The Wall
            </div>
            <h2 className="font-display font-light text-4xl md:text-[64px] leading-[0.9] tracking-[-0.045em]">
              247 things{" "}
              <span className="italic text-[var(--spark)] tracking-[-0.05em]">your team</span> wants.
            </h2>
            <p className="text-sm text-white/60 mt-3.5 max-w-[520px]">
              This is the live wall. Tap any card to read the thread, vote, reply. Drag to triage if
              you're an admin. Press{" "}
              <kbd className="px-2 py-0.5 rounded border border-white/20 font-mono text-[11px] ml-1">
                ⌘⇧O
              </kbd>{" "}
              from anywhere to propose.
            </p>
          </div>
          <div className="flex gap-3 pointer-events-auto">
            <button
              type="button"
              onClick={onNext}
              className="h-[52px] px-7 rounded-full bg-[var(--spark)] text-[#0a1400] font-bold text-sm press-scale flex items-center gap-2"
              style={{ boxShadow: "0 18px 40px -12px var(--spark)" }}
            >
              Pick what matters → vote
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="h-[52px] px-5 rounded-full border border-white/15 text-[13px] hover:bg-white/5"
            >
              Skip
            </button>
          </div>
        </div>
      </div>

      {/* Drifting columns */}
      <div
        className="absolute inset-0 grid grid-cols-3 md:grid-cols-6 gap-3.5 px-7 pt-[260px] overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(180deg, transparent 0, #000 18%, #000 80%, transparent 100%)",
        }}
      >
        {DRIFT_TILES.map((col, ci) => (
          <div
            key={ci}
            className="fb-driftcol flex flex-col gap-3.5"
            style={{
              animationDuration: `${DRIFT_SPEEDS[ci]}s`,
              animationDirection: ci % 2 ? "reverse" : "normal",
              transform: `translateY(${DRIFT_OFFSETS[ci]}px)`,
            }}
          >
            {[...col, ...col].map((t, i) => (
              <DriftTile key={i} t={t} />
            ))}
          </div>
        ))}
      </div>

      {/* Bottom intent strip */}
      <div
        className="absolute inset-x-0 bottom-0 h-20 z-10 px-7 pb-7 flex items-end justify-between"
        style={{ background: "linear-gradient(0deg, #0a0907 30%, transparent 100%)" }}
      >
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/45">
          Auto-drift · 6 columns · Live
        </span>
      </div>
    </div>
  );
}

function DriftTile({ t }: { t: (typeof DRIFT_TILES)[number][number] }) {
  const kindColor =
    t.k === "IDEA" ? "var(--spark)" : t.k === "IMPROVEMENT" ? "#fde047" : "#93c5fd";
  return (
    <div
      className="rounded-2xl border p-3.5 backdrop-blur-md flex flex-col justify-between gap-2.5"
      style={{
        background: t.spark
          ? "color-mix(in oklch, var(--spark) 12%, #14120e)"
          : t.shipped
          ? "rgba(20,40,20,.7)"
          : "rgba(20,18,14,.7)",
        borderColor: t.spark ? "rgba(180,255,57,.35)" : "rgba(255,255,255,.08)",
        minHeight: t.h,
        boxShadow: t.spark
          ? "0 0 30px -8px rgba(180,255,57,.25)"
          : "0 12px 30px -10px rgba(0,0,0,.6)",
      }}
    >
      <div>
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span
            className="px-1.5 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-[0.1em]"
            style={{
              background: t.spark ? "var(--spark)" : "rgba(255,255,255,.08)",
              color: t.spark ? "#0a1400" : kindColor,
            }}
          >
            {t.k}
          </span>
          {t.shipped && (
            <span
              className="px-1.5 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-[0.1em]"
              style={{ background: "rgba(34,197,94,.18)", color: "#86efac" }}
            >
              SHIPPED
            </span>
          )}
          {t.route && (
            <span className="font-mono text-[9px] text-white/45">↗ {t.route}</span>
          )}
        </div>
        <div
          className="leading-[1.4] text-white/90"
          style={{
            fontSize: t.h > 150 ? 15 : 13,
            opacity: t.shipped ? 0.55 : 0.92,
            textDecoration: t.shipped ? "line-through" : "none",
          }}
        >
          {t.body}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-dashed border-white/8">
        <div className="flex items-center gap-2">
          <span className="h-[18px] w-[18px] rounded-full bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b]" />
          <span className="font-mono text-[9px] text-white/45">D · GHIOTTO</span>
        </div>
        <span
          className="text-xs font-semibold flex items-center gap-1"
          style={{ color: t.spark ? "var(--spark)" : "var(--paper)" }}
        >
          ▲ {t.votes}
        </span>
      </div>
    </div>
  );
}

const TOPIC_TAGS: { t: string; n: number }[] = [
  { t: "navigation", n: 32 },
  { t: "reports", n: 18 },
  { t: "people", n: 24 },
  { t: "payroll", n: 11 },
  { t: "calendar", n: 9 },
  { t: "mobile", n: 14 },
  { t: "a11y", n: 7 },
  { t: "admin", n: 21 },
  { t: "integrations", n: 6 },
  { t: "comments-ux", n: 4 },
  { t: "security", n: 13 },
  { t: "performance", n: 8 },
];

function Interests({ onFinish }: { onFinish: () => void }) {
  const [picked, setPicked] = useState<Set<string>>(
    new Set(["navigation", "people", "calendar", "admin", "performance"]),
  );
  const toggle = (t: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const previewCards = [
    { k: "IDEA", body: "Add holiday coverage view to /calendar — pending/approved/mandatory statuses", votes: 24 },
    { k: "IMPROVEMENT", body: "/people — sticky header on long lists", votes: 13 },
    { k: "IDEA", body: "org chart — make it", votes: 31 },
  ];

  return (
    <div className="px-6 md:px-20 pt-20 md:pt-28 pb-24">
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20">
        <div>
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--spark)] mb-4">
            Almost there · Tune the feed
          </div>
          <h1 className="font-display font-light text-5xl md:text-[84px] leading-[0.9] tracking-[-0.045em] mb-4">
            What do
            <br />
            you{" "}
            <span className="italic text-[var(--spark)] tracking-[-0.05em]">care</span> about?
          </h1>
          <p className="text-[15px] leading-[1.55] text-white/65 max-w-[420px] mb-8">
            Pick 3+ topics. We'll surface them at the top of the wall and ping you (gently) when
            something new lands. You can change this anytime.
          </p>

          <div className="flex flex-wrap gap-2 max-w-[480px]">
            {TOPIC_TAGS.map((tag) => {
              const on = picked.has(tag.t);
              return (
                <button
                  key={tag.t}
                  type="button"
                  onClick={() => toggle(tag.t)}
                  className={cn(
                    "h-9 px-4 rounded-full border text-[13px] inline-flex items-center gap-2 press-scale",
                    on
                      ? "bg-[var(--spark)] text-[#0a1400] border-[var(--spark)] font-bold"
                      : "bg-white/5 text-[var(--paper)] border-white/10 font-medium",
                  )}
                  style={on ? { boxShadow: "0 8px 20px -8px var(--spark)" } : undefined}
                >
                  {on && <Check className="h-3 w-3" />}
                  {tag.t}
                  <span
                    className="font-mono text-[11px]"
                    style={{ opacity: on ? 0.6 : 0.4 }}
                  >
                    {tag.n}
                  </span>
                </button>
              );
            })}
          </div>

          <Link
            to="/voting-power"
            className="mt-12 p-5 rounded-2xl border border-[var(--spark)]/20 bg-[var(--spark)]/5 flex items-center gap-4 hover:bg-[var(--spark)]/8 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--spark)] text-[#0a1400] flex items-center justify-center font-display text-2xl font-extrabold">
              +10
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold mb-1">Voting power · baseline 10</div>
              <div className="text-[11px] text-white/60">
                Complete the company-profile questionnaire to double your weight on every vote.
                <span className="text-[var(--spark)] ml-1.5">Start →</span>
              </div>
            </div>
          </Link>

          <div className="mt-9 flex gap-3.5 flex-wrap">
            <button
              type="button"
              onClick={onFinish}
              className="h-[52px] px-8 rounded-full bg-[var(--spark)] text-[#0a1400] font-bold text-sm press-scale flex items-center gap-2"
              style={{ boxShadow: "0 18px 40px -12px var(--spark)" }}
            >
              Open the wall <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onFinish}
              className="h-[52px] px-5 rounded-full border border-white/15 text-[13px] hover:bg-white/5"
            >
              Decide later
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/50 mb-3.5">
            Live preview · your wall
          </div>
          <div
            className="relative rounded-3xl p-6 border border-white/8 min-h-[540px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(20,18,14,.6), rgba(10,9,7,.4))",
            }}
          >
            <div className="flex items-center justify-between mb-[18px]">
              <div>
                <div className="font-display text-[28px] leading-none">Feedback</div>
                <div className="text-[11px] text-white/50 mt-1">
                  filtered to your {picked.size} topics
                </div>
              </div>
              <div className="flex gap-1.5">
                <span className="px-2 py-1 rounded-full bg-[var(--spark)]/12 text-[var(--spark)] font-mono text-[9px] tracking-[0.12em] uppercase">
                  ● 32 Open
                </span>
                <span className="px-2 py-1 rounded-full bg-white/5 text-white/60 font-mono text-[9px] tracking-[0.12em] uppercase">
                  ● 8 Shipped
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {previewCards.map((c, i) => (
                <div
                  key={i}
                  className="px-4 py-3.5 rounded-2xl border grid grid-cols-[auto_1fr_auto] gap-3.5 items-center"
                  style={{
                    background: i === 0
                      ? "color-mix(in oklch, var(--spark) 12%, #14120e)"
                      : "rgba(20,18,14,.7)",
                    borderColor: i === 0 ? "rgba(180,255,57,.3)" : "rgba(255,255,255,.08)",
                  }}
                >
                  <div className="text-center">
                    <div className="text-[11px] text-white/50">▲</div>
                    <div
                      className="font-display text-lg"
                      style={{ color: i === 0 ? "var(--spark)" : "var(--paper)" }}
                    >
                      {c.votes}
                    </div>
                  </div>
                  <div>
                    <span
                      className="inline-block px-1.5 py-0.5 rounded-full font-mono text-[9px] tracking-[0.1em] font-bold mb-1.5"
                      style={{
                        background: i === 0 ? "var(--spark)" : "rgba(255,255,255,.08)",
                        color:
                          i === 0
                            ? "#0a1400"
                            : c.k === "IDEA"
                            ? "var(--spark)"
                            : "#fde047",
                      }}
                    >
                      {c.k}
                    </span>
                    <div className="text-[13px] leading-[1.35]">{c.body}</div>
                  </div>
                  <button className="h-8 px-3.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono uppercase tracking-[0.08em]">
                    vote
                  </button>
                </div>
              ))}
            </div>

            <div className="absolute left-6 right-6 bottom-6 px-4 py-3 rounded-xl bg-black/40 border border-dashed border-white/12 flex items-center justify-between font-mono text-[10px] tracking-[0.12em] uppercase">
              <span className="text-white/50">+ 29 more</span>
              <span className="text-[var(--spark)]">scroll ↓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
