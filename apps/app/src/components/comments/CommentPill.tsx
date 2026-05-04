import { cn } from "@/lib/utils";
import { MessageSquarePlus, X } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useLoginWall } from "@/components/app/LoginWall";
import { useCommentsOverlay } from "./CommentsOverlayProvider";

export function CommentPill() {
  const { mode, enterPlacement, cancelPlacement, visible } = useCommentsOverlay();
  const { isSignedIn } = useAuth();
  const { require } = useLoginWall();
  const active = mode === "placing";

  if (!visible) return null;

  const handleClick = () => {
    if (!isSignedIn) {
      require("comment");
      return;
    }
    if (active) cancelPlacement();
    else enterPlacement();
  };

  return (
    <button
      onClick={handleClick}
      data-comments-ignore
      className={cn(
        "hidden lg:inline-flex fixed z-[70] bottom-5 right-5 h-11 pl-3 pr-4 items-center gap-2",
        "rounded-full border bg-background/95 backdrop-blur text-sm font-medium whitespace-nowrap",
        "shadow-[0_12px_32px_rgba(0,0,0,0.14)] transition-all press-scale",
        "hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)]",
        active ? "border-primary text-primary" : "iridescent-border",
      )}
      style={{
        position: "absolute",
      }}
      aria-label={active ? "Cancel comment mode" : "Leave a comment"}
      aria-pressed={active}
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
        {active ? <X className="h-3.5 w-3.5" /> : <MessageSquarePlus className="h-3.5 w-3.5" />}
      </span>
      <span>{active ? "Cancel" : "Comment"}</span>
      {!active && (
        <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary pulse-dot" aria-hidden />
      )}
    </button>
  );
}
