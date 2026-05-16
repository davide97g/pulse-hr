# Brand identity — Pulse HR

The brand identity. Anything creative — a reel, a tweet card, a slide, a T-shirt — is judged against this document. The conceptual brand (mission, values, audience, positioning) lives in [`foundation.md`](./foundation.md); this file owns the visual and verbal execution layer. Design primitives (hex codes, font stacks) are the source of truth at [`packages/tokens/`](../../packages/tokens/); this file wraps them with the human-layer decisions (logo, voice, motion, imagery, do / don't).

---

## 1. Category & promise

**Category:** Open-source workspace for the IC — recognition, growth, and proof of work.

**One-liner:** "Your best work is buried in a Slack thread from March."

**Longer form:**
A people-first workspace adopted bottoms-up by individual contributors at tech-forward companies. Three lines a day in Status Log, a kudos that survives, a growth trail you can carry into your next conversation. Open source under FSL-1.1-MIT (converts to MIT in two years). Self-host in 90 seconds with `docker compose up`, or pay us to host. The demo is the sales call.

**Ideal customer:** The IC dev or designer at a 20–200-person tech-forward company. They install Pulse themselves and pull their team in. See [`foundation.md`](./foundation.md) §6 for the full ring model.

**Sacrifice (who we are NOT for):** Enterprise HR teams that want a single vendor for payroll, time, recruiting, and engagement (we've parked all of that on purpose). Anyone who needs a sales call before they try the product. Industry-specific tooling for billable-hours, project-margin, or business-ops workflows (that was the April 2026 ICP; it's parked).

**Pattern-match one-liner (press / podcasts):** "Open-source craft, applied to making the IC's work impossible to miss."

---

## 2. Four core values (the lens for every creative decision)

Every creative asset must clearly serve at least one. If it doesn't, pick a different angle. The full value set lives in [`foundation.md`](./foundation.md) §5; these four are the public-messaging cuts that show up most often.

1. **Employee-first.** Recognition, merit, proof. Built for the IC, not for HR.
2. **Open source.** FSL-1.1-MIT, converts to MIT in 2 years. Public GitHub. Self-hostable. No "talk to sales." No enterprise tier with extra features.
3. **Built by the people who use it.** Maintainers run Pulse daily. Roadmap shaped by pull requests, not product managers.
4. **Keyboard-first craft.** ⌘K fuzzy search, ⌘J command bar (local intent parser, no LLM), offline PWA, fast everything.

The three-pillar stamp for short surfaces (slide footers, stickers, tweet bios):

> **Employee-first. Open source. Built by the people who use it.**

---

## 3. Logo & mark

### Current state (Phase 1)

- **Wordmark:** "Pulse HR" set in Fraunces Variable, 20px+ only. Italic `R` in the wordmark is allowed for punch; default is upright. The name keeps "HR" as ironic ownership of the category we're refusing to be.
- **Bug:** A `lucide-react` / `lucide-astro` `<Sparkles />` icon at `h-7 w-7`, filled `#b4ff39` on `#0b0b0d` ink. This is a placeholder mark, borrowed from the icon library — acceptable only because we are early.
- **Lockup:** `[bug][8px][wordmark]`, aligned to the baseline.

### Phase 2 (scoped, not yet done)

- Commission or draft a custom mark that riffs on the `Sparkles` gesture but is unmistakably Pulse — candidates: a 3-dot pulse (echoes ⌘K / ⌘J / ⌘⇧.), a stylized status-log glyph, a tiny waveform.
- The mark must read at 24×24 favicon AND 512×512 Play Store maskable.
- Keep the brand lime + ink pair; never introduce a third colour in the logo.

### Do / don't — logo

| Do                                                  | Don't                                                          |
| --------------------------------------------------- | -------------------------------------------------------------- |
| Use the bug alone on icons ≤40px                    | Rotate, skew, or recolor the wordmark for "theming"            |
| Set the wordmark in Fraunces Variable only          | Swap Fraunces for any serif that "looks similar"               |
| Keep 8–16px of clear space around the lockup        | Place the lockup inside a circle / pill / chip                 |
| On photo backgrounds, set the lockup on an ink card | Place the lockup directly on a photo without a background card |

---

## 4. Colour

From [`packages/tokens/src/tokens.css`](../../packages/tokens/src/tokens.css).

### Primary pair

| Name        | Hex       | Role                                      |
| ----------- | --------- | ----------------------------------------- |
| Brand lime  | `#b4ff39` | Primary accent. Buttons, emphasis, pulse  |
| Brand hover | `#c6ff5a` | Only on interactive states of the brand   |
| Ink         | `#0b0b0d` | Default background and body text on light |
| Cream       | `#f2f2ee` | Default body text on ink, light surface   |

### Status accents

| Name    | Hex       | Use                                   |
| ------- | --------- | ------------------------------------- |
| Success | `#b4ff39` | Confirmations (same as brand)         |
| Warning | `#ffbf4a` | Partial states, "beta", "in progress" |
| Danger  | `#ff8a7a` | Destructive, errors, "not doing"      |
| Info    | `#6fd8ff` | Neutral pointers, roadmap items       |

### Role chip palette (use only in role chips, never as theme)

Per `aesthetic.md` §2.1, the per-persona accent palette previously planned has been collapsed. There is no role *theme*. There is only a small chip used to label a persona-scoped view in dense UI. The chip palette below is reserved for that single use:

| Role chip | Hex       | Used in              |
| --------- | --------- | -------------------- |
| Employee  | `#b4ff39` | Same as brand; default state, chip usually omitted |
| Manager   | `#ffbf4a` | `RoleChip role="manager"` only |
| HR        | `#ff8a7a` | `RoleChip role="hr"` only      |
| Admin     | `#6fd8ff` | `RoleChip role="admin"` only   |
| Finance   | `#c48fff` | `RoleChip role="finance"` only |

**Important:** never use these as theme primaries, fills, large surfaces, or marketing accents. They appear only as a 6px dot + monospace label inside a `RoleChip`. Mixing them in a marketing composition is forbidden.

### Usage rules

- **Default surface is ink (`#0b0b0d`).** Light surfaces are rare and reserved for print / product screens embedded in dark-framed compositions.
- **Lime is for emphasis, not for areas.** Treat it like ink against a white page — reserve for the thing you want the eye to land on. A slide that's 40% lime has lost the hierarchy.
- **Gradients:** one gradient direction allowed — `lime → brand-hover` at 135°. No sunset gradients, no lime/cyan mixes.

---

## 5. Typography

### The three stacks

| Family            | Used for                                                                   |
| ----------------- | -------------------------------------------------------------------------- |
| Fraunces Variable | Display only (H1, H2, big pull quotes, the wordmark). Italic for emphasis. |
| Geist Variable    | All body UI / marketing text. 400 / 500 / 600 weights.                     |
| JetBrains Mono    | Code, `kbd`, timestamps, ID strings, feature tags.                         |

### Rules

- **Italic means something.** Only use Fraunces italic to mark the *one* word per headline that carries the emotional weight ("Your best work is *buried*."). Italicising two words in one headline dilutes both.
- **Tracking:** wide-tracked uppercase (`0.25em`) is reserved for eyebrow labels like `DOCS`, `PRICING`, `OPEN SOURCE`. Anything longer than 4 words should not use this tracking.
- **Line-height:** 0.95 for display, 1.5 for body. Never use a default line-height on display headlines — they read as generic when loose.
- **Numbers are monospace.** Prices, star counts, rate limits always `JetBrains Mono`; quantities in running prose stay in Geist.

### Hero headline pattern (reuse across assets)

```
[short punch]
[italic word]<span>.</span>
```

Dot in brand lime. Break the line at the italic word. This pattern is load-bearing — it's recognisable across the landing page, /open-source, /vs, /pricing, etc. Every new hero should match.

---

## 6. Voice

### Tone

**Opinionated in stance, plain in language.** We have a clear point of view about how work should be visible, and we say it out loud without raising our voice. We describe what we're improving on (patterns of invisibility — the shared doc nobody opens, the kudos that scrolls off, the review that fits a year into a textarea) rather than what we're against. See [`foundation.md`](./foundation.md) §7 and §11 for the full framing.

We write like a senior engineer explaining their work to another senior engineer. Honest, terse, technical-without-bravado, quietly opinionated about the workflow that serves the IC best.

### Voice rules

| Do                                                  | Don't                                        |
| --------------------------------------------------- | -------------------------------------------- |
| "No LLM call. Works offline."                       | "AI-powered intelligent assistant."          |
| "`docker compose up` — 90 seconds to a workspace."  | "Revolutionary onboarding experience!"       |
| "We are deliberately not doing X."                  | Silence about your limits.                   |
| Describe the *pattern* we improve on ("the shared doc nobody opens"). | Name another HR or people-ops product. Ever. |
| Show the code path — `apps/app/src/lib/nlp.ts:115`. | "Our proprietary algorithm…"                 |
| Talk about the workflow, not the people who run it. | Mock individual ICs, managers, or HR people. |
| Include prices, rate limits, SLA numbers inline.    | Hide them behind "Contact sales".            |
| Admit where we're weaker.                           | Invent advantages we don't have.             |
| English-first, Italian as a full-fidelity translation. | Two parallel voices that say different things. |

### Banned phrases

`best-in-class`, `world-class`, `seamless`, `next-generation`, `revolutionize`, `AI-powered`, `one-stop shop`, `book a demo`, `trusted by`, `the leading HR platform`, `reach out to learn more`, `enterprise-grade`, `synergy`, `unlock value`, `empower your workforce`.

Also banned: **the proper names of any other HR or people-ops product**, in any context — comparison, dunk, illustration, in-passing reference. The brand stands on what Pulse is, not on what others aren't.

### Taglines in rotation

Long-form, hero-class:

- **Primary hero:** "Your best work is buried in a Slack thread from March."
- **Primary subtitle / proof:** "Open-source workspace for ICs. Self-host in 90 seconds. The demo is the sales call."

Short-form:

- "HR · rebuilt."
- "Three lines. A kudos. Proof."
- "Two keys. Everything."
- "Make your work impossible to miss."
- "Your work, your infra, your way out any time."

Retired (for record — the *style* of these old lines is what we're retiring, not just the words):

- _April 2026: "HR software for people who hate HR software."_ — Framed Pulse as a reaction to a category rather than a thing in its own right. The new hero names a concrete moment of pain instead.
- _April 2026: "For services firms — open source."_ — Tied the product to an industry vertical we have since parked.
- _April 2026: "Open, modular HR & payroll."_ — Payroll is not in scope.
- _April 2026: "HR you can read, fork, and run."_ — Too coder-coded for the homepage; survives only on dev surfaces.

Pick one per asset. Don't stack them.

---

## 7. Imagery & composition

### What we use

1. **Product screens.** Real, high-resolution captures from the live app. Composed on an ink surface with `#141418` card border, lime accent pulse-dot where it matters. Status Log screenshots — three lines on a phone, ⌘⏎ key hint — are the strongest single visual we own.
2. **Typographic frames.** A single headline in Fraunces + a single italic word + a brand-lime dot. This IS our brand at the moment.
3. **Code blocks.** Monospace, dark chrome, brand-lime for the one thing we want the viewer to notice (`docker compose up` → done in 90s, `X-RateLimit-Remaining: 873`).
4. **The grid overlay.** Subtle ink-on-ink grid lines at 64px step, 15% opacity, masked with a radial ellipse — used once per scroll.

### What we do NOT use

- Stock photography of people in open-plan offices pointing at laptops.
- 3D gradient "blob" illustrations.
- Isometric abstract data illustrations with pastel characters.
- Anything generated with a default DALL-E / SDXL prompt.
- Memoji / Bitmoji / anthropomorphic mascots.

### Phase 2 imagery (scoped)

Real user quotes over product-screen thumbnails — IC voices first, manager voices second, never HR-marketing voices. Photography of the team (honest candid shots, no stock). Founder-penned sketches in the margins of blog posts — handwritten, scanned, not redrawn.

---

## 8. Motion

### Principles

1. **Type leads, geometry follows.** Motion starts with a typographic reveal, then a supporting element slides or fades in. Never motion for motion's sake.
2. **Ease out, not in.** `cubic-bezier(0.2, 0, 0, 1)` is the house curve (`--wp-ease-standard`). Ease-in feels draggy.
3. **Fast, then slow.** Reveal fast (120–220ms), hold slow. The audience's eye does the work once the content lands.
4. **No bounce, no spring.** Brand is precise, not cute.
5. **Lime as a pulse, not a wash.** Brand lime should flash or pulse, not fill the frame for more than 400ms.

### Utilities we ship

Per `aesthetic.md` §2.6, the motion budget is intentionally small. The signature motion is **`pulse-dot`**. Three supporting motions: `fade-in`, `press-scale`, `shimmer` (skeleton-only). Everything else has been retired.

### For video (reels, demos, product tours)

- 24fps minimum, 30fps preferred.
- Cuts on beat. Typographic frames hold at least 1.2 seconds (reading speed on mobile).
- The `⌘K / ⌘J` keypress animation is the single most distinctive motion we own — feature it in every video where it fits.
- The Status Log "three lines + ⌘⏎" gesture is the second-most-distinctive — feature it any time the asset is selling the core promise.

---

## 9. Audio

We don't have a sonic brand yet. Interim rules:

- No generic royalty-free "corporate upbeat" tracks. They undermine everything the written voice does.
- Prefer tracks in the `minimal techno / IDM / lo-fi hip-hop` register (think the Linear brand film direction) for product demos.
- For user-story videos, silence + room tone + one single musical swell on the punchline works better than a continuous score.
- Voiceover, when used, is one speaker, no compression artefacts, mixed to −16 LUFS for mobile listening.

---

## 10. The do / don't lookbook

| This feels like Pulse                                                | This doesn't                                                    |
| -------------------------------------------------------------------- | --------------------------------------------------------------- |
| One italicised word + one lime dot + ink background                  | A rainbow role-accent grid on every slide                       |
| A 15-second reel that shows the command bar and ends on a GitHub URL | A 60-second testimonial montage with music swelling over B-roll |
| A feature tag that says "no LLM call"                                | A feature tag that says "AI-powered"                            |
| "See the honest comparison" as a CTA on the /vs page                 | "Request a personalised demo"                                   |
| A code snippet showing `docker compose up` → 90s                     | A rendered illustration of "an API"                             |
| `Employee-first · Open source · Built by the people who use it` lockup in monospace | "The all-in-one HR suite" lockup in a Montserrat-lookalike |
| Three lines of a Status Log on a phone screen                        | A 200-cell dashboard screenshot full of KPIs                    |

---

## 11. Phase 2 brand backlog

In priority order — pick up when we have a reason.

1. **Custom logo mark** — replace the `Sparkles` placeholder.
2. **Sonic brand** — a 2-second audio mark to open videos with.
3. **Typography in motion** — a `.lottie` or AE template for the hero-H1 reveal, reusable across reels and ads.
4. **Photography library** — real team / real customers, no stock.
5. **Illustration system** — sketch-style, scan-and-rub, for blog post hero images. Reference: Mailchimp (old guard), Notion (loose hand style), Honeycomb.io.
6. **Slide-deck template** — 16:9 and 4:5, inherits tokens, opens with the hero H1 pattern.
7. **Physical: stickers, T-shirts, pull-up banners.** Keep to wordmark-only or bug-only; no photo prints. Sticker idea: "Three lines. A kudos. Proof."

Track these as issues on GitHub when they move out of "someday".
