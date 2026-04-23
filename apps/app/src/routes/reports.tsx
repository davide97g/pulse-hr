import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import { PageHeader } from "@/components/app/AppShell";
import { SkeletonCards } from "@pulse-hr/ui/atoms/SkeletonList";
import { departments } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Pulse HR" }] }),
  component: Reports,
});

const RANGES = [
  { v: "7d", l: "Last 7 days" },
  { v: "30d", l: "Last 30 days" },
  { v: "90d", l: "Last 90 days" },
  { v: "ytd", l: "Year to date" },
];

// ── Synthetic data (deterministic) ─────────────────────────────────────
function attendanceSeries(days = 30) {
  const today = new Date();
  return Array.from({ length: days }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const wk = d.getDay();
    const weekend = wk === 0 || wk === 6;
    // 88..99% on workdays, dip on weekends
    const base = weekend ? 12 + (i % 4) : 88 + Math.sin(i * 0.7) * 6 + (i % 3);
    return {
      date: d.toISOString().slice(0, 10),
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      value: Math.round(base * 10) / 10,
      weekend,
    };
  });
}

// Bar fill is picked per row at render time so charts follow the active
// theme's primary + warn for outliers. Keeps the rainbow out of reports.
function overtimeByTeam() {
  return [
    { team: "Engineering", hours: 42 },
    { team: "Product", hours: 28 },
    { team: "Design", hours: 18 },
    { team: "Sales", hours: 24 },
    { team: "Finance", hours: 9 },
    { team: "People Ops", hours: 14 },
  ];
}

function costByDepartment() {
  return departments
    .map((d) => ({
      department: d.name,
      cost: Math.round(d.budget / 1000), // k€/$
      headcount: d.count,
    }))
    .sort((a, b) => b.cost - a.cost);
}

function headcountGrowth() {
  const months = [
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
  ];
  const start = 9;
  return months.map((m, i) => ({
    month: m,
    headcount: start + Math.round(i * 0.35) + (i >= 5 ? 2 : 0),
    turnover: Math.max(0, Math.round((3 + Math.sin(i * 0.6) * 1.2) * 10) / 10),
  }));
}

function sparklineFor(metric: "headcount" | "turnover" | "cost" | "absent") {
  return Array.from({ length: 12 }).map((_, i) => {
    const v =
      metric === "headcount"
        ? 9 + i * 0.35 + (i >= 6 ? 1.5 : 0)
        : metric === "turnover"
          ? 5 + Math.sin(i * 0.8) * 1.5 - i * 0.12
          : metric === "cost"
            ? 110 + Math.cos(i * 0.5) * 6 + i * 0.8
            : /* absent */ 2.8 - Math.sin(i * 0.7) * 0.6 - i * 0.03;
    return { i, v: Math.round(v * 10) / 10 };
  });
}

function exportCsv<T extends Record<string, unknown>>(rows: T[], filename: string) {
  if (rows.length === 0) {
    toast("Nothing to export");
    return;
  }
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join(
    "\n",
  );
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${rows.length} rows to ${filename}`);
}

// ── Page ───────────────────────────────────────────────────────────────
function Reports() {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");
  const [dept, setDept] = useState("all");

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, [range, dept]);

  const days = range === "7d" ? 7 : range === "90d" ? 60 : range === "ytd" ? 90 : 30;
  const attendance = useMemo(() => attendanceSeries(days), [days]);
  const overtime = useMemo(overtimeByTeam, []);
  const cost = useMemo(costByDepartment, []);
  const growth = useMemo(headcountGrowth, []);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Reports & analytics"
        description="Configurable dashboards across HR, time and money"
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              className="press-scale"
              onClick={() => toast("Filter builder opened")}
            >
              <Filter className="h-4 w-4 mr-1.5" />
              More filters
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="press-scale"
              onClick={() => exportCsv(attendance, `attendance-${range}.csv`)}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </Button>
            <Button
              size="sm"
              className="press-scale"
              onClick={() => toast.success("PDF export started")}
            >
              <Download className="h-4 w-4 mr-1.5" />
              PDF
            </Button>
          </>
        }
      />

      {/* Filter bar */}
      <Card className="p-3 mb-4 flex items-center gap-2 flex-wrap">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="h-9 w-[180px]">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r.v} value={r.v}>
                {r.l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="h-9 w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.name} value={d.name}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground ml-auto">Updated 2 min ago</div>
      </Card>

      {/* KPI tiles */}
      {loading ? (
        <SkeletonCards cards={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 stagger-in">
          <KpiTile
            icon={<Users className="h-4 w-4" />}
            label="Headcount"
            value="12"
            delta="+18% YoY"
            deltaTone="success"
            color="var(--primary)"
            spark={sparklineFor("headcount")}
          />
          <KpiTile
            icon={<TrendingUp className="h-4 w-4" />}
            label="Turnover"
            value="4.2%"
            delta="Below industry avg"
            deltaTone="success"
            color="var(--success)"
            spark={sparklineFor("turnover")}
          />
          <KpiTile
            icon={<DollarSign className="h-4 w-4" />}
            label="Cost / employee"
            value="$118k"
            delta="+3% vs Q1"
            deltaTone="warn"
            color="var(--warning)"
            spark={sparklineFor("cost")}
          />
          <KpiTile
            icon={<Clock className="h-4 w-4" />}
            label="Absenteeism"
            value="2.1%"
            delta="−0.4 pts"
            deltaTone="success"
            color="var(--primary)"
            spark={sparklineFor("absent")}
          />
        </div>
      )}

      {/* Chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title={`Attendance — last ${days} days`}>
          <AttendanceChart data={attendance} />
        </ChartCard>

        <ChartCard title="Cost by department">
          <CostByDeptChart data={cost} />
        </ChartCard>

        <ChartCard title="Overtime hours by team">
          <OvertimeChart data={overtime} />
        </ChartCard>

        <ChartCard title="Headcount growth — last 12 months">
          <HeadcountChart data={growth} />
        </ChartCard>
      </div>
    </div>
  );
}

// ── KPI tile ───────────────────────────────────────────────────────────
function KpiTile({
  icon,
  label,
  value,
  delta,
  deltaTone,
  color,
  spark,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  deltaTone: "success" | "warn" | "neutral";
  color: string;
  spark: { i: number; v: number }[];
}) {
  return (
    <Card className="p-4 press-scale hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div
          className="h-8 w-8 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`, color }}
        >
          {icon}
        </div>
        <span
          className={cn(
            "text-[11px] font-medium inline-flex items-center gap-1",
            deltaTone === "success" && "text-success",
            deltaTone === "warn" && "text-warning",
            deltaTone === "neutral" && "text-muted-foreground",
          )}
        >
          {deltaTone === "warn" ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {delta}
        </span>
      </div>
      <div className="text-xs text-muted-foreground mt-3">{label}</div>
      <div className="text-2xl font-semibold mt-0.5 tabular-nums">{value}</div>
      <div className="h-10 mt-2 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spark}>
            <defs>
              <linearGradient id={`sp-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              dataKey="v"
              type="monotone"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#sp-${label})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// ── Chart card wrapper ─────────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-sm">{title}</div>
        <button
          onClick={() => toast(`${title} drill-down`)}
          className="text-xs text-primary inline-flex items-center gap-1 hover:underline press-scale"
        >
          <Maximize2 className="h-3 w-3" /> Expand
        </button>
      </div>
      <div className="h-60">{children}</div>
    </Card>
  );
}

// ── Charts ─────────────────────────────────────────────────────────────
interface TipRow {
  name?: string;
  value?: number | string;
  color?: string;
  suffix?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  suffix,
}: {
  active?: boolean;
  payload?: TipRow[];
  label?: string;
  suffix?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border bg-popover text-popover-foreground shadow-pop px-3 py-2 text-xs">
      {label && <div className="font-semibold mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 tabular-nums">
          {p.color && (
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          )}
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-auto font-medium">
            {p.value}
            {suffix ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}

const AXIS_PROPS = {
  stroke: "currentColor",
  strokeOpacity: 0.3,
  tick: { fill: "currentColor", fillOpacity: 0.65, fontSize: 10 },
  tickLine: false,
  axisLine: false,
};

function AttendanceChart({ data }: { data: ReturnType<typeof attendanceSeries> }) {
  const accent = "var(--primary)";
  const muted = "var(--chart-muted)";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
        <XAxis dataKey="label" interval={Math.floor(data.length / 8)} {...AXIS_PROPS} />
        <YAxis unit="%" domain={[0, 100]} {...AXIS_PROPS} />
        <Tooltip
          content={<ChartTooltip suffix="%" />}
          cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
        />
        <Bar dataKey="value" name="Attendance" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.weekend ? muted : accent} fillOpacity={d.weekend ? 0.35 : 0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function CostByDeptChart({ data }: { data: ReturnType<typeof costByDepartment> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 20, bottom: 4 }}>
        <CartesianGrid stroke="currentColor" strokeOpacity={0.08} horizontal={false} />
        <XAxis type="number" unit="k" {...AXIS_PROPS} />
        <YAxis type="category" dataKey="department" width={88} {...AXIS_PROPS} />
        <Tooltip
          content={<ChartTooltip suffix="k" />}
          cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
        />
        <Bar dataKey="cost" name="Annual budget" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? "var(--primary)" : "var(--chart-muted)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function OvertimeChart({ data }: { data: ReturnType<typeof overtimeByTeam> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
        <XAxis dataKey="team" {...AXIS_PROPS} />
        <YAxis unit="h" {...AXIS_PROPS} />
        <Tooltip
          content={<ChartTooltip suffix="h" />}
          cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
        />
        <Bar dataKey="hours" name="Overtime" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.hours > 30 ? "var(--warning)" : "var(--primary)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function HeadcountChart({ data }: { data: ReturnType<typeof headcountGrowth> }) {
  const accent = "var(--primary)";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="hc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.4} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="currentColor" strokeOpacity={0.08} vertical={false} />
        <XAxis dataKey="month" {...AXIS_PROPS} />
        <YAxis {...AXIS_PROPS} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: accent, strokeOpacity: 0.3 }} />
        <Line
          type="monotone"
          dataKey="headcount"
          name="Headcount"
          stroke={accent}
          strokeWidth={2.5}
          dot={{ r: 3, fill: accent }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
