import type { ReactNode, ChangeEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "../primitives/input";
import { cn } from "../lib/cn";

export interface ListFilterBarSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export interface ListFilterBarProps {
  /** Search input on the left. Optional. */
  search?: ListFilterBarSearch;
  /** Filter chips, dropdowns, segmented controls, or a Tabs instance. */
  filters?: ReactNode;
  /** Trailing action — typically the primary "Add…" CTA. */
  trailing?: ReactNode;
  /** Default: "comfortable". "compact" tightens vertical rhythm for dense pages. */
  density?: "comfortable" | "compact";
  className?: string;
}

/**
 * Reusable filter row for list routes. Search left, filters middle, CTA right.
 * Wraps onto multiple lines on narrow viewports without breaking.
 */
export function ListFilterBar({
  search,
  filters,
  trailing,
  density = "comfortable",
  className,
}: ListFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2",
        density === "comfortable" ? "py-1" : "py-0",
        className,
      )}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
        {search && (
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden
            />
            <Input
              value={search.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => search.onChange(e.target.value)}
              placeholder={search.placeholder ?? "Search…"}
              aria-label={search.ariaLabel ?? search.placeholder ?? "Search"}
              className="pl-8"
            />
          </div>
        )}
        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
      </div>
      {trailing && <div className="flex items-center gap-2 shrink-0">{trailing}</div>}
    </div>
  );
}
