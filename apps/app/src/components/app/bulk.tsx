import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, X, Minus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BulkSelectApi<T extends { id: string }> {
  selected: Set<string>;
  count: number;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  toggleAll: (rows?: T[]) => void;
  clear: () => void;
  allSelected: boolean;
  someSelected: boolean;
  selectedRows: T[];
}

export function useBulkSelect<T extends { id: string }>(rows: T[]): BulkSelectApi<T> {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Drop ids that no longer exist (rows filtered out, list changed)
  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(rows.map((r) => r.id));
      const next = new Set<string>();
      for (const id of prev) if (ids.has(id)) next.add(id);
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(
    (subset?: T[]) => {
      setSelected((prev) => {
        const source = subset ?? rows;
        if (source.length === 0) return prev;
        const allIn = source.every((r) => prev.has(r.id));
        if (allIn) {
          const next = new Set(prev);
          for (const r of source) next.delete(r.id);
          return next;
        }
        const next = new Set(prev);
        for (const r of source) next.add(r.id);
        return next;
      });
    },
    [rows],
  );

  const clear = useCallback(() => setSelected(new Set()), []);
  const isSelected = useCallback((id: string) => selected.has(id), [selected]);

  const selectedRows = useMemo(() => rows.filter((r) => selected.has(r.id)), [rows, selected]);
  const count = selected.size;
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = count > 0 && !allSelected;

  return {
    selected,
    count,
    isSelected,
    toggle,
    toggleAll,
    clear,
    allSelected,
    someSelected,
    selectedRows,
  };
}

export interface BulkAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  tone?: "default" | "success" | "destructive";
  disabled?: boolean;
}

interface BulkBarProps {
  count: number;
  onClear: () => void;
  actions: BulkAction[];
  noun?: string;
  className?: string;
}

export function BulkBar({ count, onClear, actions, noun = "item", className }: BulkBarProps) {
  if (count === 0) return null;
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80",
        "flex items-center gap-2 px-3 py-2 shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.25)]",
        "pop-in",
        className,
      )}
    >
      <div className="inline-flex items-center gap-2 text-xs">
        <span className="h-5 w-5 rounded-md bg-primary text-primary-foreground grid place-items-center font-mono text-[10px] tabular-nums">
          {count}
        </span>
        <span className="font-medium">
          {count} {noun}
          {count === 1 ? "" : "s"} selected
        </span>
      </div>
      <div className="ml-auto flex items-center gap-1.5 flex-wrap">
        {actions.map((a) => (
          <Button
            key={a.label}
            size="sm"
            variant={
              a.tone === "destructive" ? "outline" : a.tone === "success" ? "default" : "outline"
            }
            disabled={a.disabled}
            onClick={a.onClick}
            className={cn(
              "h-8 press-scale",
              a.tone === "destructive" &&
                "text-destructive hover:bg-destructive/10 border-destructive/30",
              a.tone === "success" &&
                "bg-success text-success-foreground hover:bg-success/90 border-success",
            )}
          >
            {a.icon}
            <span className="hidden sm:inline ml-1.5">{a.label}</span>
          </Button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 press-scale"
          onClick={onClear}
          title="Clear selection"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface RowCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  className?: string;
  visibleWhen?: "always" | "hover-or-selected";
}

/** Thin wrapper for per-row selection. Prevents click-bubble to the row. */
export function RowCheckbox({
  checked,
  onChange,
  label = "Select row",
  className,
  visibleWhen = "hover-or-selected",
}: RowCheckboxProps) {
  return (
    <span
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex items-center justify-center",
        visibleWhen === "hover-or-selected" &&
          !checked &&
          "opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity",
        className,
      )}
    >
      <Checkbox checked={checked} onCheckedChange={onChange} aria-label={label} />
    </span>
  );
}

interface HeaderCheckboxProps {
  allSelected: boolean;
  someSelected: boolean;
  onToggle: () => void;
  label?: string;
}

/** Tri-state header checkbox: blank / minus / check. */
export function HeaderCheckbox({
  allSelected,
  someSelected,
  onToggle,
  label = "Select all",
}: HeaderCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-checked={allSelected ? "true" : someSelected ? "mixed" : "false"}
      role="checkbox"
      aria-label={label}
      className={cn(
        "h-4 w-4 rounded border shrink-0 grid place-items-center transition-colors",
        allSelected || someSelected
          ? "bg-primary border-primary text-primary-foreground"
          : "border-input bg-background hover:bg-muted",
      )}
    >
      {allSelected ? (
        <Check className="h-3 w-3" />
      ) : someSelected ? (
        <Minus className="h-3 w-3" />
      ) : null}
    </button>
  );
}
