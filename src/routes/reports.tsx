import { createFileRoute } from "@tanstack/react-router";
import { Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/AppShell";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Pulse HR" }] }),
  component: Reports,
});

function Reports() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Reports & analytics"
        description="Configurable dashboards across HR, time and money"
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => toast("Filter panel opened")}><Filter className="h-4 w-4 mr-1.5" />Filter</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("CSV export started")}><Download className="h-4 w-4 mr-1.5" />Export CSV</Button>
            <Button size="sm" onClick={() => toast.success("PDF export started")}><Download className="h-4 w-4 mr-1.5" />PDF</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { label: "Headcount", v: "12", d: "+18% YoY" },
          { label: "Turnover", v: "4.2%", d: "Below industry avg" },
          { label: "Cost / employee", v: "$118k", d: "+3% vs Q1" },
          { label: "Absenteeism", v: "2.1%", d: "−0.4 pts" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-semibold mt-1">{s.v}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.d}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Attendance — last 30 days" />
        <ChartCard title="Cost by department" />
        <ChartCard title="Overtime hours by team" />
        <ChartCard title="Headcount growth" />
      </div>
    </div>
  );
}

function ChartCard({ title }: { title: string }) {
  return (
    <Card className="p-5">
      <div className="font-semibold text-sm mb-4">{title}</div>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 rounded-t-md bg-primary/15 hover:bg-primary/30 transition-colors relative group" style={{ height: `${30 + Math.sin(i) * 30 + i * 4}%` }}>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}
