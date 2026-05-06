import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/cn";

export interface PlaceholderProps {
  caption?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Striped diagonal placeholder for portrait / cover imagery slots. The design
 * system avoids decorative SVGs — empty visual frames are filled with this
 * placeholder until real imagery lands.
 */
export function Placeholder({ caption, className, style, children }: PlaceholderProps) {
  return (
    <div className={cn("placeholder-img", className)} style={style}>
      {caption && <span className="cap t-mono-sm">{caption}</span>}
      {children}
    </div>
  );
}
