import { useState } from "react";
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
import type { Client } from "@/lib/mock-data";
import { employees } from "@/lib/mock-data";

const HUES = [
  { label: "Blue", value: "oklch(0.6 0.18 258)" },
  { label: "Orange", value: "oklch(0.7 0.15 30)" },
  { label: "Pink", value: "oklch(0.65 0.18 340)" },
  { label: "Green", value: "oklch(0.65 0.15 155)" },
  { label: "Olive", value: "oklch(0.7 0.13 110)" },
  { label: "Teal", value: "oklch(0.6 0.16 195)" },
  { label: "Violet", value: "oklch(0.6 0.18 290)" },
];

export function ClientForm({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (c: Client) => void;
  initial?: Client | null;
}) {
  const isEdit = !!initial;
  const [draft, setDraft] = useState<Client>(
    initial ?? {
      id: `cl${Date.now()}`,
      name: "",
      industry: "",
      accountOwnerId: employees[0].id,
      healthScore: 75,
      billingCurrency: "EUR",
      contactName: "",
      contactEmail: "",
      website: "",
      notes: "",
      createdAt: new Date().toISOString().slice(0, 10),
      colorToken: HUES[0].value,
    },
  );

  const set = <K extends keyof Client>(k: K, v: Client[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit client" : "New client"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Acme Corp"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Industry</Label>
              <Input value={draft.industry} onChange={(e) => set("industry", e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Account owner</Label>
              <Select value={draft.accountOwnerId} onValueChange={(v) => set("accountOwnerId", v)}>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Contact name</Label>
              <Input
                value={draft.contactName}
                onChange={(e) => set("contactName", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Contact email</Label>
              <Input
                value={draft.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_110px_120px] gap-3">
            <div className="grid gap-1.5">
              <Label>Website</Label>
              <Input value={draft.website ?? ""} onChange={(e) => set("website", e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Health</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={draft.healthScore}
                onChange={(e) => set("healthScore", Number(e.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Currency</Label>
              <Select
                value={draft.billingCurrency}
                onValueChange={(v) => set("billingCurrency", v as Client["billingCurrency"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Accent color</Label>
            <div className="flex gap-2 flex-wrap">
              {HUES.map((h) => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => set("colorToken", h.value)}
                  className="h-7 w-7 rounded-full border transition press-scale"
                  style={{
                    backgroundColor: h.value,
                    outline: draft.colorToken === h.value ? "2px solid currentColor" : "none",
                    outlineOffset: 2,
                  }}
                  aria-label={h.label}
                />
              ))}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={draft.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
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
            disabled={!draft.name.trim()}
          >
            {isEdit ? "Save" : "Create client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
