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

interface Props {
  /** Italic Fraunces line, supports `*brand*` spans. */
  line: string;
  /** Aspect-aware shader background (already faded). */
  shader: React.ReactNode;
  durationFrames: number;
  aspect: "1080" | "shorts";
}

export const TagOut: React.FC<Props> = ({ line, shader, durationFrames, aspect }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const portrait = aspect === "shorts";

  const enter = interpolate(frame, [0, 10], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(frame, [durationFrames - 12, durationFrames], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fade = enter * exit;

  const tokens = tokenizeBrandText(line);
  const lineSize = portrait ? 60 : 96;

  return (
    <AbsoluteFill style={{ opacity: fade, backgroundColor: color.ink }}>
      {shader}
      <ShaderVignette opacity={0.55} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          color: color.cream,
          fontFamily: fonts.display,
          textAlign: "center",
          padding: portrait ? 56 : 144,
        }}
      >
        <div
          style={{
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: lineSize,
            letterSpacing: "-0.025em",
            lineHeight: 1.06,
            maxWidth: portrait ? 880 : 1500,
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
            const lift = interpolate(wordSpring, [0, 1], [16, 0]);
            const blur = interpolate(wordSpring, [0, 1], [6, 0]);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: wordSpring,
                  transform: `translateY(${lift}px)`,
                  filter: `blur(${blur}px)`,
                  color: tok.brand ? color.brand : color.cream,
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
