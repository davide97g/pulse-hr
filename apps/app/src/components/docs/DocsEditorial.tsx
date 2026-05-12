import { useState } from "react";

interface Article {
  num: string;
  title: string;
  read: string;
  spark?: boolean;
}
interface Section {
  label: string;
  items: Article[];
}

const SECTIONS: Section[] = [
  {
    label: "PRIMI PASSI",
    items: [
      { num: "01", title: "Cos'è PulseHR", read: "5 min" },
      { num: "02", title: "Setup workspace", read: "8 min" },
      { num: "03", title: "Invita le prime persone", read: "3 min" },
      { num: "04", title: "Configura ferie e permessi", read: "6 min" },
    ],
  },
  {
    label: "CORE",
    items: [
      { num: "05", title: "Timesheet · come funziona", read: "12 min", spark: true },
      { num: "06", title: "Forecast & saturazione", read: "10 min" },
      { num: "07", title: "Payroll · run mensile", read: "15 min" },
      { num: "08", title: "Performance & growth", read: "10 min" },
    ],
  },
  {
    label: "INTEGRAZIONI",
    items: [
      { num: "09", title: "Slack · configurare", read: "6 min" },
      { num: "10", title: "GitHub · timesheet auto", read: "8 min" },
      { num: "11", title: "Calendario Google", read: "4 min" },
      { num: "12", title: "API & webhook", read: "20 min" },
    ],
  },
];

const ARTICLE_RULES = [
  ["01", "Una riga per project.", "Non per task. Non per ticket. Solo project."],
  ["02", "Otto ore al giorno.", "Più o meno è ok. Niente tracking al minuto."],
  ["03", "Conferma il venerdì.", "Lunedì scatta la run, non si torna indietro."],
];

export function DocsEditorial() {
  const [active, setActive] = useState("05");

  return (
    <div
      className="ph grid min-h-[calc(100vh-3.5rem)]"
      style={{ gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.4fr)" }}
    >
      {/* Left — index */}
      <aside
        className="flex flex-col gap-7 overflow-auto"
        style={{
          padding: "clamp(28px, 4vw, 48px)",
          background: "var(--bg-2)",
          borderRight: "1px solid var(--line-strong)",
        }}
      >
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            DOCS · 12 ARTICOLI · IT
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(40px, 11vw, 96px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Guida</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 16,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 20,
              lineHeight: 1.4,
              maxWidth: 420,
            }}
          >
            Tutto quello che serve per usare PulseHR bene. In ordine sparso, come la vita.
          </p>
        </div>

        {SECTIONS.map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <span
              className="t-mono mb-1.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              {s.label}
            </span>
            {s.items.map((it, j) => {
              const isActive = it.num === active;
              const accent = it.spark || isActive;
              return (
                <button
                  key={it.num}
                  type="button"
                  onClick={() => setActive(it.num)}
                  className="grid items-baseline text-left"
                  style={{
                    gridTemplateColumns: "32px 1fr auto",
                    gap: 10,
                    padding: "10px 0",
                    borderBottom: j < s.items.length - 1 ? "1px solid var(--line)" : "none",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  <span
                    className="t-mono"
                    style={{
                      color: accent ? "var(--spark)" : "var(--muted-foreground)",
                    }}
                  >
                    {it.num}
                  </span>
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: accent ? "italic" : "normal",
                      fontSize: 19,
                      letterSpacing: "-0.005em",
                      color: accent ? "var(--spark)" : "var(--fg)",
                    }}
                  >
                    {it.title}
                  </span>
                  <span
                    className="t-mono"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {it.read}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      {/* Right — article */}
      <article
        className="flex flex-col gap-5 overflow-auto"
        style={{ padding: "clamp(40px, 5vw, 64px)" }}
      >
        <span className="t-mono" style={{ color: "var(--spark)" }}>
          ⏤ CAP. {active} · CORE ⏤
        </span>
        <h2
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontWeight: 400,
            margin: 0,
            fontSize: "clamp(48px, 6vw, 72px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.92,
          }}
        >
          Timesheet · <span style={{ fontStyle: "italic" }}>come</span> funziona
          <span style={{ color: "var(--spark)" }}>.</span>
        </h2>
        <p
          style={{
            margin: 0,
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 24,
            lineHeight: 1.4,
            color: "var(--fg-2)",
            maxWidth: 620,
          }}
        >
          Il timesheet di PulseHR è pensato per essere compilato in tre minuti alla fine della
          settimana, non in dieci durante la settimana.
        </p>

        <div
          className="placeholder-img"
          style={{ width: "100%", height: 240, borderRadius: 16, margin: "8px 0" }}
        >
          <span className="cap t-mono-sm">HERO · TIMESHEET SCREENSHOT</span>
        </div>

        <h3
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontWeight: 600,
            margin: "12px 0 0",
            fontSize: 28,
            letterSpacing: "-0.02em",
          }}
        >
          Tre regole semplici
        </h3>
        <ol className="m-0 p-0 list-none flex flex-col gap-3.5">
          {ARTICLE_RULES.map((r, i) => (
            <li
              key={r[0]}
              className="grid"
              style={{
                gridTemplateColumns: "44px 1fr",
                gap: 14,
                paddingBottom: 14,
                borderBottom: i < ARTICLE_RULES.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <span
                className="t-num"
                style={{
                  fontSize: 28,
                  color: "var(--spark)",
                  letterSpacing: "-0.03em",
                }}
              >
                {r[0]}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 22,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {r[1]}
                </div>
                <p style={{ margin: "4px 0 0", color: "var(--fg-2)", fontSize: 15, lineHeight: 1.5 }}>
                  {r[2]}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div
          className="mt-5 flex items-center gap-6 flex-wrap"
          style={{
            padding: "20px 24px",
            border: "1px solid var(--spark)",
            borderRadius: 14,
            background: "color-mix(in oklch, var(--spark) 6%, transparent)",
          }}
        >
          <div className="flex-1 min-w-0">
            <span className="t-mono" style={{ color: "var(--spark)" }}>
              HAI BISOGNO DI AIUTO?
            </span>
            <div
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 22,
                marginTop: 6,
              }}
            >
              Scrivici su Slack #pulse-help
            </div>
          </div>
          <button type="button" className="pill pill-spark pill-sm">
            Apri Slack <span className="arr">→</span>
          </button>
        </div>
      </article>
    </div>
  );
}
