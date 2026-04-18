import { useEffect, useState } from "react";
import { Search, User, Calendar, Receipt, Briefcase, FileText, Settings, Users, Clock, CreditCard } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { employees } from "@/lib/mock-data";
import { useQuickAction } from "./QuickActions";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { open: openAction } = useQuickAction();

  useEffect(() => { if (!open) setQ(""); }, [open]);

  const go = (to: string) => { onOpenChange(false); navigate({ to }); };
  const act = (id: Parameters<typeof openAction>[0]) => { onOpenChange(false); openAction(id); };

  const empMatches = q ? employees.filter(e => e.name.toLowerCase().includes(q.toLowerCase()) || e.role.toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [];

  const navItems = [
    { label: "Dashboard", to: "/", icon: Settings },
    { label: "Employees", to: "/people", icon: Users },
    { label: "Time & attendance", to: "/time", icon: Clock },
    { label: "Leave", to: "/leave", icon: Calendar },
    { label: "Payroll", to: "/payroll", icon: CreditCard },
    { label: "Expenses", to: "/expenses", icon: Receipt },
    { label: "Documents", to: "/documents", icon: FileText },
  ].filter(n => !q || n.label.toLowerCase().includes(q.toLowerCase()));

  const actions = [
    { label: "Add employee", id: "add-employee" as const, icon: User },
    { label: "Request leave", id: "request-leave" as const, icon: Calendar },
    { label: "Submit expense", id: "submit-expense" as const, icon: Receipt },
    { label: "Post a job", id: "post-job" as const, icon: Briefcase },
  ].filter(a => !q || a.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl gap-0 overflow-hidden top-[20%] translate-y-0">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search or jump to…"
            className="border-0 focus-visible:ring-0 shadow-none h-12"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground border rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {empMatches.length > 0 && (
            <Section label="Employees">
              {empMatches.map(e => (
                <Item key={e.id} icon={<User className="h-4 w-4" />} label={e.name} desc={e.role} onSelect={() => go("/people")} />
              ))}
            </Section>
          )}
          {actions.length > 0 && (
            <Section label="Quick actions">
              {actions.map(a => {
                const Icon = a.icon;
                return <Item key={a.id} icon={<Icon className="h-4 w-4" />} label={a.label} onSelect={() => act(a.id)} />;
              })}
            </Section>
          )}
          {navItems.length > 0 && (
            <Section label="Navigate">
              {navItems.map(n => {
                const Icon = n.icon;
                return <Item key={n.to} icon={<Icon className="h-4 w-4" />} label={n.label} onSelect={() => go(n.to)} />;
              })}
            </Section>
          )}
          {q && empMatches.length === 0 && actions.length === 0 && navItems.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">No results for "{q}"</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div>{children}</div>
    </div>
  );
}
function Item({ icon, label, desc, onSelect }: { icon: React.ReactNode; label: string; desc?: string; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted text-left"
    >
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">{label}</div>
        {desc && <div className="text-xs text-muted-foreground truncate">{desc}</div>}
      </div>
    </button>
  );
}
