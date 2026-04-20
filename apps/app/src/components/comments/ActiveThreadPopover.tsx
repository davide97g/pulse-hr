import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommentsOverlay } from "./CommentsOverlayProvider";
import { VoteButtons } from "./VoteButtons";
import type { Comment } from "@/lib/comments/types";

const POPOVER_W = 360;
const POPOVER_MAX_H = 420;

export function ActiveThreadPopover({
  comment,
  x,
  y,
  onClose,
}: {
  comment: Comment;
  x: number;
  y: number;
  onClose: () => void;
}) {
  const { addReply, vote } = useCommentsOverlay();
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (wrapRef.current.contains(e.target as Node)) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => window.addEventListener("mousedown", onDocClick), 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDocClick);
      window.clearTimeout(t);
    };
  }, [onClose]);

  const submit = async () => {
    if (!reply.trim() || pending) return;
    setPending(true);
    try {
      await addReply(comment.id, reply);
      setReply("");
    } finally {
      setPending(false);
    }
  };

  const left = Math.min(Math.max(8, x + 12), window.innerWidth - POPOVER_W - 8);
  const top = Math.min(Math.max(8, y + 12), window.innerHeight - 200);

  return (
    <div
      ref={wrapRef}
      onClick={(e) => e.stopPropagation()}
      style={{ left, top, width: POPOVER_W, maxHeight: POPOVER_MAX_H }}
      className={cn(
        "absolute pointer-events-auto pop-in rounded-[var(--radius-lg)] border bg-background",
        "shadow-[0_16px_48px_rgba(0,0,0,0.18)] flex flex-col",
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <AuthorBadge name={comment.author.name} avatarUrl={comment.author.avatarUrl} />
          <div className="text-xs text-muted-foreground truncate">
            {relativeTime(comment.createdAt)}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <VoteButtons
            score={comment.voteScore}
            myVote={comment.myVote}
            onChange={(v) => vote(comment.id, v)}
          />
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center"
            aria-label="Close thread"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-3 py-2 overflow-y-auto scrollbar-thin">
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{comment.body}</p>
        {comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((r) => (
              <div key={r.id} className="border-l-2 border-border pl-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <AuthorBadge name={r.author.name} avatarUrl={r.author.avatarUrl} small />
                  <div className="text-[11px] text-muted-foreground">
                    {relativeTime(r.createdAt)}
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t px-2 py-2 flex items-center gap-2">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Reply…"
          className="flex-1 h-8 px-2 rounded-md bg-muted/40 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!reply.trim() || pending}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-white bg-primary hover:bg-primary/90",
            (!reply.trim() || pending) && "opacity-40 cursor-not-allowed",
          )}
          aria-label="Send reply"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function AuthorBadge({
  name,
  avatarUrl,
  small,
}: {
  name: string;
  avatarUrl: string | null;
  small?: boolean;
}) {
  const initials =
    name
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const size = small ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]";
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span
        className={cn(
          "rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b] shrink-0",
          size,
        )}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </span>
      <span className={cn("truncate font-medium", small ? "text-xs" : "text-sm")}>{name}</span>
    </div>
  );
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
