import { useState, useEffect, useMemo } from "react";
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
import { AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import {
  employees,
  employeeById,
  projectById,
  type Activity,
  type ActivityStatus,
  type Commessa,
  type IntegrationProvider,
} from "@/lib/mock-data";
import { useAllocations } from "@/lib/tables/allocations";
import { useActivities } from "@/lib/tables/activities";
import { activityStatusLabel, activityStatusOptions } from "@/lib/activity-status";
import { employeeCapacityRow } from "@/lib/capacity";
import { cn } from "@/lib/utils";

const STATUSES: ActivityStatus[] = activityStatusOptions;

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
  const allocations = useAllocations();
  const activities = useActivities();

  const project: Commessa | undefined = useMemo(
    () => projectById(projectId),
    [projectId],
  );

  const [draft, setDraft] = useState<Activity>(() => blankActivity(projectId, defaultStatus, project));
  useEffect(() => {
    if (open) setDraft(initial ?? blankActivity(projectId, defaultStatus, project));
  }, [open, initial, projectId, defaultStatus, project]);

  const set = <K extends keyof Activity>(k: K, v: Activity[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  // Pool of candidate assignees: employees who have any allocation on this project
  const candidatePool = useMemo(() => {
    if (!project) return employees;
    const allocated = new Set(
      allocations.filter((a) => a.projectId === project.id).map((a) => a.employeeId),
    );
    return employees.filter((e) => allocated.has(e.id) || e.id === draft.assigneeId);
  }, [project, allocations, draft.assigneeId]);

  const windowStart = draft.startDate || project?.startDate || "";
  const windowEnd = draft.endDate || project?.endDate || "";

  const capByEmployee = useMemo(() => {
    if (!project || !windowStart || !windowEnd) return new Map<string, ReturnType<typeof employeeCapacityRow>>();
    const map = new Map<string, ReturnType<typeof employeeCapacityRow>>();
    for (const e of candidatePool) {
      map.set(
        e.id,
        employeeCapacityRow(e.id, project.id, windowStart, windowEnd, {
          excludeActivityId: initial?.id,
          activities,
          allocations,
        }),
      );
    }
    return map;
  }, [project, candidatePool, windowStart, windowEnd, activities, allocations, initial?.id]);

  const selectedRow = draft.assigneeId ? capByEmployee.get(draft.assigneeId) : null;
  const selectedAssignee = draft.assigneeId ? employeeById(draft.assigneeId) : null;
  const newAssignedHours = (selectedRow?.assignedHours ?? 0) + draft.estimateHours;
  const overAlloc = selectedRow ? newAssignedHours > selectedRow.capacityHours : false;
  const overByHours = selectedRow ? newAssignedHours - selectedRow.capacityHours : 0;

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
                value={draft.assigneeId ?? "__none"}
                onValueChange={(v) => set("assigneeId", v === "__none" ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Unassigned</SelectItem>
                  {candidatePool.map((e) => {
                    const row = capByEmployee.get(e.id);
                    const remainder = row ? row.capacityHours - row.assignedHours : null;
                    return (
                      <SelectItem key={e.id} value={e.id}>
                        <span className="flex items-center justify-between gap-3 w-full">
                          <span>{e.name}</span>
                          {remainder !== null && (
                            <span
                              className={cn(
                                "text-[10px] tabular-nums",
                                remainder < 0 ? "text-destructive" : "text-muted-foreground",
                              )}
                            >
                              {remainder.toFixed(0)}h left
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    );
                  })}
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
                      {activityStatusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
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
            <div className="grid gap-1.5">
              <Label>Estimate (h)</Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.estimateHours}
                onChange={(e) => set("estimateHours", Number(e.target.value) || 0)}
              />
            </div>
          </div>
          {selectedRow && (
            <div
              className={cn(
                "rounded-md border px-3 py-2 text-xs flex items-start gap-2",
                overAlloc
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : "bg-muted/50",
              )}
            >
              {overAlloc && <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
              <div>
                <div>
                  {selectedAssignee?.name ?? "Selected employee"} on{" "}
                  <span className="font-mono">{project?.code ?? projectId}</span> for {windowStart || "—"} →{" "}
                  {windowEnd || "—"}: {selectedRow.assignedHours.toFixed(0)}h booked of{" "}
                  {selectedRow.capacityHours.toFixed(0)}h capacity.
                </div>
                {overAlloc && (
                  <div className="mt-0.5 font-medium">
                    Adding this activity would over-allocate by {overByHours.toFixed(0)}h.
                  </div>
                )}
              </div>
            </div>
          )}
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
              onSave(draft);
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

function blankActivity(projectId: string, status: ActivityStatus = "todo", project?: Commessa): Activity {
  return {
    id: `ac${Date.now()}`,
    projectId,
    title: "",
    description: "",
    status,
    estimateHours: 8,
    startDate: project?.startDate,
    endDate: project?.endDate,
    dependencies: [],
    order: 100,
  };
}
