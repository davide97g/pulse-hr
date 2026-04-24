import { Coins, ExternalLink, Sparkles, TrendingUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@pulse-hr/ui/primitives/popover";
import { cn } from "@/lib/utils";
import { useVotingPower } from "./CompanyProfileStore";

const FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL ?? "https://feedback.pulsehr.it";

export function VotingPowerChip({ className }: { className?: string }) {
  const power = useVotingPower();
  const boosted = power.power > power.baseline;
  const multiplier = power.baseline > 0 ? (power.power / power.baseline).toFixed(2) : "1.00";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "hidden md:inline-flex h-9 items-center gap-1.5 px-2.5 rounded-md border bg-background/80 hover:bg-muted text-sm press-scale transition-colors",
            boosted && "border-[color:var(--labs)]/40",
            className,
          )}
          title={`Voting power: ${power.power} (baseline ${power.baseline})`}
        >
          <Coins
            className={cn(
              "h-4 w-4",
              boosted ? "text-[color:var(--labs)]" : "text-muted-foreground",
            )}
          />
          <span className="font-mono font-medium tabular-nums">{power.power}</span>
          {boosted && (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--labs)] pulse-dot" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0 overflow-hidden">
        <div className="px-4 py-3 border-b bg-gradient-to-br from-[color:var(--labs)]/[0.08] via-transparent to-transparent">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground inline-flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3 w-3 text-[color:var(--labs)]" />
            Your power
          </div>
          <div className="flex items-end gap-2">
            <div className="font-display text-3xl leading-none tabular-nums">{power.power}</div>
            <div className="pb-0.5 space-y-0.5">
              <div className="text-[11px] text-muted-foreground">
                baseline <span className="font-mono">{power.baseline}</span>
              </div>
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded font-mono",
                  boosted
                    ? "bg-[color:var(--labs)]/15 text-[color:var(--labs)]"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <TrendingUp className="h-2.5 w-2.5" />×{multiplier}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 text-xs text-muted-foreground leading-relaxed">
          Complete questionnaires on Pulse Feedback to grow your voting power. Higher power weighs
          your votes on upcoming Labs features.
        </div>
        <a
          href={`${FEEDBACK_URL}/voting-power`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-2 px-4 py-2.5 border-t text-sm font-medium hover:bg-muted press-scale"
        >
          <span>Open in Pulse Feedback</span>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </a>
      </PopoverContent>
    </Popover>
  );
}
