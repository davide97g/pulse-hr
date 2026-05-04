import type { LogTopic } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const CHIPS: { topic: LogTopic; emoji: string; label: string }[] = [
  { topic: "status", emoji: "🎯", label: "Status" },
  { topic: "win", emoji: "🎉", label: "Win" },
  { topic: "pain", emoji: "⚠️", label: "Pain" },
  { topic: "challenge", emoji: "🧗", label: "Challenge" },
  { topic: "feedback", emoji: "💬", label: "Feedback" },
];

export function QuickTopicChips({
  onPick,
  preferredTopics,
  activeTopic,
  counts,
}: {
  onPick: (topic: LogTopic) => void;
  preferredTopics?: LogTopic[];
  activeTopic?: LogTopic;
  counts?: Partial<Record<LogTopic, number>>;
}) {
  const set = preferredTopics && preferredTopics.length > 0 ? new Set(preferredTopics) : null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {CHIPS.map((c) => {
        const dim = set && !set.has(c.topic);
        const active = activeTopic === c.topic;
        return (
          <button
            key={c.topic}
            type="button"
            onClick={() => onPick(c.topic)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border bg-background px-2.5 h-8 text-xs press-scale transition",
              "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40",
              active && "border-primary/50 bg-primary/10 text-primary shadow-sm",
              dim && "opacity-50",
            )}
            aria-pressed={active}
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
