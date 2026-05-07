import { useMemo, useState } from "react";
import { commesse, type Commessa } from "@/lib/mock-data";

const WEEKS_AHEAD = 10;

function buildSeries(project: Commessa, scenario: { teamSize: number; daysPerWeek: number; weeksLeft: number }) {
  // Convert burnedHours into € k spent, then projection forward via scenario.
  const rate = project.defaultBillableRate || 100;
  const spentK = Math.round((project.burnedHours * rate) / 1000);
  const budgetK = Math.round((project.budgetHours * rate) / 1000);
  // Distribute spentK across 6 historical weeks for visualization.
  const histWeeks = 6;
  const actual: number[] = [];
  for (let i = 1; i <= histWeeks; i++) {
    actual.push(Math.round((spentK * i) / histWeeks));
  }
  const wkBurnRate =
    (rate * scenario.teamSize * scenario.daysPerWeek * 8) / 1000;
  const proj: number[] = [];
  let running = spentK;
  for (let i = 0; i < scenario.weeksLeft; i++) {
    running += wkBurnRate;
    proj.push(Math.round(running));
  }
  return { actual, proj, budgetK, spentK, projectedK: proj[proj.length - 1] ?? spentK };
}

export function ForecastEditorial() {
  const active = useMemo(() => commesse.filter((c) => c.status === "active"), []);
  const [projectId, setProjectId] = useState(() => active[0]?.id ?? "");
  const project = active.find((p) => p.id === projectId) ?? active[0];

  const [teamSize, setTeamSize] = useState(6);
  const [daysPerWeek, setDaysPerWeek] = useState(4.2);
  const [weeksLeft, setWeeksLeft] = useState(WEEKS_AHEAD);

  const series = useMemo(
    () => (project ? buildSeries(project, { teamSize, daysPerWeek, weeksLeft }) : null),
    [project, teamSize, daysPerWeek, weeksLeft],
  );

  if (!project || !series) {
    return (
      <div className="p-12 text-center" style={{ color: "var(--muted-foreground)" }}>
        <span className="t-mono">NESSUNA COMMESSA ATTIVA</span>
      </div>
    );
  }

  const overBudget = series.projectedK > series.budgetK;

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-6 min-h-[calc(100vh-3.5rem)]">
      {/* Project picker */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          COMMESSA
        </span>
        {active.slice(0, 6).map((c) => {
          const a = c.id === project.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setProjectId(c.id)}
              className="t-mono"
              style={{
                padding: "5px 10px",
                borderRadius: 999,
                border: `1px solid ${a ? "var(--ink)" : "var(--line)"}`,
                background: a ? "var(--ink)" : "transparent",
                color: a ? "var(--paper)" : "var(--muted-foreground)",
                cursor: "pointer",
              }}
            >
              {c.code}
            </button>
          );
        })}
      </div>

      {/* Hero */}
      <div className="grid gap-6" style={{ gridTemplateColumns: "1fr auto", alignItems: "end" }}>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {project.code} · BURN PROJECTION
            </span>
            <span className="dot" />
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              SCENARIO {teamSize === 6 && Math.abs(daysPerWeek - 4.2) < 0.05 ? "BASE" : "MODIFICATO"}
            </span>
          </div>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(56px, 7vw, 96px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
            }}
          >
            Burn <span style={{ fontStyle: "italic" }}>projection</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 12,
              maxWidth: 520,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 18,
              lineHeight: 1.4,
            }}
          >
            {project.name}.{" "}
            {overBudget
              ? "Proiezione sopra budget — riassegnare o ridurre lo scope."
              : "Proiezione entro budget al ritmo corrente."}
          </p>
        </div>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "auto auto auto",
            borderLeft: "1px solid var(--line)",
          }}
        >
          {(
            [
              ["SPESO", `€ ${series.spentK}k`, false],
              ["PROIETTATO", `€ ${series.projectedK}k`, true],
              ["BUDGET", `€ ${series.budgetK}k`, false],
            ] as Array<[string, string, boolean]>
          ).map(([l, v, spark], i, arr) => (
            <div
              key={i}
              style={{
                padding: "8px 22px",
                borderRight: i < arr.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {l}
              </span>
              <div
                className="t-num"
                style={{
                  fontSize: 32,
                  marginTop: 4,
                  letterSpacing: "-0.03em",
                  color: spark ? "var(--spark)" : "var(--fg)",
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 16,
          background: "var(--bg)",
          padding: "24px 28px",
          flex: 1,
          minHeight: 320,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            € MIGLIAIA · {series.actual.length + series.proj.length} SETTIMANE
          </span>
          <div className="flex gap-4 flex-wrap">
            <span className="t-mono" style={{ color: "var(--fg)" }}>
              ━━ ACTUAL
            </span>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ╴╴ PROJECTION
            </span>
            <span className="t-mono" style={{ color: "var(--spark)" }}>
              ━ BUDGET € {series.budgetK}k
            </span>
          </div>
        </div>
        <ProjectionChart actual={series.actual} proj={series.proj} budgetK={series.budgetK} />
      </div>

      {/* Sliders */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <SliderCard
          label="TEAM SIZE"
          value={`${teamSize} FTE`}
          min={1}
          max={12}
          step={1}
          v={teamSize}
          onChange={setTeamSize}
          range="1 – 12"
        />
        <SliderCard
          label="GIORNI MEDI / WK"
          value={daysPerWeek.toFixed(1)}
          min={3}
          max={5}
          step={0.1}
          v={daysPerWeek}
          onChange={setDaysPerWeek}
          range="3.0 – 5.0"
        />
        <SliderCard
          label="DURATA RESIDUA"
          value={`${weeksLeft} sett.`}
          min={2}
          max={20}
          step={1}
          v={weeksLeft}
          onChange={setWeeksLeft}
          range="2 – 20 settimane"
        />
      </div>
    </div>
  );
}

function ProjectionChart({
  actual,
  proj,
  budgetK,
}: {
  actual: number[];
  proj: number[];
  budgetK: number;
}) {
  const W = 1280;
  const H = 320;
  const pad = { l: 40, r: 40, t: 16, b: 28 };
  const total = actual.length + proj.length;
  const maxY = Math.max(budgetK * 1.15, ...actual, ...proj);
  const xAt = (i: number) => pad.l + ((W - pad.l - pad.r) * i) / Math.max(total - 1, 1);
  const yAt = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / maxY);

  const actualPoints = actual.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");
  const projAnchor =
    actual.length > 0
      ? `${xAt(actual.length - 1)},${yAt(actual[actual.length - 1])}`
      : "";
  const projPoints = [
    projAnchor,
    ...proj.map((v, i) => `${xAt(actual.length + i)},${yAt(v)}`),
  ]
    .filter(Boolean)
    .join(" ");
  const budgetY = yAt(budgetK);
  const grid = [0, Math.round(maxY / 4), Math.round(maxY / 2), Math.round((3 * maxY) / 4), Math.round(maxY)];

  return (
    <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {grid.map((g, i) => (
          <line
            key={i}
            x1={pad.l}
            x2={W - pad.r}
            y1={yAt(g)}
            y2={yAt(g)}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="1"
          />
        ))}
        {grid.map((g, i) => (
          <text
            key={i}
            x={pad.l - 6}
            y={yAt(g) + 3}
            textAnchor="end"
            fontFamily="JetBrains Mono"
            fontSize="9"
            fill="currentColor"
            fillOpacity="0.45"
          >
            €{g}k
          </text>
        ))}
        {/* budget */}
        <line
          x1={pad.l}
          x2={W - pad.r}
          y1={budgetY}
          y2={budgetY}
          stroke="var(--spark)"
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
        {/* projection (dashed) */}
        {projPoints && (
          <polyline
            points={projPoints}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="2"
            strokeDasharray="4 5"
          />
        )}
        {/* actual (solid) */}
        {actualPoints && (
          <polyline points={actualPoints} fill="none" stroke="currentColor" strokeWidth="2.5" />
        )}
        {/* dot at current */}
        {actual.length > 0 && (
          <circle
            cx={xAt(actual.length - 1)}
            cy={yAt(actual[actual.length - 1])}
            r="5"
            fill="var(--spark)"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </div>
  );
}

function SliderCard({
  label,
  value,
  min,
  max,
  step,
  v,
  onChange,
  range,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  v: number;
  onChange: (n: number) => void;
  range: string;
}) {
  const pct = ((v - min) / (max - min)) * 100;
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div className="flex items-baseline justify-between">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {label}
        </span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {range}
        </span>
      </div>
      <span className="t-num" style={{ fontSize: 28, letterSpacing: "-0.03em" }}>
        {value}
      </span>
      <div style={{ position: "relative", height: 4, borderRadius: 999, background: "var(--bg-3)" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: `${pct}%`,
            height: "100%",
            background: "var(--spark)",
            borderRadius: 999,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute",
            inset: -8,
            width: "calc(100% + 16px)",
            opacity: 0,
            cursor: "pointer",
          }}
          aria-label={label}
        />
        <div
          style={{
            position: "absolute",
            left: `calc(${pct}% - 8px)`,
            top: -6,
            width: 16,
            height: 16,
            borderRadius: 999,
            background: "var(--fg)",
            border: "3px solid var(--bg)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
