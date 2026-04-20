import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center fade-in",
        compact ? "py-10 px-6" : "py-16 px-6",
        className
      )}
    >
      {icon && (
        <div className="relative mb-4">
          <div className="absolute inset-0 -m-3 rounded-full bg-primary/5 blur-xl" aria-hidden />
          <div className="relative h-14 w-14 rounded-2xl border bg-card shadow-card flex items-center justify-center text-muted-foreground pop-in">
            {icon}
          </div>
        </div>
      )}
      <div className="text-sm font-semibold">{title}</div>
      {description && (
        <div className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
