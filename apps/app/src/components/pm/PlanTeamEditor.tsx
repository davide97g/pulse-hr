import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import { Avatar } from "@/components/app/AppShell";
import { employees, employeeById, type Allocation, type PlanTeamMember } from "@/lib/mock-data";

export function PlanTeamEditor({
  team,
  projectId,
  allocations,
  onChange,
}: {
  team: PlanTeamMember[];
  projectId: string;
  allocations: Allocation[];
  onChange: (next: PlanTeamMember[]) => void;
}) {
  const allocatedEmployeeIds = useMemo(
    () =>
      Array.from(
        new Set(
          allocations.filter((a) => a.projectId === projectId).map((a) => a.employeeId),
        ),
      ),
    [allocations, projectId],
  );
  const allocatedEmployees = allocatedEmployeeIds
    .map((id) => employeeById(id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const onTeam = new Set(team.map((m) => m.employeeId));
  const pickable = allocatedEmployees.filter((e) => !onTeam.has(e.id));

  const update = (employeeId: string, patch: Partial<PlanTeamMember>) =>
    onChange(team.map((m) => (m.employeeId === employeeId ? { ...m, ...patch } : m)));
  const remove = (employeeId: string) =>
    onChange(team.filter((m) => m.employeeId !== employeeId));
  const add = (employeeId: string) =>
    onChange([...team, { employeeId, role: "Member" }]);

  return (
    <div className="grid gap-3">
      <Label>Plan team — picked from project allocations</Label>
      {team.length === 0 ? (
        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground text-center">
          No team members yet.
        </div>
      ) : (
        <div className="space-y-2">
          {team.map((m) => {
            const e = employeeById(m.employeeId);
            return (
              <div
                key={m.employeeId}
                className="rounded-md border p-2 flex items-center gap-3"
              >
                {e ? (
                  <Avatar initials={e.initials} color={e.avatarColor} size={28} />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{e?.name ?? m.employeeId}</div>
                  <div className="text-[11px] text-muted-foreground">{e?.role}</div>
                </div>
                <Input
                  className="h-8 w-40"
                  value={m.role}
                  onChange={(ev) => update(m.employeeId, { role: ev.target.value })}
                  placeholder="Role on plan"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => remove(m.employeeId)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
      {pickable.length > 0 ? (
        <div className="flex items-center gap-2">
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value="" onValueChange={add}>
            <SelectTrigger className="w-[280px] h-8 text-xs">
              <SelectValue placeholder="Add from allocated team…" />
            </SelectTrigger>
            <SelectContent>
              {pickable.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name} — {e.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="text-[11px] text-muted-foreground">
          {allocatedEmployees.length === 0
            ? "Add team members on the Project Team tab first."
            : "Everyone allocated to the project is already on the plan team."}
        </div>
      )}
      {allocatedEmployees.length === 0 && employees.length > 0 && (
        <div className="text-[11px] text-muted-foreground">
          Tip: capacity hints depend on project allocations being set up.
        </div>
      )}
    </div>
  );
}
