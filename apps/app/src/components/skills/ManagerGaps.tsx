import { useMemo } from "react";
import { AvatarDisplay } from "@pulse-hr/ui/atoms/AvatarDisplay";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { LV_LABEL, perSkillAggregates, type PerSkillAggregate } from "@/lib/skills-data";

function StrengthsCard({ rows }: { rows: PerSkillAggregate[] }) {
  return (
    <section
      style={{
        border: "1px solid var(--line-strong)",
        borderRadius: 18,
        padding: "22px 26px",
        background: "color-mix(in oklch, var(--spark) 6%, transparent)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <span className="t-mono" style={{ color: "var(--spark)" }}>
            STRENGTHS · ≥ 3 EXPERT
          </span>
          <h2
            style={{
              margin: "4px 0 0",
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 44,
              letterSpacing: "-0.035em",
              lineHeight: 0.95,
            }}
          >
            Dove siamo profondi.
          </h2>
        </div>
        <span
          className="t-num"
          style={{
            fontSize: 56,
            color: "var(--spark)",
            letterSpacing: "-0.045em",
            lineHeight: 1,
          }}
        >
          {String(rows.length).padStart(2, "0")}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingRight: 4,
        }}
      >
        {rows.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              rowGap: 8,
              columnGap: 14,
              padding: "12px 0",
              borderTop:
                i === 0
                  ? "none"
                  : "1px solid color-mix(in oklch, var(--spark) 25%, var(--line))",
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: '"Fraunces", ui-serif, serif',
                  fontStyle: "italic",
                  fontSize: 24,
                  letterSpacing: "-0.02em",
                }}
              >
                {s.name}
              </span>
              <span
                className="t-mono"
                style={{ color: "var(--muted-foreground)", marginLeft: 10 }}
              >
                {s.bucket.toUpperCase()}
              </span>
            </div>
            <span className="t-mono" style={{ color: "var(--fg)" }}>
              {s.expertPlus.length} EXPERT+
            </span>
            <div
              style={{ gridColumn: "1 / -1", display: "flex", gap: 4, flexWrap: "wrap" }}
            >
              {s.expertPlus.map((p) => (
                <span
                  key={p.e.id}
                  title={`${p.e.name} — ${LV_LABEL[p.lvl]}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 8px 3px 3px",
                    borderRadius: 999,
                    border: "1px solid var(--line)",
                    background:
                      p.lvl === "master"
                        ? "color-mix(in oklch, var(--spark) 30%, var(--bg))"
                        : "var(--bg)",
                  }}
                >
                  <AvatarDisplay size="xs" initials={p.e.initials} />
                  <span className="t-mono">{p.e.initials}</span>
                  <span
                    className="t-mono"
                    style={{
                      color: p.lvl === "master" ? "var(--spark)" : "var(--muted-foreground)",
                    }}
                  >
                    {LV_LABEL[p.lvl].toUpperCase().slice(0, 4)}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GapsCard({ rows }: { rows: PerSkillAggregate[] }) {
  return (
    <section
      style={{
        border: "1px solid var(--line-strong)",
        borderRadius: 18,
        padding: "22px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            GAPS · 0–1 PRACTITIONER+
          </span>
          <h2
            style={{
              margin: "4px 0 0",
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 44,
              letterSpacing: "-0.035em",
              lineHeight: 0.95,
            }}
          >
            Dove rischiamo.
          </h2>
        </div>
        <span
          className="t-num"
          style={{ fontSize: 56, letterSpacing: "-0.045em", lineHeight: 1 }}
        >
          {String(rows.length).padStart(2, "0")}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingRight: 4,
        }}
      >
        {rows.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              columnGap: 14,
              padding: "14px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--line)",
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: '"Fraunces", ui-serif, serif',
                  fontStyle: "italic",
                  fontSize: 22,
                  letterSpacing: "-0.02em",
                }}
              >
                {s.name}
              </span>
              <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {s.bucket.toUpperCase()}
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  · {s.people.length} TOTAL · {s.practPlus.length} PRACT.+
                </span>
              </div>
            </div>
            <span
              className="t-mono"
              style={{
                color: s.practPlus.length === 0 ? "var(--spark)" : "var(--fg)",
              }}
            >
              {s.practPlus.length === 0 ? "EMPTY" : "THIN"}
            </span>
            <EditorialPill kind="ghost" size="sm">
              Suggest growth →
            </EditorialPill>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ManagerGaps() {
  const { strengths, gaps } = useMemo(() => {
    const per = perSkillAggregates();
    return {
      strengths: per
        .filter((s) => s.expertPlus.length >= 3)
        .sort((a, b) => b.expertPlus.length - a.expertPlus.length),
      gaps: per
        .filter((s) => s.practPlus.length <= 1)
        .sort((a, b) => a.practPlus.length - b.practPlus.length),
    };
  }, []);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 18,
        overflow: "hidden",
      }}
      className="max-md:!grid-cols-1"
    >
      <StrengthsCard rows={strengths} />
      <GapsCard rows={gaps} />
    </div>
  );
}
