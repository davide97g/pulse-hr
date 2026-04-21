import { BookOpen, Check, LifeBuoy, PlayCircle, RotateCcw } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearCompletedTours, getCompletedTours, TOURS_BY_WORKFLOW } from "@/lib/tours";
import { useTour } from "./TourProvider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

function useCompletedTours(): string[] {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const onStorage = () => setTick((t) => t + 1);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  // Recompute on every render — cheap and avoids stale reads when the
  // dropdown is re-opened after a tour finishes.
  void tick;
  return getCompletedTours();
}

export function TourLauncher({ collapsed }: { collapsed: boolean }) {
  const { start } = useTour();
  const completed = useCompletedTours();
  const completedSet = new Set(completed);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-tour="sidebar-help"
          className={cn(
            "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent/60",
            collapsed && "justify-center",
          )}
          title={collapsed ? "Help & tours" : undefined}
        >
          <LifeBuoy className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="flex-1 text-left">Help & tours</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Take a tour</span>
          {completed.length > 0 && (
            <button
              onClick={() => clearCompletedTours()}
              className="text-[11px] font-normal text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              title="Reset tour progress"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(TOURS_BY_WORKFLOW).map(([workflow, tours]) => (
          <div key={workflow}>
            <div className="px-2 pt-1.5 pb-0.5 text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
              {workflow}
            </div>
            {tours.map((t) => {
              const done = completedSet.has(t.id);
              return (
                <DropdownMenuItem
                  key={t.id}
                  onSelect={(e) => {
                    e.preventDefault();
                    start(t.id);
                  }}
                  className="flex items-start gap-2 py-2"
                >
                  {done ? (
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                  ) : (
                    <PlayCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-tight flex items-center gap-1.5">
                      {t.name}
                      <span className="text-[10px] font-normal text-muted-foreground">
                        · {t.duration}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                      {t.summary}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/docs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Browse docs
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
