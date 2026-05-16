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

// ── Composition layout — 30s @ 30fps = 900 frames ─────────────────────────
//
// Pattern: a long, breathing hook → four (TypeCard → AppBeat) pairs that
// alternate between bold typography and a clean full-frame app moment with
// no caption competing for attention → finale → outro.
//
// 0–240     (8.0s)  ShortsHook        — breathing motion design with a full
//                                       3-second anticipation gap before
//                                       "until now." enters slowly
// 240–345   (3.5s)  Pair 01 (Dashboard)   TypeCard 1.2s + AppBeat 2.3s
// 345–450   (3.5s)  Pair 02 (Kudos)
// 450–555   (3.5s)  Pair 03 (Achievements)
// 555–660   (3.5s)  Pair 04 (Reports)
// 660–750   (3.0s)  FlickerFinale
// 750–900   (5.0s)  OutroBlock        — HR · rebuilt. + app.pulsehr.it
const HOOK_FRAMES = 240;
const TYPECARD_FRAMES = 36; // 1.2s
const APPBEAT_FRAMES = 69; // 2.3s
const PAIR_FRAMES = TYPECARD_FRAMES + APPBEAT_FRAMES; // 105 = 3.5s
const FINALE_FRAMES = 90;
const OUTRO_FRAMES = 150;

export const TRAILER_SHORTS_DURATION_FRAMES =
  HOOK_FRAMES + PAIR_FRAMES * 4 + FINALE_FRAMES + OUTRO_FRAMES;

export interface TrailerShortsProps {
  audioSrc: string;
}

const CAPTURE = {
  dashboard: "captures/trailer-dashboard/clip.shorts.mp4",
  kudos: "captures/trailer-growth-kudos/clip.shorts.mp4",
  achievements: "captures/trailer-growth-achievements/clip.shorts.mp4",
  reports: "captures/trailer-reports/clip.shorts.mp4",
};

// Phrasing — lowercase, merged into one breath per beat. Brand-token wraps a
// single word so it pops without yelling.
const PHRASES = [
  { text: "your *team*.", emphasis: "team" },
  { text: "recognition that *lands*.", emphasis: "lands" },
  { text: "*earned*, not given.", emphasis: "earned" },
  { text: "the *shape* of your company.", emphasis: "shape" },
];

// testreel places the 540×960 viewport content centered in the 1080×1920
// canvas with a margin — needs a base scale in Remotion to crop the dark
// margin out and have the app capture fill the frame edge-to-edge.
const FILL_SCALE = 1.95;
const APP_BEATS = [
  {
    capturePath: CAPTURE.dashboard,
    startFrame: 22,
    fromScale: FILL_SCALE,
    toScale: FILL_SCALE * 1.14,
    fromX: 0,
    fromY: -1,
    toX: 0,
    toY: 1,
  },
  {
    capturePath: CAPTURE.kudos,
    startFrame: 30,
    fromScale: FILL_SCALE * 1.12,
    toScale: FILL_SCALE,
    fromX: 0,
    fromY: -1,
    toX: 0,
    toY: 2,
  },
  {
    capturePath: CAPTURE.achievements,
    startFrame: 28,
    fromScale: FILL_SCALE,
    toScale: FILL_SCALE * 1.18,
    fromX: 0,
    fromY: 3,
    toX: 0,
    toY: -2,
  },
  {
    capturePath: CAPTURE.reports,
    startFrame: 20,
    fromScale: FILL_SCALE * 1.14,
    toScale: FILL_SCALE,
    fromX: 0,
    fromY: 2,
    toX: 0,
    toY: -1,
  },
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

        {PHRASES.map((phrase, i) => (
          <Series.Sequence
            key={i}
            durationInFrames={PAIR_FRAMES}
            name={`Pair ${i + 1}`}
          >
            <BeatPair phrase={phrase.text} beat={APP_BEATS[i]} />
          </Series.Sequence>
        ))}

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
// BeatPair — TypeCard (lowercase phrase on dark BG) → AppBeat (clean
// full-frame app capture with Ken-Burns, no caption overlay).
// ─────────────────────────────────────────────────────────────────────────
interface AppBeatConfig {
  capturePath: string;
  startFrame: number;
  fromScale: number;
  toScale: number;
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
}

const BeatPair: React.FC<{ phrase: string; beat: AppBeatConfig }> = ({
  phrase,
  beat,
}) => {
  const frame = useCurrentFrame();
  if (frame < TYPECARD_FRAMES) {
    return <TypeCard phrase={phrase} />;
  }
  return <AppBeat beat={beat} />;
};

// ─────────────────────────────────────────────────────────────────────────
// TypeCard — bold lowercase Fraunces on dark background. Brand-color
// emphasis on one word. Subtle radial brand glow breathes underneath.
// 1.2s on screen — enough to read, short enough to keep momentum.
// ─────────────────────────────────────────────────────────────────────────
const TypeCard: React.FC<{ phrase: string }> = ({ phrase }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Soft enter + soft exit so the dark BG doesn't snap to/from the app beat.
  const enter = spring({
    frame,
    fps,
    config: { damping: 18, mass: 0.7, stiffness: 130 },
  });
  const exit = interpolate(
    frame,
    [TYPECARD_FRAMES - 8, TYPECARD_FRAMES],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const opacity = enter * exit;

  // Subtle pulsing glow tied to a soft "heartbeat" so the dark space breathes.
  const pulse =
    0.55 + 0.45 * Math.max(0, Math.sin((frame / fps) * Math.PI * 2.6) ** 2);

  const tokens = tokenize(phrase);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 56px",
        overflow: "hidden",
      }}
    >
      {/* Radial brand glow — breathes with the pulse */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 45% at 50% 50%, ${color.brand}3a 0%, transparent 70%)`,
          opacity: pulse * opacity,
        }}
      />

      <div
        style={{
          position: "relative",
          opacity,
          fontFamily: fonts.display,
          fontWeight: 500,
          fontSize: 132,
          lineHeight: 0.98,
          letterSpacing: "-0.04em",
          textAlign: "center",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.24em",
          color: color.cream,
        }}
      >
        {tokens.map((tok, i) => {
          const start = i * 4;
          const s = spring({
            frame: frame - start,
            fps,
            config: { damping: 18, mass: 0.7, stiffness: 130 },
          });
          const lift = interpolate(s, [0, 1], [22, 0]);
          const blur = interpolate(s, [0, 1], [10, 0]);
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
                  ? `0 0 36px ${color.brand}88, 0 0 12px ${color.brand}cc`
                  : "none",
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

// ─────────────────────────────────────────────────────────────────────────
// AppBeat — clean full-frame app capture. No caption. No chrome. Just the
// product moment with a tight Ken-Burns push. The capture itself is 9:16
// and edge-to-edge (no dark margin) so scale 1.0+ fills the frame.
// ─────────────────────────────────────────────────────────────────────────
const AppBeat: React.FC<{ beat: AppBeatConfig }> = ({ beat }) => {
  const frame = useCurrentFrame() - TYPECARD_FRAMES;
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 22, mass: 0.7, stiffness: 130 },
    durationInFrames: 10,
  });
  const exit = interpolate(
    frame,
    [APPBEAT_FRAMES - 8, APPBEAT_FRAMES],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const opacity = enter * exit;

  const t = interpolate(frame, [0, APPBEAT_FRAMES], [0, 1], {
    easing: Easing.bezier(0.45, 0.05, 0.55, 0.95),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(t, [0, 1], [beat.fromScale, beat.toScale]);
  const tx = interpolate(t, [0, 1], [beat.fromX ?? 0, beat.toX ?? 0]);
  const ty = interpolate(t, [0, 1], [beat.fromY ?? 0, beat.toY ?? 0]);
  const blur = interpolate(enter, [0, 1], [6, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: color.ink, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          opacity,
          transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
          filter: `blur(${blur}px)`,
        }}
      >
        <OffthreadVideo
          src={staticFile(beat.capturePath)}
          startFrom={beat.startFrame}
        />
      </AbsoluteFill>
      {/* Soft vignette — keeps focus inward without darkening the frame */}
      <AbsoluteFill
        aria-hidden
        style={{
          pointerEvents: "none",
          opacity: opacity * 0.9,
          background:
            "radial-gradient(ellipse 95% 80% at 50% 50%, transparent 65%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// ShortsHook — 8 seconds of breathing motion design. Pulse-anchored
// rhythm. Three text beats with "pulse-in-the-gap" between them, then a
// **full 3-second anticipation gap** before "until now." enters slowly.
//
// Beat map (240 frames @ 30fps):
//   0–30    "your team" springs in (line 1, white)
//   30–60   "is talking." italic brand joins line 1
//   60–90   GAP — text dims, pulse ring expands, EQ bars beat
//   90–120  "you can't hear it." crashes in below
//   120–210 ANTICIPATION (3s) — all hook text fades to 0; ripple rings
//           continuously emit from center; brand glow swells; this is the
//           dramatic pause the eye learns to wait through
//   210–240 "until now." enters slowly (30-frame spring), smaller text,
//           single subtle ring backdrop — quieter than before
// ─────────────────────────────────────────────────────────────────────────
const ShortsHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Continuous heartbeat through the entire hook.
  const heartbeat =
    0.5 +
    0.5 *
      Math.max(0, Math.sin(((frame + 4) / fps) * Math.PI * 2.0) ** 3);

  // Line 1 entry: "your team" (f0–30), italic "is talking." (f14–32)
  const line1Spring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 18, mass: 0.7, stiffness: 130 },
  });
  const line1ItalicSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 130 },
  });
  // Line 1 dims during f60–90 (gap 1), fades fully by f120 as line 2 enters.
  const line1Fade = interpolate(frame, [60, 90, 100, 120], [1, 0.35, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 2: "you can't hear it." f90–120
  const line2Spring = spring({
    frame: frame - 90,
    fps,
    config: { damping: 14, mass: 0.9, stiffness: 160 },
  });
  // Line 2 fades quickly during early anticipation so the 3s gap reads as
  // empty/pulsing space rather than text.
  const line2Fade = interpolate(frame, [120, 130, 145], [1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse intensity per phase: gap-1 (f60–90) moderate, anticipation gap
  // (f120–210) peak and sustained. EQ bars track this. Ripple rings emit
  // throughout anticipation.
  const gap1Pulse = interpolate(frame, [56, 70, 90], [0, 1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const antPulse = interpolate(frame, [120, 145, 208], [0, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulseIntensity = Math.max(gap1Pulse, antPulse);

  // Three concentric ripple rings emit on staggered cycles during the 3s
  // anticipation so the screen always has motion expanding outward.
  const rippleProgressAt = (offsetStart: number) => {
    const cycle = 60;
    const localFrame = frame - offsetStart;
    if (localFrame < 0 || frame >= 215) return null;
    const phase = (localFrame % cycle) / cycle;
    return phase;
  };
  const ripple1 = rippleProgressAt(120);
  const ripple2 = rippleProgressAt(150);
  const ripple3 = rippleProgressAt(180);

  // "Until now" — enters at f210, peaks at f234, holds to f240.
  const finalSpring = spring({
    frame: frame - 210,
    fps,
    durationInFrames: 24,
    config: { damping: 22, mass: 1.0, stiffness: 90 }, // slow spring entrance
  });

  return (
    <AbsoluteFill style={{ backgroundColor: color.ink, overflow: "hidden" }}>
      {/* Radial brand glow — breathes with heartbeat, swells during pulse beats */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 55% 38% at 50% 50%, ${color.brand}55 0%, transparent 70%)`,
          opacity: heartbeat * 0.7 + pulseIntensity * 0.8 + finalSpring * 0.6,
          transform: `scale(${0.92 + heartbeat * 0.08 + pulseIntensity * 0.15})`,
        }}
      />

      {/* Anticipation ripples — three concentric rings emit over the 3s gap */}
      {ripple1 !== null && ripple1 < 1 && <RippleRing progress={ripple1} />}
      {ripple2 !== null && ripple2 < 1 && <RippleRing progress={ripple2} />}
      {ripple3 !== null && ripple3 < 1 && <RippleRing progress={ripple3} />}

      {/* Vertical grid texture */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.16,
          backgroundImage:
            "linear-gradient(to right, #ffffff10 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 90%)",
        }}
      />

      {/* Stage 1 — "your team is talking." */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: line1Fade,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 22,
          padding: "0 56px",
          transform: `translateY(${interpolate(line2Spring, [0, 1], [0, -180])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 104,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            textAlign: "center",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.24em",
          }}
        >
          {(["your", "team"] as const).map((word, i) => {
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
            }}
          >
            is
          </span>
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

        {/* EQ ribbon — 9 brand-color bars beating to the score */}
        <EqualizerBars amplitude={0.6 + pulseIntensity * 0.4} frame={frame} />
      </div>

      {/* Stage 2 — "you can't hear it." */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: line2Fade * line2Spring,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 56px",
        }}
      >
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 500,
            fontSize: 88,
            lineHeight: 1.04,
            letterSpacing: "-0.025em",
            textAlign: "center",
            color: "rgba(245,242,234,0.92)",
            transform: `translateY(${interpolate(line2Spring, [0, 1], [30, 0])}px)`,
            filter: `blur(${interpolate(line2Spring, [0, 1], [12, 0])}px)`,
          }}
        >
          you can't hear&nbsp;it.
        </div>
      </div>

      {/* Stage 3 — "until now." enters slowly, smaller, single ring backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: finalSpring,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 56px",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: 9999,
            border: `2px solid ${color.brand}`,
            opacity: finalSpring * 0.75,
            transform: `scale(${interpolate(finalSpring, [0, 1], [0.7, 1])})`,
            boxShadow: `0 0 90px ${color.brand}88, inset 0 0 70px ${color.brand}33`,
          }}
        />
        <div
          style={{
            position: "relative",
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 108,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            textAlign: "center",
            transform: `scale(${interpolate(finalSpring, [0, 1], [0.86, 1])})`,
            color: color.cream,
            textShadow: `0 0 24px rgba(0,0,0,0.6)`,
          }}
        >
          <span>until&nbsp;</span>
          <span
            style={{
              fontStyle: "italic",
              color: color.brand,
              textShadow: `0 0 42px ${color.brand}, 0 0 14px ${color.brand}cc`,
            }}
          >
            now.
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Expanding ring used during the anticipation gap — emits then fades.
const RippleRing: React.FC<{ progress: number }> = ({ progress }) => {
  const size = 100 + progress * 1300;
  const opacity = (1 - progress) * 0.55;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: 9999,
        border: `1.5px solid ${color.brand}`,
        opacity,
        boxShadow: `0 0 ${20 + progress * 40}px ${color.brand}55`,
      }}
    />
  );
};

const EqualizerBars: React.FC<{ amplitude: number; frame: number }> = ({
  amplitude,
  frame,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
        height: 36,
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => {
        const phase = (frame + i * 7) / 30;
        const h = 6 + Math.max(0, Math.sin(phase * Math.PI * 3.2)) * 28 * amplitude;
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
  );
};

// ─────────────────────────────────────────────────────────────────────────
// FlickerFinale — 9 ultra-tight intercuts with brand flashes between cuts.
// ─────────────────────────────────────────────────────────────────────────
// Flicker scales include FILL_SCALE so the cuts fill the frame too.
const FLICKER: Array<{ capturePath: string; startFrame: number; scale: number; tx?: number; ty?: number }> = [
  { capturePath: CAPTURE.dashboard, startFrame: 100, scale: FILL_SCALE * 1.1 },
  { capturePath: CAPTURE.kudos, startFrame: 60, scale: FILL_SCALE * 1.06, ty: -2 },
  { capturePath: CAPTURE.achievements, startFrame: 120, scale: FILL_SCALE * 1.14, ty: 2 },
  { capturePath: CAPTURE.reports, startFrame: 80, scale: FILL_SCALE * 1.04 },
  { capturePath: CAPTURE.dashboard, startFrame: 160, scale: FILL_SCALE * 1.2, ty: 3 },
  { capturePath: CAPTURE.kudos, startFrame: 140, scale: FILL_SCALE * 1.1, ty: 2 },
  { capturePath: CAPTURE.achievements, startFrame: 60, scale: FILL_SCALE * 1.18 },
  { capturePath: CAPTURE.reports, startFrame: 30, scale: FILL_SCALE * 1.12, ty: -3 },
  { capturePath: CAPTURE.dashboard, startFrame: 220, scale: FILL_SCALE * 1.28 },
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
          opacity: flash * 0.6,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 85% 70% at 50% 50%, transparent 50%, rgba(0,0,0,0.6) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// OutroBlock — 6 seconds. Tagline lands, URL chip springs in, both held
// long enough for the viewer to act on the URL.
// ─────────────────────────────────────────────────────────────────────────
const OutroBlock: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ambient = interpolate(frame, [0, 30], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineFade = interpolate(frame, [140, 170], [1, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dotPulse =
    0.82 + 0.18 * Math.sin(((frame - 30) / fps) * Math.PI * 2.4);

  const taglineTokens: Array<{ text: string; brand: boolean }> = [
    { text: "hr", brand: false },
    { text: "·", brand: false },
    { text: "rebuilt.", brand: true },
  ];

  const chipSpring = spring({
    frame: frame - 30,
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
        gap: 32,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 45% at 50% 48%, ${color.brand}48 0%, transparent 70%)`,
          opacity: ambient,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: ambient * 0.34,
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
          position: "relative",
          opacity: taglineFade,
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize: 118,
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

      <div
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 24px",
          borderRadius: 9999,
          border: `1px solid ${color.brand}66`,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          fontFamily: fonts.mono,
          fontSize: 24,
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
            width: 14,
            height: 14,
            borderRadius: 9999,
            backgroundColor: color.brand,
            boxShadow: `0 0 ${22 * dotPulse}px ${color.brand}`,
            transform: `scale(${dotPulse})`,
          }}
        />
        app.pulsehr.it
      </div>
    </AbsoluteFill>
  );
};

// Simple inline tokenizer for the phrase strings — wraps *word* in brand.
function tokenize(s: string): Array<{ text: string; brand: boolean }> {
  const out: Array<{ text: string; brand: boolean }> = [];
  // Split on whitespace but preserve the asterisk marker.
  for (const word of s.split(/\s+/)) {
    if (word.startsWith("*") && word.endsWith("*") && word.length > 2) {
      out.push({ text: word.slice(1, -1), brand: true });
    } else if (word.startsWith("*") && word.length > 1) {
      // Allow trailing punctuation after the close asterisk: *word*.
      const inner = word.replace(/^\*|\*(?=[^a-zA-Z0-9]?$)/g, "");
      out.push({ text: inner, brand: true });
    } else {
      out.push({ text: word, brand: false });
    }
  }
  return out;
}
