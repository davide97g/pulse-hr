import type { LogTopic } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const CHIPS: { topic: LogTopic; emoji: string; label: string }[] = [
  { topic: "status", emoji: "🎯", label: "Status" },
  { topic: "win", emoji: "🎉", label: "Win" },
  { topic: "pain", emoji: "⚠️", label: "Pain" },
  { topic: "challenge", emoji: "🧗", label: "Challenge" },
  { topic: "feedback", emoji: "💬", label: "Feedback" },
];

export function QuickTopicChips({ onPick }: { onPick: (topic: LogTopic) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 px-4 md:px-6 pb-2">
      {CHIPS.map((c) => (
        <button
          key={c.topic}
          onClick={() => onPick(c.topic)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border bg-background px-2.5 h-7 text-xs press-scale",
            "hover:bg-muted",
          )}
        >
          <span>{c.emoji}</span>
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  );
}
