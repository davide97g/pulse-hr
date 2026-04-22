import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";

export const Commessa: React.FC = () => {
  const frame = useCurrentFrame();

  const chipIn = interpolate(frame, [0, 18], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chipTranslate = interpolate(chipIn, [0, 1], [18, 0]);

  const clockReveal = Math.floor(
    interpolate(frame, [10, 34], [0, 5], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const clockText = "09:00".slice(0, clockReveal);
  const showCaret = frame % 20 < 10;

  const overline = interpolate(frame, [2, 16], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "flex-start", paddingLeft: 24 }}
    >
      <div
        style={{
          opacity: overline,
          fontFamily: fonts.mono,
          fontSize: 13,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: color.brand,
          marginBottom: 16,
        }}
      >
        Lunedì · 22 aprile
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          transform: `translateY(${chipTranslate}px)`,
          opacity: chipIn,
        }}
      >
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 140,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {clockText}
          <span style={{ opacity: showCaret ? 1 : 0, color: color.brand }}>_</span>
        </div>
      </div>

      <div
        style={{
          marginTop: 28,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          borderRadius: 9999,
          border: `1px solid ${color.brand}55`,
          background: `${color.brand}14`,
          fontFamily: fonts.mono,
          fontSize: 16,
          color: color.cream,
          opacity: chipIn,
          transform: `translateY(${chipTranslate * 1.5}px)`,
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
        commessa · ACME-2026-Q2
      </div>
    </AbsoluteFill>
  );
};
