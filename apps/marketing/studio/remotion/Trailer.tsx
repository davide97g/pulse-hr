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
import {
  ColdOpen,
  COLD_OPEN_DURATION_FRAMES,
} from "./scenes/ColdOpen";
import {
  CinemaClip,
  type CinemaClipProps,
} from "./scenes/CinemaClip";
import {
  FinaleMontage,
  type FinaleMontageProps,
} from "./scenes/FinaleMontage";

// ── Composition layout — 1800 frames @ 30fps = 60s ────────────────────────
// 0–240    (8s)   ColdOpen
// 240–540  (10s)  CinemaClip · Dashboard          (300f)
// 540–840  (10s)  CinemaClip · Kudos              (300f)
// 840–1140 (10s)  CinemaClip · Achievements       (300f)
// 1140–1500(12s)  CinemaClip · Reports            (360f)
// 1500–1710(7s)   FinaleMontage                   (210f)
// 1710–1800(3s)   Outro tagline                   (90f, OUTRO=60f + tail 30f)

const DASHBOARD_FRAMES = 300;
const KUDOS_FRAMES = 300;
const ACHIEVEMENTS_FRAMES = 300;
const REPORTS_FRAMES = 360;
const FINALE_FRAMES = 210;
const OUTRO_TAIL_FRAMES = 90; // Custom OutroBlock — full 90f, chip-only hold at the tail.

export const TRAILER_DURATION_FRAMES =
  COLD_OPEN_DURATION_FRAMES +
  DASHBOARD_FRAMES +
  KUDOS_FRAMES +
  ACHIEVEMENTS_FRAMES +
  REPORTS_FRAMES +
  FINALE_FRAMES +
  OUTRO_TAIL_FRAMES;
// = 240 + 300 + 300 + 300 + 360 + 210 + 90 = 1800.

export interface TrailerProps {
  /** Path within studio/ to the soundtrack. */
  audioSrc: string;
}

// ── Capture paths (populated once specs have been recorded) ───────────────
const CAPTURE = {
  dashboard: "captures/trailer-dashboard/clip.mp4",
  kudos: "captures/trailer-growth-kudos/clip.mp4",
  achievements: "captures/trailer-growth-achievements/clip.mp4",
  reports: "captures/trailer-reports/clip.mp4",
};

// ── Ken-Burns presets per beat ────────────────────────────────────────────
// Pacing principle: dramatic, cinematic, quick rhythm — start tight,
// pull back only when the wider context is the payoff. Stay focused
// during contextually adjacent micro-actions (multiple clicks on one
// strip, KPI cards next to each other) — let the recording do the work.
const KEN: Record<"dashboard" | "kudos" | "achievements" | "reports", CinemaClipProps["kenBurns"]> = {
  // Dashboard: start zoomed deep into the constellation hex cloud, then
  // pull back to reveal the full "The company is breathing" dashboard.
  // The reveal is the moment.
  dashboard: { fromScale: 1.35, toScale: 1.04, fromX: 0, fromY: 4, toX: 0, toY: 0 },
  // Kudos: tight hold on the hero + tab strip while the cursor scrubs
  // through tabs. No dramatic zoom — the rapid tab switching IS the motion.
  kudos: { fromScale: 1.18, toScale: 1.22, fromX: 0, fromY: -1, toX: 0, toY: 0.5 },
  // Achievements: dramatic push-in onto the signature platinum card.
  achievements: { fromScale: 1.12, toScale: 1.32, fromX: -1, fromY: 1, toX: 0, toY: 0 },
  // Reports: tight on KPI strip → carry that close-up into the People
  // deep-dive transition. No de-zoom between cards (the recording owns the
  // sequence between TURNOVER → ENPS → People tab).
  reports: { fromScale: 1.22, toScale: 1.08, fromX: 0, fromY: 1, toX: 0, toY: 0 },
};

// ── Captions ──────────────────────────────────────────────────────────────
// atMs values are relative to each scene's start. Tune against the chosen
// Suno track in Remotion Studio (waveform scrubbing).
const CUES = {
  dashboard: [
    { atMs: 400, text: "*142* people.", holdMs: 2200 },
    { atMs: 3800, text: "One *pulse*.", holdMs: 2400 },
    { atMs: 7600, text: "Workload. Sentiment. *Presence.*", holdMs: 2200 },
  ],
  kudos: [
    { atMs: 300, text: "Recognition.", holdMs: 2200 },
    { atMs: 3200, text: "*Earned*, not given.", holdMs: 2600 },
    { atMs: 7000, text: "Five lenses on *growth*.", holdMs: 2400 },
  ],
  achievements: [
    { atMs: 300, text: "Mastery, *marked*.", holdMs: 2400 },
    { atMs: 3800, text: "*Craft. Leadership. Impact.*", holdMs: 3200 },
    { atMs: 7600, text: "Every win, *visible*.", holdMs: 2200 },
  ],
  reports: [
    { atMs: 400, text: "The *shape* of the company.", holdMs: 2800 },
    { atMs: 4200, text: "Every heartbeat. *Visible.*", holdMs: 2400 },
    { atMs: 7800, text: "The right numbers. *Your numbers.*", holdMs: 2400 },
    { atMs: 10600, text: "Decide with *evidence*.", holdMs: 2200 },
  ],
};

// ── Highlight pulses — short beat hits inside each CinemaClip ─────────────
// Loosely tuned for a cinematic build. Sync with score drops in Studio.
const HIGHLIGHTS = {
  dashboard: [
    { atMs: 600, durationMs: 240, x: 0.5, y: 0.48, radius: 22 },
    { atMs: 4200, durationMs: 280, x: 0.5, y: 0.48, radius: 28 },
  ],
  kudos: [{ atMs: 500, durationMs: 260, x: 0.5, y: 0.5, radius: 26 }],
  achievements: [
    { atMs: 600, durationMs: 260, x: 0.5, y: 0.55, radius: 24 },
    { atMs: 5400, durationMs: 280, x: 0.5, y: 0.55, radius: 30 },
  ],
  reports: [
    { atMs: 700, durationMs: 240, x: 0.45, y: 0.5, radius: 22 },
    { atMs: 5200, durationMs: 320, x: 0.55, y: 0.55, radius: 32 },
    { atMs: 9200, durationMs: 260, x: 0.5, y: 0.5, radius: 28 },
  ],
};

// ── Finale montage — rapid 12-frame intercuts (0.4s each) ─────────────────
const FINALE_CLIPS: FinaleMontageProps["clips"] = [
  { capturePath: CAPTURE.dashboard, startFrame: 40, scaleFrom: 1.1, scaleTo: 1.22 },
  { capturePath: CAPTURE.kudos, startFrame: 60, scaleFrom: 1.06, scaleTo: 1.18 },
  { capturePath: CAPTURE.achievements, startFrame: 80, scaleFrom: 1.12, scaleTo: 1.24 },
  { capturePath: CAPTURE.reports, startFrame: 120, scaleFrom: 1.04, scaleTo: 1.2 },
  { capturePath: CAPTURE.dashboard, startFrame: 160, scaleFrom: 1.14, scaleTo: 1.26 },
  { capturePath: CAPTURE.reports, startFrame: 200, scaleFrom: 1.08, scaleTo: 1.22 },
  { capturePath: CAPTURE.achievements, startFrame: 30, scaleFrom: 1.16, scaleTo: 1.28 },
  { capturePath: CAPTURE.kudos, startFrame: 140, scaleFrom: 1.1, scaleTo: 1.22 },
  { capturePath: CAPTURE.reports, startFrame: 260, scaleFrom: 1.06, scaleTo: 1.2 },
  // 9 clips × stride 9 + crossfade 3 = ~84f, then tagline fills the rest.
];

export const Trailer: React.FC<TrailerProps> = ({ audioSrc }) => {
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
        <Series.Sequence
          durationInFrames={COLD_OPEN_DURATION_FRAMES}
          name="ColdOpen"
        >
          <ColdOpen whisper="Something is *moving*." />
        </Series.Sequence>

        <Series.Sequence durationInFrames={DASHBOARD_FRAMES} name="Dashboard">
          <CinemaClip
            capturePath={CAPTURE.dashboard}
            durationFrames={DASHBOARD_FRAMES}
            startFrame={20}
            label="The pulse"
            kenBurns={KEN.dashboard}
            highlights={HIGHLIGHTS.dashboard}
            cues={CUES.dashboard}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={KUDOS_FRAMES} name="Kudos">
          <CinemaClip
            capturePath={CAPTURE.kudos}
            durationFrames={KUDOS_FRAMES}
            startFrame={40}
            label="Recognition"
            kenBurns={KEN.kudos}
            highlights={HIGHLIGHTS.kudos}
            cues={CUES.kudos}
          />
        </Series.Sequence>

        <Series.Sequence
          durationInFrames={ACHIEVEMENTS_FRAMES}
          name="Achievements"
        >
          <CinemaClip
            capturePath={CAPTURE.achievements}
            durationFrames={ACHIEVEMENTS_FRAMES}
            startFrame={40}
            label="Mastery"
            kenBurns={KEN.achievements}
            highlights={HIGHLIGHTS.achievements}
            cues={CUES.achievements}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={REPORTS_FRAMES} name="Reports">
          <CinemaClip
            capturePath={CAPTURE.reports}
            durationFrames={REPORTS_FRAMES}
            startFrame={30}
            label="Insight"
            kenBurns={KEN.reports}
            highlights={HIGHLIGHTS.reports}
            cues={CUES.reports}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={FINALE_FRAMES} name="Finale">
          <FinaleMontage
            clips={FINALE_CLIPS}
            perClipFrames={12}
            crossfadeFrames={3}
            tagline="HR · *rebuilt*."
            taglineFrame={120}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={OUTRO_TAIL_FRAMES} name="Outro">
          <OutroBlock />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

// Custom 90-frame trailer outro. Three beats:
//   0–44   ambient + grid + tagline + "join us" stagger in, chip springs in
//   44–58  hold everything at full opacity
//   58–80  fade out tagline, "join us", ambient glow, grid — chip stays put
//   80–90  pure black background; ONLY the chip + its breathing dot remain
//          on screen until cut.
const OutroBlock: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ambient = interpolate(frame, [0, 30], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Stage 3 fade-out: drops everything-not-chip to zero between f58 and f80.
  const surroundsFade = interpolate(frame, [58, 80], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chipSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 130 },
  });

  // Dot keeps breathing through the whole sequence, including the final
  // chip-only hold. Slightly faster sine than the standard Outro to give the
  // final beat a heartbeat feel.
  const dotPulse = 0.82 + 0.18 * Math.sin(((frame - 24) / fps) * Math.PI * 1.8);

  const taglineTokens: Array<{ text: string; brand: boolean }> = [
    { text: "built", brand: false },
    { text: "in", brand: false },
    { text: "public.", brand: false },
  ];
  const joinTokens: Array<{ text: string; brand: boolean }> = [
    { text: "join", brand: true },
    { text: "us", brand: true },
  ];

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
      {/* Ambient brand glow + faint grid — both fade out at f58–80 */}
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
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: ambient * surroundsFade * 0.4,
          backgroundImage:
            "linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 90%)",
        }}
      />

      {/* Main tagline — fades out before the final chip-only beat */}
      <div
        style={{
          opacity: surroundsFade,
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize: 96,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          textAlign: "center",
          display: "flex",
          gap: "0.28em",
          justifyContent: "center",
          maxWidth: 1500,
          padding: "0 60px",
        }}
      >
        {taglineTokens.map((tok, i) => {
          const start = 4 + i * 4;
          const tokenSpring = spring({
            frame: frame - start,
            fps,
            config: { damping: 18, mass: 0.7, stiffness: 120 },
          });
          const lift = interpolate(tokenSpring, [0, 1], [22, 0]);
          const blur = interpolate(tokenSpring, [0, 1], [10, 0]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: tokenSpring,
                transform: `translateY(${lift}px)`,
                filter: `blur(${blur}px)`,
              }}
            >
              {tok.text}
            </span>
          );
        })}
      </div>

      {/* "join us" — brand-colored italic subtitle */}
      <div
        style={{
          marginTop: 12,
          opacity: surroundsFade,
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontSize: 52,
          color: color.brand,
          letterSpacing: "-0.02em",
          display: "flex",
          gap: "0.28em",
        }}
      >
        {joinTokens.map((tok, i) => {
          const start = 18 + i * 4;
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
              }}
            >
              {tok.text}
            </span>
          );
        })}
      </div>

      {/* Chip + breathing dot — STAYS on screen through the final hold */}
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
            position: "relative",
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
