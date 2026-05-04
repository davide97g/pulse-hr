import type { LogTopic } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const LOG_TOPIC_CHIPS: { topic: LogTopic; emoji: string; label: string }[] = [
  { topic: "status", emoji: "🎯", label: "Status" },
  { topic: "win", emoji: "🎉", label: "Win" },
  { topic: "pain", emoji: "⚠️", label: "Pain" },
  { topic: "challenge", emoji: "🧗", label: "Challenge" },
  { topic: "feedback", emoji: "💬", label: "Feedback" },
];

export function topicChipMeta(topic: LogTopic): { emoji: string; label: string } {
  const row = LOG_TOPIC_CHIPS.find((c) => c.topic === topic);
  return row ?? { emoji: "✨", label: topic === "freeform" ? "Note" : topic };
}

export function QuickTopicChips({
  onPick,
  preferredTopics,
  activeTopic,
  selectedTopic,
  counts,
}: {
  onPick: (topic: LogTopic) => void;
  preferredTopics?: LogTopic[];
  /** Current room / tab (structured log UI). */
  activeTopic?: LogTopic;
  /** Highlights the chip matching the composer’s pending topic (chat flow). */
  selectedTopic?: LogTopic;
  counts?: Partial<Record<LogTopic, number>>;
}) {
  const set = preferredTopics && preferredTopics.length > 0 ? new Set(preferredTopics) : null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {LOG_TOPIC_CHIPS.map((c) => {
        const dim = set && !set.has(c.topic);
        const highlighted =
          (activeTopic !== undefined && activeTopic === c.topic) ||
          (selectedTopic !== undefined && selectedTopic === c.topic);
        return (
          <button
            key={c.topic}
            type="button"
            onClick={() => onPick(c.topic)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border bg-background px-2.5 h-8 text-xs press-scale transition",
              "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40",
              highlighted &&
                "border-primary/50 bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30",
              dim && "opacity-50",
            )}
            aria-pressed={highlighted}
          >
            <span>{c.emoji}</span>
            <span>{c.label}</span>
            {counts?.[c.topic] ? (
              <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {counts[c.topic]}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
