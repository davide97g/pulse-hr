import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color } from "../../tokens";
import { fonts } from "../../fonts";
import { ShaderVignette } from "../shaders";

export const CHAPTER_SLATE_FRAMES = 90;

interface Props {
  /** Chapter number, zero-padded (e.g. "01"). */
  number: string;
  /** Chapter title in Title Case. */
  label: string;
  /** Optional kicker line under the title. */
  kicker?: string;
  /** Aspect-aware shader background. */
  shader: React.ReactNode;
  aspect: "1080" | "shorts";
}

export const ChapterSlate: React.FC<Props> = ({
  number,
  label,
  kicker,
  shader,
  aspect,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const portrait = aspect === "shorts";

  const enter = interpolate(frame, [0, 14], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(
    frame,
    [CHAPTER_SLATE_FRAMES - 12, CHAPTER_SLATE_FRAMES],
    [1, 0],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const fade = enter * exit;

  const numberSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 120 },
  });

  const labelSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 18, mass: 0.7, stiffness: 130 },
  });

  const kickerSpring = spring({
    frame: frame - 26,
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 130 },
  });

  const underline = interpolate(frame, [20, 38], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const numberSize = portrait ? 88 : 124;
  const labelSize = portrait ? 88 : 132;
  const kickerSize = portrait ? 16 : 18;

  return (
    <AbsoluteFill style={{ opacity: fade, backgroundColor: color.ink }}>
      {shader}
      <ShaderVignette opacity={0.6} />

      <AbsoluteFill
        style={{
          color: color.cream,
          fontFamily: fonts.sans,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: portrait ? 56 : 120,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: numberSize,
            fontWeight: 500,
            color: color.brand,
            letterSpacing: "0.08em",
            opacity: numberSpring,
            transform: `translateY(${(1 - numberSpring) * 14}px) scale(${interpolate(
              numberSpring,
              [0, 1],
              [0.92, 1],
            )})`,
            textShadow: `0 0 32px ${color.brand}44`,
            marginBottom: 16,
          }}
        >
          {number}
        </div>

        <div
          aria-hidden
          style={{
            width: 120,
            height: 1,
            background: `linear-gradient(to right, transparent, ${color.brand}, transparent)`,
            transform: `scaleX(${underline})`,
            transformOrigin: "center",
            opacity: underline,
            marginBottom: 32,
          }}
        />

        <div
          style={{
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: labelSize,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: color.cream,
            opacity: labelSpring,
            transform: `translateY(${(1 - labelSpring) * 16}px)`,
            filter: `blur(${(1 - labelSpring) * 6}px)`,
            maxWidth: portrait ? 880 : 1400,
          }}
        >
          {label}
        </div>

        {kicker ? (
          <div
            style={{
              marginTop: 28,
              fontFamily: fonts.mono,
              fontSize: kickerSize,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
              opacity: kickerSpring,
              transform: `translateY(${(1 - kickerSpring) * 6}px)`,
            }}
          >
            {kicker}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
