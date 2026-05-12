import { Composition } from "remotion";
import { CAPTURE_REEL_PADDING_FRAMES, CaptureReel, type CaptureReelProps } from "./CaptureReel";
import { type TimedCaption } from "./components/Caption";
import { DayInPulse } from "./DayInPulse";
import { Montage, type MontageProps } from "./Montage";
import { INTRO_DURATION_FRAMES } from "./scenes/Intro";
import { OUTRO_DURATION_FRAMES } from "./scenes/Outro";

const FPS = 30;

interface ReelDescriptor {
  /** Composition id stub — full id is `${id}-${aspect}`. */
  id: string;
  title: string;
  subtitle?: string;
  outroTagline?: string;
  /**
   * Path within `public/` to the recorded clip. The clip's expected duration
   * (in seconds) is captureSeconds.
   */
  capturePath: string;
  captureSeconds: number;
  cues: TimedCaption[];
}

/**
 * Each flow declares its expected capture duration. After re-recording a flow,
 * update its `captureSeconds` to match the freshly produced clip.
 *
 * Cue lists are inlined here to keep Studio cold-start reliable. Wrap a span
 * in `*…*` markers to render it in the brand accent color.
 */
const REELS: ReelDescriptor[] = [
  {
    id: "kudos-give",
    title: "Recognition that *lands*.",
    subtitle: "Pulse HR · Kudos",
    outroTagline: "HR you can read, fork, and run.",
    capturePath: "captures/kudos-give/clip.mp4",
    captureSeconds: 15.76,
    cues: [
      { atMs: 600, text: "Pick a teammate", holdMs: 1700 },
      { atMs: 3400, text: "Plain English. *No forms.*", holdMs: 2400 },
      { atMs: 8200, text: "*25 coins* on the way", holdMs: 1800 },
      { atMs: 11800, text: "Sent. *Confetti* optional.", holdMs: 2400 },
    ],
  },
  {
    id: "time-attendance-entry",
    title: "Logging time, *finally fast*.",
    subtitle: "Pulse HR · Time",
    outroTagline: "HR you can read, fork, and run.",
    capturePath: "captures/time-attendance-entry/clip.mp4",
    captureSeconds: 17.48,
    cues: [
      { atMs: 600, text: "New time entry", holdMs: 1500 },
      { atMs: 3500, text: "What you *actually* worked on", holdMs: 2300 },
      { atMs: 8500, text: "Hours. *In quarters.*", holdMs: 1700 },
      { atMs: 11500, text: "Logged. Total *updates*.", holdMs: 2200 },
      { atMs: 14500, text: "Filled days at a glance", holdMs: 1800 },
    ],
  },
  {
    id: "growth-checks",
    title: "Growth, *visible*.",
    subtitle: "Pulse HR · Growth",
    outroTagline: "HR you can read, fork, and run.",
    capturePath: "captures/growth-checks/clip.mp4",
    captureSeconds: 12.4,
    cues: [
      { atMs: 600, text: "Growth at a *glance*", holdMs: 2000 },
      { atMs: 4500, text: "Earn XP. *Climb the podium.*", holdMs: 2400 },
      { atMs: 8500, text: "*Week. Month. Year.*", holdMs: 2400 },
    ],
  },
  {
    id: "workspace-create",
    title: "Set up your *workspace*.",
    subtitle: "Pulse HR · Onboarding",
    outroTagline: "HR you can read, fork, and run.",
    capturePath: "captures/workspace-create/clip.mp4",
    captureSeconds: 39.36,
    cues: [
      { atMs: 1000, text: "Sign in", holdMs: 1800 },
      { atMs: 9000, text: "Name your workspace", holdMs: 2500 },
      { atMs: 21000, text: "Select your company size", holdMs: 2500 },
      { atMs: 27000, text: "Add your teammates", holdMs: 2500 },
      { atMs: 36000, text: "Workspace created.", holdMs: 2500 },
    ],
  },
];

const ASPECTS = [
  { suffix: "1080", width: 1920, height: 1080 },
  { suffix: "shorts", width: 1080, height: 1920 },
  { suffix: "square", width: 1080, height: 1080 },
] as const;

const buildReelComposition = (reel: ReelDescriptor, aspect: (typeof ASPECTS)[number]) => {
  const captureDurationFrames = Math.round(reel.captureSeconds * FPS);
  const total = captureDurationFrames + CAPTURE_REEL_PADDING_FRAMES;
  const props: CaptureReelProps = {
    title: reel.title,
    subtitle: reel.subtitle,
    outroTagline: reel.outroTagline,
    capturePath: reel.capturePath,
    captureDurationFrames,
    cues: reel.cues,
  };
  return (
    <Composition
      key={`${reel.id}-${aspect.suffix}`}
      id={`reel-${reel.id}-${aspect.suffix}`}
      component={CaptureReel}
      durationInFrames={total}
      fps={FPS}
      width={aspect.width}
      height={aspect.height}
      defaultProps={props}
    />
  );
};

// ─── Montage — homepage hero, ~20s tour of every reel ─────────────────────
const SEGMENT_SECONDS = 5;
const SEGMENT_START_SECONDS = 2;

const MONTAGE: MontageProps = {
  introTitle: "The whole loop, *in seconds*.",
  introSubtitle: "Pulse HR — guided tour",
  outroTagline: "HR you can read, fork, and run.",
  clips: REELS.map((reel) => {
    const segmentMs = SEGMENT_SECONDS * 1000;
    return {
      capturePath: reel.capturePath,
      durationFrames: SEGMENT_SECONDS * FPS,
      startFrame: SEGMENT_START_SECONDS * FPS,
      label: reel.title.replace(/\*/g, "").replace(/\.$/, ""),
      cues: reel.cues
        .map((c) => ({ ...c, atMs: c.atMs - SEGMENT_START_SECONDS * 1000 }))
        .filter((c) => c.atMs >= 0 && c.atMs <= segmentMs - 600)
        .slice(0, 1),
    };
  }),
};

const MONTAGE_DURATION_FRAMES =
  INTRO_DURATION_FRAMES +
  MONTAGE.clips.reduce((sum, c) => sum + c.durationFrames, 0) +
  OUTRO_DURATION_FRAMES;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DayInPulse"
        component={DayInPulse}
        durationInFrames={360}
        fps={FPS}
        width={1280}
        height={720}
      />
      {REELS.flatMap((reel) => ASPECTS.map((aspect) => buildReelComposition(reel, aspect)))}
      {ASPECTS.map((aspect) => (
        <Composition
          key={`montage-${aspect.suffix}`}
          id={`montage-${aspect.suffix}`}
          component={Montage}
          durationInFrames={MONTAGE_DURATION_FRAMES}
          fps={FPS}
          width={aspect.width}
          height={aspect.height}
          defaultProps={MONTAGE}
        />
      ))}
    </>
  );
};
