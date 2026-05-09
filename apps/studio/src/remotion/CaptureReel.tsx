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

export const CAPTURE_REEL_PADDING_FRAMES =
  INTRO_DURATION_FRAMES + OUTRO_DURATION_FRAMES;

const ENTER_FRAMES = 10;
const EXIT_FRAMES = 10;

export interface CaptureReelProps {
  /** Display title shown in the intro card. */
  title: string;
  /** Optional kicker line under the title. */
  subtitle?: string;
  /** Tagline shown in the outro. */
  outroTagline?: string;
  /** Path to the captured clip, relative to the Remotion `public/` root. */
  capturePath: string;
  /** Length of the capture clip in frames at the composition's fps. */
  captureDurationFrames: number;
  /** Caption cues, anchored relative to the start of the capture clip. */
  cues?: TimedCaption[];
}

/**
 * Generic three-act reel: Intro card → captured browser clip with caption
 * overlay → Outro card. Use one Composition per flow, all backed by this
 * single component.
 */
export const CaptureReel: React.FC<CaptureReelProps> = ({
  title,
  subtitle,
  outroTagline,
  capturePath,
  captureDurationFrames,
  cues = [],
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
          <Intro title={title} subtitle={subtitle} />
        </Series.Sequence>

        <Series.Sequence
          durationInFrames={captureDurationFrames}
          name="Capture"
        >
          <CaptureScene
            capturePath={capturePath}
            captureDurationFrames={captureDurationFrames}
            cues={cues}
            label={subtitle ?? title}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={OUTRO_DURATION_FRAMES} name="Outro">
          <Outro tagline={outroTagline} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

interface CaptureSceneProps {
  capturePath: string;
  captureDurationFrames: number;
  cues: TimedCaption[];
  label: string;
}

export const CaptureScene: React.FC<CaptureSceneProps> = ({
  capturePath,
  captureDurationFrames,
  cues,
  label,
}) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const square = width <= 1080 && Math.abs(width - 1080) < 1;

  const enterSpring = spring({
    frame,
    fps,
    durationInFrames: ENTER_FRAMES,
    config: { damping: 16, mass: 0.7, stiffness: 130 },
  });
  const enterScale = interpolate(enterSpring, [0, 1], [1.06, 1]);
  const enterBlur = interpolate(enterSpring, [0, 1], [10, 0]);
  const enterOpacity = enterSpring;

  const exitProgress = interpolate(
    frame,
    [captureDurationFrames - EXIT_FRAMES, captureDurationFrames],
    [0, 1],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const exitOpacity = 1 - exitProgress;
  const exitScale = interpolate(exitProgress, [0, 1], [1, 1.05]);
  const exitBlur = interpolate(exitProgress, [0, 1], [0, 6]);

  // Brief floating chip at the start, similar to Apple "now showing" moment.
  const chipOpacity = interpolate(
    frame,
    [4, 10, 50, 60],
    [0, 1, 1, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const chipLift = interpolate(frame, [4, 10], [-6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = enterOpacity * exitOpacity;
  const scale = enterScale * exitScale;
  const blur = Math.max(enterBlur, exitBlur);

  return (
    <AbsoluteFill style={{ backgroundColor: color.ink }}>
      <AbsoluteFill
        style={{
          opacity,
          transform: `scale(${scale})`,
          filter: `blur(${blur}px)`,
        }}
      >
        <OffthreadVideo src={staticFile(capturePath)} />
      </AbsoluteFill>

      <AbsoluteFill
        aria-hidden
        style={{
          pointerEvents: "none",
          boxShadow: `inset 0 0 0 1px ${color.brand}1a, inset 0 0 120px rgba(0,0,0,0.45)`,
          opacity: opacity,
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.35) 100%)`,
          opacity: opacity,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: square ? 22 : 30,
          left: square ? 22 : 32,
          padding: "6px 12px",
          borderRadius: 9999,
          backgroundColor: "rgba(10,10,15,0.78)",
          backdropFilter: "blur(12px) saturate(160%)",
          WebkitBackdropFilter: "blur(12px) saturate(160%)",
          border: `1px solid ${color.brand}55`,
          color: color.cream,
          fontFamily: fonts.mono,
          fontSize: square ? 11 : 12,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          opacity: chipOpacity,
          transform: `translateY(${chipLift}px)`,
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
        {label}
      </div>

      <Caption cues={cues} />
    </AbsoluteFill>
  );
};
