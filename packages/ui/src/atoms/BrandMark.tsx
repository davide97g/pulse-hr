import { cn } from "../lib/cn";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** When true, render the italic "pulse·hr" wordmark instead of the SVG ring. */
  wordmark?: boolean;
};

const BOX: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const WORDMARK_FONT: Record<NonNullable<Props["size"]>, number> = {
  sm: 18,
  md: 22,
  lg: 28,
};

/**
 * Pulse HR brand mark.
 *
 * Two flavours:
 *   - default: concentric SVG rings + filled lime dot (used as the small icon
 *     in the sidebar header, favicons, marketing nav). Canonical source:
 *     `docs/brand/logo-explorations/mark-final.svg`.
 *   - `wordmark`: italic Fraunces "pulse·hr" — the editorial topbar wordmark.
 */
export function BrandMark({ size = "md", className, wordmark }: Props) {
  if (wordmark) {
    return (
      <span
        className={cn("inline-flex items-baseline shrink-0", className)}
        style={{
          fontFamily: "Fraunces, ui-serif, serif",
          fontStyle: "italic",
          fontWeight: 500,
          letterSpacing: "-0.04em",
          fontSize: WORDMARK_FONT[size],
          lineHeight: 1,
          color: "var(--fg)",
        }}
        aria-label="Pulse HR"
      >
        pulse
        <span style={{ fontStyle: "normal", fontWeight: 400 }}>·</span>
        hr
      </span>
    );
  }
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
