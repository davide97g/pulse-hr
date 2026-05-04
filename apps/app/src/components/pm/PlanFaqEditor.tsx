import { Plus, Trash2 } from "lucide-react";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Textarea } from "@pulse-hr/ui/primitives/textarea";
import type { PlanFaqEntry } from "@/lib/mock-data";

let idCounter = 0;
function genId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

export function PlanFaqEditor({
  planId,
  faq,
  onChange,
}: {
  planId: string;
  faq: PlanFaqEntry[];
  onChange: (next: PlanFaqEntry[]) => void;
}) {
  const update = (id: string, patch: Partial<PlanFaqEntry>) =>
    onChange(faq.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const remove = (id: string) => onChange(faq.filter((f) => f.id !== id));
  const add = () =>
    onChange([...faq, { id: genId(`${planId}-f`), question: "", answer: "" }]);

  return (
    <div className="grid gap-2">
      {faq.length === 0 ? (
        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground text-center">
          No FAQ entries. Capture decisions, gotchas, and frequent questions here.
        </div>
      ) : (
        <div className="space-y-2">
          {faq.map((f) => (
            <div key={f.id} className="rounded-md border p-3 grid gap-2">
              <div className="flex items-start justify-between gap-2">
                <Input
                  value={f.question}
                  onChange={(e) => update(f.id, { question: e.target.value })}
                  placeholder="Question"
                  className="font-medium"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive shrink-0"
                  onClick={() => remove(f.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Textarea
                rows={2}
                value={f.answer}
                onChange={(e) => update(f.id, { answer: e.target.value })}
                placeholder="Answer"
              />
            </div>
          ))}
        </div>
      )}
      <Button type="button" size="sm" variant="outline" onClick={add} className="w-fit">
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add FAQ entry
      </Button>
    </div>
  );
}
