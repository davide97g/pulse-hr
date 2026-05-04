import { Sparkles } from "lucide-react";
import { PRESETS, type LogPreset } from "@/lib/log-presets";
import { cn } from "@/lib/utils";

export function PresetPicker({
  onPick,
  className,
}: {
  onPick: (preset: LogPreset) => void;
  className?: string;
}) {
  return (
    <div className={cn("px-4 md:px-6 py-4 md:py-5", className)}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-3">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Start with a workflow
      </div>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 stagger-in">
        {PRESETS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(p)}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-card text-left p-3.5",
                "hover:bg-muted/40 hover:shadow-sm transition press-scale focus:outline-none focus:ring-2 focus:ring-primary/40",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70",
                  p.accent,
                )}
              />
              <span className="relative flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border bg-background/70 backdrop-blur">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{p.label}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {p.description}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
