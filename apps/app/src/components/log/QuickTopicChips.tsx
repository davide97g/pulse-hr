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
  selectedTopic,
}: {
  onPick: (topic: LogTopic) => void;
  preferredTopics?: LogTopic[];
  /** Highlights the chip matching the composer’s pending topic. */
  selectedTopic?: LogTopic;
}) {
  const set = preferredTopics && preferredTopics.length > 0 ? new Set(preferredTopics) : null;
  return (
    <div className="flex flex-wrap gap-1.5 px-4 md:px-6 pb-2">
      {LOG_TOPIC_CHIPS.map((c) => {
        const dim = set && !set.has(c.topic);
        const selected = selectedTopic === c.topic;
        return (
          <button
            key={c.topic}
            type="button"
            onClick={() => onPick(c.topic)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border bg-background px-2.5 h-7 text-xs press-scale",
              "hover:bg-muted",
              dim && "opacity-50",
              selected && "border-primary bg-primary/10 text-primary ring-1 ring-primary/30",
            )}
          >
            <span>{c.emoji}</span>
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
