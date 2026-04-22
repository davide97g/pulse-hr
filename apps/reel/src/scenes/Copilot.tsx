import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";

const PROMPT = "riassumi lo sprint su ACME-2026-Q2";
const REPLY =
  "Settimana 17: 37.5h · saturazione 94%. Rischio sforamento entro +2 settimane. Apro il forecast?";

export const Copilot: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 14], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const promptChars = Math.floor(
    interpolate(frame, [4, 28], [0, PROMPT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const replyChars = Math.floor(
    interpolate(frame, [30, 60], [0, REPLY.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const toolChipIn = interpolate(frame, [52, 62], [0, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const caretOn = frame % 16 < 8;

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
        ⌘J · Copilot
      </div>

      <div
        style={{
          width: 820,
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.03)",
          padding: 24,
          boxShadow: `0 40px 120px ${color.brand}22`,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 16}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            fontFamily: fonts.mono,
            fontSize: 18,
            color: color.cream,
          }}
        >
          <span style={{ color: color.brand }}>{">"}</span>
          <span>
            {PROMPT.slice(0, promptChars)}
            {promptChars < PROMPT.length && caretOn ? (
              <span style={{ color: color.brand }}>|</span>
            ) : null}
          </span>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: "16px 18px",
            borderRadius: 12,
            background: "rgba(180,255,57,0.04)",
            fontFamily: fonts.sans,
            fontSize: 18,
            lineHeight: 1.5,
            minHeight: 80,
            color: color.cream,
          }}
        >
          {REPLY.slice(0, replyChars)}
          {replyChars < REPLY.length && caretOn ? (
            <span style={{ color: color.brand }}>▍</span>
          ) : null}
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 10,
            opacity: toolChipIn,
            transform: `scale(${0.9 + toolChipIn * 0.1})`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 9999,
              border: `1px solid ${color.brand}66`,
              background: `${color.brand}18`,
              fontFamily: fonts.mono,
              fontSize: 13,
              color: color.brand,
            }}
          >
            → navigate("/forecast")
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
