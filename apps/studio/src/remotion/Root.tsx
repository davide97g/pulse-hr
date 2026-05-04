import { Composition } from "remotion";
import { DayInPulse } from "./DayInPulse";
import {
  CaptureReel,
  CAPTURE_REEL_PADDING_FRAMES,
  type CaptureReelProps,
} from "./CaptureReel";
import { Montage, type MontageProps } from "./Montage";
import { INTRO_DURATION_FRAMES } from "./scenes/Intro";
import { OUTRO_DURATION_FRAMES } from "./scenes/Outro";
import { type TimedCaption } from "./components/Caption";

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
 * Cue lists are inlined here to keep Studio cold-start reliable; once the
 * recording pipeline emits `<spec>.captions.timed.json`, swap inline cues for
 * `import` of that file.
 */
const REELS: ReelDescriptor[] = [
  {
    id: "kudos-give",
    title: "Send kudos in seconds",
    subtitle: "Pulse HR · Kudos",
    capturePath: "captures/kudos-give/clip.mp4",
    captureSeconds: 15.76,
    cues: [
      { atMs: 600, text: "Pick a teammate", holdMs: 1800 },
      { atMs: 3400, text: "Say what they did. Plain English.", holdMs: 2400 },
      { atMs: 8200, text: "25 coins on the way", holdMs: 1800 },
      { atMs: 11800, text: "Sent. Confetti optional.", holdMs: 2400 },
    ],
  },
  {
    id: "time-attendance-entry",
    title: "Log your time",
    subtitle: "What you worked on, in seconds",
    capturePath: "captures/time-attendance-entry/clip.mp4",
    captureSeconds: 17.48,
    cues: [
      { atMs: 600, text: "New time entry", holdMs: 1600 },
      { atMs: 3500, text: "What you actually worked on", holdMs: 2400 },
      { atMs: 8500, text: "Hours, in quarters", holdMs: 1800 },
      { atMs: 11500, text: "Logged. Weekly total updates.", holdMs: 2200 },
      { atMs: 14500, text: "Filled days at a glance", holdMs: 1800 },
    ],
  },
  {
    id: "growth-checks",
    title: "Track growth at a glance",
    subtitle: "XP, levels, prizes",
    capturePath: "captures/growth-checks/clip.mp4",
    captureSeconds: 12.4,
    cues: [
      { atMs: 600, text: "Growth at a glance", holdMs: 2000 },
      { atMs: 4500, text: "Earn XP, climb the podium", holdMs: 2400 },
      { atMs: 8500, text: "Switch the window — Week, Month, Year", holdMs: 2400 },
    ],
  },
];

const ASPECTS = [
  { suffix: "1080", width: 1920, height: 1080 },
  { suffix: "720", width: 1280, height: 720 },
  { suffix: "square", width: 1080, height: 1080 },
] as const;

const buildReelComposition = (
  reel: ReelDescriptor,
  aspect: (typeof ASPECTS)[number],
) => {
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

// ─── Montage — homepage hero, ~30s tour of every reel ─────────────────────
const MONTAGE: MontageProps = {
  introTitle: "Pulse HR — a guided tour",
  introSubtitle: "30 seconds, the whole loop",
  clips: REELS.map((reel) => {
    // Each segment runs 8s starting 2s into the capture (skip the first
    // beats so each clip lands in its meaningful state).
    const segmentSeconds = 8;
    const startSeconds = 2;
    const segmentMs = segmentSeconds * 1000;
    return {
      capturePath: reel.capturePath,
      durationFrames: segmentSeconds * FPS,
      startFrame: startSeconds * FPS,
      label: reel.title,
      cues: reel.cues
        .map((c) => ({ ...c, atMs: c.atMs - startSeconds * 1000 }))
        .filter((c) => c.atMs >= 0 && c.atMs <= segmentMs - 600)
        .slice(0, 2),
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
      {REELS.flatMap((reel) =>
        ASPECTS.map((aspect) => buildReelComposition(reel, aspect)),
      )}
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
