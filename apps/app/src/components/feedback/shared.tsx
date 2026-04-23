import { Lightbulb, MessageCircle, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BoardItem } from "@/lib/comments/api";
import type { CommentStatus } from "@/lib/comments/types";

export type BoardItemKind = "comment" | "idea" | "improvement";

export function itemKind(item: BoardItem): BoardItemKind {
  return item.kind === "comment" ? "comment" : item.type;
}

export const KIND_META: Record<
  BoardItemKind,
  { label: string; plural: string; icon: LucideIcon; cls: string }
> = {
  comment: {
    label: "COMMENT",
    plural: "Comments",
    icon: MessageCircle,
    cls: "bg-info/10 text-info border-info/30",
  },
  idea: {
    label: "IDEA",
    plural: "Ideas",
    icon: Lightbulb,
    cls: "bg-primary/10 text-primary border-primary/30",
  },
  improvement: {
    label: "IMPROVEMENT",
    plural: "Improvements",
    icon: Sparkles,
    cls: "bg-warning/15 text-warning border-warning/30",
  },
};

export function KindBadge({
  kind,
  size = "sm",
}: {
  kind: BoardItemKind;
  size?: "sm" | "md";
}) {
  const meta = KIND_META[kind];
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

export const STATUS_META: Record<
  CommentStatus,
  { label: string; cls: string; dot: string }
> = {
  open: { label: "Open", cls: "bg-primary/10 text-primary", dot: "bg-primary" },
  triaged: { label: "Triaged", cls: "bg-info/10 text-info", dot: "bg-info" },
  planned: { label: "Planned", cls: "bg-warning/15 text-warning", dot: "bg-warning" },
  shipped: { label: "Shipped", cls: "bg-success/15 text-success", dot: "bg-success" },
  wont_do: {
    label: "Won't do",
    cls: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export function StatusBadge({ status }: { status: CommentStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2 rounded-full text-[11px] font-medium",
        meta.cls,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const now = Date.now();
  const diff = Math.max(0, Math.round((now - then) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.round(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function initialsFor(name: string): string {
  return (
    name
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export function AuthorAvatar({
  name,
  avatarUrl,
  size = 24,
}: {
  name: string;
  avatarUrl: string | null;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  const fontSize = Math.max(9, Math.round(size * 0.35));
  return (
    <span
      className="rounded-full font-semibold flex items-center justify-center text-white shrink-0 bg-gradient-to-br from-[#8b5cf6] via-[#ec4899] to-[#f59e0b]"
      style={{ width: size, height: size, fontSize }}
    >
      {initialsFor(name)}
    </span>
  );
}
