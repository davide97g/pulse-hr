import { cn } from "@/lib/utils";

export function NewBadge({
  className,
  label = "NEW",
  variant = "quiet",
}: {
  className?: string;
  label?: string;
  variant?: "quiet" | "loud";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center h-[18px] px-1.5 text-[9px] rounded",
        variant === "loud" ? "new-badge shadow-sm" : "new-badge-quiet",
        className
      )}
    >
      {label}
    </span>
  );
}

export function LabsBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground", className)}>
      <span className="inline-block h-1 w-1 rounded-full bg-primary pulse-dot" />
      Labs
    </span>
  );
}
