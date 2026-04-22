import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import {
  employees,
  employeeById,
  type Allocation,
  type AllocationType,
  type Commessa,
} from "@/lib/mock-data";
import { employeeCostRate } from "@/lib/projects";
import { cn } from "@/lib/utils";

const TYPE_TONES: Record<AllocationType, string> = {
  dev: "oklch(0.6 0.16 220)",
  design: "oklch(0.65 0.18 340)",
  pm: "oklch(0.7 0.15 80)",
  qa: "oklch(0.65 0.15 155)",
  ops: "oklch(0.7 0.13 110)",
  consult: "oklch(0.6 0.18 290)",
};
const TYPES: AllocationType[] = ["dev", "design", "pm", "qa", "ops", "consult"];

export function TeamPanel({
  project,
  team,
  onChange,
}: {
  project: Commessa;
  team: Allocation[];
  onChange: (next: Allocation[]) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [edit, setEdit] = useState<Allocation | null>(null);

  const totals = useMemo(() => {
    let percent = 0;
    let weeklyHours = 0;
    let weeklyRevenue = 0;
    let weeklyCost = 0;
    for (const a of team) {
      percent += a.percent;
      const hours = (a.percent / 100) * 40;
      weeklyHours += hours;
      const emp = employeeById(a.employeeId);
      weeklyRevenue += hours * (a.billableRate ?? project.defaultBillableRate);
      if (emp) weeklyCost += hours * employeeCostRate(emp);
    }
    return { percent, weeklyHours, weeklyRevenue, weeklyCost };
  }, [team, project.defaultBillableRate]);

  const save = (draft: Allocation) => {
    const exists = team.some((a) => a.id === draft.id);
    onChange(exists ? team.map((a) => (a.id === draft.id ? draft : a)) : [...team, draft]);
    toast.success(exists ? "Allocation updated" : "Team member added");
  };

  const remove = (a: Allocation) => {
    onChange(team.filter((x) => x.id !== a.id));
    toast("Allocation removed", {
      action: { label: "Undo", onClick: () => onChange([...team, a]) },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Team &amp; allocations</div>
          <div className="text-xs text-muted-foreground">
            Who's on it, how much, and at what rate.
          </div>
        </div>
        <Button
          onClick={() => {
            setEdit(null);
            setFormOpen(true);
          }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add team member
        </Button>
      </div>

      {team.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<UserPlus className="h-5 w-5" />}
            title="No one allocated yet"
            description="Add the first person to this project."
            action={
              <Button
                onClick={() => {
                  setEdit(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add member
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Member</th>
                <th className="text-left font-medium px-3 py-2.5">Role</th>
                <th className="text-left font-medium px-3 py-2.5">Allocation</th>
                <th className="text-left font-medium px-3 py-2.5">Window</th>
                <th className="text-right font-medium px-3 py-2.5">Rate €/h</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="stagger-in">
              {team.map((a) => {
                const emp = employeeById(a.employeeId);
                return (
                  <tr
                    key={a.id}
                    className="border-t hover:bg-muted/30 cursor-pointer"
                    onClick={() => {
                      setEdit(a);
                      setFormOpen(true);
                    }}
                  >
                    <td className="px-4 py-3">
                      {emp ? (
                        <div className="flex items-center gap-3">
                          <Avatar
                            initials={emp.initials}
                            color={emp.avatarColor}
                            size={28}
                            employeeId={emp.id}
                          />
                          <div>
                            <div className="font-medium">{emp.name}</div>
                            <div className="text-xs text-muted-foreground">{emp.role}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unknown employee</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        variant="outline"
                        className="font-medium"
                        style={{
                          color: TYPE_TONES[a.type],
                          borderColor: `color-mix(in oklch, ${TYPE_TONES[a.type]} 45%, transparent)`,
                        }}
                      >
                        {a.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 w-64">
                      <div className="flex items-center gap-2">
                        <div className="text-xs tabular-nums w-10 text-right">{a.percent}%</div>
                        <div className="flex-1 h-1.5 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full rounded"
                            style={{ width: `${a.percent}%`, backgroundColor: TYPE_TONES[a.type] }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground tabular-nums">
                      {a.startDate} → {a.endDate}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {a.billableRate ?? project.defaultBillableRate}
                      {a.billableRate && (
                        <span className="text-muted-foreground text-[10px] ml-1">(override)</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => remove(a)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Card className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Totals label="Total FTE" value={`${(totals.percent / 100).toFixed(1)}`} suffix="x" />
        <Totals label="Hours / week" value={totals.weeklyHours.toFixed(0)} />
        <Totals
          label="Revenue / week"
          value={`€${totals.weeklyRevenue.toFixed(0)}`}
          tone={totals.weeklyRevenue > totals.weeklyCost ? "good" : "warn"}
        />
        <Totals label="Cost / week" value={`€${totals.weeklyCost.toFixed(0)}`} />
      </Card>

      <AllocationFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEdit(null);
        }}
        initial={edit}
        project={project}
        onSave={save}
      />
    </div>
  );
}

function Totals({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
  tone?: "good" | "warn";
}) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div
        className={cn(
          "text-lg font-semibold mt-0.5 tabular-nums",
          tone === "good" && "text-success",
          tone === "warn" && "text-warning",
        )}
      >
        {value}
        {suffix}
      </div>
    </div>
  );
}

function AllocationFormDialog({
  open,
  onClose,
  onSave,
  initial,
  project,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (a: Allocation) => void;
  initial: Allocation | null;
  project: Commessa;
}) {
  const [draft, setDraft] = useState<Allocation>(
    initial ?? {
      id: `al${Date.now()}`,
      projectId: project.id,
      employeeId: employees[0].id,
      type: "dev",
      percent: 50,
      startDate: project.startDate,
      endDate: project.endDate,
      billableRate: undefined,
    },
  );

  // Reset when opening with different initial
  useMemo(() => {
    if (open) {
      setDraft(
        initial ?? {
          id: `al${Date.now()}`,
          projectId: project.id,
          employeeId: employees[0].id,
          type: "dev",
          percent: 50,
          startDate: project.startDate,
          endDate: project.endDate,
          billableRate: undefined,
        },
      );
    }
    return null;
  }, [open, initial?.id]);

  const set = <K extends keyof Allocation>(k: K, v: Allocation[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit allocation" : "Add team member"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Employee</Label>
            <Select value={draft.employeeId} onValueChange={(v) => set("employeeId", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} — {e.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Role</Label>
              <Select value={draft.type} onValueChange={(v) => set("type", v as AllocationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Rate override (€/h)</Label>
              <Input
                type="number"
                placeholder={`${project.defaultBillableRate} (default)`}
                value={draft.billableRate ?? ""}
                onChange={(e) =>
                  set("billableRate", e.target.value === "" ? undefined : Number(e.target.value))
                }
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>
              Allocation: <span className="font-mono">{draft.percent}%</span>
            </Label>
            <Slider
              value={[draft.percent]}
              min={5}
              max={100}
              step={5}
              onValueChange={([v]) => set("percent", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          </div>
          <div className="grid gap-1.5">
            <Label>Note</Label>
            <Input
              value={draft.note ?? ""}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Optional"
            />
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
          >
            {initial ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
