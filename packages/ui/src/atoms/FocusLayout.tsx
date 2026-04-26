import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import type { ContainerWidth } from "./ListLayout";

const CONTAINER: Record<ContainerWidth, string> = {
  narrow: "container-narrow",
  default: "container-default",
  wide: "container-wide",
};

export interface FocusLayoutProps {
  header: ReactNode;
  children: ReactNode;
  /** Optional aside (right-hand sidebar on md+). */
  aside?: ReactNode;
  width?: ContainerWidth;
  className?: string;
}

/**
 * Layout for narrow, single-column flows: profile, settings, onboarding,
 * focus mode. Reading-friendly width with optional right aside on md+.
 */
export function FocusLayout({
  header,
  children,
  aside,
  width = "narrow",
  className,
}: FocusLayoutProps) {
  return (
    <div className={cn(CONTAINER[width], "space-y-5", className)}>
      {header}
      {aside ? (
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5 min-w-0">{children}</div>
          <aside className="space-y-4">{aside}</aside>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
