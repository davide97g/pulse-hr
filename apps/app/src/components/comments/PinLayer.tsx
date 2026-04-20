import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCommentsOverlay } from "./CommentsOverlayProvider";
import { Pin } from "./Pin";
import { NewCommentComposer } from "./NewCommentComposer";
import { ActiveThreadPopover } from "./ActiveThreadPopover";
import { resolveAnchor, getScrollRoot } from "@/lib/comments/anchor";

export function PinLayer() {
  const {
    mode,
    comments,
    placementPoint,
    setPlacementPoint,
    cancelPlacement,
    activeCommentId,
    openThread,
    closeThread,
  } = useCommentsOverlay();

  const [tick, setTick] = useState(0);
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const scrollRoot = getScrollRoot();
    scrollRoot?.addEventListener("scroll", bump, { passive: true });
    window.addEventListener("resize", bump);
    window.addEventListener("scroll", bump, { passive: true });
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(bump)
        : null;
    if (ro && scrollRoot) ro.observe(scrollRoot);
    return () => {
      scrollRoot?.removeEventListener("scroll", bump);
      window.removeEventListener("resize", bump);
      window.removeEventListener("scroll", bump);
      ro?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (mode !== "placing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelPlacement();
      }
    };
    window.addEventListener("keydown", onKey);
    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = "crosshair";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.cursor = prevCursor;
    };
  }, [mode, cancelPlacement]);

  const resolvedPins = useMemo(
    () =>
      comments
        .map((c) => {
          const pos = resolveAnchor(c.anchor);
          if (!pos) return null;
          return { comment: c, x: pos.x, y: pos.y };
        })
        .filter((p): p is { comment: (typeof comments)[number]; x: number; y: number } => p !== null),
    // tick forces recompute on scroll/resize
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [comments, tick],
  );

  const activeResolved = useMemo(() => {
    if (!activeCommentId) return null;
    const comment = comments.find((c) => c.id === activeCommentId);
    if (!comment) return null;
    const pos = resolveAnchor(comment.anchor);
    if (!pos) return null;
    return { comment, x: pos.x, y: pos.y };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCommentId, comments, tick]);

  const onLayerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== "placing") return;
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    e.stopPropagation();
    setPlacementPoint({ x: e.clientX, y: e.clientY });
  };

  const placing = mode === "placing";

  return createPortal(
    <div
      ref={layerRef}
      onClick={onLayerClick}
      data-comments-ignore
      className="fixed inset-0 z-40"
      style={{
        pointerEvents: placing ? "auto" : "none",
        background: placing ? "rgba(0,0,0,0.04)" : "transparent",
        cursor: placing ? "crosshair" : "auto",
      }}
      aria-hidden={!placing}
    >
      {resolvedPins.map(({ comment, x, y }) => (
        <Pin
          key={comment.id}
          comment={comment}
          x={x}
          y={y}
          active={comment.id === activeCommentId}
          onClick={() => openThread(comment.id)}
        />
      ))}

      {placementPoint && (
        <NewCommentComposer
          x={placementPoint.x}
          y={placementPoint.y}
          onDismiss={() => setPlacementPoint(null)}
        />
      )}

      {activeResolved && (
        <ActiveThreadPopover
          comment={activeResolved.comment}
          x={activeResolved.x}
          y={activeResolved.y}
          onClose={closeThread}
        />
      )}
    </div>,
    document.body,
  );
}
