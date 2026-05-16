import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";
import { tokenizeBrandText } from "./text";

export interface TimedCaption {
  /** Caption text. Wrap a word in *asterisks* to render it in brand color. */
  text: string;
  /** Onset in milliseconds, relative to the start of the parent Sequence. */
  atMs: number;
  /** How long the caption stays on screen, in milliseconds. */
  holdMs: number;
}

interface Props {
  /** Cue list, sorted ascending by atMs. */
  cues: TimedCaption[];
  /** Optional override for the bottom margin (px). */
  bottom?: number;
}

const FADE_OUT_MS = 240;
const WORD_STAGGER_MS = 55;

export const Caption: React.FC<Props> = ({ cues, bottom }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const portrait = height > width;
  const square = !portrait && width <= 1080 && Math.abs(width - 1080) < 1;

  const active = cues.find((c) => ms >= c.atMs && ms <= c.atMs + c.holdMs);
  if (!active) return null;

  const localMs = ms - active.atMs;
  const tokens = tokenizeBrandText(active.text);

  const fadeOut = interpolate(
    localMs,
    [active.holdMs - FADE_OUT_MS, active.holdMs],
    [1, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Portrait reels sit captions higher up (above the home indicator zone) and
  // wrap to the phone width. Sizing reads bigger because the viewer is closer.
  const fontSize = portrait ? 48 : square ? 32 : 42;
  const padX = portrait ? 22 : square ? 22 : 30;
  const padY = portrait ? 14 : square ? 12 : 16;
  const bottomPx =
    bottom ?? (portrait ? 220 : square ? 90 : 130);
  const maxWidth = portrait ? 940 : square ? 760 : 1180;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomPx,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity: fadeOut,
          padding: `${padY}px ${padX}px`,
          borderRadius: 16,
          backgroundColor: "rgba(11, 11, 13, 0.72)",
          backdropFilter: "blur(14px) saturate(160%)",
          WebkitBackdropFilter: "blur(14px) saturate(160%)",
          border: `1px solid ${color.brand}26`,
          color: color.cream,
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize,
          letterSpacing: "-0.015em",
          lineHeight: 1.1,
          textAlign: "center",
          maxWidth,
          boxShadow: `0 18px 56px rgba(0,0,0,0.45), 0 0 28px ${color.brand}22`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.28em",
        }}
      >
        {tokens.map((tok, i) => {
          const startMs = i * WORD_STAGGER_MS;
          const t = (localMs - startMs) / 1000;
          const wordSpring = spring({
            frame: t * fps,
            fps,
            config: { damping: 16, mass: 0.6, stiffness: 140 },
          });
          const lift = interpolate(wordSpring, [0, 1], [12, 0]);
          const blur = interpolate(wordSpring, [0, 1], [6, 0]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: wordSpring,
                transform: `translateY(${lift}px)`,
                filter: `blur(${blur}px)`,
                color: tok.brand ? color.brand : color.cream,
              }}
            >
              {tok.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
