import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import {
  skill as resolveSkill,
  type LevelDistribution,
  type MySkillRow,
  type SkillLevel,
} from "@/lib/skills-data";
import {
  createMySkill,
  distributionOf,
  removeMySkill,
  replaceMySkills,
  updateMySkill,
  useMySkills,
  type SkillDraft,
} from "@/lib/skills-store";
import { SkillsEditorialHero, SkillsTabsStrip, SkillsViewToggle } from "./SkillsShared";
import { ConstellationHero } from "./ConstellationHero";
import { IndexHero } from "./IndexHero";
import { ManifestoHero } from "./ManifestoHero";
import { SkillsAddPanel } from "./SkillsAddPanel";
import { SkillsEmpty } from "./SkillsEmpty";

type SelfVariant = "constellation" | "index" | "manifesto";
type PanelState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; row: MySkillRow };

const TABS: { id: SelfVariant; label: string }[] = [
  { id: "constellation", label: "Constellation" },
  { id: "index", label: "Index" },
  { id: "manifesto", label: "Manifesto" },
];

export function SkillsSelfView() {
  const skills = useMySkills();
  const [variant, setVariant] = useState<SelfVariant>("constellation");
  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });
  const [hoveredLevel, setHoveredLevel] = useState<SkillLevel | null>(null);
  const totals = useMemo(() => distributionOf(skills), [skills]);

  const openAdd = () => setPanel({ mode: "add" });
  const openEdit = (row: MySkillRow) => setPanel({ mode: "edit", row });
  const closePanel = () => setPanel({ mode: "closed" });

  const handleSubmit = (draft: SkillDraft) => {
    if (panel.mode === "edit") {
      const updated = updateMySkill(panel.row.id, draft);
      if (!updated) return;
      const before = skills;
      toast.success(`${resolveSkill(draft.sk)?.name ?? "Skill"} re-proposed`, {
        action: { label: "Undo", onClick: () => replaceMySkills(before) },
      });
    } else {
      // prevent duplicates of the same catalog skill
      const dupe = skills.find((r) => r.sk === draft.sk);
      if (dupe) {
        toast.error(
          `${resolveSkill(draft.sk)?.name ?? "Skill"} is already in your matrix — edit it instead.`,
        );
        return;
      }
      const before = skills;
      const created = createMySkill(draft);
      toast.success(`${resolveSkill(created.sk)?.name ?? "Skill"} added as proposed`, {
        action: { label: "Undo", onClick: () => replaceMySkills(before) },
      });
    }
    closePanel();
  };

  const handleRemove = () => {
    if (panel.mode !== "edit") return;
    const before = skills;
    const removed = removeMySkill(panel.row.id);
    if (!removed) return;
    toast(`${resolveSkill(removed.sk)?.name ?? "Skill"} removed`, {
      action: { label: "Undo", onClick: () => replaceMySkills(before) },
    });
    closePanel();
  };

  if (skills.length === 0) {
    return <SkillsEmpty onAdd={openAdd} />;
  }

  const panelInitial =
    panel.mode === "edit"
      ? (() => {
          const cat = resolveSkill(panel.row.sk);
          return {
            name: cat?.name,
            bucket: cat?.bucket,
            level: panel.row.lvl,
            note: panel.row.note,
            validatedBy: panel.row.by ?? undefined,
            validatedOn: panel.row.val === "validated" ? panel.row.upd : undefined,
          };
        })()
      : undefined;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 min-h-0 h-full">
      <SkillsViewToggle active="me" />
      <SkillsEditorialHero
        eyebrow={
          <>
            SKILLS MATRIX · {totals.n} SKILLS · {totals.val} VALIDATED ·{" "}
            {totals.n - totals.val} PROPOSED
          </>
        }
        title={
          <>
            Le tue <span style={{ fontStyle: "italic" }}>competenze</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </>
        }
        actions={
          <EditorialPill kind="spark" size="sm" onClick={openAdd}>
            + Add skill
          </EditorialPill>
        }
      />

      <SkillsTabsStrip<SelfVariant> active={variant} items={TABS} onChange={setVariant} />

      <div
        className="stagger-in"
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          overflow: "hidden",
        }}
      >
        {variant === "constellation" && (
          <div
            className="constellation-split"
            style={{
              flex: 1,
              minHeight: 0,
              display: "grid",
              gridTemplateColumns: "minmax(0, 4fr) minmax(220px, 1fr)",
              gap: 16,
            }}
          >
            <ConstellationHero
              skills={skills}
              externalHoveredLevel={hoveredLevel}
              onSkillClick={openEdit}
            />
            <ConstellationKpiStack
              totals={totals}
              hoveredLevel={hoveredLevel}
              onHover={setHoveredLevel}
            />
          </div>
        )}
        {variant === "index" && <IndexHero skills={skills} onSkillClick={openEdit} />}
        {variant === "manifesto" && (
          <ManifestoHero skills={skills} onSkillClick={openEdit} />
        )}
      </div>

      <SkillsAddPanel
        key={panel.mode === "edit" ? panel.row.id : panel.mode}
        open={panel.mode !== "closed"}
        mode={panel.mode === "edit" ? "edit" : "add"}
        initial={panelInitial}
        onClose={closePanel}
        onSubmit={handleSubmit}
        onRemove={handleRemove}
      />
    </div>
  );
}

interface KpiRow {
  label: string;
  value: number;
  level: SkillLevel | null;
  isSpark: boolean;
}

function ConstellationKpiStack({
  totals,
  hoveredLevel,
  onHover,
}: {
  totals: LevelDistribution;
  hoveredLevel: SkillLevel | null;
  onHover: (level: SkillLevel | null) => void;
}) {
  /* Order reversed — Master at the top so the recap reads "best → entry-level"
     and aligns with the constellation's outer-ring-as-mastery metaphor.
     TOTAL anchors the bottom as the summative line. */
  const rows: KpiRow[] = [
    { label: "MASTER", value: totals.dist.master, level: "master", isSpark: true },
    { label: "EXPERT", value: totals.dist.expert, level: "expert", isSpark: false },
    {
      label: "PRACTITIONER",
      value: totals.dist.practitioner,
      level: "practitioner",
      isSpark: false,
    },
    { label: "NOVICE", value: totals.dist.novice, level: "novice", isSpark: false },
    { label: "TOTAL", value: totals.n, level: null, isSpark: false },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "repeat(5, 1fr)",
        border: "1px solid var(--line-strong)",
        borderRadius: 14,
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      {rows.map((row, i) => {
        const hovered = row.level !== null && row.level === hoveredLevel;
        const tint = row.isSpark
          ? "color-mix(in oklch, var(--spark) 9%, transparent)"
          : "transparent";
        const hoverTint =
          row.level === "master"
            ? "color-mix(in oklch, var(--spark) 18%, transparent)"
            : "color-mix(in oklch, var(--fg) 6%, transparent)";
        return (
          <div
            key={row.label}
            onMouseEnter={() => row.level && onHover(row.level)}
            onMouseLeave={() => row.level && onHover(null)}
            style={{
              padding: "14px 18px",
              borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none",
              background: hovered ? hoverTint : tint,
              boxShadow: hovered
                ? `inset 3px 0 0 0 ${row.level === "master" ? "var(--spark)" : "var(--fg)"}`
                : "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 4,
              cursor: row.level ? "pointer" : "default",
              transition: "background 140ms ease-out, box-shadow 140ms ease-out",
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {row.label}
            </span>
            <div
              className="t-num"
              style={{
                fontSize: 36,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                color: row.isSpark ? "var(--spark)" : "var(--fg)",
              }}
            >
              {String(row.value).padStart(2, "0")}
            </div>
          </div>
        );
      })}
    </div>
  );
}
