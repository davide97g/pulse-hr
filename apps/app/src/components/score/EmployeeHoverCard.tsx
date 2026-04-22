import { Link } from "@tanstack/react-router";
import { Mail, Briefcase } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { employeeById } from "@/lib/mock-data";
import { computeEmployeeScore, scoreColor } from "@/lib/score";
import { cn } from "@/lib/utils";

/** Inlined to avoid pulling in AppShell's Avatar (which would create a cycle). */
function Bubble({ initials, color, size }: { initials: string; color: string; size: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-medium shrink-0"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

/**
 * Wraps any avatar / identity element so that hovering surfaces a
 * mini-profile: photo-like avatar, full name, email, and employee score.
 */
export function EmployeeHoverCard({
  employeeId,
  children,
  asChild = true,
  openDelay = 150,
  closeDelay = 100,
  align = "start",
}: {
  employeeId: string;
  children: React.ReactNode;
  asChild?: boolean;
  openDelay?: number;
  closeDelay?: number;
  align?: "start" | "center" | "end";
}) {
  const emp = employeeById(employeeId);
  if (!emp) return <>{children}</>;
  const { score, grade } = computeEmployeeScore(employeeId);
  const color = scoreColor(score);

  return (
    <HoverCard openDelay={openDelay} closeDelay={closeDelay}>
      <HoverCardTrigger asChild={asChild}>{children}</HoverCardTrigger>
      <HoverCardContent align={align} className="w-72 p-4">
        <div className="flex items-start gap-3">
          <Bubble initials={emp.initials} color={emp.avatarColor} size={44} />
          <div className="flex-1 min-w-0">
            <Link to="/profile" className="font-semibold text-sm hover:underline truncate block">
              {emp.name}
            </Link>
            <div className="text-xs text-muted-foreground truncate">{emp.role}</div>
            <div className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-1">
              <Mail className="h-3 w-3 shrink-0" />
              {emp.email}
            </div>
            <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Briefcase className="h-3 w-3 shrink-0" />
              {emp.department} · {emp.location}
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t flex items-center gap-3">
          <div
            className="flex flex-col items-center justify-center rounded-md px-2 py-1 min-w-[50px]"
            style={{
              backgroundColor: `color-mix(in oklch, ${color} 18%, transparent)`,
              color,
            }}
          >
            <div className="text-lg font-semibold leading-none tabular-nums">{score}</div>
            <div className="text-[9px] uppercase tracking-wide">score</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className={cn("text-xs font-medium capitalize")} style={{ color }}>
              {grade}
            </div>
            <Link
              to="/docs/employee-score"
              className="text-[10px] text-muted-foreground hover:text-primary hover:underline"
            >
              How is this computed?
            </Link>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
