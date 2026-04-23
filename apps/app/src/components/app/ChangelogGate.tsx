import { Button } from "@pulse-hr/ui/primitives/button";
import { apiFetch } from "@/lib/api-client";
import type { Tour } from "@/lib/tours";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTour } from "./TourProvider";

type Release = {
  version: string;
  date: string;
  title: string;
  bodyMarkdown: string;
  tour: Tour | null;
};

const STORAGE_KEY = "pulse.lastSeenVersion";

/**
 * On first mount, compares the latest release version to the one the user has
 * already seen. If newer, shows a corner "What's new" card. Also consumes a
 * `?tour=<id>` query param (emitted from release emails) to auto-start a tour.
 *
 * Rendering is intentionally done via a tiny hand-rolled markdown-ish
 * renderer so we avoid injecting HTML. CHANGELOG is trusted (repo-committed)
 * but content-as-React keeps the XSS surface at zero.
 */
export function ChangelogGate() {
  const { isSignedIn } = useAuth();
  const { startAdHoc } = useTour();
  const location = useLocation();
  const navigate = useNavigate();
  const [release, setRelease] = useState<Release | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const fetchedRef = useRef(false);
  const tourLaunchedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const res = await apiFetch("/changelog/latest");
        if (!res.ok) return;
        const body = (await res.json()) as { release: Release | null };
        if (!body.release) return;
        const last = localStorage.getItem(STORAGE_KEY);
        if (last === body.release.version) return;
        setRelease(body.release);
      } catch {
        /* silent */
      }
    })();
  }, [isSignedIn]);

  useEffect(() => {
    if (tourLaunchedRef.current) return;
    // TanStack Router parses `location.search` into an object; for a simple
    // `?tour=<id>` lookup we read from it directly.
    const raw = location.search as Record<string, unknown>;
    const tourId = typeof raw?.tour === "string" ? (raw.tour as string) : null;
    if (!tourId) return;
    if (!release?.tour || release.tour.id !== tourId) return;
    tourLaunchedRef.current = true;
    startAdHoc(release.tour);
    markSeen(release.version);
    setRelease(null);
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (k !== "tour" && typeof v === "string") clean[k] = v;
    }
    navigate({ to: location.pathname, search: clean, replace: true });
  }, [location, release, startAdHoc, navigate]);

  const blocks = useMemo(() => (release ? renderMarkdown(release.bodyMarkdown) : []), [release]);

  if (!release || dismissed) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[90] w-[min(92vw,400px)] rounded-xl border bg-popover top-4 h-fit",
        "shadow-pop text-popover-foreground pop-in iridescent-border",
      )}
      role="dialog"
      aria-labelledby="changelog-gate-title"
    >
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-1">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <div className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
            What's new · v{release.version}
          </div>
        </div>
        <button
          onClick={() => {
            markSeen(release.version);
            setDismissed(true);
          }}
          className="h-6 w-6 -mr-1 -mt-0.5 inline-flex items-center justify-center rounded hover:bg-muted text-muted-foreground"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="px-4 pb-3">
        <div id="changelog-gate-title" className="font-semibold text-[15px] leading-tight">
          {release.title}
        </div>
        <div className="mt-2 text-sm text-muted-foreground leading-relaxed max-h-[calc(100vh-20rem)] overflow-y-auto scrollbar-thin space-y-2">
          {blocks}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-3 pb-3 pt-1 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            markSeen(release.version);
            setDismissed(true);
          }}
          className="h-8 px-3 text-xs"
        >
          Dismiss
        </Button>
        {release.tour ? (
          <Button
            size="sm"
            onClick={() => {
              if (!release.tour) return;
              startAdHoc(release.tour);
              markSeen(release.version);
              setDismissed(true);
            }}
            className="h-8 px-3 text-xs"
          >
            Take the tour
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function markSeen(version: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, version);
  } catch {
    /* ignore */
  }
}

/**
 * Minimal markdown renderer: paragraphs and `-` / `*` bulleted lists. Bold
 * via `**x**`. Enough for the CHANGELOG.md format we emit, and keeps the
 * component free of `dangerouslySetInnerHTML`.
 */
function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: React.ReactNode[] = [];
  let buf: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (buf.length === 0) return;
    const text = buf.join(" ").trim();
    if (text) out.push(<p key={out.length}>{renderInline(text)}</p>);
    buf = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    out.push(
      <ul key={out.length} className="list-disc pl-5 space-y-0.5">
        {list.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      flushParagraph();
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }
    flushList();
    buf.push(line);
  }
  flushList();
  flushParagraph();
  return out;
}

function renderInline(text: string): React.ReactNode {
  // Very small inline renderer: **bold**. Everything else literal.
  const parts: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const next = text.indexOf("**", i);
    if (next === -1) {
      parts.push(text.slice(i));
      break;
    }
    if (next > i) parts.push(text.slice(i, next));
    const close = text.indexOf("**", next + 2);
    if (close === -1) {
      parts.push(text.slice(next));
      break;
    }
    parts.push(<strong key={key++}>{text.slice(next + 2, close)}</strong>);
    i = close + 2;
  }
  return parts;
}
