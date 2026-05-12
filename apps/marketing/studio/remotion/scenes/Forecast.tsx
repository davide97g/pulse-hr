import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";

export const Forecast: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 20], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const saturation = interpolate(frame, [8, 46], [0.62, 0.94], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bars = Array.from({ length: 12 }, (_, i) => {
    const grow = interpolate(frame, [6 + i * 2, 22 + i * 2], [0, 1], {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const h = 20 + Math.sin(i * 0.6) * 26 + i * 6;
    return { grow, h };
  });

  const sliderX = interpolate(frame, [18, 44], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
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
        Forecast · saturazione commessa
      </div>

      <div style={{ display: "flex", gap: 36, alignItems: "flex-end", opacity: enter }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            height: 180,
            padding: "0 4px",
          }}
        >
          {bars.map((b, i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: b.h * b.grow,
                borderRadius: 4,
                background:
                  i < 8
                    ? `linear-gradient(180deg, ${color.brand} 0%, ${color.brand}66 100%)`
                    : `linear-gradient(180deg, ${color.role.hr} 0%, ${color.role.hr}55 100%)`,
                boxShadow: i === 11 ? `0 0 18px ${color.role.hr}aa` : "none",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 280 }}>
          <div
            style={{
              fontFamily: fonts.display,
              fontSize: 72,
              lineHeight: 1,
              color: color.cream,
              letterSpacing: "-0.02em",
            }}
          >
            {Math.round(saturation * 100)}
            <span style={{ color: color.brand, fontSize: 40 }}>%</span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${saturation * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${color.brand} 0%, ${color.role.hr} 100%)`,
              }}
            />
          </div>
          <div
            style={{
              position: "relative",
              height: 28,
              marginTop: 6,
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                transform: "translate(-50%, -50%)",
                left: `${6 + sliderX * 82}%`,
                width: 20,
                height: 20,
                borderRadius: 9999,
                background: color.brand,
                boxShadow: `0 0 14px ${color.brand}aa`,
              }}
            />
          </div>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            scenario · +2 settimane
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
