import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";

const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven"];
const HOURS = [7.5, 8, 7.5, 8, 6.5];

export const Timesheet: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 20], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const total = HOURS.reduce((a, b) => a + b, 0);
  const counter = interpolate(frame, [6, 48], [0, total], {
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
          fontFamily: fonts.mono,
          fontSize: 13,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          marginBottom: 14,
          opacity: enter,
        }}
      >
        Timesheet · settimana 17
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          transform: `translateY(${(1 - enter) * 16}px)`,
          opacity: enter,
        }}
      >
        {DAYS.map((day, i) => {
          const fill = interpolate(
            frame,
            [8 + i * 4, 22 + i * 4],
            [0, 1],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );
          return (
            <div
              key={day}
              style={{
                width: 104,
                height: 132,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                padding: 12,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                {day}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: "100%",
                  height: `${fill * (HOURS[i] / 8) * 100}%`,
                  background: `linear-gradient(180deg, ${color.brand}00 0%, ${color.brand}44 100%)`,
                  borderTop: `2px solid ${color.brand}`,
                }}
              />
              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: 26,
                  color: color.cream,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {(HOURS[i] * fill).toFixed(1)}h
              </div>
            </div>
          );
        })}

        <div
          style={{
            marginLeft: 24,
            alignSelf: "flex-end",
            padding: "12px 18px",
            borderRadius: 14,
            border: `1px solid ${color.brand}66`,
            background: `${color.brand}18`,
            fontFamily: fonts.display,
            fontSize: 44,
            color: color.brand,
            minWidth: 160,
          }}
        >
          {counter.toFixed(1)}h
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              marginTop: 4,
            }}
          >
            totali · ACME-2026-Q2
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
