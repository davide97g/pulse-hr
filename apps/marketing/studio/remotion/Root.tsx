import { Composition } from "remotion";
import { CAPTURE_REEL_PADDING_FRAMES, CaptureReel, type CaptureReelProps } from "./CaptureReel";
import { type TimedCaption } from "./components/Caption";
import { DayInPulse } from "./DayInPulse";
import { Montage, type MontageProps } from "./Montage";
import { INTRO_DURATION_FRAMES } from "./scenes/Intro";
import { OUTRO_DURATION_FRAMES } from "./scenes/Outro";
import { Teaser, TEASER_DURATION_FRAMES } from "./Teaser";
import { Trailer, TRAILER_DURATION_FRAMES } from "./Trailer";
import { TrailerShorts, TRAILER_SHORTS_DURATION_FRAMES } from "./TrailerShorts";
import { AuraShorts, AURA_SHORTS_DURATION_FRAMES } from "./AuraShorts";
import { PresentationCore } from "./presentation/PresentationCore";
import {
  PRESENTATION_DURATION_FRAMES,
  PRESENTATION_FPS,
} from "./presentation/vo/script";

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
  /**
   * Optional portrait-recorded clip (produced by `MOBILE=1 bun run record:*`).
   * When set, the `-shorts` composition reads this clip instead of the
   * landscape one, so shorts get genuine mobile footage rather than a cropped
   * desktop view.
   */
  capturePathShorts?: string;
  captureSeconds: number;
  /** Optional duration of the portrait clip if it differs from captureSeconds. */
  captureSecondsShorts?: number;
  cues: TimedCaption[];
  /** Optional caption override for portrait — shorter wording, snappier holds. */
  cuesShorts?: TimedCaption[];
}

/**
 * Each flow declares its expected capture duration. After re-recording a flow,
 * update its `captureSeconds` to match the freshly produced clip.
 *
 * Cue lists are inlined here to keep Studio cold-start reliable. Wrap a span
 * in `*…*` markers to render it in the brand accent color.
 *
 * For shorts, run `MOBILE=1 bun run record:<flow>` then add
 * `capturePathShorts: "captures/<flow>/clip.shorts.mp4"` plus the matching
 * `captureSecondsShorts` and (optionally) `cuesShorts` with portrait-tuned
 * wording. The `-shorts` composition automatically picks the portrait clip
 * when those fields are present.
 */
const REELS: ReelDescriptor[] = [
  {
    id: "kudos-give",
    title: "Recognition that *lands*.",
    subtitle: "Pulse HR · Kudos",
    outroTagline: "HR, rebuilt.",
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
    outroTagline: "HR, rebuilt.",
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
    outroTagline: "HR, rebuilt.",
    capturePath: "captures/growth-checks/clip.mp4",
    captureSeconds: 12.4,
    cues: [
      { atMs: 600, text: "Growth at a *glance*", holdMs: 2000 },
      { atMs: 4500, text: "Earn XP. *Climb the podium.*", holdMs: 2400 },
      { atMs: 8500, text: "*Week. Month. Year.*", holdMs: 2400 },
    ],
  },
  {
    id: "growth-tour",
    title: "Growth, *end to end*.",
    subtitle: "Pulse HR · Growth",
    outroTagline: "HR, rebuilt.",
    capturePath: "captures/growth-tour/clip.mp4",
    captureSeconds: 19.28,
    cues: [
      { atMs: 800, text: "Growth at a *glance*", holdMs: 2200 },
      { atMs: 4500, text: "*Achievements* — what we celebrate", holdMs: 2400 },
      { atMs: 8500, text: "*Challenges* with a prize ladder", holdMs: 2400 },
      { atMs: 12500, text: "The *kudos* feed", holdMs: 2200 },
      { atMs: 16000, text: "*Skill paths* — where we're heading", holdMs: 2600 },
    ],
  },
  {
    id: "skills-tour",
    title: "Skills, *mapped*.",
    subtitle: "Pulse HR · Skills",
    outroTagline: "HR, rebuilt.",
    capturePath: "captures/skills-tour/clip.mp4",
    captureSeconds: 16,
    cues: [
      { atMs: 800, text: "Team skills — the *heatmap*", holdMs: 2400 },
      { atMs: 5000, text: "*Gaps & strengths* at a glance", holdMs: 2400 },
      { atMs: 9500, text: "*Pending* validations", holdMs: 2200 },
    ],
  },
  {
    id: "comment-create",
    title: "Comment *anything*.",
    subtitle: "Pulse HR · In-app comments",
    outroTagline: "HR, rebuilt.",
    capturePath: "captures/comment-create/clip.mp4",
    captureSeconds: 14,
    cues: [
      { atMs: 800, text: "Comments live *in the pill*", holdMs: 2200 },
      { atMs: 3500, text: "Tap to start", holdMs: 1600 },
      { atMs: 5500, text: "Pick *anything* on the page", holdMs: 2200 },
      { atMs: 8500, text: "Plain English. *No forms.*", holdMs: 2200 },
      { atMs: 11500, text: "Posted. Team sees it *instantly*.", holdMs: 2200 },
    ],
  },
  {
    id: "comment-create-board",
    title: "From pin to *board*.",
    subtitle: "Pulse HR · Comments + Feedback",
    outroTagline: "HR, rebuilt.",
    capturePath: "captures/comment-create-board/clip.mp4",
    captureSeconds: 51,
    cues: [
      { atMs: 800, text: "Comments live *in the pill*", holdMs: 2200 },
      { atMs: 3500, text: "Tap to start", holdMs: 1600 },
      { atMs: 5500, text: "Pick *anything* on the page", holdMs: 2200 },
      { atMs: 8500, text: "Plain English. *No forms.*", holdMs: 2200 },
      { atMs: 11500, text: "Posted. Team sees it *instantly*.", holdMs: 2200 },
      { atMs: 14000, text: "Open the *feedback board*", holdMs: 2400 },
      { atMs: 17000, text: "Every pin lands on the *wall*", holdMs: 2200 },
      { atMs: 20000, text: "Open a thread", holdMs: 1800 },
      { atMs: 23000, text: "Reply inline — *no email loop*", holdMs: 2400 },
      { atMs: 26000, text: "Open → Triaged → *Shipped*", holdMs: 2400 },
      { atMs: 37000, text: "*Proposals* — ideas & improvements", holdMs: 2400 },
      { atMs: 42000, text: "*Contributors* — who shows up", holdMs: 2400 },
      { atMs: 46000, text: "*Voting power* for what matters", holdMs: 2400 },
    ],
  },
  {
    id: "comments-thread",
    title: "Comments that *land*.",
    subtitle: "Pulse HR · Feedback",
    outroTagline: "HR, rebuilt.",
    capturePath: "captures/comments-thread/clip.mp4",
    captureSeconds: 8,
    cues: [
      { atMs: 600, text: "The *feedback* board", holdMs: 1800 },
      { atMs: 2800, text: "Open a thread", holdMs: 1800 },
      { atMs: 4500, text: "Reply inline — *no email loop*", holdMs: 2400 },
      { atMs: 7000, text: "Sent. The team sees it *instantly*.", holdMs: 2200 },
    ],
  },
  {
    id: "comments-thread-board",
    title: "Feedback, *end to end*.",
    subtitle: "Pulse HR · Feedback board",
    outroTagline: "HR, rebuilt.",
    capturePath: "captures/comments-thread-board/clip.mp4",
    captureSeconds: 34,
    cues: [
      { atMs: 600, text: "The *feedback* board", holdMs: 1800 },
      { atMs: 2800, text: "Open a thread", holdMs: 1800 },
      { atMs: 4500, text: "Reply inline — *no email loop*", holdMs: 2400 },
      { atMs: 7000, text: "Sent. The team sees it *instantly*.", holdMs: 2200 },
      { atMs: 10000, text: "Every pin lands on the *wall*", holdMs: 2200 },
      { atMs: 13000, text: "Open → Triaged → *Shipped*", holdMs: 2400 },
      { atMs: 16000, text: "*Proposals* — ideas & improvements", holdMs: 2400 },
      { atMs: 19000, text: "*Contributors* — who shows up", holdMs: 2400 },
      { atMs: 21000, text: "*Voting power* for what matters", holdMs: 2400 },
    ],
  },
  {
    id: "comments-loop",
    title: "The feedback *loop*.",
    subtitle: "Pulse HR · Comments + Voting",
    outroTagline: "HR, rebuilt.",
    capturePath: "captures/comments-loop/clip.mp4",
    captureSeconds: 64.5,
    cues: [
      { atMs: 1200, text: "Comment *anything* on the page", holdMs: 2400 },
      { atMs: 8000, text: "Plain English. Tag it a *bug*.", holdMs: 2400 },
      { atMs: 13800, text: "Posted — the team sees it *instantly*", holdMs: 2400 },
      { atMs: 21500, text: "Every pin lands on the *board*", holdMs: 2000 },
      { atMs: 23900, text: "*Upvote* what matters", holdMs: 1800 },
      { atMs: 26200, text: "The score *climbs* in real time", holdMs: 2000 },
      { atMs: 28000, text: "Open a comment from the *board*", holdMs: 2200 },
      { atMs: 31000, text: "*Open in app* — straight to the spot", holdMs: 2600 },
      { atMs: 38800, text: "Right where it was *written*", holdMs: 2000 },
      { atMs: 41200, text: "The comment, *in context*", holdMs: 2200 },
      { atMs: 46400, text: "Open → Triaged → Planned → *Shipped*", holdMs: 2000 },
      { atMs: 48400, text: "Top ideas get *built*. Bugs get *fixed*.", holdMs: 2200 },
      { atMs: 53600, text: "*Voting power* — the reward loop", holdMs: 2000 },
      { atMs: 55900, text: "Complete your profile → power *doubled*", holdMs: 2600 },
      { atMs: 60400, text: "Earn *+10*, spend *1* per vote", holdMs: 2400 },
      { atMs: 62800, text: "One loop. *Whole team.*", holdMs: 2200 },
    ],
  },
  {
    id: "workspace-create",
    title: "Set up your *workspace*.",
    subtitle: "Pulse HR · Onboarding",
    outroTagline: "HR - rebuilt.",
    capturePath: "captures/workspace-create/clip.mp4",
    captureSeconds: 36,
    cues: [
      { atMs: 1000, text: "Sign in", holdMs: 1800 },
      { atMs: 10000, text: "Name your workspace", holdMs: 2500 },
      { atMs: 19500, text: "Select your company size", holdMs: 2500 },
      { atMs: 25000, text: "Add your teammates", holdMs: 2500 },
      { atMs: 32000, text: "Workspace created.", holdMs: 2500 },
    ],
  },
];

const ASPECTS = [
  { suffix: "1080", width: 1920, height: 1080 },
  { suffix: "shorts", width: 1080, height: 1920 },
  { suffix: "square", width: 1080, height: 1080 },
] as const;

const buildReelComposition = (reel: ReelDescriptor, aspect: (typeof ASPECTS)[number]) => {
  const isShorts = aspect.suffix === "shorts";
  const capturePath =
    isShorts && reel.capturePathShorts ? reel.capturePathShorts : reel.capturePath;
  const seconds =
    isShorts && reel.captureSecondsShorts ? reel.captureSecondsShorts : reel.captureSeconds;
  const cues = isShorts && reel.cuesShorts ? reel.cuesShorts : reel.cues;
  const captureDurationFrames = Math.round(seconds * FPS);
  const total = captureDurationFrames + CAPTURE_REEL_PADDING_FRAMES;
  const props: CaptureReelProps = {
    title: reel.title,
    subtitle: reel.subtitle,
    outroTagline: reel.outroTagline,
    capturePath,
    captureDurationFrames,
    cues,
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
  outroTagline: "HR, rebuilt.",
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
      <Composition
        id="trailer-v1"
        component={Trailer}
        durationInFrames={TRAILER_DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ audioSrc: "audio/trailer-v1.mp3" }}
      />
      <Composition
        id="trailer-v2"
        component={Trailer}
        durationInFrames={TRAILER_DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ audioSrc: "audio/trailer-v2.mp3" }}
      />
      <Composition
        id="teaser-v2"
        component={Teaser}
        durationInFrames={TEASER_DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ audioSrc: "audio/trailer-v2.mp3" }}
      />

      {/* ── Mobile / Instagram-Reels / YouTube-Shorts trailer ──────────────
          1080×1920, 30s, bespoke text-driven hook ("Your team is talking.
          You can't hear it. Until now.") feeding into four portrait-recorded
          captures + flicker finale + outro chip.

          Record portrait sources first:
            MOBILE=1 bun run record:trailer:dashboard
            MOBILE=1 bun run record:trailer:kudos
            MOBILE=1 bun run record:trailer:achievements
            MOBILE=1 bun run record:trailer:reports
          That writes captures/<spec>/clip.shorts.mp4 which TrailerShorts.tsx
          consumes. */}
      <Composition
        id="trailer-shorts-v1"
        component={TrailerShorts}
        durationInFrames={TRAILER_SHORTS_DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ audioSrc: "audio/trailer-v1.mp3" }}
      />
      <Composition
        id="trailer-shorts-v2"
        component={TrailerShorts}
        durationInFrames={TRAILER_SHORTS_DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ audioSrc: "audio/trailer-v2.mp3" }}
      />

      {/* ── Aura-farming phonk shorts ───────────────────────────────────────
          1080×1920, 30s. Pop-phonk arc: cold open → 5 product beats with
          beat-synced bass pulse + caption stings → outro.

          Record portrait sources first:
            MOBILE=1 bun studio/recordings/scripts/run.ts aura-dashboard
            MOBILE=1 bun studio/recordings/scripts/run.ts aura-log
            MOBILE=1 bun studio/recordings/scripts/run.ts aura-kudos
            MOBILE=1 bun studio/recordings/scripts/run.ts aura-saturation
            MOBILE=1 bun studio/recordings/scripts/run.ts aura-moments
          Drop the phonk mp3 at studio/audio/aura-phonk.mp3 then:
            bun run --filter pulse-hr-marketing aura:shorts */}
      <Composition
        id="aura-shorts-v1"
        component={AuraShorts}
        durationInFrames={AURA_SHORTS_DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ audioSrc: "audio/aura-phonk.mp3", variant: "shorts" }}
      />
      {/* Landscape variant — same composition, desktop captures, 16:9 frame
          for YouTube / hero embed / pre-roll. Record desktop sources first:
            bun studio/recordings/scripts/run.ts aura-dashboard
            bun studio/recordings/scripts/run.ts aura-log
            bun studio/recordings/scripts/run.ts aura-kudos
            bun studio/recordings/scripts/run.ts aura-saturation
            bun studio/recordings/scripts/run.ts aura-moments
          (no MOBILE=1 → writes captures/<spec>/clip.mp4) */}
      <Composition
        id="aura-landscape-v1"
        component={AuraShorts}
        durationInFrames={AURA_SHORTS_DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ audioSrc: "audio/aura-phonk.mp3", variant: "landscape" }}
      />

      {/* ── Shader-backed product presentation ─────────────────────────────
          Cold open → 4 core-value cards → 5 product chapters → outro.
          95s @ 30fps. Driven by studio/remotion/presentation/vo/script.ts.

          Prereqs before rendering:
            1. bun run presentation:vo  (generates studio/audio/vo/narration.mp3)
            2. bun run record:aura:landscape:all (or :shorts:all for portrait)
            3. bun run record:presentation:all   (the three new specs)
          Then:
            bun run presentation:1080
            bun run presentation:shorts                                       */}
      <Composition
        id="presentation-core-1080"
        component={PresentationCore}
        durationInFrames={PRESENTATION_DURATION_FRAMES}
        fps={PRESENTATION_FPS}
        width={1920}
        height={1080}
        defaultProps={{ aspect: "1080" as const }}
      />
      <Composition
        id="presentation-core-shorts"
        component={PresentationCore}
        durationInFrames={PRESENTATION_DURATION_FRAMES}
        fps={PRESENTATION_FPS}
        width={1080}
        height={1920}
        defaultProps={{ aspect: "shorts" as const }}
      />
    </>
  );
};
