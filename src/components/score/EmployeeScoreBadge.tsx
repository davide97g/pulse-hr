import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { computeEmployeeScore, scoreColor, SCORE_WEIGHTS, FACTOR_LABELS } from "@/lib/score";
import { cn } from "@/lib/utils";

/**
 * Compact score pill: `[ 78 ]` with a ring in the tone color and an info
 * icon that opens the formula popover.
 */
export function EmployeeScoreBadge({
  employeeId,
  size = "md",
  showInfo = true,
  className,
}: {
  employeeId: string;
  size?: "sm" | "md" | "lg";
  showInfo?: boolean;
  className?: string;
}) {
  const { score, grade } = computeEmployeeScore(employeeId);
  const color = scoreColor(score);
  const dim = size === "sm" ? 22 : size === "lg" ? 48 : 32;
  const radius = dim / 2 - (size === "sm" ? 2 : 3);
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const fontSize = size === "sm" ? 10 : size === "lg" ? 16 : 12;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className="relative inline-flex items-center justify-center"
        style={{ width: dim, height: dim }}
        title={`Employee score · ${grade}`}
      >
        <svg
          width={dim}
          height={dim}
          viewBox={`0 0 ${dim} ${dim}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={size === "sm" ? 2 : 3}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={size === "sm" ? 2 : 3}
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute tabular-nums font-semibold"
          style={{ fontSize, color }}
        >
          {score}
        </span>
      </span>
      {showInfo && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition"
              aria-label="How employee score is computed"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-4">
            <ScoreFormulaContent employeeId={employeeId} />
          </PopoverContent>
        </Popover>
      )}
    </span>
  );
}

export function ScoreFormulaContent({ employeeId }: { employeeId: string }) {
  const { score, grade, factors } = computeEmployeeScore(employeeId);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Employee score</div>
        <div className="text-xs text-muted-foreground">
          {score} · <span className="capitalize">{grade}</span>
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground leading-snug">
        Weighted average of {factors.length} factors. Weights rescale when data is missing, so
        everyone gets a comparable number.
      </div>
      <div className="space-y-1.5">
        {factors.map((f) => (
          <div key={f.key} className="grid grid-cols-[68px_1fr_42px] gap-2 items-center text-[11px]">
            <div className={cn("font-medium truncate", f.missing && "text-muted-foreground")}>
              {FACTOR_LABELS[f.key]}
            </div>
            <div className="h-1.5 bg-muted rounded overflow-hidden">
              <div
                className="h-full rounded"
                style={{ width: `${f.value}%`, backgroundColor: scoreColor(f.value) }}
              />
            </div>
            <div className="text-right tabular-nums text-muted-foreground">
              {Math.round(SCORE_WEIGHTS[f.key] * 100)}%
            </div>
          </div>
        ))}
      </div>
      <Link
        to="/docs/employee-score"
        className="inline-block text-xs text-primary hover:underline"
      >
        See how it's computed →
      </Link>
    </div>
  );
}
