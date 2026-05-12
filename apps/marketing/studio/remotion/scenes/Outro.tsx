import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
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

const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1);

interface Token {
  text: string;
  brand: boolean;
}

const tokenize = (raw: string): Token[] => {
  const trimmed = raw.replace(/\.$/, "");
  if (!trimmed.includes(",")) {
    return trimmed.split(" ").map((w) => ({ text: w, brand: false }));
  }
  const idx = trimmed.indexOf(",");
  const head = trimmed.slice(0, idx);
  const tail = trimmed.slice(idx + 1).trimStart();
  const headTokens: Token[] = head
    .split(" ")
    .map((w) => ({ text: w, brand: false }));
  if (headTokens.length > 0) {
    headTokens[headTokens.length - 1] = {
      text: headTokens[headTokens.length - 1].text + ",",
      brand: false,
    };
  }
  const tailTokens: Token[] = tail
    .split(" ")
    .map((w) => ({ text: w, brand: true }));
  if (tailTokens.length > 0) {
    tailTokens[tailTokens.length - 1] = {
      text: tailTokens[tailTokens.length - 1].text + ".",
      brand: true,
    };
  }
  return [...headTokens, ...tailTokens];
};

export const Outro: React.FC<Props> = ({
  tagline = "HR, rebuilt.",
  url = "pulsehr.it",
}) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const square = width <= 1080 && Math.abs(width - 1080) < 1;

  const glow = interpolate(frame, [0, 36], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 130 },
  });

  // Breathing pulse on the CTA dot — subtle, after it lands.
  const dotPulse =
    0.85 + 0.15 * Math.sin(((frame - 28) / fps) * Math.PI * 1.6);

  const fade = interpolate(frame, [54, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineSize = square ? 44 : 64;
  const pillSize = square ? 14 : 16;
  const tokens = tokenize(tagline);

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
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 55% 45% at 50% 55%, ${color.brand}33 0%, transparent 70%)`,
          opacity: glow,
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: glow * 0.4,
          backgroundImage:
            "linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 90%)",
        }}
      />

      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize: taglineSize,
          letterSpacing: "-0.025em",
          lineHeight: 1.08,
          textAlign: "center",
          maxWidth: square ? 920 : 1500,
          padding: "0 60px",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.28em",
          justifyContent: "center",
        }}
      >
        {tokens.map((tok, i) => {
          const start = 4 + i * 3;
          const tokenSpring = spring({
            frame: frame - start,
            fps,
            config: { damping: 18, mass: 0.7, stiffness: 120 },
          });
          const lift = interpolate(tokenSpring, [0, 1], [18, 0]);
          const blur = interpolate(tokenSpring, [0, 1], [8, 0]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: tokenSpring,
                transform: `translateY(${lift}px)`,
                filter: `blur(${blur}px)`,
                color: tok.brand ? color.brand : color.cream,
                fontStyle: tok.brand ? "italic" : "normal",
              }}
            >
              {tok.text}
            </span>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 26,
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 18px",
          borderRadius: 9999,
          border: `1px solid ${color.brand}55`,
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          fontFamily: fonts.mono,
          fontSize: pillSize,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.78)",
          opacity: ctaSpring,
          transform: `translateY(${(1 - ctaSpring) * 10}px) scale(${interpolate(
            ctaSpring,
            [0, 1],
            [0.94, 1],
          )})`,
        }}
      >
        <span
          style={{
            position: "relative",
            width: 10,
            height: 10,
            borderRadius: 9999,
            backgroundColor: color.brand,
            boxShadow: `0 0 ${16 * dotPulse}px ${color.brand}`,
            transform: `scale(${dotPulse})`,
          }}
        />
        {url}
      </div>
    </AbsoluteFill>
  );
};
