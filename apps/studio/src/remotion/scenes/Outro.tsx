import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";

export const OUTRO_DURATION_FRAMES = 60;

interface Props {
  tagline?: string;
  url?: string;
}

export const Outro: React.FC<Props> = ({
  tagline = "HR you can read, fork, and run.",
  url = "pulsehr.it",
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const square = width <= 1080 && Math.abs(width - 1080) < 1;

  const enter = interpolate(frame, [0, 18], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glow = interpolate(frame, [10, 40], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fade = interpolate(frame, [50, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineSize = square ? 40 : 56;
  const pillSize = square ? 14 : 16;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        color: color.cream,
        fontFamily: fonts.sans,
        justifyContent: "center",
        alignItems: "center",
        opacity: fade,
      }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: taglineSize,
          letterSpacing: "-0.02em",
          textAlign: "center",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 12}px)`,
          maxWidth: square ? 880 : 1400,
          padding: "0 40px",
        }}
      >
        {(() => {
          const trimmed = tagline.replace(/\.$/, "");
          if (!trimmed.includes(",")) return tagline;
          const [head, ...rest] = trimmed.split(",");
          return (
            <>
              {head},
              <em style={{ color: color.brand, fontStyle: "italic" }}>
                {rest.join(",")}
              </em>
              <span style={{ color: color.brand }}>.</span>
            </>
          );
        })()}
      </div>

      <div
        style={{
          marginTop: 22,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 16px",
          borderRadius: 9999,
          border: `1px solid ${color.brand}55`,
          fontFamily: fonts.mono,
          fontSize: pillSize,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.7)",
          opacity: enter,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 9999,
            backgroundColor: color.brand,
            boxShadow: `0 0 12px ${color.brand}`,
          }}
        />
        {url}
      </div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(ellipse 50% 40% at 50% 60%, ${color.brand}26 0%, transparent 70%)`,
          opacity: glow,
        }}
      />
    </AbsoluteFill>
  );
};
