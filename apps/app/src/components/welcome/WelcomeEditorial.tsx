import { useNavigate } from "@tanstack/react-router";

export function WelcomeEditorial() {
  const navigate = useNavigate();

  return (
    <div
      className="ph grid min-h-[calc(100vh-3.5rem)]"
      style={{ gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)" }}
    >
      {/* LEFT */}
      <section
        className="flex flex-col justify-between"
        style={{ padding: "clamp(32px, 4vw, 56px) clamp(28px, 4vw, 64px)" }}
      >
        <header className="flex items-center gap-3.5">
          <span
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: "-0.04em",
            }}
          >
            pulse<span style={{ fontStyle: "normal" }}>·</span>hr
          </span>
          <span className="dot" />
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            v0.7.2 · LIVE
          </span>
        </header>

        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            BENVENUTO · IT · MILANO
          </span>
          <h1
            style={{
              margin: "18px 0 0",
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              fontSize: "clamp(80px, 12vw, 144px)",
              lineHeight: 0.86,
              letterSpacing: "-0.045em",
            }}
          >
            HR per chi <span style={{ fontStyle: "italic" }}>odia</span>
            <br />
            gli HR<span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 28,
              maxWidth: 520,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.4,
              letterSpacing: "-0.005em",
            }}
          >
            People, Work, Money in un solo workspace. Modulare per scelta, keyboard-first per
            natura, open per principio.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div
            className="grid pt-6"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
              borderTop: "1px solid var(--line-strong)",
            }}
          >
            {(
              [
                ["01", "PEOPLE", "Persone, leave, kudos."],
                ["02", "WORK", "Projects, timesheet, calendar."],
                ["03", "REPORTS", "Saturazione e margini."],
              ] as Array<[string, string, string]>
            ).map(([n, t, d], i) => (
              <div
                key={n}
                style={{
                  paddingLeft: i === 0 ? 0 : 18,
                  borderLeft: i === 0 ? "none" : "1px solid var(--line)",
                }}
              >
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {n} · {t}
                </span>
                <p
                  style={{
                    marginTop: 8,
                    color: "var(--fg-2)",
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 17,
                    lineHeight: 1.35,
                  }}
                >
                  {d}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-2.5 items-center flex-wrap">
            <button
              type="button"
              className="pill pill-spark"
              onClick={() => navigate({ to: "/" })}
            >
              Inizia <span className="arr">→</span>
            </button>
            <span className="flex-1" />
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ⌘K CERCA · ⌘J COPILOT
            </span>
          </div>
        </div>
      </section>

      {/* RIGHT — poster */}
      <section
        className="relative hidden lg:block"
        style={{ background: "var(--bg-2)", padding: 24 }}
      >
        <div
          className="placeholder-img"
          style={{ width: "100%", height: "100%", borderRadius: 18 }}
        >
          <span className="cap t-mono-sm">POSTER · TEAM @ MILANO</span>
        </div>
        <span
          className="t-mono"
          style={{
            position: "absolute",
            top: 48,
            right: 48,
            border: "1px solid var(--line-strong)",
            padding: "5px 12px",
            borderRadius: 999,
            color: "var(--fg)",
            background: "var(--bg)",
          }}
        >
          MILANO ·{" "}
          {new Date()
            .toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })
            .toUpperCase()}
        </span>
        <div
          className="absolute flex justify-between items-end"
          style={{ bottom: 48, left: 48, right: 48 }}
        >
          <div>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              EDIZIONE 19 / 2026
            </span>
            <div
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 28,
                marginTop: 4,
                color: "var(--fg)",
              }}
            >
              «Le persone, prima.»
            </div>
          </div>
          <span
            className="t-num"
            style={{
              fontSize: 64,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "var(--fg)",
            }}
          >
            142
          </span>
        </div>
      </section>
    </div>
  );
}
