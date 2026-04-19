import { Pin } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { ManagerAsk } from "@/lib/mock-data";

export function PinnedAskCard({
  ask,
  onAnswer,
  onLater,
}: {
  ask: ManagerAsk;
  onAnswer: (ask: ManagerAsk) => void;
  onLater: (ask: ManagerAsk) => void;
}) {
  return (
    <div className="iridescent-border rounded-xl my-3">
      <div className="rounded-[calc(0.75rem-1px)] bg-card p-4 space-y-2">
        <div className="flex items-start gap-2">
          <Pin className="h-4 w-4 mt-0.5 text-primary" />
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Manager ask</div>
            <div className="font-medium">{ask.topic}</div>
            <p className="text-sm text-muted-foreground mt-1">{ask.prompt}</p>
            {ask.dueAt && (
              <div className="text-[11px] text-muted-foreground mt-1">
                Due {format(new Date(ask.dueAt), "EEE, MMM d")}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" onClick={() => onAnswer(ask)}>
            Answer now
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onLater(ask)}>
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}
