import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Trophy } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
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
import { useCompanyProfileStore } from "@/components/app/CompanyProfileStore";
import { describeApiError } from "@/lib/feedback-errors";
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
  AuthorAvatar,
  initialsFor,
  type BoardItemKind as SharedBoardItemKind,
} from "@/components/feedback/shared";

const APP_URL = import.meta.env.VITE_APP_URL ?? "https://app.pulsehr.it";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>) => s as Record<string, string>,
  component: FeedbackBoard,
});

const COLUMNS: { status: CommentStatus; label: string; accent: string; dot: string }[] = [
  { status: "open", label: "Open", accent: "bg-[#86efac]", dot: "#86efac" },
  { status: "triaged", label: "Triaged", accent: "bg-[#93c5fd]", dot: "#93c5fd" },
  { status: "planned", label: "Planned", accent: "bg-[#fde047]", dot: "#fde047" },
  { status: "shipped", label: "Shipped", accent: "bg-[var(--spark)]", dot: "var(--spark)" },
  {
    status: "wont_do",
    label: "Won't do",
    accent: "bg-white/40",
    dot: "rgba(255,255,255,.45)",
  },
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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 180);
    return () => window.clearTimeout(id);
  }, [query]);
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

  const { adjustPower } = useCompanyProfileStore();

  const applyVote = async (id: string, kind: BoardItem["kind"], value: -1 | 0 | 1) => {
    let priorVote: -1 | 0 | 1 = 0;
    setBoard((prev) => {
      const next = { ...prev } as BoardBuckets;
      for (const status of Object.keys(next) as CommentStatus[]) {
        const touched = next[status].some((c) => c.id === id);
        if (!touched) continue;
        next[status] = next[status]
          .map((c) => {
            if (c.id !== id) return c;
            priorVote = c.myVote;
            const delta = value - c.myVote;
            return { ...c, myVote: value, voteScore: c.voteScore + delta } as BoardItem;
          })
          .sort((a, b) => b.voteScore - a.voteScore || (a.createdAt < b.createdAt ? 1 : -1));
      }
      return next;
    });

    let powerDelta = 0;
    if (priorVote === 0 && value !== 0) powerDelta = -1;
    else if (priorVote !== 0 && value === 0) powerDelta = +1;
    if (powerDelta !== 0) adjustPower(powerDelta);

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
    } catch (err) {
      if (powerDelta !== 0) adjustPower(-powerDelta);
      toast.error(describeApiError(err, "Vote failed"));
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
    const q = debouncedQuery.trim().toLowerCase();
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
  }, [board, debouncedQuery, routeFilter, activeTags, activeKinds, tab]);

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
    <div className="px-4 md:px-14 py-6 md:py-8 max-w-[1440px] mx-auto w-full">
      {/* Hero */}
      <div className="flex items-end justify-between gap-8 mb-7 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--spark)] mb-2.5 inline-flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--spark)] pulse-dot"
              style={{ boxShadow: "0 0 8px var(--spark)" }}
            />
            Live wall · Bitrock
          </div>
          <h1 className="font-display font-light text-5xl md:text-[80px] leading-[0.88] tracking-[-0.045em] mb-3.5">
            Feedback<span className="text-[var(--spark)]">.</span>
          </h1>
          <p className="text-sm text-white/65 leading-[1.5] max-w-[560px]">
            Every pin and proposal lands here. Upvote what matters, reply to what you recognize.{" "}
            {admin ? (
              <span className="text-white/90">Drag cards between columns to triage.</span>
            ) : (
              <>Admins move cards as they move through triage.</>
            )}{" "}
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-white/20 font-mono text-[11px] align-[1px]">
              ⌘⇧O
            </kbd>{" "}
            to propose.
          </p>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          {admin && (
            <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-[var(--spark)]/10 text-[var(--spark)] border border-[var(--spark)]/25 font-mono text-[10px] tracking-[0.12em] uppercase">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </span>
          )}
          <HeroStat label="open" value={totals.open} dot="#86efac" />
          <HeroStat label="triaged" value={totals.triaged} dot="#93c5fd" />
          <HeroStat label="planned" value={totals.planned} dot="#fde047" />
          <HeroStat label="shipped" value={totals.shipped} dot="var(--spark)" glow />
          <button
            type="button"
            onClick={openProposal}
            className="h-11 px-6 rounded-full bg-[var(--spark)] text-[#0a1400] font-bold text-[13px] press-scale flex items-center gap-2"
            style={{ boxShadow: "0 12px 28px -10px var(--spark)" }}
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
        <div className="text-sm text-white/55">Loading board…</div>
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
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-sm text-white/55">
              Nothing matches these filters.
            </div>
          ) : tab === "proposals" ? (
            <ProposalsList
              items={[
                ...filteredBoard.open,
                ...filteredBoard.triaged,
                ...filteredBoard.planned,
                ...filteredBoard.shipped,
                ...filteredBoard.wont_do,
              ]}
              onVote={applyVote}
              onOpenThread={setThreadId}
            />
          ) : (
            <DndContext
              sensors={sensors}
              onDragStart={(e) => setDraggingId(e.active.id as string)}
              onDragCancel={() => setDraggingId(null)}
              onDragEnd={onDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
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
    <div className="mb-4 space-y-3">
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
                  "inline-flex items-center gap-1.5 h-7 px-3 rounded-full border text-xs font-medium press-scale",
                  active
                    ? "bg-[var(--spark)] text-[#0a1400] border-[var(--spark)] font-bold"
                    : "bg-white/5 text-white/85 border-white/10 hover:bg-white/8",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {meta.plural}
                <span className="ml-0.5 font-mono text-[10px] tabular-nums opacity-70">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <div className="flex items-center gap-2.5 flex-wrap">
        <label className="relative flex items-center h-10 flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 h-3.5 w-3.5 text-white/40" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search body, title or author…"
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-white/4 border border-white/8 text-sm outline-none placeholder:text-white/40 focus:border-[var(--spark)]/30"
          />
        </label>
        {routes.length > 0 && (
          <select
            value={routeFilter}
            onChange={(e) => onRouteFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-white/8 bg-white/4 text-sm font-mono text-white/85 outline-none"
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
            className="inline-flex items-center gap-1 h-10 px-3 rounded-xl text-xs text-white/55 hover:text-white hover:bg-white/5 border border-transparent"
          >
            <XIcon className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5">
          {tags.map(({ tag, count }) => {
            const active = activeTags.has(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={cn(
                  "inline-flex items-center h-7 px-2.5 rounded-full text-[11px] border transition-colors",
                  active
                    ? "bg-[var(--spark)] text-[#0a1400] border-[var(--spark)] font-bold"
                    : "bg-white/5 border-transparent text-white/85 hover:bg-white/8",
                )}
              >
                {tag}
                <span className="ml-1.5 font-mono text-[9px] opacity-60">{count}</span>
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
  column: { status: CommentStatus; label: string; accent: string; dot: string };
  items: BoardItem[];
  admin: boolean;
  onVote: (id: string, kind: BoardItem["kind"], value: -1 | 0 | 1) => Promise<void>;
  onOpenThread: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });
  const isShipped = column.status === "shipped";
  const isWontdo = column.status === "wont_do";
  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: column.dot,
            boxShadow: isShipped ? "0 0 10px var(--spark)" : undefined,
          }}
        />
        <h2
          className={cn(
            "font-mono text-[10px] tracking-[0.12em] uppercase",
            isShipped ? "text-[var(--spark)]" : "text-[var(--paper)]",
          )}
        >
          {column.label}
        </h2>
        <span className="font-display text-lg text-white/70 tabular-nums">{items.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 rounded-2xl transition-colors min-h-[300px] p-1.5 border border-dashed border-transparent",
          isShipped && "bg-[var(--spark)]/[0.03] border-[var(--spark)]/10 border-solid",
          isWontdo && "bg-white/[0.02]",
          isOver && "bg-[var(--spark)]/8 border-[var(--spark)]/30 border-solid",
        )}
      >
        {items.map((c, i) => (
          <DraggableCard
            key={c.id}
            item={c}
            admin={admin}
            onVote={onVote}
            onOpenThread={onOpenThread}
            tilt={i === 0 && column.status === "open"}
          />
        ))}
        {items.length === 0 && (
          <div className="text-[11px] text-white/30 px-2 py-8 italic text-center">
            nothing here yet
          </div>
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
  tilt,
}: {
  item: BoardItem;
  admin: boolean;
  onVote: (id: string, kind: BoardItem["kind"], value: -1 | 0 | 1) => Promise<void>;
  onOpenThread: (id: string) => void;
  tilt?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    disabled: !admin,
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : tilt
      ? { transform: "rotate(-0.4deg)" }
      : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "[content-visibility:auto] [contain-intrinsic-size:0_180px]",
        isDragging && "opacity-40",
      )}
      {...attributes}
    >
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
  const isProposal = item.kind === "proposal";
  const isShipped = item.status === "shipped";
  const isHot = item.voteScore >= 20;
  const kindLabel = itemKind(item).toUpperCase();
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
        "group rounded-2xl border p-3.5 text-left",
        !isOverlay &&
          "stagger-in cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--spark)]/40",
        isOverlay && "shadow-[0_16px_40px_rgba(0,0,0,0.5)] rotate-[1.5deg]",
      )}
      style={{
        background: isHot
          ? "color-mix(in oklch, var(--spark) 10%, #14120e)"
          : "rgba(20,18,14,.75)",
        borderColor: isHot ? "rgba(180,255,57,.3)" : "rgba(255,255,255,.07)",
      }}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
        <div
          data-card-stop
          className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5 min-w-[26px]"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVote(item.myVote === 1 ? 0 : 1);
            }}
            className={cn(
              "h-5 w-5 flex items-center justify-center hover:text-[var(--spark)]",
              item.myVote === 1 ? "text-[var(--spark)] opacity-100" : "opacity-40",
            )}
            aria-label="Upvote"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <span
            className="font-display text-[16px] leading-none tabular-nums"
            style={{ color: isHot ? "var(--spark)" : "var(--paper)" }}
          >
            {item.voteScore}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVote(item.myVote === -1 ? 0 : -1);
            }}
            className={cn(
              "h-5 w-5 flex items-center justify-center hover:text-red-400",
              item.myVote === -1 ? "text-red-400 opacity-100" : "opacity-25",
            )}
            aria-label="Downvote"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="min-w-0">
          {item.kind === "comment" && item.screenshotUrl && (
            <img
              src={item.screenshotUrl}
              alt=""
              className="w-full h-20 object-cover object-top rounded-md border border-white/8 mb-2"
            />
          )}
          {isProposal && (
            <p className="text-[13px] font-semibold leading-snug line-clamp-2 break-words mb-1">
              {(item as BoardItem & { kind: "proposal" }).title}
            </p>
          )}
          <p
            className={cn(
              "text-[13px] leading-[1.4] break-words",
              isProposal ? "line-clamp-2 text-white/65" : "line-clamp-3 text-white/90",
              isShipped && "line-through opacity-60",
            )}
          >
            {item.body}
          </p>
          <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
            <span
              className="px-2 py-0.5 rounded-full font-mono text-[8px] font-bold tracking-[0.1em]"
              style={{
                background: isHot ? "var(--spark)" : "rgba(255,255,255,.08)",
                color: isHot
                  ? "#0a1400"
                  : kindLabel === "IDEA"
                    ? "var(--spark)"
                    : kindLabel === "IMPROVEMENT"
                      ? "#fde047"
                      : "#93c5fd",
              }}
            >
              ● {kindLabel}
            </span>
            {item.kind === "comment" && (
              <a
                data-card-stop
                href={`${APP_URL}${item.route}?thread=${encodeURIComponent(item.id)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 h-5 px-1.5 rounded border border-white/8 bg-white/4 text-[9px] font-mono text-white/65 hover:text-white hover:border-[var(--spark)]/40"
                title={`Open ${item.route} with this thread`}
              >
                <ExternalLink className="h-2.5 w-2.5" />
                {item.route}
              </a>
            )}
            <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded border border-white/8 bg-white/4 text-[9px] font-mono text-white/65">
              <MessageSquare className="h-2.5 w-2.5" />
              {item.replies.length}
            </span>
            {item.kind === "comment" &&
              item.tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center h-5 px-1.5 rounded-full bg-white/6 text-[9px] text-white/70"
                >
                  {t}
                </span>
              ))}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-dashed border-white/6 flex items-center justify-between text-[10px] text-white/55">
            <div className="flex items-center gap-1.5 min-w-0">
              <AuthorAvatar
                name={item.author.name}
                avatarUrl={item.author.avatarUrl}
                size={14}
              />
              <span className="truncate">{item.author.name}</span>
            </div>
            <span className="font-mono text-[9px] text-white/40">
              {shortDate(item.createdAt)}
            </span>
          </div>
        </div>
        {admin && (
          <button
            type="button"
            data-card-stop
            className={cn(
              "h-6 w-5 -mr-1 shrink-0 flex items-center justify-center text-white/40 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity",
              isOverlay && "opacity-100",
            )}
            aria-label="Drag to change status"
            {...(dragHandleProps ?? {})}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </article>
  );
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function ProposalsList({
  items,
  onVote,
  onOpenThread,
}: {
  items: BoardItem[];
  onVote: (id: string, kind: BoardItem["kind"], value: -1 | 0 | 1) => Promise<void>;
  onOpenThread: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-sm text-white/55">
        No proposals match these filters.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-2.5">
      {items.map((p) => (
        <ProposalRow
          key={p.id}
          item={p}
          onVote={(v) => onVote(p.id, p.kind, v)}
          onOpenThread={() => onOpenThread(p.id)}
        />
      ))}
    </div>
  );
}

function ProposalRow({
  item,
  onVote,
  onOpenThread,
}: {
  item: BoardItem;
  onVote: (value: -1 | 0 | 1) => void;
  onOpenThread: () => void;
}) {
  const isHot = item.voteScore >= 30;
  const kindLabel = itemKind(item).toUpperCase();
  const kindFg =
    kindLabel === "IDEA" ? "var(--spark)" : kindLabel === "IMPROVEMENT" ? "#fde047" : "#93c5fd";
  const statusColor =
    item.status === "open"
      ? "#86efac"
      : item.status === "triaged"
        ? "#93c5fd"
        : item.status === "planned"
          ? "#fde047"
          : item.status === "shipped"
            ? "var(--spark)"
            : "rgba(255,255,255,.4)";
  const statusLabel = COLUMNS.find((c) => c.status === item.status)?.label ?? item.status;
  const title = item.kind === "proposal" ? item.title : item.body.split("\n")[0]?.slice(0, 80);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        const t = e.target as HTMLElement | null;
        if (t?.closest("[data-card-stop]")) return;
        onOpenThread();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenThread();
        }
      }}
      className="grid grid-cols-[80px_1fr_auto] gap-6 items-center rounded-2xl border p-5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--spark)]/40 transition-colors hover:bg-white/[0.02]"
      style={{
        background: isHot
          ? "color-mix(in oklch, var(--spark) 8%, #14120e)"
          : "rgba(20,18,14,.6)",
        borderColor: isHot ? "rgba(180,255,57,.25)" : "rgba(255,255,255,.07)",
      }}
    >
      <div
        data-card-stop
        className="text-center border-r border-white/8 pr-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onVote(item.myVote === 1 ? 0 : 1)}
          className={cn(
            "flex items-center justify-center w-full mb-1 hover:text-[var(--spark)]",
            item.myVote === 1 ? "text-[var(--spark)] opacity-100" : "opacity-40",
          )}
          aria-label="Upvote"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <div
          className="font-display text-[36px] leading-none tabular-nums my-0.5"
          style={{ color: isHot ? "var(--spark)" : "var(--paper)" }}
        >
          {item.voteScore}
        </div>
        <button
          type="button"
          onClick={() => onVote(item.myVote === -1 ? 0 : -1)}
          className={cn(
            "flex items-center justify-center w-full mt-1 hover:text-red-400",
            item.myVote === -1 ? "text-red-400 opacity-100" : "opacity-25",
          )}
          aria-label="Downvote"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
          <span
            className="px-2 py-0.5 rounded-full font-mono text-[9px] tracking-[0.1em] font-bold"
            style={{
              background: isHot ? "var(--spark)" : "rgba(255,255,255,.08)",
              color: isHot ? "#0a1400" : kindFg,
            }}
          >
            ● {kindLabel}
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[9px] tracking-[0.1em] font-bold border"
            style={{
              borderColor: statusColor as string,
              color: statusColor as string,
              background: "rgba(255,255,255,.04)",
            }}
          >
            <span
              className="h-1 w-1 rounded-full"
              style={{
                background: statusColor as string,
                boxShadow:
                  item.status === "shipped" ? "0 0 8px var(--spark)" : undefined,
              }}
            />
            {statusLabel.toUpperCase()}
          </span>
          {item.kind === "comment" && (
            <span className="font-mono text-[10px] text-white/50">↗ {item.route}</span>
          )}
          {item.kind === "comment" &&
            item.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/65"
              >
                {t}
              </span>
            ))}
        </div>
        <div className="font-display text-[22px] leading-[1.15] tracking-[-0.01em] mb-1.5 line-clamp-1">
          {title}
        </div>
        <div className="text-[13px] text-white/65 leading-[1.5] line-clamp-2">{item.body}</div>
        <div className="mt-2.5 flex items-center gap-3.5 text-[11px] text-white/55">
          <div className="flex items-center gap-1.5">
            <AuthorAvatar
              name={item.author.name}
              avatarUrl={item.author.avatarUrl}
              size={16}
            />
            <span>{item.author.name}</span>
          </div>
          <span className="text-white/25">·</span>
          <span>{shortDate(item.createdAt)}</span>
          <span className="text-white/25">·</span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {item.replies.length}
            {item.replies.length === 1 ? " reply" : " replies"}
          </span>
        </div>
      </div>
      <div data-card-stop className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onVote(item.myVote === 1 ? 0 : 1);
          }}
          className={cn(
            "h-10 w-10 rounded-full border flex items-center justify-center transition-colors press-scale",
            item.myVote === 1
              ? "bg-[var(--spark)] text-[#0a1400] border-[var(--spark)]"
              : "bg-white/5 text-[var(--paper)] border-white/10 hover:bg-white/8",
          )}
          aria-label="Upvote"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <ChevronRight className="h-4 w-4 text-white/35" />
      </div>
    </div>
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

function HeroStat({
  label,
  value,
  dot,
  glow,
}: {
  label: string;
  value: number;
  dot: string;
  glow?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: dot,
          boxShadow: glow ? `0 0 10px ${dot}` : undefined,
        }}
      />
      <span className="text-xs text-white/75">
        <span
          className="font-display text-lg tabular-nums mr-1"
          style={{ color: glow ? "var(--spark)" : "var(--paper)" }}
        >
          {value}
        </span>
        {label}
      </span>
    </div>
  );
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
    <div className="mb-6 flex items-center gap-9 border-b border-white/6">
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
              "relative inline-flex items-center gap-2 pt-2.5 pb-3.5 text-sm transition-colors",
              active
                ? "text-[var(--paper)] font-semibold"
                : "text-white/45 hover:text-white/80 font-normal",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={cn(
                  "ml-0.5 inline-flex items-center justify-center min-w-[20px] h-[18px] rounded-full px-1.5 font-mono text-[9px] font-semibold tabular-nums",
                  active
                    ? "bg-[var(--spark)] text-[#0a1400]"
                    : "bg-white/8 text-white/55",
                )}
              >
                {t.count}
              </span>
            )}
            {active && (
              <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[var(--spark)]" />
            )}
          </button>
        );
      })}
      <div className="flex-1" />
      <span className="hidden md:inline-block font-mono text-[10px] tracking-[0.12em] uppercase text-white/40 pb-3.5">
        ↻ syncing every 15s
      </span>
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

  const handleSelectContributor = useCallback((id: string) => setOpenUserId(id), []);

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

  const top3 = contributors.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-3.5">
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/50">
            {contributors.length} contributor{contributors.length === 1 ? "" : "s"} this month
          </span>
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--spark)]/70">
            score = activity + votes ÷ 2
          </span>
          {myRank && (
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--spark)]">
              you're #{myRank}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {myIndex >= 0 && (
            <button
              type="button"
              onClick={showMe}
              className="h-8 px-3 rounded-full border border-white/10 bg-white/4 text-[11px] font-medium hover:bg-white/8 inline-flex items-center gap-1.5 press-scale"
            >
              <Trophy className="h-3.5 w-3.5 text-[var(--spark)]" />
              Show me
            </button>
          )}
        </div>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
          {[top3[1], top3[0], top3[2]]
            .filter((c): c is Contributor => Boolean(c))
            .map((c, _i) => {
              const rank = contributors.indexOf(c) + 1;
              const isFirst = rank === 1;
              const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
              const h = isFirst ? 220 : rank === 2 ? 180 : 160;
              return (
                <button
                  key={c.author.id}
                  type="button"
                  onClick={() => handleSelectContributor(c.author.id)}
                  className="relative overflow-hidden p-6 rounded-3xl border text-left transition-transform hover:-translate-y-0.5"
                  style={{
                    height: h,
                    background: isFirst
                      ? "color-mix(in oklch, var(--spark) 18%, #14120e)"
                      : "rgba(20,18,14,.7)",
                    borderColor: isFirst
                      ? "var(--spark)"
                      : "rgba(255,255,255,.08)",
                    boxShadow: isFirst
                      ? "0 24px 60px -20px var(--spark)"
                      : undefined,
                  }}
                >
                  <span className="absolute top-3.5 right-3.5 text-3xl">{medal}</span>
                  <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/60 mb-3.5">
                    #{rank}
                  </div>
                  <div className="flex items-center gap-3 mb-3.5">
                    <span className="block">
                      <AuthorAvatar
                        name={c.author.name}
                        avatarUrl={c.author.avatarUrl}
                        size={42}
                      />
                    </span>
                    <div className="min-w-0">
                      <div className="font-display text-[22px] leading-none tracking-[-0.01em] truncate">
                        {c.author.name}
                      </div>
                      <div className="text-[11px] text-white/55 mt-1">
                        {c.comments} comments · {c.proposals} proposals
                      </div>
                    </div>
                  </div>
                  <div
                    className="absolute left-6 right-6 bottom-5 pt-3 flex items-baseline gap-2"
                    style={{
                      borderTop: `1px ${isFirst ? "solid" : "dashed"} rgba(255,255,255,.10)`,
                    }}
                  >
                    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/55">
                      Score
                    </span>
                    <span
                      className="font-display tabular-nums leading-none"
                      style={{
                        fontSize: isFirst ? 44 : 34,
                        color: isFirst ? "var(--spark)" : "var(--paper)",
                      }}
                    >
                      {c.score}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_90px_90px_90px_110px_30px] items-center gap-3 px-5 py-3 border-b border-white/8 bg-black/30 font-mono text-[10px] tracking-[0.12em] uppercase text-white/55">
          <span>#</span>
          <span>Person</span>
          <span className="text-right">Comments</span>
          <span className="text-right">Proposals</span>
          <span className="text-right">Replies</span>
          <span className="text-right">Score</span>
          <span />
        </div>
        {pageRows.map((c, idx) => (
          <ContributorRow
            key={c.author.id}
            contributor={c}
            rank={start + idx + 1}
            isMe={Boolean(currentUserId && c.author.id === currentUserId)}
            isHighlighted={Boolean(highlightId && c.author.id === highlightId)}
            onSelect={handleSelectContributor}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-8 px-3.5 rounded-full border border-white/10 bg-white/4 text-[11px] disabled:opacity-50 hover:bg-white/8 press-scale"
          >
            Prev
          </button>
          <span className="h-8 inline-flex items-center px-3 text-[11px] text-white/55 tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-8 px-3.5 rounded-full border border-white/10 bg-white/4 text-[11px] disabled:opacity-50 hover:bg-white/8 press-scale"
          >
            Next
          </button>
        </div>
      )}

      <ContributorSheet contributor={openContributor} onClose={() => setOpenUserId(null)} />
    </div>
  );
}

const ContributorRow = memo(function ContributorRow({
  contributor: c,
  rank,
  isMe,
  isHighlighted,
  onSelect,
}: {
  contributor: Contributor;
  rank: number;
  isMe: boolean;
  isHighlighted: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(c.author.id)}
      className={cn(
        "w-full grid grid-cols-[60px_1fr_90px_90px_90px_110px_30px] items-center gap-3 px-5 py-3.5 text-left transition-colors border-b border-white/5 last:border-b-0 hover:bg-white/[0.04]",
        isMe && "bg-[var(--spark)]/[0.04]",
        isHighlighted && "ring-2 ring-[var(--spark)]/50 ring-inset bg-[var(--spark)]/[0.07]",
      )}
    >
      <span className="font-mono text-[13px]">
        {rank === 1 ? (
          <span className="text-lg">🥇</span>
        ) : rank === 2 ? (
          <span className="text-lg">🥈</span>
        ) : rank === 3 ? (
          <span className="text-lg">🥉</span>
        ) : (
          <span className="text-white/45">#{rank}</span>
        )}
      </span>
      <span className="flex items-center gap-2.5 min-w-0">
        <AuthorAvatar
          name={c.author.name}
          avatarUrl={c.author.avatarUrl}
          size={30}
        />
        <span className="min-w-0">
          <div className={cn("text-sm leading-tight truncate", isMe && "font-semibold")}>
            {c.author.name}
            {isMe && (
              <span className="ml-1.5 text-[10px] font-normal text-[var(--spark)]">(you)</span>
            )}
          </div>
          <div className="text-[10px] text-white/45 mt-0.5">{initialsFor(c.author.name)}</div>
        </span>
      </span>
      <span className="text-right font-display text-lg tabular-nums text-white/85">
        {c.comments}
      </span>
      <span className="text-right font-display text-lg tabular-nums text-white/85">
        {c.proposals}
      </span>
      <span className="text-right font-display text-lg tabular-nums text-white/85">
        {c.replies}
      </span>
      <span
        className="text-right font-display text-2xl tabular-nums leading-none"
        style={{ color: rank === 1 ? "var(--spark)" : "var(--paper)" }}
      >
        {c.score}
      </span>
      <ChevronRight className="h-4 w-4 text-white/35" />
    </button>
  );
});

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
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-[var(--spark)]/10 text-[var(--spark)] flex items-center justify-center mb-4">
        <MessageSquare className="h-5 w-5" />
      </div>
      <h2 className="font-display text-2xl tracking-[-0.02em]">
        Nothing on the wall <span className="italic text-[var(--spark)]">yet</span>.
      </h2>
      <p className="text-sm text-white/55 mt-2 max-w-sm mx-auto">
        Drop a comment pin anywhere in Pulse, or post a proposal — bug, idea, improvement.
      </p>
      <div className="mt-6 flex items-center justify-center gap-2.5">
        <button
          onClick={onPropose}
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-[var(--spark)] text-[#0a1400] text-[13px] font-bold press-scale"
          style={{ boxShadow: "0 12px 28px -10px var(--spark)" }}
        >
          <Plus className="h-4 w-4" />
          New proposal
        </button>
        <button
          onClick={() => navigate({ to: "/welcome" })}
          className="inline-flex h-10 px-4 rounded-full border border-white/15 bg-transparent text-[13px] hover:bg-white/5 press-scale"
        >
          Take the tour
        </button>
      </div>
    </div>
  );
}
