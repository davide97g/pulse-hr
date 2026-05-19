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

export const OUTRO_RESOLVE_FRAMES = 345;

export const OutroResolve: React.FC<{ aspect: "1080" | "shorts" }> = ({ aspect }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const portrait = aspect === "shorts";

  const fade = interpolate(
    frame,
    [0, 16, OUTRO_RESOLVE_FRAMES - 20, OUTRO_RESOLVE_FRAMES],
    [0, 1, 1, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const wordmarkSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 18, mass: 0.9, stiffness: 110 },
  });

  const taglineSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 130 },
  });

  const urlSpring = spring({
    frame: frame - 50,
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 130 },
  });

  // Breathing pulse on the URL dot.
  const dotPulse = 0.85 + 0.15 * Math.sin(((frame - 50) / fps) * Math.PI * 1.6);

  const wordmarkSize = portrait ? 110 : 152;
  const taglineSize = portrait ? 44 : 64;
  const pillSize = portrait ? 14 : 16;

  return (
    <AbsoluteFill style={{ opacity: fade, backgroundColor: color.ink }}>
      <MeshGradientBackdrop speed={0.25} distortion={0.55} swirl={0.25} />
      <ShaderVignette opacity={0.55} />

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
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: wordmarkSize,
            letterSpacing: "-0.035em",
            lineHeight: 0.95,
            opacity: wordmarkSpring,
            transform: `translateY(${(1 - wordmarkSpring) * 16}px)`,
            filter: `blur(${(1 - wordmarkSpring) * 8}px)`,
            color: color.cream,
            textShadow: `0 0 40px ${color.brand}33`,
          }}
        >
          Pulse HR
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: taglineSize,
            letterSpacing: "-0.02em",
            color: color.brand,
            opacity: taglineSpring,
            transform: `translateY(${(1 - taglineSpring) * 10}px)`,
          }}
        >
          People-first.
        </div>

        <div
          style={{
            marginTop: 36,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 18px",
            borderRadius: 9999,
            border: `1px solid ${color.brand}55`,
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            fontFamily: fonts.mono,
            fontSize: pillSize,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.82)",
            opacity: urlSpring,
            transform: `translateY(${(1 - urlSpring) * 10}px)`,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              backgroundColor: color.brand,
              boxShadow: `0 0 ${16 * dotPulse}px ${color.brand}`,
              transform: `scale(${dotPulse})`,
            }}
          />
          pulsehr.it
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
