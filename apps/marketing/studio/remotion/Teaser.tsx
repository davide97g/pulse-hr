import {
  AbsoluteFill,
  Audio,
  Easing,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color } from "./tokens";
import { fonts } from "./fonts";
import { tokenizeBrandText } from "./components/text";
import {
  TeaserMontage,
  type TeaserClip,
  type TeaserSection,
} from "./scenes/TeaserMontage";

// ── Composition layout — 600 frames @ 30fps = 20s ─────────────────────────
// 0–30    (1s)   Title flash
// 30–540  (17s)  TeaserMontage — 29 cuts, weighted toward Skills · Me
// 540–600 (2s)   Tagline + chip outro
const TITLE_FRAMES = 30;
const MONTAGE_FRAMES = 510;
const OUTRO_FRAMES = 60;

export const TEASER_DURATION_FRAMES =
  TITLE_FRAMES + MONTAGE_FRAMES + OUTRO_FRAMES;

// ── Capture paths ─────────────────────────────────────────────────────────
const CAPTURE = {
  dashboard: "captures/teaser-dashboard/clip.mp4",
  growth: "captures/teaser-growth/clip.mp4",
  skillsTeam: "captures/teaser-skills-team/clip.mp4",
  skillsMe: "captures/teaser-skills-me/clip.mp4",
  moments: "captures/teaser-moments/clip.mp4",
  log: "captures/teaser-log/clip.mp4",
  reports: "captures/teaser-reports/clip.mp4",
};

// ── Clip plan — 29 clips, totalling exactly 510 frames ────────────────────
// Strides: 3*18 + 5*18 + 2*15 + 5*21 + 3*18 + 3*18 + 3*18 + 4*12 = 489
// Final clip frames=21 → total 510.
const CLIPS: TeaserClip[] = [
  // DASHBOARD — clips 0..2 (3 × 21f)
  { capturePath: CAPTURE.dashboard, startFrame: 40, frames: 21, scaleFrom: 1.14, scaleTo: 1.06 },
  { capturePath: CAPTURE.dashboard, startFrame: 100, frames: 21, scaleFrom: 1.08, scaleTo: 1.18 },
  { capturePath: CAPTURE.dashboard, startFrame: 170, frames: 21, scaleFrom: 1.06, scaleTo: 1.18 },

  // GROWTH — clips 3..7 (5 × 21f)
  { capturePath: CAPTURE.growth, startFrame: 30, frames: 21, scaleFrom: 1.1, scaleTo: 1.18 },
  { capturePath: CAPTURE.growth, startFrame: 80, frames: 21, scaleFrom: 1.06, scaleTo: 1.16 },
  { capturePath: CAPTURE.growth, startFrame: 130, frames: 21, scaleFrom: 1.12, scaleTo: 1.22 },
  { capturePath: CAPTURE.growth, startFrame: 180, frames: 21, scaleFrom: 1.04, scaleTo: 1.14 },
  { capturePath: CAPTURE.growth, startFrame: 230, frames: 21, scaleFrom: 1.1, scaleTo: 1.2 },

  // SKILLS · TEAM — clips 8..9 (2 × 18f — fast snapshot)
  { capturePath: CAPTURE.skillsTeam, startFrame: 60, frames: 18, scaleFrom: 1.1, scaleTo: 1.18 },
  { capturePath: CAPTURE.skillsTeam, startFrame: 140, frames: 18, scaleFrom: 1.08, scaleTo: 1.18 },

  // SKILLS · ME — clips 10..14 (5 × 24f — longer focus, the user's emphasis)
  { capturePath: CAPTURE.skillsMe, startFrame: 60, frames: 24, scaleFrom: 1.16, scaleTo: 1.04 },
  { capturePath: CAPTURE.skillsMe, startFrame: 150, frames: 24, scaleFrom: 1.06, scaleTo: 1.2 },
  { capturePath: CAPTURE.skillsMe, startFrame: 240, frames: 24, scaleFrom: 1.08, scaleTo: 1.22 },
  { capturePath: CAPTURE.skillsMe, startFrame: 360, frames: 24, scaleFrom: 1.1, scaleTo: 1.24 },
  { capturePath: CAPTURE.skillsMe, startFrame: 480, frames: 24, scaleFrom: 1.06, scaleTo: 1.22 },

  // MOMENTS — clips 15..17 (3 × 21f)
  { capturePath: CAPTURE.moments, startFrame: 30, frames: 21, scaleFrom: 1.12, scaleTo: 1.04 },
  { capturePath: CAPTURE.moments, startFrame: 90, frames: 21, scaleFrom: 1.06, scaleTo: 1.18 },
  { capturePath: CAPTURE.moments, startFrame: 150, frames: 21, scaleFrom: 1.08, scaleTo: 1.2 },

  // STATUS LOG — clips 18..20 (3 × 21f)
  { capturePath: CAPTURE.log, startFrame: 30, frames: 21, scaleFrom: 1.1, scaleTo: 1.04 },
  { capturePath: CAPTURE.log, startFrame: 90, frames: 21, scaleFrom: 1.06, scaleTo: 1.18 },
  { capturePath: CAPTURE.log, startFrame: 150, frames: 21, scaleFrom: 1.08, scaleTo: 1.2 },

  // INSIGHTS — clips 21..23 (3 × 21f)
  { capturePath: CAPTURE.reports, startFrame: 30, frames: 21, scaleFrom: 1.1, scaleTo: 1.04 },
  { capturePath: CAPTURE.reports, startFrame: 90, frames: 21, scaleFrom: 1.06, scaleTo: 1.18 },
  { capturePath: CAPTURE.reports, startFrame: 150, frames: 21, scaleFrom: 1.08, scaleTo: 1.2 },

  // RECAP — clips 24..28 (4 × 15f + 1 × 21f) accelerating intercut, last clip lingers
  { capturePath: CAPTURE.skillsMe, startFrame: 300, frames: 15, scaleFrom: 1.16, scaleTo: 1.28 },
  { capturePath: CAPTURE.dashboard, startFrame: 80, frames: 15, scaleFrom: 1.12, scaleTo: 1.24 },
  { capturePath: CAPTURE.growth, startFrame: 110, frames: 15, scaleFrom: 1.14, scaleTo: 1.26 },
  { capturePath: CAPTURE.moments, startFrame: 70, frames: 15, scaleFrom: 1.18, scaleTo: 1.3 },
  { capturePath: CAPTURE.skillsMe, startFrame: 420, frames: 21, scaleFrom: 1.08, scaleTo: 1.2 },
];

const SECTIONS: TeaserSection[] = [
  { label: "DASHBOARD", fromClipIndex: 0, toClipIndex: 2 },
  { label: "GROWTH", fromClipIndex: 3, toClipIndex: 7 },
  { label: "SKILLS · TEAM", fromClipIndex: 8, toClipIndex: 9 },
  { label: "SKILLS · ME", fromClipIndex: 10, toClipIndex: 14 },
  { label: "MOMENTS", fromClipIndex: 15, toClipIndex: 17 },
  { label: "STATUS LOG", fromClipIndex: 18, toClipIndex: 20 },
  { label: "INSIGHTS", fromClipIndex: 21, toClipIndex: 23 },
  { label: "PULSE HR", fromClipIndex: 24, toClipIndex: 28 },
];

export interface TeaserProps {
  /** Path within studio/ to the soundtrack. */
  audioSrc: string;
}

export const Teaser: React.FC<TeaserProps> = ({ audioSrc }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        color: color.cream,
        fontFamily: fonts.sans,
      }}
    >
      <Audio src={staticFile(audioSrc)} volume={0.92} />

      <Series>
        <Series.Sequence durationInFrames={TITLE_FRAMES} name="Title">
          <TitleFlash text="Pulse *HR*." />
        </Series.Sequence>

        <Series.Sequence durationInFrames={MONTAGE_FRAMES} name="Montage">
          <TeaserMontage clips={CLIPS} crossfadeFrames={3} sections={SECTIONS} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={OUTRO_FRAMES} name="Outro">
          <TeaserOutro tagline="Your *whole* team. One *pulse*." />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

// ── Title flash (30 frames) ───────────────────────────────────────────────
const TitleFlash: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = tokenizeBrandText(text);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${color.brand}22 0%, transparent 70%)`,
          opacity: interpolate(frame, [0, 6, 22, 30], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <div
        style={{
          display: "flex",
          gap: "0.4em",
          fontFamily: fonts.display,
          fontSize: 140,
          fontWeight: 600,
          letterSpacing: "-0.025em",
          color: "#ffffff",
          textShadow: "0 24px 80px rgba(0,0,0,0.85), 0 0 60px rgba(155,135,255,0.18)",
          opacity: interpolate(frame, [22, 30], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {tokens.map((tok, i) => {
          const start = i * 4;
          const sp = spring({
            frame: frame - start,
            fps,
            config: { damping: 14, mass: 0.8, stiffness: 170 },
          });
          const lift = interpolate(sp, [0, 1], [40, 0]);
          const blur = interpolate(sp, [0, 1], [12, 0]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: sp,
                transform: `translateY(${lift}px)`,
                filter: `blur(${blur}px)`,
                color: tok.brand ? color.brand : "#ffffff",
                fontStyle: tok.brand ? "italic" : "normal",
              }}
            >
              {tok.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Outro (60 frames) ─────────────────────────────────────────────────────
const TeaserOutro: React.FC<{ tagline: string }> = ({ tagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ambient = interpolate(frame, [0, 18], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const surroundsFade = interpolate(frame, [42, 60], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chipSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 130 },
  });

  const dotPulse = 0.82 + 0.18 * Math.sin(((frame - 18) / fps) * Math.PI * 1.8);
  const tokens = tokenizeBrandText(tagline);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        color: color.cream,
        fontFamily: fonts.sans,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 55% 45% at 50% 55%, ${color.brand}33 0%, transparent 70%)`,
          opacity: ambient * surroundsFade,
        }}
      />

      <div
        style={{
          opacity: surroundsFade,
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize: 84,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          textAlign: "center",
          display: "flex",
          gap: "0.28em",
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: 1500,
          padding: "0 60px",
        }}
      >
        {tokens.map((tok, i) => {
          const start = 2 + i * 3;
          const sp = spring({
            frame: frame - start,
            fps,
            config: { damping: 18, mass: 0.7, stiffness: 130 },
          });
          const lift = interpolate(sp, [0, 1], [22, 0]);
          const blur = interpolate(sp, [0, 1], [10, 0]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: sp,
                transform: `translateY(${lift}px)`,
                filter: `blur(${blur}px)`,
                color: tok.brand ? color.brand : "#ffffff",
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
          marginTop: 28,
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
          fontSize: 16,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.78)",
          opacity: chipSpring,
          transform: `translateY(${(1 - chipSpring) * 10}px) scale(${interpolate(
            chipSpring,
            [0, 1],
            [0.94, 1],
          )})`,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 9999,
            backgroundColor: color.brand,
            boxShadow: `0 0 ${16 * dotPulse}px ${color.brand}`,
            transform: `scale(${dotPulse})`,
          }}
        />
        app.pulsehr.it
      </div>
    </AbsoluteFill>
  );
};
