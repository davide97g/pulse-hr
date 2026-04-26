import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import type { ContainerWidth } from "./ListLayout";

const CONTAINER: Record<ContainerWidth, string> = {
  narrow: "container-narrow",
  default: "container-default",
  wide: "container-wide",
};

export interface DashboardLayoutProps {
  header: ReactNode;
  /** KPI strip — typically a grid of <StatCard size="lg">. */
  kpis?: ReactNode;
  children: ReactNode;
  width?: ContainerWidth;
  className?: string;
}

/**
 * Layout for dashboard archetype routes (/, /reports, /saturation).
 * Header → KPI strip → stacked sections.
 */
export function DashboardLayout({
  header,
  kpis,
  children,
  width = "wide",
  className,
}: DashboardLayoutProps) {
  return (
    <div className={cn(CONTAINER[width], "space-y-6", className)}>
      {header}
      {kpis}
      {children}
    </div>
  );
}
