import {
  AbsoluteFill,
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
import { Intro, INTRO_DURATION_FRAMES } from "./scenes/Intro";
import { Outro, OUTRO_DURATION_FRAMES } from "./scenes/Outro";
import { Caption, type TimedCaption } from "./components/Caption";

export interface MontageClip {
  /** Path inside `public/` to the clip. */
  capturePath: string;
  /** How many frames of this clip to include. */
  durationFrames: number;
  /** Where in the source clip to start (frames). Default: 0. */
  startFrame?: number;
  /** Caption cues, anchored relative to the clip's local time. */
  cues?: TimedCaption[];
  /** Short label to show at the start of this segment. */
  label: string;
}

export interface MontageProps {
  introTitle: string;
  introSubtitle?: string;
  outroTagline?: string;
  clips: MontageClip[];
}

const ENTER_FRAMES = 8;
const EXIT_FRAMES = 8;

export const Montage: React.FC<MontageProps> = ({
  introTitle,
  introSubtitle,
  outroTagline,
  clips,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        color: color.cream,
        fontFamily: fonts.sans,
      }}
    >
      <Series>
        <Series.Sequence durationInFrames={INTRO_DURATION_FRAMES} name="Intro">
          <Intro title={introTitle} subtitle={introSubtitle} />
        </Series.Sequence>

        {clips.map((clip, i) => (
          <Series.Sequence
            key={i}
            durationInFrames={clip.durationFrames}
            name={`Clip-${clip.label}`}
          >
            <MontageClipScene clip={clip} />
          </Series.Sequence>
        ))}

        <Series.Sequence durationInFrames={OUTRO_DURATION_FRAMES} name="Outro">
          <Outro tagline={outroTagline} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

const MontageClipScene: React.FC<{ clip: MontageClip }> = ({ clip }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const square = width <= 1080 && Math.abs(width - 1080) < 1;

  const enterSpring = spring({
    frame,
    fps,
    durationInFrames: ENTER_FRAMES,
    config: { damping: 16, mass: 0.7, stiffness: 130 },
  });
  const enterScale = interpolate(enterSpring, [0, 1], [1.05, 1]);
  const enterBlur = interpolate(enterSpring, [0, 1], [8, 0]);

  const exitProgress = interpolate(
    frame,
    [clip.durationFrames - EXIT_FRAMES, clip.durationFrames],
    [0, 1],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const opacity = enterSpring * (1 - exitProgress);
  const scale = enterScale * interpolate(exitProgress, [0, 1], [1, 1.04]);
  const blur = Math.max(enterBlur, interpolate(exitProgress, [0, 1], [0, 5]));

  // Label animates in fast, lingers, fades.
  const labelSpring = spring({
    frame: frame - 3,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 140 },
  });
  const labelOpacity =
    labelSpring *
    interpolate(frame, [22, 30], [1, 0], {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ backgroundColor: color.ink }}>
      <AbsoluteFill
        style={{
          opacity,
          transform: `scale(${scale})`,
          filter: `blur(${blur}px)`,
        }}
      >
        <OffthreadVideo
          src={staticFile(clip.capturePath)}
          startFrom={clip.startFrame ?? 0}
        />
      </AbsoluteFill>

      <AbsoluteFill
        aria-hidden
        style={{
          pointerEvents: "none",
          boxShadow: `inset 0 0 0 1px ${color.brand}14, inset 0 0 120px rgba(0,0,0,0.45)`,
          background: `radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.35) 100%)`,
          opacity,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: square ? 22 : 30,
          left: square ? 22 : 32,
          padding: "6px 12px",
          borderRadius: 9999,
          backgroundColor: "rgba(10,10,15,0.8)",
          backdropFilter: "blur(12px) saturate(160%)",
          WebkitBackdropFilter: "blur(12px) saturate(160%)",
          border: `1px solid ${color.brand}55`,
          color: color.cream,
          fontFamily: fonts.mono,
          fontSize: square ? 11 : 12,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          opacity: labelOpacity,
          transform: `translateY(${interpolate(labelSpring, [0, 1], [-8, 0])}px)`,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 9999,
            backgroundColor: color.brand,
            boxShadow: `0 0 10px ${color.brand}`,
          }}
        />
        {clip.label}
      </div>

      <Caption cues={clip.cues ?? []} />
    </AbsoluteFill>
  );
};
