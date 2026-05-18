#!/usr/bin/env bun
/**
 * Detect tempo (BPM), beat positions, and high-energy "drop" windows in an
 * audio file. Writes a JSON sidecar that the Remotion composition can import.
 *
 * Usage:
 *   bun studio/scripts/detect-music.ts [filename]
 *   # default filename: aura-phonk.mp3 (under studio/audio/)
 *
 * Output: studio/audio/<basename>.music.json
 *   { bpm, beats: number[], drops: {start,end}[], durationSeconds }
 *
 * Drops are RMS-based: 0.5s rolling RMS, sustained windows above the 75th
 * percentile that last ≥ 0.8s are flagged as a drop. These are the moments
 * where the composition unleashes extra motion (bounce, halo flares).
 */
import { spawnSync } from "node:child_process";
import {
  writeFileSync,
  readFileSync,
  mkdtempSync,
  rmSync,
  existsSync,
} from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import MusicTempo from "music-tempo";

const __dirname = dirname(fileURLToPath(import.meta.url));
const studioDir = resolve(__dirname, "..");
const audioDir = resolve(studioDir, "audio");

const inputArg = process.argv[2] ?? "aura-phonk.mp3";
const inputPath = resolve(audioDir, inputArg);
if (!existsSync(inputPath)) {
  console.error(`[detect-music] missing ${inputPath}`);
  process.exit(1);
}

const baseName = basename(inputPath).replace(/\.[^.]+$/, "");
const outputPath = resolve(audioDir, `${baseName}.music.json`);

const tmp = mkdtempSync(resolve(tmpdir(), "detect-music-"));
const wavPath = resolve(tmp, "decoded.wav");

console.log(`[detect-music] input: ${inputPath}`);
console.log(`[detect-music] decoding to WAV…`);

const ff = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-loglevel",
    "error",
    "-i",
    inputPath,
    "-ac",
    "1",
    "-ar",
    "44100",
    "-acodec",
    "pcm_s16le",
    wavPath,
  ],
  { encoding: "utf8" },
);
if (ff.status !== 0) {
  console.error(`[detect-music] ffmpeg decode failed: ${ff.stderr ?? ""}`);
  process.exit(1);
}

// Parse 16-bit PCM mono WAV → Float32 samples
const wavBuf = readFileSync(wavPath);
// WAV header is 44 bytes for a standard 16-bit PCM mono file. Validate the
// "data" chunk id at offset 36 — if not there, scan for it (ffmpeg sometimes
// emits extra metadata chunks).
let dataOffset = 44;
if (wavBuf.toString("ascii", 36, 40) !== "data") {
  for (let i = 12; i < Math.min(wavBuf.length - 8, 4096); i++) {
    if (wavBuf.toString("ascii", i, i + 4) === "data") {
      dataOffset = i + 8;
      break;
    }
  }
}
const sampleCount = (wavBuf.length - dataOffset) / 2;
const samples = new Float32Array(sampleCount);
for (let i = 0; i < sampleCount; i++) {
  const s = wavBuf.readInt16LE(dataOffset + i * 2);
  samples[i] = s / 32768;
}
const FS = 44100;
const durationSeconds = sampleCount / FS;
console.log(
  `[detect-music] decoded ${sampleCount} samples @ ${FS}Hz (${durationSeconds.toFixed(2)}s)`,
);

// ─── BPM + beat positions via music-tempo ─────────────────────────────────
console.log(`[detect-music] analyzing tempo…`);
// music-tempo wants a Number[]; convert.
const samplesArray = Array.from(samples);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mt: any = new (MusicTempo as any)(samplesArray);
const bpm = Math.round(Number(mt.tempo));
const rawBeats: number[] = Array.isArray(mt.beats) ? mt.beats : [];
const beats = rawBeats.map((b) => Math.round(Number(b) * 1000) / 1000);

console.log(`[detect-music] BPM: ${bpm}  ·  beats: ${beats.length}`);

// ─── Drop detection — RMS over 0.5s windows, threshold @ p75 ──────────────
console.log(`[detect-music] computing energy envelope…`);
const winSize = Math.round(FS * 0.5);
const hopSize = Math.round(FS * 0.1);
const rms: number[] = [];
const rmsTimes: number[] = [];
for (let i = 0; i + winSize < samples.length; i += hopSize) {
  let sum = 0;
  for (let j = 0; j < winSize; j++) {
    const s = samples[i + j];
    sum += s * s;
  }
  rms.push(Math.sqrt(sum / winSize));
  rmsTimes.push(i / FS);
}

const sortedRms = [...rms].sort((a, b) => a - b);
const threshold = sortedRms[Math.floor(sortedRms.length * 0.75)];

const drops: Array<{ start: number; end: number }> = [];
let dropStart = -1;
for (let i = 0; i < rms.length; i++) {
  if (rms[i] >= threshold) {
    if (dropStart < 0) dropStart = rmsTimes[i];
  } else if (dropStart >= 0) {
    const length = rmsTimes[i] - dropStart;
    if (length >= 0.8) drops.push({ start: dropStart, end: rmsTimes[i] });
    dropStart = -1;
  }
}
if (dropStart >= 0) {
  const end = rmsTimes[rms.length - 1] ?? durationSeconds;
  if (end - dropStart >= 0.8) drops.push({ start: dropStart, end });
}

// Round to 3 decimals.
const roundedDrops = drops.map(({ start, end }) => ({
  start: Math.round(start * 1000) / 1000,
  end: Math.round(end * 1000) / 1000,
}));

console.log(`[detect-music] drops: ${roundedDrops.length}`);
for (const d of roundedDrops) {
  console.log(`    ${d.start.toFixed(2)}s → ${d.end.toFixed(2)}s`);
}

const out = {
  source: basename(inputPath),
  bpm,
  beats,
  drops: roundedDrops,
  durationSeconds: Math.round(durationSeconds * 1000) / 1000,
  thresholdRms: Math.round(threshold * 1e6) / 1e6,
};
writeFileSync(outputPath, JSON.stringify(out, null, 2));
console.log(`[detect-music] wrote ${outputPath}`);

rmSync(tmp, { recursive: true });
