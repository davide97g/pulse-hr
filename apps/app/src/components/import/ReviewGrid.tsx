import { useState } from "react";
import type { ConflictDecision, ParsedEntity, SuperImportEntityType } from "@pulse-hr/shared/super-import";
import { EntityCard } from "./EntityCard";

type Props = {
  entities: ParsedEntity[];
  selectedIds: Set<string>;
  perRowDecisions: Map<string, ConflictDecision>;
  patches: Map<string, Record<string, unknown>>;
  onToggle: (id: string) => void;
  onDecide: (id: string, d: ConflictDecision) => void;
  onPatch: (id: string, patch: Record<string, unknown>) => void;
};

const FILTERS: Array<{ id: SuperImportEntityType | "all" | "conflicts"; label: string }> = [
  { id: "all", label: "All" },
  { id: "conflicts", label: "Conflicts" },
  { id: "employee", label: "Employees" },
  { id: "commessa", label: "Commesse" },
  { id: "candidate", label: "Candidates" },
  { id: "activity", label: "Activities" },
];

export function ReviewGrid({ entities, selectedIds, perRowDecisions, patches, onToggle, onDecide, onPatch }: Props) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const filtered = entities.filter((e) => {
    if (filter === "all") return true;
    if (filter === "conflicts") return Boolean(e.conflict);
    return e.entityType === filter;
  });
  const conflictCount = entities.filter((e) => e.conflict).length;
  const readyCount = selectedIds.size;

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-3">
        <h4 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Parsed entities</h4>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px]">
          {readyCount} ready · {conflictCount} conflict · {entities.length - readyCount - conflictCount} needs review
        </span>
        <div className="ml-auto flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-2 py-0.5 text-[10px] ${
                filter === f.id ? "border-foreground/40 bg-foreground/10" : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e, i) => (
          <div key={e.id} style={{ animationDelay: `${i * 50}ms` }} className="stagger-in">
            <EntityCard
              entity={e}
              selected={selectedIds.has(e.id)}
              decision={perRowDecisions.get(e.id)}
              patch={patches.get(e.id) ?? {}}
              onToggle={() => onToggle(e.id)}
              onDecide={(d) => onDecide(e.id, d)}
              onPatch={(p) => onPatch(e.id, p)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
