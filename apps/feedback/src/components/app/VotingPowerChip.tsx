import { Link } from "@tanstack/react-router";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { VOTING_POWER_REFILL_DAYS } from "@/lib/company-profile";
import { useVotingPower } from "./CompanyProfileStore";

export function VotingPowerChip({ className }: { className?: string }) {
  const power = useVotingPower();
  const boosted = power.power > power.baseline;
  const refillIn = describeNextRefill(power.lastRefillAt);
  return (
    <Link
      to="/voting-power"
      className={cn(
        "hidden md:inline-flex h-9 items-center gap-1.5 px-2.5 rounded-md border bg-background/80 hover:bg-muted text-sm press-scale transition-colors",
        boosted && "border-[color:var(--labs)]/40",
        className,
      )}
      title={`Voting power: ${power.power} / ${power.baseline}${refillIn ? ` — next refill ${refillIn}` : ""}`}
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

function describeNextRefill(lastRefillAt: string | undefined): string | null {
  if (!lastRefillAt) return null;
  const last = new Date(lastRefillAt).getTime();
  if (Number.isNaN(last)) return null;
  const next = last + VOTING_POWER_REFILL_DAYS * 24 * 60 * 60 * 1000;
  const diffMs = next - Date.now();
  if (diffMs <= 0) return "any moment";
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days >= 1) return `in ${days}d`;
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours >= 1) return `in ${hours}h`;
  return "in <1h";
}
