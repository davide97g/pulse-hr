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
// 90–270    (6.0s)  Dashboard         — portrait capture
// 270–450   (6.0s)  Kudos             — portrait capture
// 450–630   (6.0s)  Achievements      — portrait capture
// 630–780   (5.0s)  Reports           — portrait capture
// 780–870   (3.0s)  FlickerFinale     — rapid intercuts
// 870–900   (1.0s)  OutroChip         — pure black + app.pulsehr.it
const HOOK_FRAMES = 90;
const DASHBOARD_FRAMES = 180;
const KUDOS_FRAMES = 180;
const ACHIEVEMENTS_FRAMES = 180;
const REPORTS_FRAMES = 150;
const FINALE_FRAMES = 90;
const OUTRO_FRAMES = 30;

export const TRAILER_SHORTS_DURATION_FRAMES =
  HOOK_FRAMES +
  DASHBOARD_FRAMES +
  KUDOS_FRAMES +
  ACHIEVEMENTS_FRAMES +
  REPORTS_FRAMES +
  FINALE_FRAMES +
  OUTRO_FRAMES;

export interface TrailerShortsProps {
  audioSrc: string;
}

const CAPTURE = {
  dashboard: "captures/trailer-dashboard/clip.shorts.mp4",
  kudos: "captures/trailer-growth-kudos/clip.shorts.mp4",
  achievements: "captures/trailer-growth-achievements/clip.shorts.mp4",
  reports: "captures/trailer-reports/clip.shorts.mp4",
};

// Portrait Ken-Burns: vertical pans, deeper push-ins. The vertical capture
// already crops out sidebar/chrome so we can stay tight and let micro-motion
// inside the frame carry weight.
const KEN: Record<keyof typeof CAPTURE, CinemaClipProps["kenBurns"]> = {
  // Push-in from a wider top framing down to the constellation — the
  // sentiment cloud is the payoff.
  dashboard: { fromScale: 1.18, toScale: 1.34, fromX: 0, fromY: -3, toX: 0, toY: 1 },
  // Hold tight; let the kudos card hand-off motion be the story.
  kudos: { fromScale: 1.22, toScale: 1.26, fromX: 0, fromY: 0, toX: 0, toY: -1 },
  // Slow vertical pan up from the badge ribbon to the platinum card.
  achievements: { fromScale: 1.2, toScale: 1.36, fromX: 0, fromY: 4, toX: 0, toY: -2 },
  // Pull back to reveal the full KPI cascade.
  reports: { fromScale: 1.3, toScale: 1.1, fromX: 0, fromY: 0, toX: 0, toY: 1 },
};

const CUES = {
  dashboard: [
    { atMs: 200, text: "*142* people.", holdMs: 2200 },
    { atMs: 3000, text: "One *pulse*.", holdMs: 2400 },
  ],
  kudos: [
    { atMs: 200, text: "Recognition that *lands*.", holdMs: 2600 },
    { atMs: 3200, text: "*25 coins* on the way.", holdMs: 2400 },
  ],
  achievements: [
    { atMs: 200, text: "*Earned*, not given.", holdMs: 2600 },
    { atMs: 3400, text: "Every win, *visible*.", holdMs: 2200 },
  ],
  reports: [
    { atMs: 200, text: "The *shape* of the company.", holdMs: 2600 },
    { atMs: 3200, text: "Decide with *evidence*.", holdMs: 1800 },
  ],
};

const HIGHLIGHTS: Record<keyof typeof CAPTURE, CinemaClipProps["highlights"]> = {
  dashboard: [{ atMs: 3400, durationMs: 280, x: 0.5, y: 0.42, radius: 28 }],
  kudos: [{ atMs: 3500, durationMs: 260, x: 0.5, y: 0.5, radius: 26 }],
  achievements: [{ atMs: 3600, durationMs: 280, x: 0.5, y: 0.45, radius: 30 }],
  reports: [{ atMs: 3300, durationMs: 280, x: 0.5, y: 0.55, radius: 28 }],
};

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
            startFrame={30}
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
            startFrame={30}
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
            startFrame={20}
            label="Insight"
            kenBurns={KEN.reports}
            highlights={HIGHLIGHTS.reports}
            cues={CUES.reports}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={FINALE_FRAMES} name="Finale">
          <FlickerFinale />
        </Series.Sequence>

        <Series.Sequence durationInFrames={OUTRO_FRAMES} name="Outro">
          <OutroChip />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// HOOK — 3s of pure motion design. The strongest moment of the reel.
//
//   0–18    Black + heartbeat dot pulses; "Your team is"  spring-fades in.
//   18–32   "talking." italic in brand color, springs to the right of line 1.
//           Sentiment EQ bars start bouncing along the bottom of the type.
//   32–54   "You can't hear it." crashes in below — sharp, no italic.
//   54–72   Quick brand-color flash + glitch (brief sat shift, slight x-jitter).
//   72–90   Glitch resolves into "Until *now*." which slams centered, framed
//           by a thin brand ring that scales outward as we hand off to the
//           first capture clip.
// ─────────────────────────────────────────────────────────────────────────
const ShortsHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Heartbeat — sin wave, slightly accelerating as the hook builds.
  const heartbeat =
    0.62 +
    0.38 *
      Math.max(
        0,
        Math.sin(((frame + 4) / fps) * Math.PI * 2.4) ** 3,
      );

  // Stage timing
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

  // Glitch flash near frame 56
  const glitch = interpolate(frame, [54, 58, 62, 66], [0, 1, 0, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const jitter = glitch > 0
    ? Math.sin(frame * 8.4) * 4 * glitch
    : 0;

  // Stage 1+2 fade out as Until now slams in.
  const earlyFade = interpolate(frame, [60, 72], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Final reveal — "Until *now*."
  const finalSpring = spring({
    frame: frame - 70,
    fps,
    config: { damping: 12, mass: 0.9, stiffness: 180 },
  });
  const ringScale = interpolate(finalSpring, [0, 1], [0.55, 1]);
  const ringOpacity = interpolate(frame, [70, 76, 84, 90], [0, 1, 1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Full-screen brand-color slam flash at impact — adds the "punch".
  const slamFlash = interpolate(frame, [69, 72, 80], [0, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        overflow: "hidden",
      }}
    >
      {/* Slow radial brand glow — anchored center, breathes with heartbeat,
          punches up in intensity for the final slam */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 55% 38% at 50% 50%, ${color.brand}66 0%, transparent 70%)`,
          opacity: heartbeat * earlyFade + finalSpring * 1.0,
          transform: `scale(${0.95 + heartbeat * 0.1 + finalSpring * 0.2})`,
        }}
      />

      {/* Slam flash — full-frame brand wash at impact frame 72 */}
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

      {/* Faint vertical grid for texture */}
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

      {/* Stage 1+2 typography — fades out before the final slam */}
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
        {/* Line 1 — "Your team is *talking*." */}
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 96,
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
              transform: `translateY(${interpolate(
                line1ItalicSpring,
                [0, 1],
                [22, 0],
              )}px)`,
              filter: `blur(${interpolate(line1ItalicSpring, [0, 1], [10, 0])}px)`,
              fontStyle: "italic",
              color: color.brand,
            }}
          >
            talking.
          </span>
        </div>

        {/* Equalizer ribbon — six bars under line 1, beat-driven */}
        <div
          style={{
            opacity: line1ItalicSpring * 0.85,
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            height: 28,
          }}
        >
          {Array.from({ length: 7 }).map((_, i) => {
            const phase = (frame + i * 8) / fps;
            const h = 6 + Math.max(0, Math.sin(phase * Math.PI * 3.2)) * 22;
            return (
              <span
                key={i}
                style={{
                  width: 6,
                  height: h,
                  borderRadius: 3,
                  backgroundColor: color.brand,
                  boxShadow: `0 0 8px ${color.brand}aa`,
                }}
              />
            );
          })}
        </div>

        {/* Line 2 — "You can't hear it." */}
        <div
          style={{
            marginTop: 22,
            opacity: line2Spring,
            fontFamily: fonts.display,
            fontWeight: 500,
            fontSize: 68,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textAlign: "center",
            color: "rgba(245,242,234,0.78)",
            transform: `translateY(${interpolate(
              line2Spring,
              [0, 1],
              [30, 0],
            )}px)`,
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
        {/* Brand ring backdrop — bright, glowing */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 720,
            height: 720,
            borderRadius: 9999,
            border: `3px solid ${color.brand}`,
            opacity: ringOpacity,
            transform: `scale(${ringScale})`,
            boxShadow: `0 0 140px ${color.brand}aa, 0 0 60px ${color.brand}88, inset 0 0 120px ${color.brand}44`,
          }}
        />
        {/* Concentric inner ring for extra punch */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            width: 540,
            height: 540,
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
            fontSize: 156,
            lineHeight: 1,
            letterSpacing: "-0.04em",
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
// FlickerFinale — six rapid 0.5s intercuts of all four captures, brand
// flashes between cuts, builds tension into the outro.
// ─────────────────────────────────────────────────────────────────────────
const FLICKER: Array<{ capturePath: string; startFrame: number; scale: number }> = [
  { capturePath: CAPTURE.dashboard, startFrame: 100, scale: 1.32 },
  { capturePath: CAPTURE.kudos, startFrame: 60, scale: 1.28 },
  { capturePath: CAPTURE.achievements, startFrame: 120, scale: 1.36 },
  { capturePath: CAPTURE.reports, startFrame: 80, scale: 1.24 },
  { capturePath: CAPTURE.dashboard, startFrame: 160, scale: 1.4 },
  { capturePath: CAPTURE.kudos, startFrame: 140, scale: 1.3 },
];
const FLICKER_PER_FRAMES = 15;

const FlickerFinale: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(
    FLICKER.length - 1,
    Math.floor(frame / FLICKER_PER_FRAMES),
  );
  const clip = FLICKER[idx];
  const localFrame = frame - idx * FLICKER_PER_FRAMES;
  const flash = interpolate(localFrame, [0, 3, 7], [1, 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "#040408" }}>
      <AbsoluteFill style={{ transform: `scale(${clip.scale})` }}>
        <OffthreadVideo
          src={staticFile(clip.capturePath)}
          startFrom={clip.startFrame}
        />
      </AbsoluteFill>
      <AbsoluteFill
        aria-hidden
        style={{
          backgroundColor: color.brand,
          opacity: flash * 0.55,
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
// OutroChip — pure black, app.pulsehr.it chip with breathing brand dot.
// ─────────────────────────────────────────────────────────────────────────
const OutroChip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chipSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 130 },
  });
  const dotPulse = 0.82 + 0.18 * Math.sin((frame / fps) * Math.PI * 2.4);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize: 84,
          letterSpacing: "-0.025em",
          textAlign: "center",
          opacity: chipSpring,
          transform: `translateY(${(1 - chipSpring) * 12}px)`,
        }}
      >
        HR · <span style={{ fontStyle: "italic", color: color.brand }}>rebuilt.</span>
      </div>
      <div
        style={{
          marginTop: 4,
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
          fontSize: 18,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.78)",
          opacity: chipSpring,
        }}
      >
        <span
          style={{
            width: 11,
            height: 11,
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
