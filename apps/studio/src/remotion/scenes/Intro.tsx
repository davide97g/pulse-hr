import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";

export const INTRO_DURATION_FRAMES = 45;

interface Props {
  title: string;
  subtitle?: string;
}

export const Intro: React.FC<Props> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const square = width <= 1080 && Math.abs(width - 1080) < 1;

  const dot = interpolate(frame, [0, 14], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ring = interpolate(frame, [4, 28], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headline = interpolate(frame, [16, 36], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const out = interpolate(frame, [36, 45], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleSize = square ? 64 : 84;
  const subSize = square ? 16 : 18;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        color: color.cream,
        fontFamily: fonts.sans,
        justifyContent: "center",
        alignItems: "center",
        opacity: out,
      }}
    >
      <div
        style={{
          position: "relative",
          width: square ? 220 : 260,
          height: square ? 220 : 260,
          marginBottom: 28,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "9999px",
            border: `1.5px solid ${color.brand}`,
            transform: `scale(${interpolate(ring, [0, 1], [0.4, 1])})`,
            opacity: ring,
            boxShadow: `0 0 60px ${color.brand}55, inset 0 0 40px ${color.brand}22`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 24,
            height: 24,
            transform: "translate(-50%, -50%)",
            borderRadius: "9999px",
            backgroundColor: color.brand,
            boxShadow: `0 0 32px ${color.brand}`,
            opacity: dot,
          }}
        />
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: titleSize,
          letterSpacing: "-0.02em",
          textAlign: "center",
          opacity: headline,
          transform: `translateY(${(1 - headline) * 14}px)`,
          maxWidth: square ? 880 : 1400,
          padding: "0 40px",
        }}
      >
        {title}
      </div>

      {subtitle ? (
        <div
          style={{
            marginTop: 18,
            fontFamily: fonts.mono,
            fontSize: subSize,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            opacity: headline,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
