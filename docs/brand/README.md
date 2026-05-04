# Brand & creative — workflows-people / Pulse HR

This folder is the source of truth for anything brand-shaped — the
conceptual foundation, the visual identity, the aesthetic direction,
and the campaign plan that walks them onto LinkedIn, Product Hunt,
Instagram and YouTube.

It's deliberately **in the repo**. Brand drift starts the day the design
system lives in a Figma file nobody updates; keeping it here means every
change is a PR anyone can see and argue with.

---

## What lives here

| File / folder          | What it is                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| `foundation.md`        | The **why** — mission, vision, values, positioning, voice. The document every other asset defers to. |
| `identity.md`          | The **what** — logo, colors, fonts, motion primitives, imagery, do / don't tables.                |
| `aesthetic.md`         | The **how it feels** — 2026 direction: quiet, dark, translucent, lime as spark.                   |
| `design-references.md` | Annotated moodboard of 15 brand references creative work should draw from.                        |
| `marketing/`           | Campaign plan, platform playbooks (LinkedIn, Product Hunt, Instagram, YouTube), content backlog.  |
| `logo-explorations/`   | Candidate lockups + OG cards.                                                                     |

The design tokens themselves (hex codes, font stacks, radii) live as
actual code at [`packages/tokens/`](../../packages/tokens/) — this
folder is for the human / brand layer that wraps those tokens.

---

## How to use this

If you're producing a single creative asset — a LinkedIn post, a
Product Hunt launch card, a 30-second YouTube teaser, an Instagram
static — run through these steps in order. Skipping step 1 is the
number-one reason creative work drifts away from the product.

### 1. Read `foundation.md` first

The hero line, the value prop, the anti-positioning, the voice rules —
they all come from the foundation. If you don't know which of the four
commitments the asset lands against (Open / Transparent / Yours / Built
by the people who use it), stop and pick one before you draft anything.

### 2. Read `identity.md` and `aesthetic.md` together

`identity.md` owns the primitives (hex, type stack, logo). `aesthetic.md`
owns the 2026 feel (quiet, dark, translucent, lime as spark, no party
tricks). Five minutes each.

### 3. Pick the angle from `marketing/campaign.md`

The campaign doc maps pillars × targets × platforms. Every asset slots
into one cell of that matrix. One pillar per asset — fight the urge to
say all four.

### 4. Iterate against the do / don't list

`identity.md` §10 and `aesthetic.md` §4 have the do / don't tables.
Check every draft against them before polishing. The banned-phrase list
(`foundation.md` §9 and `identity.md` §6) is non-negotiable.

### 5. Produce & publish

Static work lands as SVG/PNG under `logo-explorations/` or the
marketing app's `public/`. Video masters land under `apps/studio/output/`
(the Remotion project) and get published to `apps/marketing/public/studio/`.
Written copy lives in the marketing app's `src/i18n/` dictionaries, or
as a blog post under `apps/marketing/src/pages/blog/`.

### 6. Commit & cross-post

The distribution loop is in `CONTENT_STRATEGY.md` — merge the asset,
auto-deploy via Vercel, cross-post to LinkedIn + Product Hunt +
Instagram + YouTube on the schedule in `marketing/content-calendar.md`,
update the repo README with the three most recent pieces.

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
- Instagram Reel storyboard docs and per-reel render folders were
  removed in favour of a unified campaign plan in `marketing/`. Video
  masters now live with the Remotion project at `apps/studio/` and its
  `output/` folder.

See `foundation.md` for the full brand scope.
