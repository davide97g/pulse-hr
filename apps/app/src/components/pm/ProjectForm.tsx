import { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import type { Commessa, ProjectStatus } from "@/lib/mock-data";
import { clients as clientSeed, employees, employeeById } from "@/lib/mock-data";

const STATUSES: ProjectStatus[] = ["draft", "active", "on_hold", "at_risk", "done", "closed"];

function blankProject(lockedClientId?: string): Commessa {
  const defaultClientId = lockedClientId ?? clientSeed[0]?.id ?? "";
  const client = clientSeed.find((c) => c.id === defaultClientId);
  return {
    id: `cm${Date.now()}`,
    code: "",
    name: "",
    client: client?.name ?? "",
    clientId: defaultClientId,
    ownerId: employees[0].id,
    color: client?.colorToken ?? "oklch(0.6 0.18 258)",
    budgetHours: 400,
    burnedHours: 0,
    status: "draft",
    manager: employeeById(employees[0].id)?.name ?? "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString().slice(0, 10),
    defaultBillableRate: 120,
    tags: [],
    externalLinks: [],
    referenceContactId: client?.primaryContactId ?? null,
  };
}

export function ProjectForm({
  open,
  onClose,
  onSave,
  initial,
  lockedClientId,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (p: Commessa) => void;
  initial?: Commessa | null;
  lockedClientId?: string;
}) {
  const isEdit = !!initial;
  const [draft, setDraft] = useState<Commessa>(() => initial ?? blankProject(lockedClientId));

  useEffect(() => {
    if (open) setDraft(initial ?? blankProject(lockedClientId));
  }, [open, initial, lockedClientId]);

  const set = <K extends keyof Commessa>(k: K, v: Commessa[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const selectedClient = useMemo(
    () => clientSeed.find((c) => c.id === draft.clientId),
    [draft.clientId],
  );
  const contacts = selectedClient?.contacts ?? [];

  const onClientChange = (newClientId: string) => {
    const c = clientSeed.find((x) => x.id === newClientId);
    setDraft((d) => ({
      ...d,
      clientId: newClientId,
      client: c?.name ?? d.client,
      color: c?.colorToken ?? d.color,
      referenceContactId: c?.primaryContactId ?? c?.contacts[0]?.id ?? null,
    }));
  };

  const save = () => {
    const clientName = clientSeed.find((c) => c.id === draft.clientId)?.name ?? draft.client;
    const ownerName = employeeById(draft.ownerId)?.name ?? draft.manager;
    onSave({ ...draft, client: clientName, manager: ownerName });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit project" : "New project"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-[140px_1fr] gap-3">
            <div className="grid gap-1.5">
              <Label>Code</Label>
              <Input
                value={draft.code}
                onChange={(e) => set("code", e.target.value)}
                placeholder="ACM-2026-01"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Platform rebuild"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Client</Label>
              <Select
                value={draft.clientId}
                onValueChange={onClientChange}
                disabled={!!lockedClientId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clientSeed.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Owner</Label>
              <Select value={draft.ownerId} onValueChange={(v) => set("ownerId", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Reference contact</Label>
            <Select
              value={draft.referenceContactId ?? "__none"}
              onValueChange={(v) => set("referenceContactId", v === "__none" ? null : v)}
              disabled={contacts.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={contacts.length === 0 ? "Client has no contacts" : "Pick a contact"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">— None —</SelectItem>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.role ? `(${c.role})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <div className="grid grid-cols-[1fr_1fr_140px] gap-3">
            <div className="grid gap-1.5">
              <Label>Budget hours</Label>
              <Input
                type="number"
                min={0}
                value={draft.budgetHours}
                onChange={(e) => set("budgetHours", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Default rate (€/h)</Label>
              <Input
                type="number"
                min={0}
                value={draft.defaultBillableRate}
                onChange={(e) => set("defaultBillableRate", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => set("status", v as ProjectStatus)}>
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
          <div className="grid gap-1.5">
            <Label>Tags (comma-separated)</Label>
            <Input
              value={draft.tags.join(", ")}
              onChange={(e) =>
                set(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!draft.name.trim() || !draft.code.trim()}>
            {isEdit ? "Save" : "Create project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
