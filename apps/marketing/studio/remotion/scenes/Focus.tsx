import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";

export const Focus: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 16], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const totalSeconds = 25 * 60;
  const tick = Math.floor(
    interpolate(frame, [8, 48], [0, 80], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const remaining = totalSeconds - tick;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const ring = (frame % 60) / 60;

  const toastIn = interpolate(frame, [22, 36], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-start", paddingLeft: 24 }}>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 13,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          marginBottom: 14,
          opacity: enter,
        }}
      >
        Focus · deep work
      </div>

      <div style={{ display: "flex", gap: 48, alignItems: "center", opacity: enter }}>
        <div
          style={{
            position: "relative",
            width: 220,
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 9999,
              border: `2px solid ${color.brand}`,
              opacity: 1 - ring,
              transform: `scale(${0.9 + ring * 0.3})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 12,
              borderRadius: 9999,
              border: `1px solid ${color.brand}44`,
            }}
          />
          <div
            style={{
              fontFamily: fonts.display,
              fontSize: 64,
              color: color.cream,
              letterSpacing: "-0.02em",
            }}
          >
            {mm}:{ss}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              border: `1px solid ${color.brand}55`,
              background: `${color.brand}14`,
              fontFamily: fonts.sans,
              fontSize: 18,
              maxWidth: 360,
              opacity: toastIn,
              transform: `translateX(${(1 - toastIn) * -24}px)`,
            }}
          >
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: color.brand,
                marginBottom: 4,
              }}
            >
              auto-decline
            </div>
            3 meeting rifiutati · slot protetto
          </div>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.1em",
            }}
          >
            commessa · ACME-2026-Q2
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
