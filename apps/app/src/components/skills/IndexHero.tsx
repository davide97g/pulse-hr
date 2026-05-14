import { useMemo } from "react";
import { LevelDots } from "@pulse-hr/ui/atoms/LevelDots";
import {
  LV_INDEX,
  MY_SKILLS,
  skill,
  type MySkillRow,
  type SkillBucket,
  type SkillLevel,
  type SkillValidation,
} from "@/lib/skills-data";
import { LvLabel, ValidationTag } from "./SkillsShared";

interface IndexRow {
  id: string;
  name: string;
  bucket: SkillBucket;
  lvl: SkillLevel;
  val: SkillValidation;
  upd: string;
  by: string | null;
  note?: string;
}

function IndexCol({
  title,
  caption,
  rows,
  onRowClick,
}: {
  title: string;
  caption: string;
  rows: IndexRow[];
  onRowClick?: (id: string) => void;
}) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minHeight: 0,
        paddingTop: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          borderTop: "2px solid var(--fg)",
          paddingTop: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: '"Fraunces", ui-serif, serif',
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 44,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {title}
        </h2>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {rows.length} · {caption}
        </span>
      </div>
      <div
        className="scrollbar-thin"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "4px 4px 8px",
          gap: 2,
        }}
      >
        {rows.map((s, i) => (
          <div
            key={s.id}
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onClick={() => onRowClick?.(s.id)}
            onKeyDown={(e) => {
              if (!onRowClick) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onRowClick(s.id);
              }
            }}
            className={s.val === "proposed" ? "sk-pending-halo" : undefined}
            style={{
              display: "grid",
              gridTemplateColumns: "28px minmax(0, 1fr) auto auto",
              gap: 16,
              alignItems: "baseline",
              padding: "16px 14px",
              borderTop:
                i === 0 || s.val === "proposed" || rows[i - 1]?.val === "proposed"
                  ? "none"
                  : "1px solid var(--line)",
              borderRadius: s.val === "proposed" ? 12 : 0,
              background: s.val === "proposed" ? "var(--bg)" : "transparent",
              position: "relative",
              minWidth: 0,
              cursor: onRowClick ? "pointer" : "default",
              transition: "background 140ms ease-out",
            }}
            onMouseEnter={(e) => {
              if (onRowClick && s.val !== "proposed") {
                (e.currentTarget as HTMLDivElement).style.background =
                  "color-mix(in oklch, var(--fg) 5%, transparent)";
              }
            }}
            onMouseLeave={(e) => {
              if (onRowClick && s.val !== "proposed") {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }
            }}
          >
            <span className="t-num" style={{ fontSize: 16, color: "var(--muted-foreground)" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontFamily: '"Fraunces", ui-serif, serif',
                fontStyle: "italic",
                fontSize: 28,
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.name}
            </span>
            <LevelDots level={s.lvl} />
            <LvLabel level={s.lvl} />
            <span
              style={{
                gridColumn: "2 / -1",
                marginTop: -4,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <ValidationTag val={s.val} by={s.by} upd={s.upd} />
              {s.note && (
                <span
                  style={{
                    marginLeft: 14,
                    fontFamily: '"Fraunces", ui-serif, serif',
                    fontStyle: "italic",
                    fontSize: 13,
                    color: "var(--muted-foreground)",
                    letterSpacing: "-0.005em",
                  }}
                >
                  «{s.note}»
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function IndexHero({
  skills,
  onSkillClick,
}: {
  skills?: MySkillRow[];
  onSkillClick?: (row: MySkillRow) => void;
} = {}) {
  const source = skills ?? MY_SKILLS;
  const { hard, soft } = useMemo(() => {
    const enriched: IndexRow[] = [];
    for (const r of source) {
      const cat = skill(r.sk);
      if (!cat) continue;
      enriched.push({
        id: r.id,
        name: cat.name,
        bucket: cat.bucket,
        lvl: r.lvl,
        val: r.val,
        upd: r.upd,
        by: r.by,
        note: r.note,
      });
    }
    enriched.sort((a, b) => LV_INDEX[b.lvl] - LV_INDEX[a.lvl]);
    return {
      hard: enriched.filter((s) => s.bucket === "hard"),
      soft: enriched.filter((s) => s.bucket === "soft"),
    };
  }, [source]);

  const handleRowClick = onSkillClick
    ? (id: string) => {
        const row = source.find((r) => r.id === id);
        if (row) onSkillClick(row);
      }
    : undefined;

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 56,
        overflow: "hidden",
      }}
      className="max-md:!grid-cols-1 max-md:gap-8"
    >
      <IndexCol
        title="Hard."
        caption="TECH · TOOLS · LANGS"
        rows={hard}
        onRowClick={handleRowClick}
      />
      <IndexCol
        title="Soft."
        caption="HOW YOU SHOW UP"
        rows={soft}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
