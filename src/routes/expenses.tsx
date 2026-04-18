import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Upload, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, Avatar, StatusBadge } from "@/components/app/AppShell";
import { SidePanel } from "@/components/app/SidePanel";
import { useQuickAction } from "@/components/app/QuickActions";
import { expenses, employeeById, type Expense } from "@/lib/mock-data";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Pulse HR" }] }),
  component: Expenses,
});

const sym = { USD: "$", EUR: "€", GBP: "£" };

function Expenses() {
  const [selected, setSelected] = useState<Expense | null>(null);
  const [decisions, setDecisions] = useState<Record<string, Expense["status"]>>({});
  const { open: openAction } = useQuickAction();

  const get = (e: Expense) => decisions[e.id] ?? e.status;
  const decide = (e: Expense, status: Expense["status"]) => {
    setDecisions(d => ({ ...d, [e.id]: status }));
    if (status === "approved") toast.success(`Approved: ${e.description}`);
    else if (status === "rejected") toast.error(`Rejected: ${e.description}`);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Expenses"
        description="Submit, approve and reimburse expenses"
        actions={<Button size="sm" onClick={() => openAction("submit-expense")}><Plus className="h-4 w-4 mr-1.5" />Submit expense</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: "Pending review", v: "$804.50", n: 2, color: "warning" },
          { label: "Approved", v: "$1,070", n: 2, color: "success" },
          { label: "Reimbursed (mo)", v: "$1,240", n: 1, color: "info" },
          { label: "Rejected", v: "$0", n: 0, color: "muted" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-semibold mt-1">{s.v}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.n} expenses</div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="font-semibold text-sm">All expenses</div>
          <Button size="sm" variant="outline" onClick={() => toast.success("Receipt uploader opened", { description: "Drag PDFs or JPGs to upload" })}><Upload className="h-3.5 w-3.5 mr-1.5" />Upload receipts</Button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Description</th>
              <th className="text-left font-medium px-4 py-2.5">Submitted by</th>
              <th className="text-left font-medium px-4 py-2.5">Category</th>
              <th className="text-right font-medium px-4 py-2.5">Amount</th>
              <th className="text-left font-medium px-4 py-2.5">Date</th>
              <th className="text-left font-medium px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(x => {
              const emp = employeeById(x.employeeId)!;
              return (
                <tr key={x.id} onClick={() => setSelected(x)} className="border-t hover:bg-muted/40 cursor-pointer">
                  <td className="px-4 py-2.5 font-medium">{x.description}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Avatar initials={emp.initials} color={emp.avatarColor} size={24} />
                      <span className="text-muted-foreground">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{x.category}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{sym[x.currency]}{x.amount.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{x.date}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={get(x)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <SidePanel open={!!selected} onClose={() => setSelected(null)} title="Expense detail">
        {selected && (() => {
          const emp = employeeById(selected.employeeId)!;
          const status = get(selected);
          return (
            <div className="p-5">
              <div className="text-2xl font-semibold mb-1">{sym[selected.currency]}{selected.amount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mb-4">{selected.description}</div>
              <div className="flex items-center gap-2 mb-4">
                <Avatar initials={emp.initials} color={emp.avatarColor} size={32} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{emp.name}</div>
                  <div className="text-xs text-muted-foreground">{emp.role}</div>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="aspect-[3/4] rounded-md border bg-muted/40 flex items-center justify-center text-xs text-muted-foreground mb-4">
                📄 Receipt preview
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Approval flow</div>
              <div className="space-y-2 mb-5">
                <Step done label="Submitted" who={emp.name} />
                <Step done label="Manager review" who="Sarah Chen" />
                <Step done={status === "approved" || status === "reimbursed"} label="Finance approval" who="Lina Rossi" />
                <Step done={status === "reimbursed"} label="Reimbursed" />
              </div>
              {status === "pending" && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => decide(selected, "rejected")}><X className="h-4 w-4 mr-1.5" />Reject</Button>
                  <Button className="flex-1 bg-success hover:bg-success/90 text-white" onClick={() => decide(selected, "approved")}><Check className="h-4 w-4 mr-1.5" />Approve</Button>
                </div>
              )}
            </div>
          );
        })()}
      </SidePanel>
    </div>
  );
}

function Step({ done, label, who }: { done?: boolean; label: string; who?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${done ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>
        {done ? <Check className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
      </div>
      <div className="flex-1 text-sm">{label}{who && <span className="text-muted-foreground"> • {who}</span>}</div>
    </div>
  );
}
