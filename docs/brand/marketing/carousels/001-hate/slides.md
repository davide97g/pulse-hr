# Carousel 001 — "HR software for people who *hate* HR software"

**Purpose.** The first public-facing LinkedIn post from the Pulse HR company page. Launch day, 17:00 CET, Fri Apr 24 2026.

**Angle / pillar.** Open (primary) + Transparent (secondary). Roast-first opener that dials down into the four commitments.

**Target audience.** Ring A (dev) and Ring B (people-ops buyer) — the double-barrel post. Ring C (lurker) gets the aesthetic cut as a bonus.

**Tone.** Roasting, sarcastic, light-aggressive on stereotypes, no people-pleasing. We name names. We don't hedge. We land the punch, then back it up with what's true. Informed by `foundation.md` §10 voice rules + the "Built by the haters" tagline.

**Format.** 9 slides, 1080 × 1350 px (LinkedIn 4:5 document), PDF, portrait. Dark ink background, lime accents, one italic word per slide.

---

## Production pipeline

**Primary path (today, for 17:00 ship):**

1. Open `carousel.html` in this folder in Chrome.
2. Cmd+P → More settings → Paper size: **Custom (1080 × 1350 px)** if Chrome offers, otherwise keep default and scale → Margins: **None** → Background graphics: **On**.
3. Save as PDF → upload to LinkedIn as a **Document** (not an image).
4. Paste the caption from `../captions/001-hate.md`.

**Refinement path (next week, if the post hit):**

Paste the prompt below into Claude Design (Figma Make / Artifacts). It will rebuild the carousel with higher typographic polish and let you export each slide as PNG/SVG for Instagram / Twitter / YouTube thumbnail reuse. The HTML in this folder stays the source of truth for fast iteration.

---

## Design primitives (non-negotiable, pasted from `../../identity.md` + `../../aesthetic.md`)

| Token            | Value                                              | Usage                                                  |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------ |
| Background       | `#0b0b0d` (ink)                                    | Every slide.                                           |
| Body text        | `#f2f2ee` (cream) at 0.88–1.0 opacity              | Default.                                               |
| Accent           | `#b4ff39` (brand lime)                             | Exactly one lime element per slide. Usually the period.|
| Display font     | Fraunces Variable (italic for emphasis)            | H1 on every slide. One italic word per slide, max.     |
| Body font        | Geist Variable                                     | All body / paragraph text.                             |
| Mono             | JetBrains Mono                                     | Eyebrows, footers, code, slide counter.                |
| Ambient glow     | `radial-gradient` lime at 12% centred-top          | Hero slide only.                                       |
| Page canvas      | 1080 × 1350 px (4:5)                               | LinkedIn document-carousel optimal.                    |
| Safe margin      | 96px outer                                         | Never place load-bearing text outside this margin.     |

**Motion (ignored for PDF carousel, kept here for Reel re-cuts):**

- Fade-in, 220ms, `cubic-bezier(0.2, 0, 0, 1)`.
- Pulse-dot on the lime period, `1.6s` ring animation.
- No bounce. No spring. No iridescence.

---

## Slide-by-slide copy (source of truth)

> **Note.** In the HTML render, italics are real CSS `font-style: italic`. In the copy below, italic words are wrapped in `*asterisks*` — that's the word you italicise in any redesign. One italic word per slide, never two.

### Slide 1 — HOOK

| Field       | Content                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Eyebrow     | —                                                                                                 |
| Headline    | `HR software for people who *hate* HR software.`                                                  |
| Body        | —                                                                                                 |
| Footer      | `pulsehr.it`                                                                                      |
| Slide count | `01 / 09`                                                                                         |

**Design note.** Nothing but the headline on ink. Lime period. Massive — 110–140pt. The slide where the ink does most of the work.

### Slide 2 — THE DIAGNOSIS

| Field    | Content                                                                                                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow  | `DIAGNOSIS · 2026`                                                                                                                                                                                         |
| Headline | `Your HRIS is *slow*.`                                                                                                                                                                                     |
| Body     | Your manager can only see their own team. Time entry lives in one app, the project in another. The same eight hours get logged twice. Nobody trusts either number. You pay for all of this. You hate all of this. |
| Footer   | `— every services firm, every Friday afternoon`                                                                                                                                                            |
| Slide count | `02 / 09`                                                                                                                                                                                               |

### Slide 3 — BOOK-A-DEMO

| Field    | Content                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------- |
| Eyebrow  | `OBSERVED BEHAVIOUR`                                                                                    |
| Headline | `To see what they do, you have to *book a demo*.`                                                       |
| Body     | Apparently "can I see the product before I pay for it" is a premium feature. We disagreed so hard we made not-doing-that a brand value. |
| Footer   | `$ grep -r "book a demo" pulsehr.it   →   0 results`                                                    |
| Slide count | `03 / 09`                                                                                            |

### Slide 4 — PIVOT

| Field    | Content                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------- |
| Eyebrow  | `OR —`                                                                                            |
| Headline | `You could just *read* the source.`                                                               |
| Body     | `$ git clone github.com/davide97g/pulse-hr`<br>`$ cd pulse-hr && bun install && bun run dev`<br>` → localhost:5173. done.` |
| Footer   | `≈ 58 seconds. on a 2020 MacBook.`                                                                |
| Slide count | `04 / 09`                                                                                      |

**Design note.** The `$` prompt in lime. Mono throughout the body. Keep the terminal aesthetic — this is the turning point of the carousel, people should feel the vibe change here.

### Slide 5 — 01 · OPEN

| Field    | Content                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Eyebrow  | `01 · OPEN`                                                                                                                          |
| Headline | `The whole product. *On GitHub*.`                                                                                                    |
| Body     | FSL-1.1-MIT today. Converts to plain MIT after two years. Automatic, non-negotiable. Read every line. Run it on your box. Fork it if we let you down. |
| Footer   | `github.com/davide97g/pulse-hr/blob/main/LICENSE`                                                                                    |
| Slide count | `05 / 09`                                                                                                                         |

### Slide 6 — 02 · TRANSPARENT

| Field    | Content                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow  | `02 · TRANSPARENT`                                                                                                                    |
| Headline | `Nothing behind a *sales call*.`                                                                                                      |
| Body     | Roadmap public. Changelog public. Prices public. Screw-ups public. If you'd need to "talk to someone" to figure out if we'd work for you — that's on us, and we'd rather just write it down. |
| Footer   | `pulsehr.it/roadmap · pulsehr.it/changelog · pulsehr.it/pricing`                                                                      |
| Slide count | `06 / 09`                                                                                                                          |

### Slide 7 — 03 · YOURS

| Field    | Content                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Eyebrow  | `03 · YOURS`                                                                                                                   |
| Headline | `Your data. Your infra. *Your exit*.`                                                                                          |
| Body     | Self-host on Docker / Helm / Terraform. Export everything in a clean format, any time, without asking. Leaving Pulse is the easiest thing it does. That's on purpose. |
| Footer   | `docs/self-hosting.md`                                                                                                         |
| Slide count | `07 / 09`                                                                                                                   |

### Slide 8 — 04 · BUILT BY THE HATERS

| Field    | Content                                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Eyebrow  | `04 · BUILT BY THE PEOPLE WHO USE IT`                                                                                                                        |
| Headline | `Built by the *haters*.`                                                                                                                                     |
| Body     | Two devs in Milan. No BDRs. No "customer success team". No product managers. Just commits, a public roadmap, and pull requests from people who — turns out — also hate their HR software. |
| Footer   | `Davide Ghiotto · Niccolò Naso · Milan · 2026`                                                                                                              |
| Slide count | `08 / 09`                                                                                                                                                 |

### Slide 9 — CTA

| Field    | Content                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| Eyebrow  | `→ YOUR MOVE`                                                                                                            |
| Headline | `Come *hate* it with us. Constructively.`                                                                                |
| Body     | `★ Star it.`  ·  `🍴 Fork it.`  ·  `🔨 Break it.`<br>`github.com/davide97g/pulse-hr`<br><br>We're building what we'd want to use next. If you've got the same problem, we're listening. |
| Footer   | `Pulse HR · pulsehr.it`                                                                                                  |
| Slide count | `09 / 09`                                                                                                             |

---

## Claude Design prompt (for refinement)

Paste this into Claude Design / Figma Make / Artifacts when you want to redesign the carousel with higher polish next week. Replace the _"Reference screenshots"_ block with 2–3 real screenshots (Linear 2024 hero, Raycast pricing page, Vercel OG card) for best fidelity.

````markdown
You are a senior art director for **Pulse HR**, an open-source HR software
product for services-first teams. You've read the brand identity at
`docs/brand/foundation.md`, `docs/brand/identity.md`, and
`docs/brand/aesthetic.md`. Treat voice, color tokens, typography, motion
principles and do/don't rules as non-negotiable. If anything below
conflicts with those files, the files win.

## Deliverable

A **9-slide LinkedIn document carousel** for launch day. 1080 × 1350 px
per slide (portrait, 4:5). Designed for PDF export. Also usable as
individual PNGs for Instagram static / Twitter cards.

## Tone

Roasting, sarcastic, light-aggressive on stereotypes. We don't hedge.
We land the punch, then back it up with real substance. Start big, dial
down to real content by slide 5. The first four slides are the hook;
slides 5–8 are the four commitments; slide 9 is the CTA.

## Brand system (pasted from identity.md + aesthetic.md)

- Background: ink `#0b0b0d`. Body text: cream `#f2f2ee` at 0.88 opacity.
  Accent: brand lime `#b4ff39`.
- Fonts: **Fraunces Variable** for display (H1), italic for emphasis on
  ONE word per headline. **Geist Variable** for body. **JetBrains Mono**
  for eyebrows, footers, slide counters, code fragments.
- Motion: ignore for PDF. For any reel re-cut, only `fade-in` (220ms)
  and `pulse-dot` (1.6s ring). No bounce, no spring, no iridescence.
- Rules:
  - One italic word per slide, never two.
  - One lime element per slide, typically the period after the headline.
  - Never mix role-accent colors (violet, coral, cyan, amber) on any
    slide of this carousel — stick to ink + cream + lime.
  - No stock photography. No people illustrations. No 3D blobs.
  - No emoji except `★` in the CTA.

## Layout primitives (per slide)

- Safe margin: 96px on all sides.
- Top-left: mono **eyebrow** at 18px, `0.25em` tracking, uppercase.
- Middle: **headline** in Fraunces, 88–140px, line-height 0.95,
  letter-spacing -0.02em. One italic word. Lime period.
- Under headline: **body** in Geist, 28–34px, line-height 1.45, max
  width ~700px. Cream at 0.8 opacity.
- Bottom-left: mono **footer** at 16px, 0.75 opacity.
- Bottom-right: mono **slide counter** `NN / 09` at 14px, 0.5 opacity.
- Subtle 64px ink-on-ink grid, 12% opacity, radially masked (slide 1
  and 4 only — these are the hero moments).

## Per-slide copy

[paste the 10 rows from `slides.md` above, exactly as written — italic
words wrapped in asterisks are CSS `font-style: italic`]

## Deliverables (one pass)

1. All 9 slides rendered at 1080 × 1350, side-by-side storyboard grid.
2. Each slide also exported individually as a PNG at 1080 × 1350 for
   single-use repurposing (Instagram static, Twitter card).
3. An export-ready combined PDF, one slide per page, portrait.

## Hard constraints

- No stock photos, illustrations, or people.
- No emoji except `★`.
- Do NOT use the word "AI" anywhere on screen.
- Do NOT say "Book a demo", "Request access", "Talk to sales", "Trusted
  by", "Best-in-class", "World-class", "Seamless", "Next-generation",
  "Revolutionize", "AI-powered", "One-stop shop", or "Reach out to
  learn more". Any of those in the output = immediate reject.
- If Fraunces Variable or Geist Variable aren't available, substitute
  **Playfair Display** + **Inter** as the closest open-source
  fallbacks, and flag the substitution in the output.

## Reference screenshots

1. [Linear 2024 homepage hero — for type-reveal cadence + ink+lime-like single-accent restraint]
2. [Vercel OG card — for geometric restraint + safe-area discipline]
3. [Raycast pricing page — for dark card framing + keyboard-prompt affordance]
````

---

## References used (for the human reviewer)

- `docs/brand/foundation.md` §1 (one-line positioning) — hero line on slide 1.
- `docs/brand/foundation.md` §5 (core values) — slides 5–8 one-per-commitment.
- `docs/brand/foundation.md` §9 (anti-positioning) — slide 3's book-a-demo roast.
- `docs/brand/identity.md` §5 (typography rules) — one italic word, lime period.
- `docs/brand/identity.md` §6 (banned phrases) — vetting pass before publish.
- `docs/brand/aesthetic.md` §1 (one-line aesthetic) — "Quiet, dark, translucent. Lime as spark. No party tricks."
- `docs/brand/design-references.md` §A (Linear / Vercel / Raycast) — moodboard for the Claude Design prompt.

---

_Source of truth: this folder. Renderer: `carousel.html`. Caption and
comments: `../captions/001-hate.md` and `../captions/001-first-comments.md`._
