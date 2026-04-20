# Brand identity — Pulse HR (workflows-people)

The brand identity. Anything creative — a reel, a tweet card, a slide,
a T-shirt — is judged against this document. Design primitives (hex
codes, font stacks) are the source of truth at
[`packages/tokens/`](../../packages/tokens/); this file wraps them with
the human-layer decisions (logo, voice, motion, imagery, do / don't).

---

## 1. Category & promise

**Category:** Open-source HR & payroll platform for services-first teams.

**One-liner:** HR you can read, fork, and run.

**Longer form:**
Three independent modules — Money, People, Work — sharing one
workspace, one keyboard, one API. Source-available under FSL-1.1-MIT.
Free for the first 5 employees, forever.

**Ideal customer:** ops, people, or finance lead at a 20–200 person
services or product company, who outgrew BambooHR but refuses
Rippling's suite lock-in.

**Sacrifice (who we are NOT for):** enterprises >1,000 headcount that
need Workday-grade compliance matrices. Teams who want HR fully
outsourced to a vendor's customer-success team.

**Pattern match one-liner (for press):** "Rippling for services firms —
but open source."

---

## 2. Four core values (the lens for every decision)

Every creative asset must clearly serve at least one. If it doesn't,
pick a different angle.

1. **Open source** — FSL-1.1-MIT, converts to MIT in 2 years. Public
   GitHub. Self-hostable. Attribution required.
2. **Modular** — Money, People, Work are independently adoptable.
3. **Ecosystem-first** — Webhooks on every resource, public REST,
   maintained SDKs, OpenAPI.
4. **Keyboard-first** — ⌘K fuzzy search, ⌘J command bar (local intent
   parser, no LLM), voice, offline PWA.

---

## 3. Logo & mark

### Current state (Phase 1)

- **Wordmark:** "Pulse HR" set in Fraunces Variable, 20px+ only.
  Italic `R` in the wordmark is allowed for punch; default is upright.
- **Bug:** A `lucide-react` / `lucide-astro` `<Sparkles />` icon at
  `h-7 w-7`, filled `#b4ff39` on `#0b0b0d` ink. This is a placeholder
  mark, borrowed from the icon library — acceptable only because we
  are early.
- **Lockup:** `[bug][8px][wordmark]`, aligned to the baseline.

### Phase 2 (scoped, not yet done)

- Commission or draft a custom mark that riffs on the `Sparkles`
  gesture but is unmistakably Pulse — candidates: a 3-dot pulse
  (echoes ⌘K / ⌘J / ⌘⇧.), a stylized commessa bracket, a tiny waveform.
- The mark must read at 24×24 favicon AND 512×512 Play Store maskable.
- Keep the brand lime + ink pair; never introduce a third color in the
  logo.

### Do / don't — logo

| Do                                                       | Don't                                                           |
|----------------------------------------------------------|-----------------------------------------------------------------|
| Use the bug alone on icons ≤40px                         | Rotate, skew, or recolor the wordmark for "theming"             |
| Set the wordmark in Fraunces Variable only               | Swap Fraunces for any serif that "looks similar"                |
| Keep 8–16px of clear space around the lockup             | Place the lockup inside a circle / pill / chip                  |
| On photo backgrounds, set the lockup on an ink card      | Place the lockup directly on a photo without a background card  |

---

## 4. Color

From [`packages/tokens/src/tokens.css`](../../packages/tokens/src/tokens.css).

### Primary pair

| Name       | Hex       | Role                                      |
|------------|-----------|-------------------------------------------|
| Brand lime | `#b4ff39` | Primary accent. Buttons, emphasis, pulse  |
| Brand hover| `#c6ff5a` | Only on interactive states of the brand   |
| Ink        | `#0b0b0d` | Default background and body text on light |
| Cream      | `#f2f2ee` | Default body text on ink, light surface   |

### Role accents (product surfaces and marketing role strip)

| Role      | Hex       | Feel                    |
|-----------|-----------|-------------------------|
| Employee  | `#b4ff39` | Lime (same as brand)    |
| Manager   | `#ffbf4a` | Amber / warmth          |
| HR        | `#ff8a7a` | Coral                   |
| Admin     | `#6fd8ff` | Electric cyan           |
| Finance   | `#c48fff` | Violet                  |

### Status accents

| Name    | Hex       | Use                                 |
|---------|-----------|-------------------------------------|
| Success | `#b4ff39` | Confirmations (same as brand)       |
| Warning | `#ffbf4a` | Partial states, "beta", "in progress"|
| Danger  | `#ff8a7a` | Destructive, errors, "not doing"    |
| Info    | `#6fd8ff` | Neutral pointers, roadmap items     |

### Usage rules

- **Default surface is ink (`#0b0b0d`).** Light surfaces are rare and
  reserved for print / product screens embedded in dark-framed
  compositions.
- **Lime is for emphasis, not for areas.** Treat it like ink against
  a white page — reserve for the thing you want the eye to land on.
  A slide that's 40% lime has lost the hierarchy.
- **Never mix role accents in the same composition** unless you are
  *literally* demonstrating the role-theming feature. Mixed accents
  look like a stock icon set; a single accent + lime looks like Pulse.
- **Gradients:** one gradient direction allowed — `lime → brand-hover`
  at 135°. No sunset gradients, no lime/cyan mixes.

---

## 5. Typography

### The three stacks

| Family            | Used for                                              |
|-------------------|-------------------------------------------------------|
| Fraunces Variable | Display only (H1, H2, big pull quotes, the wordmark). Italic for emphasis. |
| Geist Variable    | All body UI / marketing text. 400 / 500 / 600 weights. |
| JetBrains Mono    | Code, `kbd`, timestamps, ID strings, feature tags.    |

### Rules

- **Italic means something.** Only use Fraunces italic to mark the
  *one* word per headline that carries the emotional weight ("HR you
  can *read*, fork, and run"). Italicizing two words in one headline
  dilutes both.
- **Tracking:** wide-tracked uppercase (`0.25em`) is reserved for
  eyebrow labels like `DOCS`, `PRICING`, `NOW IN PUBLIC BETA`.
  Anything longer than 4 words should not use this tracking.
- **Line-height:** 0.95 for display, 1.5 for body. Never use a default
  line-height on display headlines — they read as generic when loose.
- **Numbers are monospace.** Prices, star counts, rate limits always
  `JetBrains Mono`; quantities in running prose stay in Geist.

### Hero headline pattern (reuse across assets)

```
[short punch]
[italic word]<span>.</span>
```

Dot in brand lime. Break the line at the italic word. This pattern is
load-bearing — it's recognizable across the landing page, /open-source,
/vs, /pricing, etc. Every new hero should match.

---

## 6. Voice

### Tone

Honest, technical, confident-without-bravado, anti-BS. We write like a
senior engineer explaining their work to another senior engineer —
precise, unadorned, willing to say what we're bad at.

### Voice rules

| Do                                                      | Don't                                                     |
|---------------------------------------------------------|-----------------------------------------------------------|
| "No LLM call. Works offline."                           | "AI-powered intelligent assistant."                       |
| "Free for the first 5 employees, forever."              | "Revolutionary free tier for growing teams!"              |
| "We are deliberately not doing X."                      | Silence about competitive weaknesses.                     |
| Name specific competitors in comparisons.                | Vague "legacy HRIS" references.                           |
| Show the code path — `apps/app/src/lib/nlp.ts:115`.     | "Our proprietary algorithm…"                              |
| Use Italian finance word `commessa` on purpose.         | Apologize for or avoid technical vocabulary.              |
| Include prices, rate limits, SLA numbers inline.        | Hide them behind "Contact sales".                         |
| Admit where we're weaker (see `/vs`).                   | Invent advantages we don't have.                          |

### Banned phrases

`best-in-class`, `world-class`, `seamless`, `next-generation`,
`revolutionize`, `AI-powered`, `one-stop shop`, `book a demo`,
`trusted by`, `the leading HR platform`, `reach out to learn more`.

### Taglines in rotation

- "HR you can read, fork, and run."
- "Open, modular HR & payroll."
- "Two keys. Everything."
- "Rippling for services firms — open source."
- "Your HR data, on your infra, for €0."

Pick one per asset. Don't stack them.

---

## 7. Imagery & composition

### What we use

1. **Product screens.** Real, high-resolution captures from the live
   app. Composed on an ink surface with `#141418` card border, lime
   accent pulse-dot where it matters.
2. **Typographic frames.** A single headline in Fraunces + a single
   italic word + a brand-lime dot. This IS our brand at the moment.
3. **Code blocks.** Monospace, dark chrome, brand-lime for the one
   thing we want the viewer to notice (`X-RateLimit-Remaining: 873`).
4. **The grid overlay.** Subtle ink-on-ink grid lines at 64px step,
   15% opacity, masked with a radial ellipse — used once per scroll.

### What we do NOT use

- Stock photography of people in open-plan offices pointing at laptops.
- 3D gradient "blob" illustrations.
- Isometric abstract data illustrations with pastel characters.
- Anything generated with a default DALL-E / SDXL prompt.
- Memoji / Bitmoji / anthropomorphic mascots.

### Phase 2 imagery (scoped)

Real user quotes over product-screen thumbnails. Photography of the
team (honest candid shots, no stock). Founder-penned sketches in the
margins of blog posts — handwritten, scanned, not redrawn.

---

## 8. Motion

### Principles

1. **Type leads, geometry follows.** Motion starts with a typographic
   reveal, then a supporting element slides or fades in. Never motion
   for motion's sake.
2. **Ease out, not in.** `cubic-bezier(0.2, 0, 0, 1)` is the house
   curve (`--wp-ease-standard`). Ease-in feels draggy.
3. **Fast, then slow.** Reveal fast (120–220ms), hold slow. The
   audience's eye does the work once the content lands.
4. **No bounce, no spring.** Brand is precise, not cute.
5. **Lime as a pulse, not a wash.** Brand lime should flash or pulse,
   not fill the frame for more than 400ms.

### Utilities we already ship

From the marketing `global.css` and app `styles.css`:
`fade-in`, `pop-in`, `stagger-in`, `press-scale`, `shimmer`, `pulse-dot`,
`iridescent-border`, `new-badge`, `confetti-piece`, `typing-dot`,
`animate-marquee`. Reuse them before inventing new ones.

### For video (reels, demos, product tours)

- 24fps minimum, 30fps preferred.
- Cuts on beat. Typographic frames hold at least 1.2 seconds (reading
  speed on mobile).
- The `⌘K / ⌘J` keypress animation is the single most distinctive
  motion we own — feature it in every video where it fits.

---

## 9. Audio

We don't have a sonic brand yet. Interim rules:

- No generic royalty-free "corporate upbeat" tracks. They undermine
  everything the written voice does.
- Prefer tracks in the `minimal techno / IDM / lo-fi hip-hop` register
  (think the Linear brand film direction) for product demos.
- For user-story videos, silence + room tone + one single musical
  swell on the punchline works better than a continuous score.
- Voiceover, when used, is one speaker, no compression artefacts,
  mixed to −16 LUFS for mobile listening.

---

## 10. The do / don't lookbook

| This feels like Pulse                                                                 | This doesn't                                                          |
|----------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| One italicized word + one lime dot + ink background                                    | A rainbow role-accent grid on every slide                             |
| A 15-second reel that shows the command bar and ends on a GitHub URL                   | A 60-second testimonial montage with music swelling over B-roll       |
| A feature tag that says "no LLM call"                                                  | A feature tag that says "AI-powered"                                  |
| "See the honest comparison" as a CTA on the /vs page                                   | "Request a personalized demo"                                         |
| A code snippet showing `X-RateLimit-Remaining: 873` verbatim                           | A rendered illustration of "an API"                                   |
| `Money · People · Work` lockup in monospace                                            | "The all-in-one HR suite" lockup in a Montserrat-lookalike            |

---

## 11. Phase 2 brand backlog

In priority order — pick up when we have a reason.

1. **Custom logo mark** — replace the `Sparkles` placeholder.
2. **Sonic brand** — a 2-second audio mark to open videos with.
3. **Typography in motion** — a `.lottie` or AE template for the
   hero-H1 reveal, reusable across reels and ads.
4. **Photography library** — real team / real customers, no stock.
5. **Illustration system** — sketch-style, scan-and-rub, for blog
   post hero images. Reference: Mailchimp (old guard), Notion (loose
   hand style), Honeycomb.io.
6. **Slide-deck template** — 16:9 and 4:5, inherits tokens, opens with
   the hero H1 pattern.
7. **Physical: stickers, T-shirts, pull-up banners.** Keep to
   wordmark-only or bug-only; no photo prints.

Track these as issues on GitHub when they move out of "someday".
