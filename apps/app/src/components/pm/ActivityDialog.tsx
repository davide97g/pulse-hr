import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@pulse-hr/ui/primitives/dialog";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Textarea } from "@pulse-hr/ui/primitives/textarea";
import { Label } from "@pulse-hr/ui/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import {
  employees,
  type Activity,
  type ActivityStatus,
  type IntegrationProvider,
} from "@/lib/mock-data";

const STATUSES: ActivityStatus[] = ["todo", "in_progress", "review", "done", "blocked"];

export function ActivityDialog({
  open,
  onClose,
  onSave,
  initial,
  projectId,
  defaultStatus,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (a: Activity) => void;
  initial: Activity | null;
  projectId: string;
  defaultStatus?: ActivityStatus;
}) {
  const [draft, setDraft] = useState<Activity>(() => blankActivity(projectId, defaultStatus));
  useEffect(() => {
    if (open) setDraft(initial ?? blankActivity(projectId, defaultStatus));
  }, [open, initial, projectId, defaultStatus]);

  const set = <K extends keyof Activity>(k: K, v: Activity[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit activity" : "New activity"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Title</Label>
            <Input
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Migration dry-run"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={draft.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Assignee</Label>
              <Select
                value={draft.assigneeId ?? ""}
                onValueChange={(v) => set("assigneeId", v || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Unassigned</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={draft.status}
                onValueChange={(v) => set("status", v as ActivityStatus)}
              >
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
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Start</Label>
              <Input
                type="date"
                value={draft.startDate ?? ""}
                onChange={(e) => set("startDate", e.target.value || undefined)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>End</Label>
              <Input
                type="date"
                value={draft.endDate ?? ""}
                onChange={(e) => set("endDate", e.target.value || undefined)}
              />
            </div>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <div className="grid gap-1.5">
              <Label>Link</Label>
              <Select
                value={draft.ticketLink?.provider ?? "__none"}
                onValueChange={(v) => {
                  if (v === "__none") set("ticketLink", undefined);
                  else
                    set("ticketLink", {
                      provider: v as IntegrationProvider,
                      key: draft.ticketLink?.key ?? "",
                      url: draft.ticketLink?.url ?? "",
                    });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">None</SelectItem>
                  <SelectItem value="jira">Jira</SelectItem>
                  <SelectItem value="linear">Linear</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Issue key</Label>
              <Input
                placeholder="ACME-23"
                value={draft.ticketLink?.key ?? ""}
                disabled={!draft.ticketLink}
                onChange={(e) => {
                  if (!draft.ticketLink) return;
                  const key = e.target.value;
                  const base =
                    draft.ticketLink.provider === "jira"
                      ? "https://jira.test/"
                      : "https://linear.test/";
                  set("ticketLink", { ...draft.ticketLink, key, url: `${base}${key}` });
                }}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const out = { ...draft };
              if (out.assigneeId === "__none") out.assigneeId = undefined;
              onSave(out);
              onClose();
            }}
            disabled={!draft.title.trim()}
          >
            {initial ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function blankActivity(projectId: string, status: ActivityStatus = "todo"): Activity {
  return {
    id: `ac${Date.now()}`,
    projectId,
    title: "",
    description: "",
    status,
    dependencies: [],
    order: 100,
  };
}
