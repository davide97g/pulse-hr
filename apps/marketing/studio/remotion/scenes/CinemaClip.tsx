import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";
import { Caption, type TimedCaption } from "../components/Caption";

export interface KenBurns {
  fromScale: number;
  toScale: number;
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
}

export interface HighlightPulse {
  /** Onset (ms relative to scene start). */
  atMs: number;
  /** Pulse duration in ms. */
  durationMs?: number;
  /** Pulse center, 0..1 in clip space. Defaults to 0.5/0.5. */
  x?: number;
  y?: number;
  /** Spotlight inner-radius in vh (default 30). */
  radius?: number;
}

export interface CinemaClipProps {
  /** Path under publicDir (studio/) to the capture clip. */
  capturePath: string;
  /** How many frames this scene occupies. */
  durationFrames: number;
  /** Offset into the source clip (frames). */
  startFrame?: number;
  /** Short label shown briefly at clip start (uppercase mono). */
  label?: string;
  /** Ken-Burns scale/translate envelope. */
  kenBurns?: KenBurns;
  /** Brightness pulses synced to score beats. */
  highlights?: HighlightPulse[];
  /** Cinematic caption overlay (game-trailer voice). */
  cues?: TimedCaption[];
  /** How heavy the vignette is (0..1). Default 1. */
  vignette?: number;
}

const ENTER_FRAMES = 10;
const EXIT_FRAMES = 10;

export const CinemaClip: React.FC<CinemaClipProps> = ({
  capturePath,
  durationFrames,
  startFrame = 0,
  label,
  kenBurns = { fromScale: 1.04, toScale: 1.14 },
  highlights = [],
  cues = [],
  vignette = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: vw, height: vh } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const portrait = vh > vw;

  // Enter (springy fade + slight scale-in) and exit (push-through).
  const enterSpring = spring({
    frame,
    fps,
    durationInFrames: ENTER_FRAMES,
    config: { damping: 18, mass: 0.7, stiffness: 130 },
  });
  const exitProgress = interpolate(
    frame,
    [durationFrames - EXIT_FRAMES, durationFrames],
    [0, 1],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const baseOpacity = enterSpring * (1 - exitProgress);

  // Ken-Burns push.
  const t = interpolate(frame, [0, durationFrames], [0, 1], {
    easing: Easing.bezier(0.45, 0.05, 0.55, 0.95),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(t, [0, 1], [kenBurns.fromScale, kenBurns.toScale]);
  const tx = interpolate(t, [0, 1], [kenBurns.fromX ?? 0, kenBurns.toX ?? 0]);
  const ty = interpolate(t, [0, 1], [kenBurns.fromY ?? 0, kenBurns.toY ?? 0]);

  // Beat-synced brightness pulse — fades highlight nearest to current ms.
  const active = highlights.find(
    (h) => ms >= h.atMs - 40 && ms <= h.atMs + (h.durationMs ?? 300),
  );
  let pulse = 1;
  let spotX = 0.5;
  let spotY = 0.5;
  let spotR = 30;
  if (active) {
    const local = ms - active.atMs;
    const dur = active.durationMs ?? 300;
    const norm = Math.max(0, Math.min(1, local / dur));
    pulse =
      1 + 0.32 * Math.sin(norm * Math.PI) + (norm < 0.3 ? 0.1 : 0);
    spotX = active.x ?? 0.5;
    spotY = active.y ?? 0.5;
    spotR = active.radius ?? 30;
  }

  // Slight focus-blur during entrance and exit.
  const blur =
    interpolate(enterSpring, [0, 1], [6, 0]) +
    interpolate(exitProgress, [0, 1], [0, 5]);

  // Label appears immediately, lingers 24 frames, fades out by 40.
  const labelSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 140 },
  });
  const labelOpacity =
    labelSpring *
    interpolate(frame, [32, 50], [1, 0], {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ backgroundColor: "#040408" }}>
      {/* The capture, in a Ken-Burns + brightness wrapper */}
      <AbsoluteFill
        style={{
          opacity: baseOpacity,
          transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
          filter: `blur(${blur}px) brightness(${pulse})`,
        }}
      >
        <OffthreadVideo
          src={staticFile(capturePath)}
          startFrom={startFrame}
        />
      </AbsoluteFill>

      {/* Highlight spotlight — additive radial glow around active beat */}
      {active ? (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: baseOpacity,
            background: `radial-gradient(circle ${spotR}vh at ${
              spotX * 100
            }% ${spotY * 100}%, ${color.brand}33 0%, transparent 70%)`,
            mixBlendMode: "screen",
          }}
        />
      ) : null}

      {/* Vignette + brand border */}
      <AbsoluteFill
        aria-hidden
        style={{
          pointerEvents: "none",
          opacity: baseOpacity * vignette,
          boxShadow: `inset 0 0 0 1px ${color.brand}1a, inset 0 0 160px rgba(0,0,0,0.55)`,
          background: `radial-gradient(ellipse 92% 78% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)`,
        }}
      />

      {/* Subtle scanline shadow for the "game trailer" feel */}
      <AbsoluteFill
        aria-hidden
        style={{
          pointerEvents: "none",
          opacity: baseOpacity * 0.18,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Optional label chip top-left */}
      {label ? (
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 36,
            padding: "6px 12px",
            borderRadius: 9999,
            backgroundColor: "rgba(10,10,15,0.8)",
            backdropFilter: "blur(12px) saturate(160%)",
            WebkitBackdropFilter: "blur(12px) saturate(160%)",
            border: `1px solid ${color.brand}55`,
            color: color.cream,
            fontFamily: fonts.mono,
            fontSize: 12,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            opacity: labelOpacity * baseOpacity,
            transform: `translateY(${interpolate(labelSpring, [0, 1], [-8, 0])}px)`,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 9999,
              backgroundColor: color.brand,
              boxShadow: `0 0 10px ${color.brand}`,
            }}
          />
          {label}
        </div>
      ) : null}

      <Caption cues={cues} bottom={portrait ? 260 : 150} />
    </AbsoluteFill>
  );
};
