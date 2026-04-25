import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Monitor,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createReply,
  fetchBoard,
  setTokenGetter,
  setVote,
  type BoardItem,
} from "@/lib/comments/api";
import type { Reply } from "@/lib/comments/types";
import {
  createProposalReply,
  setProposalVote,
} from "@/lib/proposals/api";
import type { ProposalReply } from "@/lib/proposals/types";
import {
  AuthorAvatar,
  KindBadge,
  StatusBadge,
  itemKind,
  relativeTime,
} from "./shared";
import { useCompanyProfileStore } from "@/components/app/CompanyProfileStore";

export function ContributionDetail({
  kind,
  id,
}: {
  kind: "comment" | "proposal";
  id: string;
}) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<BoardItem | null>(null);
  const [state, setState] = useState<"loading" | "loaded" | "not-found">("loading");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const repliesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTokenGetter(() => getToken());
    return () => setTokenGetter(null);
  }, [getToken]);

  const refresh = useMemo(
    () =>
      async (opts: { silent?: boolean } = {}) => {
        if (!user) return;
        try {
          const board = await fetchBoard();
          const all: BoardItem[] = [
            ...board.open,
            ...board.triaged,
            ...board.planned,
            ...board.shipped,
            ...board.wont_do,
          ];
          const found = all.find((x) => x.id === id && x.kind === kind);
          if (found) {
            setItem(found);
            setState("loaded");
          } else if (!opts.silent) {
            setState("not-found");
          }
        } catch {
          if (!opts.silent) setState("not-found");
        }
      },
    [id, kind, user],
  );

  useEffect(() => {
    setState("loading");
    setItem(null);
    refresh();
    const t = window.setInterval(() => refresh({ silent: true }), 15_000);
    return () => window.clearInterval(t);
  }, [refresh]);

  const { adjustPower } = useCompanyProfileStore();

  const onVote = async (value: -1 | 0 | 1) => {
    if (!item) return;
    const prev = item;
    const delta = value - item.myVote;
    setItem({ ...item, myVote: value, voteScore: item.voteScore + delta });

    let powerDelta = 0;
    if (item.myVote === 0 && value !== 0) powerDelta = -1;
    else if (item.myVote !== 0 && value === 0) powerDelta = +1;
    if (powerDelta !== 0) adjustPower(powerDelta);

    try {
      const { voteScore, myVote } =
        item.kind === "proposal"
          ? await setProposalVote(item.id, value)
          : await setVote(item.id, value);
      setItem((curr) => (curr ? { ...curr, voteScore, myVote } : curr));
    } catch (err) {
      setItem(prev);
      if (powerDelta !== 0) adjustPower(-powerDelta);
      const code = (err as { code?: string } | null)?.code;
      if (code === "insufficient_power") {
        toast.error("You're out of voting power. Refills weekly to 10.");
      } else {
        toast.error("Vote failed.");
      }
    }
  };

  const onSend = async () => {
    if (!item) return;
    const body = reply.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const created: Reply | ProposalReply =
        item.kind === "proposal"
          ? await createProposalReply(item.id, body)
          : await createReply(item.id, body);
      setItem((curr) =>
        curr
          ? ({
              ...curr,
              replies: [...curr.replies, created],
              updatedAt: created.createdAt,
            } as BoardItem)
          : curr,
      );
      setReply("");
      window.setTimeout(
        () => repliesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        40,
      );
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setSending(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="p-4 md:p-6 max-w-[880px] mx-auto w-full">
        <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
        <div className="h-40 bg-muted/50 rounded-[var(--radius-md)] animate-pulse" />
      </div>
    );
  }

  if (state === "not-found" || !item) {
    return (
      <div className="p-4 md:p-6 max-w-[880px] mx-auto w-full">
        <button
          onClick={() => navigate({ to: "/feedback" })}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to feedback
        </button>
        <div className="rounded-[var(--radius-md)] border border-dashed bg-background/50 p-10 text-center">
          <h1 className="font-display text-lg">This {kind} is gone</h1>
          <p className="text-sm text-muted-foreground mt-1">
            It may have been deleted, or the URL is wrong.
          </p>
        </div>
      </div>
    );
  }

  const kindValue = itemKind(item);
  const isProposal = item.kind === "proposal";
  const pageMeta = item.kind === "comment" ? item.pageMeta : null;

  return (
    <div className="p-4 md:p-6 max-w-[880px] mx-auto w-full">
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <Link
          to="/feedback"
          search={isProposal ? { tab: "proposals" } : {}}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to feedback
        </Link>
        <div className="flex items-center gap-2">
          <KindBadge kind={kindValue} size="md" />
          <StatusBadge status={item.status as BoardItem["status"]} />
        </div>
      </div>

      <article className="rounded-[var(--radius-lg)] border bg-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
            <button
              type="button"
              onClick={() => onVote(item.myVote === 1 ? 0 : 1)}
              className={cn(
                "h-9 w-9 rounded-md hover:bg-muted flex items-center justify-center border bg-background transition-colors",
                item.myVote === 1 && "text-primary border-primary/40",
              )}
              aria-label="Upvote"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold tabular-nums">{item.voteScore}</span>
            <button
              type="button"
              onClick={() => onVote(item.myVote === -1 ? 0 : -1)}
              className={cn(
                "h-9 w-9 rounded-md hover:bg-muted flex items-center justify-center border bg-background transition-colors",
                item.myVote === -1 && "text-destructive border-destructive/40",
              )}
              aria-label="Downvote"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            {isProposal && (
              <h1 className="font-display text-2xl tracking-tight break-words mb-1">
                {item.title}
              </h1>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <AuthorAvatar name={item.author.name} avatarUrl={item.author.avatarUrl} size={20} />
              <span className="font-medium text-foreground">{item.author.name}</span>
              <span aria-hidden>·</span>
              <span title={new Date(item.createdAt).toLocaleString()}>
                {relativeTime(item.createdAt)}
              </span>
              {item.updatedAt !== item.createdAt && (
                <>
                  <span aria-hidden>·</span>
                  <span title={new Date(item.updatedAt).toLocaleString()}>
                    edited {relativeTime(item.updatedAt)}
                  </span>
                </>
              )}
            </div>
            {item.kind === "comment" && item.screenshotUrl && (
              <a
                href={item.screenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="block mb-3 rounded-[var(--radius-md)] border overflow-hidden hover:border-primary/50 transition-colors"
              >
                <img
                  src={item.screenshotUrl}
                  alt="Screenshot attached to the comment"
                  className="w-full max-h-[360px] object-cover object-top"
                />
              </a>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{item.body}</p>

            {item.kind === "comment" && item.tags.length > 0 && (
              <div className="mt-3 flex items-center flex-wrap gap-1">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center h-5 px-1.5 rounded-full bg-muted text-[11px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>

      <section className="mt-4 rounded-[var(--radius-md)] border bg-background p-4">
        <h2 className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground mb-2">
          Metadata
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <MetaRow label="Kind">{kindValue}</MetaRow>
          <MetaRow label="Status">{item.status}</MetaRow>
          <MetaRow label="Created">
            {new Date(item.createdAt).toLocaleString()}
          </MetaRow>
          <MetaRow label="Updated">
            {new Date(item.updatedAt).toLocaleString()}
          </MetaRow>
          <MetaRow label="Replies">{item.replies.length}</MetaRow>
          <MetaRow label="Net upvotes">{item.voteScore}</MetaRow>
          {item.kind === "comment" && (
            <>
              <MetaRow label="Route">
                <Link
                  to={item.route}
                  search={{ thread: item.id }}
                  className="inline-flex items-center gap-1 font-mono text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {item.route}
                </Link>
              </MetaRow>
              {pageMeta?.appVersion && (
                <MetaRow label="App version">
                  <span className="font-mono">v{pageMeta.appVersion}</span>
                </MetaRow>
              )}
              {pageMeta?.viewportW && pageMeta?.viewportH && (
                <MetaRow label="Captured viewport">
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Monitor className="h-3 w-3" />
                    {pageMeta.viewportW}×{pageMeta.viewportH}
                  </span>
                </MetaRow>
              )}
              {pageMeta?.title && <MetaRow label="Page title">{pageMeta.title}</MetaRow>}
            </>
          )}
        </dl>
      </section>

      <section className="mt-4 rounded-[var(--radius-md)] border bg-background">
        <h2 className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground px-4 pt-3 pb-2">
          Thread · {item.replies.length}
        </h2>
        <div className="px-4 pb-3 space-y-3">
          {item.replies.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No replies yet. Be the first to respond.
            </p>
          ) : (
            item.replies.map((r) => (
              <div key={r.id} className="flex gap-3 fade-in">
                <AuthorAvatar name={r.author.name} avatarUrl={r.author.avatarUrl} size={28} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-medium">{r.author.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {relativeTime(r.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mt-0.5">
                    {r.body}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={repliesEndRef} />
        </div>
        <div className="border-t px-3 py-3 flex items-start gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Reply…"
            rows={2}
            className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!reply.trim() || sending}
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm inline-flex items-center gap-1.5 disabled:opacity-50 press-scale"
          >
            <Send className="h-3.5 w-3.5" />
            {sending ? "Sending…" : "Reply"}
          </button>
        </div>
      </section>
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 break-words">{children}</dd>
    </div>
  );
}
