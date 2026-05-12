import { Zap } from "lucide-react";

type Props = { runsLeft: number | null; runsTotal: number | null; resetAt: string | null };

export function QuotaChip({ runsLeft, runsTotal, resetAt }: Props) {
  if (runsLeft == null || runsTotal == null) {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
        <Zap className="h-3 w-3" /> …
      </span>
    );
  }
  const exhausted = runsLeft <= 0;
  const resetHM = resetAt ? new Date(resetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "00:00";
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] ${
        exhausted ? "border-border bg-muted text-muted-foreground" : "border-border bg-card text-foreground"
      }`}
    >
      {!exhausted && <span className="pulse-dot" />}
      <Zap className="h-3 w-3" />
      <b className="font-semibold text-foreground">{runsLeft}</b>
      <span className="text-muted-foreground">of {runsTotal} runs today · resets {resetHM}</span>
    </span>
  );
}
