import { Plus, Star, Trash2, Mail, Phone, User as UserIcon } from "lucide-react";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { cn } from "@/lib/utils";
import type { ClientContact } from "@/lib/mock-data";

let idCounter = 0;
function genId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

export function ClientContactsEditor({
  clientIdHint,
  contacts,
  primaryContactId,
  onChange,
}: {
  clientIdHint: string;
  contacts: ClientContact[];
  primaryContactId: string | null;
  onChange: (next: { contacts: ClientContact[]; primaryContactId: string | null }) => void;
}) {
  const update = (id: string, patch: Partial<ClientContact>) => {
    onChange({
      contacts: contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      primaryContactId,
    });
  };
  const remove = (id: string) => {
    const next = contacts.filter((c) => c.id !== id);
    const nextPrimary =
      primaryContactId === id ? (next[0]?.id ?? null) : primaryContactId;
    onChange({ contacts: next, primaryContactId: nextPrimary });
  };
  const add = () => {
    const newContact: ClientContact = {
      id: genId(`${clientIdHint}-cn`),
      name: "",
      email: "",
      role: "",
    };
    const next = [...contacts, newContact];
    onChange({
      contacts: next,
      primaryContactId: primaryContactId ?? newContact.id,
    });
  };
  const setPrimary = (id: string) => onChange({ contacts, primaryContactId: id });

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>Contacts</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add contact
        </Button>
      </div>
      {contacts.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-xs text-muted-foreground text-center">
          No contacts yet. Add at least one to use as the reference person.
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((c) => {
            const isPrimary = c.id === primaryContactId;
            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-md border p-3 grid grid-cols-1 md:grid-cols-[1fr_1fr_140px_auto] gap-2 items-end",
                  isPrimary && "border-primary/40 bg-primary/5",
                )}
              >
                <div className="grid gap-1.5">
                  <Label className="text-[11px] flex items-center gap-1.5 text-muted-foreground">
                    <UserIcon className="h-3 w-3" /> Name
                  </Label>
                  <Input
                    value={c.name}
                    onChange={(e) => update(c.id, { name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-[11px] flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-3 w-3" /> Email
                  </Label>
                  <Input
                    value={c.email}
                    onChange={(e) => update(c.id, { email: e.target.value })}
                    placeholder="name@client.test"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-[11px] flex items-center gap-1.5 text-muted-foreground">
                    Role
                  </Label>
                  <Input
                    value={c.role ?? ""}
                    onChange={(e) => update(c.id, { role: e.target.value })}
                    placeholder="Procurement"
                  />
                </div>
                <div className="flex items-center gap-1 md:justify-end">
                  <Button
                    type="button"
                    variant={isPrimary ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPrimary(c.id)}
                    title="Mark as reference person"
                  >
                    <Star className={cn("h-3.5 w-3.5", isPrimary && "fill-current")} />
                  </Button>
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
                <div className="md:col-span-4 -mt-1 grid gap-1.5">
                  <Input
                    value={c.phone ?? ""}
                    onChange={(e) => update(c.id, { phone: e.target.value })}
                    placeholder="Phone (optional)"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
        <Phone className="h-3 w-3" />
        Mark one contact as the reference person — projects can pick this contact too.
      </div>
    </div>
  );
}
