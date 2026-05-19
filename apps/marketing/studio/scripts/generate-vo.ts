#!/usr/bin/env bun
/**
 * Generate the presentation voice-over track from VO_SCRIPT.
 *
 * For each line in studio/remotion/presentation/vo/script.ts:
 *   1. POST to OpenAI's /v1/audio/speech endpoint (gpt-4o-mini-tts).
 *   2. Save the per-line mp3 to studio/audio/vo/<id>.mp3.
 *
 * Then assemble the full timeline:
 *   - Pad each clip with silence so it starts exactly at line.atFrame / fps.
 *   - Concatenate everything via ffmpeg into studio/audio/vo/narration.mp3.
 *
 * Re-run anytime the script changes. Outputs are gitignored.
 *
 * Env:
 *   OPENAI_API_KEY        required
 *   OPENAI_TTS_VOICE      optional (default "sage") — try "alloy" / "verse"
 *   OPENAI_TTS_MODEL      optional (default "gpt-4o-mini-tts")
 *   FORCE=1               re-synthesise every line even if mp3 already exists
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  PRESENTATION_FPS,
  PRESENTATION_DURATION_FRAMES,
  VO_SCRIPT,
  cleanTextForTts,
  type VoLine,
} from "../remotion/presentation/vo/script";

const __dirname = dirname(fileURLToPath(import.meta.url));
const studioDir = resolve(__dirname, "..");
const voDir = resolve(studioDir, "audio", "vo");
mkdirSync(voDir, { recursive: true });

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("[vo] OPENAI_API_KEY missing — set it in apps/marketing/.env");
  process.exit(1);
}

// Deep, confident default. Onyx is OpenAI's deepest masculine voice — sits
// well under the iridescent visuals without sounding salesy. Override via
// OPENAI_TTS_VOICE for A/B tests (alloy / verse / sage / ash / echo).
const voice = process.env.OPENAI_TTS_VOICE ?? "onyx";
const model = process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
const force = process.env.FORCE === "1";

console.log(`[vo] model:  ${model}`);
console.log(`[vo] voice:  ${voice}`);
console.log(`[vo] lines:  ${VO_SCRIPT.length}`);
console.log(`[vo] outDir: ${voDir}`);

const synthesizeLine = async (line: VoLine): Promise<string> => {
  const outPath = resolve(voDir, `${line.id}.mp3`);
  if (existsSync(outPath) && !force) {
    console.log(`[vo] cache hit ${line.id}`);
    return outPath;
  }

  const cleaned = cleanTextForTts(line.text);
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input: cleaned,
      response_format: "mp3",
      // Native speed for onyx — the voice is naturally slow + deep enough that
      // anything under 1.0 makes the narration overrun the 95s composition
      // budget. Calm pacing comes from the instructions, not the speed knob.
      speed: 1.0,
      // Steer onyx toward a calm, deliberate delivery (the API accepts a free-
      // form `instructions` field on gpt-4o-mini-tts).
      instructions:
        "Deep, calm, confident, masculine. Deliberate pacing without dragging. Subtle warmth. No salesy energy. Speak as if you're letting the listener in on a quiet truth.",
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`[vo] ${line.id} synth failed (${res.status}): ${detail}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
  console.log(`[vo] wrote ${line.id} (${buf.byteLength} bytes) — "${cleaned}"`);
  return outPath;
};

const ffprobeDuration = (path: string): number => {
  const probe = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path],
    { encoding: "utf8" },
  );
  return Number((probe.stdout ?? "").trim()) || 0;
};

const assembleNarration = (linePaths: { line: VoLine; path: string }[]) => {
  const fps = PRESENTATION_FPS;
  const totalSeconds = PRESENTATION_DURATION_FRAMES / fps;

  // ffmpeg concat filter wants: [silence][line][silence][line]... in order,
  // muxed into one continuous track of exactly totalSeconds.
  const inputs: string[] = [];
  const filters: string[] = [];
  let cursorSeconds = 0;
  let inputIndex = 0;

  for (let i = 0; i < linePaths.length; i++) {
    const { line, path } = linePaths[i];
    const targetStart = line.atFrame / fps;
    const lead = Math.max(0, targetStart - cursorSeconds);

    if (lead > 0) {
      filters.push(
        `anullsrc=channel_layout=mono:sample_rate=24000:duration=${lead.toFixed(3)}[sil${i}]`,
      );
    }
    inputs.push("-i", path);
    const lineDur = ffprobeDuration(path);
    if (lineDur === 0) {
      throw new Error(`[vo] zero-duration mp3 for ${line.id}`);
    }
    cursorSeconds = targetStart + lineDur;
    inputIndex += 1;
  }

  // Tail silence to fill out to totalSeconds.
  const tail = Math.max(0, totalSeconds - cursorSeconds);
  if (tail > 0) {
    filters.push(
      `anullsrc=channel_layout=mono:sample_rate=24000:duration=${tail.toFixed(3)}[silTail]`,
    );
  }

  // Build the concat input list, alternating [silN][N:a]…[silTail]
  const concatParts: string[] = [];
  for (let i = 0; i < linePaths.length; i++) {
    const targetStart = linePaths[i].line.atFrame / fps;
    const prevCursor =
      i === 0
        ? 0
        : linePaths[i - 1].line.atFrame / fps + ffprobeDuration(linePaths[i - 1].path);
    if (targetStart - prevCursor > 0) concatParts.push(`[sil${i}]`);
    concatParts.push(`[${i}:a]`);
  }
  if (tail > 0) concatParts.push(`[silTail]`);

  const filterGraph = [
    ...filters,
    `${concatParts.join("")}concat=n=${concatParts.length}:v=0:a=1[out]`,
  ].join(";");

  const outPath = resolve(voDir, "narration.mp3");
  console.log(`[vo] assembling ${outPath} (target ${totalSeconds.toFixed(2)}s)`);

  const args = [
    "-y",
    ...inputs,
    "-filter_complex",
    filterGraph,
    "-map",
    "[out]",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "192k",
    outPath,
  ];
  const ff = spawnSync("ffmpeg", args, { stdio: "inherit" });
  if (ff.status !== 0) {
    throw new Error("[vo] ffmpeg concat failed");
  }
  console.log(`[vo] narration.mp3 written`);
};

const main = async () => {
  const linePaths: { line: VoLine; path: string }[] = [];
  for (const line of VO_SCRIPT) {
    const path = await synthesizeLine(line);
    linePaths.push({ line, path });
  }
  assembleNarration(linePaths);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
