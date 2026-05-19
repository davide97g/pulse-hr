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
import { tokenizeBrandText } from "../../components/text";
import { ShaderVignette } from "../shaders";

export const VALUE_CARD_FRAMES = 150;

type ShaderSlot = React.ReactNode;

interface Props {
  /** Roman numeral or single-digit identifier (e.g. "I", "II"). */
  numeral: string;
  /** Short label, mono uppercase eyebrow. */
  eyebrow: string;
  /** Italic Fraunces line, supports `*brand*` spans. */
  line: string;
  /** Aspect-aware shader background. */
  shader: ShaderSlot;
  aspect: "1080" | "shorts";
}

export const ValueCard: React.FC<Props> = ({
  numeral,
  eyebrow,
  line,
  shader,
  aspect,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const portrait = aspect === "shorts";

  const enter = interpolate(frame, [0, 18], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(
    frame,
    [VALUE_CARD_FRAMES - 18, VALUE_CARD_FRAMES],
    [1, 0],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const fade = enter * exit;

  const numeralSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 18, mass: 0.9, stiffness: 110 },
  });

  const eyebrowSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 130 },
  });

  const tokens = tokenizeBrandText(line);

  const lineSize = portrait ? 64 : 96;
  const eyebrowSize = portrait ? 13 : 15;
  const numeralSize = portrait ? 84 : 132;

  return (
    <AbsoluteFill style={{ opacity: fade, backgroundColor: color.ink }}>
      {shader}
      <ShaderVignette opacity={0.62} />

      <AbsoluteFill
        style={{
          color: color.cream,
          fontFamily: fonts.sans,
          paddingTop: portrait ? 96 : 96,
          paddingBottom: portrait ? 320 : 260,
          paddingLeft: portrait ? 56 : 144,
          paddingRight: portrait ? 56 : 144,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: portrait ? 22 : 32,
        }}
      >
        {/* Numeral — centered, brand-color glow */}
        <div
          style={{
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontSize: numeralSize,
            lineHeight: 0.9,
            color: color.brand,
            opacity: numeralSpring * 0.9,
            letterSpacing: "-0.03em",
            transform: `translateY(${(1 - numeralSpring) * 14}px)`,
            textShadow: `0 0 36px ${color.brand}66`,
          }}
        >
          {numeral}
        </div>

        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: eyebrowSize,
            letterSpacing: "0.36em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)",
            opacity: eyebrowSpring,
            transform: `translateY(${(1 - eyebrowSpring) * 6}px)`,
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: lineSize,
            letterSpacing: "-0.025em",
            lineHeight: 1.04,
            maxWidth: portrait ? 880 : 1400,
            display: "flex",
            flexWrap: "wrap",
            gap: "0.28em",
            justifyContent: "center",
          }}
        >
          {tokens.map((tok, i) => {
            const start = 22 + i * 3;
            const wordSpring = spring({
              frame: frame - start,
              fps,
              config: { damping: 16, mass: 0.7, stiffness: 130 },
            });
            const lift = interpolate(wordSpring, [0, 1], [18, 0]);
            const blur = interpolate(wordSpring, [0, 1], [8, 0]);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: wordSpring,
                  transform: `translateY(${lift}px)`,
                  filter: `blur(${blur}px)`,
                  color: tok.brand ? color.brand : color.cream,
                  textShadow: tok.brand
                    ? `0 0 24px ${color.brand}55`
                    : "0 2px 24px rgba(0,0,0,0.55)",
                }}
              >
                {tok.text}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
