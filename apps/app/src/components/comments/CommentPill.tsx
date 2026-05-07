import { cn } from "@/lib/utils";
import { Coins, Eye, EyeOff, MessageSquare, MessageSquarePlus, X } from "lucide-react";
import { useAuth } from "@clerk/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@pulse-hr/ui/primitives/tooltip";
import { useLoginWall } from "@/components/app/LoginWall";
import { useCommentsOverlay } from "./CommentsOverlayProvider";
import { useVotingPower } from "@/components/app/CompanyProfileStore";

const FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL ?? "https://feedback.pulsehr.it";

export function CommentPill() {
  const { mode, enterPlacement, cancelPlacement, visible, toggleVisibility } =
    useCommentsOverlay();
  const { isSignedIn } = useAuth();
  const { require } = useLoginWall();
  const power = useVotingPower();
  const active = mode === "placing";

  const handleComment = () => {
    if (!isSignedIn) {
      require("comment");
      return;
    }
    if (active) cancelPlacement();
    else enterPlacement();
  };

  const handleFeedback = () => {
    if (!isSignedIn) {
      require("feedback");
      return;
    }
    window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer");
  };

  if (active) {
    return (
      <button
        onClick={cancelPlacement}
        data-comments-ignore
        className={cn(
          "hidden lg:inline-flex fixed z-[70] bottom-5 right-5 h-11 pl-3 pr-4 items-center gap-2",
          "rounded-full border border-primary text-primary bg-background/95 backdrop-blur text-sm font-medium",
          "shadow-[0_12px_32px_rgba(0,0,0,0.14)] press-scale",
        )}
        style={{ position: "absolute" }}
        aria-label="Cancel comment mode"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <X className="h-3.5 w-3.5" />
        </span>
        <span>Cancel</span>
      </button>
    );
  }

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={100}>
    <div
      data-comments-ignore
      className="hidden lg:inline-flex fixed z-[70] bottom-5 right-5 items-center gap-1.5 group"
      style={{ position: "absolute" }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleVisibility}
            aria-pressed={!visible}
            aria-label={visible ? "Hide comments" : "Show comments"}
            className={cn(
              "h-11 w-11 rounded-full border bg-background/95 backdrop-blur",
              "shadow-[0_12px_32px_rgba(0,0,0,0.14)] press-scale",
              "inline-flex items-center justify-center text-muted-foreground hover:text-foreground",
              "transition-all duration-150",
              "opacity-0 translate-x-2 pointer-events-none",
              "group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto",
              "focus-visible:opacity-100 focus-visible:translate-x-0 focus-visible:pointer-events-auto",
            )}
          >
            {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{visible ? "Hide comments" : "Show comments"}</TooltipContent>
      </Tooltip>

      <div
        className={cn(
          "inline-flex h-11 items-center rounded-full border bg-background/95 backdrop-blur",
          "shadow-[0_12px_32px_rgba(0,0,0,0.14)] iridescent-border overflow-hidden",
          "transition-all hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)]",
          !visible && "opacity-80",
        )}
      >
        {isSignedIn && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="inline-flex items-center gap-1.5 pl-3 pr-2.5 h-full text-sm cursor-default"
                  aria-label={`Voting power ${power.power}`}
                >
                  <Coins className="h-4 w-4 text-[color:var(--labs)]" />
                  <span className="font-mono font-medium tabular-nums">{power.power}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                Voting power: {power.power} (baseline {power.baseline})
              </TooltipContent>
            </Tooltip>
            <span className="h-5 w-px bg-border" aria-hidden />
          </>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleComment}
              className="inline-flex items-center justify-center w-11 h-full hover:bg-muted/60 press-scale transition-colors"
              aria-label="Leave a comment"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageSquarePlus className="h-3.5 w-3.5" />
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Leave a comment</TooltipContent>
        </Tooltip>

        <span className="h-5 w-px bg-border" aria-hidden />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleFeedback}
              className="inline-flex items-center justify-center w-11 h-full text-muted-foreground hover:text-foreground hover:bg-muted/60 press-scale transition-colors"
              aria-label="Open feedback board"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Feedback board</TooltipContent>
        </Tooltip>
      </div>
    </div>
    </TooltipProvider>
  );
}
