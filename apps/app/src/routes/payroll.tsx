import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Play,
  Users,
  DollarSign,
  FileText,
  ChevronRight,
  Download,
  Eye,
  Ban,
  CheckCircle2,
  Trash2,
  Wallet,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader, Avatar, StatusBadge } from "@/components/app/AppShell";
import { SidePanel } from "@/components/app/SidePanel";
import { EmptyState } from "@/components/app/EmptyState";
import { SkeletonRows, SkeletonCards } from "@/components/app/SkeletonList";
import { useQuickAction } from "@/components/app/QuickActions";
import { payslips as payslipsSeed, employeeById, type PayrollRun } from "@/lib/mock-data";
import { payrollRunsTable, usePayrollRuns } from "@/lib/tables/payrollRuns";

export const Route = createFileRoute("/payroll")({
  head: () => ({ meta: [{ title: "Payroll — Pulse HR" }] }),
  component: Payroll,
});

function Payroll() {
  const runs = usePayrollRuns();
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [toDelete, setToDelete] = useState<PayrollRun | null>(null);
  const [loading, setLoading] = useState(true);
  const { open: openAction } = useQuickAction();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 460);
    return () => clearTimeout(t);
  }, []);

  const upcoming = runs.find((r) => r.status === "scheduled") ?? runs[0];

  const removeRun = (r: PayrollRun) => {
    payrollRunsTable.remove(r.id);
    toast("Payroll run deleted", {
      action: { label: "Undo", onClick: () => payrollRunsTable.add(r) },
    });
  };

  const markCompleted = (r: PayrollRun) => {
    payrollRunsTable.update(r.id, { status: "completed" });
    toast.success(`Marked ${r.period} as completed`);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Payroll"
        description="Run payroll, manage salaries and tax filings (incl. Italy F24)"
        actions={
          <Button size="sm" className="press-scale" onClick={() => openAction("run-payroll")}>
            <Play className="h-4 w-4 mr-1.5" />
            Run payroll
          </Button>
        }
      />

      {loading ? (
        <Card className="p-6 mb-4">
          <div className="h-3 w-32 shimmer rounded mb-2" />
          <div className="h-7 w-48 shimmer rounded mb-4" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 shimmer rounded" />
            ))}
          </div>
        </Card>
      ) : !upcoming ? (
        <Card className="p-0 mb-4">
          <EmptyState
            icon={<Wallet className="h-6 w-6" />}
            title="No payroll runs scheduled"
            description="Create your first payroll run to begin paying the team."
            action={
              <Button size="sm" onClick={() => openAction("run-payroll")}>
                <Play className="h-4 w-4 mr-1.5" />
                Run payroll
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="p-6 mb-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 relative overflow-hidden">
          <div
            className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl pointer-events-none"
            aria-hidden
          />
          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Next payroll run
                </div>
                <div className="text-2xl font-semibold mt-1">{upcoming.period}</div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  Scheduled for {upcoming.date}
                </div>
              </div>
              <StatusBadge status={upcoming.status} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Stat
                icon={<Users className="h-4 w-4" />}
                label="Employees"
                value={`${upcoming.employees}`}
              />
              <Stat
                icon={<DollarSign className="h-4 w-4" />}
                label="Gross"
                value={`$${upcoming.gross.toLocaleString()}`}
              />
              <Stat
                icon={<DollarSign className="h-4 w-4" />}
                label="Net"
                value={`$${upcoming.net.toLocaleString()}`}
              />
              <Stat
                icon={<FileText className="h-4 w-4" />}
                label="Tax & deductions"
                value={`$${(upcoming.gross - upcoming.net).toLocaleString()}`}
              />
            </div>
            <div className="mt-5 pt-5 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Withholding, social security, F24 module, pension contributions
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="press-scale"
                  onClick={() => setSelectedRun(upcoming)}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  Preview payslips
                </Button>
                <Button size="sm" className="press-scale" onClick={() => openAction("run-payroll")}>
                  Review & approve <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="runs">
        <TabsList>
          <TabsTrigger value="runs">
            <Wallet className="h-3.5 w-3.5 mr-1.5" />
            Runs
          </TabsTrigger>
          <TabsTrigger value="salary">
            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
            Salary components
          </TabsTrigger>
          <TabsTrigger value="tax">
            <Receipt className="h-3.5 w-3.5 mr-1.5" />
            Tax filings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="mt-4">
          <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
            <div className="px-5 py-4 border-b font-semibold text-sm flex items-center justify-between">
              <span>Recent payroll runs</span>
              <span className="text-xs text-muted-foreground">{runs.length} runs</span>
            </div>
            {loading ? (
              <SkeletonRows rows={4} avatar={false} />
            ) : runs.length === 0 ? (
              <EmptyState
                compact
                icon={<Wallet className="h-6 w-6" />}
                title="No runs yet"
                action={
                  <Button size="sm" onClick={() => openAction("run-payroll")}>
                    <Play className="h-4 w-4 mr-1.5" />
                    Run payroll
                  </Button>
                }
              />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Period</th>
                    <th className="text-left font-medium px-4 py-2.5">Date</th>
                    <th className="text-right font-medium px-4 py-2.5">Employees</th>
                    <th className="text-right font-medium px-4 py-2.5">Net</th>
                    <th className="text-left font-medium px-4 py-2.5">Status</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="stagger-in">
                  {runs.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedRun(p)}
                      className="border-t hover:bg-muted/40 cursor-pointer group transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium">{p.period}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{p.date}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{p.employees}</td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                        ${p.net.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-2" onClick={(ev) => ev.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <circle cx="5" cy="12" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="19" cy="12" r="1.5" />
                              </svg>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedRun(p)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("Payslips downloaded")}>
                              <Download className="h-4 w-4 mr-2" />
                              Download payslips
                            </DropdownMenuItem>
                            {p.status !== "completed" && (
                              <DropdownMenuItem onClick={() => markCompleted(p)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark completed
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setToDelete(p)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete run
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="mt-4">
          {loading ? (
            <SkeletonCards cards={4} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 stagger-in">
              {[
                { label: "Base salary", v: 98500, color: "oklch(0.6 0.16 220)" },
                { label: "Bonuses", v: 12000, color: "oklch(0.7 0.15 30)" },
                { label: "Overtime", v: 4200, color: "oklch(0.75 0.15 75)" },
                { label: "Benefits", v: 9800, color: "oklch(0.65 0.15 155)" },
              ].map((c) => (
                <Card
                  key={c.label}
                  className="p-4 press-scale hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => toast(c.label, { description: "Breakdown view coming soon" })}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.label}
                  </div>
                  <div className="text-2xl font-semibold mt-1 tabular-nums">
                    ${c.v.toLocaleString()}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tax" className="mt-4">
          <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
            <div className="divide-y stagger-in">
              {[
                { id: "tx1", l: "F24 (Italy)", due: "2025-04-30", s: "pending" },
                { id: "tx2", l: "Form 941 (US)", due: "2025-04-15", s: "approved" },
                { id: "tx3", l: "HMRC PAYE (UK)", due: "2025-04-22", s: "approved" },
              ].map((t) => (
                <div key={t.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{t.l}</div>
                    <div className="text-xs text-muted-foreground">Due {t.due}</div>
                  </div>
                  <StatusBadge status={t.s} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="press-scale"
                    onClick={() => toast.success(`${t.l} filing opened`)}
                  >
                    Open
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <SidePanel
        open={!!selectedRun}
        onClose={() => setSelectedRun(null)}
        width={640}
        title={selectedRun ? `Payslips · ${selectedRun.period}` : "Payslips"}
      >
        {selectedRun && <PayslipsPanel run={selectedRun} />}
      </SidePanel>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete payroll run?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete && `${toDelete.period} will be removed. You can undo momentarily.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) removeRun(toDelete);
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PayslipsPanel({ run }: { run: PayrollRun }) {
  const slips = payslipsSeed.filter((s) => s.runId === run.id);
  return (
    <div className="p-5">
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat icon={<Users className="h-4 w-4" />} label="Employees" value={`${run.employees}`} />
        <Stat
          icon={<DollarSign className="h-4 w-4" />}
          label="Gross"
          value={`$${run.gross.toLocaleString()}`}
        />
        <Stat
          icon={<DollarSign className="h-4 w-4" />}
          label="Net"
          value={`$${run.net.toLocaleString()}`}
        />
      </div>
      {slips.length === 0 ? (
        <EmptyState
          compact
          icon={<Ban className="h-6 w-6" />}
          title="No payslips yet"
          description="Payslips appear once the run is processed."
        />
      ) : (
        <div className="divide-y border rounded-md overflow-hidden stagger-in">
          {slips.map((s) => {
            const e = employeeById(s.employeeId);
            if (!e) return null;
            return (
              <div
                key={s.id}
                className="px-4 py-3 flex items-center gap-3 hover:bg-muted/40 transition-colors"
              >
                <Avatar initials={e.initials} color={e.avatarColor} size={32} employeeId={e.id} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">
                    ${s.net.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-muted-foreground tabular-nums">
                    gross ${s.gross.toLocaleString()}
                  </div>
                </div>
                <StatusBadge status={s.status === "paid" ? "approved" : s.status} />
              </div>
            );
          })}
        </div>
      )}
      <Button
        className="w-full mt-5 press-scale"
        variant="outline"
        onClick={() => toast.success("Bulk download started")}
      >
        <Download className="h-4 w-4 mr-1.5" />
        Download all payslips (PDF)
      </Button>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-md bg-background/60 border">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-xl font-semibold mt-1 tabular-nums">{value}</div>
    </div>
  );
}
