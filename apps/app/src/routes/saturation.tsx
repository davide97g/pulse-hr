import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { Gauge } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { NewBadge } from "@pulse-hr/ui/atoms/NewBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pulse-hr/ui/primitives/tabs";
import { SaturationKPIs } from "@/components/saturation/SaturationKPIs";
import { UtilizationHeatmap } from "@/components/saturation/UtilizationHeatmap";
import { SaturationInsights } from "@/components/saturation/SaturationInsights";
import { EmployeeScoreLeaderboard } from "@/components/saturation/EmployeeScoreLeaderboard";

const UtilizationTrendChart = lazy(() =>
  import("@/components/saturation/UtilizationTrendChart").then((m) => ({
    default: m.UtilizationTrendChart,
  })),
);
const MarginByProjectChart = lazy(() =>
  import("@/components/saturation/MarginByProjectChart").then((m) => ({
    default: m.MarginByProjectChart,
  })),
);
const CostValueScatter = lazy(() =>
  import("@/components/saturation/CostValueScatter").then((m) => ({ default: m.CostValueScatter })),
);
const BillableSplitDonut = lazy(() =>
  import("@/components/saturation/BillableSplitDonut").then((m) => ({
    default: m.BillableSplitDonut,
  })),
);

function ChartFallback({ className = "h-64" }: { className?: string }) {
  return <div className={`${className} rounded-lg border bg-card animate-pulse`} />;
}
import { commesse, employees } from "@/lib/mock-data";
import { orgUtilization, personValue, billableSplit } from "@/lib/projects";

type SaturationSection = "load" | "margins" | "value" | "insights";
type SaturationSearch = { section?: SaturationSection };

export const Route = createFileRoute("/saturation")({
  head: () => ({ meta: [{ title: "Saturation — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): SaturationSearch => ({
    section: (s.section as SaturationSection) || undefined,
  }),
  component: Saturation,
});

function Saturation() {
  const nav = useNavigate({ from: "/saturation" });
  const search = Route.useSearch();
  const section = search.section ?? "load";
  const setSection = (v: string) =>
    nav({
      search: (prev) => ({ ...prev, section: v === "load" ? undefined : (v as SaturationSection) }),
    });

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
              eyebrow={
                <>
                  INSIGHTS · SATURAZIONE · CARICO TEAM <NewBadge />
                </>
              }
              title={
                <>
                  <span className="spark-mark">Saturazione</span>
                  <span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
                </>
              }
              description="Quanto è carica l'organizzazione, chi spinge, quanto rende ogni ora in €."
            />
          </div>
        </div>

        <SaturationKPIs
          orgUtilPct={orgUtilPct}
          benchHours={benchHours}
          blendedMarginPct={blendedMarginPct}
          atRiskProjects={atRiskProjects}
          onJumpTo={(target) => setSection(target)}
        />

        <div className="mt-6">
          <Tabs value={section} onValueChange={setSection}>
            <TabsList>
              <TabsTrigger value="load">Team load</TabsTrigger>
              <TabsTrigger value="margins">Project margins</TabsTrigger>
              <TabsTrigger value="value">Employee value</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="load" className="pt-5">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex-1 min-w-0">
                  <UtilizationHeatmap
                    startDate={startWeek}
                    weeks={12}
                    hoveredEmployeeId={hoveredEmployeeId}
                    onHoverEmployee={setHoveredEmployeeId}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Suspense fallback={<ChartFallback className="h-full min-h-64" />}>
                    <UtilizationTrendChart
                      startDate={startWeek}
                      weeks={12}
                      hoveredEmployeeId={hoveredEmployeeId}
                      onHoverEmployee={setHoveredEmployeeId}
                    />
                  </Suspense>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="margins" className="pt-5 space-y-4">
              <Suspense fallback={<ChartFallback className="h-80" />}>
                <MarginByProjectChart />
              </Suspense>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Suspense fallback={<ChartFallback />}>
                  <BillableSplitDonut />
                </Suspense>
                <div className="rounded-lg border bg-card p-5">
                  <div className="text-sm font-semibold mb-3">How to read this</div>
                  <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5">
                    <li>
                      <span className="text-foreground font-medium">
                        Bars in the project's own color
                      </span>{" "}
                      are making money. Bars in red are net losses YTD.
                    </li>
                    <li>
                      <span className="text-foreground font-medium">Billable share</span> is fed
                      from timesheets — a low number means internal work is crowding out client
                      delivery.
                    </li>
                    <li className="text-[10px]">
                      Cost = salary / 1,800h baseline · Revenue = allocation % × rate × hours.
                    </li>
                  </ul>
                  <div className="mt-4 text-[11px] text-muted-foreground">
                    {split.total.toFixed(0)}h tracked this period.
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="value" className="pt-5 space-y-4">
              <EmployeeScoreLeaderboard />
              <Suspense fallback={<ChartFallback className="h-80" />}>
                <CostValueScatter />
              </Suspense>
              <div className="rounded-lg border bg-card p-5">
                <div className="text-sm font-semibold mb-2">Quadrant guide</div>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <span className="text-success font-medium">↗ Upper right</span> — high cost,
                    high revenue. Profitable senior talent.
                  </div>
                  <div>
                    <span className="text-foreground font-medium">↖ Upper left</span> — cheap to
                    run, strong revenue. Leverage points — keep them happy.
                  </div>
                  <div>
                    <span className="text-destructive font-medium">↘ Lower right</span> — expensive,
                    low return. Re-deploy to higher-leverage work.
                  </div>
                  <div>
                    <span className="text-foreground font-medium">↙ Lower left</span> — low cost,
                    low revenue. Bench or training — fine until it isn't.
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="pt-5">
              <SaturationInsights />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
