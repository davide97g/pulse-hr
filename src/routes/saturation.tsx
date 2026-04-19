import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Gauge } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { SaturationKPIs } from "@/components/saturation/SaturationKPIs";
import { UtilizationHeatmap } from "@/components/saturation/UtilizationHeatmap";
import { UtilizationTrendChart } from "@/components/saturation/UtilizationTrendChart";
import { MarginByProjectChart } from "@/components/saturation/MarginByProjectChart";
import { CostValueScatter } from "@/components/saturation/CostValueScatter";
import { BillableSplitDonut } from "@/components/saturation/BillableSplitDonut";
import { commesse, employees } from "@/lib/mock-data";
import { orgUtilization, personValue, billableSplit } from "@/lib/projects";

export const Route = createFileRoute("/saturation")({
  head: () => ({ meta: [{ title: "Saturation — Pulse HR" }] }),
  component: Saturation,
});

function Saturation() {
  const [startWeek] = useState(() => new Date());
  const [hoveredEmployeeId, setHoveredEmployeeId] = useState<string | null>(null);

  const orgUtilPct = useMemo(() => orgUtilization(), []);
  const benchHours = useMemo(() => {
    const active = employees.filter((e) => e.status !== "offboarding").length;
    const capacity = active * 40;
    const used = (orgUtilPct / 100) * capacity;
    return Math.max(0, capacity - used);
  }, [orgUtilPct]);

  const blendedMarginPct = useMemo(() => {
    const ppl = personValue();
    const totalRev = ppl.reduce((s, p) => s + p.revenue, 0);
    const totalCost = ppl.reduce((s, p) => s + p.cost, 0);
    return totalRev > 0 ? ((totalRev - totalCost) / totalRev) * 100 : 0;
  }, []);

  const atRiskProjects = useMemo(
    () => commesse.filter((p) => p.status === "at_risk" || p.status === "on_hold").length,
    [],
  );
  const split = useMemo(() => billableSplit(), []);

  return (
    <div className="p-4 md:p-6 fade-in relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl opacity-60"
        style={{
          background: "radial-gradient(closest-side, oklch(0.75 0.18 260 / .35), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 right-0 h-72 w-72 rounded-full blur-3xl opacity-50"
        style={{
          background: "radial-gradient(closest-side, oklch(0.75 0.18 320 / .35), transparent)",
        }}
      />

      <div className="relative">
        <div className="iridescent-border rounded-xl p-[1px] mb-6">
          <div className="rounded-[11px] bg-card/80 backdrop-blur px-5 py-4">
            <PageHeader
              title={
                <span className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Saturation
                  <span className="new-badge">NEW</span>
                </span>
              }
              description="How busy the org is, who is leaning in, and what each hour returns in €. Updates with allocations + timesheets."
            />
          </div>
        </div>

        <SaturationKPIs
          orgUtilPct={orgUtilPct}
          benchHours={benchHours}
          blendedMarginPct={blendedMarginPct}
          atRiskProjects={atRiskProjects}
        />

        <div className="mt-5 grid grid-cols-1 gap-4">
          <UtilizationHeatmap
            startDate={startWeek}
            weeks={12}
            hoveredEmployeeId={hoveredEmployeeId}
            onHoverEmployee={setHoveredEmployeeId}
          />
          <UtilizationTrendChart
            startDate={startWeek}
            weeks={12}
            hoveredEmployeeId={hoveredEmployeeId}
            onHoverEmployee={setHoveredEmployeeId}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MarginByProjectChart />
          <CostValueScatter />
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BillableSplitDonut />
          <div className="lg:col-span-2 rounded-lg border bg-card p-5">
            <div className="text-sm font-semibold mb-3">Reading guide</div>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5">
              <li>
                <span className="text-foreground font-medium">Heatmap</span> — columns are weeks,
                cells are each employee's load. Anything &gt;100% is a staffing risk; blank columns
                are bench.
              </li>
              <li>
                <span className="text-foreground font-medium">Margin by project</span> — positive
                bars in the project's own color, negative bars in red. Sorted to surface the biggest
                earners and drains.
              </li>
              <li>
                <span className="text-foreground font-medium">Cost vs value</span> — upper-right
                quadrant is the high-leverage cohort; lower-right means we're paying more than we're
                selling.
              </li>
              <li>
                <span className="text-foreground font-medium">Billable split</span> — fed from
                timesheets. Low billable ratio signals too much internal work vs client delivery.
              </li>
              <li className="text-[10px]">
                Cost = salary / 1,800h baseline · Revenue = allocation % × rate × hours. Both are
                mock.
              </li>
            </ul>
            <div className="mt-4 text-[11px] text-muted-foreground">
              {split.total.toFixed(0)}h tracked this period · org running at {orgUtilPct.toFixed(0)}
              %.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
