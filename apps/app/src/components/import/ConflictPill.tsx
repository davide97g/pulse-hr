import type { ConflictDecision } from "@pulse-hr/shared/super-import";
import { AlertTriangle } from "lucide-react";

type Props = {
  matchedLabel: string;
  decision?: ConflictDecision;
  onDecide: (d: ConflictDecision) => void;
};

const ACTIONS: Array<{ id: ConflictDecision; label: string; primary?: boolean }> = [
  { id: "skip", label: "Skip" },
  { id: "update", label: "Update existing", primary: true },
  { id: "create_anyway", label: "Create anyway" },
];

export function ConflictPill({ matchedLabel, decision, onDecide }: Props) {
  return (
    <div className="mt-2 rounded-md border border-[--color-labs]/40 bg-background/40 p-2 text-[11px]">
      <div className="flex items-center gap-1 text-[--color-labs]">
        <AlertTriangle className="h-3 w-3" />
        may match existing: <b className="font-medium">{matchedLabel}</b>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onDecide(a.id)}
            className={`rounded border px-2 py-0.5 text-[10px] transition press-scale ${
              decision === a.id
                ? "border-[--color-labs]/60 bg-[--color-labs]/15 text-[--color-labs]"
                : a.primary
                  ? "border-[--color-labs]/40 text-[--color-labs] hover:bg-[--color-labs]/10"
                  : "border-border text-foreground/80 hover:bg-muted"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
