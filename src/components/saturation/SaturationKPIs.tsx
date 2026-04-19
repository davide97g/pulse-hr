import { Card } from "@/components/ui/card";
import { Gauge, AlertTriangle, Wallet, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function SaturationKPIs({
  orgUtilPct,
  benchHours,
  blendedMarginPct,
  atRiskProjects,
}: {
  orgUtilPct: number;
  benchHours: number;
  blendedMarginPct: number;
  atRiskProjects: number;
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
      />
      <Kpi
        icon={<Wallet className="h-4 w-4" />}
        label="Weekly bench"
        value={`${benchHours.toFixed(0)}h`}
        tone={benchHours > 120 ? "warn" : "good"}
        hint="Unsold capacity"
      />
      <Kpi
        icon={<TrendingUp className="h-4 w-4" />}
        label="Blended margin"
        value={`${blendedMarginPct.toFixed(0)}%`}
        tone={blendedMarginPct > 25 ? "good" : blendedMarginPct > 10 ? undefined : "warn"}
        hint="Revenue − cost"
      />
      <Kpi
        icon={<AlertTriangle className="h-4 w-4" />}
        label="At-risk projects"
        value={String(atRiskProjects)}
        tone={atRiskProjects > 0 ? "warn" : "good"}
        hint="On hold or flagged"
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "good" | "warn";
  hint?: string;
}) {
  return (
    <Card
      className={cn(
        "p-4 pop-in",
        tone === "good" && "border-success/30",
        tone === "warn" && "border-warning/30",
      )}
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
      <div
        className={cn(
          "text-2xl font-semibold tracking-tight mt-1.5 tabular-nums",
          tone === "good" && "text-success",
          tone === "warn" && "text-warning",
        )}
      >
        {value}
      </div>
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </Card>
  );
}
