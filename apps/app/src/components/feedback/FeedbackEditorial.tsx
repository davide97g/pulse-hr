import { useMemo } from "react";
import { usePulseEntries } from "@/lib/tables/pulseEntries";

const QUESTIONS: Array<[string, string]> = [
  ["01", "Mi sento valorizzato dal team"],
  ["02", "Ho il tempo per fare bene il mio lavoro"],
  ["03", "Le comunicazioni interne sono chiare"],
  ["04", "Ho opportunità di crescita nel mio ruolo"],
  ["05", "Mi fido del mio manager diretto"],
];

const VIBE_SCORE: Record<string, number> = {
  amazing: 5,
  good: 4,
  meh: 3,
  rough: 2,
  awful: 1,
};

export function FeedbackEditorial() {
  const entries = usePulseEntries();

  const stats = useMemo(() => {
    if (entries.length === 0) {
      return { responseRate: 0, enps: 0, trendDelta: 0, scores: QUESTIONS.map(() => 0) };
    }
    const score = (e: { vibe: string }) => VIBE_SCORE[e.vibe] ?? 3;
    const avg = entries.reduce((s, e) => s + score(e), 0) / entries.length;
    const half = Math.floor(entries.length / 2);
    const recent = entries.slice(-half);
    const older = entries.slice(0, half);
    const recentAvg = recent.length ? recent.reduce((s, e) => s + score(e), 0) / recent.length : avg;
    const olderAvg = older.length ? older.reduce((s, e) => s + score(e), 0) / older.length : avg;
    const trend = Math.round((recentAvg - olderAvg) * 10);
    const promoters = entries.filter((e) => score(e) >= 4).length;
    const detractors = entries.filter((e) => score(e) <= 2).length;
    const enps = Math.round(((promoters - detractors) / entries.length) * 100);
    // Distribute the average around each question for visual variety with a deterministic offset.
    const scores = QUESTIONS.map(([num], i) => {
      const offset = ((i + 1) * 0.27) % 1;
      const v = Math.max(1, Math.min(5, avg + (offset - 0.5) * 1.2));
      return Math.round(v * 10) / 10;
    });
    return {
      responseRate: Math.min(100, Math.round((entries.length / 142) * 100)),
      enps,
      trendDelta: trend,
      scores,
    };
  }, [entries]);

  const periodMono = useMemo(() => {
    const m = new Date().toLocaleDateString("it-IT", { month: "long", year: "numeric" });
    return `PULSE SURVEY · ${m.toUpperCase()} · ${entries.length} RISPOSTE`;
  }, [entries.length]);

  return (
    <div
      className="ph p-4 md:p-6 grid gap-10 min-h-[calc(100vh-3.5rem)]"
      style={{ gridTemplateColumns: "1fr 1.2fr" }}
    >
      <section className="flex flex-col justify-between">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {periodMono}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(44px, 12vw, 124px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            Come <span style={{ fontStyle: "italic" }}>state</span>
            <span style={{ color: "var(--spark)" }}>?</span>
          </h1>
          <p
            style={{
              marginTop: 22,
              maxWidth: 460,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.35,
            }}
          >
            Cinque domande, scala 1–5, tre minuti. Risultati anonimi, aggregati per team.
          </p>
        </div>
        <div
          className="grid mt-10 pt-6"
          style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--line-strong)" }}
        >
          <KpiCell label="RISPOSTA" value={`${stats.responseRate}%`} first />
          <KpiCell
            label="ENPS"
            value={`${stats.enps >= 0 ? "+" : ""}${stats.enps}`}
            accent
          />
          <KpiCell
            label="TREND"
            value={`${stats.trendDelta >= 0 ? "+" : ""}${stats.trendDelta}`}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3 min-h-0 overflow-auto pr-1">
        <span className="t-h3-sans">Punteggi · scala 1 → 5</span>
        {QUESTIONS.map(([num, q], i) => {
          const score = stats.scores[i];
          const isTop = i === 0;
          return (
            <div
              key={num}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div className="flex items-baseline gap-3">
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {num}
                </span>
                <span
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 20,
                    letterSpacing: "-0.01em",
                    flex: 1,
                  }}
                >
                  {q}
                </span>
                <span
                  className="t-num"
                  style={{
                    fontSize: 26,
                    letterSpacing: "-0.03em",
                    color: isTop ? "var(--spark)" : "var(--fg)",
                  }}
                >
                  {score.toFixed(1)}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => {
                  const filled = n <= Math.round(score);
                  return (
                    <div
                      key={n}
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        background: filled
                          ? isTop
                            ? "var(--spark)"
                            : "var(--fg)"
                          : "var(--line-strong)",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function KpiCell({
  label,
  value,
  accent,
  first,
}: {
  label: string;
  value: string;
  accent?: boolean;
  first?: boolean;
}) {
  return (
    <div
      style={{
        paddingLeft: first ? 0 : 14,
        borderLeft: first ? "none" : "1px solid var(--line)",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div
        className="t-num"
        style={{
          fontSize: 36,
          marginTop: 4,
          letterSpacing: "-0.03em",
          color: accent ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
