import { useMemo, useState } from "react";
import { teamMetrics, type PendingRow } from "@/lib/skills-data";
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
  const metrics = useMemo(teamMetrics, []);
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
        {tab === "heatmap" && <ManagerHeatmap metrics={metrics} />}
        {tab === "gaps" && <ManagerGaps />}
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
        onClose={() => setPanel({ mode: "closed" })}
      />
    </div>
  );
}
