import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { color } from "../tokens";
import { fonts } from "../fonts";
import { Caption } from "../components/Caption";
import {
  DotGridBackdrop,
  GrowthWaveBackdrop,
  MeshGradientBackdrop,
  PulsingBorderOverlay,
  SmokeRingBackdrop,
  VoronoiBackdrop,
} from "./shaders";
import { ColdOpen, COLD_OPEN_FRAMES } from "./scenes/ColdOpen";
import { ValueCard, VALUE_CARD_FRAMES } from "./scenes/ValueCard";
import { ChapterSlate, CHAPTER_SLATE_FRAMES } from "./scenes/ChapterSlate";
import { CaptureBeat } from "./scenes/CaptureBeat";
import { TagOut } from "./scenes/TagOut";
import { OutroResolve, OUTRO_RESOLVE_FRAMES } from "./scenes/OutroResolve";
import {
  PRESENTATION_DURATION_FRAMES,
  PRESENTATION_FPS,
  cuesForRange,
} from "./vo/script";

/**
 * Shader-backed presentation: cold open → 4 value cards → 5 product chapters
 * → outro. Total 95 s at 30 fps. Captions and audio narration are driven by
 * the canonical VO script (vo/script.ts).
 *
 * Frame ranges (must match vo/script.ts comments):
 *   0    – 120   ColdOpen
 *   120  – 720   Values 1–4 (150 each)
 *   720  – 1065  Ch 01 Dashboard
 *   1065 – 1395  Ch 02 Employee
 *   1395 – 2025  Ch 03 Growth
 *   2025 – 2325  Ch 04 Challenges
 *   2325 – 2715  Ch 05 Skills
 *   2715 – 2850  Outro
 */

interface Props {
  aspect: "1080" | "shorts";
  /** Optional voice-over track muxed at composition start. */
  narrationAudio?: string;
  /** Optional bed music ducked under narration (default: Launch Window). */
  bedAudio?: string;
  /** Bed gain (0–1). Default 0.18 — present but well behind narration. */
  bedVolume?: number;
}

// ─── Chapter durations ──────────────────────────────────────────────────────
const CH1_FRAMES = 345; // 720–1065
const CH2_FRAMES = 330; // 1065–1395
const CH3_FRAMES = 630; // 1395–2025
const CH4_FRAMES = 300; // 2025–2325
const CH5_FRAMES = 390; // 2325–2715

// ─── Ch 1 internal split (720–1065) ─────────────────────────────────────────
const CH1_CAPTURE_FRAMES = 210; // 7.0 s
const CH1_TAGOUT_FRAMES = 45; // 1.5 s
// Slate consumes the remaining 90 frames (CH1_FRAMES - capture - tagout).

// ─── Ch 2 internal split (1065–1395) ────────────────────────────────────────
const CH2_CAPTURE_FRAMES = 195; // 6.5 s
const CH2_TAGOUT_FRAMES = 45; // 1.5 s

// ─── Ch 3 internal split (1395–2025) ────────────────────────────────────────
// 4 sub-beats × 120 frames each (4.0 s), + 60-frame tagout (2.0 s).
const CH3_SUBBEAT_FRAMES = 120;
const CH3_TAGOUT_FRAMES = 60;

// ─── Ch 4 internal split (2025–2325) ────────────────────────────────────────
const CH4_CAPTURE_FRAMES = 165; // 5.5 s
const CH4_TAGOUT_FRAMES = 45; // 1.5 s

// ─── Ch 5 internal split (2325–2715) ────────────────────────────────────────
const CH5_BEAT_FRAMES = 120; // 4.0 s × 2 beats
const CH5_TAGOUT_FRAMES = 60; // 2.0 s

export const PresentationCore: React.FC<Props> = ({
  aspect,
  narrationAudio = "audio/vo/narration.mp3",
  bedAudio = "audio/Launch Window.mp3",
  bedVolume = 0.18,
}) => {
  const variant = aspect === "shorts" ? "shorts" : "default";
  const captionCues = (start: number, end: number) =>
    cuesForRange(start, end, PRESENTATION_FPS, variant);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color.ink,
        color: color.cream,
        fontFamily: fonts.sans,
      }}
    >
      {/* Bed music — ducked low, plays for the full duration. */}
      <Audio src={staticFile(bedAudio)} volume={bedVolume} />
      {/* Narration — full mix on top. */}
      <Audio src={staticFile(narrationAudio)} volume={1} />

      <Series>
        {/* ─── Cold open ─────────────────────────────────────────────────── */}
        <Series.Sequence durationInFrames={COLD_OPEN_FRAMES} name="ColdOpen">
          <ColdOpen aspect={aspect} />
          <Caption cues={captionCues(0, 120)} />
        </Series.Sequence>

        {/* ─── Value 1 — Employee → Person ───────────────────────────────── */}
        <Series.Sequence durationInFrames={VALUE_CARD_FRAMES} name="Value-Employee">
          <ValueCard
            aspect={aspect}
            numeral="I"
            eyebrow="Core value · 01"
            line="Not a *resource*. A *person*."
            shader={<DotGridBackdrop size={6} gap={40} />}
          />
          <Caption cues={captionCues(120, 270)} />
        </Series.Sequence>

        {/* ─── Value 2 — Growth, tracked ─────────────────────────────────── */}
        <Series.Sequence durationInFrames={VALUE_CARD_FRAMES} name="Value-Growth">
          <ValueCard
            aspect={aspect}
            numeral="II"
            eyebrow="Core value · 02"
            line="*Growth*, tracked."
            shader={<GrowthWaveBackdrop speed={0.32} />}
          />
          <Caption cues={captionCues(270, 420)} />
        </Series.Sequence>

        {/* ─── Value 3 — Challenges, visible ─────────────────────────────── */}
        <Series.Sequence durationInFrames={VALUE_CARD_FRAMES} name="Value-Challenges">
          <ValueCard
            aspect={aspect}
            numeral="III"
            eyebrow="Core value · 03"
            line="*Challenges*, visible."
            shader={
              <>
                <SmokeRingBackdrop speed={0.45} />
                <PulsingBorderOverlay opacity={0.7} thickness={0.1} />
              </>
            }
          />
          <Caption cues={captionCues(420, 570)} />
        </Series.Sequence>

        {/* ─── Value 4 — Skills on a radar ───────────────────────────────── */}
        <Series.Sequence durationInFrames={VALUE_CARD_FRAMES} name="Value-Skills">
          <ValueCard
            aspect={aspect}
            numeral="IV"
            eyebrow="Core value · 04"
            line="*Skills*, on a radar."
            shader={<VoronoiBackdrop speed={0.3} distortion={0.16} />}
          />
          <Caption cues={captionCues(570, 720)} />
        </Series.Sequence>

        {/* ─── Chapter 01 — Dashboard (720–1065) ─────────────────────────── */}
        <Series.Sequence
          durationInFrames={CH1_FRAMES - CH1_CAPTURE_FRAMES - CH1_TAGOUT_FRAMES}
          name="Ch1-Slate"
        >
          <ChapterSlate
            aspect={aspect}
            number="01"
            label="The Dashboard."
            kicker="Pulse HR · One"
            shader={<MeshGradientBackdrop speed={0.3} distortion={0.55} swirl={0.35} />}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH1_CAPTURE_FRAMES} name="Ch1-Capture">
          <CaptureBeat
            aspect={aspect}
            capturePath={
              aspect === "shorts"
                ? "captures/aura-dashboard/clip.shorts.mp4"
                : "captures/aura-dashboard/clip.mp4"
            }
            durationFrames={CH1_CAPTURE_FRAMES}
            clipStartSeconds={1.5}
            chip="Dashboard · live"
          />
          <Caption cues={captionCues(810, 1020)} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH1_TAGOUT_FRAMES} name="Ch1-Tagout">
          <TagOut
            aspect={aspect}
            line="Calm. *At a glance*."
            durationFrames={CH1_TAGOUT_FRAMES}
            shader={<MeshGradientBackdrop speed={0.25} distortion={0.4} swirl={0.2} />}
          />
        </Series.Sequence>

        {/* ─── Chapter 02 — Employee details (1065–1395) ─────────────────── */}
        <Series.Sequence
          durationInFrames={CH2_FRAMES - CH2_CAPTURE_FRAMES - CH2_TAGOUT_FRAMES}
          name="Ch2-Slate"
        >
          <ChapterSlate
            aspect={aspect}
            number="02"
            label="People."
            kicker="Pulse HR · Two"
            shader={<DotGridBackdrop size={5} gap={36} />}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH2_CAPTURE_FRAMES} name="Ch2-Capture">
          <CaptureBeat
            aspect={aspect}
            capturePath={
              aspect === "shorts"
                ? "captures/presentation-employee-detail/clip.shorts.mp4"
                : "captures/presentation-employee-detail/clip.mp4"
            }
            durationFrames={CH2_CAPTURE_FRAMES}
            clipStartSeconds={0.5}
            chip="Employees"
          />
          <Caption cues={captionCues(1155, 1350)} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH2_TAGOUT_FRAMES} name="Ch2-Tagout">
          <TagOut
            aspect={aspect}
            line="*Names. Faces. Stories.*"
            durationFrames={CH2_TAGOUT_FRAMES}
            shader={<DotGridBackdrop size={5} gap={36} opacity={0.7} />}
          />
        </Series.Sequence>

        {/* ─── Chapter 03 — Growth (1395–2025) ───────────────────────────── */}
        <Series.Sequence
          durationInFrames={
            CH3_FRAMES - CH3_SUBBEAT_FRAMES * 4 - CH3_TAGOUT_FRAMES
          }
          name="Ch3-Slate"
        >
          <ChapterSlate
            aspect={aspect}
            number="03"
            label="Growth."
            kicker="Pulse HR · Three"
            shader={<GrowthWaveBackdrop speed={0.32} />}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH3_SUBBEAT_FRAMES} name="Ch3-Achievements">
          <CaptureBeat
            aspect={aspect}
            capturePath={
              aspect === "shorts"
                ? "captures/trailer-growth-achievements/clip.shorts.mp4"
                : "captures/trailer-growth-achievements/clip.mp4"
            }
            durationFrames={CH3_SUBBEAT_FRAMES}
            clipStartSeconds={1}
            chip="Achievements"
          />
          <Caption cues={captionCues(1485, 1605)} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH3_SUBBEAT_FRAMES} name="Ch3-Challenges">
          <CaptureBeat
            aspect={aspect}
            capturePath={
              aspect === "shorts"
                ? "captures/aura-onboarding/clip.shorts.mp4"
                : "captures/aura-onboarding/clip.mp4"
            }
            durationFrames={CH3_SUBBEAT_FRAMES}
            clipStartSeconds={2}
            chip="Challenges"
          />
          <Caption cues={captionCues(1605, 1725)} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH3_SUBBEAT_FRAMES} name="Ch3-Kudos">
          <CaptureBeat
            aspect={aspect}
            capturePath={
              aspect === "shorts"
                ? "captures/aura-kudos/clip.shorts.mp4"
                : "captures/aura-kudos/clip.mp4"
            }
            durationFrames={CH3_SUBBEAT_FRAMES}
            clipStartSeconds={1}
            chip="Kudos"
            sting
          />
          <Caption cues={captionCues(1725, 1845)} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH3_SUBBEAT_FRAMES} name="Ch3-SkillPaths">
          <CaptureBeat
            aspect={aspect}
            capturePath={
              aspect === "shorts"
                ? "captures/aura-skills-tour/clip.shorts.mp4"
                : "captures/aura-skills-tour/clip.mp4"
            }
            durationFrames={CH3_SUBBEAT_FRAMES}
            clipStartSeconds={8}
            chip="Skill paths"
          />
          <Caption cues={captionCues(1845, 1965)} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH3_TAGOUT_FRAMES} name="Ch3-Tagout">
          <TagOut
            aspect={aspect}
            line="All four. *Side by side.*"
            durationFrames={CH3_TAGOUT_FRAMES}
            shader={<GrowthWaveBackdrop speed={0.28} opacity={0.85} />}
          />
        </Series.Sequence>

        {/* ─── Chapter 04 — Challenges, up close (2025–2325) ─────────────── */}
        <Series.Sequence
          durationInFrames={CH4_FRAMES - CH4_CAPTURE_FRAMES - CH4_TAGOUT_FRAMES}
          name="Ch4-Slate"
        >
          <ChapterSlate
            aspect={aspect}
            number="04"
            label="Challenges, up close."
            kicker="Pulse HR · Four"
            shader={
              <>
                <SmokeRingBackdrop speed={0.5} />
                <PulsingBorderOverlay opacity={0.75} thickness={0.12} />
              </>
            }
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH4_CAPTURE_FRAMES} name="Ch4-Capture">
          <CaptureBeat
            aspect={aspect}
            capturePath={
              aspect === "shorts"
                ? "captures/presentation-challenges/clip.shorts.mp4"
                : "captures/presentation-challenges/clip.mp4"
            }
            durationFrames={CH4_CAPTURE_FRAMES}
            clipStartSeconds={0.4}
            chip="Challenges · detail"
          />
          <Caption cues={captionCues(2115, 2280)} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH4_TAGOUT_FRAMES} name="Ch4-Tagout">
          <TagOut
            aspect={aspect}
            line="*Out in the open.*"
            durationFrames={CH4_TAGOUT_FRAMES}
            shader={<SmokeRingBackdrop speed={0.4} opacity={0.85} />}
          />
        </Series.Sequence>

        {/* ─── Chapter 05 — Skills, person + team (2325–2715) ────────────── */}
        <Series.Sequence
          durationInFrames={CH5_FRAMES - CH5_BEAT_FRAMES * 2 - CH5_TAGOUT_FRAMES}
          name="Ch5-Slate"
        >
          <ChapterSlate
            aspect={aspect}
            number="05"
            label="Skills."
            kicker="Pulse HR · Five"
            shader={<VoronoiBackdrop speed={0.32} distortion={0.18} />}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH5_BEAT_FRAMES} name="Ch5-Person">
          <CaptureBeat
            aspect={aspect}
            capturePath={
              aspect === "shorts"
                ? "captures/aura-skills-tour/clip.shorts.mp4"
                : "captures/aura-skills-tour/clip.mp4"
            }
            durationFrames={CH5_BEAT_FRAMES}
            clipStartSeconds={0.5}
            chip="Skills · for me"
          />
          <Caption cues={captionCues(2415, 2535)} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH5_BEAT_FRAMES} name="Ch5-Team">
          <CaptureBeat
            aspect={aspect}
            capturePath={
              aspect === "shorts"
                ? "captures/presentation-skills-team/clip.shorts.mp4"
                : "captures/presentation-skills-team/clip.mp4"
            }
            durationFrames={CH5_BEAT_FRAMES}
            clipStartSeconds={0.3}
            chip="Skills · the team"
          />
          <Caption cues={captionCues(2535, 2655)} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={CH5_TAGOUT_FRAMES} name="Ch5-Tagout">
          <TagOut
            aspect={aspect}
            line="*Strong* where we lead. *Stretching* where we grow."
            durationFrames={CH5_TAGOUT_FRAMES}
            shader={<VoronoiBackdrop speed={0.28} distortion={0.16} opacity={0.85} />}
          />
        </Series.Sequence>

        {/* ─── Outro (2715–2850) ─────────────────────────────────────────── */}
        <Series.Sequence durationInFrames={OUTRO_RESOLVE_FRAMES} name="Outro">
          <OutroResolve aspect={aspect} />
          <Caption cues={captionCues(2715, PRESENTATION_DURATION_FRAMES)} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
