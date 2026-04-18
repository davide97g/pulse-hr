import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Filter, Calendar, TrendingUp, Users, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/app/AppShell";
import { SkeletonCards } from "@/components/app/SkeletonList";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Pulse HR" }] }),
  component: Reports,
});

const RANGES = [
  { v: "7d",  l: "Last 7 days" },
  { v: "30d", l: "Last 30 days" },
  { v: "90d", l: "Last 90 days" },
  { v: "ytd", l: "Year to date" },
];

function Reports() {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");
  const [dept, setDept] = useState("all");

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, [range, dept]);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Reports & analytics"
        description="Configurable dashboards across HR, time and money"
        actions={
          <>
            <Button size="sm" variant="outline" className="press-scale" onClick={() => toast("Filter builder opened")}><Filter className="h-4 w-4 mr-1.5" />More filters</Button>
            <Button size="sm" variant="outline" className="press-scale" onClick={() => toast.success("CSV export started")}><Download className="h-4 w-4 mr-1.5" />Export CSV</Button>
            <Button size="sm" className="press-scale" onClick={() => toast.success("PDF export started")}><Download className="h-4 w-4 mr-1.5" />PDF</Button>
          </>
        }
      />

      <Card className="p-3 mb-4 flex items-center gap-2 flex-wrap">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="h-9 w-[180px]"><Calendar className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>{RANGES.map(r => <SelectItem key={r.v} value={r.v}>{r.l}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {["Engineering","Design","People Ops","Finance","Sales","Product","Marketing"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground ml-auto">Updated 2 min ago</div>
      </Card>

      {loading ? (
        <SkeletonCards cards={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 stagger-in">
          {[
            { icon: <Users className="h-4 w-4" />,       label: "Headcount",       v: "12",    d: "+18% YoY", up: true,  color: "oklch(0.6 0.16 220)" },
            { icon: <TrendingUp className="h-4 w-4" />,  label: "Turnover",        v: "4.2%",  d: "Below industry avg", up: false, color: "oklch(0.65 0.15 155)" },
            { icon: <DollarSign className="h-4 w-4" />,  label: "Cost / employee", v: "$118k", d: "+3% vs Q1", up: true,  color: "oklch(0.75 0.15 75)" },
            { icon: <Clock className="h-4 w-4" />,       label: "Absenteeism",     v: "2.1%",  d: "−0.4 pts",  up: false, color: "oklch(0.6 0.18 280)" },
          ].map(s => (
            <Card key={s.label} className="p-4 press-scale hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${s.color}15`, color: s.color }}>{s.icon}</div>
                <div className={cn("text-[11px] font-medium", s.up ? "text-success" : "text-muted-foreground")}>{s.d}</div>
              </div>
              <div className="text-xs text-muted-foreground mt-3">{s.label}</div>
              <div className="text-2xl font-semibold mt-0.5 tabular-nums">{s.v}</div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="h-4 w-[40%] shimmer rounded mb-4" />
              <div className="h-48 shimmer rounded" />
            </Card>
          ))
        ) : (
          [
            { t: "Attendance — last 30 days",   c: "oklch(0.6 0.16 220)" },
            { t: "Cost by department",          c: "oklch(0.65 0.15 155)" },
            { t: "Overtime hours by team",      c: "oklch(0.75 0.15 75)" },
            { t: "Headcount growth",            c: "oklch(0.55 0.18 258)" },
          ].map(x => <ChartCard key={x.t} title={x.t} color={x.c} />)
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, color }: { title: string; color: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-sm">{title}</div>
        <button onClick={() => toast(`${title} drill-down`)} className="text-xs text-primary hover:underline">Expand →</button>
      </div>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 12 }).map((_, i) => {
          const h = 30 + Math.sin(i * 0.8) * 30 + i * 4;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-md relative group cursor-pointer transition-all duration-500"
              style={{
                height: `${h}%`,
                backgroundColor: `${color}28`,
              }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 h-1 rounded-t-md transition-all group-hover:h-full group-hover:opacity-40"
                style={{ backgroundColor: color }}
              />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                {Math.round(h)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
