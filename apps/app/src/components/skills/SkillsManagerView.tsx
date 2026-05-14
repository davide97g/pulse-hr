import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  findCatalogByName,
  type SkillDraft,
} from "@/lib/skills-store";
import { type PendingRow } from "@/lib/skills-data";
import {
  removeCell,
  setCell,
  teamMetricsFrom,
  useTeamSkills,
} from "@/lib/team-skills-store";
import {
  SkillsEditorialHero,
  SkillsTabsStrip,
  SkillsViewToggle,
  type SkillsTabsItem,
} from "./SkillsShared";
import { ManagerHeatmap } from "./ManagerHeatmap";
import { ManagerGaps } from "./ManagerGaps";
import { ManagerPending } from "./ManagerPending";
import { SkillsAddPanel } from "./SkillsAddPanel";

type ManagerTab = "heatmap" | "gaps" | "pending";

export function SkillsManagerView(_props: { onViewAsMe?: () => void } = {}) {
  const { grid, proposed } = useTeamSkills();
  const metrics = useMemo(() => teamMetricsFrom(grid, proposed), [grid, proposed]);
  const [tab, setTab] = useState<ManagerTab>("heatmap");
  const [panel, setPanel] = useState<
    | { mode: "closed" }
    | { mode: "edit"; initial: PendingRow }
  >({ mode: "closed" });

  const tabs: SkillsTabsItem<ManagerTab>[] = [
    { id: "heatmap", label: "Heatmap" },
    { id: "gaps", label: "Gaps & strengths" },
    { id: "pending", label: `Pending · ${metrics.pending}` },
  ];

  const onAdjust = (row: PendingRow) => {
    setPanel({ mode: "edit", initial: row });
  };

  const closePanel = () => setPanel({ mode: "closed" });

  const handleSubmit = (draft: SkillDraft) => {
    if (panel.mode !== "edit") return;
    const empId = panel.initial.e.id;
    const skillName = findCatalogByName(panel.initial.s.name)?.name ?? panel.initial.s.name;
    setCell(draft.sk, empId, draft.lvl, true);
    toast.success(`${skillName} validated for ${panel.initial.e.name}`);
    closePanel();
  };

  const handleRemove = () => {
    if (panel.mode !== "edit") return;
    const { s, e } = panel.initial;
    removeCell(s.id, e.id);
    toast(`${s.name} removed from ${e.name}`);
    closePanel();
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 min-h-0 h-full">
      <SkillsViewToggle active="team" />
      <SkillsEditorialHero
        eyebrow={
          <>
            TEAM SKILLS · {metrics.people} PEOPLE · {metrics.skills} SKILLS TRACKED ·{" "}
            {metrics.pending} PENDING
          </>
        }
        title={
          <>
            La <span style={{ fontStyle: "italic" }}>squadra</span>, in competenze
            <span style={{ color: "var(--spark)" }}>.</span>
          </>
        }
        actions={null}
      />

      <SkillsTabsStrip<ManagerTab> active={tab} items={tabs} onChange={setTab} />

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
        {tab === "heatmap" && <ManagerHeatmap metrics={metrics} onAdjust={onAdjust} />}
        {tab === "gaps" && <ManagerGaps onSuggestGrowth={onAdjust} />}
        {tab === "pending" && <ManagerPending onAdjust={onAdjust} />}
      </div>

      <SkillsAddPanel
        open={panel.mode !== "closed"}
        mode="edit"
        initial={
          panel.mode === "edit"
            ? {
                name: panel.initial.s.name,
                bucket: panel.initial.s.bucket,
                level: panel.initial.lvl,
                validatedBy: panel.initial.e.name.split(" ")[0],
              }
            : undefined
        }
        onClose={closePanel}
        onSubmit={handleSubmit}
        onRemove={handleRemove}
      />
    </div>
  );
}
