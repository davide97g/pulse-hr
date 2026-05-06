import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EditorialPage } from "@/components/app/layouts/EditorialPage";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { Eyebrow } from "@pulse-hr/ui/atoms/Eyebrow";
import { commesse } from "@/lib/mock-data";

export const Route = createFileRoute("/forecast")({
  head: () => ({ meta: [{ title: "Forecast — Pulse HR" }] }),
  component: ForecastPage,
});

function ForecastPage() {
  const navigate = useNavigate();
  const active = commesse.filter((c) => c.status === "active");
  const [selectedId, setSelectedId] = useState(active[0]?.id ?? "");
  const project = useMemo(
    () => active.find((c) => c.id === selectedId) ?? active[0],
    [selectedId, active],
  );

  const [headcount, setHeadcount] = useState(4);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [billableRate, setBillableRate] = useState(project?.defaultBillableRate ?? 130);

  const burned = project?.burnedHours ?? 0;
  const budget = project?.budgetHours ?? 0;
  const remaining = Math.max(budget - burned, 0);
  const burnPerWeek = headcount * hoursPerWeek;
  const weeksLeft = burnPerWeek > 0 ? Math.ceil(remaining / burnPerWeek) : 0;
  const projected = burned + weeksLeft * burnPerWeek;
  const overBudget = projected > budget;
  const projectedCost = Math.round(projected * billableRate);
  const budgetCost = Math.round(budget * billableRate);

  // Build a 12-week chart: actual to current week, projected from there.
  const series = useMemo(() => {
    const data: { week: string; actual?: number; projection?: number; budget: number }[] = [];
    const totalWeeks = 12;
    const currentWeek = Math.min(
      totalWeeks - 1,
      Math.round((burned / Math.max(burnPerWeek, 1)) * 0.6),
    );
    let running = 0;
    for (let i = 0; i < totalWeeks; i++) {
      if (i <= currentWeek) {
        running += burned / Math.max(currentWeek + 1, 1);
        data.push({ week: `W${i + 1}`, actual: Math.round(running), budget });
      } else {
        running += burnPerWeek;
        data.push({ week: `W${i + 1}`, projection: Math.round(running), budget });
      }
    }
    if (data[currentWeek]) data[currentWeek].projection = data[currentWeek].actual;
    return data;
  }, [burned, burnPerWeek, budget]);

  if (!project) {
    return (
      <EditorialPage title="Forecast" eyebrowText="WORK · NESSUNA COMMESSA">
        <p className="t-body-lg">Nessuna commessa attiva al momento.</p>
      </EditorialPage>
    );
  }

  return (
    <EditorialPage
      eyebrow={
        <Eyebrow
          tag={
            overBudget ? (
              <span className="tag-attention">⚠ OVER BUDGET</span>
            ) : (
              <span className="tag-spark">
                <span className="dot" style={{ background: "var(--spark-ink)", boxShadow: "none" }} />
                ON TRACK
              </span>
            )
          }
          note={`· ${weeksLeft} SETTIMANE PREVISTE`}
        >
          WORK · FORECAST {project.code}
        </Eyebrow>
      }
      actions={
        <>
          <EditorialPill kind="ghost" size="sm" onClick={() => navigate({ to: "/projects" })}>
            Apri commessa
          </EditorialPill>
          <EditorialPill kind="spark" size="sm" arrow onClick={() => navigate({ to: "/time" })}>
            Vai a Timesheet
          </EditorialPill>
        </>
      }
      title={
        <>
          {project.name}
          <span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
        </>
      }
      summary={
        <>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            BURN · {project.code}
          </span>
          <p className="t-body-lg" style={{ marginTop: 8, color: "var(--fg-2)" }}>
            <strong style={{ fontWeight: 600 }}>{burned}h / {budget}h</strong> bruciate
            {overBudget ? (
              <>
                ,{" "}
                <span className="spark-mark" style={{ fontWeight: 600 }}>
                  proiezione sopra budget
                </span>
              </>
            ) : (
              <>, margine ancora ampio</>
            )}
            .
          </p>
        </>
      }
    >
      {/* Project pills */}
      <div className="flex gap-2 flex-wrap">
        {active.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={c.id === selectedId ? "pill pill-dark pill-sm" : "pill pill-ghost pill-sm"}
          >
            {c.code}
          </button>
        ))}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi label="Bruciate" value={`${burned}h`} />
        <Kpi label="Budget" value={`${budget}h`} />
        <Kpi label="Proiezione" value={`${projected}h`} hot={overBudget} />
        <Kpi label="Costo proiettato" value={`€ ${projectedCost.toLocaleString("it-IT")}`} blend={!overBudget} hot={overBudget} />
      </div>

      {/* Chart */}
      <div className="solid-card p-5">
        <div className="flex items-baseline justify-between mb-4">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            BURN PROJECTION · 12 SETTIMANE
          </span>
          <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
            ACTUAL — solid · PROJECTION — dashed · BUDGET — spark
          </span>
        </div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" />
              <XAxis dataKey="week" stroke="var(--muted-foreground)" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--line-strong)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <ReferenceLine y={budget} stroke="var(--spark)" strokeWidth={2} label={{ value: "BUDGET", fill: "var(--spark)", fontSize: 10 }} />
              <Line type="monotone" dataKey="actual" stroke="var(--ink)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="projection" stroke="var(--ink)" strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario sliders */}
      <div className="solid-card p-5">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          SCENARI · TRASCINA PER PROIETTARE
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <Slider
            label="Persone in team"
            value={headcount}
            min={1}
            max={12}
            unit=""
            onChange={setHeadcount}
          />
          <Slider
            label="Ore / persona / settimana"
            value={hoursPerWeek}
            min={10}
            max={50}
            unit="h"
            onChange={setHoursPerWeek}
          />
          <Slider
            label="Tariffa oraria"
            value={billableRate}
            min={50}
            max={300}
            unit="€"
            onChange={setBillableRate}
          />
        </div>
        <div className="mt-6 flex items-baseline justify-between">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            DIFFERENZIALE A BUDGET
          </span>
          <span
            className="t-num"
            style={{
              fontSize: 32,
              letterSpacing: "-0.02em",
              color: overBudget ? "var(--destructive)" : "var(--spark)",
            }}
          >
            {overBudget ? "+" : "−"}€&nbsp;
            {Math.abs(projectedCost - budgetCost).toLocaleString("it-IT")}
          </span>
        </div>
      </div>
    </EditorialPage>
  );
}

function Kpi({
  label,
  value,
  hot,
  blend,
}: {
  label: string;
  value: string;
  hot?: boolean;
  blend?: boolean;
}) {
  return (
    <div className="solid-card p-4 flex flex-col gap-1">
      <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span
        className="t-num"
        style={{
          fontSize: 28,
          letterSpacing: "-0.02em",
          color: hot ? "var(--destructive)" : blend ? "var(--spark)" : "var(--fg)",
        }}
      >
        {hot ? <span className="spark-mark">{value}</span> : value}
      </span>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="t-num" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>
          {value}
        </span>
        <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: "var(--spark)" }}
      />
    </label>
  );
}
