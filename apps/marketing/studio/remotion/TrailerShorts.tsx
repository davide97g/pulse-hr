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
import {
  CinemaClip,
  type CinemaClipProps,
} from "./scenes/CinemaClip";

// ── Composition layout — 30s @ 30fps = 900 frames ─────────────────────────
// 0–90      (3.0s)  ShortsHook        — bespoke text reveal, no capture
// 90–240    (5.0s)  Beat 01 — Dashboard
// 240–390   (5.0s)  Beat 02 — Kudos
// 390–540   (5.0s)  Beat 03 — Achievements
// 540–690   (5.0s)  Beat 04 — Reports
// 690–780   (3.0s)  FlickerFinale
// 780–900   (4.0s)  OutroBlock — tagline + URL chip + breathing dot
const HOOK_FRAMES = 90;
const BEAT_FRAMES = 150;
const FINALE_FRAMES = 90;
const OUTRO_FRAMES = 120;

export const TRAILER_SHORTS_DURATION_FRAMES =
  HOOK_FRAMES + BEAT_FRAMES * 4 + FINALE_FRAMES + OUTRO_FRAMES;

export interface TrailerShortsProps {
  audioSrc: string;
}

const CAPTURE = {
  dashboard: "captures/trailer-dashboard/clip.shorts.mp4",
  kudos: "captures/trailer-growth-kudos/clip.shorts.mp4",
  achievements: "captures/trailer-growth-achievements/clip.shorts.mp4",
  reports: "captures/trailer-reports/clip.shorts.mp4",
};

// Portrait Ken-Burns: deeper push-ins than landscape since the eye is closer
// to the frame on phones and we want every moment to feel kinetic.
const KEN: Record<keyof typeof CAPTURE, CinemaClipProps["kenBurns"]> = {
  // Dashboard: tight push-in onto the constellation, micro-tilt downward so
  // the eye drifts past the hero headline into the sentiment hexes.
  dashboard: { fromScale: 1.16, toScale: 1.38, fromX: 0, fromY: -3, toX: 0, toY: 2 },
  // Kudos: pull back to reveal the leaderboard from a tight crop on the hero,
  // then drift right to imply scrolling through more wall cards.
  kudos: { fromScale: 1.34, toScale: 1.14, fromX: -1, fromY: -2, toX: 1, toY: 2 },
  // Achievements: signature card push, deep zoom to make the platinum star
  // feel earned. Slight upward tilt as we close in.
  achievements: { fromScale: 1.18, toScale: 1.42, fromX: 0, fromY: 5, toX: 0, toY: -2 },
  // Reports: hard push on the KPI grid then carry the momentum into the
  // narrative band — vertical pan up reveals more.
  reports: { fromScale: 1.36, toScale: 1.12, fromX: 0, fromY: 3, toX: 0, toY: -2 },
};

// Captions punch in caps for portrait — fewer words, sharper rhythm.
const CUES = {
  dashboard: [
    { atMs: 150, text: "*142* PEOPLE.", holdMs: 1900 },
    { atMs: 2200, text: "ONE *PULSE*.", holdMs: 2400 },
  ],
  kudos: [
    { atMs: 150, text: "RECOGNITION", holdMs: 1700 },
    { atMs: 2000, text: "THAT *LANDS*.", holdMs: 2700 },
  ],
  achievements: [
    { atMs: 150, text: "*EARNED.*", holdMs: 1700 },
    { atMs: 2000, text: "NOT *GIVEN*.", holdMs: 2700 },
  ],
  reports: [
    { atMs: 150, text: "THE *SHAPE*", holdMs: 1700 },
    { atMs: 2000, text: "OF THE *COMPANY*.", holdMs: 2700 },
  ],
};

const HIGHLIGHTS: Record<keyof typeof CAPTURE, CinemaClipProps["highlights"]> = {
  dashboard: [
    { atMs: 800, durationMs: 320, x: 0.5, y: 0.5, radius: 26 },
    { atMs: 3600, durationMs: 320, x: 0.5, y: 0.42, radius: 30 },
  ],
  kudos: [
    { atMs: 600, durationMs: 280, x: 0.5, y: 0.32, radius: 28 },
    { atMs: 3400, durationMs: 320, x: 0.5, y: 0.55, radius: 28 },
  ],
  achievements: [
    { atMs: 700, durationMs: 280, x: 0.5, y: 0.45, radius: 30 },
    { atMs: 3600, durationMs: 360, x: 0.5, y: 0.4, radius: 34 },
  ],
  reports: [
    { atMs: 600, durationMs: 280, x: 0.5, y: 0.5, radius: 28 },
    { atMs: 3300, durationMs: 360, x: 0.5, y: 0.4, radius: 32 },
  ],
};

const SCENE_LABELS = [
  { id: "01 / 04", label: "PULSE" },
  { id: "02 / 04", label: "RECOGNITION" },
  { id: "03 / 04", label: "MASTERY" },
  { id: "04 / 04", label: "INSIGHT" },
];

export const TrailerShorts: React.FC<TrailerShortsProps> = ({ audioSrc }) => {
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
        <Series.Sequence durationInFrames={HOOK_FRAMES} name="Hook">
          <ShortsHook />
        </Series.Sequence>

        <Series.Sequence durationInFrames={BEAT_FRAMES} name="Dashboard">
          <BeatScene
            capturePath={CAPTURE.dashboard}
            startFrame={20}
            kenBurns={KEN.dashboard}
            highlights={HIGHLIGHTS.dashboard}
            cues={CUES.dashboard}
            scene={SCENE_LABELS[0]}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={BEAT_FRAMES} name="Kudos">
          <BeatScene
            capturePath={CAPTURE.kudos}
            startFrame={30}
            kenBurns={KEN.kudos}
            highlights={HIGHLIGHTS.kudos}
            cues={CUES.kudos}
            scene={SCENE_LABELS[1]}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={BEAT_FRAMES} name="Achievements">
          <BeatScene
            capturePath={CAPTURE.achievements}
            startFrame={30}
            kenBurns={KEN.achievements}
            highlights={HIGHLIGHTS.achievements}
            cues={CUES.achievements}
            scene={SCENE_LABELS[2]}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={BEAT_FRAMES} name="Reports">
          <BeatScene
            capturePath={CAPTURE.reports}
            startFrame={20}
            kenBurns={KEN.reports}
            highlights={HIGHLIGHTS.reports}
            cues={CUES.reports}
            scene={SCENE_LABELS[3]}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={FINALE_FRAMES} name="Finale">
          <FlickerFinale />
        </Series.Sequence>

        <Series.Sequence durationInFrames={OUTRO_FRAMES} name="Outro">
          <OutroBlock />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// BeatScene — wraps CinemaClip with portrait chrome: a "01 / 04" scene
// counter top-left and a label top-right, both fading after ~1s. Also
// stacks an aggressive brand-color slash transition at scene entry.
// ─────────────────────────────────────────────────────────────────────────
interface BeatSceneProps {
  capturePath: string;
  startFrame: number;
  kenBurns: CinemaClipProps["kenBurns"];
  highlights: CinemaClipProps["highlights"];
  cues: CinemaClipProps["cues"];
  scene: { id: string; label: string };
}

const BeatScene: React.FC<BeatSceneProps> = ({
  capturePath,
  startFrame,
  kenBurns,
  highlights,
  cues,
  scene,
}) => {
  const frame = useCurrentFrame();
  // Entry slash — brand wash sweeps in then out within ~10 frames.
  const slash = interpolate(frame, [0, 4, 10], [1, 1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slashWidth = interpolate(frame, [0, 6, 10], [0, 100, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Counter + label visible for first 1.4s then fade out.
  const chromeFade = interpolate(frame, [4, 18, 36, 48], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const counterLift = interpolate(frame, [4, 18], [-10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <CinemaClip
        capturePath={capturePath}
        durationFrames={BEAT_FRAMES}
        startFrame={startFrame}
        kenBurns={kenBurns}
        highlights={highlights}
        cues={cues}
        vignette={1}
      />

      {/* Brand slash sweep — enters the scene like a wipe */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: `${slashWidth}%`,
          backgroundColor: color.brand,
          opacity: slash * 0.95,
          mixBlendMode: "screen",
        }}
      />

      {/* Scene counter top-left */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 28,
          opacity: chromeFade,
          transform: `translateY(${counterLift}px)`,
          fontFamily: fonts.mono,
          fontSize: 13,
          letterSpacing: "0.26em",
          color: color.brand,
          textShadow: `0 0 16px ${color.brand}66`,
        }}
      >
        {scene.id}
      </div>

      {/* Scene label top-right */}
      <div
        style={{
          position: "absolute",
          top: 70,
          right: 28,
          opacity: chromeFade,
          transform: `translateY(${counterLift}px)`,
          fontFamily: fonts.mono,
          fontSize: 13,
          letterSpacing: "0.28em",
          color: color.cream,
        }}
      >
        {scene.label}
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// ShortsHook — 3s of pure motion design. Strongest moment of the reel.
//
//   0–18    Heartbeat dot pulses; "Your team is" springs in line-by-line.
//   18–32   "talking." italic in brand color w/ EQ bars beating underneath.
//   32–54   "You can't hear it." crashes in below.
//   54–66   Brand glitch flash (hue rotate + x jitter).
//   66–90   "Until *now*." slams centered — full brand-color screen wash,
//           two concentric rings, glowing italic "now."
// ─────────────────────────────────────────────────────────────────────────
const ShortsHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const heartbeat =
    0.62 +
    0.38 *
      Math.max(
        0,
        Math.sin(((frame + 4) / fps) * Math.PI * 2.4) ** 3,
      );

  const line1Spring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 18, mass: 0.7, stiffness: 130 },
  });
  const line1ItalicSpring = spring({
    frame: frame - 16,
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 130 },
  });
  const line2Spring = spring({
    frame: frame - 32,
    fps,
    config: { damping: 14, mass: 0.9, stiffness: 160 },
  });

  const glitch = interpolate(frame, [54, 58, 62, 66], [0, 1, 0, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jitter = glitch > 0 ? Math.sin(frame * 8.4) * 4 * glitch : 0;

  const earlyFade = interpolate(frame, [56, 70], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const finalSpring = spring({
    frame: frame - 66,
    fps,
    config: { damping: 12, mass: 0.9, stiffness: 180 },
  });
  const ringScale = interpolate(finalSpring, [0, 1], [0.55, 1]);
  const ringOpacity = interpolate(frame, [66, 72, 84, 90], [0, 1, 1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slamFlash = interpolate(frame, [65, 70, 78], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: color.ink, overflow: "hidden" }}>
      {/* Slow radial brand glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 55% 38% at 50% 50%, ${color.brand}66 0%, transparent 70%)`,
          opacity: heartbeat * earlyFade + finalSpring * 1.0,
          transform: `scale(${0.95 + heartbeat * 0.1 + finalSpring * 0.22})`,
        }}
      />

      {/* Slam flash */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: color.brand,
          opacity: slamFlash,
          mixBlendMode: "screen",
        }}
      />

      {/* Vertical-grid texture */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          backgroundImage:
            "linear-gradient(to right, #ffffff10 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 90%)",
        }}
      />

      {/* Stage 1+2 — "Your team is talking." + "You can't hear it." */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: earlyFade,
          transform: `translateX(${jitter}px)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          padding: "0 56px",
          filter: glitch > 0 ? `hue-rotate(${glitch * 30}deg)` : "none",
        }}
      >
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 100,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            textAlign: "center",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.24em",
          }}
        >
          {(["Your", "team", "is"] as const).map((word, i) => {
            const start = i * 4;
            const s = spring({
              frame: frame - 2 - start,
              fps,
              config: { damping: 18, mass: 0.7, stiffness: 130 },
            });
            const lift = interpolate(s, [0, 1], [24, 0]);
            const blur = interpolate(s, [0, 1], [10, 0]);
            return (
              <span
                key={word}
                style={{
                  display: "inline-block",
                  opacity: s * line1Spring,
                  transform: `translateY(${lift}px)`,
                  filter: `blur(${blur}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
          <span
            style={{
              display: "inline-block",
              opacity: line1ItalicSpring,
              transform: `translateY(${interpolate(line1ItalicSpring, [0, 1], [22, 0])}px)`,
              filter: `blur(${interpolate(line1ItalicSpring, [0, 1], [10, 0])}px)`,
              fontStyle: "italic",
              color: color.brand,
              textShadow: `0 0 22px ${color.brand}66`,
            }}
          >
            talking.
          </span>
        </div>

        {/* EQ ribbon — seven brand-color bars beating to the score */}
        <div
          style={{
            opacity: line1ItalicSpring * 0.9,
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            height: 30,
          }}
        >
          {Array.from({ length: 7 }).map((_, i) => {
            const phase = (frame + i * 8) / fps;
            const h = 6 + Math.max(0, Math.sin(phase * Math.PI * 3.2)) * 24;
            return (
              <span
                key={i}
                style={{
                  width: 6,
                  height: h,
                  borderRadius: 3,
                  backgroundColor: color.brand,
                  boxShadow: `0 0 10px ${color.brand}cc`,
                }}
              />
            );
          })}
        </div>

        <div
          style={{
            marginTop: 22,
            opacity: line2Spring,
            fontFamily: fonts.display,
            fontWeight: 500,
            fontSize: 72,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textAlign: "center",
            color: "rgba(245,242,234,0.82)",
            transform: `translateY(${interpolate(line2Spring, [0, 1], [30, 0])}px)`,
            filter: `blur(${interpolate(line2Spring, [0, 1], [12, 0])}px)`,
          }}
        >
          You can't hear&nbsp;it.
        </div>
      </div>

      {/* Stage 3 — "Until *now*." slam */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 56px",
          opacity: finalSpring,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 760,
            height: 760,
            borderRadius: 9999,
            border: `3px solid ${color.brand}`,
            opacity: ringOpacity,
            transform: `scale(${ringScale})`,
            boxShadow: `0 0 160px ${color.brand}aa, 0 0 70px ${color.brand}88, inset 0 0 130px ${color.brand}44`,
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            borderRadius: 9999,
            border: `1px solid ${color.brand}99`,
            opacity: ringOpacity * 0.7,
            transform: `scale(${ringScale * 1.04})`,
          }}
        />
        <div
          style={{
            position: "relative",
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 168,
            lineHeight: 1,
            letterSpacing: "-0.045em",
            textAlign: "center",
            transform: `scale(${interpolate(finalSpring, [0, 1], [0.78, 1])})`,
            color: color.cream,
            textShadow: `0 0 24px rgba(0,0,0,0.6), 0 4px 18px rgba(0,0,0,0.55)`,
          }}
        >
          <span>Until&nbsp;</span>
          <span
            style={{
              fontStyle: "italic",
              color: color.brand,
              textShadow: `0 0 64px ${color.brand}, 0 0 28px ${color.brand}, 0 0 8px ${color.brand}cc`,
            }}
          >
            now.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// FlickerFinale — 9 ultra-tight intercuts (~0.33s each) with brand flashes,
// builds tension into the outro.
// ─────────────────────────────────────────────────────────────────────────
const FLICKER: Array<{ capturePath: string; startFrame: number; scale: number; tx?: number; ty?: number }> = [
  { capturePath: CAPTURE.dashboard, startFrame: 100, scale: 1.32 },
  { capturePath: CAPTURE.kudos, startFrame: 60, scale: 1.28, ty: -2 },
  { capturePath: CAPTURE.achievements, startFrame: 120, scale: 1.36, ty: 2 },
  { capturePath: CAPTURE.reports, startFrame: 80, scale: 1.24 },
  { capturePath: CAPTURE.dashboard, startFrame: 160, scale: 1.42, ty: 3 },
  { capturePath: CAPTURE.kudos, startFrame: 140, scale: 1.32, ty: 2 },
  { capturePath: CAPTURE.achievements, startFrame: 60, scale: 1.4 },
  { capturePath: CAPTURE.reports, startFrame: 30, scale: 1.34, ty: -3 },
  { capturePath: CAPTURE.dashboard, startFrame: 220, scale: 1.5 },
];
const FLICKER_PER_FRAMES = 10;

const FlickerFinale: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(
    FLICKER.length - 1,
    Math.floor(frame / FLICKER_PER_FRAMES),
  );
  const clip = FLICKER[idx];
  const localFrame = frame - idx * FLICKER_PER_FRAMES;
  const flash = interpolate(localFrame, [0, 2, 6], [1, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#040408" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${clip.tx ?? 0}%, ${clip.ty ?? 0}%) scale(${clip.scale})`,
        }}
      >
        <OffthreadVideo
          src={staticFile(clip.capturePath)}
          startFrom={clip.startFrame}
        />
      </AbsoluteFill>
      <AbsoluteFill
        aria-hidden
        style={{
          backgroundColor: color.brand,
          opacity: flash * 0.65,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 85% 70% at 50% 50%, transparent 50%, rgba(0,0,0,0.65) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// OutroBlock — 4 seconds, three beats:
//   0–24    Ambient brand glow + grid fade in. Tagline springs in line-by-line.
//   24–60   Hold; URL chip springs in below; breathing dot starts pulsing.
//   60–90   Subtle pulse, everything at peak.
//   90–120  Tagline fades; chip stays through final cut.
// ─────────────────────────────────────────────────────────────────────────
const OutroBlock: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ambient = interpolate(frame, [0, 30], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Tagline fades out late so URL chip dominates the final beat.
  const taglineFade = interpolate(frame, [88, 110], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dotPulse =
    0.82 + 0.18 * Math.sin(((frame - 30) / fps) * Math.PI * 2.4);

  const taglineTokens: Array<{ text: string; brand: boolean }> = [
    { text: "HR", brand: false },
    { text: "·", brand: false },
    { text: "rebuilt.", brand: true },
  ];

  const chipSpring = spring({
    frame: frame - 24,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 130 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        color: color.cream,
        fontFamily: fonts.sans,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      {/* Ambient brand glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 45% at 50% 48%, ${color.brand}40 0%, transparent 70%)`,
          opacity: ambient,
        }}
      />
      {/* Grid texture */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: ambient * 0.32,
          backgroundImage:
            "linear-gradient(to right, #ffffff10 1px, transparent 1px), linear-gradient(to bottom, #ffffff10 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 90%)",
        }}
      />

      {/* Tagline */}
      <div
        style={{
          position: "relative",
          opacity: taglineFade,
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize: 110,
          letterSpacing: "-0.04em",
          lineHeight: 1.02,
          textAlign: "center",
          display: "flex",
          gap: "0.28em",
          padding: "0 36px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {taglineTokens.map((tok, i) => {
          const start = 6 + i * 5;
          const s = spring({
            frame: frame - start,
            fps,
            config: { damping: 18, mass: 0.7, stiffness: 120 },
          });
          const lift = interpolate(s, [0, 1], [28, 0]);
          const blur = interpolate(s, [0, 1], [12, 0]);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: s,
                transform: `translateY(${lift}px)`,
                filter: `blur(${blur}px)`,
                fontStyle: tok.brand ? "italic" : "normal",
                color: tok.brand ? color.brand : color.cream,
                textShadow: tok.brand
                  ? `0 0 28px ${color.brand}88, 0 0 8px ${color.brand}cc`
                  : "none",
              }}
            >
              {tok.text}
            </span>
          );
        })}
      </div>

      {/* URL chip + breathing dot — stays on screen through the final beat */}
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "13px 22px",
          borderRadius: 9999,
          border: `1px solid ${color.brand}66`,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          fontFamily: fonts.mono,
          fontSize: 22,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: color.cream,
          opacity: chipSpring,
          transform: `translateY(${(1 - chipSpring) * 12}px) scale(${interpolate(
            chipSpring,
            [0, 1],
            [0.94, 1],
          )})`,
        }}
      >
        <span
          style={{
            width: 13,
            height: 13,
            borderRadius: 9999,
            backgroundColor: color.brand,
            boxShadow: `0 0 ${20 * dotPulse}px ${color.brand}`,
            transform: `scale(${dotPulse})`,
          }}
        />
        app.pulsehr.it
      </div>
    </AbsoluteFill>
  );
};
