/**
 * Canonical voice-over script for the shader-backed presentation.
 *
 * One source of truth for both:
 *   - studio/scripts/generate-vo.ts (OpenAI TTS audio synthesis)
 *   - PresentationCore <Caption> cues (on-screen lines, synced to audio)
 *
 * Composition: 30 fps, 2850 frames total (95 s).
 *
 * Frame budget (matches PresentationCore.tsx Series layout):
 *
 *   0    – 120   ColdOpen          (4.0 s)
 *   120  – 270   Value 1           (5.0 s) — Employee → Person
 *   270  – 420   Value 2           (5.0 s) — Growth, tracked
 *   420  – 570   Value 3           (5.0 s) — Challenges, visible
 *   570  – 720   Value 4           (5.0 s) — Skills on a radar
 *   720  – 1065  Chapter 01        (11.5 s) — Dashboard
 *                  slate 720–810 · capture 810–1020 · tagout 1020–1065
 *   1065 – 1395  Chapter 02        (11.0 s) — Employee details
 *                  slate 1065–1155 · capture 1155–1350 · tagout 1350–1395
 *   1395 – 2025  Chapter 03        (21.0 s) — Growth
 *                  slate 1395–1485 · achievements 1485–1605 · challenges
 *                  1605–1725 · kudos 1725–1845 · skills 1845–1965 · tagout
 *                  1965–2025
 *   2025 – 2325  Chapter 04        (10.0 s) — Challenges close-up
 *                  slate 2025–2115 · capture 2115–2280 · tagout 2280–2325
 *   2325 – 2715  Chapter 05        (13.0 s) — Skills (person + team)
 *                  slate 2325–2415 · person 2415–2535 · team 2535–2655 ·
 *                  tagout 2655–2715
 *   2715 – 2850  Outro             (4.5 s)
 *
 * Wrap `*words*` to render them in brand accent inside the Caption. The TTS
 * generator strips the markers before synthesis, so audio sees plain text.
 */

export interface VoLine {
  /** Stable id — drives the per-line mp3 filename in studio/audio/vo/<id>.mp3. */
  id: string;
  /** What gets spoken. Asterisks are caption-only and stripped for TTS. */
  text: string;
  /** Onset, in frames (30 fps). Determines silence padding before the clip. */
  atFrame: number;
  /** How long the on-screen caption stays after onset (ms). */
  holdMs: number;
  /** Optional override for portrait/shorts wording (caption-only, audio uses `text`). */
  shortsText?: string;
}

export const PRESENTATION_FPS = 30;
// 3060 frames = 102 s. Bumped from 2850 / 95 s after measuring the assembled
// onyx narration (~100 s). The extra 7 s is absorbed by the outro hold —
// scene frame anchors below stay exactly where they were.
export const PRESENTATION_DURATION_FRAMES = 3060;

export const VO_SCRIPT: VoLine[] = [
  // ─── Cold open (0–120) ────────────────────────────────────────────────────
  { id: "00-cold-open", text: "Pulse HR. *People-first.*", atFrame: 30, holdMs: 2800 },

  // ─── Core values (120–720, 150 frames each) ───────────────────────────────
  { id: "01-value-employee", text: "Not a resource. *A person.*", atFrame: 140, holdMs: 4000 },
  { id: "02-value-growth", text: "Every step counted. *Every win remembered.*", atFrame: 290, holdMs: 4000 },
  { id: "03-value-challenges", text: "What's hard — *out in the open.*", atFrame: 440, holdMs: 4000 },
  { id: "04-value-skills", text: "Where the team is *strong*. Where it's *stretching*.", atFrame: 590, holdMs: 4000 },

  // ─── Chapter 01 — Dashboard (720–1065) ────────────────────────────────────
  { id: "05-ch1-slate", text: "*One.* The dashboard.", atFrame: 740, holdMs: 2200 },
  { id: "06-ch1-narrate", text: "The whole company — *on one page*.", atFrame: 850, holdMs: 3200, shortsText: "The company. *On one page.*" },
  { id: "07-ch1-tagout", text: "Calm. *At a glance.*", atFrame: 1030, holdMs: 1300 },

  // ─── Chapter 02 — Employee details (1065–1395) ────────────────────────────
  { id: "08-ch2-slate", text: "*Two.* People.", atFrame: 1085, holdMs: 2200 },
  { id: "09-ch2-narrate", text: "One person at a time. *Not a row in a sheet.*", atFrame: 1195, holdMs: 3400 },
  { id: "10-ch2-tagout", text: "*Names. Faces. Stories.*", atFrame: 1360, holdMs: 1300 },

  // ─── Chapter 03 — Growth (1395–2025) ──────────────────────────────────────
  { id: "11-ch3-slate", text: "*Three.* Growth.", atFrame: 1415, holdMs: 2200 },
  { id: "12-ch3-achievements", text: "*Wins* — celebrated.", atFrame: 1505, holdMs: 2400 },
  { id: "13-ch3-challenges", text: "*Challenges* — taken on.", atFrame: 1625, holdMs: 2400 },
  { id: "14-ch3-kudos", text: "*Kudos* — that actually land.", atFrame: 1745, holdMs: 2400 },
  { id: "15-ch3-skills", text: "*Skill paths* — where we're heading.", atFrame: 1865, holdMs: 2400, shortsText: "*Where we're heading.*" },
  { id: "16-ch3-tagout", text: "All four. *Side by side.*", atFrame: 1980, holdMs: 1700 },

  // ─── Chapter 04 — Challenges, up close (2025–2325) ────────────────────────
  { id: "17-ch4-slate", text: "*Four.* Challenges, up close.", atFrame: 2045, holdMs: 2200 },
  { id: "18-ch4-narrate", text: "What's hard, *surfaced* — not buried.", atFrame: 2150, holdMs: 3000 },
  { id: "19-ch4-tagout", text: "*Out in the open.*", atFrame: 2290, holdMs: 1300 },

  // ─── Chapter 05 — Skills, for person and team (2325–2715) ─────────────────
  { id: "20-ch5-slate", text: "*Five.* Skills.", atFrame: 2345, holdMs: 2200 },
  { id: "21-ch5-person", text: "For *the person*.", atFrame: 2435, holdMs: 2800 },
  { id: "22-ch5-team", text: "And for *the team*.", atFrame: 2555, holdMs: 2800 },
  { id: "23-ch5-tagout", text: "*Strong* where we lead. *Stretching* where we grow.", atFrame: 2665, holdMs: 1700, shortsText: "*Strong.* And *stretching.*" },

  // ─── Outro (2715–2850) ────────────────────────────────────────────────────
  { id: "24-outro", text: "Pulse HR. *People-first.*", atFrame: 2740, holdMs: 2800 },
];

/** Strip caption markup for TTS / plain captions. */
export const cleanTextForTts = (text: string): string =>
  text.replace(/\*(.+?)\*/g, "$1").replace(/\s+/g, " ").trim();

/**
 * Build TimedCaption cues for one Sequence starting at `sequenceStartFrame`.
 * Cues whose `atFrame` falls inside `[startFrame, endFrame)` are re-anchored
 * to the sequence-local timeline (atMs becomes ms-from-sequence-start).
 */
export const cuesForRange = (
  startFrame: number,
  endFrame: number,
  fps: number = PRESENTATION_FPS,
  variant: "default" | "shorts" = "default",
): { text: string; atMs: number; holdMs: number }[] =>
  VO_SCRIPT.filter((l) => l.atFrame >= startFrame && l.atFrame < endFrame).map((l) => ({
    text: variant === "shorts" && l.shortsText ? l.shortsText : l.text,
    atMs: ((l.atFrame - startFrame) / fps) * 1000,
    holdMs: l.holdMs,
  }));
