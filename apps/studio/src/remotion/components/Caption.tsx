import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";

export interface TimedCaption {
  /** Caption text to render. */
  text: string;
  /** Onset in milliseconds, relative to the start of the parent Sequence. */
  atMs: number;
  /** How long the caption stays on screen, in milliseconds. */
  holdMs: number;
}

interface Props {
  /** Cue list, sorted ascending by atMs. */
  cues: TimedCaption[];
  /** Optional override for the bottom margin (px). */
  bottom?: number;
}

const FADE_MS = 280;

export const Caption: React.FC<Props> = ({ cues, bottom }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const square = width <= 1080 && Math.abs(width - 1080) < 1;

  const active = cues.find((c) => ms >= c.atMs && ms <= c.atMs + c.holdMs);
  if (!active) return null;

  const localMs = ms - active.atMs;
  const opacity = interpolate(
    localMs,
    [0, FADE_MS, active.holdMs - FADE_MS, active.holdMs],
    [0, 1, 1, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const lift = interpolate(localMs, [0, FADE_MS], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fontSize = square ? 30 : 38;
  const padX = square ? 22 : 28;
  const padY = square ? 12 : 14;
  const bottomPx = bottom ?? (square ? 80 : 110);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomPx,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${lift}px)`,
          padding: `${padY}px ${padX}px`,
          borderRadius: 14,
          backgroundColor: "rgba(10, 10, 15, 0.78)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${color.brand}33`,
          color: color.cream,
          fontFamily: fonts.display,
          fontSize,
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
          textAlign: "center",
          maxWidth: square ? 720 : 1100,
          boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 24px ${color.brand}22`,
        }}
      >
        {active.text}
      </div>
    </div>
  );
};
