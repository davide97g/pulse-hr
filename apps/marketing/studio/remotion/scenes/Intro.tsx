import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";
import { tokenizeBrandText } from "../components/text";

export const INTRO_DURATION_FRAMES = 42;

interface Props {
  title: string;
  subtitle?: string;
}

const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);

export const Intro: React.FC<Props> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const square = width <= 1080 && Math.abs(width - 1080) < 1;

  const ambient = interpolate(frame, [0, 30], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bracketSpring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 14, mass: 0.9, stiffness: 140 },
  });

  const underline = interpolate(frame, [22, 36], [0, 1], {
    easing: easeOutExpo,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exit = interpolate(frame, [34, 42], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(frame, [34, 42], [1, 1.05], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitBlur = interpolate(frame, [34, 42], [0, 6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleSize = square ? 72 : 96;
  const subSize = square ? 14 : 16;
  const bracketSize = square ? 64 : 88;
  const bracketOffset = square ? 360 : 540;

  const tokens = tokenizeBrandText(title);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        color: color.cream,
        fontFamily: fonts.sans,
        justifyContent: "center",
        alignItems: "center",
        opacity: exit,
        transform: `scale(${exitScale})`,
        filter: `blur(${exitBlur}px)`,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${color.brand}1f 0%, transparent 60%)`,
          opacity: ambient,
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: ambient * 0.35,
          backgroundImage:
            "linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 50% 40% at 50% 50%, black 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 50% 40% at 50% 50%, black 30%, transparent 90%)",
        }}
      />

      <Bracket
        side="left"
        size={bracketSize}
        offset={bracketOffset}
        progress={bracketSpring}
      />
      <Bracket
        side="right"
        size={bracketSize}
        offset={bracketOffset}
        progress={bracketSpring}
      />

      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize: titleSize,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          textAlign: "center",
          maxWidth: square ? 880 : 1500,
          padding: "0 80px",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.28em",
          justifyContent: "center",
        }}
      >
        {tokens.map((tok, i) => {
          const start = 6 + i * 3;
          const wordSpring = spring({
            frame: frame - start,
            fps,
            config: { damping: 16, mass: 0.7, stiffness: 130 },
          });
          const blur = interpolate(wordSpring, [0, 1], [10, 0]);
          const lift = interpolate(wordSpring, [0, 1], [22, 0]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: wordSpring,
                transform: `translateY(${lift}px)`,
                filter: `blur(${blur}px)`,
                color: tok.brand ? color.brand : color.cream,
                fontStyle: tok.brand ? "italic" : "normal",
              }}
            >
              {tok.text}
            </span>
          );
        })}
      </div>

      <div
        aria-hidden
        style={{
          marginTop: 28,
          height: 1,
          width: 120,
          background: `linear-gradient(to right, transparent, ${color.brand}, transparent)`,
          transform: `scaleX(${underline})`,
          transformOrigin: "center",
          opacity: underline,
        }}
      />

      {subtitle ? (
        <div
          style={{
            marginTop: 14,
            fontFamily: fonts.mono,
            fontSize: subSize,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            opacity: underline,
            transform: `translateY(${(1 - underline) * 6}px)`,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Bracket: React.FC<{
  side: "left" | "right";
  size: number;
  offset: number;
  progress: number;
}> = ({ side, size, offset, progress }) => {
  const slide = interpolate(progress, [0, 1], [40, 0]);
  const opacity = progress;
  const isLeft = side === "left";
  const x = isLeft ? -offset - slide : offset + slide;
  const path = isLeft
    ? `M 24 4 L 4 4 L 4 ${size - 4} L 24 ${size - 4}`
    : `M ${size - 24} 4 L ${size - 4} 4 L ${size - 4} ${size - 4} L ${size - 24} ${size - 4}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(calc(-50% + ${x}px), -50%)`,
        opacity,
      }}
    >
      <path
        d={path}
        stroke={color.brand}
        strokeWidth={2}
        fill="none"
        strokeLinecap="square"
      />
    </svg>
  );
};
