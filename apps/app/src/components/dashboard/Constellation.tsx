import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useIsMobile } from "@pulse-hr/ui/hooks/use-mobile";
import type { ConstellationPerson, DeptId, LensConfig, MicroCardConfig } from "./types";
import { HoverCard } from "./HoverCard";
import { DeptLabel } from "./DeptLabel";
import { MicroCard } from "./MicroCard";

const SIZE = 16;
const HEX_W = SIZE * Math.sqrt(3);
const HEX_H = SIZE * 2;
const GAP = 1.4;

function ax2px(q: number, r: number) {
  return {
    x: (HEX_W + GAP) * (q + r / 2),
    y: (HEX_H * 0.75 + GAP) * r,
  };
}

function hexPath(cx: number, cy: number, radius: number) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push(`${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`);
  }
  return `M${pts.join("L")}Z`;
}

interface HoverState {
  idx: number;
  person: ConstellationPerson;
  x: number;
  y: number;
}

export interface ConstellationProps {
  people: ConstellationPerson[];
  lens: LensConfig;
  cards: MicroCardConfig[];
  dark: boolean;
  lensSwitcher?: React.ReactNode;
  deptCounts: Record<DeptId, number>;
}

export function Constellation({
  people,
  lens,
  cards,
  dark,
  lensSwitcher,
  deptCounts,
}: ConstellationProps) {
  const [hover, setHover] = useState<HoverState | null>(null);
  const [filter, setFilter] = useState<DeptId | "ALL">("ALL");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const pts = useMemo(() => people.map((p) => ax2px(p.q, p.r)), [people]);
  const deptFilters = useMemo<Array<DeptId | "ALL">>(() => {
    const present = (Object.entries(deptCounts) as Array<[DeptId, number]>)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => id);
    return ["ALL", ...present];
  }, [deptCounts]);
  const spawnKey = lens.id;
  const spawnDelays = useMemo(
    () => people.map(() => Math.random() * 1500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spawnKey, people.length],
  );
  const bounds = useMemo(() => {
    if (!pts.length) return { minX: 0, minY: 0, vbW: 100, vbH: 100 };
    const minX = Math.min(...pts.map((p) => p.x)) - SIZE;
    const maxX = Math.max(...pts.map((p) => p.x)) + SIZE;
    const minY = Math.min(...pts.map((p) => p.y)) - SIZE;
    const maxY = Math.max(...pts.map((p) => p.y)) + SIZE;
    return { minX, minY, vbW: maxX - minX, vbH: maxY - minY };
  }, [pts]);

  const triad = lens.statTriad(people);

  return (
    <div
      className="flex flex-col gap-3 lg:flex-row lg:gap-5 min-h-0"
      style={{ flex: 1 }}
    >
      {/* 75% — main stage */}
      <section
        className="flex flex-col gap-3.5 min-h-0"
        style={{ flex: "1 1 75%", minWidth: 0 }}
      >
        {/* Eyebrow + filter pills */}
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div className="flex items-baseline gap-3 flex-wrap">
            {lensSwitcher}
          </div>
          <div className="flex gap-2">
            {deptFilters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="t-mono"
                style={{
                  background: filter === f ? "var(--fg)" : "transparent",
                  color: filter === f ? "var(--bg)" : "var(--muted-foreground)",
                  border: `1px solid ${filter === f ? "var(--fg)" : "var(--line)"}`,
                  padding: "5px 10px",
                  borderRadius: 999,
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <h1
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontSize: "clamp(40px, 5vw, 64px)",
            fontWeight: 400,
            lineHeight: 0.92,
            letterSpacing: "-0.035em",
            margin: 0,
            color: "var(--fg)",
          }}
        >
          {lens.headline[0]}
          <span style={{ fontStyle: "italic" }}>{lens.headline[1]}</span>
          <span style={{ color: "var(--spark)" }}>{lens.headline[2]}</span>
          <span
            className="t-mono"
            style={{
              marginLeft: 18,
              color: "var(--muted-foreground)",
              verticalAlign: "middle",
            }}
          >
            {lens.captionMono}
          </span>
        </h1>

        {/* Stage */}
        <div
          style={{
            position: "relative",
            flex: 1,
            background: dark ? "var(--sidebar)" : "#fafaf6",
            border: "1px solid var(--line)",
            borderRadius: 22,
            overflow: "hidden",
            minHeight: isMobile ? 560 : 480,
          }}
        >
          {/* KPI top-left */}
          <div
            style={{
              position: "absolute",
              top: isMobile ? 14 : 22,
              left: isMobile ? 16 : 26,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              zIndex: 4,
              maxWidth: isMobile ? "calc(100% - 32px)" : undefined,
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {lens.kpiLabel}
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span
                className="t-num"
                style={{
                  fontSize: isMobile ? 64 : 96,
                  lineHeight: 0.85,
                  letterSpacing: "-0.04em",
                  color: "var(--spark)",
                }}
              >
                {lens.kpiValue(people)}
              </span>
              <span className="t-num" style={{ fontSize: isMobile ? 20 : 28, color: "var(--fg)" }}>
                {lens.kpiSuffix}
              </span>
            </div>
            <div style={{ display: "flex", gap: isMobile ? 10 : 14, marginTop: 6, flexWrap: "wrap" }}>
              {triad.map(([label, value, accent], i) => (
                <Stat key={i} label={label} value={value} accent={accent} />
              ))}
            </div>
          </div>

          {/* Legend top-right (hidden on mobile — collides with KPI; legend re-emerges via bottom narrative) */}
          <div
            style={{
              position: "absolute",
              top: 22,
              right: 26,
              zIndex: 4,
              display: isMobile ? "none" : "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "flex-end",
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {lens.legendLabel}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid var(--line)",
                borderRadius: 999,
                padding: "6px 12px",
                background: dark ? "rgba(20,18,14,.6)" : "rgba(255,255,255,.6)",
                backdropFilter: "blur(12px)",
                gap: 0,
              }}
            >
              {lens.legend.map((entry, i) => {
                const last = i === lens.legend.length - 1;
                const [key, label] = entry;
                const item = lens.legendItem(key);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginRight: last ? 0 : 10,
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        background: item.bg,
                        boxShadow: item.glow ? "0 0 8px var(--spark)" : "none",
                      }}
                    />
                    <span
                      className="t-mono-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SVG */}
          <svg
            viewBox={`${bounds.minX} ${bounds.minY} ${bounds.vbW} ${bounds.vbH}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              padding: isMobile ? "180px 18px 140px" : "120px 60px 80px",
              boxSizing: "border-box",
            }}
          >
            <defs>
              <radialGradient id="glow-spark" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#b4ff39" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#b4ff39" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glow-warn" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#ff6a3d" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#ff6a3d" stopOpacity="0" />
              </radialGradient>
              <filter id="spark-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern
                id="hatch-noresp"
                patternUnits="userSpaceOnUse"
                width="4"
                height="4"
                patternTransform="rotate(45)"
              >
                <rect width="4" height="4" fill={dark ? "#1a1814" : "#e6e3da"} />
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="4"
                  stroke={dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            {people.filter(lens.glow).slice(0, 8).map((p, i) => {
              const { x, y } = ax2px(p.q, p.r);
              const warn = lens.id === "sentiment";
              return (
                <circle
                  key={`g-${i}`}
                  cx={x}
                  cy={y}
                  r={70}
                  fill={warn ? "url(#glow-warn)" : "url(#glow-spark)"}
                />
              );
            })}

            {people.map((p, i) => {
              const { x, y } = ax2px(p.q, p.r);
              const dim = filter !== "ALL" && p.dept !== filter;
              const isHover = hover?.idx === i;
              const path = hexPath(x, y, SIZE);
              const noResp = lens.id === "sentiment" && !p.surveyResponded;
              const fill = noResp ? "url(#hatch-noresp)" : lens.fill(p);
              const ring = lens.ring(p);
              const glowing = lens.glow(p);
              return (
                <g
                  key={`${spawnKey}-${i}`}
                  className="hex-spawn"
                  style={{
                    animationDelay: `${spawnDelays[i]}ms`,
                  }}
                  onMouseEnter={() => setHover({ idx: i, person: p, x, y })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() =>
                    navigate({ to: "/people/$employeeId", params: { employeeId: p.id } })
                  }
                >
                  <g
                    style={{
                      cursor: "pointer",
                      transition: "opacity 240ms ease-out, filter 240ms ease-out",
                      filter: dim ? "blur(2.2px)" : "none",
                    }}
                    opacity={dim ? 0.32 : 1}
                  >
                    <path
                      d={path}
                      fill={fill}
                      stroke={isHover ? "var(--spark)" : ring}
                      strokeWidth={isHover ? 2 : ring !== "transparent" ? 1 : 0}
                      filter={glowing ? "url(#spark-glow)" : undefined}
                    />
                  </g>
                </g>
              );
            })}
          </svg>

          {hover && <HoverCard hover={{ ...hover.person, x: hover.x, y: hover.y }} dark={dark} lens={lens} />}

          {!isMobile && (
            <>
              <DeptLabel pos={{ left: "22%", top: "26%" }} title="ENG" count={deptCounts.ENG} />
              <DeptLabel pos={{ left: "10%", bottom: "22%" }} title="DESIGN" count={deptCounts.DESIGN} />
              <DeptLabel pos={{ right: "12%", bottom: "22%" }} title="OPS" count={deptCounts.OPS} />
              <DeptLabel pos={{ left: "47%", bottom: "8%" }} title="PEOPLE" count={deptCounts.PEOPLE} />
            </>
          )}

          {/* Bottom narrative band */}
          <div
            style={{
              position: "absolute",
              bottom: isMobile ? 14 : 18,
              left: isMobile ? 16 : 26,
              right: isMobile ? 16 : 26,
              display: "flex",
              alignItems: isMobile ? "stretch" : "flex-end",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              gap: isMobile ? 12 : 24,
              zIndex: 4,
              flexWrap: "wrap",
            }}
          >
            <p
              className="t-body-lg"
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: isMobile ? 15 : 18,
                color: "var(--fg-2)",
                margin: 0,
                maxWidth: 560,
                textWrap: "pretty",
              }}
            >
              {lens.narrative}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {lens.actions.map((a, i) => {
                if (typeof a === "string") {
                  return (
                    <button key={i} type="button" className="pill pill-ghost pill-sm">
                      {a}
                    </button>
                  );
                }
                const spark = "spark" in a && a.spark;
                const cls = spark ? "pill pill-spark pill-sm" : "pill pill-ghost pill-sm";
                if (a.to) {
                  return (
                    <Link key={i} to={a.to} className={cls}>
                      {a.label} {spark && <span className="arr">→</span>}
                    </Link>
                  );
                }
                return (
                  <button key={i} type="button" className={cls}>
                    {a.label} {spark && <span className="arr">→</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 25% — micro-cards */}
      <aside
        className="flex flex-col gap-2.5 min-h-0"
        style={{ flex: "1 1 25%", minWidth: 0 }}
      >
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          TUTTO IL RESTO
        </span>
        {cards.map((c, i) => (
          <MicroCard key={i} {...c} />
        ))}
      </aside>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        className="t-num"
        style={{
          fontSize: 24,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: accent ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </span>
      <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
    </div>
  );
}

