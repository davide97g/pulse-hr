import type { ReactNode } from "react";
import { PageHeader } from "@pulse-hr/ui/atoms/PageHeader";
import { Eyebrow } from "@pulse-hr/ui/atoms/Eyebrow";
import { cn } from "@/lib/utils";

export interface EditorialPageProps {
  /** Optional eyebrow row content (date, week, status). */
  eyebrow?: ReactNode;
  /** When set, renders a tag chip after the eyebrow text (e.g. <span className="tag-spark">…</span>). */
  eyebrowTag?: ReactNode;
  /** Trailing mono note after the eyebrow ("· 4 TIMESHEET DA CHIUDERE"). */
  eyebrowNote?: ReactNode;
  /** Mono eyebrow text (typically rendered automatically when set). */
  eyebrowText?: ReactNode;
  /** Hero title — renders as oversized italic Fraunces. */
  title: ReactNode;
  /** Italic the hero (defaults to true; set false for a non-italic display). */
  italic?: boolean;
  /** Right-aligned summary block (the magazine "SOMMARIO" pattern). */
  summary?: ReactNode;
  /** Pill row aligned with the eyebrow on the right. */
  actions?: ReactNode;
  /** Page body. */
  children: ReactNode;
  className?: string;
}

/**
 * Editorial page template — magazine spread layout used across the new
 * dashboards, welcome / hero pages, and any single-feature focus surface.
 *
 * Composes a PageHeader (editorial mode) with Eyebrow + actions on top,
 * oversized italic Fraunces title, optional right-aligned summary, then the
 * page body inside the consistent 32px gutter.
 */
export function EditorialPage({
  eyebrow,
  eyebrowText,
  eyebrowTag,
  eyebrowNote,
  title,
  italic = true,
  summary,
  actions,
  children,
  className,
}: EditorialPageProps) {
  const eyebrowNode = eyebrow ?? (eyebrowText
    ? <Eyebrow tag={eyebrowTag} note={eyebrowNote}>{eyebrowText}</Eyebrow>
    : null);

  return (
    <div className={cn("flex flex-col gap-8 px-6 md:px-12 py-10", className)}>
      <PageHeader
        editorial
        italic={italic}
        title={title}
        eyebrow={eyebrowNode}
        summary={summary}
        actions={actions}
      />
      {children}
    </div>
  );
}
