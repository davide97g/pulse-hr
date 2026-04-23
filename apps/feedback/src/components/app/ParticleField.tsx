import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type ParticleVariant = "ambient" | "waking" | "error" | "celebrate";
export type ParticleDensity = "sparse" | "normal" | "dense";
export type ParticleSize = "sm" | "md" | "lg" | "full";

type Props = {
  variant?: ParticleVariant;
  density?: ParticleDensity;
  size?: ParticleSize;
  className?: string;
};

const IRIDESCENT = ["#b4ff39", "#39e1ff", "#c06bff", "#ff6b9a", "#ffbf4a", "#6fd8ff"];

const DENSITY_MAP: Record<ParticleDensity, number> = {
  sparse: 18,
  normal: 42,
  dense: 90,
};

const SIZE_CLASS: Record<ParticleSize, string> = {
  sm: "h-40",
  md: "h-64",
  lg: "h-96",
  full: "h-full",
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hueIdx: number;
  phase: number;
  speed: number;
};

export function ParticleField({
  variant = "ambient",
  density = "normal",
  size = "md",
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const onMq = () => {
      reducedMotionRef.current = mq.matches;
    };
    mq.addEventListener?.("change", onMq);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const readThemeColor = (cssVar: string, fallback: string): string => {
      try {
        const val = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
        return val || fallback;
      } catch {
        return fallback;
      }
    };

    const getPalette = (): string[] => {
      if (variant === "celebrate") return IRIDESCENT;
      const labs = readThemeColor("--labs", "oklch(0.86 0.22 135)");
      const primary = readThemeColor("--primary", "oklch(0.72 0.17 258)");
      if (variant === "error") {
        return [readThemeColor("--destructive", "oklch(0.6 0.2 25)"), "#ff6b9a"];
      }
      if (variant === "waking") return [labs, primary];
      return [labs, primary, "#39e1ff"];
    };

    const count = DENSITY_MAP[density];
    const palette = getPalette();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth || 320;
      const h = parent.clientHeight || 200;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      const w = parent.clientWidth || 320;
      const h = parent.clientHeight || 200;
      const list: Particle[] = [];
      for (let i = 0; i < count; i++) {
        list.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.8 + 0.6,
          hueIdx: Math.floor(Math.random() * palette.length),
          phase: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.014,
        });
      }
      particlesRef.current = list;
    };

    resize();
    seed();

    const ro = new ResizeObserver(() => {
      resize();
      seed();
    });
    ro.observe(parent);

    const drawStatic = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of particlesRef.current) {
        ctx.beginPath();
        ctx.fillStyle = palette[p.hueIdx]!;
        ctx.globalAlpha = 0.35;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (reducedMotionRef.current) {
      drawStatic();
      return () => {
        ro.disconnect();
        mq.removeEventListener?.("change", onMq);
      };
    }

    let running = true;
    let t0 = performance.now();

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(now - t0, 48);
      t0 = now;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (variant === "waking") {
        const cx = w / 2;
        const cy = h / 2;
        const period = 1800;
        const progress = ((now % period) / period) * (Math.PI * 2);
        for (let r = 0; r < 3; r++) {
          const phase = progress - r * 0.9;
          const radius = ((Math.sin(phase) + 1) / 2) * Math.min(w, h) * 0.42 + 8;
          const alpha = 0.35 * (1 - radius / (Math.min(w, h) * 0.5));
          ctx.beginPath();
          ctx.strokeStyle = palette[r % palette.length]!;
          ctx.globalAlpha = Math.max(alpha, 0);
          ctx.lineWidth = 1.2;
          ctx.arc(cx, cy, Math.max(radius, 2), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      for (const p of particlesRef.current) {
        p.phase += p.speed * dt;
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;
        if (p.y > h + 4) p.y = -4;
        const alpha = 0.25 + (Math.sin(p.phase) + 1) * 0.3;
        ctx.beginPath();
        ctx.fillStyle = palette[p.hueIdx]!;
        ctx.globalAlpha = Math.min(alpha, 0.85);
        const r = variant === "error" ? p.r * 0.8 : p.r;
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const onVis = () => {
      if (document.hidden) {
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (rafRef.current == null) {
        t0 = performance.now();
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      mq.removeEventListener?.("change", onMq);
    };
  }, [variant, density]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        size !== "full" && SIZE_CLASS[size],
        className,
      )}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
