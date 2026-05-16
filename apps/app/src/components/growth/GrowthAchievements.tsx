import { useMemo, useState } from "react";
import { useAchievements } from "@/lib/tables/achievements";
import { employeeById } from "@/lib/tables/employees";
import { Avatar } from "@/components/app/AppShell";
import type { AchievementCategory, AchievementTier } from "@/lib/mock-data";

const CAT_LABELS: Record<AchievementCategory, string> = {
  craft: "CRAFT",
  leadership: "LEADERSHIP",
  impact: "IMPATTO",
  longevity: "LONGEVITÀ",
  culture: "CULTURA",
};

const MONTHS_IT = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
function fmt(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT[d.getMonth()].toLowerCase()}`;
}

const TIER_GLYPH: Record<AchievementTier, string> = {
  gold: "◆",
  silver: "◆",
  bronze: "◇",
  platinum: "◇",
};

function tierColor(t: AchievementTier): string {
  if (t === "gold" || t === "platinum") return "var(--spark)";
  if (t === "silver") return "var(--fg)";
  return "var(--muted-foreground)";
}

export function GrowthAchievements() {
  const all = useAchievements();
  const [active, setActive] = useState<"all" | AchievementCategory>("all");

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: all.length };
    for (const a of all) out[a.category] = (out[a.category] ?? 0) + 1;
    return out;
  }, [all]);

  const filtered = useMemo(() => {
    const sorted = [...all].sort((a, b) => b.awardedAt.localeCompare(a.awardedAt));
    if (active === "all") return sorted;
    return sorted.filter((a) => a.category === active);
  }, [all, active]);

  const signature = filtered.find((a) => a.signature) ?? filtered[0];
  const rest = filtered.filter((a) => a.id !== signature?.id);

  return (
    <div className="flex flex-col gap-4 min-h-0">
      {/* category strip */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", ...Object.keys(CAT_LABELS)] as Array<"all" | AchievementCategory>).map((id) => {
          const on = id === active;
          const label = id === "all" ? "TUTTI" : CAT_LABELS[id];
          const count = counts[id] ?? 0;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className="t-mono inline-flex items-center"
              style={{
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`,
                background: on ? "var(--ink)" : "transparent",
                color: on ? "var(--paper)" : "var(--muted-foreground)",
                cursor: "pointer",
              }}
            >
              {label}
              <span style={{ color: on ? "var(--spark)" : "var(--muted-foreground)" }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div
        className="grid gap-3 grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr]"
        style={{ flex: 1, minHeight: 0 }}
      >
        {/* Signature spread */}
        {signature ? (
          <SignatureCard a={signature} />
        ) : (
          <div
            className="p-5 flex items-center justify-center"
            style={{ border: "1px dashed var(--line)", borderRadius: 18, color: "var(--muted-foreground)" }}
          >
            <span className="t-mono">NESSUN ACHIEVEMENT</span>
          </div>
        )}

        {[0, 1].map((col) => (
          <div
            key={col}
            className="flex flex-col gap-2.5 overflow-auto pr-1 stagger-in"
            style={{ minHeight: 0 }}
          >
            {rest
              .filter((_, i) => i % 2 === col)
              .map((a) => {
                const e = employeeById(a.employeeId);
                return (
                  <div
                    key={a.id}
                    className="grid items-start"
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 14,
                      padding: "14px 16px",
                      gridTemplateColumns: "44px 1fr",
                      gap: 14,
                      background: "var(--bg)",
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 999,
                        border: `1px solid ${tierColor(a.tier)}`,
                        color: tierColor(a.tier),
                        fontFamily: '"Fraunces", ui-serif, serif',
                        fontSize: 24,
                        background:
                          a.tier === "gold" || a.tier === "platinum"
                            ? "color-mix(in oklch, var(--spark) 12%, transparent)"
                            : "transparent",
                      }}
                    >
                      {TIER_GLYPH[a.tier]}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="t-mono" style={{ color: tierColor(a.tier) }}>
                        {a.tier.toUpperCase()} · {a.period}
                      </span>
                      <span
                        style={{
                          fontFamily: '"Fraunces", ui-serif, serif',
                          fontStyle: "italic",
                          fontSize: 18,
                          letterSpacing: "-0.01em",
                          lineHeight: 1.15,
                        }}
                      >
                        {a.title}
                      </span>
                      <div className="flex items-center" style={{ gap: 8, marginTop: 4 }}>
                        {e && <Avatar initials={e.initials} size={20} />}
                        <span style={{ fontSize: 13 }}>{e?.name ?? "—"}</span>
                        <span style={{ flex: 1 }} />
                        <span
                          className="t-mono"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {fmt(a.awardedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

function SignatureCard({ a }: { a: ReturnType<typeof useAchievements>[number] }) {
  const e = employeeById(a.employeeId);
  return (
    <div
      className="p-5 flex flex-col gap-3.5"
      style={{
        border: "1px solid var(--spark)",
        borderRadius: 18,
        background: "color-mix(in oklch, var(--spark) 10%, transparent)",
        minHeight: 0,
      }}
    >
      <div className="flex items-center" style={{ gap: 12 }}>
        <span className="t-mono">SIGNATURE · {a.tier.toUpperCase()}</span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          · {a.period}
        </span>
      </div>
      <div
        style={{
          fontFamily: '"Fraunces", ui-serif, serif',
          fontSize: 110,
          letterSpacing: "-0.04em",
          lineHeight: 0.9,
          marginTop: -6,
        }}
      >
        ★
      </div>
      <div
        style={{
          fontFamily: '"Fraunces", ui-serif, serif',
          fontStyle: "italic",
          fontSize: 32,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
        }}
      >
        {a.title}
      </div>
      {a.description && (
        <p
          style={{
            margin: 0,
            color: "var(--muted-foreground)",
            fontFamily: '"Fraunces", ui-serif, serif',
            fontStyle: "italic",
            fontSize: 17,
            lineHeight: 1.35,
          }}
        >
          {a.description}
        </p>
      )}
      <div
        className="flex items-center"
        style={{ gap: 10, marginTop: "auto", borderTop: "1px solid var(--line)", paddingTop: 12 }}
      >
        {e && <Avatar initials={e.initials} size={32} />}
        <span style={{ fontWeight: 600, fontSize: 14 }}>{e?.name ?? "—"}</span>
        <span style={{ flex: 1 }} />
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {fmt(a.awardedAt)}
        </span>
      </div>
    </div>
  );
}
