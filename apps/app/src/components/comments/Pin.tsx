import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Comment } from "@/lib/comments/types";

const DRAG_THRESHOLD_PX = 4;

type DragState = {
  startX: number;
  startY: number;
  pointerId: number;
  dragging: boolean;
};

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
  const dragRef = useRef<DragState | null>(null);
  const suppressNextClickRef = useRef(false);
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

  useEffect(() => {
    if (!draggable) return;
    // Listeners installed only while a drag is active — armed by pointerdown.
    const onMove = (e: PointerEvent) => {
      const s = dragRef.current;
      if (!s || s.pointerId !== e.pointerId) return;
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      if (!s.dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      s.dragging = true;
      setDragOffset({ dx, dy });
    };
    const finish = (e: PointerEvent, commit: boolean) => {
      const s = dragRef.current;
      if (!s || s.pointerId !== e.pointerId) return;
      dragRef.current = null;
      const dragged = s.dragging;
      setDragOffset(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      if (dragged) {
        suppressNextClickRef.current = true;
        if (commit && onDragEnd) {
          const btn = btnRef.current;
          const prevVis = btn?.style.visibility;
          if (btn) btn.style.visibility = "hidden";
          onDragEnd(e.clientX, e.clientY);
          if (btn) btn.style.visibility = prevVis ?? "";
        }
      }
    };
    const onUp = (e: PointerEvent) => finish(e, true);
    const onCancel = (e: PointerEvent) => finish(e, false);

    const btn = btnRef.current;
    if (!btn) return;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        pointerId: e.pointerId,
        dragging: false,
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
    };
    btn.addEventListener("pointerdown", onDown);
    return () => {
      btn.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [draggable, onDragEnd]);

  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
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
      onClick={onClickHandler}
      onDragStart={(e) => e.preventDefault()}
      style={{
        left: x + offsetX,
        top: y + offsetY,
        cursor: draggable ? (isDragging ? "grabbing" : "grab") : "pointer",
        touchAction: draggable ? "none" : undefined,
        userSelect: "none",
      }}
      className={cn(
        "absolute -translate-x-1 -translate-y-full pointer-events-auto",
        "group flex items-end gap-0",
        !isDragging && "press-scale",
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
