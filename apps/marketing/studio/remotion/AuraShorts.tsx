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
import musicData from "../audio/aura-phonk.music.json" with { type: "json" };

// ── Aura-Farming Phonk Reel — 30s @ 30fps ─────────────────────────────────
//
// 3 product acts (no onboarding — workspace is already seeded at 100
// employees via the dev bypass). Each act has internal zoom/click/hover
// choreography inside the capture; composition adds caption stings, brand
// flares on detected drops, transition flashes, gentle film grade.
//
// Beat sheet (frames @ 30fps):
//   0–90    (3s)  ColdOpen           "your team has an *aura*."
//   90–300  (7s)  Act 1 · Constellation  "feel the *room*."
//   300–660 (12s) Act 2 · Skills me→team "skills. *mine*. *team*. *mapped*."
//   660–810 (5s)  Act 3 · Saturation     "see *burnout* before it bites."
//   810–900 (3s)  Outro              "*hr*. rebuilt."

const FPS = 30;
const COLD_OPEN_FRAMES = 90;
const OUTRO_FRAMES = 90;

export const AURA_SHORTS_DURATION_FRAMES = 900;

// Audio offset — drop 1 in the track (25.8s) lands at reel time 3s = the
// cold-open exit punch.
const AUDIO_OFFSET_SECONDS = 22.8;

const DROPS_IN_REEL: Array<{ start: number; end: number }> = musicData.drops
  .map((d) => ({
    start: d.start - AUDIO_OFFSET_SECONDS,
    end: d.end - AUDIO_OFFSET_SECONDS,
  }))
  .filter(
    (d) => d.end >= 0 && d.start <= AURA_SHORTS_DURATION_FRAMES / FPS + 0.5,
  );

const dropEnvelope = (reelSeconds: number): number => {
  let strongest = 0;
  for (const d of DROPS_IN_REEL) {
    if (reelSeconds < d.start - 0.05) continue;
    if (reelSeconds > d.end + 1.2) continue;
    const t = reelSeconds - d.start;
    const rise = Math.max(0, Math.min(1, (t + 0.05) / 0.1));
    const decayStart = Math.max(0, t - 0.1);
    const decay = Math.exp(-decayStart * 1.8);
    strongest = Math.max(strongest, rise * decay);
  }
  return strongest;
};

const BEAT_TICKS_IN_REEL: number[] = musicData.beats
  .map((b) => b - AUDIO_OFFSET_SECONDS)
  .filter((t) => {
    if (t < 0) return false;
    if (t > AURA_SHORTS_DURATION_FRAMES / FPS) return false;
    return DROPS_IN_REEL.some(
      (d) => t >= d.start - 0.05 && t <= d.end + 0.3,
    );
  });

const beatTickEnvelope = (reelSeconds: number): number => {
  for (const t of BEAT_TICKS_IN_REEL) {
    const dt = reelSeconds - t;
    if (dt < -0.02 || dt > 0.18) continue;
    if (dt < 0) return Math.max(0, 1 + dt / 0.02);
    return Math.exp(-dt * 14);
  }
  return 0;
};

export interface AuraShortsProps {
  audioSrc: string;
  variant?: "shorts" | "landscape";
}

const FILL_SCALE: Record<"shorts" | "landscape", number> = {
  shorts: 1.95,
  landscape: 1.18,
};

interface ActConfig {
  spec: string;
  startFrame: number;
  durationFrames: number;
  caption: string;
  captionInFrame: number;
  captionOutFrame: number;
  zoom: { from: number; to: number };
  drift: { fromY: number; toY: number };
}

const ACTS: ActConfig[] = [
  {
    spec: "aura-constellation",
    startFrame: 18,
    durationFrames: 210,
    caption: "feel the *room*.",
    captionInFrame: 48,
    captionOutFrame: 186,
    zoom: { from: 1.0, to: 1.035 },
    drift: { fromY: 0, toY: -1 },
  },
  {
    spec: "aura-skills-tour",
    startFrame: 24,
    durationFrames: 360,
    caption: "skills. *mine*, *team*, *mapped*.",
    captionInFrame: 90,
    captionOutFrame: 336,
    zoom: { from: 1.0, to: 1.04 },
    drift: { fromY: -1, toY: 1 },
  },
  {
    spec: "aura-saturation",
    startFrame: 24,
    durationFrames: 150,
    caption: "see *burnout* before it bites.",
    captionInFrame: 48,
    captionOutFrame: 132,
    zoom: { from: 1.0, to: 1.03 },
    drift: { fromY: 1, toY: -1 },
  },
];

const capturePathFor = (spec: string, variant: "shorts" | "landscape") =>
  variant === "shorts"
    ? `captures/${spec}/clip.shorts.mp4`
    : `captures/${spec}/clip.mp4`;

export const AuraShorts: React.FC<AuraShortsProps> = ({
  audioSrc,
  variant = "shorts",
}) => {
  const fillScale = FILL_SCALE[variant];
  let cumulative = COLD_OPEN_FRAMES;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        color: color.cream,
        fontFamily: fonts.sans,
      }}
    >
      <Audio
        src={staticFile(audioSrc)}
        volume={1}
        startFrom={Math.round(AUDIO_OFFSET_SECONDS * FPS)}
      />

      <BackgroundHalo />

      <Series>
        <Series.Sequence durationInFrames={COLD_OPEN_FRAMES} name="ColdOpen">
          <ColdOpen />
        </Series.Sequence>

        {ACTS.map((act, i) => {
          const actStart = cumulative;
          cumulative += act.durationFrames;
          return (
            <Series.Sequence
              key={i}
              durationInFrames={act.durationFrames}
              name={`Act ${i + 1} · ${act.spec}`}
            >
              <Act
                act={act}
                capturePath={capturePathFor(act.spec, variant)}
                fillScale={fillScale}
                actStartFrame={actStart}
              />
            </Series.Sequence>
          );
        })}

        <Series.Sequence durationInFrames={OUTRO_FRAMES} name="Outro">
          <Outro actStartFrame={cumulative} />
        </Series.Sequence>
      </Series>

      <DropFlare />

      <FilmGrain />
      <Vignette />
    </AbsoluteFill>
  );
};

// ─── Static low-opacity halo — no pulse ───────────────────────────────────
const BackgroundHalo: React.FC = () => (
  <AbsoluteFill
    aria-hidden
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${color.brand}1a 0%, transparent 70%)`,
    }}
  />
);

// ─── DropFlare — animates only inside detected drop windows ───────────────
const DropFlare: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reelSeconds = frame / fps;
  const env = dropEnvelope(reelSeconds);
  if (env <= 0.02) return null;
  return (
    <AbsoluteFill
      aria-hidden
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse 72% 50% at 50% 50%, ${color.brand}55 0%, transparent 65%)`,
        opacity: env * 0.55,
        mixBlendMode: "screen",
      }}
    />
  );
};

// ─── Cold open ────────────────────────────────────────────────────────────
const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reelSeconds = frame / fps;

  const orbSpring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 16, mass: 0.9, stiffness: 130 },
  });
  const tick = beatTickEnvelope(reelSeconds);
  const env = dropEnvelope(reelSeconds);
  const exit = interpolate(
    frame,
    [COLD_OPEN_FRAMES - 12, COLD_OPEN_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const tokens = tokenize("your team has an *aura*.");

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        padding: "0 56px",
        opacity: exit,
      }}
    >
      <div
        style={{
          width: 240,
          height: 240,
          borderRadius: 9999,
          background: `radial-gradient(circle at 50% 50%, ${color.brand} 0%, ${color.brand}55 40%, transparent 70%)`,
          boxShadow: `0 0 ${60 + tick * 80}px ${color.brand}, 0 0 ${160 + env * 220}px ${color.brand}55`,
          transform: `scale(${0.75 + orbSpring * 0.25 + tick * 0.08})`,
          opacity: orbSpring,
        }}
      />
      <Tagline
        tokens={tokens}
        baseFrame={frame}
        enterAt={18}
        fontSize={96}
        accentBoost={tick}
      />
    </AbsoluteFill>
  );
};

// ─── Act — capture + caption sting + entry flash ──────────────────────────
const Act: React.FC<{
  act: ActConfig;
  capturePath: string;
  fillScale: number;
  actStartFrame: number;
}> = ({ act, capturePath, fillScale, actStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reelSeconds = (actStartFrame + frame) / fps;
  const tick = beatTickEnvelope(reelSeconds);
  const duration = act.durationFrames;

  const t = interpolate(frame, [0, duration], [0, 1], {
    easing: Easing.bezier(0.42, 0.0, 0.58, 1.0),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kbZoom = interpolate(t, [0, 1], [act.zoom.from, act.zoom.to]);
  const ty = interpolate(t, [0, 1], [act.drift.fromY, act.drift.toY]);
  const scale = fillScale * kbZoom;

  // Soft enter/exit. Reduced blur — was 10px, now 4px.
  const enter = spring({
    frame,
    fps,
    config: { damping: 22, mass: 0.7, stiffness: 140 },
    durationInFrames: 12,
  });
  const exit = interpolate(frame, [duration - 12, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;
  const enterBlur = interpolate(enter, [0, 1], [4, 0]);

  const flash = interpolate(frame, [0, 2, 7], [0, 0.75, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const captionIn = spring({
    frame: frame - act.captionInFrame,
    fps,
    config: { damping: 18, mass: 0.85, stiffness: 140 },
  });
  const captionOut = interpolate(
    frame,
    [act.captionOutFrame, act.captionOutFrame + 12],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const captionOpacity = captionIn * captionOut;
  const captionLift = interpolate(captionIn, [0, 1], [36, 0]);
  const captionBlur = interpolate(captionIn, [0, 1], [10, 0]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          opacity,
          transform: `translateY(${ty}%) scale(${scale})`,
          filter: `blur(${enterBlur}px)`,
        }}
      >
        <OffthreadVideo
          src={staticFile(capturePath)}
          startFrom={act.startFrame}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "22%",
          padding: "0 56px",
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <CaptionLine
          tokens={tokenize(act.caption)}
          opacity={captionOpacity}
          translateY={captionLift}
          blur={captionBlur}
          fontSize={86}
          accentBoost={tick}
        />
      </div>

      <AbsoluteFill
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% 50%, ${color.brand}, transparent 70%)`,
          opacity: flash,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Outro ────────────────────────────────────────────────────────────────
const Outro: React.FC<{ actStartFrame: number }> = ({ actStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reelSeconds = (actStartFrame + frame) / fps;
  const tick = beatTickEnvelope(reelSeconds);
  const env = dropEnvelope(reelSeconds);

  const orbSpring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 14, mass: 0.9, stiffness: 140 },
  });
  const chipSpring = spring({
    frame: frame - 24,
    fps,
    config: { damping: 16, mass: 0.85, stiffness: 130 },
  });

  const tokens = tokenize("*hr*. rebuilt.");

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
        padding: "0 56px",
      }}
    >
      <div
        style={{
          width: 170,
          height: 170,
          borderRadius: 9999,
          background: `radial-gradient(circle at 50% 50%, ${color.brand} 0%, ${color.brand}66 40%, transparent 70%)`,
          boxShadow: `0 0 ${50 + tick * 80}px ${color.brand}, 0 0 ${150 + env * 160}px ${color.brand}55`,
          transform: `scale(${0.72 + orbSpring * 0.28 + tick * 0.06})`,
          opacity: orbSpring,
        }}
      />
      <Tagline
        tokens={tokens}
        baseFrame={frame}
        enterAt={6}
        fontSize={104}
        accentBoost={tick}
      />
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "13px 24px",
          borderRadius: 9999,
          border: `1px solid ${color.brand}88`,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          fontFamily: fonts.mono,
          fontSize: 24,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          opacity: chipSpring,
          transform: `translateY(${(1 - chipSpring) * 12}px) scale(${interpolate(chipSpring, [0, 1], [0.92, 1])})`,
          boxShadow: `0 0 ${22 + tick * 32}px ${color.brand}66`,
        }}
      >
        <span
          style={{
            width: 13,
            height: 13,
            borderRadius: 9999,
            backgroundColor: color.brand,
            boxShadow: `0 0 ${20 + tick * 22}px ${color.brand}`,
            transform: `scale(${0.85 + tick * 0.25})`,
          }}
        />
        pulsehr.it
      </div>
    </AbsoluteFill>
  );
};

// ─── Typography helpers ───────────────────────────────────────────────────
const Tagline: React.FC<{
  tokens: Array<{ text: string; brand: boolean }>;
  baseFrame: number;
  enterAt: number;
  fontSize: number;
  accentBoost: number;
}> = ({ tokens, baseFrame, enterAt, fontSize, accentBoost }) => {
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        fontFamily: fonts.display,
        fontWeight: 600,
        fontSize,
        lineHeight: 1.0,
        letterSpacing: "-0.04em",
        textAlign: "center",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.24em",
      }}
    >
      {tokens.map((tok, i) => {
        const start = enterAt + i * 4;
        const s = spring({
          frame: baseFrame - start,
          fps,
          config: { damping: 18, mass: 0.7, stiffness: 130 },
        });
        const lift = interpolate(s, [0, 1], [24, 0]);
        const blur = interpolate(s, [0, 1], [8, 0]);
        const accentScale = tok.brand ? 1 + accentBoost * 0.06 : 1;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: s,
              transform: `translateY(${lift}px) scale(${accentScale})`,
              filter: `blur(${blur}px)`,
              fontStyle: tok.brand ? "italic" : "normal",
              color: tok.brand ? color.brand : color.cream,
              textShadow: tok.brand
                ? `0 0 ${24 + accentBoost * 28}px ${color.brand}cc, 0 0 10px ${color.brand}`
                : "none",
            }}
          >
            {tok.text}
          </span>
        );
      })}
    </div>
  );
};

const CaptionLine: React.FC<{
  tokens: Array<{ text: string; brand: boolean }>;
  opacity: number;
  translateY: number;
  blur: number;
  fontSize: number;
  accentBoost: number;
}> = ({ tokens, opacity, translateY, blur, fontSize, accentBoost }) => {
  return (
    <div
      style={{
        fontFamily: fonts.display,
        fontWeight: 600,
        fontSize,
        lineHeight: 0.98,
        letterSpacing: "-0.04em",
        textAlign: "center",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0.22em",
        opacity,
        transform: `translateY(${translateY}px)`,
        filter: `blur(${blur}px)`,
        textShadow: "0 6px 28px rgba(0,0,0,0.7)",
      }}
    >
      {tokens.map((tok, i) => {
        const accentScale = tok.brand ? 1 + accentBoost * 0.05 : 1;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `scale(${accentScale})`,
              fontStyle: tok.brand ? "italic" : "normal",
              color: tok.brand ? color.brand : color.cream,
              textShadow: tok.brand
                ? `0 0 ${26 + accentBoost * 24}px ${color.brand}cc, 0 0 10px ${color.brand}, 0 6px 28px rgba(0,0,0,0.7)`
                : "0 6px 28px rgba(0,0,0,0.7)",
            }}
          >
            {tok.text}
          </span>
        );
      })}
    </div>
  );
};

// ─── Film overlays — toned down ───────────────────────────────────────────
const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = (frame * 7) % 9973;
  return (
    <AbsoluteFill
      aria-hidden
      style={{
        pointerEvents: "none",
        opacity: 0.04,
        mixBlendMode: "overlay",
      }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <filter id="aura-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
            seed={seed}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#aura-noise)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    aria-hidden
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse 100% 88% at 50% 50%, transparent 60%, rgba(0,0,0,0.35) 100%)",
    }}
  />
);

// ─────────────────────────────────────────────────────────────────────────
function tokenize(s: string): Array<{ text: string; brand: boolean }> {
  const out: Array<{ text: string; brand: boolean }> = [];
  for (const word of s.split(/\s+/)) {
    if (word.startsWith("*") && word.endsWith("*") && word.length > 2) {
      out.push({ text: word.slice(1, -1), brand: true });
    } else if (word.startsWith("*") && word.length > 1) {
      const inner = word.replace(/^\*|\*(?=[^a-zA-Z0-9]?$)/g, "");
      out.push({ text: inner, brand: true });
    } else {
      out.push({ text: word, brand: false });
    }
  }
  return out;
}
