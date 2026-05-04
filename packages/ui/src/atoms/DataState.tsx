import type { ReactNode } from "react";

export type DataStateKind = "loading" | "empty" | "populated";

export interface DataStateProps {
  state: DataStateKind;
  /** Rendered when state === "loading". */
  loading: ReactNode;
  /** Rendered when state === "empty". */
  empty: ReactNode;
  /** Rendered when state === "populated". */
  children: ReactNode;
}

/**
 * Three-way switch for list/grid content: loading / empty / populated.
 * Pure switcher — no animations, no margins. Compose inside ListLayout.
 */
export function DataState({ state, loading, empty, children }: DataStateProps) {
  if (state === "loading") return <>{loading}</>;
  if (state === "empty") return <>{empty}</>;
  return <>{children}</>;
}
