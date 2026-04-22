# Reel 001 — "Open source"

15-second vertical Instagram Reel for Pulse HR, angle: **open source**.
Headline lands on **"HR you can read, fork, and run."**

- **Final artifact:** [`out/reel-001-open-source.mp4`](./out/reel-001-open-source.mp4) (1080×1920, 30fps, H.264 high / yuv420p, ~960 KB, silent)
- **Source of truth:** the Claude Design prototype at [`prototype/`](./prototype/)
- **Render harness:** deterministic frame capture in [`render/`](./render/)

See [`../../instagram-reel.md`](../../instagram-reel.md) for the brief
this implements and [`../../identity.md`](../../identity.md) for the
brand rules every frame had to respect.

---

## The six frames

| #   | Window       | Beat                                                                                                  |
| --- | ------------ | ----------------------------------------------------------------------------------------------------- |
| 1   | 0.0 – 2.0s   | Terminal hook: `$ git clone github.com/davide97g/workflows-people` typing live                        |
| 2   | 2.0 – 4.5s   | Promise: "HR you can _read_, fork, and run." over a blurred mock product screen                       |
| 3   | 4.5 – 7.0s   | Modular proof: Money / People / Work cards stack, pull apart, snap into headline "Modular. Pick any." |
| 4   | 7.0 – 10.0s  | Keyboard-first: `⌘J` command bar resolves `log 4h on ACME-22` → `intent=log-hours · 0.94`             |
| 5   | 10.0 – 12.5s | The contrast: three generic closed HR platforms with strikethrough vs. our public repo URL            |
| 6   | 12.5 – 15.0s | End card: stacked H1 in Fraunces italic, module pill row, `Star on GitHub ★` CTA pill                 |

Every frame runs on the tokens in `packages/tokens` — lime `#b4ff39`
on ink `#0b0b0d`, Fraunces display, Geist body, JetBrains Mono for
code and IDs. The only font substitution is Geist → Inter (Inter is
close enough for a rendered MP4; self-hosted Geist only matters on
the web).

---

## How the render works

The prototype Claude Design shipped is a live React + Babel sandbox
with an autoplaying `requestAnimationFrame` loop and a keyboard
scrubber. That's ideal for preview, useless for deterministic export
— two runs would produce non-identical frames.

The [`render/`](./render/) harness swaps the `Stage` component for a
`RenderStage` that reads its playhead from `window.__setTime(t)`,
then drives Playwright to step `t` from 0 → 15s in 1/30s increments
and screenshot each frame. `ffmpeg` encodes the PNGs to H.264 MP4
with the exact Instagram / Reels preset.

### Regenerate the MP4

```bash
cd docs/brand/reels/001-open-source/render
bun install                     # installs Playwright
bunx playwright install chromium # one-time, ~170 MB
node render.mjs                  # ~2 min end-to-end on an M-series Mac
```

Output lands at `out/reel-001-open-source.mp4`.

### What gets committed vs. ignored

| Path                               | Committed? | Why                                |
| ---------------------------------- | ---------- | ---------------------------------- |
| `prototype/**`                     | yes        | Source of truth from Claude Design |
| `render/render.html`, `render.mjs` | yes        | The reproducible pipeline          |
| `render/package.json`              | yes        | Pinned Playwright version          |
| `render/node_modules/`             | no         | Reinstalled on demand              |
| `render/frames/`                   | no         | Regenerated every run              |
| `out/reel-001-open-source.mp4`     | yes        | The actual shippable artifact      |

The final MP4 is committed deliberately — downstream (social
schedulers, Instagram upload, the Pulse site itself) needs a
deterministic URL, not a "rebuild it locally" instruction.

---

## Known limitations of this first cut

1. **Silent.** Reels without audio are down-ranked on discovery.
   Add a licensed track (minimal techno, 90–110 BPM, no vocals —
   see `../../instagram-reel.md` §Music direction) in CapCut before
   publishing. Drop a followup at `out/reel-001-open-source-scored.mp4`.
2. **30 fps**, not 60. Sufficient for Reels, but if we push this to
   YouTube Shorts we may want to bump `FPS` to 60 in `render.mjs`.
3. **No captions.** Everything on screen is already large enough to
   read sound-off, but Instagram's default auto-captions will trigger
   on top. Burn in captions in the editor, or disable the IG caption
   overlay at upload.
4. **Font substitution.** Geist isn't on Google Fonts; we fall back
   to Inter for the render. The marketing site ships self-hosted Geist
   — to get a perfectly matching render, drop Geist .woff2 files into
   `render/fonts/` and `@font-face` them from `render.html`.

## When to re-cut

- The GitHub handle / repo URL changes → rerun, new MP4.
- A second angle ships (keyboard-first, modular, vs) → copy this
  directory as `002-keyboard-first/`, swap the scenes, rerender.
- Product footage in Frame 2 / Frame 4 is ready to replace the mocked
  `MockTimeTracker` → update `prototype/scenes.jsx`, rerender.
