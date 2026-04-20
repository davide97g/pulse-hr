import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useAuth, useUser } from "@clerk/react";
import {
  MessageSquare,
  ChevronUp,
  ChevronDown,
  GripVertical,
  ShieldCheck,
  Search,
  X as XIcon,
  ExternalLink,
  PanelRight,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  fetchBoard,
  setVote,
  setStatus,
  setTokenGetter,
  createReply,
} from "@/lib/comments/api";
import type { BoardBuckets } from "@/lib/comments/api";
import type { Comment, CommentStatus, Reply } from "@/lib/comments/types";
import { useIsEffectiveAdmin } from "@/lib/role-override";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [routeFilter, setRouteFilter] = useState<string>("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [threadId, setThreadId] = useState<string | null>(null);
  const admin = useIsEffectiveAdmin();

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const draggingComment = useMemo(() => {
    if (!draggingId) return null;
    for (const status of Object.keys(board) as CommentStatus[]) {
      const match = board[status].find((c) => c.id === draggingId);
      if (match) return match;
    }
    return null;
  }, [board, draggingId]);

  const threadComment = useMemo(() => {
    if (!threadId) return null;
    for (const status of Object.keys(board) as CommentStatus[]) {
      const match = board[status].find((c) => c.id === threadId);
      if (match) return match;
    }
    return null;
  }, [board, threadId]);

  const applyVote = async (commentId: string, value: -1 | 0 | 1) => {
    // optimistic
    setBoard((prev) => {
      const next = { ...prev } as BoardBuckets;
      for (const status of Object.keys(next) as CommentStatus[]) {
        next[status] = next[status].map((c) => {
          if (c.id !== commentId) return c;
          const delta = value - c.myVote;
          return { ...c, myVote: value, voteScore: c.voteScore + delta };
        });
      }
      return next;
    });
    try {
      const { voteScore, myVote } = await setVote(commentId, value);
      setBoard((prev) => {
        const next = { ...prev } as BoardBuckets;
        for (const status of Object.keys(next) as CommentStatus[]) {
          next[status] = next[status].map((c) =>
            c.id === commentId ? { ...c, voteScore, myVote } : c,
          );
        }
        return next;
      });
    } catch {
      toast.error("Vote failed");
      refresh();
    }
  };

  const applyReply = async (commentId: string, body: string): Promise<Reply> => {
    const reply = await createReply(commentId, body);
    setBoard((prev) => {
      const next = { ...prev } as BoardBuckets;
      for (const status of Object.keys(next) as CommentStatus[]) {
        next[status] = next[status].map((c) =>
          c.id === commentId
            ? { ...c, replies: [...c.replies, reply], updatedAt: reply.createdAt }
            : c,
        );
      }
      return next;
    });
    return reply;
  };

  const onDragEnd = (event: DragEndEvent) => {
    setDraggingId(null);
    const id = event.active.id as string;
    const overId = event.over?.id as string | undefined;
    if (!overId) return;
    const targetStatus = COLUMNS.find((c) => c.status === overId)?.status;
    if (!targetStatus) return;

    let fromStatus: CommentStatus | null = null;
    let moved: Comment | null = null;
    for (const status of Object.keys(board) as CommentStatus[]) {
      const match = board[status].find((c) => c.id === id);
      if (match) {
        fromStatus = status;
        moved = match;
        break;
      }
    }
    if (!moved || !fromStatus || fromStatus === targetStatus) return;

    const optimistic: BoardBuckets = {
      ...board,
      [fromStatus]: board[fromStatus].filter((c) => c.id !== id),
      [targetStatus]: [...board[targetStatus], { ...moved, status: targetStatus }].sort(
        (a, b) => b.voteScore - a.voteScore || (a.createdAt < b.createdAt ? 1 : -1),
      ),
    };
    setBoard(optimistic);

    (async () => {
      try {
        await setStatus(id, targetStatus);
        toast.success(`Moved to ${labelFor(targetStatus)}`);
      } catch (err) {
        setBoard(board);
        const message =
          err instanceof Error && "code" in err && (err as { code?: string }).code === "forbidden"
            ? "Only admins can change status."
            : "Failed to move card.";
        toast.error(message);
      }
    })();
  };

  const allComments = useMemo(
    () => ([] as Comment[]).concat(...(Object.values(board) as Comment[][])),
    [board],
  );

  const availableRoutes = useMemo(() => {
    const s = new Set<string>();
    for (const c of allComments) s.add(c.route);
    return Array.from(s).sort();
  }, [allComments]);

  const availableTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of allComments) for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [allComments]);

  const filteredBoard = useMemo(() => {
    const q = query.trim().toLowerCase();
    const passes = (c: Comment) => {
      if (routeFilter && c.route !== routeFilter) return false;
      if (activeTags.size > 0 && !c.tags.some((t) => activeTags.has(t))) return false;
      if (q) {
        const hay = `${c.body}\n${c.author.name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    };
    const next: BoardBuckets = {
      open: board.open.filter(passes),
      triaged: board.triaged.filter(passes),
      planned: board.planned.filter(passes),
      shipped: board.shipped.filter(passes),
      wont_do: board.wont_do.filter(passes),
    };
    return next;
  }, [board, query, routeFilter, activeTags]);

  const totals = {
    open: filteredBoard.open.length,
    triaged: filteredBoard.triaged.length,
    planned: filteredBoard.planned.length,
    shipped: filteredBoard.shipped.length,
    wont_do: filteredBoard.wont_do.length,
  };
  const totalAll = totals.open + totals.triaged + totals.planned + totals.shipped + totals.wont_do;
  const totalAllUnfiltered =
    board.open.length +
    board.triaged.length +
    board.planned.length +
    board.shipped.length +
    board.wont_do.length;
  const filterActive = query !== "" || routeFilter !== "" || activeTags.size > 0;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display tracking-tight">Feature board</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-[560px]">
            Every pin dropped across the product, collected here. Upvote what matters, reply to
            what you recognize.{" "}
            {admin ? (
              <span className="text-foreground">Drag cards between columns to triage.</span>
            ) : (
              <>Admins move cards as they move through triage.</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {admin && (
            <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full bg-primary/10 text-primary font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </span>
          )}
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
      ) : totalAllUnfiltered === 0 ? (
        <EmptyState />
      ) : (
        <>
          <FilterBar
            query={query}
            onQuery={setQuery}
            routes={availableRoutes}
            routeFilter={routeFilter}
            onRouteFilter={setRouteFilter}
            tags={availableTags}
            activeTags={activeTags}
            onToggleTag={(t) => {
              setActiveTags((prev) => {
                const next = new Set(prev);
                if (next.has(t)) next.delete(t);
                else next.add(t);
                return next;
              });
            }}
            onReset={() => {
              setQuery("");
              setRouteFilter("");
              setActiveTags(new Set());
            }}
            filterActive={filterActive}
          />
          {totalAll === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-dashed bg-background/50 p-8 text-center text-sm text-muted-foreground">
              No comments match these filters.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              onDragStart={(e) => setDraggingId(e.active.id as string)}
              onDragCancel={() => setDraggingId(null)}
              onDragEnd={onDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {COLUMNS.map((col) => (
                  <Column
                    key={col.status}
                    column={col}
                    items={filteredBoard[col.status]}
                    admin={admin}
                    onVote={applyVote}
                    onOpenThread={setThreadId}
                  />
                ))}
              </div>
              <DragOverlay>
                {draggingComment && (
                  <FeedbackCard
                    comment={draggingComment}
                    onVote={() => undefined}
                    onOpenThread={() => undefined}
                    dragHandleProps={null}
                    admin={admin}
                    isOverlay
                  />
                )}
              </DragOverlay>
            </DndContext>
          )}
        </>
      )}

      <ThreadSidebar
        comment={threadComment}
        onClose={() => setThreadId(null)}
        onVote={applyVote}
        onReply={applyReply}
      />
    </div>
  );
}

function FilterBar({
  query,
  onQuery,
  routes,
  routeFilter,
  onRouteFilter,
  tags,
  activeTags,
  onToggleTag,
  onReset,
  filterActive,
}: {
  query: string;
  onQuery: (v: string) => void;
  routes: string[];
  routeFilter: string;
  onRouteFilter: (v: string) => void;
  tags: { tag: string; count: number }[];
  activeTags: Set<string>;
  onToggleTag: (tag: string) => void;
  onReset: () => void;
  filterActive: boolean;
}) {
  return (
    <div className="mb-4 rounded-[var(--radius-md)] border bg-background p-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="relative flex items-center h-9 flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search body or author…"
            className="w-full h-9 pl-8 pr-2 rounded-md bg-muted/40 text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        <select
          value={routeFilter}
          onChange={(e) => onRouteFilter(e.target.value)}
          className="h-9 px-2 rounded-md border bg-background text-sm font-mono text-muted-foreground"
        >
          <option value="">All routes</option>
          {routes.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {filterActive && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 h-9 px-2.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <XIcon className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex items-center flex-wrap gap-1">
          {tags.map(({ tag, count }) => {
            const active = activeTags.has(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={cn(
                  "inline-flex items-center h-6 px-2 rounded-full text-[11px] border transition-colors",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-transparent hover:bg-muted/70",
                )}
              >
                {tag}
                <span className="ml-1 opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Column({
  column,
  items,
  admin,
  onVote,
  onOpenThread,
}: {
  column: { status: CommentStatus; label: string; accent: string };
  items: Comment[];
  admin: boolean;
  onVote: (id: string, value: -1 | 0 | 1) => Promise<void>;
  onOpenThread: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });
  return (
    <div ref={setNodeRef} className="flex flex-col min-w-0">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className={cn("h-2 w-2 rounded-full", column.accent)} />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {column.label}
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
      </div>
      <div
        className={cn(
          "flex-1 space-y-2 rounded-[var(--radius-md)] transition-colors min-h-[120px] p-0.5",
          isOver && "bg-primary/5 outline outline-2 outline-dashed outline-primary/30",
        )}
      >
        {items.map((c) => (
          <DraggableCard
            key={c.id}
            comment={c}
            admin={admin}
            onVote={onVote}
            onOpenThread={onOpenThread}
          />
        ))}
        {items.length === 0 && (
          <div className="text-xs text-muted-foreground/60 px-1 py-3 italic">nothing here yet</div>
        )}
      </div>
    </div>
  );
}

function DraggableCard({
  comment,
  admin,
  onVote,
  onOpenThread,
}: {
  comment: Comment;
  admin: boolean;
  onVote: (id: string, value: -1 | 0 | 1) => Promise<void>;
  onOpenThread: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: comment.id,
    disabled: !admin,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-40")}
      {...attributes}
    >
      <FeedbackCard
        comment={comment}
        onVote={(v) => onVote(comment.id, v)}
        onOpenThread={() => onOpenThread(comment.id)}
        dragHandleProps={
          admin ? (listeners as Record<string, (event: unknown) => void> | undefined) : null
        }
        admin={admin}
      />
    </div>
  );
}

function FeedbackCard({
  comment,
  onVote,
  onOpenThread,
  dragHandleProps,
  admin,
  isOverlay,
}: {
  comment: Comment;
  onVote: (value: -1 | 0 | 1) => void;
  onOpenThread: () => void;
  dragHandleProps: Record<string, (event: unknown) => void> | null | undefined;
  admin: boolean;
  isOverlay?: boolean;
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
        "group rounded-[var(--radius-md)] border bg-card p-3",
        !isOverlay && "stagger-in hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow",
        isOverlay && "shadow-[0_16px_40px_rgba(0,0,0,0.2)] rotate-[1.5deg]",
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
          {comment.screenshotUrl && (
            <img
              src={comment.screenshotUrl}
              alt=""
              className="w-full h-20 object-cover object-top rounded-sm border mb-2"
            />
          )}
          <p className="text-sm leading-snug line-clamp-3 break-words">{comment.body}</p>
          <div className="mt-2 flex items-center flex-wrap gap-1.5">
            <Link
              to={comment.route}
              search={{ thread: comment.id }}
              className="inline-flex items-center gap-1 h-5 px-1.5 rounded border bg-background text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/50"
              title={`Open ${comment.route} with this thread`}
            >
              <ExternalLink className="h-3 w-3" />
              {comment.route}
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenThread();
              }}
              className="inline-flex items-center gap-1 h-5 px-1.5 rounded border bg-background text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/50"
              title="Open full thread"
              {...(isOverlay ? {} : {})}
            >
              <PanelRight className="h-3 w-3" />
              Thread
            </button>
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
        {admin && (
          <button
            type="button"
            className={cn(
              "h-6 w-5 -mr-1 shrink-0 flex items-center justify-center text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity",
              isOverlay && "opacity-100",
            )}
            aria-label="Drag to change status"
            {...(dragHandleProps ?? {})}
            onClick={(e) => e.preventDefault()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  );
}

function ThreadSidebar({
  comment,
  onClose,
  onVote,
  onReply,
}: {
  comment: Comment | null;
  onClose: () => void;
  onVote: (id: string, value: -1 | 0 | 1) => Promise<void>;
  onReply: (id: string, body: string) => Promise<Reply>;
}) {
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState(false);

  // Reset reply when switching comments or closing
  useEffect(() => {
    setReply("");
    setPending(false);
  }, [comment?.id]);

  const submit = async () => {
    if (!comment || pending) return;
    const trimmed = reply.trim();
    if (!trimmed) return;
    setPending(true);
    try {
      await onReply(comment.id, trimmed);
      setReply("");
    } catch {
      toast.error("Reply failed");
    } finally {
      setPending(false);
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <Sheet open={!!comment} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-4 py-3 border-b space-y-1">
          <SheetTitle className="text-sm font-semibold">Thread</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {comment ? `On ${comment.route}` : ""}
          </SheetDescription>
        </SheetHeader>

        {comment && (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onVote(comment.id, comment.myVote === 1 ? 0 : 1)}
                    className={cn(
                      "h-7 w-7 rounded hover:bg-muted flex items-center justify-center",
                      comment.myVote === 1 && "text-primary",
                    )}
                    aria-label="Upvote"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold tabular-nums">{comment.voteScore}</span>
                  <button
                    type="button"
                    onClick={() => onVote(comment.id, comment.myVote === -1 ? 0 : -1)}
                    className={cn(
                      "h-7 w-7 rounded hover:bg-muted flex items-center justify-center",
                      comment.myVote === -1 && "text-destructive",
                    )}
                    aria-label="Downvote"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {comment.author.avatarUrl ? (
                      <img
                        src={comment.author.avatarUrl}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="h-6 w-6 rounded-full text-[10px] font-semibold flex items-center justify-center text-white bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b]">
                        {initials(comment.author.name)}
                      </span>
                    )}
                    <span className="text-sm font-medium truncate">{comment.author.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {relativeTime(comment.createdAt)}
                    </span>
                  </div>
                  {comment.screenshotUrl && (
                    <a
                      href={comment.screenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block mb-2 rounded-md overflow-hidden border bg-muted/40"
                    >
                      <img
                        src={comment.screenshotUrl}
                        alt=""
                        className="w-full max-h-60 object-cover object-top"
                      />
                    </a>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{comment.body}</p>
                  {comment.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {comment.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center h-5 px-1.5 rounded-full bg-muted text-[10px] font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      to={comment.route}
                      search={{ thread: comment.id }}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md border bg-background text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/50"
                      title={`Open ${comment.route}`}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open in app
                    </Link>
                  </div>
                </div>
              </div>

              {comment.replies.length > 0 && (
                <div className="space-y-3 pl-9">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                  </div>
                  {comment.replies.map((r) => (
                    <div key={r.id} className="border-l-2 border-border pl-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        {r.author.avatarUrl ? (
                          <img
                            src={r.author.avatarUrl}
                            alt=""
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        ) : (
                          <span className="h-5 w-5 rounded-full text-[9px] font-semibold flex items-center justify-center text-white bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b]">
                            {initials(r.author.name)}
                          </span>
                        )}
                        <span className="text-xs font-medium">{r.author.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {relativeTime(r.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t px-3 py-2 flex items-center gap-2">
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
                className="flex-1 h-9 px-2 rounded-md bg-muted/40 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={submit}
                disabled={!reply.trim() || pending}
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center text-white bg-primary hover:bg-primary/90",
                  (!reply.trim() || pending) && "opacity-40 cursor-not-allowed",
                )}
                aria-label="Send reply"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
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

function labelFor(status: CommentStatus): string {
  return COLUMNS.find((c) => c.status === status)?.label ?? status;
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
