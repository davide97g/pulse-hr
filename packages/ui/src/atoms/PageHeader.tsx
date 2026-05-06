import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /**
   * Editorial hero — oversized italic Fraunces, optional eyebrow + summary
   * column on the right. Use sparingly: dashboards, welcome, single-feature
   * focus pages. Default render keeps the editorial page-title (italic 32-48px).
   */
  editorial?: boolean;
  /** Mono eyebrow line above the hero (rendered in both default and editorial). */
  eyebrow?: ReactNode;
  /** Optional right-column summary block (editorial only). */
  summary?: ReactNode;
  /** Italic the hero (editorial only). Default true. */
  italic?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  editorial,
  eyebrow,
  summary,
  italic = true,
  className,
}: PageHeaderProps) {
  if (editorial) {
    return (
      <header
        data-tour="page-header"
        className={cn("flex flex-col gap-6 mb-8", className)}
      >
        {(eyebrow || actions) && (
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">{eyebrow}</div>
            {actions && (
              <div className="flex items-center gap-2 shrink-0">{actions}</div>
            )}
          </div>
        )}
        <div className="relative pb-2 flex items-end justify-between gap-8 flex-wrap">
          <h1
            className={italic ? "t-display-it" : "t-display"}
            style={{ margin: 0 }}
          >
            {title}
          </h1>
          {summary && (
            <div className="text-right max-w-[340px] mb-3">{summary}</div>
          )}
        </div>
        {description && !summary && (
          <p className="t-body-lg" style={{ color: "var(--fg-2)" }}>
            {description}
          </p>
        )}
      </header>
    );
  }

  // Default: editorial-tone page header. Mono eyebrow when description is
  // a string-like value, italic Fraunces title, ghost-pill actions feel.
  return (
    <header
      data-tour="page-header"
      className={cn("flex items-end justify-between gap-4 mb-6 flex-wrap", className)}
    >
      <div className="flex flex-col gap-2 min-w-0">
        {eyebrow && (
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {eyebrow}
          </span>
        )}
        <h1 className="text-page-title flex items-center gap-2">{title}</h1>
        {description && (
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
