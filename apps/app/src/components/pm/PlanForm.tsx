import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@pulse-hr/ui/primitives/dialog";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Label } from "@pulse-hr/ui/primitives/label";
import { Textarea } from "@pulse-hr/ui/primitives/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import type { Plan, PlanStatus, Commessa } from "@/lib/mock-data";

const STATUSES: PlanStatus[] = ["draft", "active", "on_hold", "done"];

function blankPlan(project: Commessa): Plan {
  return {
    id: `pl${Date.now()}`,
    projectId: project.id,
    name: "",
    description: "",
    startDate: project.startDate,
    endDate: project.endDate,
    status: "draft",
    team: [],
    contacts: project.referenceContactId
      ? [
          {
            id: `${project.id}-c${Date.now()}`,
            kind: "client",
            clientContactId: project.referenceContactId,
          },
        ]
      : [],
    docs: [],
    faq: [],
    createdAt: new Date().toISOString().slice(0, 10),
    order: 999,
  };
}

export function PlanForm({
  open,
  onClose,
  onSave,
  initial,
  project,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (p: Plan) => void;
  initial: Plan | null;
  project: Commessa;
}) {
  const isEdit = !!initial;
  const [draft, setDraft] = useState<Plan>(() => initial ?? blankPlan(project));

  useEffect(() => {
    if (open) setDraft(initial ?? blankPlan(project));
  }, [open, initial, project]);

  const set = <K extends keyof Plan>(k: K, v: Plan[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit plan" : "New plan"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Phase 1 — Discovery"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Goals, scope, intended outcome…"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Start</Label>
              <Input
                type="date"
                value={draft.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>End</Label>
              <Input
                type="date"
                value={draft.endDate}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => set("status", v as PlanStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            disabled={!draft.name.trim()}
          >
            {isEdit ? "Save" : "Create plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
