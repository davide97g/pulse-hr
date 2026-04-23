import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Trophy, Users } from "lucide-react";
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
  Send,
  Plus,
  Lightbulb,
  Sparkles,
  MessageCircle,
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
} from "@pulse-hr/ui/primitives/sheet";
import { useUrlParam } from "@/lib/useUrlParam";
import {
  KindBadge,
  KIND_META,
  itemKind,
  type BoardItemKind as SharedBoardItemKind,
} from "@/components/feedback/shared";

const APP_URL = import.meta.env.VITE_APP_URL ?? "https://app.pulsehr.it";

export const Route = createFileRoute("/")({
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

type BoardItemKind = SharedBoardItemKind;

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
  const [activeKinds, setActiveKinds] = useState<Set<BoardItemKind>>(new Set());
  const [tabRaw, setTabRaw] = useUrlParam("tab");
  const tab: "comments" | "proposals" | "contributors" =
    tabRaw === "proposals" || tabRaw === "contributors" ? tabRaw : "comments";
  const setTab = (v: "comments" | "proposals" | "contributors") =>
    setTabRaw(v === "comments" ? null : v);
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

  const kindCounts = useMemo(() => {
    const c: Record<BoardItemKind, number> = { comment: 0, idea: 0, improvement: 0 };
    for (const it of allItems) c[itemKind(it)] += 1;
    return c;
  }, [allItems]);

  const filteredBoard = useMemo(() => {
    const q = query.trim().toLowerCase();
    const passes = (c: BoardItem) => {
      if (tab === "comments" && c.kind !== "comment") return false;
      if (tab === "proposals" && c.kind !== "proposal") return false;
      if (activeKinds.size > 0 && !activeKinds.has(itemKind(c))) return false;
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
  }, [board, query, routeFilter, activeTags, activeKinds, tab]);

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
  const filterActive =
    query !== "" || routeFilter !== "" || activeTags.size > 0 || activeKinds.size > 0;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display tracking-tight">Feedback</h1>
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

      <TabBar
        tab={tab}
        onTab={setTab}
        counts={{
          comments: allItems.filter((i) => i.kind === "comment").length,
          proposals: allItems.filter((i) => i.kind === "proposal").length,
        }}
      />

      {tab === "contributors" ? (
        <ContributorsPanel items={allItems} loaded={loaded} currentUserId={user?.id ?? null} />
      ) : !loaded ? (
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
            kindCounts={kindCounts}
            kinds={
              tab === "proposals" ? (["idea", "improvement"] as BoardItemKind[]) : []
            }
            activeKinds={activeKinds}
            onToggleKind={(k) => {
              setActiveKinds((prev) => {
                const next = new Set(prev);
                if (next.has(k)) next.delete(k);
                else next.add(k);
                return next;
              });
            }}
            onReset={() => {
              setQuery("");
              setRouteFilter("");
              setActiveTags(new Set());
              setActiveKinds(new Set());
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
  kindCounts,
  kinds,
  activeKinds,
  onToggleKind,
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
  kindCounts: Record<BoardItemKind, number>;
  kinds: BoardItemKind[];
  activeKinds: Set<BoardItemKind>;
  onToggleKind: (kind: BoardItemKind) => void;
  onReset: () => void;
  filterActive: boolean;
}) {
  return (
    <div className="mb-4 rounded-[var(--radius-md)] border bg-background p-3 space-y-2">
      {kinds.length > 0 && (
      <div className="flex items-center gap-1.5 flex-wrap">
        {kinds.map((k) => {
          const meta = KIND_META[k];
          const Icon = meta.icon;
          const active = activeKinds.has(k);
          const count = kindCounts[k];
          return (
            <button
              key={k}
              type="button"
              onClick={() => onToggleKind(k)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-xs font-medium transition-colors press-scale",
                active ? meta.cls : "bg-background hover:bg-muted text-muted-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.plural}
              <span
                className={cn(
                  "ml-0.5 tabular-nums",
                  active ? "opacity-80" : "opacity-60",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
      )}
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

function TypeBadge({ type, size = "sm" }: { type: ProposalType; size?: "sm" | "md" }) {
  return <KindBadge kind={type} size={size} />;
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
      role="button"
      tabIndex={isOverlay ? -1 : 0}
      onClick={(e) => {
        if (isOverlay) return;
        const target = e.target as HTMLElement | null;
        if (target?.closest("[data-card-stop]")) return;
        onOpenThread();
      }}
      onKeyDown={(e) => {
        if (isOverlay) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenThread();
        }
      }}
      className={cn(
        "group rounded-[var(--radius-md)] border bg-card p-3 text-left",
        !isOverlay &&
          "stagger-in cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        isOverlay && "shadow-[0_16px_40px_rgba(0,0,0,0.2)] rotate-[1.5deg]",
      )}
    >
      <div className="flex items-start gap-2">
        <div data-card-stop className="flex flex-col items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVote(item.myVote === 1 ? 0 : 1);
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              onVote(item.myVote === -1 ? 0 : -1);
            }}
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
            <KindBadge kind={itemKind(item)} />
            {item.kind === "comment" && (
              <a
                data-card-stop
                href={`${APP_URL}${item.route}?thread=${encodeURIComponent(item.id)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 h-5 px-1.5 rounded border bg-background text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/50"
                title={`Open ${item.route} with this thread`}
              >
                <ExternalLink className="h-3 w-3" />
                {item.route}
              </a>
            )}
            <span
              className="inline-flex items-center gap-1 h-5 px-1.5 rounded border bg-background text-[10px] text-muted-foreground"
              title={
                item.replies.length === 1
                  ? "1 comment"
                  : `${item.replies.length} comments`
              }
              aria-label={
                item.replies.length === 1
                  ? "1 comment"
                  : `${item.replies.length} comments`
              }
            >
              <MessageSquare className="h-3 w-3" />
              {item.replies.length}
            </span>
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
          <div className="mt-2 flex items-center text-[11px] text-muted-foreground">
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
          </div>
        </div>
        {admin && (
          <button
            type="button"
            data-card-stop
            className={cn(
              "h-6 w-5 -mr-1 shrink-0 flex items-center justify-center text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity",
              isOverlay && "opacity-100",
            )}
            aria-label="Drag to change status"
            {...(dragHandleProps ?? {})}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
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
      ? `${KIND_META[item.type].label.toLowerCase()} proposal`
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
                  <div className="mt-3 flex items-center flex-wrap gap-2">
                    {item.kind === "comment" && (
                      <a
                        href={`${APP_URL}${item.route}?thread=${encodeURIComponent(item.id)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border bg-background text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 press-scale"
                        title={`Open ${item.route} with this thread`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open in app
                      </a>
                    )}
                    <Link
                      to={item.kind === "comment" ? "/comments/$id" : "/proposals/$id"}
                      params={{ id: item.id }}
                      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 press-scale"
                    >
                      Open details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
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

function TabBar({
  tab,
  onTab,
  counts,
}: {
  tab: "comments" | "proposals" | "contributors";
  onTab: (v: "comments" | "proposals" | "contributors") => void;
  counts: { comments: number; proposals: number };
}) {
  const TABS: {
    value: "comments" | "proposals" | "contributors";
    label: string;
    icon: typeof MessageSquare;
    count?: number;
  }[] = [
    { value: "comments", label: "Comments", icon: MessageCircle, count: counts.comments },
    { value: "proposals", label: "Proposals", icon: Lightbulb, count: counts.proposals },
    { value: "contributors", label: "Contributors", icon: Trophy },
  ];
  return (
    <div className="mb-4 flex items-center gap-1 border-b">
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onTab(t.value)}
            aria-pressed={active}
            className={cn(
              "relative inline-flex items-center gap-2 h-10 px-3 text-sm font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={cn(
                  "ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-semibold tabular-nums",
                  active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {t.count}
              </span>
            )}
            {active && (
              <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-t bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

type Contributor = {
  author: ApiAuthor;
  comments: number;
  proposals: number;
  replies: number;
  votesReceived: number;
  score: number;
  items: BoardItem[];
};

type ApiAuthor = BoardItem["author"];

function buildContributors(items: BoardItem[], currentUserId: string | null): Contributor[] {
  const map = new Map<string, Contributor>();
  const upsert = (author: ApiAuthor) => {
    let c = map.get(author.id);
    if (!c) {
      c = {
        author,
        comments: 0,
        proposals: 0,
        replies: 0,
        votesReceived: 0,
        score: 0,
        items: [],
      };
      map.set(author.id, c);
    }
    return c;
  };
  for (const it of items) {
    const c = upsert(it.author);
    if (it.kind === "comment") c.comments += 1;
    else c.proposals += 1;
    c.votesReceived += Math.max(0, it.voteScore);
    c.items.push(it);
    for (const r of it.replies) {
      const rc = upsert(r.author);
      rc.replies += 1;
    }
  }
  for (const c of map.values()) {
    c.score = c.comments + c.proposals + c.replies + Math.floor(c.votesReceived / 2);
    c.items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  return Array.from(map.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aMe = currentUserId && a.author.id === currentUserId ? 1 : 0;
    const bMe = currentUserId && b.author.id === currentUserId ? 1 : 0;
    if (aMe !== bMe) return bMe - aMe;
    return a.author.name.localeCompare(b.author.name);
  });
}

const CONTRIBUTORS_PER_PAGE = 10;

function ContributorsPanel({
  items,
  loaded,
  currentUserId,
}: {
  items: BoardItem[];
  loaded: boolean;
  currentUserId: string | null;
}) {
  const contributors = useMemo(
    () => buildContributors(items, currentUserId),
    [items, currentUserId],
  );
  const [page, setPage] = useState(1);
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(contributors.length / CONTRIBUTORS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * CONTRIBUTORS_PER_PAGE;
  const pageRows = contributors.slice(start, start + CONTRIBUTORS_PER_PAGE);

  const myIndex = useMemo(
    () => (currentUserId ? contributors.findIndex((c) => c.author.id === currentUserId) : -1),
    [contributors, currentUserId],
  );
  const myRank = myIndex >= 0 ? myIndex + 1 : null;

  const showMe = () => {
    if (myIndex < 0) return;
    const targetPage = Math.floor(myIndex / CONTRIBUTORS_PER_PAGE) + 1;
    setPage(targetPage);
    setHighlightId(currentUserId);
    window.setTimeout(() => setHighlightId(null), 2400);
  };

  const openContributor = contributors.find((c) => c.author.id === openUserId) ?? null;

  if (!loaded) {
    return <div className="text-sm text-muted-foreground">Loading leaderboard…</div>;
  }
  if (contributors.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed bg-background/50 p-8 text-center text-sm text-muted-foreground">
        No contributors yet. Be the first to drop a comment or post a proposal.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>
            {contributors.length} contributor{contributors.length === 1 ? "" : "s"}
          </span>
          {myRank && (
            <span className="ml-2 inline-flex items-center h-5 px-1.5 rounded-full bg-primary/10 text-primary font-medium">
              You're #{myRank}
            </span>
          )}
        </div>
        {myIndex >= 0 && (
          <button
            type="button"
            onClick={showMe}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border bg-background text-xs font-medium hover:bg-muted press-scale"
          >
            <Trophy className="h-3.5 w-3.5 text-primary" />
            Show me
          </button>
        )}
      </div>

      <div className="rounded-[var(--radius-md)] border bg-background overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_80px_80px_80px_80px_auto] items-center gap-3 px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground border-b bg-muted/30">
          <span>#</span>
          <span>Person</span>
          <span className="text-right">Comments</span>
          <span className="text-right">Proposals</span>
          <span className="text-right">Replies</span>
          <span className="text-right">Score</span>
          <span />
        </div>
        {pageRows.map((c, idx) => {
          const rank = start + idx + 1;
          const isMe = currentUserId && c.author.id === currentUserId;
          const isHighlighted = highlightId && c.author.id === highlightId;
          return (
            <button
              key={c.author.id}
              type="button"
              onClick={() => setOpenUserId(c.author.id)}
              className={cn(
                "w-full grid grid-cols-[40px_1fr_80px_80px_80px_80px_auto] items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors border-b last:border-b-0 hover:bg-muted/60",
                isMe && "bg-primary/5",
                isHighlighted && "ring-2 ring-primary/60 ring-inset bg-primary/10",
              )}
            >
              <span
                className={cn(
                  "font-semibold tabular-nums text-xs",
                  rank === 1 && "text-primary",
                  rank === 2 && "text-foreground/80",
                  rank === 3 && "text-warning",
                  rank > 3 && "text-muted-foreground",
                )}
              >
                {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
              </span>
              <span className="flex items-center gap-2 min-w-0">
                {c.author.avatarUrl ? (
                  <img
                    src={c.author.avatarUrl}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span className="h-7 w-7 rounded-full text-[10px] font-semibold flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b]">
                    {c.author.name
                      .split(" ")
                      .map((s) => s[0])
                      .filter(Boolean)
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "?"}
                  </span>
                )}
                <span className="min-w-0 truncate font-medium">
                  {c.author.name}
                  {isMe && (
                    <span className="ml-1.5 text-[10px] font-normal text-primary">(you)</span>
                  )}
                </span>
              </span>
              <span className="text-right tabular-nums">{c.comments}</span>
              <span className="text-right tabular-nums">{c.proposals}</span>
              <span className="text-right tabular-nums">{c.replies}</span>
              <span className="text-right tabular-nums font-semibold">{c.score}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-8 px-3 rounded-md border bg-background text-xs disabled:opacity-50 hover:bg-muted press-scale"
          >
            Prev
          </button>
          <span className="h-8 inline-flex items-center px-3 text-xs text-muted-foreground tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-8 px-3 rounded-md border bg-background text-xs disabled:opacity-50 hover:bg-muted press-scale"
          >
            Next
          </button>
        </div>
      )}

      <ContributorSheet contributor={openContributor} onClose={() => setOpenUserId(null)} />
    </div>
  );
}

function ContributorSheet({
  contributor,
  onClose,
}: {
  contributor: Contributor | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!contributor} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        <SheetHeader className="px-4 py-3 border-b space-y-1">
          <SheetTitle className="text-sm font-semibold">Contributions</SheetTitle>
          {contributor && (
            <SheetDescription className="text-xs text-muted-foreground">
              {contributor.author.name} — {contributor.items.length} posted,{" "}
              {contributor.replies} repl{contributor.replies === 1 ? "y" : "ies"},{" "}
              {contributor.votesReceived} net upvotes
            </SheetDescription>
          )}
        </SheetHeader>
        {contributor && (
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
            {contributor.items.length === 0 ? (
              <div className="text-xs text-muted-foreground italic px-1">
                No posted items yet (only replies).
              </div>
            ) : (
              contributor.items.map((item) => {
                const kind = itemKind(item);
                const href =
                  item.kind === "comment" ? `/comments/${item.id}` : `/proposals/${item.id}`;
                return (
                  <Link
                    key={item.id}
                    to={href}
                    onClick={onClose}
                    className="block rounded-[var(--radius-md)] border bg-card p-3 hover:border-primary/50 hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <KindBadge kind={kind} />
                      <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">
                        {relativeTime(item.createdAt)}
                      </span>
                    </div>
                    {item.kind === "proposal" && (
                      <p className="text-sm font-semibold leading-snug line-clamp-2 break-words mb-0.5">
                        {item.title}
                      </p>
                    )}
                    <p
                      className={cn(
                        "text-sm leading-snug break-words",
                        item.kind === "proposal"
                          ? "line-clamp-2 text-muted-foreground"
                          : "line-clamp-3",
                      )}
                    >
                      {item.body}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <ChevronUp className="h-3 w-3" />
                        {item.voteScore}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {item.replies.length}
                      </span>
                      {item.kind === "comment" && (
                        <span className="font-mono truncate">{item.route}</span>
                      )}
                      <span className="ml-auto inline-flex items-center gap-0.5 text-primary">
                        Open
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
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
