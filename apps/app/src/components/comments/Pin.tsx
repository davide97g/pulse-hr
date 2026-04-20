import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Comment } from "@/lib/comments/types";

const DRAG_THRESHOLD_PX = 4;

export function Pin({
  comment,
  x,
  y,
  active,
  draggable = false,
  onClick,
  onDragEnd,
}: {
  comment: Comment;
  x: number;
  y: number;
  active: boolean;
  draggable?: boolean;
  onClick: () => void;
  onDragEnd?: (clientX: number, clientY: number) => void;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    pointerId: number;
    dragging: boolean;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);

  const initials =
    comment.author.name
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const count = comment.replies.length + 1;

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggable) return;
    if (e.button !== 0) return;
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
      dragging: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = dragStateRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (!s.dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    s.dragging = true;
    setDragOffset({ dx, dy });
  };

  const finishDrag = (e: React.PointerEvent<HTMLButtonElement>, commit: boolean) => {
    const s = dragStateRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    dragStateRef.current = null;
    const dragged = s.dragging;
    setDragOffset(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (dragged && commit && onDragEnd) {
      const btn = btnRef.current;
      const prevPE = btn?.style.pointerEvents;
      if (btn) btn.style.pointerEvents = "none";
      onDragEnd(e.clientX, e.clientY);
      if (btn) btn.style.pointerEvents = prevPE ?? "";
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => finishDrag(e, true);
  const onPointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => finishDrag(e, false);

  const suppressClickIfDragged = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (dragOffset !== null) {
      e.preventDefault();
      return;
    }
    onClick();
  };

  const offsetX = dragOffset?.dx ?? 0;
  const offsetY = dragOffset?.dy ?? 0;
  const isDragging = dragOffset !== null;

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={suppressClickIfDragged}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        left: x + offsetX,
        top: y + offsetY,
        cursor: draggable ? (isDragging ? "grabbing" : "grab") : "pointer",
        touchAction: draggable ? "none" : undefined,
      }}
      className={cn(
        "absolute -translate-x-1 -translate-y-full pointer-events-auto",
        "group flex items-end gap-0 press-scale",
        isDragging && "opacity-90",
      )}
      aria-label={
        draggable
          ? `Comment by ${comment.author.name} — drag to move, click to open`
          : `Open comment by ${comment.author.name}`
      }
    >
      <span
        className={cn(
          "relative inline-flex h-8 w-8 items-center justify-center rounded-full rounded-bl-sm border-2 border-background text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.18)]",
          "bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b]",
          active && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
      >
        {comment.author.avatarUrl ? (
          <img
            src={comment.author.avatarUrl}
            alt=""
            className="h-full w-full rounded-full rounded-bl-sm object-cover"
          />
        ) : (
          initials
        )}
        {count > 1 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-foreground text-background text-[10px] font-semibold flex items-center justify-center">
            {count}
          </span>
        )}
      </span>
    </button>
  );
}
