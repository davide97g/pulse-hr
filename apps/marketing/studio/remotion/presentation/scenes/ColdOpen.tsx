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
import { MeshGradientBackdrop, ShaderVignette } from "../shaders";

export const COLD_OPEN_FRAMES = 120;

export const ColdOpen: React.FC<{ aspect: "1080" | "shorts" }> = ({ aspect }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const portrait = aspect === "shorts" || height > width;

  const fade = interpolate(frame, [0, 20, 90, COLD_OPEN_FRAMES], [0, 1, 1, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const wordmarkSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 18, mass: 0.9, stiffness: 110 },
  });
  const wordmarkLift = interpolate(wordmarkSpring, [0, 1], [22, 0]);
  const wordmarkBlur = interpolate(wordmarkSpring, [0, 1], [10, 0]);

  const eyebrowSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 130 },
  });

  const titleSize = portrait ? 124 : 168;
  const eyebrowSize = portrait ? 14 : 15;

  return (
    <AbsoluteFill style={{ opacity: fade, backgroundColor: color.ink }}>
      <MeshGradientBackdrop speed={0.3} distortion={0.6} swirl={0.3} />
      <ShaderVignette opacity={0.55} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          color: color.cream,
          fontFamily: fonts.sans,
          textAlign: "center",
          padding: portrait ? 64 : 96,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: eyebrowSize,
            letterSpacing: "0.36em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.65)",
            opacity: eyebrowSpring,
            transform: `translateY(${(1 - eyebrowSpring) * 8}px)`,
            marginBottom: 28,
          }}
        >
          People-first · 2026
        </div>

        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontStyle: "italic",
            fontSize: titleSize,
            letterSpacing: "-0.035em",
            lineHeight: 0.95,
            transform: `translateY(${wordmarkLift}px)`,
            filter: `blur(${wordmarkBlur}px)`,
            opacity: wordmarkSpring,
            color: color.cream,
            textShadow: `0 0 32px ${color.brand}22`,
          }}
        >
          Pulse HR
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
