import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  Series,
  interpolate,
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

const SEGMENT_LABEL_DURATION = 24;

export const Montage: React.FC<MontageProps> = ({
  introTitle,
  introSubtitle,
  outroTagline,
  clips,
}) => {
  const { width } = useVideoConfig();
  const square = width <= 1080 && Math.abs(width - 1080) < 1;

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
            <AbsoluteFill>
              <OffthreadVideo
                src={staticFile(clip.capturePath)}
                startFrom={clip.startFrame ?? 0}
              />
              <Caption cues={clip.cues ?? []} />
              <SegmentLabel label={clip.label} square={square} />
            </AbsoluteFill>
          </Series.Sequence>
        ))}

        <Series.Sequence durationInFrames={OUTRO_DURATION_FRAMES} name="Outro">
          <Outro tagline={outroTagline} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

const SegmentLabel: React.FC<{ label: string; square: boolean }> = ({
  label,
  square,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 8, SEGMENT_LABEL_DURATION - 6, SEGMENT_LABEL_DURATION],
    [0, 1, 1, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const lift = interpolate(frame, [0, 8], [-6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: square ? 24 : 32,
        left: square ? 24 : 36,
        padding: "6px 12px",
        borderRadius: 9999,
        backgroundColor: "rgba(10,10,15,0.8)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: `1px solid ${color.brand}55`,
        color: color.cream,
        fontFamily: fonts.mono,
        fontSize: square ? 11 : 12,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        opacity,
        transform: `translateY(${lift}px)`,
      }}
    >
      {label}
    </div>
  );
};
