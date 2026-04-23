import { Card } from "@pulse-hr/ui/primitives/card";
import { Gauge, AlertTriangle, Wallet, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function SaturationKPIs({
  orgUtilPct,
  benchHours,
  blendedMarginPct,
  atRiskProjects,
  onJumpTo,
}: {
  orgUtilPct: number;
  benchHours: number;
  blendedMarginPct: number;
  atRiskProjects: number;
  onJumpTo?: (section: "load" | "margins" | "value" | "insights") => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Kpi
        icon={<Gauge className="h-4 w-4" />}
        label="Org utilization"
        value={`${orgUtilPct.toFixed(0)}%`}
        tone={orgUtilPct >= 85 ? "warn" : orgUtilPct >= 60 ? "good" : "warn"}
        hint={
          orgUtilPct >= 85 ? "Overheated" : orgUtilPct >= 60 ? "Healthy band" : "Under-utilised"
        }
        onClick={onJumpTo ? () => onJumpTo("load") : undefined}
        jumpLabel="View load →"
      />
      <Kpi
        icon={<Wallet className="h-4 w-4" />}
        label="Weekly bench"
        value={`${benchHours.toFixed(0)}h`}
        tone={benchHours > 120 ? "warn" : "good"}
        hint="Unsold capacity"
        onClick={onJumpTo ? () => onJumpTo("load") : undefined}
        jumpLabel="View load →"
      />
      <Kpi
        icon={<TrendingUp className="h-4 w-4" />}
        label="Blended margin"
        value={`${blendedMarginPct.toFixed(0)}%`}
        tone={blendedMarginPct > 25 ? "good" : blendedMarginPct > 10 ? undefined : "warn"}
        hint="Revenue − cost"
        onClick={onJumpTo ? () => onJumpTo("margins") : undefined}
        jumpLabel="See margins →"
      />
      <Kpi
        icon={<AlertTriangle className="h-4 w-4" />}
        label="At-risk projects"
        value={String(atRiskProjects)}
        tone={atRiskProjects > 0 ? "warn" : "good"}
        hint="On hold or flagged"
        onClick={onJumpTo ? () => onJumpTo("insights") : undefined}
        jumpLabel="Open insights →"
      />
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  tone,
  hint,
  onClick,
  jumpLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "good" | "warn";
  hint?: string;
  onClick?: () => void;
  jumpLabel?: string;
}) {
  const Wrap = onClick ? "button" : "div";
  return (
    <Wrap
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "block w-full text-left",
        onClick && "transition hover:-translate-y-0.5 press-scale",
      )}
    >
      <Card
        className={cn("p-4 pop-in h-full", onClick && "hover:border-primary/40 hover:shadow-md")}
      >
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wide">
          <span
            className={cn(
              "h-6 w-6 rounded-md flex items-center justify-center",
              tone === "good"
                ? "bg-success/10 text-success"
                : tone === "warn"
                  ? "bg-warning/10 text-warning"
                  : "bg-muted",
            )}
          >
            {icon}
          </span>
          {label}
        </div>
        <div className="text-2xl font-semibold tracking-tight mt-1.5 tabular-nums">{value}</div>
        <div className="flex items-center justify-between mt-1">
          {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
          {onClick && jumpLabel && (
            <div className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              {jumpLabel}
            </div>
          )}
        </div>
      </Card>
    </Wrap>
  );
}
