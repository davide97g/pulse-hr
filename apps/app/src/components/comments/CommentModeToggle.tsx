import { MessageSquarePlus, X } from "lucide-react";
import { useCommentsOverlay } from "./CommentsOverlayProvider";
import { cn } from "@/lib/utils";

export function CommentModeToggle({ variant }: { variant: "pill" | "topbar" }) {
  const { mode, enterPlacement, cancelPlacement } = useCommentsOverlay();
  const active = mode === "placing";

  const onClick = () => {
    if (active) cancelPlacement();
    else enterPlacement();
  };

  if (variant === "topbar") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "hidden lg:inline-flex h-9 px-2.5 items-center gap-1.5 rounded-md border text-sm press-scale transition-colors",
          active
            ? "border-primary text-primary bg-primary/5"
            : "bg-background/80 hover:bg-muted text-foreground",
        )}
        title={active ? "Cancel comment mode" : "Leave a comment"}
        aria-pressed={active}
      >
        {active ? (
          <X className="h-4 w-4" />
        ) : (
          <MessageSquarePlus className="h-4 w-4 text-primary" />
        )}
        <span className="hidden xl:inline font-medium">{active ? "Cancel" : "Comment"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "hidden lg:inline-flex fixed z-[70] bottom-5 right-5 h-11 pl-3 pr-4 items-center gap-2",
        "rounded-full border bg-background/95 backdrop-blur text-sm font-medium whitespace-nowrap",
        "shadow-[0_12px_32px_rgba(0,0,0,0.14)] transition-all press-scale",
        "hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)]",
        active ? "border-primary text-primary" : "iridescent-border",
      )}
      aria-label={active ? "Cancel comment mode" : "Leave a comment"}
      aria-pressed={active}
    >
      <span
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors",
          active ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary",
        )}
      >
        {active ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          <MessageSquarePlus className="h-3.5 w-3.5" />
        )}
      </span>
      <span>{active ? "Cancel" : "Comment"}</span>
      {!active && (
        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary pulse-dot" aria-hidden />
      )}
    </button>
  );
}
