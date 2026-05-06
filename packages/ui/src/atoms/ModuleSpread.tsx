import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { EditorialPill } from "./EditorialPill";

export type ModuleMetric = [value: ReactNode, label: ReactNode, hot?: boolean];

export interface ModuleSpreadProps {
  /** Mono kicker — "01 · PEOPLE" / "02 · WORK". */
  eyebrow: ReactNode;
  /** Optional sub-eyebrow displayed under the kicker. */
  kicker?: ReactNode;
  /** Big hero number / phrase. */
  big: ReactNode;
  /** Render the big value in spark colour (highlight saturation). */
  bigBlend?: boolean;
  /** Caption beneath the big value. */
  bigCaption?: ReactNode;
  /** Three [value, label, hot?] triplets shown in a 3-column footer grid. */
  metrics?: ModuleMetric[];
  /** Italic Fraunces footer line below metrics. */
  footer?: ReactNode;
  /** Render this card as the primary action (spark border + ring + CTA). */
  cta?: boolean;
  /** Label of the CTA pill (when `cta` is true). */
  ctaLabel?: ReactNode;
  /** Click handler for the CTA pill. */
  onCta?: () => void;
  /** Optional warning chip shown top-right ("⚠ PHR-204 a saturazione"). */
  attention?: ReactNode;
  /** Bottom-right "view all" target. */
  viewAllLabel?: ReactNode;
  /** Click handler for the right-aligned link/pill at the bottom. */
  onViewAll?: () => void;
  className?: string;
}

/**
 * Editorial magazine triptych card — the "module spread" pattern used on the
 * Dashboard's PEOPLE / WORK / MONEY columns. Composes:
 *
 *   eyebrow row   ↦ mono kicker · attention chip / arrow
 *   hero block    ↦ Fraunces 96px tabular value + mono caption
 *   3-up metrics  ↦ tnum value (highlighted if hot=true) + mono label
 *   footer        ↦ italic Fraunces sentence · CTA pill (or "VEDI TUTTO →")
 */
export function ModuleSpread({
  eyebrow,
  kicker,
  big,
  bigBlend,
  bigCaption,
  metrics = [],
  footer,
  cta,
  ctaLabel,
  onCta,
  attention,
  viewAllLabel = "VEDI TUTTO →",
  onViewAll,
  className,
}: ModuleSpreadProps) {
  return (
    <article
      className={cn("relative overflow-hidden flex flex-col", className)}
      style={{
        background: "var(--bg)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        padding: "22px 24px 20px",
        gap: 18,
        boxShadow: cta
          ? "0 0 0 1px var(--spark) inset, 0 18px 40px -22px color-mix(in oklch, var(--spark) 60%, transparent)"
          : undefined,
      }}
    >
      {cta && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "var(--spark)",
          }}
        />
      )}

      <div className="flex justify-between items-baseline gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {eyebrow}
          </span>
          {kicker && (
            <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
              {kicker}
            </span>
          )}
        </div>
        {attention ? (
          <span className="tag-attention">⚠ {attention}</span>
        ) : (
          <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
            ↗
          </span>
        )}
      </div>

      <div>
        <div
          className="t-num"
          style={{
            fontSize: 96,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            fontWeight: 400,
            color: bigBlend ? "var(--spark)" : "var(--fg)",
          }}
        >
          {big}
        </div>
        {bigCaption && (
          <div
            className="t-mono"
            style={{ color: "var(--muted-foreground)", marginTop: 4 }}
          >
            {bigCaption}
          </div>
        )}
      </div>

      {metrics.length > 0 && (
        <div
          className="grid grid-cols-3"
          style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}
        >
          {metrics.map(([n, l, hot], i) => (
            <div
              key={i}
              className="flex flex-col gap-1"
              style={{
                paddingLeft: i === 0 ? 0 : 12,
                borderLeft: i === 0 ? "none" : "1px solid var(--line)",
              }}
            >
              <span
                className="t-num"
                style={{ fontSize: 22, letterSpacing: "-0.02em" }}
              >
                {hot ? <span className="spark-mark">{n}</span> : n}
              </span>
              <span
                className="t-mono-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                {l}
              </span>
            </div>
          ))}
        </div>
      )}

      <div
        className="flex justify-between items-center mt-auto"
        style={{ paddingTop: 12, borderTop: "1px solid var(--line)" }}
      >
        {footer ? (
          <span
            style={{
              fontStyle: "italic",
              fontFamily: "Fraunces, ui-serif, serif",
              fontSize: 15,
              color: "var(--fg-2)",
            }}
          >
            {footer}
          </span>
        ) : (
          <span />
        )}
        {cta ? (
          <EditorialPill kind="spark" size="sm" arrow onClick={onCta}>
            {ctaLabel ?? "Apri"}
          </EditorialPill>
        ) : (
          <button
            type="button"
            onClick={onViewAll}
            className="t-mono-sm"
            style={{
              color: "var(--muted-foreground)",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: onViewAll ? "pointer" : "default",
            }}
          >
            {viewAllLabel}
          </button>
        )}
      </div>
    </article>
  );
}
