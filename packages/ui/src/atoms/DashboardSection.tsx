import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface DashboardSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * A content block inside DashboardLayout. Provides a consistent header row
 * (title + description + trailing action) and a children slot.
 */
export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || description || action) && (
        <header className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-section truncate">{title}</h2>}
            {description && (
              <p className="text-caption mt-0.5 truncate">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
