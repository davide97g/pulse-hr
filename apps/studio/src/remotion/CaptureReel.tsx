import {
  AbsoluteFill,
  OffthreadVideo,
  Series,
  staticFile,
} from "remotion";
import { color } from "./tokens";
import { fonts } from "./fonts";
import { Intro, INTRO_DURATION_FRAMES } from "./scenes/Intro";
import { Outro, OUTRO_DURATION_FRAMES } from "./scenes/Outro";
import { Caption, type TimedCaption } from "./components/Caption";

export const CAPTURE_REEL_PADDING_FRAMES =
  INTRO_DURATION_FRAMES + OUTRO_DURATION_FRAMES;

export interface CaptureReelProps {
  /** Display title shown in the intro card. */
  title: string;
  /** Optional kicker line under the title. */
  subtitle?: string;
  /** Tagline shown in the outro. */
  outroTagline?: string;
  /**
   * Path to the captured clip, relative to the Remotion `public/` root.
   * Example: "captures/kudos-give/clip.mp4"
   */
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
        <Series.Sequence
          durationInFrames={INTRO_DURATION_FRAMES}
          name="Intro"
        >
          <Intro title={title} subtitle={subtitle} />
        </Series.Sequence>

        <Series.Sequence
          durationInFrames={captureDurationFrames}
          name="Capture"
        >
          <AbsoluteFill>
            <OffthreadVideo src={staticFile(capturePath)} />
            <Caption cues={cues} />
          </AbsoluteFill>
        </Series.Sequence>

        <Series.Sequence
          durationInFrames={OUTRO_DURATION_FRAMES}
          name="Outro"
        >
          <Outro tagline={outroTagline} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
