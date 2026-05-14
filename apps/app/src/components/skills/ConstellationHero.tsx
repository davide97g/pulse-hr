import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
} from "react";
import { Minus, Plus, RefreshCw } from "lucide-react";
import {
  LV_INDEX,
  LV_LABEL,
  MY_SKILLS,
  skill,
  type MySkillRow,
  type SkillBucket,
  type SkillLevel,
} from "@/lib/skills-data";

/* per-wheel viewBox — close to square so both wheels look balanced side-by-side */
const W = 700;
const H = 680;
const CX = W / 2;
const CY = H / 2;
const MIN_R = 55;
const STEP = 55;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;

interface Placed {
  id: string;
  name: string;
  bucket: SkillBucket;
  lvl: SkillLevel;
  val: "proposed" | "validated";
  x: number;
  y: number;
  ang: number;
}

interface Enriched {
  id: string;
  name: string;
  bucket: SkillBucket;
  lvl: SkillLevel;
  val: "proposed" | "validated";
}

/**
 * Distribute skills around a full circle for a single-bucket wheel. Skills
 * are sorted master-first so high-level dots cluster on the top, lower on
 * the bottom — gives the wheel a readable visual hierarchy.
 */
function placeFull(list: Enriched[]): Placed[] {
  const sorted = [...list].sort((a, b) => LV_INDEX[b.lvl] - LV_INDEX[a.lvl]);
  const n = sorted.length;
  return sorted.map((s, i) => {
    // start at -90° (12 o'clock), go clockwise
    const angDeg = -90 + (i * 360) / Math.max(n, 1);
    const ang = (angDeg * Math.PI) / 180;
    const r = MIN_R + LV_INDEX[s.lvl] * STEP + ((i % 2) * 6);
    return {
      ...s,
      x: CX + Math.cos(ang) * r,
      y: CY + Math.sin(ang) * r,
      ang: angDeg,
    };
  });
}

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const INITIAL_VB: ViewBox = { x: 0, y: 0, w: W, h: H };

const ZONES: { level: SkillLevel; idx: number }[] = [
  { level: "novice", idx: 0 },
  { level: "practitioner", idx: 1 },
  { level: "expert", idx: 2 },
  { level: "master", idx: 3 },
];

const MASTER_R = MIN_R + 4 * STEP;

/**
 * Mount-time pulse → ring-by-ring flash → outward ripple. Plays once when the
 * wheel mounts (e.g. landing on the Constellation tab) using SMIL animate
 * elements so it composes cleanly with the SVG's viewBox + pan/zoom transforms.
 * Suppressed when the user prefers reduced motion.
 */
function PulseLandAnimation({ playKey }: { playKey: number }) {
  const ringBegins = [0.1, 0.23, 0.36, 0.49];
  const ringDur = 0.34;
  const easeOut = "0.22 0.7 0.36 1";
  return (
    <g key={playKey} pointerEvents="none">
      {/* Main inside-out pulse front */}
      <circle
        cx={CX}
        cy={CY}
        r={0}
        fill="none"
        stroke="var(--spark)"
        strokeWidth={2}
        opacity={0}
      >
        <animate
          attributeName="r"
          values={`0;${MASTER_R}`}
          keyTimes="0;1"
          calcMode="spline"
          keySplines={easeOut}
          dur="0.7s"
          fill="freeze"
          begin="0s"
        />
        <animate
          attributeName="opacity"
          values="0.65;0.45;0.18;0"
          keyTimes="0;0.5;0.85;1"
          dur="0.72s"
          fill="freeze"
          begin="0s"
        />
        <animate
          attributeName="stroke-width"
          values="2.5;1.2"
          keyTimes="0;1"
          dur="0.7s"
          fill="freeze"
          begin="0s"
        />
      </circle>

      {/* Soft glow trailing the pulse front */}
      <circle
        cx={CX}
        cy={CY}
        r={0}
        fill="none"
        stroke="var(--spark)"
        strokeWidth={10}
        opacity={0}
      >
        <animate
          attributeName="r"
          values={`0;${MASTER_R - 14}`}
          keyTimes="0;1"
          calcMode="spline"
          keySplines={easeOut}
          dur="0.78s"
          fill="freeze"
          begin="0s"
        />
        <animate
          attributeName="opacity"
          values="0.18;0.12;0"
          keyTimes="0;0.7;1"
          dur="0.78s"
          fill="freeze"
          begin="0s"
        />
      </circle>

      {/* Per-ring flash — lights each level as the front crosses */}
      {ZONES.map(({ idx }) => (
        <circle
          key={`flash-${idx}`}
          cx={CX}
          cy={CY}
          r={MIN_R + (idx + 1) * STEP}
          fill="none"
          stroke="var(--spark)"
          strokeWidth={0}
          opacity={0}
        >
          <animate
            attributeName="stroke-width"
            values="0;3;1.2"
            keyTimes="0;0.4;1"
            calcMode="spline"
            keySplines={`${easeOut};${easeOut}`}
            dur={`${ringDur}s`}
            fill="freeze"
            begin={`${ringBegins[idx]}s`}
          />
          <animate
            attributeName="opacity"
            values="0;1;0"
            keyTimes="0;0.4;1"
            dur={`${ringDur}s`}
            fill="freeze"
            begin={`${ringBegins[idx]}s`}
          />
        </circle>
      ))}

      {/* Diffusion ripples — past Master, expanding into the card's outer space */}
      {[0, 1, 2].map((i) => (
        <circle
          key={`ripple-${i}`}
          cx={CX}
          cy={CY}
          r={MASTER_R}
          fill="none"
          stroke="var(--spark)"
          strokeWidth={1.5}
          opacity={0}
        >
          <animate
            attributeName="r"
            values={`${MASTER_R};${MASTER_R + 220 + i * 60}`}
            keyTimes="0;1"
            calcMode="spline"
            keySplines={easeOut}
            dur="0.85s"
            fill="freeze"
            begin={`${0.6 + i * 0.13}s`}
          />
          <animate
            attributeName="opacity"
            values="0.55;0.22;0"
            keyTimes="0;0.55;1"
            dur="0.85s"
            fill="freeze"
            begin={`${0.6 + i * 0.13}s`}
          />
          <animate
            attributeName="stroke-width"
            values="2;0.5"
            keyTimes="0;1"
            dur="0.85s"
            fill="freeze"
            begin={`${0.6 + i * 0.13}s`}
          />
        </circle>
      ))}
    </g>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function Wheel({
  title,
  caption,
  skills,
  accent,
  externalHovered,
  onDotClick,
}: {
  title: ReactNode;
  caption: ReactNode;
  skills: Enriched[];
  accent: "fg" | "spark";
  externalHovered?: SkillLevel | null;
  onDotClick?: (id: string) => void;
}) {
  const placed = useMemo(() => placeFull(skills), [skills]);
  const proposedCount = placed.filter((p) => p.val === "proposed").length;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [vb, setVb] = useState<ViewBox>(INITIAL_VB);
  const dragRef = useRef<{ x: number; y: number; vb: ViewBox; moved: boolean } | null>(null);
  const [hoveredZoneLocal, setHoveredZoneLocal] = useState<SkillLevel | null>(null);
  const hoveredZone = externalHovered ?? hoveredZoneLocal;
  const setHoveredZone = setHoveredZoneLocal;
  const [pulseKey, setPulseKey] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const zoom = W / vb.w;

  const clamp = (next: ViewBox): ViewBox => {
    const minW = W / MAX_ZOOM;
    const maxW = W / MIN_ZOOM;
    const w = Math.max(minW, Math.min(maxW, next.w));
    const h = (w * H) / W;
    return { x: next.x, y: next.y, w, h };
  };

  const zoomAt = useCallback((cx: number, cy: number, factor: number) => {
    setVb((prev) => {
      const targetW = prev.w / factor;
      const targetH = prev.h / factor;
      const { w: w2, h: h2 } = clamp({ x: 0, y: 0, w: targetW, h: targetH });
      const tx = cx - ((cx - prev.x) * w2) / prev.w;
      const ty = cy - ((cy - prev.y) * h2) / prev.h;
      return { x: tx, y: ty, w: w2, h: h2 };
    });
  }, []);

  const onWheel = (e: WheelEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const cx = vb.x + px * vb.w;
    const cy = vb.y + py * vb.h;
    const factor = Math.exp(-e.deltaY * 0.0015);
    zoomAt(cx, cy, factor);
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, vb, moved: false };
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = dragRef.current;
    if (!d || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - d.x) * d.vb.w) / rect.width;
    const dy = ((e.clientY - d.y) * d.vb.h) / rect.height;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 3) {
      d.moved = true;
      setHoveredZone(null);
    }
    setVb({ ...d.vb, x: d.vb.x - dx, y: d.vb.y - dy });
  };

  const onPointerUp = (e: PointerEvent<SVGSVGElement>) => {
    dragRef.current = null;
    if ((e.currentTarget as SVGSVGElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
    }
  };

  const zoomIn = () => zoomAt(vb.x + vb.w / 2, vb.y + vb.h / 2, 1.3);
  const zoomOut = () => zoomAt(vb.x + vb.w / 2, vb.y + vb.h / 2, 1 / 1.3);
  const reset = () => {
    setVb(INITIAL_VB);
    setPulseKey((k) => k + 1);
  };

  const accentColor = accent === "spark" ? "var(--spark)" : "var(--fg)";

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--line-strong)",
        borderRadius: 18,
        background: "var(--bg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 360,
      }}
    >
      {/* Wheel header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "14px 18px 8px",
          gap: 12,
        }}
      >
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {caption}
          </span>
          <div
            style={{
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 28,
              letterSpacing: "-0.025em",
              lineHeight: 1,
              marginTop: 2,
            }}
          >
            {title}
            <span style={{ color: accentColor }}>.</span>
          </div>
        </div>
        <span
          className="t-num"
          style={{
            fontSize: 28,
            color: accentColor,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {String(skills.length).padStart(2, "0")}
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          display: "block",
          touchAction: "none",
          cursor: dragRef.current ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={reset}
      >
        {/* Hover bands */}
        {ZONES.map(({ level, idx }) => {
          const r = MIN_R + (idx + 0.5) * STEP;
          const on = hoveredZone === level;
          const isMaster = level === "master";
          return (
            <circle
              key={`zone-${level}`}
              cx={CX}
              cy={CY}
              r={r}
              fill="none"
              stroke={
                on
                  ? isMaster
                    ? "color-mix(in oklch, var(--spark) 12%, transparent)"
                    : "color-mix(in oklch, var(--fg) 7%, transparent)"
                  : "transparent"
              }
              strokeWidth={STEP - 2}
              pointerEvents="stroke"
              style={{ transition: "stroke 160ms ease-out" }}
              onPointerEnter={() => {
                if (!dragRef.current) setHoveredZone(level);
              }}
              onPointerLeave={() => setHoveredZone((cur) => (cur === level ? null : cur))}
            />
          );
        })}

        {/* Highlighted zone boundary lines */}
        {hoveredZone &&
          (() => {
            const idx = LV_INDEX[hoveredZone] - 1;
            const inner = MIN_R + idx * STEP;
            const outer = MIN_R + (idx + 1) * STEP;
            const stroke =
              hoveredZone === "master"
                ? "color-mix(in oklch, var(--spark) 55%, transparent)"
                : "color-mix(in oklch, var(--fg) 35%, transparent)";
            return (
              <g pointerEvents="none">
                <circle cx={CX} cy={CY} r={inner} fill="none" stroke={stroke} strokeWidth={1} />
                <circle cx={CX} cy={CY} r={outer} fill="none" stroke={stroke} strokeWidth={1} />
              </g>
            );
          })()}

        {/* Concentric level rings */}
        {[1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={CX}
            cy={CY}
            r={MIN_R + i * STEP}
            fill="none"
            stroke="var(--line)"
            strokeDasharray={i === 4 ? "0" : "2 6"}
            pointerEvents="none"
          />
        ))}

        {/* Ring labels — placed in the lower-left quadrant to dodge the
            horizontal centerline where most skill dots sit. Halo via
            paint-order so they stay readable over dots/spokes. */}
        {(["NOVICE", "PRACTITIONER", "EXPERT", "MASTER"] as const).map((l, i) => {
          const r = MIN_R + (i + 1) * STEP - STEP * 0.5;
          const ang = (215 * Math.PI) / 180;
          const x = CX + Math.cos(ang) * r;
          const y = CY + Math.sin(ang) * r;
          return (
            <text
              key={l}
              x={x}
              y={y}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="11"
              letterSpacing="0.06em"
              fill={i === 3 ? "var(--spark)" : "var(--muted-foreground)"}
              paintOrder="stroke"
              stroke="var(--bg)"
              strokeWidth={4}
              strokeLinejoin="round"
              pointerEvents="none"
            >
              {l}
            </text>
          );
        })}

        {/* Mount-time pulse + ripple animation */}
        {!reducedMotion && <PulseLandAnimation playKey={pulseKey} />}

        {/* Center "me" */}
        <circle cx={CX} cy={CY} r="42" fill="var(--fg)" pointerEvents="none" />
        <text
          x={CX}
          y={CY + 8}
          textAnchor="middle"
          fontFamily="Fraunces, serif"
          fontStyle="italic"
          fontSize="28"
          fill="var(--bg)"
          letterSpacing="-0.02em"
          pointerEvents="none"
        >
          me
        </text>

        {/* Spokes */}
        {placed.map((s, i) => (
          <line
            key={`l${i}`}
            x1={CX}
            y1={CY}
            x2={s.x}
            y2={s.y}
            stroke={s.lvl === "master" ? "var(--spark)" : "var(--line-strong)"}
            strokeOpacity={s.lvl === "master" ? 0.8 : 0.3}
            strokeWidth="1"
            pointerEvents="none"
          />
        ))}

        {/* Dots + labels */}
        {placed.map((s, i) => {
          const isMaster = s.lvl === "master";
          const radius =
            isMaster
              ? 14
              : s.lvl === "expert"
                ? 11
                : s.lvl === "practitioner"
                  ? 8
                  : 6;
          const fill = isMaster ? "var(--spark)" : "var(--bg)";
          const stroke = isMaster ? "var(--spark)" : "var(--fg)";
          const onRight = s.x > CX;
          const anchor = onRight ? "start" : "end";
          const lx = s.x + (onRight ? radius + 8 : -(radius + 8));
          return (
            <g key={`d${i}`}>
              {s.val === "proposed" && (
                <g
                  className="sk-constellation-halo"
                  style={{ transformOrigin: `${s.x}px ${s.y}px` }}
                  pointerEvents="none"
                >
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={radius + 5}
                    fill="none"
                    stroke="var(--spark)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                    opacity="0.85"
                  />
                </g>
              )}
              <circle
                cx={s.x}
                cy={s.y}
                r={radius}
                fill={fill}
                stroke={stroke}
                strokeWidth={isMaster ? 0 : 1.5}
                style={{ cursor: onDotClick ? "pointer" : "default" }}
                onPointerUp={(e) => {
                  if (dragRef.current?.moved) return;
                  if (!onDotClick) return;
                  e.stopPropagation();
                  onDotClick(s.id);
                }}
              />
              <text
                x={lx}
                y={s.y + 5}
                textAnchor={anchor}
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="15"
                fontWeight="500"
                fill="var(--fg)"
                style={{ letterSpacing: "-0.005em" }}
                paintOrder="stroke"
                stroke="var(--bg)"
                strokeWidth={4}
                strokeLinejoin="round"
                pointerEvents="none"
              >
                {s.name}
                <tspan
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="11"
                  letterSpacing="0.06em"
                  fill={isMaster ? "var(--spark)" : "var(--muted-foreground)"}
                  dx="6"
                >
                  {LV_LABEL[s.lvl].toUpperCase()}
                </tspan>
              </text>
            </g>
          );
        })}
      </svg>

      {/* Zoom controls — top right */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: 4,
          borderRadius: 999,
          border: "1px solid var(--line)",
          background: "color-mix(in oklch, var(--bg) 80%, transparent)",
          backdropFilter: "blur(8px)",
        }}
      >
        <button
          type="button"
          aria-label="Zoom out"
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM + 0.001}
          className="press-scale"
          style={zoomBtnStyle()}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span
          className="t-mono"
          style={{
            minWidth: 38,
            textAlign: "center",
            color: "var(--muted-foreground)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM - 0.001}
          className="press-scale"
          style={zoomBtnStyle()}
        >
          <Plus className="h-4 w-4" />
        </button>
        <span style={{ width: 1, height: 16, background: "var(--line)", margin: "0 2px" }} />
        <button
          type="button"
          aria-label="Reset view"
          onClick={reset}
          disabled={zoom === 1 && vb.x === 0 && vb.y === 0}
          className="press-scale"
          style={zoomBtnStyle()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Per-wheel proposed counter — bottom right of each wheel */}
      {proposedCount > 0 && (
        <div
          style={{
            position: "absolute",
            right: 14,
            bottom: 12,
            padding: "5px 10px",
            borderRadius: 999,
            border: "1px dashed var(--spark)",
            background: "color-mix(in oklch, var(--bg) 80%, transparent)",
            backdropFilter: "blur(8px)",
            color: "var(--spark)",
          }}
        >
          <span className="t-mono">PROPOSED · {proposedCount}</span>
        </div>
      )}
    </div>
  );
}

export function ConstellationHero({
  externalHoveredLevel,
  skills,
  onSkillClick,
}: {
  externalHoveredLevel?: SkillLevel | null;
  skills?: MySkillRow[];
  onSkillClick?: (row: MySkillRow) => void;
} = {}) {
  const source = skills ?? MY_SKILLS;
  const { soft, hard } = useMemo(() => {
    const enriched: Enriched[] = [];
    for (const r of source) {
      const cat = skill(r.sk);
      if (!cat) continue;
      enriched.push({
        id: r.id,
        name: cat.name,
        bucket: cat.bucket,
        lvl: r.lvl,
        val: r.val,
      });
    }
    return {
      soft: enriched.filter((s) => s.bucket === "soft"),
      hard: enriched.filter((s) => s.bucket === "hard"),
    };
  }, [source]);

  const handleDotClick = onSkillClick
    ? (id: string) => {
        const row = source.find((r) => r.id === id);
        if (row) onSkillClick(row);
      }
    : undefined;

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      }}
      className="sk-wheels-row"
    >
      <Wheel
        title={<>Soft</>}
        caption="← SOFT · HOW YOU SHOW UP"
        skills={soft}
        accent="fg"
        externalHovered={externalHoveredLevel ?? null}
        onDotClick={handleDotClick}
      />
      <Wheel
        title={<>Hard</>}
        caption="HARD · TECH · TOOLS · LANGS →"
        skills={hard}
        accent="spark"
        externalHovered={externalHoveredLevel ?? null}
        onDotClick={handleDotClick}
      />
    </div>
  );
}

function zoomBtnStyle(): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    border: "1px solid transparent",
    background: "transparent",
    color: "var(--fg)",
    cursor: "pointer",
  };
}
