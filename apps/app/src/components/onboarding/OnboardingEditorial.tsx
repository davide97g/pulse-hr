import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useFirstName } from "@/lib/current-user";

interface Step {
  num: string;
  label: string;
}
const STEPS: Step[] = [
  { num: "01", label: "Workspace" },
  { num: "02", label: "Persone" },
  { num: "03", label: "Ferie & permessi" },
  { num: "04", label: "Stipendi" },
  { num: "05", label: "Integrazioni" },
  { num: "06", label: "Pronto" },
];

export function OnboardingEditorial() {
  const navigate = useNavigate();
  const firstName = useFirstName();
  const [stepIdx, setStepIdx] = useState(2); // start at "Ferie & permessi" per design

  const current = STEPS[stepIdx];
  const remaining = STEPS.length - 1 - stepIdx;
  const remainingMin = Math.max(1, remaining * 1.3).toFixed(0);

  return (
    <div
      className="ph grid min-h-[calc(100vh-3.5rem)]"
      style={{ gridTemplateColumns: "minmax(280px, 320px) 1fr" }}
    >
      {/* Sidebar */}
      <aside
        className="hidden md:flex flex-col gap-9"
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "44px 32px",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            pulse<span style={{ fontStyle: "normal" }}>·</span>hr
          </span>
        </div>

        <div>
          <span className="t-mono" style={{ color: "rgba(245,244,242,.55)" }}>
            SETUP · 06 STEP
          </span>
          <h2
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "12px 0 0",
              fontSize: 44,
              letterSpacing: "-0.035em",
              lineHeight: 0.95,
              color: "var(--paper)",
            }}
          >
            <span style={{ fontStyle: "italic" }}>Benvenuto</span>,
            <br />
            {firstName}
            <span style={{ color: "var(--spark)" }}>.</span>
          </h2>
        </div>

        <div className="flex flex-col gap-2.5 -mt-2">
          {STEPS.map((s, i) => {
            const isDone = i < stepIdx;
            const isCurrent = i === stepIdx;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStepIdx(i)}
                className="grid items-center text-left"
                style={{
                  gridTemplateColumns: "26px 1fr",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,.12)",
                  background: "transparent",
                  border: "none",
                  borderBottomColor: "rgba(255,255,255,.12)",
                  borderBottomWidth: 1,
                  borderBottomStyle: "solid",
                  cursor: "pointer",
                  color: "var(--paper)",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: `1px solid ${isCurrent ? "var(--spark)" : "rgba(255,255,255,.35)"}`,
                    background: isDone ? "var(--paper)" : "transparent",
                    color: isDone
                      ? "var(--ink)"
                      : isCurrent
                        ? "var(--spark)"
                        : "rgba(255,255,255,.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "JetBrains Mono, ui-monospace, monospace",
                    fontSize: 10,
                  }}
                >
                  {isDone ? "✓" : s.num}
                </span>
                <span
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: isCurrent ? "italic" : "normal",
                    fontSize: 19,
                    letterSpacing: "-0.01em",
                    color: isCurrent
                      ? "var(--spark)"
                      : isDone
                        ? "var(--paper)"
                        : "rgba(245,244,242,.55)",
                  }}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="mt-auto"
          style={{ padding: "16px 0", borderTop: "1px solid rgba(255,255,255,.18)" }}
        >
          <span className="t-mono" style={{ color: "rgba(245,244,242,.55)" }}>
            STIMA RIMANENTE
          </span>
          <div
            className="t-num mt-1.5"
            style={{ fontSize: 28, color: "var(--spark)" }}
          >
            ~ {remainingMin} min
          </div>
        </div>
      </aside>

      {/* Main */}
      <main
        className="flex flex-col gap-7 overflow-auto"
        style={{ padding: "clamp(28px, 4vw, 56px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="flex justify-between flex-wrap gap-2">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            STEP {String(stepIdx + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")} ·{" "}
            {current.label.toUpperCase()}
          </span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ⌘← INDIETRO · ⌘→ AVANTI
          </span>
        </div>
        <h1
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontWeight: 400,
            margin: 0,
            fontSize: "clamp(56px, 8vw, 96px)",
            letterSpacing: "-0.045em",
            lineHeight: 0.92,
            maxWidth: 920,
          }}
        >
          Quanti giorni di <span style={{ fontStyle: "italic" }}>riposo</span> regalate ogni anno
          <span style={{ color: "var(--spark)" }}>?</span>
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 22,
            lineHeight: 1.4,
            color: "var(--fg-2)",
            maxWidth: 640,
          }}
        >
          Imposta il monte ferie e permessi standard. Potrai personalizzare per singola persona
          dopo, niente di drammatico.
        </p>

        <div
          className="grid gap-5 mt-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
        >
          {(
            [
              ["FERIE / ANNO", "24", "GG", "Standard CCNL Commercio.", true],
              ["PERMESSI / ANNO", "32", "ORE", "ROL + ex-festività.", false],
              ["MALATTIA", "—", "GG", "Tracciata, non limitata.", false],
              ["WEEKEND LIBERI", "Sì", "", "Sabato e domenica esclusi.", false],
            ] as Array<[string, string, string, string, boolean]>
          ).map(([l, v, u, d, accent]) => (
            <div
              key={l}
              style={{
                border: `1px solid ${accent ? "var(--spark)" : "var(--line)"}`,
                borderRadius: 18,
                padding: "22px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: accent
                  ? "color-mix(in oklch, var(--spark) 6%, transparent)"
                  : "transparent",
              }}
            >
              <span
                className="t-mono"
                style={{ color: accent ? "var(--spark)" : "var(--muted-foreground)" }}
              >
                {l}
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span
                  className="t-num"
                  style={{
                    fontSize: 64,
                    letterSpacing: "-0.04em",
                    color: accent ? "var(--spark)" : "var(--fg)",
                  }}
                >
                  {v}
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {u}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontStyle: "italic",
                  fontSize: 17,
                  color: "var(--fg-2)",
                }}
              >
                {d}
              </span>
            </div>
          ))}
        </div>

        <div
          className="flex gap-2.5 items-center mt-auto pt-6"
          style={{ borderTop: "1px solid var(--line-strong)" }}
        >
          <button
            type="button"
            className="pill pill-ghost"
            disabled={stepIdx === 0}
            onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
          >
            ← Indietro
          </button>
          <span className="flex-1" />
          <button type="button" className="pill pill-ghost" onClick={() => navigate({ to: "/" })}>
            Salta per ora
          </button>
          {stepIdx < STEPS.length - 1 ? (
            <button
              type="button"
              className="pill pill-spark"
              onClick={() => setStepIdx((s) => Math.min(STEPS.length - 1, s + 1))}
            >
              Avanti <span className="arr">→</span>
            </button>
          ) : (
            <button
              type="button"
              className="pill pill-spark"
              onClick={() => navigate({ to: "/" })}
            >
              Apri workspace <span className="arr">→</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
