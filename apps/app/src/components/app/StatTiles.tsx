/*
 * Compatibility shim. StatTile and MiniStat are now backed by the canonical
 * `<StatCard>` atom from `@pulse-hr/ui`. New code should import StatCard
 * directly. This shim keeps existing call sites working until they're
 * migrated. Will be deleted once all consumers move over.
 */
import { StatCard } from "@pulse-hr/ui/atoms/StatCard";
import type { ReactNode } from "react";

export interface StatTileProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  accent?: boolean;
}

/** @deprecated Use `<StatCard size="md">` from `@pulse-hr/ui/atoms/StatCard`. */
export function StatTile({ icon, label, value, accent }: StatTileProps) {
  return <StatCard size="md" icon={icon} label={label} value={value} accent={accent} />;
}

export interface MiniStatProps {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  variant?: "bare" | "card";
}

/** @deprecated Use `<StatCard size="sm">` from `@pulse-hr/ui/atoms/StatCard`. */
export function MiniStat({ icon, value, label, variant = "bare" }: MiniStatProps) {
  return (
    <StatCard
      size="sm"
      icon={icon}
      value={value}
      label={label}
      variant={variant === "card" ? "card" : "bare"}
    />
  );
}
