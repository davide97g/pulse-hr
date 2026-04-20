import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function VoteButtons({
  score,
  myVote,
  onChange,
}: {
  score: number;
  myVote: -1 | 0 | 1;
  onChange: (value: -1 | 0 | 1) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border bg-background">
      <button
        type="button"
        onClick={() => onChange(myVote === 1 ? 0 : 1)}
        className={cn(
          "h-7 w-7 flex items-center justify-center hover:bg-muted rounded-l-md",
          myVote === 1 && "text-primary",
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <span className="px-1.5 text-xs font-medium tabular-nums min-w-[24px] text-center">
        {score}
      </span>
      <button
        type="button"
        onClick={() => onChange(myVote === -1 ? 0 : -1)}
        className={cn(
          "h-7 w-7 flex items-center justify-center hover:bg-muted rounded-r-md",
          myVote === -1 && "text-destructive",
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
