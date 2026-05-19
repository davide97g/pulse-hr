import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@pulse-hr/shared/i18n";

const DAY_NAMES_IT = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const DAY_NAMES_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function exportReport(kind: "csv" | "json", view: string, period: string) {
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `pulsehr-report-${view}-${period.replace(/\s+/g, "")}-${stamp}.${kind}`;
  const payload =
    kind === "json"
      ? JSON.stringify({ view, period, generatedAt: new Date().toISOString() }, null, 2)
      : `view,period,generatedAt\n${view},${period},${new Date().toISOString()}\n`;
  const blob = new Blob([payload], {
    type: kind === "json" ? "application/json" : "text/csv",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Esportato ${filename}`);
}

type View = "overview" | "people";

const PERIODS = ["7g", "30g", "Q1", "Q2 2026", "YTD"] as const;
type Period = (typeof PERIODS)[number];

const TABS: Array<[View, string]> = [
  ["overview", "Overview"],
  ["people", "People"],
];

function seeded(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hexPath(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return "M" + pts.join("L") + "Z";
}

interface HexHoverInfo {
  x: number;
  y: number;
  initials?: string;
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryValue: string;
  primaryAccent?: boolean;
  secondaryLabel: string;
  secondaryValue: string;
}

function HexHoverCard({ hover }: { hover: HexHoverInfo }) {
  return (
    <div
      style={{
        position: "absolute",
        left: hover.x,
        top: hover.y,
        transform: "translate(-50%, calc(-100% - 14px))",
        background: "color-mix(in oklch, var(--bg-2) 92%, transparent)",
        border: "1px solid var(--line-strong)",
        borderRadius: 14,
        padding: "14px 18px",
        minWidth: 260,
        boxShadow: "0 24px 48px -16px rgba(0,0,0,0.45)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        zIndex: 6,
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        {hover.initials && (
          <span className="ph-avatar ph-avatar-sm">{hover.initials}</span>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontSize: 20,
              lineHeight: 1.05,
              color: "var(--fg)",
              letterSpacing: "-0.02em",
            }}
          >
            {hover.title}
          </span>
          <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
            {hover.subtitle}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
            {hover.primaryLabel}
          </span>
          <span
            className="t-num"
            style={{
              fontSize: 28,
              lineHeight: 1,
              color: hover.primaryAccent ? "var(--spark)" : "var(--fg)",
            }}
          >
            {hover.primaryValue}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
            {hover.secondaryLabel}
          </span>
          <div
            style={{
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--fg)",
            }}
          >
            {hover.secondaryValue}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportsEditorial() {
  const [view, setView] = useState<View>("overview");
  const [period, setPeriod] = useState<Period>("Q2 2026");

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-5 min-h-full">
      <Header view={view} setView={setView} period={period} setPeriod={setPeriod} />

      <div className="flex gap-4 flex-1 min-h-0">
        <section className="flex-1 min-w-0 flex flex-col gap-3.5">
          {view === "overview" && <OverviewView />}
          {view === "people" && <PeopleDeepDive />}

          <div className="xl:hidden">
            <SignalsRecap />
          </div>
        </section>
        <div className="hidden xl:block">
          <SignalsRail />
        </div>
      </div>
    </div>
  );
}

function Header({
  view,
  setView,
  period,
  setPeriod,
}: {
  view: View;
  setView: (v: View) => void;
  period: Period;
  setPeriod: (p: Period) => void;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="flex items-baseline gap-3.5 flex-wrap">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            PEOPLE INSIGHTS · BENESSERE &amp; CRESCITA
          </span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            · 142 PERSONE · {period.toUpperCase()}
          </span>
          <span className="tag-spark">
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: 999,
                background: "var(--spark-ink)",
              }}
            />
            LIVE
          </span>
        </div>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          AGGIORNATO 2 MIN FA · 06 MAG 09:42
        </span>
      </div>

      <div className="grid items-end gap-6 grid-cols-1 lg:[grid-template-columns:1fr_auto]">
        <h1
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontWeight: 400,
            margin: 0,
            fontSize: "clamp(56px, 8vw, 88px)",
            letterSpacing: "-0.045em",
            lineHeight: 0.86,
            color: "var(--fg)",
          }}
        >
          Le <span style={{ fontStyle: "italic" }}>persone</span>
          <span style={{ color: "var(--spark)" }}>.</span>
          <span
            className="t-mono block md:inline mt-2 md:mt-0 md:ml-[18px]"
            style={{ color: "var(--muted-foreground)", verticalAlign: "middle" }}
          >
            ENGAGEMENT · SENTIMENT · CRESCITA
          </span>
        </h1>
        <div className="flex gap-2 items-center flex-wrap justify-end">
          {PERIODS.map((p) => {
            const active = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className="t-mono"
                style={{
                  background: active ? "var(--fg)" : "transparent",
                  color: active ? "var(--bg)" : "var(--muted-foreground)",
                  border: `1px solid ${active ? "var(--fg)" : "var(--line)"}`,
                  padding: "6px 12px",
                  borderRadius: 999,
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            );
          })}
          <span
            style={{
              width: 1,
              height: 22,
              background: "var(--line-strong)",
              margin: "0 4px",
            }}
          />
          <button type="button" className="pill pill-ghost pill-sm">
            ⌄ Filtri
          </button>
          <button
            type="button"
            className="pill pill-ghost pill-sm"
            onClick={() => exportReport("csv", view, period)}
          >
            ↧ CSV
          </button>
          <button
            type="button"
            className="pill pill-spark pill-sm"
            onClick={() => exportReport("json", view, period)}
          >
            ↧ Report <span className="arr">→</span>
          </button>
        </div>
      </div>

      <div
        className="flex"
        style={{
          borderTop: "1px solid var(--line-strong)",
          borderBottom: "1px solid var(--line)",
          marginTop: 6,
        }}
      >
        {TABS.map(([id, label], i) => {
          const active = view === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "12px 18px",
                fontFamily: "Inter, sans-serif",
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                color: active ? "var(--fg)" : "var(--muted-foreground)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span className="t-mono-sm" style={{ opacity: 0.6 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {label}
              {active && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "var(--spark)",
                    boxShadow: "0 0 8px var(--spark)",
                  }}
                />
              )}
            </button>
          );
        })}
        <span style={{ flex: 1 }} />
        <span
          className="t-mono self-center pr-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          + Nuova vista
        </span>
      </div>
    </div>
  );
}

/* ─────── OVERVIEW ─────── */

function OverviewView() {
  return (
    <>
      <KpiRow />
      <div className="grid gap-3.5 flex-1 min-h-0 grid-cols-1 lg:[grid-template-columns:1.5fr_1fr]">
        <PulseHexPanel />
        <RetentionFunnel />
      </div>
      <DeepDiveStrip />
    </>
  );
}

/* KPI tiles */

function makeSpark(n: number, start: number, end: number) {
  const rand = seeded(start * 7 + n);
  const pts: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = start + (end - start) * t;
    const noise = (rand() - 0.5) * (Math.abs(end - start) * 0.4);
    pts.push(base + noise);
  }
  pts[n - 1] = end;
  return pts;
}

interface KpiTileData {
  label: string;
  value: string;
  unit?: string;
  delta: string;
  deltaPos: boolean;
  sub: string;
  spark: number[];
  kind: "default" | "spark";
}

function KpiRow() {
  const tiles: KpiTileData[] = [
    {
      label: "KUDOS",
      value: "186",
      delta: "+47",
      deltaPos: true,
      sub: "questo mese · +34% vs scorso",
      spark: makeSpark(12, 110, 186),
      kind: "spark",
    },
    {
      label: "ENPS",
      value: "+42",
      delta: "+5",
      deltaPos: true,
      sub: "survey aprile · 87% risp.",
      spark: makeSpark(12, 30, 42),
      kind: "default",
    },
    {
      label: "GROWTH",
      value: "63",
      delta: "+12",
      deltaPos: true,
      sub: "obiettivi attivi · 78% on-track",
      spark: makeSpark(12, 48, 63),
      kind: "default",
    },
    {
      label: "PULSE",
      value: "4.1",
      unit: "/5",
      delta: "+0.3",
      deltaPos: true,
      sub: "mood medio · trend in salita",
      spark: makeSpark(12, 3.6, 4.1),
      kind: "default",
    },
  ];
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
      {tiles.map((t, i) => (
        <KpiTile key={i} {...t} />
      ))}
    </div>
  );
}

function KpiTile({ label, value, unit, delta, deltaPos, sub, spark, kind }: KpiTileData) {
  const isSpark = kind === "spark";
  const sparkColor = isSpark ? "var(--spark)" : "var(--fg-2)";
  return (
    <div
      style={{
        border: `1px solid ${isSpark ? "var(--spark)" : "var(--line)"}`,
        borderRadius: 16,
        padding: "16px 18px 14px",
        background: isSpark
          ? "color-mix(in oklch, var(--spark) 6%, transparent)"
          : "var(--bg-2)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="flex justify-between items-baseline">
        <span
          className="t-mono"
          style={{ color: isSpark ? "var(--spark)" : "var(--muted-foreground)" }}
        >
          {label}
        </span>
        <span
          className="t-mono-sm inline-flex items-center gap-0.5"
          style={{ color: deltaPos ? "var(--spark)" : "var(--fg-2)" }}
        >
          {deltaPos ? "↗" : "↘"} {delta}
        </span>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span
          className="t-num"
          style={{
            fontSize: 44,
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
            color: isSpark ? "var(--spark)" : "var(--fg)",
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="t-num"
            style={{ fontSize: 22, color: isSpark ? "var(--spark)" : "var(--fg-2)" }}
          >
            {unit}
          </span>
        )}
      </div>
      <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
        {sub}
      </span>
      <Sparkline points={spark} color={sparkColor} kind={kind} />
    </div>
  );
}

function Sparkline({
  points,
  color,
  kind,
}: {
  points: number[];
  color: string;
  kind: "default" | "spark";
}) {
  const W = 220;
  const H = 30;
  const P = 1;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const x = (i: number) => P + (W - 2 * P) * (i / (points.length - 1));
  const y = (v: number) => P + (H - 2 * P) * (1 - (v - min) / span);
  const d = points
    .map((v, i) => `${i ? "L" : "M"} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`)
    .join(" ");
  const fillD = `${d} L ${x(points.length - 1)} ${H} L ${x(0)} ${H} Z`;
  const lastX = x(points.length - 1);
  const lastY = y(points[points.length - 1]);
  const gradId = `spk-${kind}-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ marginTop: 4 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradId})`} />
      <path
        d={d}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
      {kind === "spark" && (
        <circle cx={lastX} cy={lastY} r="6" fill="none" stroke={color} strokeWidth="1" opacity="0.45" />
      )}
    </svg>
  );
}

/* Hero hex pulse */

function PulseHexPanel() {
  const { locale } = useI18n();
  const DAY_NAMES = locale === "it" ? DAY_NAMES_IT : DAY_NAMES_EN;
  const weekendLabel = locale === "it" ? "WEEKEND" : "WEEKEND";
  const holidayLabel = locale === "it" ? "FESTIVITÀ" : "HOLIDAY";
  const standardLabel = locale === "it" ? "GIORNATA STANDARD" : "STANDARD DAY";
  const presenceLabel = locale === "it" ? "PRESENZA" : "PRESENCE";
  const onSiteLabel = locale === "it" ? "IN AZIENDA" : "ON SITE";
  const closedLabel = locale === "it" ? "chiuso" : "closed";
  const weekLabel = locale === "it" ? "Settimana" : "Week";
  const days = useMemo(() => {
    const rand = seeded(42);
    const out: Array<{ w: number; d: number; presence: number; holiday: boolean; weekend: boolean; headcount: number }> = [];
    const WEEKS = 12;
    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < 7; d++) {
        const weekend = d >= 5;
        const presence = weekend ? 0.05 + rand() * 0.08 : 0.7 + rand() * 0.28;
        const isHoliday = (w === 5 && d === 0) || (w === 8 && d === 4);
        const eff = isHoliday ? 0 : presence;
        out.push({
          w,
          d,
          presence: eff,
          holiday: isHoliday,
          weekend,
          headcount: Math.round(eff * 142),
        });
      }
    }
    return out;
  }, []);

  const [hover, setHover] = useState<(HexHoverInfo & { key: string }) | null>(null);

  // Pointy-top hexes, axial-style honeycomb stagger (matches Constellation feel).
  // Day rows are aligned in y; adjacent rows offset by HEX_W/2 to tessellate.
  const SIZE = 14;
  const HEX_W = SIZE * Math.sqrt(3);
  const HEX_H = SIZE * 2;
  const ROW_PITCH = HEX_H * 0.75 + 2; // 3/4 height + gap, like Constellation
  const COL_PITCH = HEX_W + 1.5;
  const LABEL_PAD_X = 22;
  const LABEL_PAD_Y = 18;
  const WEEKS = 12;
  const ROWS = 7;

  const cellFill = (p: { holiday: boolean; weekend: boolean; presence: number }) => {
    if (p.holiday) return "color-mix(in oklch, var(--fg) 18%, transparent)";
    if (p.weekend) return "color-mix(in oklch, var(--fg) 8%, transparent)";
    if (p.presence > 0.92) return "var(--spark)";
    if (p.presence > 0.85) return "color-mix(in oklch, var(--spark) 80%, var(--fg) 20%)";
    if (p.presence > 0.78) return "color-mix(in oklch, var(--spark) 50%, var(--fg) 50%)";
    return "color-mix(in oklch, var(--spark) 22%, var(--fg) 30%)";
  };

  const hexX = (w: number, d: number) =>
    LABEL_PAD_X + COL_PITCH * w + (d % 2) * (COL_PITCH / 2) + HEX_W / 2;
  const hexY = (d: number) => ROW_PITCH * d + HEX_H / 2;

  const vbW = LABEL_PAD_X + COL_PITCH * WEEKS + COL_PITCH / 2 + 6;
  const vbH = ROW_PITCH * (ROWS - 1) + HEX_H + LABEL_PAD_Y;

  return (
    <section
      className="rounded-[18px] flex flex-col gap-3 min-h-0 relative overflow-hidden"
      style={{
        background: "color-mix(in oklch, var(--bg-2) 70%, var(--background))",
        border: "1px solid var(--line)",
        padding: "20px 22px",
      }}
    >
      <div className="flex justify-between items-baseline flex-wrap gap-2">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            BATTITO · 12 SETTIMANE
          </span>
          <h2
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 32,
              letterSpacing: "-0.025em",
              margin: "4px 0 0",
              color: "var(--fg)",
            }}
          >
            Il polso dell'azienda.
          </h2>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="t-num"
            style={{
              fontSize: 56,
              lineHeight: 0.9,
              color: "var(--spark)",
              letterSpacing: "-0.04em",
            }}
          >
            89.4
          </span>
          <span className="t-num" style={{ fontSize: 22, color: "var(--fg-2)" }}>
            %
          </span>
          <span className="t-mono ml-2" style={{ color: "var(--muted-foreground)" }}>
            PRESENZA MEDIA
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex items-center relative">
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", height: "100%", minHeight: 220 }}
        >
          <defs>
            <radialGradient id="hex-glow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="var(--spark)" stopOpacity="0.45" />
              <stop offset="60%" stopColor="var(--spark)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={hexX(9, 3)} cy={hexY(3)} r={70} fill="url(#hex-glow)" />
          {["L", "M", "M", "G", "V", "S", "D"].map((dl, i) => (
            <text
              key={i}
              x={LABEL_PAD_X - 14}
              y={hexY(i) + 3}
              fontFamily="JetBrains Mono"
              fontSize="9"
              fontWeight="600"
              fill="var(--muted-foreground)"
              textAnchor="middle"
            >
              {dl}
            </text>
          ))}
          {days.map((p, i) => {
            const key = `${p.w}-${p.d}`;
            const isHovered = hover?.key === key;
            return (
              <path
                key={i}
                d={hexPath(hexX(p.w, p.d), hexY(p.d), SIZE)}
                fill={cellFill(p)}
                stroke={
                  isHovered || p.presence > 0.92
                    ? "var(--spark)"
                    : "color-mix(in oklch, var(--background) 60%, transparent)"
                }
                strokeWidth={isHovered ? 1.4 : p.presence > 0.92 ? 0.8 : 0.6}
                style={{ cursor: "pointer", transition: "stroke-width 120ms" }}
                onMouseEnter={() => {
                  const xPct = (hexX(p.w, p.d) / vbW) * 100;
                  const yPct = (hexY(p.d) / vbH) * 100;
                  setHover({
                    key,
                    x: xPct,
                    y: yPct,
                    title: `${weekLabel} ${p.w + 11}`,
                    subtitle: `${DAY_NAMES[p.d].toUpperCase()} · ${
                      p.holiday ? holidayLabel : p.weekend ? weekendLabel : standardLabel
                    }`,
                    primaryLabel: presenceLabel,
                    primaryValue: p.holiday ? "—" : `${Math.round(p.presence * 100)}%`,
                    primaryAccent: !p.holiday && p.presence > 0.85,
                    secondaryLabel: onSiteLabel,
                    secondaryValue: p.holiday ? closedLabel : `${p.headcount} / 142`,
                  });
                }}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
          {[0, 3, 6, 9, 11].map((w) => (
            <text
              key={w}
              x={hexX(w, 0)}
              y={vbH - 4}
              fontFamily="JetBrains Mono"
              fontSize="9"
              fontWeight="600"
              fill="var(--muted-foreground)"
              textAnchor="middle"
            >
              W{w + 11}
            </text>
          ))}
        </svg>
        {hover && (
          <div
            style={{
              position: "absolute",
              left: `${hover.x}%`,
              top: `${hover.y}%`,
              width: 1,
              height: 1,
              pointerEvents: "none",
            }}
          >
            <HexHoverCard hover={{ ...hover, x: 0, y: 0 }} />
          </div>
        )}
      </div>

      <div
        className="flex items-end justify-between gap-4 flex-wrap"
        style={{ paddingTop: 8, borderTop: "1px solid var(--line)" }}
      >
        <p
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 15,
            color: "var(--fg-2)",
            margin: 0,
            maxWidth: 480,
            lineHeight: 1.4,
          }}
        >
          {locale === "it" ? (
            <>
              Settimana 17 al picco con <span className="spark-mark">93% di presenza</span>.
              Due festività ridotte e weekend stabili: il ritmo è in linea col target.
            </>
          ) : (
            <>
              Week 17 peaks at <span className="spark-mark">93% presence</span>. Two short
              holidays and steady weekends — pace is on target.
            </>
          )}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            ["color-mix(in oklch, var(--spark) 22%, var(--fg) 30%)", "<78"],
            ["color-mix(in oklch, var(--spark) 80%, var(--fg) 20%)", "85"],
            ["var(--spark)", "92+"],
          ].map(([bg, lbl]) => (
            <div key={lbl} className="flex items-center gap-1">
              <span style={{ width: 10, height: 10, borderRadius: 2, background: bg }} />
              <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
                {lbl}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Retention funnel */

function RetentionFunnel() {
  const months = [
    { m: "M0", pct: 100 },
    { m: "M1", pct: 98 },
    { m: "M3", pct: 94 },
    { m: "M6", pct: 91 },
    { m: "M9", pct: 87 },
    { m: "M12", pct: 84 },
  ];
  return (
    <section
      className="rounded-[18px] flex flex-col gap-2.5 flex-1 min-h-0"
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--line)",
        padding: "16px 18px 14px",
      }}
    >
      <div className="flex justify-between items-baseline gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            RETENTION COORTE 2025
          </span>
          <div
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              letterSpacing: "-0.02em",
              color: "var(--fg)",
              marginTop: 2,
            }}
          >
            Chi resta, e per quanto.
          </div>
        </div>
        <div className="text-right">
          <span
            className="t-num"
            style={{ fontSize: 28, color: "var(--spark)", letterSpacing: "-0.03em" }}
          >
            84%
          </span>
          <div className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
            A 12 MESI · BENCHMARK 76%
          </div>
        </div>
      </div>

      <div className="flex items-end gap-2 flex-1 min-h-[120px]" style={{ paddingTop: 8 }}>
        {months.map((m, i) => {
          const accent = i === months.length - 1;
          return (
            <div key={m.m} className="flex-1 flex flex-col gap-1.5 h-full">
              <div className="flex-1 flex items-end min-h-0">
                <div
                  style={{
                    width: "100%",
                    height: `${m.pct}%`,
                    background: accent
                      ? "var(--spark)"
                      : "color-mix(in oklch, var(--spark) 28%, var(--fg) 30%)",
                    borderRadius: "4px 4px 0 0",
                    position: "relative",
                    boxShadow: accent
                      ? "0 0 16px color-mix(in oklch, var(--spark) 40%, transparent)"
                      : "none",
                  }}
                >
                  <span
                    className="t-num"
                    style={{
                      position: "absolute",
                      top: -22,
                      left: 0,
                      right: 0,
                      textAlign: "center",
                      fontSize: 14,
                      color: accent ? "var(--spark)" : "var(--fg-2)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {m.pct}%
                  </span>
                </div>
              </div>
              <span
                className="t-mono-sm text-center"
                style={{ color: "var(--muted-foreground)" }}
              >
                {m.m}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* Deep dive teasers */

function DeepDiveStrip() {
  const { locale } = useI18n();
  const dives: Array<{
    id: string;
    eyebrow: string;
    title: string;
    stat: string;
    sub: string;
    kind: "default" | "spark" | "warn";
  }> = locale === "it"
    ? [
        {
          id: "diversity",
          eyebrow: "01 · DIVERSITÀ",
          title: "Equilibrio",
          stat: "47 / 53",
          sub: "donne / uomini · gap salariale 2.1%",
          kind: "default",
        },
        {
          id: "tenure",
          eyebrow: "02 · ANZIANITÀ",
          title: "Anni con noi",
          stat: "3.4",
          sub: "mediana · 12 oltre i 5 anni",
          kind: "default",
        },
        {
          id: "kudos",
          eyebrow: "03 · KUDOS",
          title: "Grazie ricevute",
          stat: "186",
          sub: "questo mese · ENG in testa con 22",
          kind: "spark",
        },
        {
          id: "pulse",
          eyebrow: "04 · BURNOUT",
          title: "Segnali",
          stat: "9",
          sub: "persone su carico >100% da 3+ settimane",
          kind: "warn",
        },
      ]
    : [
        {
          id: "diversity",
          eyebrow: "01 · DIVERSITY",
          title: "Balance",
          stat: "47 / 53",
          sub: "women / men · 2.1% pay gap",
          kind: "default",
        },
        {
          id: "tenure",
          eyebrow: "02 · TENURE",
          title: "Years with us",
          stat: "3.4",
          sub: "median · 12 past the 5-year mark",
          kind: "default",
        },
        {
          id: "kudos",
          eyebrow: "03 · KUDOS",
          title: "Thanks received",
          stat: "186",
          sub: "this month · ENG leads with 22",
          kind: "spark",
        },
        {
          id: "pulse",
          eyebrow: "04 · BURNOUT",
          title: "Signals",
          stat: "9",
          sub: "people over 100% load for 3+ weeks",
          kind: "warn",
        },
      ];
  const borderFor = (k: typeof dives[0]["kind"]) =>
    k === "spark" ? "var(--spark)" : k === "warn" ? "var(--destructive)" : "var(--line)";
  const bgFor = (k: typeof dives[0]["kind"]) =>
    k === "spark" ? "color-mix(in oklch, var(--spark) 8%, transparent)" : "var(--bg-2)";
  const statColor = (k: typeof dives[0]["kind"]) =>
    k === "spark" ? "var(--spark)" : k === "warn" ? "var(--destructive)" : "var(--fg)";

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {dives.map((d) => (
        <button
          key={d.id}
          type="button"
          className="press-scale text-left"
          style={{
            background: bgFor(d.kind),
            border: `1px solid ${borderFor(d.kind)}`,
            borderRadius: 14,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
            color: "inherit",
          }}
        >
          <span
            className="t-num"
            style={{
              fontSize: 32,
              letterSpacing: "-0.03em",
              color: statColor(d.kind),
              lineHeight: 1,
              flexShrink: 0,
              minWidth: 70,
            }}
          >
            {d.stat}
          </span>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
              {d.eyebrow}
            </span>
            <span
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 16,
                color: "var(--fg)",
                letterSpacing: "-0.02em",
              }}
            >
              {d.title}
            </span>
            <span
              className="t-mono-sm truncate"
              style={{ color: "var(--muted-foreground)" }}
            >
              {d.sub}
            </span>
          </div>
          <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
            ↗
          </span>
        </button>
      ))}
    </div>
  );
}

/* Signals — shared data + responsive layouts */

interface Signal {
  kind: "warn" | "good" | "neutral";
  eyebrow: string;
  head: string;
  body: string;
  action: string;
}

const SIGNALS: Signal[] = [
  {
    kind: "warn",
    eyebrow: "ATTENZIONE · OPS",
    head: "Tre persone ≥110% da 4 settimane",
    body: "Marta E., Sara F., Chiara R. su PHR-204. Programmare 1-on-1 entro venerdì.",
    action: "Apri saturation",
  },
  {
    kind: "good",
    eyebrow: "POSITIVO · KUDOS",
    head: "+47 kudos questo mese",
    body: "Engineering domina con 22 grazie. Picco lunedì dopo la demo.",
    action: "Apri Kudos",
  },
  {
    kind: "neutral",
    eyebrow: "DA APPROVARE",
    head: "8 richieste ferie aperte",
    body: "3 sono per la stessa settimana di luglio. Verifica copertura.",
    action: "Vai a Riposo",
  },
  {
    kind: "good",
    eyebrow: "GROWTH · CRESCITA",
    head: "14 obiettivi chiusi in Q2",
    body: "Design e Engineering già sopra il target trimestrale. Tre review aperte.",
    action: "Apri Growth",
  },
];

const signalAccent = (k: Signal["kind"]) =>
  k === "warn" ? "var(--destructive)" : k === "good" ? "var(--spark)" : "var(--line-strong)";

const signalEyebrowColor = (k: Signal["kind"]) =>
  k === "warn"
    ? "var(--destructive)"
    : k === "good"
      ? "var(--spark)"
      : "var(--muted-foreground)";

function SignalCard({ s, compact = false }: { s: Signal; compact?: boolean }) {
  return (
    <div
      className="flex flex-col gap-1.5"
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--line)",
        borderLeft: `3px solid ${signalAccent(s.kind)}`,
        borderRadius: "4px 14px 14px 4px",
        padding: compact ? "10px 12px" : "12px 14px",
      }}
    >
      <span
        className="t-mono-sm"
        style={{ color: signalEyebrowColor(s.kind), fontWeight: 700 }}
      >
        {s.eyebrow}
      </span>
      <span
        style={{
          fontFamily: "Fraunces, ui-serif, serif",
          fontSize: compact ? 16 : 17,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          color: "var(--fg)",
        }}
      >
        {s.head}
      </span>
      <span style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.4 }}>{s.body}</span>
      <span
        className="t-mono-sm inline-flex items-center gap-1 mt-0.5"
        style={{ color: "var(--fg)" }}
      >
        {s.action} →
      </span>
    </div>
  );
}

function SignalsHeader() {
  return (
    <div className="flex items-baseline justify-between">
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        SEGNALI · DA TENERE D'OCCHIO
      </span>
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "var(--spark)",
          boxShadow: "0 0 10px color-mix(in oklch, var(--spark) 60%, transparent)",
        }}
      />
    </div>
  );
}

function SignalsRail() {
  return (
    <aside
      className="flex flex-col gap-2.5 min-h-0"
      style={{ width: 320, flexShrink: 0 }}
    >
      <SignalsHeader />
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        {SIGNALS.map((s, i) => (
          <SignalCard key={i} s={s} />
        ))}
      </div>
    </aside>
  );
}

function SignalsRecap() {
  return (
    <section className="flex flex-col gap-2.5 mt-2">
      <SignalsHeader />
      <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {SIGNALS.map((s, i) => (
          <SignalCard key={i} s={s} compact />
        ))}
      </div>
    </section>
  );
}

/* ─────── PEOPLE DEEP DIVE ─────── */

function PeopleDeepDive() {
  const tiles: Array<[string, string, string]> = [
    ["DONNE", "47%", "+2 pt YoY"],
    ["ANZIANITÀ MEDIA", "3.4 a", "+0.3 vs Q1"],
    ["1-ON-1 PUNTUALI", "82%", "−4 pt · da migliorare"],
  ];
  return (
    <>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        {tiles.map(([l, v, s]) => (
          <PlainKpi key={l} label={l} value={v} sub={s} />
        ))}
      </div>
      <DiversityHexes />
    </>
  );
}

function PlainKpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: "12px 14px",
        background: "var(--bg-2)",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div
        className="t-num"
        style={{
          fontSize: 32,
          color: "var(--fg)",
          letterSpacing: "-0.03em",
          marginTop: 2,
        }}
      >
        {value}
      </div>
      <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
        {sub}
      </span>
    </div>
  );
}

const FIRST_F = ["Greta", "Marta", "Sara", "Chiara", "Lucia", "Anna", "Giulia", "Elena", "Sofia", "Aurora", "Beatrice", "Paola"];
const FIRST_M = ["Marco", "Luca", "Davide", "Andrea", "Giovanni", "Stefano", "Matteo", "Federico", "Roberto", "Alessandro", "Tommaso", "Riccardo"];
const FIRST_X = ["Sam", "Alex", "Robin", "Jules"];
const LAST = ["Marchetti", "Rossi", "Conti", "Bianchi", "Romano", "Greco", "Esposito", "Ferrari", "Russo", "Bruno", "Costa", "Galli"];
const ROLES = ["Tech Lead", "Senior Eng", "Designer", "PM", "People Ops", "Recruiter", "Account", "Finance", "Data Eng", "Marketing"];
const DEPTS = ["ENG", "DSG", "PRD", "OPS", "FIN", "MKT", "SAL"];
const SAT_LABELS_IT = ["Saturazione", "Tenure", "Kudos M", "1-on-1"];
const SAT_LABELS_EN = ["Saturation", "Tenure", "Kudos M", "1-on-1"];

function DiversityHexes() {
  const { locale } = useI18n();
  const SAT_LABELS = locale === "it" ? SAT_LABELS_IT : SAT_LABELS_EN;
  const cells = useMemo(() => {
    const rand = seeded(91);
    const total = 142;
    const groups = [
      { id: "F" as const, n: Math.round(total * 0.47), color: "var(--spark)" },
      {
        id: "M" as const,
        n: Math.round(total * 0.5),
        color: "color-mix(in oklch, var(--spark) 25%, var(--fg) 35%)",
      },
      {
        id: "X" as const,
        n: 4,
        color: "color-mix(in oklch, var(--spark) 60%, var(--fg) 40%)",
      },
    ];
    const out: Array<{
      idx: number;
      group: "F" | "M" | "X";
      color: string;
      first: string;
      last: string;
      role: string;
      dept: string;
      sat: number;
      tenure: number;
    }> = [];
    let i = 0;
    for (const g of groups) {
      const pool = g.id === "F" ? FIRST_F : g.id === "M" ? FIRST_M : FIRST_X;
      for (let k = 0; k < g.n; k++) {
        out.push({
          idx: i++,
          group: g.id,
          color: g.color,
          first: pool[Math.floor(rand() * pool.length)],
          last: LAST[Math.floor(rand() * LAST.length)],
          role: ROLES[Math.floor(rand() * ROLES.length)],
          dept: DEPTS[Math.floor(rand() * DEPTS.length)],
          sat: 0.55 + rand() * 0.55,
          tenure: 0.5 + rand() * 9,
        });
      }
    }
    for (let s = 0; s < 3; s++) {
      for (let k = out.length - 1; k > 0; k--) {
        const j = Math.floor(rand() * (k + 1));
        [out[k], out[j]] = [out[j], out[k]];
      }
    }
    return out;
  }, []);

  const [hover, setHover] = useState<(HexHoverInfo & { key: number }) | null>(null);

  const COLS = 18;
  const SIZE = 13;
  const HEX_W = SIZE * Math.sqrt(3);
  const HEX_H = SIZE * 2;
  const ROW_PITCH = HEX_H * 0.75 + 2;
  const COL_PITCH = HEX_W + 1.5;
  const ROWS = Math.ceil(142 / COLS);

  return (
    <section
      className="rounded-[18px] flex flex-col gap-3 min-h-0"
      style={{
        background: "color-mix(in oklch, var(--bg-2) 70%, var(--background))",
        border: "1px solid var(--line)",
        padding: "20px 22px",
      }}
    >
      <div>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {locale === "it" ? "COMPOSIZIONE · 142 PERSONE" : "COMPOSITION · 142 PEOPLE"}
        </span>
        <h2
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 30,
            letterSpacing: "-0.025em",
            margin: "4px 0 0",
            color: "var(--fg)",
          }}
        >
          {locale === "it" ? "Una persona, un esagono." : "One person, one hexagon."}
        </h2>
      </div>
      <div className="flex-1 min-h-0 flex items-center relative">
        {(() => {
          const vbW = COLS * COL_PITCH + COL_PITCH / 2;
          const vbH = ROW_PITCH * (ROWS - 1) + HEX_H + 4;
          return (
            <>
              <svg
                viewBox={`0 0 ${vbW} ${vbH}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ width: "100%", height: "100%", minHeight: 220 }}
              >
                {cells.slice(0, 142).map((c, i) => {
                  const row = Math.floor(i / COLS);
                  const col = i % COLS;
                  const x = col * COL_PITCH + (row % 2) * (COL_PITCH / 2) + HEX_W / 2;
                  const y = row * ROW_PITCH + HEX_H / 2;
                  const isHovered = hover?.key === i;
                  return (
                    <path
                      key={i}
                      d={hexPath(x, y, SIZE)}
                      fill={c.color}
                      stroke={
                        isHovered || c.group === "F"
                          ? "var(--spark)"
                          : "color-mix(in oklch, var(--background) 60%, transparent)"
                      }
                      strokeWidth={isHovered ? 1.6 : c.group === "F" ? 0.8 : 0.6}
                      style={{ cursor: "pointer", transition: "stroke-width 120ms" }}
                      onMouseEnter={() => {
                        const initials = (c.first[0] + c.last[0]).toUpperCase();
                        const groupLabel =
                          locale === "it"
                            ? c.group === "F"
                              ? "Donne"
                              : c.group === "M"
                                ? "Uomini"
                                : "Non binari"
                            : c.group === "F"
                              ? "Women"
                              : c.group === "M"
                                ? "Men"
                                : "Non-binary";
                        setHover({
                          key: i,
                          x: (x / vbW) * 100,
                          y: (y / vbH) * 100,
                          initials,
                          title: `${c.first} ${c.last}`,
                          subtitle: `${c.role.toUpperCase()} · ${c.dept}`,
                          primaryLabel: SAT_LABELS[0].toUpperCase(),
                          primaryValue: `${Math.round(c.sat * 100)}%`,
                          primaryAccent: c.sat > 0.95,
                          secondaryLabel: groupLabel.toUpperCase(),
                          secondaryValue: `${c.tenure.toFixed(1)} ${locale === "it" ? "anni" : "yrs"}`,
                        });
                      }}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
              </svg>
              {hover && (
                <div
                  style={{
                    position: "absolute",
                    left: `${hover.x}%`,
                    top: `${hover.y}%`,
                    width: 1,
                    height: 1,
                    pointerEvents: "none",
                  }}
                >
                  <HexHoverCard hover={{ ...hover, x: 0, y: 0 }} />
                </div>
              )}
            </>
          );
        })()}
      </div>
      <div
        className="flex gap-4 flex-wrap"
        style={{ paddingTop: 8, borderTop: "1px solid var(--line)" }}
      >
        {[
          { c: "var(--spark)", l: "Donne · 67", v: "47%" },
          {
            c: "color-mix(in oklch, var(--spark) 25%, var(--fg) 35%)",
            l: "Uomini · 71",
            v: "50%",
          },
          {
            c: "color-mix(in oklch, var(--spark) 60%, var(--fg) 40%)",
            l: "Non binari · 4",
            v: "3%",
          },
        ].map((g) => (
          <div key={g.l} className="flex items-center gap-2">
            <span style={{ width: 12, height: 12, borderRadius: 2, background: g.c }} />
            <div className="flex flex-col">
              <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
                {g.l}
              </span>
              <span className="t-num" style={{ fontSize: 16, color: "var(--fg)" }}>
                {g.v}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────── TIME DEEP DIVE ─────── */

const TIME_HOURS = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];
const TIME_DAYS = ["LUN", "MAR", "MER", "GIO", "VEN"];


function TimeDeepDive() {
  const tiles: Array<[string, string, string]> = [
    ["ORE LAVORATE", "21,460", "settimana 19"],
    ["MEDIA / PERSONA", "38.4 h", "su 40 target"],
    ["STRAORDINARI", "742 h", "3.4% · in calo"],
    ["SATURAZIONE", "78%", "9 oltre soglia"],
  ];
  return (
    <>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {tiles.map(([l, v, s]) => (
          <PlainKpi key={l} label={l} value={v} sub={s} />
        ))}
      </div>
      <div className="grid gap-3.5 flex-1 min-h-0 grid-cols-1 lg:[grid-template-columns:1.4fr_1fr]">
        <AttendanceHeatmap />
        <ProjectAllocation />
      </div>
    </>
  );
}

function AttendanceHeatmap() {
  const data = useMemo(() => {
    const rand = seeded(31);
    return TIME_DAYS.map((_d, di) =>
      TIME_HOURS.map((_h, hi) => {
        const isLunch = hi === 4 || hi === 5;
        const isPeak = (hi >= 1 && hi <= 3) || (hi >= 6 && hi <= 9);
        let base = isLunch ? 0.3 : isPeak ? 0.8 : 0.5;
        base += (rand() - 0.5) * 0.3;
        if (di === 4 && hi >= 9) base *= 0.4;
        return Math.max(0, Math.min(1, base));
      }),
    );
  }, []);
  const fill = (v: number) => {
    if (v > 0.85) return "var(--spark)";
    if (v > 0.7) return "color-mix(in oklch, var(--spark) 55%, var(--fg) 30%)";
    if (v > 0.5) return "color-mix(in oklch, var(--spark) 28%, var(--fg) 30%)";
    if (v > 0.3) return "color-mix(in oklch, var(--fg) 12%, transparent)";
    return "color-mix(in oklch, var(--fg) 6%, transparent)";
  };

  return (
    <section
      className="rounded-[18px] flex flex-col gap-3 min-h-0"
      style={{
        background: "color-mix(in oklch, var(--bg-2) 70%, var(--background))",
        border: "1px solid var(--line)",
        padding: "20px 22px",
      }}
    >
      <div>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          QUANDO LAVORIAMO · ULTIME 4 SETTIMANE
        </span>
        <h2
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 30,
            letterSpacing: "-0.025em",
            margin: "4px 0 0",
            color: "var(--fg)",
          }}
        >
          La forma del giorno.
        </h2>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-1.5">
        <div className="grid gap-1" style={{ gridTemplateColumns: "40px repeat(12, 1fr)" }}>
          <span />
          {TIME_HOURS.map((h) => (
            <span
              key={h}
              className="t-mono-sm text-center"
              style={{ color: "var(--muted-foreground)" }}
            >
              {h}
            </span>
          ))}
        </div>
        {data.map((row, di) => (
          <div
            key={TIME_DAYS[di]}
            className="grid gap-1 flex-1 min-h-0"
            style={{ gridTemplateColumns: "40px repeat(12, 1fr)" }}
          >
            <span
              className="t-mono self-center"
              style={{ color: "var(--muted-foreground)" }}
            >
              {TIME_DAYS[di]}
            </span>
            {row.map((v, hi) => (
              <div
                key={hi}
                title={`${TIME_HOURS[hi]}:00 · ${Math.round(v * 100)}%`}
                style={{
                  background: fill(v),
                  borderRadius: 4,
                  border: `1px solid ${v > 0.85 ? "var(--spark)" : "transparent"}`,
                  boxShadow:
                    v > 0.85
                      ? "0 0 10px color-mix(in oklch, var(--spark) 35%, transparent)"
                      : "none",
                  minHeight: 18,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <p
        style={{
          fontFamily: "Fraunces, ui-serif, serif",
          fontStyle: "italic",
          fontSize: 14,
          color: "var(--fg-2)",
          margin: 0,
          paddingTop: 8,
          borderTop: "1px solid var(--line)",
          lineHeight: 1.4,
        }}
      >
        Picco alle <span className="spark-mark">10:00</span> e secondo motore alle 15:00. Venerdì
        pomeriggio si stacca presto: la settimana respira.
      </p>
    </section>
  );
}

function ProjectAllocation() {
  const projects: Array<{
    code: string;
    name: string;
    alloc: number;
    status: "spark" | "warn" | "muted" | "default";
  }> = [
    { code: "PHR-204", name: "Acme refactor", alloc: 32, status: "spark" },
    { code: "PHR-211", name: "Fastweb portal", alloc: 18, status: "default" },
    { code: "PHR-188", name: "Banca Sella app", alloc: 14, status: "warn" },
    { code: "PHR-220", name: "ENI dashboard", alloc: 12, status: "default" },
    { code: "INT-002", name: "Internal tools", alloc: 9, status: "default" },
    { code: "INT-003", name: "Recruiting eng", alloc: 7, status: "default" },
    { code: "—", name: "Idle / formazione", alloc: 8, status: "muted" },
  ];
  const total = projects.reduce((a, p) => a + p.alloc, 0);
  const colorFor = (s: typeof projects[0]["status"]) =>
    s === "spark"
      ? "var(--spark)"
      : s === "warn"
        ? "var(--destructive)"
        : s === "muted"
          ? "color-mix(in oklch, var(--fg) 12%, transparent)"
          : "color-mix(in oklch, var(--spark) 55%, var(--fg) 30%)";

  return (
    <section
      className="rounded-[18px] flex flex-col gap-2.5 min-h-0"
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--line)",
        padding: "16px 18px",
      }}
    >
      <div>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          ALLOCAZIONE · PER COMMESSA
        </span>
        <div
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 22,
            letterSpacing: "-0.02em",
            color: "var(--fg)",
            marginTop: 2,
          }}
        >
          Su cosa stiamo.
        </div>
      </div>

      <div className="flex" style={{ height: 28, borderRadius: 6, overflow: "hidden" }}>
        {projects.map((p) => (
          <div
            key={p.code}
            title={`${p.name} · ${p.alloc} persone`}
            style={{
              width: `${(p.alloc / total) * 100}%`,
              background: colorFor(p.status),
              borderRight: "1px solid var(--background)",
            }}
          />
        ))}
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        {projects.map((p, i) => (
          <div
            key={p.code}
            className="grid gap-2 items-center"
            style={{
              gridTemplateColumns: "70px 1fr 40px 30px",
              padding: "8px 0",
              borderBottom: i === projects.length - 1 ? "none" : "1px solid var(--line)",
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {p.code}
            </span>
            <span style={{ fontSize: 13, color: "var(--fg)" }}>{p.name}</span>
            <span
              className="t-num text-right"
              style={{ fontSize: 14, color: "var(--fg)" }}
            >
              {p.alloc}
            </span>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: p.status === "muted" ? "transparent" : colorFor(p.status),
                border: p.status === "muted" ? "1px solid var(--line-strong)" : "none",
                justifySelf: "center",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

