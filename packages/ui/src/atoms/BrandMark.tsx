import { cn } from "../lib/cn";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const BOX: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

/**
 * Pulse HR brand mark — concentric rings + filled lime dot.
 *
 * Canonical source: `docs/brand/logo-explorations/mark-final.svg`.
 * The marketing site (`apps/marketing/src/components/Nav.astro`) and the
 * browser favicon (`apps/app/public/icon.svg`) use the same geometry.
 *
 * Rendered inline (no background square) so the mark sits cleanly on any
 * themed surface without a lime block clashing with role tints.
 */
export function BrandMark({ size = "md", className }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", BOX[size], className)}
      aria-hidden
      focusable="false"
    >
      <circle cx="32" cy="32" r="23" fill="none" stroke="#b4ff39" strokeWidth="1.25" opacity="0.55" />
      <circle cx="32" cy="32" r="15" fill="none" stroke="#b4ff39" strokeWidth="1.75" />
      <circle cx="32" cy="32" r="5" fill="#b4ff39" />
    </svg>
  );
}
