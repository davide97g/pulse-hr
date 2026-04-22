import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  TrendingUp,
  AlertTriangle,
  Sliders,
  UserPlus,
  Sparkles,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, StatusBadge } from "@/components/app/AppShell";
import { NewBadge } from "@/components/app/NewBadge";
import { commesse, type Commessa } from "@/lib/mock-data";
import { useWorkspace } from "@/components/app/WorkspaceContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/forecast")({
  head: () => ({ meta: [{ title: "Commessa Forecast — Pulse HR" }] }),
  component: Forecast,
});

// Status-driven color token for commesse on this page. Identity hue on
// `Commessa.color` is intentionally ignored here — the dot/line/progress bar
// should encode health, not project identity.
function statusColor(overBudget: boolean, weeksToBudget: number) {
  if (overBudget) return "var(--status-over)";
  if (weeksToBudget < 4) return "var(--status-risk)";
  return "var(--status-ok)";
}

// Simulated weekly burn rate per commessa (derived deterministically)
function weeklyBurnRate(c: Commessa) {
  const base = c.burnedHours / 14; // assume 14 weeks of work in
  return Math.max(4, Math.round(base * 10) / 10);
}

function forecastCommessa(c: Commessa, extraHeadcount: number, efficiencyPct: number) {
  const baseBurn = weeklyBurnRate(c);
  const adjBurn = baseBurn * (1 + extraHeadcount * 0.8) * (efficiencyPct / 100);
  const remaining = c.budgetHours - c.burnedHours;
  const weeksToBudget = adjBurn > 0 ? remaining / adjBurn : Infinity;
  const overBudget = remaining < 0;
  const overrunDate = new Date();
  overrunDate.setDate(overrunDate.getDate() + Math.round(Math.max(0, weeksToBudget) * 7));
  // simulate 12-week projection
  const projection = Array.from({ length: 12 }).map((_, i) => {
    const v = c.burnedHours + adjBurn * (i + 1);
    return {
      w: i + 1,
      burned: Math.round(v),
      isOver: v > c.budgetHours,
    };
  });
  return { baseBurn, adjBurn, remaining, weeksToBudget, overBudget, overrunDate, projection };
}

function Forecast() {
  const [headcount, setHeadcount] = useState(0);
  const [efficiency, setEfficiency] = useState(100);
  const workspace = useWorkspace();
  const [activeId, setActiveId] = useState<string>(workspace.activeCommessaId);

  const summaries = useMemo(
    () => commesse.map((c) => ({ c, f: forecastCommessa(c, headcount, efficiency) })),
    [headcount, efficiency],
  );
  const active = summaries.find((s) => s.c.id === activeId) ?? summaries[0];
  const atRisk =
    summaries.filter((s) => s.f.weeksToBudget < 6 && !s.f.overBudget).length +
    summaries.filter((s) => s.f.overBudget).length;
  const totalSaved = summaries.reduce((acc, s) => {
    const base = forecastCommessa(s.c, 0, 100);
    return acc + Math.max(0, base.adjBurn - s.f.adjBurn) * 4;
  }, 0);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title={
          <>
            <span>Commessa Forecast</span>
            <NewBadge />
          </>
        }
        description="Project-level burn projections with scenario modelling. See overruns before they happen."
        actions={
          <Button
            size="sm"
            className="press-scale"
            onClick={() =>
              toast.success("Forecast exported", { description: "PDF sent to your downloads." })
            }
          >
            Export forecast
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 stagger-in">
        <Card className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Active commesse
          </div>
          <div className="text-3xl font-display mt-1 tabular-nums">
            {commesse.filter((c) => c.status === "active").length}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-warning" />
            At risk
          </div>
          <div className="text-3xl font-display mt-1 tabular-nums text-warning">{atRisk}</div>
          <div className="text-xs text-muted-foreground mt-1">under current scenario</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Hours to budget (Σ)
          </div>
          <div className="text-3xl font-display mt-1 tabular-nums">
            {summaries.reduce((a, s) => a + Math.max(0, s.f.remaining), 0)}h
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI forecast
          </div>
          <div className="text-3xl font-display mt-1 tabular-nums">
            {totalSaved > 0 ? `+${Math.round(totalSaved)}h` : `${Math.round(totalSaved)}h`}
          </div>
          <div className="text-xs text-muted-foreground mt-1">saved/shifted vs baseline</div>
        </Card>
      </div>

      {/* Scenario sliders */}
      <Card className="p-6 mb-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] grid-bg pointer-events-none" aria-hidden />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="h-4 w-4 text-primary" />
            <div className="font-semibold text-sm">What-if scenario</div>
            <NewBadge label="AI" />
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto"
              onClick={() => {
                setHeadcount(0);
                setEfficiency(100);
                toast("Reset to baseline");
              }}
            >
              Reset
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium inline-flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  Add headcount
                </div>
                <div className="font-mono text-sm tabular-nums">
                  +{headcount} {headcount === 1 ? "person" : "people"}
                </div>
              </div>
              <Slider
                value={[headcount]}
                onValueChange={([v]) => setHeadcount(v)}
                min={0}
                max={4}
                step={1}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                <span>baseline</span>
                <span>+1</span>
                <span>+2</span>
                <span>+3</span>
                <span>+4</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Team efficiency</div>
                <div className="font-mono text-sm tabular-nums">{efficiency}%</div>
              </div>
              <Slider
                value={[efficiency]}
                onValueChange={([v]) => setEfficiency(v)}
                min={60}
                max={130}
                step={5}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                <span>60%</span>
                <span>baseline</span>
                <span>130%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Commesse grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <div className="space-y-2 stagger-in">
          {summaries.map(({ c, f }) => {
            const pct = Math.min(100, Math.round((c.burnedHours / c.budgetHours) * 100));
            const isActive = c.id === activeId;
            const tone = statusColor(f.overBudget, f.weeksToBudget);
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all press-scale",
                  isActive ? "border-primary bg-primary/[0.04] shadow-sm" : "hover:bg-muted/40",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: tone }}
                  />
                  <span className="text-[11px] font-mono">{c.code}</span>
                  {f.overBudget && (
                    <span className="text-[10px] px-1 rounded bg-destructive/10 text-destructive font-medium">
                      over
                    </span>
                  )}
                  {!f.overBudget && f.weeksToBudget < 4 && (
                    <span className="text-[10px] px-1 rounded bg-warning/10 text-warning font-medium">
                      risk
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium mt-1 truncate">{c.name}</div>
                <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                  <div
                    className="h-full transition-[width] duration-700"
                    style={{ width: `${pct}%`, backgroundColor: tone }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5 tabular-nums">
                  <span>
                    {c.burnedHours}/{c.budgetHours}h
                  </span>
                  <span>
                    {f.overBudget
                      ? "over budget"
                      : f.weeksToBudget === Infinity
                        ? "∞"
                        : `${f.weeksToBudget.toFixed(1)}w left`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {active && (
          <Card className="p-6">
            <div className="flex items-start justify-between mb-5 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: statusColor(active.f.overBudget, active.f.weeksToBudget),
                    }}
                  />
                  <span className="font-mono text-xs">{active.c.code}</span>
                  <StatusBadge
                    status={
                      active.c.status === "active"
                        ? "active"
                        : active.c.status === "on_hold"
                          ? "pending"
                          : "rejected"
                    }
                  />
                </div>
                <h2 className="font-display text-3xl">{active.c.name}</h2>
                <div className="text-sm text-muted-foreground">
                  {active.c.client} · Lead {active.c.manager}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Projected overrun
                </div>
                <div
                  className={cn(
                    "text-xl font-semibold tabular-nums inline-flex items-center gap-1.5",
                    active.f.overBudget
                      ? "text-destructive"
                      : active.f.weeksToBudget < 4
                        ? "text-warning"
                        : "text-success",
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  {active.f.overBudget
                    ? "Already over"
                    : active.f.weeksToBudget === Infinity
                      ? "No overrun projected"
                      : active.f.overrunDate.toISOString().slice(0, 10)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <Stat label="Budget" value={`${active.c.budgetHours}h`} />
              <Stat label="Burned" value={`${active.c.burnedHours}h`} />
              <Stat
                label="Burn rate"
                value={`${active.f.adjBurn.toFixed(1)}h/w`}
                delta={active.f.adjBurn - active.f.baseBurn}
              />
            </div>

            {/* Projection chart */}
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              12-week projection
            </div>
            <div className="relative h-56 border rounded-md p-4 bg-muted/20 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* budget line */}
                <line
                  x1="0"
                  x2="600"
                  y1={200 - (active.c.budgetHours / (active.c.budgetHours * 1.4)) * 200}
                  y2={200 - (active.c.budgetHours / (active.c.budgetHours * 1.4)) * 200}
                  stroke="var(--color-destructive)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <text
                  x="600"
                  y={200 - (active.c.budgetHours / (active.c.budgetHours * 1.4)) * 200 - 4}
                  textAnchor="end"
                  className="fill-destructive"
                  style={{ fontSize: 10 }}
                >
                  budget
                </text>
                {/* baseline */}
                {(() => {
                  const base = forecastCommessa(active.c, 0, 100).projection;
                  const path = base
                    .map(
                      (p, i) =>
                        `${i === 0 ? "M" : "L"} ${(i / 11) * 600} ${200 - (p.burned / (active.c.budgetHours * 1.4)) * 200}`,
                    )
                    .join(" ");
                  return (
                    <path
                      d={path}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="0.3"
                      strokeDasharray="3 3"
                    />
                  );
                })()}
                {/* current scenario */}
                {(() => {
                  const path = active.f.projection
                    .map(
                      (p, i) =>
                        `${i === 0 ? "M" : "L"} ${(i / 11) * 600} ${200 - (p.burned / (active.c.budgetHours * 1.4)) * 200}`,
                    )
                    .join(" ");
                  return (
                    <>
                      <path
                        d={`${path} L 600 200 L 0 200 Z`}
                        fill="color-mix(in oklch, var(--primary) 12%, transparent)"
                      />
                      <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" />
                    </>
                  );
                })()}
              </svg>
              <div className="absolute bottom-1 left-4 text-[10px] text-muted-foreground">W1</div>
              <div className="absolute bottom-1 right-4 text-[10px] text-muted-foreground">W12</div>
              <div className="absolute top-2 left-4 flex gap-3 text-[10px]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-4 bg-primary" />
                  Scenario
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-0.5 w-4 border-t border-dashed border-current" />
                  Baseline
                </span>
                <span className="inline-flex items-center gap-1.5 text-destructive">
                  <span className="h-0.5 w-4 border-t border-dashed border-current" />
                  Budget ceiling
                </span>
              </div>
            </div>

            {/* AI commentary */}
            <div className="mt-5 rounded-lg border p-4 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <div className="text-xs uppercase tracking-wider text-primary font-semibold">
                  Forecast narrative
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                {active.f.overBudget
                  ? `${active.c.code} is already over budget by ${Math.abs(active.f.remaining)}h. Recommend freezing non-critical work and having a scope conversation with ${active.c.manager} this week.`
                  : active.f.weeksToBudget < 4
                    ? `At current pace, ${active.c.code} will exhaust its budget in ~${active.f.weeksToBudget.toFixed(1)} weeks (around ${active.f.overrunDate.toISOString().slice(0, 10)}). Adding headcount would ${headcount > 0 ? "keep" : "pull"} the overrun date forward. Consider scoping a change request.`
                    : `${active.c.code} is on track under the current scenario. You have ~${active.f.weeksToBudget.toFixed(1)} weeks of runway at ${active.f.adjBurn.toFixed(1)}h/week.`}
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="press-scale"
                  onClick={() => toast.success("Change request drafted")}
                >
                  Draft change request
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="press-scale"
                  onClick={() => toast("Shared with Finance")}
                >
                  Share with Finance
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta?: number }) {
  return (
    <div className="p-3 rounded-md border">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold mt-0.5 tabular-nums">{value}</div>
      {delta !== undefined && (
        <div
          className={cn(
            "text-[11px] tabular-nums mt-0.5",
            delta > 0 ? "text-destructive" : delta < 0 ? "text-success" : "text-muted-foreground",
          )}
        >
          {delta > 0 ? "▲" : delta < 0 ? "▼" : ""} {Math.abs(delta).toFixed(1)} vs baseline
        </div>
      )}
    </div>
  );
}
