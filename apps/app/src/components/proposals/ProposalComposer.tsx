import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lightbulb, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pulse-hr/ui/primitives/dialog";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Textarea } from "@pulse-hr/ui/primitives/textarea";
import { cn } from "@/lib/utils";
import { createProposal } from "@/lib/proposals/api";
import type { ProposalType } from "@/lib/proposals/types";

const TYPES: { value: ProposalType; label: string; icon: typeof Lightbulb; accent: string }[] = [
  { value: "improvement", label: "Improvement", icon: Sparkles, accent: "text-warning" },
  { value: "idea", label: "Idea", icon: Lightbulb, accent: "text-primary" },
];

export function ProposalComposer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<ProposalType>("improvement");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setBody("");
      setType("improvement");
      setPending(false);
    }
  }, [open]);

  const canSubmit = title.trim().length > 0 && body.trim().length > 0 && !pending;

  const submit = async () => {
    if (!canSubmit) return;
    setPending(true);
    try {
      await createProposal({ title: title.trim(), body: body.trim(), type });
      toast.success("Proposal posted", {
        description: "Find it on the Feedback board.",
      });
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to post proposal";
      toast.error(message);
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            void submit();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>New proposal</DialogTitle>
          <DialogDescription>
            Suggest an improvement to the current product, or share an idea for something new.
            Posts to the feedback board with upvotes and replies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type">
            {TYPES.map((t) => {
              const active = type === t.value;
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setType(t.value)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 h-10 rounded-md border text-sm transition-colors press-scale",
                    active
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? t.accent : "text-muted-foreground")} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="proposal-title" className="text-xs font-medium text-muted-foreground">
              Title
            </label>
            <Input
              id="proposal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="One-line summary…"
              maxLength={140}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="proposal-body" className="text-xs font-medium text-muted-foreground">
              Description
            </label>
            <Textarea
              id="proposal-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What happened, what you expected, or what you'd like to see…"
              rows={5}
              maxLength={4000}
            />
            <div className="text-[11px] text-muted-foreground text-right tabular-nums">
              {body.length} / 4000
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <span className="mr-auto text-[11px] text-muted-foreground hidden sm:inline">
            <kbd className="inline-flex h-5 px-1.5 items-center rounded border bg-muted text-[10px] font-mono">
              ⌘↵
            </kbd>{" "}
            to submit
          </span>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {pending ? "Posting…" : "Post proposal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
