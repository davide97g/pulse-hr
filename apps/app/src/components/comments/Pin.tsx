import { cn } from "@/lib/utils";
import type { Comment } from "@/lib/comments/types";

export function Pin({
  comment,
  x,
  y,
  active,
  onClick,
}: {
  comment: Comment;
  x: number;
  y: number;
  active: boolean;
  onClick: () => void;
}) {
  const initials =
    comment.author.name
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const count = comment.replies.length + 1;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ left: x, top: y }}
      className={cn(
        "absolute -translate-x-1 -translate-y-full pointer-events-auto",
        "group flex items-end gap-0 press-scale",
      )}
      aria-label={`Open comment by ${comment.author.name}`}
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
