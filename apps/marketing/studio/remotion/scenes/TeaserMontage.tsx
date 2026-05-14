import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";

export interface TeaserClip {
  capturePath: string;
  /** Start offset into the source clip (frames). */
  startFrame?: number;
  /** Ken-Burns micro-push range. */
  scaleFrom?: number;
  scaleTo?: number;
  translateX?: number;
  translateY?: number;
  /** Total frames this clip occupies (including its own fade-in/out). Default 18. */
  frames?: number;
}

export interface TeaserSection {
  label: string;
  fromClipIndex: number;
  /** Inclusive — the last clip belonging to this section. */
  toClipIndex: number;
}

export interface TeaserMontageProps {
  clips: TeaserClip[];
  crossfadeFrames?: number;
  sections?: TeaserSection[];
}

const DEFAULT_CLIP_FRAMES = 18;
const DEFAULT_CROSSFADE = 3;

interface ClipLayout {
  from: number;
  duration: number;
}

const layoutClips = (clips: TeaserClip[], crossfade: number): ClipLayout[] => {
  const out: ClipLayout[] = [];
  let cursor = 0;
  for (const c of clips) {
    const duration = c.frames ?? DEFAULT_CLIP_FRAMES;
    out.push({ from: cursor, duration });
    cursor += duration - crossfade;
  }
  return out;
};

export const TeaserMontage: React.FC<TeaserMontageProps> = ({
  clips,
  crossfadeFrames = DEFAULT_CROSSFADE,
  sections = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layout = layoutClips(clips, crossfadeFrames);

  return (
    <AbsoluteFill style={{ backgroundColor: "#020205" }}>
      {clips.map((clip, i) => {
        const slot = layout[i];
        return (
          <Sequence
            key={i}
            from={slot.from}
            durationInFrames={slot.duration}
          >
            <TeaserSnippet
              clip={clip}
              durationFrames={slot.duration}
              crossfadeFrames={crossfadeFrames}
            />
          </Sequence>
        );
      })}

      <AbsoluteFill
        aria-hidden
        style={{
          pointerEvents: "none",
          boxShadow: `inset 0 0 0 1px ${color.brand}26, inset 0 0 220px rgba(0,0,0,0.7)`,
          background: `radial-gradient(ellipse 88% 72% at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)`,
        }}
      />

      {sections.map((sec, i) => {
        const fromSlot = layout[sec.fromClipIndex];
        const toSlot = layout[sec.toClipIndex];
        if (!fromSlot || !toSlot) return null;
        const startFrame = fromSlot.from;
        const endFrame = toSlot.from + toSlot.duration;
        return (
          <SectionLabel
            key={i}
            text={sec.label}
            startFrame={startFrame}
            endFrame={endFrame}
            frame={frame}
            fps={fps}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const TeaserSnippet: React.FC<{
  clip: TeaserClip;
  durationFrames: number;
  crossfadeFrames: number;
}> = ({ clip, durationFrames, crossfadeFrames }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, crossfadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationFrames - crossfadeFrames, durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = Math.min(fadeIn, fadeOut);

  const blur =
    interpolate(fadeIn, [0, 1], [6, 0]) +
    interpolate(fadeOut, [0, 1], [6, 0]);

  const t = interpolate(frame, [0, durationFrames], [0, 1], {
    easing: Easing.linear,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(
    t,
    [0, 1],
    [clip.scaleFrom ?? 1.08, clip.scaleTo ?? 1.18],
  );
  const tx = clip.translateX ?? 0;
  const ty = clip.translateY ?? 0;

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
        filter: `blur(${blur}px)`,
      }}
    >
      <OffthreadVideo
        src={staticFile(clip.capturePath)}
        startFrom={clip.startFrame ?? 0}
      />
    </AbsoluteFill>
  );
};

const SECTION_FADE_IN = 6;
const SECTION_FADE_OUT = 5;

const SectionLabel: React.FC<{
  text: string;
  startFrame: number;
  endFrame: number;
  frame: number;
  fps: number;
}> = ({ text, startFrame, endFrame, frame, fps }) => {
  if (frame < startFrame - 2 || frame > endFrame + 2) return null;
  const inSpring = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 160 },
    durationInFrames: SECTION_FADE_IN,
  });
  const outFade = interpolate(
    frame,
    [endFrame - SECTION_FADE_OUT, endFrame],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = Math.min(inSpring, outFade);
  const lift = interpolate(inSpring, [0, 1], [10, 0]);

  return (
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
        opacity,
        transform: `translateY(${lift}px)`,
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
      {text}
    </div>
  );
};
