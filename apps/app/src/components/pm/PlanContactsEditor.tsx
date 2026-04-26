import { Plus, Trash2, Mail, ExternalLink } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pulse-hr/ui/primitives/tabs";
import type { ClientContact, PlanContactRef } from "@/lib/mock-data";

let idCounter = 0;
function genId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

export function PlanContactsEditor({
  planId,
  contacts,
  clientContacts,
  onChange,
}: {
  planId: string;
  contacts: PlanContactRef[];
  clientContacts: ClientContact[];
  onChange: (next: PlanContactRef[]) => void;
}) {
  const clientPicks = contacts.filter((c) => c.kind === "client");
  const adhoc = contacts.filter((c) => c.kind === "adhoc");

  const pickedClientIds = new Set(clientPicks.map((c) => c.clientContactId));
  const pickable = clientContacts.filter((c) => !pickedClientIds.has(c.id));

  const update = (id: string, patch: Partial<PlanContactRef>) =>
    onChange(contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id: string) => onChange(contacts.filter((c) => c.id !== id));

  const addClientRef = (clientContactId: string) => {
    onChange([
      ...contacts,
      {
        id: genId(`${planId}-c`),
        kind: "client",
        clientContactId,
      },
    ]);
  };
  const addAdhoc = () =>
    onChange([
      ...contacts,
      {
        id: genId(`${planId}-c`),
        kind: "adhoc",
        name: "",
        email: "",
        role: "",
      },
    ]);

  return (
    <Tabs defaultValue="picked">
      <TabsList>
        <TabsTrigger value="picked">From client ({clientPicks.length})</TabsTrigger>
        <TabsTrigger value="adhoc">Ad-hoc ({adhoc.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="picked" className="pt-3 space-y-2">
        {clientPicks.length === 0 ? (
          <div className="text-xs text-muted-foreground">No client contacts attached.</div>
        ) : (
          <div className="space-y-1">
            {clientPicks.map((c) => {
              const ref = clientContacts.find((x) => x.id === c.clientContactId);
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate font-medium">{ref?.name ?? "(missing)"}</span>
                    {ref?.role && (
                      <span className="text-xs text-muted-foreground truncate">— {ref.role}</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => remove(c.id)}
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
            <Label className="text-xs text-muted-foreground">Add from client:</Label>
            <Select onValueChange={addClientRef} value="">
              <SelectTrigger className="w-[260px] h-8 text-xs">
                <SelectValue placeholder="Pick a contact…" />
              </SelectTrigger>
              <SelectContent>
                {pickable.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.role ? `(${c.role})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ExternalLink className="h-3 w-3" />
            All client contacts are already attached.
          </div>
        )}
      </TabsContent>
      <TabsContent value="adhoc" className="pt-3 space-y-2">
        {adhoc.length === 0 ? (
          <div className="text-xs text-muted-foreground">No ad-hoc contacts.</div>
        ) : (
          <div className="space-y-2">
            {adhoc.map((c) => (
              <div
                key={c.id}
                className="rounded-md border p-2.5 grid grid-cols-1 md:grid-cols-[1fr_1fr_140px_auto] gap-2 items-end"
              >
                <Input
                  value={c.name ?? ""}
                  onChange={(e) => update(c.id, { name: e.target.value })}
                  placeholder="Name"
                />
                <Input
                  value={c.email ?? ""}
                  onChange={(e) => update(c.id, { email: e.target.value })}
                  placeholder="Email"
                />
                <Input
                  value={c.role ?? ""}
                  onChange={(e) => update(c.id, { role: e.target.value })}
                  placeholder="Role"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => remove(c.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button type="button" size="sm" variant="outline" onClick={addAdhoc}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add ad-hoc contact
        </Button>
      </TabsContent>
    </Tabs>
  );
}
