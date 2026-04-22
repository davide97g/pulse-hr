import { useEffect, useRef, useState } from "react";
import { Plus, Camera, Type, Send, Hash } from "lucide-react";
import { useCommentsOverlay } from "./CommentsOverlayProvider";
import { TagInput } from "./TagInput";
import { cn } from "@/lib/utils";

const COMPOSER_W = 360;
const COMPOSER_H = 160;

export function NewCommentComposer({
  x,
  y,
  onDismiss,
}: {
  x: number;
  y: number;
  onDismiss: () => void;
}) {
  const { submitNew, author, pendingScreenshotUrl, screenshotStatus } = useCommentsOverlay();
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showTags, setShowTags] = useState(false);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onDismiss();
      }
    };
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (wrapRef.current.contains(e.target as Node)) return;
      onDismiss();
    };
    window.addEventListener("keydown", onKey);
    // defer one tick so the initial click that placed us isn't caught here
    const t = window.setTimeout(() => {
      window.addEventListener("mousedown", onDocClick);
    }, 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDocClick);
      window.clearTimeout(t);
    };
  }, [onDismiss]);

  const left = Math.min(Math.max(8, x + 12), window.innerWidth - COMPOSER_W - 8);
  const top = Math.min(Math.max(8, y + 12), window.innerHeight - COMPOSER_H - 8);

  const submit = async () => {
    if (!body.trim() || pending) return;
    setPending(true);
    try {
      await submitNew(body, { x, y }, tags);
    } finally {
      setPending(false);
    }
  };

  const canSubmit = body.trim().length > 0 && !pending && !!author;

  return (
    <div
      ref={wrapRef}
      onClick={(e) => e.stopPropagation()}
      style={{ left, top, width: COMPOSER_W }}
      className={cn(
        "absolute pointer-events-auto pop-in rounded-[var(--radius-lg)] border bg-background",
        "shadow-[0_16px_48px_rgba(0,0,0,0.18)]",
      )}
    >
      {pendingScreenshotUrl && (
        <div className="px-3 pt-3">
          <div className="relative rounded-md overflow-hidden border bg-muted/40">
            <img
              src={pendingScreenshotUrl}
              alt="Snapshot"
              className="w-full h-24 object-cover object-top"
            />
            <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 h-5 px-1.5 rounded-full bg-black/60 text-white text-[10px]">
              <Camera className="h-2.5 w-2.5" /> snapshot
            </span>
          </div>
        </div>
      )}
      {screenshotStatus === "capturing" && !pendingScreenshotUrl && (
        <div className="px-3 pt-3">
          <div className="h-24 rounded-md bg-muted/40 border flex items-center justify-center text-[11px] text-muted-foreground">
            Capturing snapshot…
          </div>
        </div>
      )}
      <div className="px-3 pt-3">
        <input
          ref={inputRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Leave a comment…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {(showTags || tags.length > 0) && (
        <div className="px-3 pb-1 pt-1">
          <TagInput tags={tags} onChange={setTags} placeholder="tag (bug, idea…)" />
        </div>
      )}
      <div className="flex items-center justify-between px-2 pb-2 pt-2">
        <div className="flex items-center gap-1 text-muted-foreground">
          <IconButton disabled title="Attach (coming soon)">
            <Plus className="h-4 w-4" />
          </IconButton>
          <IconButton disabled title="Screenshot (coming soon)">
            <Camera className="h-4 w-4" />
          </IconButton>
          <span className="mx-0.5 h-4 w-px bg-border" />
          <IconButton
            onClick={() => setShowTags((s) => (!s || tags.length === 0 ? !s : s))}
            title={showTags ? "Hide tags" : "Add tags"}
            active={showTags || tags.length > 0}
          >
            <Hash className="h-4 w-4" />
          </IconButton>
          <IconButton disabled title="Formatting (coming soon)">
            <Type className="h-4 w-4" />
          </IconButton>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-white transition-opacity",
            "bg-primary hover:bg-primary/90",
            !canSubmit && "opacity-40 cursor-not-allowed",
          )}
          aria-label="Post comment"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function IconButton({
  children,
  disabled,
  title,
  onClick,
  active,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={cn(
        "h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
        active && "bg-primary/10 text-primary",
      )}
    >
      {children}
    </button>
  );
}
