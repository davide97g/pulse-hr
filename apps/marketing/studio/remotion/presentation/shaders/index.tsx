/**
 * Thin Remotion-friendly wrappers around @paper-design/shaders-react.
 *
 * Paper Shaders treat the `frame` prop as **milliseconds from animation
 * start** (see shader-mount.js: `u_time = currentFrame * 1e-3`). Their
 * `speed` prop only matters when Paper drives its own rAF — we pass
 * `speed={0}` so Paper stays static and Remotion is the sole clock, then
 * compute `frame = (useCurrentFrame() / fps) * 1000 * speedMultiplier` to
 * scale the animation rate ourselves.
 *
 * Colors are pulled from `@pulse-hr/tokens` (re-exported via studio/remotion/tokens)
 * so the presentation auto-tracks any future palette tweak. The signature
 * iridescent set — `LIME → CYAN → MAGENTA → PINK → INK` — encodes Pulse's
 * `.iridescent-border` / `.new-badge` gradient as a 5-stop palette.
 */
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  DotGrid,
  GodRays,
  GrainGradient,
  MeshGradient,
  PulsingBorder,
  SmokeRing,
  Voronoi,
} from "@paper-design/shaders-react";
import { color } from "../../tokens";

/* Pulse iridescent palette. Lime is the live brand token; the rest are
 * fixed accents that match `.new-badge` (lime → cyan → magenta → pink). */
export const IRIDESCENT = {
  lime: color.brand,
  cyan: "#39e1ff",
  magenta: "#c06bff",
  pink: "#ff6b9a",
  ink: color.ink,
  cream: color.cream,
} as const;

const fill: React.CSSProperties = { width: "100%", height: "100%" };

/** Convert Remotion frame → Paper Shader ms time. */
const useShaderMs = (speedMultiplier = 1): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame / fps) * 1000 * speedMultiplier;
};

interface ShaderSlotProps {
  /**
   * Multiplier on the shader's animation rate.
   * 1 = natural speed. 0.4 = calm drift. 2 = brisk.
   */
  speed?: number;
  /** Optional extra fade applied to the entire shader layer. */
  opacity?: number;
}

/* ─── 1. Mesh Gradient — cold open / outro / chapter title slates ────────── */

export const MeshGradientBackdrop: React.FC<ShaderSlotProps & {
  distortion?: number;
  swirl?: number;
}> = ({ speed = 0.8, opacity = 1, distortion = 0.75, swirl = 0.45 }) => {
  const ms = useShaderMs(speed);
  return (
    <AbsoluteFill style={{ backgroundColor: IRIDESCENT.ink, opacity }}>
      <MeshGradient
        style={fill}
        frame={ms}
        speed={0}
        colors={[
          IRIDESCENT.ink,
          IRIDESCENT.lime,
          IRIDESCENT.cyan,
          IRIDESCENT.magenta,
          IRIDESCENT.pink,
        ]}
        distortion={distortion}
        swirl={swirl}
        grainMixer={0.2}
        grainOverlay={0.12}
      />
    </AbsoluteFill>
  );
};

/* ─── 2. Dot Grid — Employee → Person ────────────────────────────────────── */
/* DotGrid has no time uniform (static pattern). We breathe the pattern by
 * gently easing the `offsetY` over time and pulsing `opacityRange`. */

export const DotGridBackdrop: React.FC<ShaderSlotProps & {
  size?: number;
  gap?: number;
}> = ({ opacity = 1, size = 6, gap = 38, speed = 1 }) => {
  const ms = useShaderMs(speed);
  // Slow vertical drift across ~12s + opacity breathing across ~5s.
  const driftY = Math.sin((ms / 12000) * Math.PI * 2) * 0.06;
  const opacityPulse =
    0.35 + 0.25 * (0.5 + 0.5 * Math.sin((ms / 5000) * Math.PI * 2));
  return (
    <AbsoluteFill style={{ backgroundColor: IRIDESCENT.ink, opacity }}>
      <DotGrid
        style={fill}
        colorBack={IRIDESCENT.ink}
        colorFill={`${IRIDESCENT.lime}cc`}
        colorStroke="transparent"
        size={size}
        gapX={gap}
        gapY={gap}
        strokeWidth={0}
        sizeRange={0.35}
        opacityRange={opacityPulse}
        shape="circle"
        scale={1}
        offsetY={driftY}
      />
    </AbsoluteFill>
  );
};

/* ─── 4. Smoke Ring + Pulsing Border — Challenges, visible ───────────────── */

export const SmokeRingBackdrop: React.FC<ShaderSlotProps> = ({
  speed = 1.1,
  opacity = 1,
}) => {
  const ms = useShaderMs(speed);
  return (
    <AbsoluteFill style={{ backgroundColor: IRIDESCENT.ink, opacity }}>
      <SmokeRing
        style={fill}
        frame={ms}
        speed={0}
        colorBack={IRIDESCENT.ink}
        colors={[IRIDESCENT.magenta, IRIDESCENT.pink, IRIDESCENT.lime]}
        scale={1}
        noiseScale={1.4}
        noiseIterations={6}
        thickness={0.55}
      />
    </AbsoluteFill>
  );
};

export const PulsingBorderOverlay: React.FC<ShaderSlotProps & {
  thickness?: number;
}> = ({ speed = 1.2, opacity = 0.75, thickness = 0.06 }) => {
  const ms = useShaderMs(speed);
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <PulsingBorder
        style={fill}
        frame={ms}
        speed={0}
        colors={[IRIDESCENT.lime, IRIDESCENT.cyan, IRIDESCENT.magenta, IRIDESCENT.pink]}
        colorBack="#00000000"
        roundness={1}
        thickness={thickness}
        softness={0.95}
        intensity={0.75}
        bloom={1}
        spots={4}
        spotSize={0.55}
        pulse={0.55}
        smoke={0.7}
        smokeSize={0.6}
      />
    </AbsoluteFill>
  );
};

/* ─── 5. Voronoi — Skills on a radar ─────────────────────────────────────── */

export const VoronoiBackdrop: React.FC<ShaderSlotProps & {
  distortion?: number;
}> = ({ speed = 0.9, opacity = 1, distortion = 0.28 }) => {
  const ms = useShaderMs(speed);
  return (
    <AbsoluteFill style={{ backgroundColor: IRIDESCENT.ink, opacity }}>
      <Voronoi
        style={fill}
        frame={ms}
        speed={0}
        colors={[IRIDESCENT.ink, IRIDESCENT.ink, IRIDESCENT.magenta]}
        colorGap={`${IRIDESCENT.lime}88`}
        colorGlow={IRIDESCENT.lime}
        distortion={distortion}
        gap={0.05}
        glow={0.8}
        stepsPerColor={1}
        scale={0.45}
      />
    </AbsoluteFill>
  );
};

/* ─── 6. Grain Gradient — universal underlay below testreel captures ─────── */

export const GrainGradientUnderlay: React.FC<ShaderSlotProps> = ({
  speed = 0.6,
  opacity = 0.08,
}) => {
  const ms = useShaderMs(speed);
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <GrainGradient
        style={fill}
        frame={ms}
        speed={0}
        colors={[IRIDESCENT.lime, IRIDESCENT.cyan, IRIDESCENT.magenta]}
        colorBack={IRIDESCENT.ink}
        softness={0.7}
        intensity={0.5}
        noise={0.45}
        shape="wave"
      />
    </AbsoluteFill>
  );
};

/* ─── 6b. Grain Gradient Wave — Growth ────────────────────────────────────
 * Used in place of NeuroNoise for the Growth value card + chapter slate.
 * Reads as a slow upward-curling wave field — same "growth tracked" metaphor
 * but with palette control NeuroNoise doesn't expose. */

export const GrowthWaveBackdrop: React.FC<ShaderSlotProps> = ({
  speed = 0.8,
  opacity = 1,
}) => {
  const ms = useShaderMs(speed);
  return (
    <AbsoluteFill style={{ backgroundColor: IRIDESCENT.ink, opacity }}>
      <GrainGradient
        style={fill}
        frame={ms}
        speed={0}
        colors={[IRIDESCENT.lime, IRIDESCENT.cyan, IRIDESCENT.magenta]}
        colorBack={IRIDESCENT.ink}
        softness={0.95}
        intensity={0.75}
        noise={0.4}
        shape="wave"
        scale={1}
      />
    </AbsoluteFill>
  );
};

/* ─── 7. God Rays — kudos celebration sting ──────────────────────────────── */

export const GodRaysSting: React.FC<ShaderSlotProps & { intensity?: number }> = ({
  speed = 1.4,
  opacity = 0.85,
  intensity = 0.7,
}) => {
  const ms = useShaderMs(speed);
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none", mixBlendMode: "screen" }}>
      <GodRays
        style={fill}
        frame={ms}
        speed={0}
        colorBack="#00000000"
        colorBloom={IRIDESCENT.cream}
        colors={[IRIDESCENT.lime, IRIDESCENT.cyan]}
        offsetX={0}
        offsetY={-0.3}
        spotty={0.5}
        midSize={0.6}
        midIntensity={intensity}
        density={0.85}
        bloom={0.8}
        frequency={0.6}
      />
    </AbsoluteFill>
  );
};

/** Convenience: full-bleed dark vignette over a shader to keep captions legible. */
export const ShaderVignette: React.FC<{ opacity?: number }> = ({ opacity = 0.55 }) => (
  <AbsoluteFill
    aria-hidden
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.65) 100%)",
      opacity,
    }}
  />
);
