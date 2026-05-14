import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { SKILL_CATALOG } from "@/lib/skills-data";

export function SkillsEmpty({ onAdd }: { onAdd?: () => void }) {
  const hardCount = SKILL_CATALOG.filter((s) => s.bucket === "hard").length;
  const softCount = SKILL_CATALOG.length - hardCount;
  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 min-h-0 h-full">
      <div>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          SKILLS MATRIX · NEW HERE
        </span>
        <h1
          style={{
            fontFamily: '"Fraunces", ui-serif, serif',
            fontWeight: 400,
            margin: "6px 0 0",
            fontSize: "clamp(48px, 8vw, 64px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.92,
          }}
        >
          <span style={{ fontStyle: "italic" }}>Le tue competenze</span>
          <span style={{ color: "var(--spark)" }}>.</span>
        </h1>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid var(--line)",
          borderRadius: 18,
          background: "var(--bg)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 1200 480"
          preserveAspectRatio="xMidYMid meet"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {[1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx="600"
              cy="240"
              r={80 + i * 78}
              fill="none"
              stroke="var(--line)"
              strokeDasharray="2 6"
            />
          ))}
          <line x1="600" y1="0" x2="600" y2="480" stroke="var(--line)" strokeDasharray="2 4" />
          <circle cx="600" cy="240" r="42" fill="var(--fg)" />
          <text
            x="600"
            y="246"
            textAnchor="middle"
            fontFamily="Fraunces, serif"
            fontStyle="italic"
            fontSize="28"
            fill="var(--bg)"
          >
            me
          </text>
          {(
            [
              [710, 200],
              [780, 280],
              [820, 165],
              [690, 320],
              [740, 380],
              [490, 200],
              [410, 280],
              [380, 165],
              [510, 320],
              [460, 380],
            ] as const
          ).map((p, i) => (
            <circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r="7"
              fill="none"
              stroke="var(--line-strong)"
              strokeDasharray="1.5 3"
            />
          ))}
        </svg>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 540,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: "32px 36px",
            border: "1px solid var(--line-strong)",
            borderRadius: 18,
            background: "var(--bg)",
            boxShadow: "0 20px 40px -16px color-mix(in oklch, var(--ink) 25%, transparent)",
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            WELCOME
          </span>
          <div
            style={{
              fontFamily: '"Fraunces", ui-serif, serif',
              fontWeight: 400,
              fontSize: 48,
              letterSpacing: "-0.035em",
              lineHeight: 0.95,
            }}
          >
            Niente ancora<span style={{ color: "var(--spark)" }}>.</span>
            <br />
            <span style={{ fontStyle: "italic", color: "var(--muted-foreground)" }}>
              Mappiamo.
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.5,
              letterSpacing: "-0.005em",
              color: "var(--fg)",
            }}
          >
            La tua matrice di competenze nasce vuota. Aggiungi le prime tre cose che sai
            fare e Lucia te le valida la prossima settimana.
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              marginTop: 6,
            }}
          >
            <EditorialPill kind="spark" size="sm" onClick={onAdd}>
              + Add your first skill
            </EditorialPill>
            <EditorialPill kind="ghost" size="sm">
              Browse catalog
            </EditorialPill>
          </div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)", marginTop: 4 }}>
            {SKILL_CATALOG.length} SKILLS IN CATALOG · {hardCount} HARD · {softCount} SOFT
          </span>
        </div>
      </div>
    </div>
  );
}
