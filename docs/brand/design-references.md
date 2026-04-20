# Design references — annotated moodboard

Fifteen references to steal from, grouped by what they teach. Each
entry lists **why** it matters for Pulse specifically. Don't paste one
wholesale; cherry-pick the principle, keep the palette + voice ours.

---

## A. Dev-tool brands (closest neighbours)

These are the companies already speaking to our audience. They've done
the hard work of proving a dark, opinionated brand can scale.

### 1. Linear — linear.app
**Why:** The reigning benchmark for dev-tool marketing. Ink + single
brand color (purple in their case; ours is lime). Typographic hero
animations, tight keyboard focus, zero stock photography. The Linear
brand film and 2024 homepage refresh are the closest thing we should
aim for.
**Steal:** motion cadence (hold → snap → hold), the treatment of
keyboard shortcuts as brand primitives, scroll-triggered typographic
reveals.

### 2. Raycast — raycast.com
**Why:** Command-bar product with the exact "keyboard-first" vibe we
want to convey. Dark UI, hotkey prompts everywhere, mini product
screens arranged on gradients.
**Steal:** keyboard-prompt treatment (shortcut + description pill),
the way product screens are composed with fake grid backdrops.

### 3. Vercel — vercel.com
**Why:** Ink background, one accent (white lines on pure black), and
a typographic hero that keeps reinventing itself. Their component
library and OG images are a masterclass in consistency.
**Steal:** OG card geometry, the deliberate restraint — when in doubt,
subtract.

### 4. Supabase — supabase.com
**Why:** OSS dev tool with a green-on-dark palette close to ours
(they're emerald, we're lime — but the structural similarity helps).
They publish roadmap and pricing honestly. The landing uses
animated SQL / API snippets as hero content.
**Steal:** code-as-hero treatment, "open source" badging, honest
pricing presentation.

### 5. PostHog — posthog.com
**Why:** Explicitly open-source, MIT (close enough to FSL). Uses
irreverent voice, hand-drawn marginalia, honest self-deprecation
("we're weird, we ship a lot"). Slightly more playful than Pulse wants
to be — but the honesty-as-brand approach is dead-on for us.
**Steal:** the "what we're not good at" sidebar pattern, public-roadmap
UI treatment.

### 6. Arc Browser (The Browser Company) — arc.net
**Why:** Counter-example. Beautiful, cinematic, but also the brand we
should NOT become — dreamy, aspirational, more vibe than substance.
Study to understand what to avoid; Arc is "software as lifestyle" and
Pulse is "software as infrastructure".
**Avoid:** dreamy slow-motion product shots, voiceover-as-poetry.

---

## B. Open-source SaaS marketing

These prove you can sell a real business on "you can read the source".

### 7. Plausible Analytics — plausible.io
**Why:** Privacy-first, OSS, anti-surveillance. Tone is
principled-without-preachy. Pricing page is one of the cleanest on the
open web.
**Steal:** how they handle the "why us vs. Google Analytics" frame —
calm, numerical, never whiny.

### 8. Formbricks — formbricks.com
**Why:** Newer, scrappier, but shows that "AGPL and proud" brands can
have modern visual polish. Green-on-dark, screenshot-led.
**Steal:** balance of source-available messaging with conversion-focused
landing-page structure.

### 9. Dub.co (Dub) — dub.co
**Why:** MIT-licensed link shortener that turned OSS + modern visual
language into a growth moat. Steven Tey's landing page is a case study
in what a founder-led OSS brand looks like in 2025.
**Steal:** the GitHub-star-count-as-social-proof pattern, commit-log
integration with the changelog page.

---

## C. Typography-driven marketing

We lean on Fraunces + Geist — these are the best references for doing
that well.

### 10. Stripe — stripe.com
**Why:** The typographic discipline Stripe brought to fintech is what
we want to bring to HR. Gradient accents, monospace in the right
places, restraint on brand-color area.
**Steal:** the way monospace numbers signal precision; section
transitions.

### 11. Fraunces showcase (Undercase Type / Google Fonts gallery)
**Why:** Fraunces is our display font. See how designers actually
handle the SOFT vs. HARD optical axes, the "swash" italics. Avoids
the default amateur mistakes.
**Steal:** italic-for-emphasis discipline, setting sizes that let the
variable axes actually differentiate.

### 12. Monocle Magazine covers — monocle.com
**Why:** Print-quality typographic hierarchy applied to digital.
Editorial, confident, anti-tech-aesthetic. Our "press coverage"
layouts should feel like this.
**Steal:** hierarchy at small sizes (20–40px headlines), tight
letter-spacing.

---

## D. Motion & Instagram-native reference

These are specifically for the reel work.

### 13. Apple product reels (official Apple Instagram — `@apple`)
**Why:** Benchmark for 9:16 product motion. Title cards that hold on
screen for a generous read, no dialogue, beat-matched cuts.
**Steal:** opening hook treatment, end-card composition. Ignore their
warmth; we are colder than Apple.

### 14. Artem Loenko / Linear dev-videos on YouTube (informal ref)
**Why:** A single engineer shipping high-quality product demos with a
laptop, a microphone, and no production crew. Proves our reel can be
DIY if it's tightly edited.
**Steal:** shot selection (screen + single cut + hand on keyboard),
cold-open structure.

### 15. Juxtaposed code / product cuts — `@cassidoo` and
       `@boneskull` on socials
**Why:** Two engineers whose tech-content reels model the "code as
content" aesthetic for non-tech audiences without dumbing it down.
Their pacing and text-overlay style ports directly to what we want.
**Steal:** how they frame a terminal window for mobile, how they
caption code.

---

## How to pick three

For the Instagram Reel specifically, the default starting trio is:

- **Linear** — motion cadence + typographic reveal rhythm
- **Raycast** — keyboard-prompt treatment + dark product framing
- **Apple Instagram** — 9:16 pacing + end-card structure

Different assets need different trios. For a pitch deck it's
`Stripe + Monocle + Linear`. For a blog post hero it's
`PostHog + Supabase + Dub`.

---

## Capturing reference frames (for prompting Claude Design)

Claude Design works best when you can paste actual frame references.
Practical workflow:

1. Open each reference site in a browser.
2. Grab 1–2 screenshots per ref with `cmd+shift+4` (or the browser's
   built-in screenshot in DevTools set to 1080×1920 for reels).
3. Drop them into the prompt from `instagram-reel.md` in the
   "reference frames" section.
4. Label each one — "Linear — hero type reveal at 00:02" — so the
   model knows what you want it to take from each.

Unlabeled reference dumps produce unfocused output. One labelled
screenshot beats ten unlabelled ones.
