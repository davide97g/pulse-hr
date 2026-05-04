import { Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import type { PlanDoc } from "@/lib/mock-data";

let idCounter = 0;
function genId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

export function PlanDocsEditor({
  planId,
  docs,
  onChange,
}: {
  planId: string;
  docs: PlanDoc[];
  onChange: (next: PlanDoc[]) => void;
}) {
  const update = (id: string, patch: Partial<PlanDoc>) =>
    onChange(docs.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const remove = (id: string) => onChange(docs.filter((d) => d.id !== id));
  const add = () =>
    onChange([...docs, { id: genId(`${planId}-d`), label: "", url: "" }]);

  return (
    <div className="grid gap-2">
      {docs.length === 0 ? (
        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground text-center">
          No documents. Add reference links (specs, runbooks, briefs).
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((d) => (
            <div
              key={d.id}
              className="rounded-md border p-2 grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-center"
            >
              <Input
                value={d.label}
                onChange={(e) => update(d.id, { label: e.target.value })}
                placeholder="Label (Runbook, Brief…)"
              />
              <div className="relative">
                <LinkIcon className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-7"
                  value={d.url}
                  onChange={(e) => update(d.id, { url: e.target.value })}
                  placeholder="https://docs.test/…"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => remove(d.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <Button type="button" size="sm" variant="outline" onClick={add} className="w-fit">
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add doc link
      </Button>
    </div>
  );
}
