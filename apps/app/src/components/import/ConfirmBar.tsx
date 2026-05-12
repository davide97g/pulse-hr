import { useState } from "react";

type Props = {
  selectedCount: number;
  conflictPending: number;
  byEntityCounts: Record<string, number>;
  onDiscard: () => void;
  onConfirm: () => void;
};

const N_PIECES = 20;
const COLORS = ["#b4ff39", "#39e1ff", "#c06bff", "#ff7a9c", "#ffd93d"];

export function ConfirmBar({ selectedCount, conflictPending, byEntityCounts, onDiscard, onConfirm }: Props) {
  const [bursting, setBursting] = useState(false);

  function handleConfirm() {
    setBursting(true);
    onConfirm();
    setTimeout(() => setBursting(false), 1600);
  }

  const summary = Object.entries(byEntityCounts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${n} ${k}${n > 1 ? "s" : ""}`)
    .join(" · ");

  return (
    <div className="sticky bottom-3 mt-6 rounded-xl border border-border bg-card/95 px-4 py-3 backdrop-blur">
      {bursting && (
        <div className="pointer-events-none absolute inset-x-0 bottom-full flex justify-center">
          {Array.from({ length: N_PIECES }).map((_, i) => (
            <span
              key={i}
              className="confetti-piece absolute"
              style={{
                left: `${50 + (Math.random() * 60 - 30)}%`,
                background: COLORS[i % COLORS.length],
                animationDelay: `${i * 25}ms`,
              }}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 text-sm">
        <span className="flex-1">
          Import <b>{selectedCount} records</b> · {summary || "—"}.
          {conflictPending > 0 && <span className="ml-1 text-[--color-labs]">{conflictPending} conflict pending decision.</span>}
        </span>
        <button type="button" onClick={onDiscard} className="text-xs text-muted-foreground hover:text-foreground">
          Discard
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={selectedCount === 0}
          className="rounded-md bg-lime-400 px-3 py-1.5 font-mono text-xs font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Import all ↵
        </button>
      </div>
    </div>
  );
}
