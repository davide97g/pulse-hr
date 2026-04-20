import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { MessageSquare, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchBoard, setVote, setTokenGetter } from "@/lib/comments/api";
import type { BoardBuckets } from "@/lib/comments/api";
import type { Comment, CommentStatus } from "@/lib/comments/types";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Pulse" }] }),
  component: FeedbackBoard,
});

const COLUMNS: { status: CommentStatus; label: string; accent: string }[] = [
  { status: "open", label: "Open", accent: "bg-primary" },
  { status: "triaged", label: "Triaged", accent: "bg-info" },
  { status: "planned", label: "Planned", accent: "bg-warning" },
  { status: "shipped", label: "Shipped", accent: "bg-success" },
  { status: "wont_do", label: "Won't do", accent: "bg-muted-foreground" },
];

const EMPTY_BOARD: BoardBuckets = {
  open: [],
  triaged: [],
  planned: [],
  shipped: [],
  wont_do: [],
};

function FeedbackBoard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [board, setBoard] = useState<BoardBuckets>(EMPTY_BOARD);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTokenGetter(() => getToken());
    return () => setTokenGetter(null);
  }, [getToken]);

  const refresh = async () => {
    if (!user) return;
    try {
      const next = await fetchBoard();
      setBoard(next);
      setLoaded(true);
    } catch {
      // keep previous; the real error surfaces via empty state if first load
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (!user) return;
    refresh();
    const t = window.setInterval(refresh, 15_000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const totals = {
    open: board.open.length,
    triaged: board.triaged.length,
    planned: board.planned.length,
    shipped: board.shipped.length,
    wont_do: board.wont_do.length,
  };
  const totalAll = totals.open + totals.triaged + totals.planned + totals.shipped + totals.wont_do;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display tracking-tight">Feature board</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-[560px]">
            Every pin dropped across the product, collected here. Upvote what matters, reply to
            what you recognize. Admins move cards as they move through triage.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {totals.open} open
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" /> {totals.planned} planned
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> {totals.shipped} shipped
          </span>
        </div>
      </div>

      {!loaded ? (
        <div className="text-sm text-muted-foreground">Loading comments…</div>
      ) : totalAll === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {COLUMNS.map((col) => {
            const items = board[col.status];
            return (
              <div key={col.status} className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className={cn("h-2 w-2 rounded-full", col.accent)} />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {col.label}
                  </h2>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {items.length}
                  </span>
                </div>
                <div className="flex-1 space-y-2">
                  {items.map((c) => (
                    <FeedbackCard
                      key={c.id}
                      comment={c}
                      onVote={async (value) => {
                        try {
                          await setVote(c.id, value);
                          refresh();
                        } catch {
                          // toast later
                        }
                      }}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="text-xs text-muted-foreground/60 px-1 py-3 italic">
                      nothing here yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeedbackCard({
  comment,
  onVote,
}: {
  comment: Comment;
  onVote: (value: -1 | 0 | 1) => void;
}) {
  const initials =
    comment.author.name
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  return (
    <article
      className={cn(
        "group rounded-[var(--radius-md)] border bg-card p-3 stagger-in",
        "hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onVote(comment.myVote === 1 ? 0 : 1)}
            className={cn(
              "h-6 w-6 rounded hover:bg-muted flex items-center justify-center",
              comment.myVote === 1 && "text-primary",
            )}
            aria-label="Upvote"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold tabular-nums">{comment.voteScore}</span>
          <button
            type="button"
            onClick={() => onVote(comment.myVote === -1 ? 0 : -1)}
            className={cn(
              "h-6 w-6 rounded hover:bg-muted flex items-center justify-center",
              comment.myVote === -1 && "text-destructive",
            )}
            aria-label="Downvote"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug line-clamp-3 break-words">{comment.body}</p>
          <div className="mt-2 flex items-center flex-wrap gap-1.5">
            <Link
              to={comment.route}
              className="inline-flex items-center h-5 px-1.5 rounded border bg-background text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/50"
              title={`Open ${comment.route}`}
            >
              {comment.route}
            </Link>
            {comment.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="inline-flex items-center h-5 px-1.5 rounded-full bg-muted text-[10px]"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5 min-w-0">
              {comment.author.avatarUrl ? (
                <img
                  src={comment.author.avatarUrl}
                  alt=""
                  className="h-4 w-4 rounded-full object-cover"
                />
              ) : (
                <span className="h-4 w-4 rounded-full text-[8px] font-semibold flex items-center justify-center text-white bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b]">
                  {initials}
                </span>
              )}
              <span className="truncate">{comment.author.name}</span>
            </div>
            {comment.replies.length > 0 && (
              <span className="inline-flex items-center gap-1 shrink-0">
                <MessageSquare className="h-3 w-3" />
                {comment.replies.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed bg-background/50 p-10 text-center">
      <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
        <MessageSquare className="h-5 w-5" />
      </div>
      <h2 className="font-display text-lg">No feedback yet</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        Comments placed anywhere in Pulse land here. Head back and drop a pin to start the board.
      </p>
      <button
        onClick={() => navigate({ to: "/" })}
        className="mt-4 inline-flex h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm press-scale"
      >
        Back to Pulse
      </button>
    </div>
  );
}
