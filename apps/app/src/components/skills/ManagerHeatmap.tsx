import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { AvatarDisplay } from "@pulse-hr/ui/atoms/AvatarDisplay";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { LevelSegments } from "@pulse-hr/ui/atoms/LevelSegments";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@pulse-hr/ui/primitives/hover-card";
import {
  LV_LABEL,
  LV_PCT,
  MY_ID,
  SKILL_CATALOG,
  SKILL_TEAM,
  employee as resolveEmployee,
  skill as resolveSkill,
  type LevelDistribution,
  type PendingRow,
  type SkillLevel,
  type SkillTeamMember,
  type TeamMetrics,
} from "@/lib/skills-data";
import {
  cellLevelFrom,
  countByLevelFrom,
  isProposedFrom,
  useTeamSkills,
} from "@/lib/team-skills-store";
import { useMySkills } from "@/lib/skills-store";
import { ValidationTag } from "./SkillsShared";

const NAME_W = 220;
const CELL = 28;
const GAP = 3;
const LABEL_ROW_H = 110;

function bgFor(lvl: SkillLevel | undefined): string {
  if (!lvl) return "var(--bg-2)";
  return `color-mix(in oklch, var(--spark) ${LV_PCT[lvl]}%, var(--bg))`;
}

function ManagerKpis({ k }: { k: TeamMetrics }) {
  const cards: [string, string | number, "spark" | null, string][] = [
    ["TOTAL SKILLS TRACKED", k.totalCells, null, `${k.skills} skills · ${k.people} people`],
    ["COVERAGE", `${k.coverage}%`, "spark", "Skills with ≥1 validated person"],
    ["COVERAGE GAPS", k.gaps, null, "No one at Practitioner+"],
    ["PENDING VALIDATIONS", k.pending, "spark", "Proposed · awaiting review"],
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 0,
        border: "1px solid var(--line-strong)",
        borderRadius: 14,
        overflow: "hidden",
      }}
      className="max-md:!grid-cols-2"
    >
      {cards.map(([l, v, accent, sub], i) => (
        <div
          key={l}
          style={{
            padding: "16px 20px",
            borderRight: i < 3 ? "1px solid var(--line)" : "none",
            background:
              accent === "spark"
                ? "color-mix(in oklch, var(--spark) 8%, transparent)"
                : "transparent",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {l}
          </span>
          <div
            className="t-num"
            style={{
              fontSize: 40,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              color: accent === "spark" ? "var(--spark)" : "var(--fg)",
            }}
          >
            {v}
          </div>
          <span className="t-mono" style={{ color: "var(--fg)" }}>
            {sub}
          </span>
        </div>
      ))}
    </div>
  );
}

interface ScoredMember extends SkillTeamMember {
  pts: number;
  totals: LevelDistribution;
}

export function ManagerHeatmap({
  metrics,
  onAdjust,
}: {
  metrics: TeamMetrics;
  onAdjust?: (row: PendingRow) => void;
}) {
  const { grid, proposed } = useTeamSkills();
  const mySkills = useMySkills();

  const team: ScoredMember[] = useMemo(() => {
    return SKILL_TEAM.map((e) => {
      const t = countByLevelFrom(e.id, grid, proposed, mySkills);
      const pts =
        t.dist.master * 4 +
        t.dist.expert * 3 +
        t.dist.practitioner * 2 +
        t.dist.novice * 1;
      return { ...e, pts, totals: t };
    }).sort((a, b) => b.pts - a.pts);
  }, [grid, proposed, mySkills]);

  const orderedSkills = useMemo(() => {
    const hard = SKILL_CATALOG.filter((s) => s.bucket === "hard");
    const soft = SKILL_CATALOG.filter((s) => s.bucket === "soft");
    return [...hard, ...soft];
  }, []);

  const noteFor = (skillId: string, empId: string): string | undefined => {
    if (empId !== MY_ID) return undefined;
    return mySkills.find((r) => r.sk === skillId)?.note;
  };

  const totalW = NAME_W + orderedSkills.length * (CELL + GAP) + 16;

  return (
    <>
      <ManagerKpis k={metrics} />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid var(--line-strong)",
          borderRadius: 14,
          background: "var(--bg)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid var(--line)",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              PEOPLE × SKILLS · HOVER A CELL FOR DETAIL
            </span>
            <div
              style={{
                fontFamily: '"Fraunces", ui-serif, serif',
                fontStyle: "italic",
                fontSize: 22,
                letterSpacing: "-0.02em",
                marginTop: 2,
              }}
            >
              Dove la squadra è densa, dove è sottile.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              LEVEL
            </span>
            {(
              [
                ["NOVICE", "novice"],
                ["PRACT.", "practitioner"],
                ["EXPERT", "expert"],
                ["MASTER", "master"],
              ] as const
            ).map(([lbl, lvl]) => (
              <span key={lvl} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: bgFor(lvl),
                    border: "1px solid var(--line)",
                  }}
                />
                <span
                  className="t-mono"
                  style={{ color: lvl === "master" ? "var(--spark)" : "var(--muted-foreground)" }}
                >
                  {lbl}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: "8px 18px 18px",
          }}
          className="scrollbar-thin"
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${NAME_W}px repeat(${orderedSkills.length}, ${CELL}px)`,
              gap: `${GAP}px`,
              alignItems: "center",
              minWidth: totalW,
            }}
          >
            <div
              style={{
                height: LABEL_ROW_H,
                position: "sticky",
                left: 0,
                background: "var(--bg)",
                zIndex: 4,
                borderRight: "1px solid var(--line)",
              }}
            />
            {orderedSkills.map((s, i) => {
              const firstSoft =
                s.bucket === "soft" && orderedSkills[i - 1]?.bucket === "hard";
              return (
                <div
                  key={`h-${s.id}`}
                  style={{
                    height: LABEL_ROW_H,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "end",
                    borderLeft: firstSoft ? "1px dashed var(--line-strong)" : "none",
                    paddingBottom: 6,
                  }}
                >
                  <span
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 10,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--muted-foreground)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.name}
                  </span>
                </div>
              );
            })}

            {team.map((e, ri) => (
              <HeatmapRow
                key={e.id}
                e={e}
                isFirst={ri === 0}
                orderedSkills={orderedSkills}
                cellLevel={(sId, eId) => cellLevelFrom(grid, sId, eId)}
                cellProposed={(sId, eId) => isProposedFrom(proposed, sId, eId)}
                noteFor={noteFor}
                onAdjust={onAdjust}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function HeatmapRow({
  e,
  isFirst,
  orderedSkills,
  cellLevel,
  cellProposed,
  noteFor,
  onAdjust,
}: {
  e: ScoredMember;
  isFirst: boolean;
  orderedSkills: typeof SKILL_CATALOG;
  cellLevel: (skillId: string, empId: string) => SkillLevel | undefined;
  cellProposed: (skillId: string, empId: string) => boolean;
  noteFor: (skillId: string, empId: string) => string | undefined;
  onAdjust?: (row: PendingRow) => void;
}) {
  return (
    <>
      <div
        style={{
          position: "sticky",
          left: 0,
          background: "var(--bg)",
          borderRight: "1px solid var(--line)",
          borderTop: isFirst ? "1px solid var(--line)" : "none",
          borderBottom: "1px solid var(--line)",
          padding: "10px 12px 10px 0",
          display: "flex",
          alignItems: "center",
          gap: 10,
          zIndex: 2,
        }}
      >
        <AvatarDisplay size="sm" initials={e.initials} />
        <div style={{ minWidth: 0, lineHeight: 1.1 }}>
          <div
            style={{
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: e.id === MY_ID ? "italic" : "normal",
              fontSize: 17,
              letterSpacing: "-0.015em",
              color: "var(--fg)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {e.name}
          </div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {e.role} · {e.dept}
          </span>
        </div>
        <span style={{ flex: 1 }} />
        <span className="t-num" style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
          {e.totals.n}
        </span>
      </div>

      {orderedSkills.map((s, ci) => {
        const lvl = cellLevel(s.id, e.id);
        const proposed = !!lvl && cellProposed(s.id, e.id);
        const firstSoft =
          s.bucket === "soft" && orderedSkills[ci - 1]?.bucket === "hard";
        const cell = (
          <div
            style={{
              width: CELL,
              height: CELL,
              background: bgFor(lvl),
              border: lvl ? "1px solid var(--line)" : "1px dashed var(--line)",
              borderLeft: firstSoft
                ? "1px dashed var(--line-strong)"
                : lvl
                  ? "1px solid var(--line)"
                  : "1px dashed var(--line)",
              borderRadius: 4,
              position: "relative",
              cursor: lvl ? "pointer" : "default",
              transition: "transform 120ms ease-out",
            }}
            className={lvl ? "hover:scale-110" : undefined}
          >
            {proposed && <span className="proposed-pip" />}
          </div>
        );
        if (!lvl) {
          return <div key={`c-${s.id}-${e.id}`}>{cell}</div>;
        }
        const note = noteFor(s.id, e.id);
        const handleAdjust = () => {
          if (!onAdjust) return;
          const sCat = resolveSkill(s.id);
          const eMember = resolveEmployee(e.id);
          if (!sCat || !eMember) return;
          onAdjust({ s: sCat, e: eMember, lvl, key: `${s.id}:${e.id}` });
        };
        return (
          <HoverCard key={`c-${s.id}-${e.id}`} openDelay={120} closeDelay={60}>
            <HoverCardTrigger asChild>{cell}</HoverCardTrigger>
            <HoverCardContent align="center" className="w-72 p-4">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AvatarDisplay size="sm" initials={e.initials} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: '"Fraunces", ui-serif, serif',
                        fontStyle: "italic",
                        fontSize: 16,
                      }}
                    >
                      {e.name}
                    </div>
                    <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                      {e.role.toUpperCase()} · {e.dept.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    borderTop: "1px solid var(--line)",
                    paddingTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    {s.name.toUpperCase()}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <LevelSegments level={lvl} size="md" />
                    <span
                      style={{
                        fontFamily: '"Fraunces", ui-serif, serif',
                        fontStyle: "italic",
                        fontSize: 18,
                        color: lvl === "master" ? "var(--spark)" : "var(--fg)",
                      }}
                    >
                      {LV_LABEL[lvl]}
                    </span>
                  </div>
                  <ValidationTag
                    val={proposed ? "proposed" : "validated"}
                    by={proposed ? null : "—"}
                    upd={proposed ? "awaiting" : "recently"}
                  />
                  {note && (
                    <p
                      style={{
                        margin: 0,
                        marginTop: 4,
                        fontFamily: '"Fraunces", ui-serif, serif',
                        fontStyle: "italic",
                        fontSize: 13,
                        color: "var(--fg)",
                        lineHeight: 1.4,
                      }}
                    >
                      «{note}»
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <Link
                    to="/people/$employeeId"
                    params={{ employeeId: e.id }}
                    style={{ textDecoration: "none" }}
                  >
                    <EditorialPill kind="ghost" size="sm">
                      View profile
                    </EditorialPill>
                  </Link>
                  <EditorialPill kind="spark" size="sm" onClick={handleAdjust}>
                    Adjust →
                  </EditorialPill>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </>
  );
}
