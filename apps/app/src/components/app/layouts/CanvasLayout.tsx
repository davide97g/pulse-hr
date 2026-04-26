import type { ReactNode } from "react";
import { cn } from "@pulse-hr/ui/lib/cn";

export interface CanvasLayoutProps {
  /** Compact header — title + actions. Optional. */
  header?: ReactNode;
  /** Toolbar row directly below header (filters, view switcher, zoom). */
  toolbar?: ReactNode;
  /** Full-bleed content fills remaining vertical space. */
  children: ReactNode;
  className?: string;
  /** Padding around the canvas content. Default: 0. */
  padded?: boolean;
}

/**
 * Layout for canvas/board archetype routes (/org, /calendar, seat maps).
 * Fills viewport below the AppShell topbar (uses --topbar-height set by
 * AppShell.tsx). Header and toolbar are fixed-height; content scrolls or
 * fills, owned by the caller.
 */
export function CanvasLayout({
  header,
  toolbar,
  children,
  className,
  padded = false,
}: CanvasLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-full",
        "h-[calc(100dvh-var(--topbar-height,3.5rem))]",
        className,
      )}
    >
      {(header || toolbar) && (
        <div className="shrink-0 border-b bg-background/80 backdrop-blur">
          {header && <div className="px-4 md:px-6 py-3">{header}</div>}
          {toolbar && (
            <div className="px-4 md:px-6 py-2 flex flex-wrap items-center gap-2 border-t">
              {toolbar}
            </div>
          )}
        </div>
      )}
      <div className={cn("flex-1 min-h-0", padded && "p-4 md:p-6")}>{children}</div>
    </div>
  );
}
