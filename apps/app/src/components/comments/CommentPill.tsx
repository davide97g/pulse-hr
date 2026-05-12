import { cn } from "@/lib/utils";
import { Coins, Eye, EyeOff, GripVertical, MessageSquare, MessageSquarePlus, X } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useCallback, useEffect, useRef, useState } from "react";
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

const STORAGE_KEY = "pulse.commentPill.y";
const PILL_HEIGHT = 44;
const EDGE_PADDING = 16;
const DRAG_THRESHOLD = 4;

function clampY(y: number) {
  if (typeof window === "undefined") return y;
  const max = window.innerHeight - PILL_HEIGHT - EDGE_PADDING;
  const min = EDGE_PADDING;
  return Math.max(min, Math.min(max, y));
}

function readStoredY(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function usePillDrag() {
  const [y, setY] = useState<number | null>(() => readStoredY());
  const [dragging, setDragging] = useState(false);
  const draggedRef = useRef(false);
  const startRef = useRef<{ pointerY: number; offset: number } | null>(null);

  useEffect(() => {
    if (y === null) {
      // default: ~ bottom-5 equivalent
      const defaultY =
        typeof window !== "undefined"
          ? window.innerHeight - PILL_HEIGHT - 20
          : 600;
      setY(clampY(defaultY));
    }
  }, [y]);

  useEffect(() => {
    const onResize = () => setY((prev) => (prev === null ? prev : clampY(prev)));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      const currentY = y ?? 0;
      startRef.current = { pointerY: event.clientY, offset: currentY };
      draggedRef.current = false;

      const handleMove = (e: PointerEvent) => {
        const start = startRef.current;
        if (!start) return;
        const delta = e.clientY - start.pointerY;
        if (!draggedRef.current && Math.abs(delta) < DRAG_THRESHOLD) return;
        if (!draggedRef.current) {
          draggedRef.current = true;
          setDragging(true);
        }
        e.preventDefault();
        setY(clampY(start.offset + delta));
      };

      const handleUp = () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
        window.removeEventListener("pointercancel", handleUp);
        if (draggedRef.current) {
          setDragging(false);
          setY((curr) => {
            if (curr !== null) {
              try {
                window.localStorage.setItem(STORAGE_KEY, String(curr));
              } catch {
                // ignore
              }
            }
            return curr;
          });
        }
        startRef.current = null;
      };

      window.addEventListener("pointermove", handleMove, { passive: false });
      window.addEventListener("pointerup", handleUp);
      window.addEventListener("pointercancel", handleUp);
    },
    [y],
  );

  const onClickCapture = useCallback((event: React.MouseEvent) => {
    if (draggedRef.current) {
      event.preventDefault();
      event.stopPropagation();
      draggedRef.current = false;
    }
  }, []);

  return { y, dragging, onPointerDown, onClickCapture };
}

export function CommentPill() {
  const { mode, enterPlacement, cancelPlacement, visible, toggleVisibility } =
    useCommentsOverlay();
  const { isSignedIn } = useAuth();
  const { require } = useLoginWall();
  const power = useVotingPower();
  const active = mode === "placing";
  const { y, dragging, onPointerDown, onClickCapture } = usePillDrag();
  const positionStyle: React.CSSProperties = {
    position: "fixed",
    right: 0,
    top: y ?? undefined,
    bottom: y === null ? 20 : undefined,
    touchAction: "none",
    cursor: dragging ? "grabbing" : "grab",
    userSelect: dragging ? "none" : undefined,
  };

  const dragGrip = (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center w-5 h-full pr-0.5 text-muted-foreground/60",
        "opacity-0 transition-opacity duration-150",
        "group-hover:opacity-100",
        dragging && "opacity-100 text-foreground",
      )}
    >
      <GripVertical className="h-3.5 w-3.5" />
    </span>
  );

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
      <div
        data-comments-ignore
        className="hidden lg:inline-flex relative z-[70] group"
        style={positionStyle}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
      >
        <div
          className={cn(
            "h-11 inline-flex items-center",
            "rounded-l-full border border-r-0 border-primary text-primary bg-background/95 backdrop-blur text-sm font-medium",
            "shadow-[0_12px_32px_rgba(0,0,0,0.14)] overflow-hidden",
          )}
        >
          <button
            onClick={cancelPlacement}
            className="h-full pl-3 pr-3 inline-flex items-center gap-2 press-scale"
            aria-label="Cancel comment mode"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <X className="h-3.5 w-3.5" />
            </span>
            <span>Cancel</span>
          </button>
          {dragGrip}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={100}>
    <div
      data-comments-ignore
      className="hidden lg:inline-flex relative z-[70] items-center gap-1.5 group"
      style={positionStyle}
      onPointerDown={onPointerDown}
      onClickCapture={onClickCapture}
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
          "inline-flex h-11 items-center rounded-l-full border border-r-0 bg-background/95 backdrop-blur",
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
        {dragGrip}
      </div>
    </div>
    </TooltipProvider>
  );
}
