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

export const COLD_OPEN_DURATION_FRAMES = 240;

interface Props {
  whisper?: string;
}

const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);

export const ColdOpen: React.FC<Props> = ({
  whisper = "Something is *moving*.",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Brand dot lands at f=12, breathes through the scene.
  const dotSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 18, mass: 1.1, stiffness: 90 },
  });
  const dotBreath =
    0.78 + 0.22 * Math.sin(((frame - 30) / fps) * Math.PI * 0.9);
  const dotScale = interpolate(dotSpring, [0, 1], [0.2, 1]) * dotBreath;
  const dotGlow = interpolate(dotSpring, [0, 1], [0, 1]) * dotBreath;

  // Ambient radial gradient bleeds in slowly.
  const ambient = interpolate(frame, [0, 90], [0, 0.55], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Faint hex grid fades in mid-scene.
  const grid = interpolate(frame, [90, 170], [0, 0.32], {
    easing: easeOutExpo,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Brackets slide in around f=150.
  const bracketSpring = spring({
    frame: frame - 150,
    fps,
    config: { damping: 16, mass: 0.9, stiffness: 120 },
  });

  // Whisper caption: word-by-word stagger starting at f=180.
  const captionStart = 180;
  const tokens = tokenizeBrandText(whisper);

  // Exit (entire scene): blur + scale-up at the tail.
  const exit = interpolate(
    frame,
    [COLD_OPEN_DURATION_FRAMES - 22, COLD_OPEN_DURATION_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const exitScale = interpolate(
    frame,
    [COLD_OPEN_DURATION_FRAMES - 22, COLD_OPEN_DURATION_FRAMES],
    [1, 1.06],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const exitBlur = interpolate(
    frame,
    [COLD_OPEN_DURATION_FRAMES - 22, COLD_OPEN_DURATION_FRAMES],
    [0, 8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020205",
        color: color.cream,
        fontFamily: fonts.sans,
        opacity: exit,
        transform: `scale(${exitScale})`,
        filter: `blur(${exitBlur}px)`,
      }}
    >
      {/* Ambient deep glow behind everything */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 55% 40% at 50% 50%, ${color.brand}26 0%, transparent 70%)`,
          opacity: ambient,
        }}
      />

      {/* Hex grid */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: grid,
          backgroundImage:
            "linear-gradient(to right, #ffffff09 1px, transparent 1px), linear-gradient(to bottom, #ffffff09 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 60% 55% at 50% 50%, black 25%, transparent 92%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 55% at 50% 50%, black 25%, transparent 92%)",
        }}
      />

      {/* Subtle film grain */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          mixBlendMode: "overlay",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* Brand dot — the heartbeat */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 24,
          height: 24,
          borderRadius: 9999,
          backgroundColor: color.brand,
          transform: `translate(-50%, -50%) scale(${dotScale})`,
          boxShadow: `0 0 ${56 * dotGlow}px ${color.brand}, 0 0 ${
            14 * dotGlow
          }px ${color.brand}`,
          opacity: dotSpring,
        }}
      />

      {/* Brackets */}
      <Bracket side="left" progress={bracketSpring} />
      <Bracket side="right" progress={bracketSpring} />

      {/* Whisper caption */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 200,
          display: "flex",
          justifyContent: "center",
          fontFamily: fonts.mono,
          fontSize: 22,
          letterSpacing: "0.36em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.78)",
        }}
      >
        <div style={{ display: "flex", gap: "0.7em" }}>
          {tokens.map((tok, i) => {
            const start = captionStart + i * 10;
            const wordSpring = spring({
              frame: frame - start,
              fps,
              config: { damping: 16, mass: 0.7, stiffness: 110 },
            });
            const lift = interpolate(wordSpring, [0, 1], [10, 0]);
            const blur = interpolate(wordSpring, [0, 1], [6, 0]);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: wordSpring,
                  transform: `translateY(${lift}px)`,
                  filter: `blur(${blur}px)`,
                  color: tok.brand ? color.brand : "rgba(255,255,255,0.78)",
                }}
              >
                {tok.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Bracket: React.FC<{
  side: "left" | "right";
  progress: number;
}> = ({ side, progress }) => {
  const size = 96;
  const offset = 620;
  const slide = interpolate(progress, [0, 1], [60, 0]);
  const opacity = progress * 0.85;
  const isLeft = side === "left";
  const x = isLeft ? -offset - slide : offset + slide;
  const path = isLeft
    ? `M 28 4 L 4 4 L 4 ${size - 4} L 28 ${size - 4}`
    : `M ${size - 28} 4 L ${size - 4} 4 L ${size - 4} ${size - 4} L ${
        size - 28
      } ${size - 4}`;
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
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="square"
      />
    </svg>
  );
};
