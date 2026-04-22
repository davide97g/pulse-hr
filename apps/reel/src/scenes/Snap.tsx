import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";

const TILES = [
  { key: "Money", accent: color.role.finance, from: -360 },
  { key: "People", accent: color.role.hr, from: 360 },
  { key: "Work", accent: color.role.admin, from: -360 },
];

export const Snap: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 14], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const snap = interpolate(frame, [4, 28], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headline = interpolate(frame, [22, 44], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glow = interpolate(frame, [26, 52], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          gap: 20,
          opacity: enter,
          marginBottom: 32,
        }}
      >
        {TILES.map((t, i) => {
          const tx = interpolate(snap, [0, 1], [t.from, 0]);
          return (
            <div
              key={t.key}
              style={{
                width: 180,
                height: 180,
                borderRadius: 20,
                border: `1px solid ${t.accent}55`,
                background: `linear-gradient(140deg, ${t.accent}18 0%, rgba(255,255,255,0.02) 100%)`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: 18,
                transform: `translateX(${tx}px)`,
                boxShadow: `0 20px 60px ${t.accent}22`,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: t.accent,
                  marginBottom: 6,
                }}
              >
                modulo · 0{i + 1}
              </div>
              <div
                style={{
                  fontFamily: fonts.display,
                  fontSize: 36,
                  letterSpacing: "-0.02em",
                  color: color.cream,
                }}
              >
                {t.key}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 56,
          letterSpacing: "-0.02em",
          color: color.cream,
          opacity: headline,
          transform: `translateY(${(1 - headline) * 12}px)`,
          textAlign: "center",
        }}
      >
        HR you can <em style={{ color: color.brand, fontStyle: "italic" }}>read</em>, fork, and run
        <span style={{ color: color.brand }}>.</span>
      </div>

      <div
        style={{
          marginTop: 14,
          fontFamily: fonts.mono,
          fontSize: 13,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          opacity: headline,
        }}
      >
        pulsehr.it · open source · FSL-1.1-MIT
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
