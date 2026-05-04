import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type ContainerWidth = "narrow" | "default" | "wide";

const CONTAINER: Record<ContainerWidth, string> = {
  narrow: "container-narrow",
  default: "container-default",
  wide: "container-wide",
};

export interface ListLayoutProps {
  /** PageHeader. Always rendered first. */
  header: ReactNode;
  /** ListFilterBar (or any compatible filter row). Optional. */
  filterBar?: ReactNode;
  /** Main list/table/grid content. */
  children: ReactNode;
  /** SidePanel mount slot. Always rendered (controlled by `open` upstream). */
  sidePanel?: ReactNode;
  /** Container width. Default = "wide" — most list pages today. */
  width?: ContainerWidth;
  className?: string;
}

/**
 * Canonical layout for list/table/grid routes.
 *
 *   <PageHeader />
 *   <ListFilterBar />
 *   <DataState>
 *     <Card><Table /></Card>
 *   </DataState>
 *   <SidePanel />
 */
export function ListLayout({
  header,
  filterBar,
  children,
  sidePanel,
  width = "wide",
  className,
}: ListLayoutProps) {
  return (
    <>
      <div className={cn(CONTAINER[width], "space-y-4", className)}>
        {header}
        {filterBar}
        {children}
      </div>
      {sidePanel}
    </>
  );
}
