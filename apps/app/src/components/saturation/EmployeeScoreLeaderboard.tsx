import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Popover, PopoverContent, PopoverTrigger } from "@pulse-hr/ui/primitives/popover";
import { EmployeeScoreBadge } from "@/components/score/EmployeeScoreBadge";
import { EmployeeHoverCard } from "@/components/score/EmployeeHoverCard";
import { Avatar } from "@/components/app/AppShell";
import { allEmployeeScores, scoreColor, FACTOR_LABELS } from "@/lib/score";
import { employeeById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function EmployeeScoreLeaderboard() {
  const rows = useMemo(() => allEmployeeScores().sort((a, b) => b.score - a.score), []);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2">
            Employee score
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="How the score is computed"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 text-xs leading-relaxed space-y-2">
                <div className="font-semibold text-sm">How this is computed</div>
                <p>
                  Weighted average of six factors: delivery (25%), utilization (20%), value (20%),
                  recognition (15%), focus (10%), billable (10%). Missing data rescales weights so
                  everyone gets a comparable number.
                </p>
                <Link to="/docs/employee-score" className="text-primary hover:underline">
                  Read the full explanation →
                </Link>
              </PopoverContent>
            </Popover>
          </div>
          <div className="text-xs text-muted-foreground">
            0–100 signal combining delivery, load, value, recognition, focus, and billable ratio.
          </div>
        </div>
        <Link to="/docs/employee-score" className="text-xs text-primary hover:underline">
          How is this computed?
        </Link>
      </div>
      <div className="divide-y">
        {rows.map((r) => {
          const emp = employeeById(r.employeeId);
          if (!emp) return null;
          const color = scoreColor(r.score);
          return (
            <div key={r.employeeId} className="py-2.5 flex items-center gap-3">
              <EmployeeHoverCard employeeId={emp.id}>
                <span>
                  <Avatar initials={emp.initials} color={emp.avatarColor} size={28} />
                </span>
              </EmployeeHoverCard>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{emp.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{emp.role}</div>
              </div>
              <div className="hidden md:flex items-center gap-1 mr-2">
                {r.factors.map((f) => (
                  <span
                    key={f.key}
                    title={`${FACTOR_LABELS[f.key]}: ${f.value}`}
                    className="h-4 w-1 rounded"
                    style={{
                      backgroundColor: scoreColor(f.value),
                      opacity: f.missing ? 0.35 : 1,
                    }}
                  />
                ))}
              </div>
              <span
                className={cn("text-xs font-semibold capitalize", "hidden sm:inline")}
                style={{ color }}
              >
                {r.grade}
              </span>
              <EmployeeScoreBadge employeeId={emp.id} size="sm" showInfo={false} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
