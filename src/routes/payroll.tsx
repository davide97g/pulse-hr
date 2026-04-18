import { createFileRoute } from "@tanstack/react-router";
import { Play, Calendar, Users, DollarSign, FileText, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/app/AppShell";
import { payrollRuns } from "@/lib/mock-data";

export const Route = createFileRoute("/payroll")({
  head: () => ({ meta: [{ title: "Payroll — Pulse HR" }] }),
  component: Payroll,
});

function Payroll() {
  const upcoming = payrollRuns[0];
  return (
    <div className="p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Payroll"
        description="Run payroll, manage salaries and tax filings (incl. Italy F24)"
        actions={<Button size="sm"><Play className="h-4 w-4 mr-1.5" />Run payroll</Button>}
      />

      <Card className="p-6 mb-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Next payroll run</div>
            <div className="text-2xl font-semibold mt-1">{upcoming.period}</div>
            <div className="text-sm text-muted-foreground mt-0.5">Scheduled for {upcoming.date}</div>
          </div>
          <StatusBadge status={upcoming.status} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat icon={<Users className="h-4 w-4" />} label="Employees" value={`${upcoming.employees}`} />
          <Stat icon={<DollarSign className="h-4 w-4" />} label="Gross" value={`$${upcoming.gross.toLocaleString()}`} />
          <Stat icon={<DollarSign className="h-4 w-4" />} label="Net" value={`$${upcoming.net.toLocaleString()}`} />
          <Stat icon={<FileText className="h-4 w-4" />} label="Tax & deductions" value={`$${(upcoming.gross - upcoming.net).toLocaleString()}`} />
        </div>
        <div className="mt-5 pt-5 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Includes withholding, social security, F24 module, and pension contributions</div>
          <Button size="sm">Review & approve <ChevronRight className="h-4 w-4 ml-1" /></Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="px-5 py-4 border-b font-semibold text-sm">Recent payroll runs</div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Period</th>
                <th className="text-left font-medium px-4 py-2.5">Date</th>
                <th className="text-right font-medium px-4 py-2.5">Employees</th>
                <th className="text-right font-medium px-4 py-2.5">Net</th>
                <th className="text-left font-medium px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {payrollRuns.map(p => (
                <tr key={p.id} className="border-t hover:bg-muted/40 cursor-pointer">
                  <td className="px-4 py-2.5 font-medium">{p.period}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.date}</td>
                  <td className="px-4 py-2.5 text-right">{p.employees}</td>
                  <td className="px-4 py-2.5 text-right font-medium">${p.net.toLocaleString()}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="font-semibold text-sm mb-3">Salary components</div>
            {[
              { label: "Base salary", v: 98500 },
              { label: "Bonuses", v: 12000 },
              { label: "Overtime", v: 4200 },
              { label: "Benefits", v: 9800 },
            ].map(c => (
              <div key={c.label} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                <span className="text-muted-foreground">{c.label}</span>
                <span className="font-medium">${c.v.toLocaleString()}</span>
              </div>
            ))}
          </Card>

          <Card className="p-5">
            <div className="font-semibold text-sm mb-1">Tax filings</div>
            <div className="text-xs text-muted-foreground mb-3">Q2 2025</div>
            <div className="flex items-center justify-between py-2 border-b text-sm"><span>F24 (Italy)</span><StatusBadge status="pending" /></div>
            <div className="flex items-center justify-between py-2 border-b text-sm"><span>Form 941 (US)</span><StatusBadge status="approved" /></div>
            <div className="flex items-center justify-between py-2 text-sm"><span>HMRC PAYE (UK)</span><StatusBadge status="approved" /></div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-md bg-background/60 border">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}
