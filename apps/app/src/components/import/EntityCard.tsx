import { useState } from "react";
import type { ConflictDecision, ParsedEntity, SuperImportEntityType } from "@pulse-hr/shared/super-import";
import { Check } from "lucide-react";
import { ConflictPill } from "./ConflictPill";

const BADGE: Record<SuperImportEntityType, { label: string; tone: string }> = {
  employee: { label: "EMPLOYEE", tone: "bg-cyan-500/15 text-cyan-400" },
  commessa: { label: "COMMESSA", tone: "bg-lime-500/15 text-lime-400" },
  candidate: { label: "CANDIDATE", tone: "bg-fuchsia-500/15 text-fuchsia-400" },
  client: { label: "CLIENT", tone: "bg-amber-500/15 text-amber-400" },
  activity: { label: "ACTIVITY", tone: "bg-sky-500/15 text-sky-400" },
  allocation: { label: "ALLOCATION", tone: "bg-violet-500/15 text-violet-400" },
  leave: { label: "LEAVE", tone: "bg-pink-500/15 text-pink-400" },
  timesheet: { label: "TIMESHEET", tone: "bg-emerald-500/15 text-emerald-400" },
};

type Props = {
  entity: ParsedEntity;
  selected: boolean;
  decision?: ConflictDecision;
  patch: Record<string, unknown>;
  onToggle: () => void;
  onDecide: (d: ConflictDecision) => void;
  onPatch: (patch: Record<string, unknown>) => void;
};

export function EntityCard({ entity, selected, decision, patch, onToggle, onDecide, onPatch }: Props) {
  const [expanded, setExpanded] = useState(false);
  const data = { ...entity.data, ...patch };
  const badge = BADGE[entity.entityType];
  const title = String(data.name ?? data.title ?? data.code ?? "Untitled");
  const subtitle =
    Object.entries(data)
      .filter(([k]) => !["name", "title", "code"].includes(k))
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
      .join(" · ") || "—";

  return (
    <div
      className={`relative rounded-lg border bg-card p-3 text-[11px] transition ${
        entity.conflict ? "border-[--color-labs]/40" : "border-border"
      }`}
    >
      <button
        type="button"
        aria-label={selected ? "Deselect" : "Select"}
        onClick={onToggle}
        className={`absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-sm transition ${
          selected ? "bg-lime-400 text-black" : "border border-border bg-transparent text-transparent"
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </button>
      <span className={`mb-2 inline-block rounded px-1.5 py-0.5 font-mono text-[9px] tracking-wider ${badge.tone}`}>
        {badge.label}
      </span>
      <button type="button" className="block w-full text-left" onClick={() => setExpanded((x) => !x)}>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-muted-foreground">{subtitle}</div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-border pt-2">
          {Object.entries(data).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 text-[10px]">
              <span className="w-20 text-muted-foreground">{key}</span>
              <input
                value={typeof value === "string" || typeof value === "number" ? String(value) : JSON.stringify(value)}
                onChange={(e) => onPatch({ [key]: e.target.value })}
                className="flex-1 rounded border border-border bg-background px-2 py-1 text-foreground"
              />
            </label>
          ))}
        </div>
      )}

      {entity.conflict && (
        <ConflictPill matchedLabel={entity.conflict.matchedLabel} decision={decision} onDecide={onDecide} />
      )}
    </div>
  );
}
