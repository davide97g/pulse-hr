import { Link } from "@tanstack/react-router";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVotingPower } from "./CompanyProfileStore";

export function VotingPowerChip({ className }: { className?: string }) {
  const power = useVotingPower();
  const boosted = power.power > power.baseline;
  return (
    <Link
      to="/voting-power"
      className={cn(
        "hidden md:inline-flex h-9 items-center gap-1.5 px-2.5 rounded-md border bg-background/80 hover:bg-muted text-sm press-scale transition-colors",
        boosted && "border-[color:var(--labs)]/40",
        className,
      )}
      title={`Voting power: ${power.power} (baseline ${power.baseline})`}
    >
      <Coins
        className={cn("h-4 w-4", boosted ? "text-[color:var(--labs)]" : "text-muted-foreground")}
      />
      <span className="font-mono font-medium tabular-nums">{power.power}</span>
      {boosted && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--labs)] pulse-dot" />
      )}
    </Link>
  );
}
