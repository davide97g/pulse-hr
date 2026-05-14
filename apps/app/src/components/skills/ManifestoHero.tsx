import { useMemo } from "react";
import { LevelSegments } from "@pulse-hr/ui/atoms/LevelSegments";
import {
  LV_CAPTION,
  LV_INDEX,
  LV_LABEL,
  MY_SKILLS,
  skill,
  type MySkillRow,
  type SkillBucket,
  type SkillLevel,
  type SkillValidation,
} from "@/lib/skills-data";
import { distributionOf } from "@/lib/skills-store";
import { ValidationTag } from "./SkillsShared";

interface RibbonRow {
  id: string;
  name: string;
  bucket: SkillBucket;
  lvl: SkillLevel;
  val: SkillValidation;
  upd: string;
  by: string | null;
}

const DIST_ORDER: SkillLevel[] = ["master", "expert", "practitioner", "novice"];

export function ManifestoHero({
  skills,
  onSkillClick,
}: {
  skills?: MySkillRow[];
  onSkillClick?: (row: MySkillRow) => void;
} = {}) {
  const source = skills ?? MY_SKILLS;
  const totals = useMemo(() => distributionOf(source), [source]);
  const rows = useMemo(() => {
    const enriched: RibbonRow[] = [];
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
      });
    }
    enriched.sort((a, b) => {
      const dl = LV_INDEX[b.lvl] - LV_INDEX[a.lvl];
      if (dl !== 0) return dl;
      if (a.val !== b.val) return a.val === "validated" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return enriched;
  }, [source]);

  const handleRowClick = onSkillClick
    ? (id: string) => {
        const row = source.find((r) => r.id === id);
        if (row) onSkillClick(row);
      }
    : undefined;

  return (
    <>
      <div
        style={{
          border: "1px solid var(--line-strong)",
          borderRadius: 18,
          padding: "32px 40px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          background: "var(--bg)",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
        className="max-md:!grid-cols-2"
      >
        <span
          className="t-mono"
          style={{
            position: "absolute",
            left: 40,
            top: 16,
            color: "var(--muted-foreground)",
          }}
        >
          DISTRIBUTION · TODAY
        </span>
        {DIST_ORDER.map((lvl, i) => {
          const v = totals.dist[lvl];
          const isMaster = lvl === "master";
          return (
            <div
              key={lvl}
              style={{
                paddingLeft: i === 0 ? 0 : 18,
                paddingTop: 18,
                borderLeft: i === 0 ? "none" : "1px solid var(--line)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <span
                className="t-mono"
                style={{ color: isMaster ? "var(--spark)" : "var(--muted-foreground)" }}
              >
                {LV_LABEL[lvl].toUpperCase()}
              </span>
              <div
                className="sm-numeral"
                style={{ fontSize: 168, color: isMaster ? "var(--spark)" : "var(--fg)" }}
              >
                {String(v).padStart(2, "0")}
              </div>
              <LevelSegments level={lvl} size={26} />
              <span
                className="t-mono"
                style={{ color: "var(--muted-foreground)", marginTop: 4 }}
              >
                {LV_CAPTION[lvl]}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid var(--line)",
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "44px 1.5fr 0.6fr 160px 1fr 24px",
            gap: 14,
            alignItems: "center",
            padding: "10px 18px",
            borderBottom: "1px solid var(--line-strong)",
            background: "var(--bg-2)",
          }}
        >
          {["#", "SKILL", "BUCKET", "LEVEL", "STATE", ""].map((h, i) => (
            <span
              key={i}
              className="t-mono"
              style={{ color: "var(--muted-foreground)" }}
            >
              {h}
            </span>
          ))}
        </div>
        <div
          className="scrollbar-thin"
          style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
        >
          {rows.map((s, i) => (
            <div
              key={s.id}
              role={handleRowClick ? "button" : undefined}
              tabIndex={handleRowClick ? 0 : undefined}
              onClick={() => handleRowClick?.(s.id)}
              onKeyDown={(e) => {
                if (!handleRowClick) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRowClick(s.id);
                }
              }}
              style={{
                display: "grid",
                gridTemplateColumns: "44px 1.5fr 0.6fr 160px 1fr 24px",
                gap: 14,
                alignItems: "center",
                padding: "14px 18px",
                borderTop: i === 0 ? "none" : "1px solid var(--line)",
                position: "relative",
                background:
                  s.val === "proposed"
                    ? "color-mix(in oklch, var(--spark) 5%, transparent)"
                    : "transparent",
                cursor: handleRowClick ? "pointer" : "default",
                transition: "background 140ms ease-out",
              }}
              onMouseEnter={(e) => {
                if (!handleRowClick || s.val === "proposed") return;
                (e.currentTarget as HTMLDivElement).style.background =
                  "color-mix(in oklch, var(--fg) 5%, transparent)";
              }}
              onMouseLeave={(e) => {
                if (!handleRowClick || s.val === "proposed") return;
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              <span className="t-num" style={{ fontSize: 18, color: "var(--muted-foreground)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
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
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {s.bucket.toUpperCase()}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <LevelSegments level={s.lvl} size={20} />
                <span
                  style={{
                    fontFamily: '"Fraunces", ui-serif, serif',
                    fontStyle: "italic",
                    fontSize: 15,
                    color: s.lvl === "master" ? "var(--spark)" : "var(--fg)",
                  }}
                >
                  {LV_LABEL[s.lvl]}
                </span>
              </span>
              <ValidationTag val={s.val} by={s.by} upd={s.upd} />
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                ↗
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
