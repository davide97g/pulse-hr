import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
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
} from "./scenes/TeaserMontage";

// ── Composition layout ────────────────────────────────────────────────────
// 0–30       (1.0s)   Brand title flash  ("Pulse HR.")
// 30–714     (22.8s)  Buildup: 5 slow title beats interleaved with 3 broad snapshots
// 714–858    (4.8s)   Fast-edit recap (10 close-ups + final linger)
// 858–1038   (6.0s)   Outro: two big titles ("Built in public…" / "Join us at pulsehr.it")
const TITLE_FRAMES = 30;
const BUILDUP_FRAMES = 684;
const FAST_FRAMES = 144;
const OUTRO_FRAMES = 180;

export const TEASER_DURATION_FRAMES =
  TITLE_FRAMES + BUILDUP_FRAMES + FAST_FRAMES + OUTRO_FRAMES;

// ── Capture paths ─────────────────────────────────────────────────────────
const CAPTURE = {
  dashboard: "captures/teaser-dashboard/clip.mp4",
  growth: "captures/teaser-growth/clip.mp4",
  skillsMe: "captures/teaser-skills-me/clip.mp4",
  skillsTeam: "captures/teaser-skills-team/clip.mp4",
  moments: "captures/teaser-moments/clip.mp4",
  log: "captures/teaser-log/clip.mp4",
  reports: "captures/teaser-reports/clip.mp4",
};

// ── Buildup beats — title → broad snapshot, slow & breathy ────────────────
// First beats sit longer to let the eye take in the broader scene; the close-up
// punchwork is saved for the fast-edit recap. The dashboard snapshot gets extra
// time + a slightly tighter push so the sentiment constellation reads clearly.
// Beat sum: 120+90+120+54+72+54+84+90 = 684
type BuildupBeat =
  | {
      kind: "title";
      frames: number;
      text: string;
      fontSize: number;
      maxWidth?: number;
    }
  | {
      kind: "snapshot";
      frames: number;
      capturePath: string;
      startFrame: number;
      scaleFrom: number;
      scaleTo: number;
      label: string;
    };

const BUILDUP_BEATS: BuildupBeat[] = [
  {
    kind: "title",
    frames: 120,
    text: "Since the *beginning*, work has been caged — in boxes, spreadsheets, numbers.",
    fontSize: 76,
    maxWidth: 1500,
  },
  {
    kind: "snapshot",
    frames: 90,
    capturePath: CAPTURE.dashboard,
    startFrame: 140,
    scaleFrom: 1.04,
    scaleTo: 1.22,
    label: "DASHBOARD · SENTIMENT",
  },
  {
    kind: "title",
    frames: 120,
    text: "Then *AI* unleashed a kind of creativity we'd never seen.",
    fontSize: 84,
    maxWidth: 1500,
  },
  {
    kind: "snapshot",
    frames: 54,
    capturePath: CAPTURE.growth,
    startFrame: 110,
    scaleFrom: 1.0,
    scaleTo: 1.1,
    label: "GROWTH · KUDOS",
  },
  {
    kind: "title",
    frames: 72,
    text: "We must act *NOW*.",
    fontSize: 156,
    maxWidth: 1500,
  },
  {
    kind: "snapshot",
    frames: 54,
    capturePath: CAPTURE.skillsMe,
    startFrame: 360,
    scaleFrom: 1.02,
    scaleTo: 1.14,
    label: "SKILLS · ME",
  },
  {
    kind: "title",
    frames: 84,
    text: "Build the new *employee-first* HR.",
    fontSize: 102,
    maxWidth: 1500,
  },
  {
    kind: "title",
    frames: 90,
    text: "*By* the people. *For* the people.",
    fontSize: 112,
    maxWidth: 1500,
  },
];

// ── Fast-edit recap — long string of tight close-ups, same fast cadence ────
// Layout via TeaserMontage's crossfade=3: cursor steps by (frames-3) per clip,
// then the last clip adds its full duration.
// 10 × 15f + final 24f → end at 10×12 + 24 = 144 frames.
const FAST_CLIPS: TeaserClip[] = [
  { capturePath: CAPTURE.moments, startFrame: 70, frames: 15, scaleFrom: 1.18, scaleTo: 1.3 },
  { capturePath: CAPTURE.log, startFrame: 90, frames: 15, scaleFrom: 1.16, scaleTo: 1.28 },
  { capturePath: CAPTURE.reports, startFrame: 90, frames: 15, scaleFrom: 1.14, scaleTo: 1.26 },
  { capturePath: CAPTURE.skillsTeam, startFrame: 60, frames: 15, scaleFrom: 1.18, scaleTo: 1.3 },
  { capturePath: CAPTURE.skillsMe, startFrame: 70, frames: 15, scaleFrom: 1.1, scaleTo: 1.22 },
  { capturePath: CAPTURE.moments, startFrame: 150, frames: 15, scaleFrom: 1.18, scaleTo: 1.3 },
  { capturePath: CAPTURE.log, startFrame: 150, frames: 15, scaleFrom: 1.16, scaleTo: 1.28 },
  { capturePath: CAPTURE.reports, startFrame: 30, frames: 15, scaleFrom: 1.14, scaleTo: 1.26 },
  { capturePath: CAPTURE.skillsTeam, startFrame: 140, frames: 15, scaleFrom: 1.18, scaleTo: 1.3 },
  { capturePath: CAPTURE.dashboard, startFrame: 80, frames: 15, scaleFrom: 1.18, scaleTo: 1.3 },
  { capturePath: CAPTURE.skillsMe, startFrame: 450, frames: 24, scaleFrom: 1.04, scaleTo: 1.16 },
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

        <Series.Sequence durationInFrames={BUILDUP_FRAMES} name="Buildup">
          <Buildup beats={BUILDUP_BEATS} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={FAST_FRAMES} name="FastEdits">
          <TeaserMontage clips={FAST_CLIPS} crossfadeFrames={3} />
        </Series.Sequence>

        <Series.Sequence durationInFrames={OUTRO_FRAMES} name="Outro">
          <TeaserOutro />
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

// ── Buildup sequence ──────────────────────────────────────────────────────
const Buildup: React.FC<{ beats: BuildupBeat[] }> = ({ beats }) => {
  return (
    <Series>
      {beats.map((beat, i) => (
        <Series.Sequence key={i} durationInFrames={beat.frames}>
          {beat.kind === "title" ? (
            <BuildupTitle
              text={beat.text}
              fontSize={beat.fontSize}
              maxWidth={beat.maxWidth ?? 1500}
              durationFrames={beat.frames}
            />
          ) : (
            <BuildupSnapshot
              capturePath={beat.capturePath}
              startFrame={beat.startFrame}
              scaleFrom={beat.scaleFrom}
              scaleTo={beat.scaleTo}
              label={beat.label}
              durationFrames={beat.frames}
            />
          )}
        </Series.Sequence>
      ))}
    </Series>
  );
};

const BuildupTitle: React.FC<{
  text: string;
  fontSize: number;
  maxWidth: number;
  durationFrames: number;
}> = ({ text, fontSize, maxWidth, durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = tokenizeBrandText(text);

  const fadeOutStart = Math.max(durationFrames - 12, 0);
  const fadeOut = interpolate(frame, [fadeOutStart, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow = interpolate(frame, [0, 14, fadeOutStart, durationFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        justifyContent: "center",
        alignItems: "center",
        padding: "0 60px",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 55% 45% at 50% 50%, ${color.brand}1f 0%, transparent 70%)`,
          opacity: glow,
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "0.28em",
          flexWrap: "wrap",
          justifyContent: "center",
          textAlign: "center",
          maxWidth,
          fontFamily: fonts.display,
          fontSize,
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: "#ffffff",
          textShadow:
            "0 24px 80px rgba(0,0,0,0.85), 0 0 60px rgba(155,135,255,0.18)",
          opacity: fadeOut,
        }}
      >
        {tokens.map((tok, i) => {
          const start = i * 4.5;
          const sp = spring({
            frame: frame - start,
            fps,
            config: { damping: 20, mass: 0.9, stiffness: 95 },
          });
          const lift = interpolate(sp, [0, 1], [32, 0]);
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

const BuildupSnapshot: React.FC<{
  capturePath: string;
  startFrame: number;
  scaleFrom: number;
  scaleTo: number;
  label: string;
  durationFrames: number;
}> = ({ capturePath, startFrame, scaleFrom, scaleTo, label, durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeFrames = 10;
  const fadeIn = interpolate(frame, [0, fadeFrames], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationFrames - fadeFrames, durationFrames],
    [1, 0],
    { easing: Easing.in(Easing.cubic), extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = Math.min(fadeIn, fadeOut);
  const blur =
    interpolate(fadeIn, [0, 1], [10, 0]) + interpolate(fadeOut, [0, 1], [10, 0]);

  const t = interpolate(frame, [0, durationFrames], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(t, [0, 1], [scaleFrom, scaleTo]);

  const labelSpring = spring({
    frame: frame - 3,
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 160 },
    durationInFrames: 6,
  });
  const labelOpacity = Math.min(labelSpring, fadeOut);
  const labelLift = interpolate(labelSpring, [0, 1], [10, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#020205" }}>
      <AbsoluteFill
        style={{
          opacity,
          transform: `scale(${scale})`,
          filter: `blur(${blur}px)`,
        }}
      >
        <OffthreadVideo src={staticFile(capturePath)} startFrom={startFrame} />
      </AbsoluteFill>

      <AbsoluteFill
        aria-hidden
        style={{
          pointerEvents: "none",
          boxShadow: `inset 0 0 0 1px ${color.brand}26, inset 0 0 160px rgba(0,0,0,0.55)`,
          background: `radial-gradient(ellipse 92% 78% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)`,
          opacity,
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 56,
          left: 56,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 14px",
          borderRadius: 9999,
          border: `1px solid ${color.brand}55`,
          background: "rgba(8,8,12,0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          fontFamily: fonts.mono,
          fontSize: 14,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.88)",
          opacity: labelOpacity,
          transform: `translateY(${labelLift}px)`,
          pointerEvents: "none",
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
        {label}
      </div>
    </AbsoluteFill>
  );
};

// ── Outro (180 frames — two beats) ────────────────────────────────────────
const OUTRO_BEAT_FRAMES = 90;

const TeaserOutro: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: color.ink, color: color.cream }}>
      <Series>
        <Series.Sequence durationInFrames={OUTRO_BEAT_FRAMES} name="OutroA">
          <OutroBeat
            text="*Built* in public. *Built* for you."
            fontSize={104}
            durationFrames={OUTRO_BEAT_FRAMES}
            showChip={false}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={OUTRO_BEAT_FRAMES} name="OutroB">
          <OutroBeat
            text="Join us at *pulsehr.it*."
            fontSize={108}
            durationFrames={OUTRO_BEAT_FRAMES}
            showChip
          />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

const OutroBeat: React.FC<{
  text: string;
  fontSize: number;
  durationFrames: number;
  showChip: boolean;
}> = ({ text, fontSize, durationFrames, showChip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = tokenizeBrandText(text);

  const ambient = interpolate(frame, [0, 20], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationFrames - 14, durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const chipSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 130 },
  });
  const dotPulse = 0.82 + 0.18 * Math.sin(((frame - 18) / fps) * Math.PI * 1.8);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        color: color.cream,
        fontFamily: fonts.sans,
        justifyContent: "center",
        alignItems: "center",
        padding: "0 60px",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 55% 45% at 50% 55%, ${color.brand}33 0%, transparent 70%)`,
          opacity: ambient * fadeOut,
        }}
      />

      <div
        style={{
          opacity: fadeOut,
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          textAlign: "center",
          display: "flex",
          gap: "0.28em",
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: 1500,
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

      {showChip && (
        <div
          style={{
            marginTop: 32,
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
            opacity: Math.min(chipSpring, fadeOut),
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
          pulsehr.it
        </div>
      )}
    </AbsoluteFill>
  );
};
