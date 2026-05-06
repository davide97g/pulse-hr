import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface EyebrowProps {
  /** Mono eyebrow text (typically the date / WEEK NN / page section name). */
  children: ReactNode;
  /** Optional spark dot before the text. */
  dot?: boolean;
  /** Optional .tag-spark / .tag-attention style chip rendered after the text. */
  tag?: ReactNode;
  /** Trailing mono note ("· 4 TIMESHEET DA CHIUDERE"). */
  note?: ReactNode;
  className?: string;
}

/**
 * Editorial eyebrow — JetBrains Mono uppercase line that anchors a page
 * (date, section, status) and may carry a tag chip + a trailing note.
 */
export function Eyebrow({ children, dot, tag, note, className }: EyebrowProps) {
  return (
    <div
      className={cn("flex items-center gap-3 flex-wrap", className)}
      style={{ color: "var(--muted-foreground)" }}
    >
      {dot && <span className="dot" aria-hidden />}
      <span className="t-mono">{children}</span>
      {tag}
      {note && <span className="t-mono">{note}</span>}
    </div>
  );
}
