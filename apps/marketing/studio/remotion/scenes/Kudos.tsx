import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";

const CONFETTI_COLORS = [
  color.brand,
  color.role.manager,
  color.role.hr,
  color.role.admin,
  color.role.finance,
];

const PIECES = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 37) % 900,
  rot: (i * 53) % 360,
  delay: (i % 10) * 1.5,
  c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 6 + ((i * 7) % 10),
}));

const LEADERBOARD = [
  { name: "Giulia R.", coins: 42 },
  { name: "Marco T.", coins: 38 },
  { name: "Sara P.", coins: 31, highlight: true },
];

export const Kudos: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 16], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const flip = interpolate(frame, [4, 24], [0, 540], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const plusFive = interpolate(frame, [18, 32], [0, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
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
        Kudos · peer recognition
      </div>

      <div
        style={{
          display: "flex",
          gap: 48,
          alignItems: "center",
          opacity: enter,
        }}
      >
        <div
          style={{
            position: "relative",
            perspective: 800,
          }}
        >
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 9999,
              background: `radial-gradient(circle at 30% 30%, ${color.brand} 0%, #88c820 100%)`,
              boxShadow: `0 0 80px ${color.brand}66`,
              transform: `rotateY(${flip}deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: fonts.display,
              fontSize: 72,
              color: color.ink,
            }}
          >
            ★
          </div>
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -40,
              fontFamily: fonts.display,
              fontSize: 56,
              color: color.brand,
              opacity: plusFive,
              transform: `scale(${0.6 + plusFive * 0.4}) translateY(${(1 - plusFive) * 20}px)`,
            }}
          >
            +5
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minWidth: 320,
          }}
        >
          {LEADERBOARD.map((row, i) => {
            const rowIn = interpolate(frame, [8 + i * 4, 22 + i * 4], [0, 1], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={row.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: row.highlight
                    ? `1px solid ${color.brand}66`
                    : "1px solid rgba(255,255,255,0.08)",
                  background: row.highlight ? `${color.brand}15` : "rgba(255,255,255,0.03)",
                  fontFamily: fonts.sans,
                  fontSize: 18,
                  opacity: rowIn,
                  transform: `translateX(${(1 - rowIn) * -16}px)`,
                }}
              >
                <span>{row.name}</span>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    color: row.highlight ? color.brand : color.cream,
                  }}
                >
                  {row.coins + (row.highlight ? Math.round(plusFive * 5) : 0)} ◎
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {PIECES.map((p, i) => {
        const t = interpolate(frame, [18 + p.delay, 48 + p.delay], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 200 + p.x * 0.9,
              top: 260 - t * 260,
              width: p.size,
              height: p.size * 0.4,
              background: p.c,
              borderRadius: 2,
              opacity: t * (1 - t) * 4,
              transform: `rotate(${p.rot + t * 360}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
