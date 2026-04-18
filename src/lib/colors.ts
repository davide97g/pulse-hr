import type { StrengthTag } from "./growth";

/** Canonical color tokens for kudos / strength tags, challenge difficulty, etc. */
export const STRENGTH_COLORS: Record<StrengthTag, string> = {
  impact: "oklch(0.7 0.15 30)",
  craft: "oklch(0.65 0.18 340)",
  teamwork: "oklch(0.6 0.16 220)",
  courage: "oklch(0.75 0.15 75)",
  kindness: "oklch(0.65 0.15 155)",
};

export const DIFFICULTY_COLORS: Record<1 | 2 | 3, string> = {
  1: "oklch(0.72 0.05 160)",
  2: "oklch(0.75 0.15 75)",
  3: "oklch(0.65 0.18 30)",
};

/** Helper: fetch a strength color with a safe fallback for unknown tags. */
export function strengthColor(tag: string): string {
  return (STRENGTH_COLORS as Record<string, string>)[tag] ?? "oklch(0.6 0.1 240)";
}
