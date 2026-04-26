import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import type { ContainerWidth } from "./ListLayout";

const CONTAINER: Record<ContainerWidth, string> = {
  narrow: "container-narrow",
  default: "container-default",
  wide: "container-wide",
};

export interface DetailLayoutProps {
  /** Avatar + name + chips strip. Caller composes. */
  hero: ReactNode;
  /** Tab strip — caller wires TanStack Router (atom never imports router). */
  tabs?: ReactNode;
  children: ReactNode;
  sidePanel?: ReactNode;
  width?: ContainerWidth;
  className?: string;
}

/**
 * Layout for detail routes (employee, client, project, office).
 * Hero (full-width slot) → optional tabs → content → optional side panel.
 */
export function DetailLayout({
  hero,
  tabs,
  children,
  sidePanel,
  width = "default",
  className,
}: DetailLayoutProps) {
  return (
    <>
      <div className={cn(CONTAINER[width], "space-y-6", className)}>
        {hero}
        {tabs}
        {children}
      </div>
      {sidePanel}
    </>
  );
}
