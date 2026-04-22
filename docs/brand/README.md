# Brand & creative — workflows-people / Pulse HR

This folder is the source of truth for anything brand-shaped — identity,
voice, imagery, motion, and specific creative deliverables like
Instagram Reels, OG cards, slide decks, pitch assets.

It's deliberately **in the repo**. Brand drift starts the day the design
system lives in a Figma file nobody updates; keeping it here means every
change is a PR anyone can see and argue with.

---

## What lives here

| File                   | What it is                                                                    |
| ---------------------- | ----------------------------------------------------------------------------- |
| `identity.md`          | Core brand identity — logo, colors, fonts, voice, motion, imagery, do / don't |
| `instagram-reel.md`    | Brief for a 15-second Instagram Reel ad + ready-to-paste Claude Design prompt |
| `design-references.md` | Annotated moodboard of 15 brand references the creative work should draw from |

The design tokens themselves (hex codes, font stacks, radii) live as
actual code at [`packages/tokens/`](../../packages/tokens/) — this
folder is for the human / brand layer that wraps those tokens.

---

## How to use this — the 7-step process

If you're producing a single creative asset (like the Instagram Reel),
run through these steps in order. Skipping step 1 is the number one
reason creative work drifts away from the product.

### 1. Read `identity.md` first

Even if you've seen it before. The voice and motion principles are what
make everything else feel like the same product. Five minutes.

### 2. Read `design-references.md` and pick your 3 closest matches

Not "which brand do you like" — **"which three brands' approach would
you steal for this specific deliverable?"** A reel steals from different
references than a pitch deck.

### 3. Pick the angle

For any creative: what is the **one** thing this asset must land?
Options for Pulse HR right now:

- **Open source** — "HR you can read, fork, and run"
- **Modular** — "Money, People, Work. Pick any."
- **Keyboard-first** — "Two keys. Everything."
- **Anti-Rippling** — "The open alternative to the HR suite lock-in"

One angle per asset. Fight the urge to say all four — you'll land zero.

### 4. Use the prompt from the relevant asset doc

Each asset doc (`instagram-reel.md`, and any future ones) has a
ready-to-paste prompt for Claude Design (Figma Make / Artifacts / any
design-capable Claude surface). Paste it with your chosen angle and any
references filled in, run it, iterate.

### 5. Iterate against the do / don't list

Every doc has a "do / don't" section calibrated to Pulse's voice.
Check the output against it before polishing.

### 6. Produce & export

Claude Design outputs storyboards, frames or components. Final
production (real motion, audio mix, color grade) happens in whatever
tool the asset needs — CapCut / Premiere / After Effects for video,
Figma for static, the repo itself for OG cards.

### 7. Commit & publish

Ship the final asset back into the repo (e.g. a rendered
`docs/brand/renders/reel-001.mp4` or a Figma link at the bottom of the
asset doc). Future-you and future-contributors need to see what you
made, not just how you planned it.

---

## Why this is in `docs/brand/` and not a Figma file

1. **Reviewable.** A PR against `identity.md` gets discussed like code.
   A change to a Figma library vanishes into the client.
2. **Forkable.** The whole repo is FSL-1.1-MIT. Anyone self-hosting
   Pulse inherits a usable brand system on day one; they don't need
   Figma credentials.
3. **Agent-friendly.** Every asset prompt is a plain markdown file —
   Claude Code, Claude Design, any MCP-aware tool can read it without
   an API key.

---

## What's intentionally NOT here (yet)

- A logo mark. We're running on a Sparkles lucide icon + wordmark
  today. A proper mark is scoped in `identity.md` as a Phase 2 item.
- Photography. Pulse hasn't shipped enough user interviews to have an
  honest photography library. We use product-screen + typographic
  compositions until that changes.
- A `docs/brand/renders/` folder with approved final assets. It'll
  appear the first time someone ships production creative.

See `identity.md` for the current full scope.
