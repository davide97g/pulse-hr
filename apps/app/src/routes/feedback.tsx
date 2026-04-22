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
  Plus,
  Bug,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fetchBoard, setVote, setStatus, setTokenGetter, createReply } from "@/lib/comments/api";
import type { BoardBuckets, BoardItem } from "@/lib/comments/api";
import type { CommentStatus, Reply } from "@/lib/comments/types";
import { createProposalReply, setProposalStatus, setProposalVote } from "@/lib/proposals/api";
import type { ProposalReply, ProposalType } from "@/lib/proposals/types";
import { useNewProposal } from "@/components/proposals/ProposalProvider";
import { useIsEffectiveAdmin } from "@/lib/role-override";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUrlParam } from "@/lib/useUrlParam";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Pulse" }] }),
  validateSearch: (s: Record<string, unknown>) => s as Record<string, string>,
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

function itemText(item: BoardItem): string {
  return item.kind === "proposal" ? `${item.title}\n${item.body}` : item.body;
}

function FeedbackBoard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [board, setBoard] = useState<BoardBuckets>(EMPTY_BOARD);
  const [loaded, setLoaded] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [routeFilter, setRouteFilter] = useState<string>("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [threadRaw, setThreadRaw] = useUrlParam("thread");
  const threadId = threadRaw || null;
  const setThreadId = (v: string | null) => setThreadRaw(v);
  const admin = useIsEffectiveAdmin();
  const { open: openProposal } = useNewProposal();

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const findItem = (id: string): { status: CommentStatus; item: BoardItem } | null => {
    for (const status of Object.keys(board) as CommentStatus[]) {
      const match = board[status].find((c) => c.id === id);
      if (match) return { status, item: match };
    }
    return null;
  };

  const draggingItem = useMemo(() => {
    if (!draggingId) return null;
    return findItem(draggingId)?.item ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, draggingId]);

  const threadItem = useMemo(() => {
    if (!threadId) return null;
    return findItem(threadId)?.item ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, threadId]);

  const applyVote = async (id: string, kind: BoardItem["kind"], value: -1 | 0 | 1) => {
    setBoard((prev) => {
      const next = { ...prev } as BoardBuckets;
      for (const status of Object.keys(next) as CommentStatus[]) {
        const touched = next[status].some((c) => c.id === id);
        if (!touched) continue;
        next[status] = next[status]
          .map((c) => {
            if (c.id !== id) return c;
            const delta = value - c.myVote;
            return { ...c, myVote: value, voteScore: c.voteScore + delta } as BoardItem;
          })
          .sort((a, b) => b.voteScore - a.voteScore || (a.createdAt < b.createdAt ? 1 : -1));
      }
      return next;
    });
    try {
      const { voteScore, myVote } =
        kind === "proposal" ? await setProposalVote(id, value) : await setVote(id, value);
      setBoard((prev) => {
        const next = { ...prev } as BoardBuckets;
        for (const status of Object.keys(next) as CommentStatus[]) {
          const touched = next[status].some((c) => c.id === id);
          if (!touched) continue;
          next[status] = next[status]
            .map((c) => (c.id === id ? ({ ...c, voteScore, myVote } as BoardItem) : c))
            .sort((a, b) => b.voteScore - a.voteScore || (a.createdAt < b.createdAt ? 1 : -1));
        }
        return next;
      });
    } catch {
      toast.error("Vote failed");
      refresh();
    }
  };

  const applyReply = async (
    id: string,
    kind: BoardItem["kind"],
    body: string,
  ): Promise<Reply | ProposalReply> => {
    const reply =
      kind === "proposal" ? await createProposalReply(id, body) : await createReply(id, body);
    setBoard((prev) => {
      const next = { ...prev } as BoardBuckets;
      for (const status of Object.keys(next) as CommentStatus[]) {
        next[status] = next[status].map((c) =>
          c.id === id
            ? ({
                ...c,
                replies: [...c.replies, reply],
                updatedAt: reply.createdAt,
              } as BoardItem)
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

    const found = findItem(id);
    if (!found) return;
    const { status: fromStatus, item: moved } = found;
    if (fromStatus === targetStatus) return;

    const optimistic: BoardBuckets = {
      ...board,
      [fromStatus]: board[fromStatus].filter((c) => c.id !== id),
      [targetStatus]: [
        ...board[targetStatus],
        { ...moved, status: targetStatus } as BoardItem,
      ].sort((a, b) => b.voteScore - a.voteScore || (a.createdAt < b.createdAt ? 1 : -1)),
    };
    setBoard(optimistic);

    (async () => {
      try {
        if (moved.kind === "proposal") {
          await setProposalStatus(id, targetStatus);
        } else {
          await setStatus(id, targetStatus);
        }
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

  const allItems = useMemo(
    () => ([] as BoardItem[]).concat(...(Object.values(board) as BoardItem[][])),
    [board],
  );

  const availableRoutes = useMemo(() => {
    const s = new Set<string>();
    for (const c of allItems) if (c.kind === "comment") s.add(c.route);
    return Array.from(s).sort();
  }, [allItems]);

  const availableTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of allItems) {
      if (c.kind !== "comment") continue;
      for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [allItems]);

  const filteredBoard = useMemo(() => {
    const q = query.trim().toLowerCase();
    const passes = (c: BoardItem) => {
      if (routeFilter && (c.kind !== "comment" || c.route !== routeFilter)) return false;
      if (activeTags.size > 0) {
        if (c.kind !== "comment") return false;
        if (!c.tags.some((t) => activeTags.has(t))) return false;
      }
      if (q) {
        const hay = `${itemText(c)}\n${c.author.name}`.toLowerCase();
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
            Every pin and proposal lands here. Upvote what matters, reply to what you recognize.{" "}
            {admin ? (
              <span className="text-foreground">Drag cards between columns to triage.</span>
            ) : (
              <>Admins move cards as they move through triage.</>
            )}{" "}
            <span className="text-muted-foreground">
              Press{" "}
              <kbd className="inline-flex h-4 px-1 items-center rounded border bg-muted text-[10px] font-mono align-[1px]">
                ⌘⇧O
              </kbd>{" "}
              to propose.
            </span>
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
          <button
            type="button"
            onClick={openProposal}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium press-scale hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            Propose
          </button>
        </div>
      </div>

      {!loaded ? (
        <div className="text-sm text-muted-foreground">Loading board…</div>
      ) : totalAllUnfiltered === 0 ? (
        <EmptyState onPropose={openProposal} />
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
              Nothing matches these filters.
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
                {draggingItem && (
                  <FeedbackCard
                    item={draggingItem}
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
        item={threadItem}
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
            placeholder="Search body, title or author…"
            className="w-full h-9 pl-8 pr-2 rounded-md bg-muted/40 text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        {routes.length > 0 && (
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
        )}
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
  items: BoardItem[];
  admin: boolean;
  onVote: (id: string, kind: BoardItem["kind"], value: -1 | 0 | 1) => Promise<void>;
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
            item={c}
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
  item,
  admin,
  onVote,
  onOpenThread,
}: {
  item: BoardItem;
  admin: boolean;
  onVote: (id: string, kind: BoardItem["kind"], value: -1 | 0 | 1) => Promise<void>;
  onOpenThread: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    disabled: !admin,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-40")} {...attributes}>
      <FeedbackCard
        item={item}
        onVote={(v) => onVote(item.id, item.kind, v)}
        onOpenThread={() => onOpenThread(item.id)}
        dragHandleProps={
          admin ? (listeners as Record<string, (event: unknown) => void> | undefined) : null
        }
        admin={admin}
      />
    </div>
  );
}

const PROPOSAL_TYPE_META: Record<ProposalType, { label: string; icon: typeof Bug; cls: string }> = {
  bug: {
    label: "BUG",
    icon: Bug,
    cls: "bg-destructive/10 text-destructive border-destructive/30",
  },
  idea: {
    label: "IDEA",
    icon: Lightbulb,
    cls: "bg-primary/10 text-primary border-primary/30",
  },
  improvement: {
    label: "IMPROVEMENT",
    icon: Sparkles,
    cls: "bg-warning/15 text-warning border-warning/30",
  },
};

function TypeBadge({ type, size = "sm" }: { type: ProposalType; size?: "sm" | "md" }) {
  const meta = PROPOSAL_TYPE_META[type];
  const Icon = meta.icon;
  const h = size === "md" ? "h-6 px-2 text-[11px]" : "h-5 px-1.5 text-[10px]";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold tracking-wider",
        h,
        meta.cls,
      )}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function FeedbackCard({
  item,
  onVote,
  onOpenThread,
  dragHandleProps,
  admin,
  isOverlay,
}: {
  item: BoardItem;
  onVote: (value: -1 | 0 | 1) => void;
  onOpenThread: () => void;
  dragHandleProps: Record<string, (event: unknown) => void> | null | undefined;
  admin: boolean;
  isOverlay?: boolean;
}) {
  const initials =
    item.author.name
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const isProposal = item.kind === "proposal";
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
            onClick={() => onVote(item.myVote === 1 ? 0 : 1)}
            className={cn(
              "h-6 w-6 rounded hover:bg-muted flex items-center justify-center",
              item.myVote === 1 && "text-primary",
            )}
            aria-label="Upvote"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold tabular-nums">{item.voteScore}</span>
          <button
            type="button"
            onClick={() => onVote(item.myVote === -1 ? 0 : -1)}
            className={cn(
              "h-6 w-6 rounded hover:bg-muted flex items-center justify-center",
              item.myVote === -1 && "text-destructive",
            )}
            aria-label="Downvote"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          {item.kind === "comment" && item.screenshotUrl && (
            <img
              src={item.screenshotUrl}
              alt=""
              className="w-full h-20 object-cover object-top rounded-sm border mb-2"
            />
          )}
          {isProposal && (
            <p className="text-sm font-semibold leading-snug line-clamp-2 break-words mb-0.5">
              {(item as BoardItem & { kind: "proposal" }).title}
            </p>
          )}
          <p
            className={cn(
              "text-sm leading-snug break-words",
              isProposal ? "line-clamp-2 text-muted-foreground" : "line-clamp-3",
            )}
          >
            {item.body}
          </p>
          <div className="mt-2 flex items-center flex-wrap gap-1.5">
            {item.kind === "comment" ? (
              <Link
                to={item.route}
                search={{ thread: item.id }}
                className="inline-flex items-center gap-1 h-5 px-1.5 rounded border bg-background text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/50"
                title={`Open ${item.route} with this thread`}
              >
                <ExternalLink className="h-3 w-3" />
                {item.route}
              </Link>
            ) : (
              <TypeBadge type={(item as BoardItem & { kind: "proposal" }).type} />
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenThread();
              }}
              className="inline-flex items-center gap-1 h-5 px-1.5 rounded border bg-background text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/50"
              title="Open full thread"
            >
              <PanelRight className="h-3 w-3" />
              Thread
            </button>
            {item.kind === "comment" &&
              item.tags.slice(0, 3).map((t) => (
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
              {item.author.avatarUrl ? (
                <img
                  src={item.author.avatarUrl}
                  alt=""
                  className="h-4 w-4 rounded-full object-cover"
                />
              ) : (
                <span className="h-4 w-4 rounded-full text-[8px] font-semibold flex items-center justify-center text-white bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b]">
                  {initials}
                </span>
              )}
              <span className="truncate">{item.author.name}</span>
            </div>
            {item.replies.length > 0 && (
              <span className="inline-flex items-center gap-1 shrink-0">
                <MessageSquare className="h-3 w-3" />
                {item.replies.length}
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
  item,
  onClose,
  onVote,
  onReply,
}: {
  item: BoardItem | null;
  onClose: () => void;
  onVote: (id: string, kind: BoardItem["kind"], value: -1 | 0 | 1) => Promise<void>;
  onReply: (id: string, kind: BoardItem["kind"], body: string) => Promise<Reply | ProposalReply>;
}) {
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setReply("");
    setPending(false);
  }, [item?.id]);

  const submit = async () => {
    if (!item || pending) return;
    const trimmed = reply.trim();
    if (!trimmed) return;
    setPending(true);
    try {
      await onReply(item.id, item.kind, trimmed);
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

  const headerDescription = item
    ? item.kind === "proposal"
      ? `${PROPOSAL_TYPE_META[item.type].label.toLowerCase()} proposal`
      : `On ${item.route}`
    : "";

  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        <SheetHeader className="px-4 py-3 border-b space-y-1">
          <SheetTitle className="text-sm font-semibold">Thread</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {headerDescription}
          </SheetDescription>
        </SheetHeader>

        {item && (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onVote(item.id, item.kind, item.myVote === 1 ? 0 : 1)}
                    className={cn(
                      "h-7 w-7 rounded hover:bg-muted flex items-center justify-center",
                      item.myVote === 1 && "text-primary",
                    )}
                    aria-label="Upvote"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold tabular-nums">{item.voteScore}</span>
                  <button
                    type="button"
                    onClick={() => onVote(item.id, item.kind, item.myVote === -1 ? 0 : -1)}
                    className={cn(
                      "h-7 w-7 rounded hover:bg-muted flex items-center justify-center",
                      item.myVote === -1 && "text-destructive",
                    )}
                    aria-label="Downvote"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {item.author.avatarUrl ? (
                      <img
                        src={item.author.avatarUrl}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="h-6 w-6 rounded-full text-[10px] font-semibold flex items-center justify-center text-white bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b]">
                        {initials(item.author.name)}
                      </span>
                    )}
                    <span className="text-sm font-medium truncate">{item.author.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {relativeTime(item.createdAt)}
                    </span>
                    {item.kind === "proposal" && <TypeBadge type={item.type} size="md" />}
                  </div>
                  {item.kind === "proposal" && (
                    <h3 className="text-base font-semibold leading-snug mb-1.5">{item.title}</h3>
                  )}
                  {item.kind === "comment" && item.screenshotUrl && (
                    <a
                      href={item.screenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block mb-2 rounded-md overflow-hidden border bg-muted/40"
                    >
                      <img
                        src={item.screenshotUrl}
                        alt=""
                        className="w-full max-h-60 object-cover object-top"
                      />
                    </a>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{item.body}</p>
                  {item.kind === "comment" && item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center h-5 px-1.5 rounded-full bg-muted text-[10px] font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.kind === "comment" && (
                    <div className="mt-3 flex items-center gap-2">
                      <Link
                        to={item.route}
                        search={{ thread: item.id }}
                        className="inline-flex items-center gap-1 h-7 px-2 rounded-md border bg-background text-[11px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/50"
                        title={`Open ${item.route}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open in app
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {item.replies.length > 0 && (
                <div className="space-y-3 pl-9">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {item.replies.length} {item.replies.length === 1 ? "reply" : "replies"}
                  </div>
                  {item.replies.map((r) => (
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

function EmptyState({ onPropose }: { onPropose: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed bg-background/50 p-10 text-center">
      <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
        <MessageSquare className="h-5 w-5" />
      </div>
      <h2 className="font-display text-lg">Nothing on the board yet</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        Drop a comment pin anywhere in Pulse, or post a proposal — bug, idea, improvement.
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={onPropose}
          className="inline-flex h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm press-scale"
        >
          <Plus className="h-4 w-4 mr-1" />
          New proposal
        </button>
        <button
          onClick={() => navigate({ to: "/" })}
          className="inline-flex h-9 px-3 rounded-md border bg-background text-sm press-scale"
        >
          Back to Pulse
        </button>
      </div>
    </div>
  );
}
