import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  onApprove?: () => void;
  onReject?: () => void;
  approveLabel?: string;
  rejectLabel?: string;
  disabled?: boolean;
  className?: string;
}

const THRESHOLD = 100; // px
const MAX_OFFSET = 160;

/**
 * Touch-driven swipe row: drag right → approve, left → reject.
 * Falls back silently on non-touch devices (still renders children).
 */
export function SwipeRow({
  children, onApprove, onReject,
  approveLabel = "Approve", rejectLabel = "Reject",
  disabled, className,
}: Props) {
  const [dx, setDx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const startX = useRef<number | null>(null);
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el || disabled) return;

    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      setAnimating(false);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (startX.current == null) return;
      const delta = e.touches[0].clientX - startX.current;
      setDx(Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, delta)));
    };
    const onTouchEnd = () => {
      setAnimating(true);
      if (dx > THRESHOLD && onApprove) {
        setDx(MAX_OFFSET);
        setTimeout(() => { onApprove(); setDx(0); }, 180);
      } else if (dx < -THRESHOLD && onReject) {
        setDx(-MAX_OFFSET);
        setTimeout(() => { onReject(); setDx(0); }, 180);
      } else {
        setDx(0);
      }
      startX.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [dx, onApprove, onReject, disabled]);

  const approveRevealed = dx > 24;
  const rejectRevealed = dx < -24;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Reveal backgrounds */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 flex items-center px-4 bg-success text-success-foreground transition-opacity",
          approveRevealed ? "opacity-100" : "opacity-0",
        )}
        style={{ width: Math.max(0, dx) }}
      >
        <Check className="h-5 w-5" />
        <span className="ml-2 text-xs font-medium">{approveLabel}</span>
      </div>
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex items-center justify-end px-4 bg-destructive text-destructive-foreground transition-opacity",
          rejectRevealed ? "opacity-100" : "opacity-0",
        )}
        style={{ width: Math.max(0, -dx) }}
      >
        <span className="mr-2 text-xs font-medium">{rejectLabel}</span>
        <X className="h-5 w-5" />
      </div>
      {/* Foreground row */}
      <div
        ref={elRef}
        className={cn(
          "relative bg-card",
          animating && "transition-transform duration-200 ease-out",
          !animating && "transition-none",
        )}
        style={{ transform: `translateX(${dx}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
