import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Upload, Check, X, Receipt, Trash2, MoreHorizontal, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@pulse-hr/ui/primitives/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@pulse-hr/ui/primitives/alert-dialog";
import { PageHeader, Avatar, StatusBadge } from "@/components/app/AppShell";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { SkeletonRows } from "@pulse-hr/ui/atoms/SkeletonList";
import { ListLayout } from "@pulse-hr/ui/atoms/ListLayout";
import { DataState } from "@pulse-hr/ui/atoms/DataState";
import { StatCard } from "@pulse-hr/ui/atoms/StatCard";
import { useSimulatedLoading } from "@pulse-hr/ui/hooks/use-simulated-loading";
import { useQuickAction } from "@/components/app/QuickActions";
import { useBulkSelect, BulkBar, RowCheckbox, HeaderCheckbox } from "@/components/app/bulk";
import { type Expense } from "@/lib/mock-data";
import { expensesTable, useExpenses } from "@/lib/tables/expenses";
import { employeeById } from "@/lib/tables/employees";
import { useUrlParam } from "@/lib/useUrlParam";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>) => s as Record<string, string>,
  component: Expenses,
});

const sym = { USD: "$", EUR: "€", GBP: "£" };

function Expenses() {
  const list = useExpenses();
  const [selId, setSelId] = useUrlParam("sel");
  const selected = selId ? (list.find((x) => x.id === selId) ?? null) : null;
  const setSelected = (e: Expense | null) => setSelId(e?.id ?? null);
  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const loading = useSimulatedLoading();
  const { open: openAction } = useQuickAction();

  const decide = (e: Expense, status: Expense["status"]) => {
    const before = e.status;
    expensesTable.update(e.id, { status });
    const undo = () => expensesTable.update(e.id, { status: before });
    if (status === "approved")
      toast.success(`Approved: ${e.description}`, { action: { label: "Undo", onClick: undo } });
    else if (status === "rejected")
      toast.error(`Rejected: ${e.description}`, { action: { label: "Undo", onClick: undo } });
  };
  const remove = (e: Expense) => {
    expensesTable.remove(e.id);
    if (selId === e.id) setSelId(null);
    toast("Expense deleted", {
      action: { label: "Undo", onClick: () => expensesTable.add(e) },
    });
  };

  const bulk = useBulkSelect(list);

  const bulkDecide = (status: Expense["status"]) => {
    const targets = bulk.selectedRows.filter((e) => e.status !== status);
    if (targets.length === 0) {
      toast("Nothing to update", { description: `Already ${status}.` });
      return;
    }
    const snaps = targets.map((e) => ({ id: e.id, prior: e.status }));
    targets.forEach((e) => expensesTable.update(e.id, { status }));
    bulk.clear();
    toast(
      status === "approved"
        ? `Approved ${targets.length} expense${targets.length === 1 ? "" : "s"}`
        : `Rejected ${targets.length} expense${targets.length === 1 ? "" : "s"}`,
      {
        action: {
          label: "Undo",
          onClick: () =>
            snaps.forEach((s) => expensesTable.update(s.id, { status: s.prior })),
        },
      },
    );
  };

  const bulkExport = () => {
    const rows = bulk.selectedRows;
    if (rows.length === 0) return;
    const cols = ["id", "description", "category", "amount", "currency", "date", "status"];
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = [
      cols.join(","),
      ...rows.map((r) => cols.map((c) => esc(r[c as keyof Expense])).join(",")),
    ].join("\n");
    const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${rows.length}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} row${rows.length === 1 ? "" : "s"}`);
  };

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const tag = (ev.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((ev.target as HTMLElement | null)?.isContentEditable) return;
      if (ev.key === "A" && ev.shiftKey) {
        ev.preventDefault();
        const pending = list.filter((x) => x.status === "pending");
        if (pending.length === 0) return;
        for (const x of pending) expensesTable.update(x.id, { status: "approved" });
        toast.success(`Approved ${pending.length} expense${pending.length === 1 ? "" : "s"}`, {
          action: {
            label: "Undo",
            onClick: () => {
              for (const x of pending) expensesTable.update(x.id, { status: x.status });
            },
          },
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [list]);

  const state = loading ? "loading" : list.length === 0 ? "empty" : "populated";

  return (
    <ListLayout
      className="fade-in"
      header={
        <PageHeader
          title="Expenses"
          description="Submit, approve and reimburse expenses"
          actions={
            <Button size="sm" onClick={() => openAction("submit-expense")}>
              <Plus className="h-4 w-4 mr-1.5" />
              Submit expense
            </Button>
          }
        />
      }
      sidePanel={
        <SidePanel open={!!selected} onClose={() => setSelected(null)} title="Expense detail">
          {selected &&
            (() => {
              const emp = employeeById(selected.employeeId)!;
              const status = selected.status;
              return (
                <div className="p-5">
                  <div className="text-2xl font-semibold mb-1">
                    {sym[selected.currency]}
                    {selected.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">{selected.description}</div>
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar
                      initials={emp.initials}
                      color={emp.avatarColor}
                      size={32}
                      employeeId={emp.id}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{emp.name}</div>
                      <div className="text-xs text-muted-foreground">{emp.role}</div>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="aspect-[3/4] rounded-md border bg-muted/40 flex items-center justify-center text-xs text-muted-foreground mb-4">
                    📄 Receipt preview
                  </div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Approval flow
                  </div>
                  <div className="space-y-2 mb-5">
                    <Step done label="Submitted" who={emp.name} />
                    <Step done label="Manager review" who="Sarah Chen" />
                    <Step
                      done={status === "approved" || status === "reimbursed"}
                      label="Finance approval"
                      who="Lina Rossi"
                    />
                    <Step done={status === "reimbursed"} label="Reimbursed" />
                  </div>
                  {status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => decide(selected, "rejected")}
                      >
                        <X className="h-4 w-4 mr-1.5" />
                        Reject
                      </Button>
                      <Button
                        className="flex-1 bg-success hover:bg-success/90 text-white"
                        onClick={() => decide(selected, "approved")}
                      >
                        <Check className="h-4 w-4 mr-1.5" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}
        </SidePanel>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard size="md" label="Pending review" value="$804.50" delta="2 expenses" />
        <StatCard size="md" label="Approved" value="$1,070" delta="2 expenses" deltaTone="positive" accent />
        <StatCard size="md" label="Reimbursed (mo)" value="$1,240" delta="1 expense" />
        <StatCard size="md" label="Rejected" value="$0" delta="0 expenses" />
      </div>

      <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="text-section">All expenses</div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              toast.success("Receipt uploader opened", {
                description: "Drag PDFs or JPGs to upload",
              })
            }
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Upload receipts
          </Button>
        </div>
        <DataState
          state={state}
          loading={<SkeletonRows rows={5} />}
          empty={
            <EmptyState
              icon={<Receipt className="h-6 w-6" />}
              title="No expenses yet"
              description="Submit your first expense to start the reimbursement flow."
              action={
                <Button size="sm" onClick={() => openAction("submit-expense")}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Submit expense
                </Button>
              }
            />
          }
        >
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <HeaderCheckbox
                    allSelected={bulk.allSelected}
                    someSelected={bulk.someSelected}
                    onToggle={() => bulk.toggleAll(list)}
                  />
                </th>
                <th className="text-left font-medium px-4 py-2.5">Description</th>
                <th className="text-left font-medium px-4 py-2.5">Submitted by</th>
                <th className="text-left font-medium px-4 py-2.5">Category</th>
                <th className="text-right font-medium px-4 py-2.5">Amount</th>
                <th className="text-left font-medium px-4 py-2.5">Date</th>
                <th className="text-left font-medium px-4 py-2.5">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="stagger-in">
              {list.map((x) => {
                const emp = employeeById(x.employeeId)!;
                return (
                  <tr
                    key={x.id}
                    tabIndex={x.status === "pending" ? 0 : -1}
                    onClick={() => setSelected(x)}
                    onKeyDown={
                      x.status === "pending"
                        ? (e) => {
                            if (e.metaKey || e.ctrlKey || e.altKey) return;
                            if (e.key === "a" && !e.shiftKey) {
                              e.preventDefault();
                              decide(x, "approved");
                            } else if (e.key === "r" && !e.shiftKey) {
                              e.preventDefault();
                              decide(x, "rejected");
                            }
                          }
                        : undefined
                    }
                    className="border-t hover:bg-muted/40 cursor-pointer group transition-colors focus:outline-none focus-visible:bg-primary/[0.04] focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <td className="px-3 py-2.5" onClick={(ev) => ev.stopPropagation()}>
                      <RowCheckbox
                        checked={bulk.isSelected(x.id)}
                        onChange={() => bulk.toggle(x.id)}
                        label={`Select ${x.description}`}
                      />
                    </td>
                    <td className="px-4 py-2.5 font-medium">{x.description}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar
                          initials={emp.initials}
                          color={emp.avatarColor}
                          size={24}
                          employeeId={emp.id}
                        />
                        <span className="text-muted-foreground">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{x.category}</td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                      {sym[x.currency]}
                      {x.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{x.date}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={x.status} />
                    </td>
                    <td className="px-2" onClick={(ev) => ev.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelected(x)}>
                            View detail
                          </DropdownMenuItem>
                          {x.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => decide(x, "approved")}>
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => decide(x, "rejected")}>
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setToDelete(x)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataState>
        <BulkBar
          count={bulk.count}
          onClear={bulk.clear}
          noun="expense"
          actions={[
            {
              label: "Approve",
              icon: <Check className="h-3.5 w-3.5" />,
              onClick: () => bulkDecide("approved"),
              tone: "success",
            },
            {
              label: "Reject",
              icon: <X className="h-3.5 w-3.5" />,
              onClick: () => bulkDecide("rejected"),
              tone: "destructive",
            },
            {
              label: "Export CSV",
              icon: <FileDown className="h-3.5 w-3.5" />,
              onClick: bulkExport,
            },
          ]}
        />
      </Card>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete &&
                `"${toDelete.description}" (${sym[toDelete.currency]}${toDelete.amount.toLocaleString()}) will be removed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) remove(toDelete);
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ListLayout>
  );
}

function Step({ done, label, who }: { done?: boolean; label: string; who?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-6 w-6 rounded-full flex items-center justify-center ${done ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}
      >
        {done ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </div>
      <div className="flex-1 text-sm">
        {label}
        {who && <span className="text-muted-foreground"> • {who}</span>}
      </div>
    </div>
  );
}
