# Instagram Reel ad — brief + Claude Design prompt

A 15-second vertical (9:16) ad for Pulse HR. Runs as an Instagram Reel
and — same master — as a TikTok / YouTube Short / X video post.

This file has three sections:

1. **Brief** — format, angle, storyboard, copy, motion, audio.
2. **Claude Design prompt** — ready to paste (wholesale or per-frame).
3. **Production checklist** — what to do after Claude Design outputs.

Read [`identity.md`](./identity.md) and [`design-references.md`](./design-references.md)
first, unless you want to waste one iteration cycle re-learning voice.

---

## 1. Brief

### Format

| Spec           | Value                                                         |
|----------------|---------------------------------------------------------------|
| Aspect ratio   | 9:16 (vertical)                                                |
| Resolution     | 1080 × 1920 px                                                 |
| Duration       | 15 s (hard cap — Instagram cuts discovery at 15s thumbnail)    |
| Frame rate     | 30 fps                                                         |
| Safe area      | 84px top, 220px bottom (avoid Instagram UI overlays)           |
| Audio          | Required; Reels with silent clips are down-ranked              |
| Captions       | Burned-in, not just auto-captions (auto-captions often wrong)  |
| File export    | MP4, H.264, 10–15 Mb/s bitrate, AAC 192 kbps audio             |

### Angle (pick ONE before prompting)

Default for this first reel: **Open source.** Strongest differentiator,
most contrarian for the HR category, easiest hook.

Alternatives if the open-source reel has already run:
- **Keyboard-first** — hero shot is the ⌘J command bar resolving an intent
- **Anti-suite (vs.)** — "HR without the suite" narrative, crossfade a
  Rippling screenshot replaced by Pulse
- **Modular** — three module cards snap together then separate

The rest of this doc assumes the default **Open source** angle — swap
the copy for the alternates below when you run a different one.

### Audience (what they see before Pulse)

- Scrolling Instagram between 8 p.m. and midnight.
- Previous 10 reels were either UGC creator content or SaaS ads with
  generic stock footage and a voiceover.
- Our reel hits in that sea. **It has to not look like an ad for the
  first two seconds** or the thumb keeps moving.

### Hook rule

First 1.2 seconds must do **one** thing: make a scrolling person
pause. Options that work for this brand:

- Type-to-reveal on an ink frame: "`HR you can read.`" — pauses because
  the contrast is high and the claim is weird.
- A terminal prompt typing `git clone https://github.com/davide97g/workflows-people` — pauses because a terminal in an IG feed is unusual.
- A `diff` view showing three lines deleted — pauses because a diff in
  an IG feed stops your brain.

For the default open-source angle, go with the **`git clone` terminal**.
It's distinctive, on-brand, and no other HR brand would dream of it.

### 15-second storyboard

Six frames. Each duration is a guide, not a gospel; align to the beat.

| #   | Time       | Visual                                                                 | Copy on screen                                      | Audio                        |
|-----|------------|------------------------------------------------------------------------|------------------------------------------------------|------------------------------|
| 1   | 0.0–2.0s   | Ink full-bleed. Terminal window center. Caret typing in JetBrains Mono: `$ git clone github.com/davide97g/workflows-people` | Typing text only                                     | Soft keystroke SFX + pad-tone start |
| 2   | 2.0–4.5s   | Terminal output dissolves into a product screen of the Pulse app (time tracker). Brand lime pulse-dot on the clock icon. Subtle grid overlay. | `HR you can *read*.` — Fraunces, italic on *read*, lime dot | Beat 1 drops (low-end kick)  |
| 3   | 4.5–7.0s   | Cut. Three stacked module cards (Money, People, Work) in a vertical stack, role accents: violet / coral / lime. They snap into separation with a subtle click. | `Modular. Pick any.`                                  | Tight click SFX              |
| 4   | 7.0–10.0s  | Cut. Dark UI with a ⌘J command bar modal. Type `log 4h on ACME-22` resolves to a green pill: `intent=log-hours · 0.94`. | `Keyboard-first. No LLM.`                             | Two short keypress SFX       |
| 5   | 10.0–12.5s | Cut. Split screen: left, a stylized "Rippling / Deel / BambooHR" wordmark row with strikethrough; right, `github.com/davide97g/workflows-people`. Lime highlight swipes across the URL. | `Every other HR platform is closed.`                  | Swipe SFX                    |
| 6   | 12.5–15.0s | End card. Pulse wordmark + Sparkles bug top-left. Giant centered: `HR you can read,` on line 1; `fork, and run.` on line 2, italic on `read`. Bottom-anchored CTA pill in brand lime: `Star on GitHub ★`. | As visible                                            | Music resolves + one "ping"  |

### Typography motion reference (frame 2)

Target this exact feel — it's the hero H1 pattern from the landing
page, adapted to 9:16:

```
                         [0.2s delay]
 HR you can         ──────────────►   <fade-in + 4px translate>
 read          ──────────────────►    <type-in, Fraunces italic>
 , fork,       ──────────────────►    <slide-in from left>
 and run.      ──────────────────►    <slide-in from left>
                    .                  <lime dot pop, 120ms>
```

### Voiceover

None on this first reel. The typography + SFX carry it. Add VO only on
the second iteration if the silent version underperforms.

### Music direction

- Genre: minimal techno / ambient IDM. BPM around 90–110.
- No lyrics. No "upbeat corporate". No tropical-house build.
- Reference tracks (direction only, licensed replacements in production):
  - Tim Hecker — *Black Refraction* (atmosphere)
  - Jon Hopkins — *Open Eye Signal* (motion)
  - Rival Consoles — *Recovery* (tension)
- Licensed source: **Epidemic Sound** or **Musicbed** — search
  tags `minimal techno + dark + no vocals + 90-110 BPM`.
- Mix target: −14 LUFS integrated.

### End-card CTA

One CTA. Brand lime pill, ink text: **`Star on GitHub ★`**. URL
underneath in mono, `github.com/davide97g/workflows-people`.

No "link in bio" — the URL is short enough to read and remember.

---

## 2. The Claude Design prompt

Paste the block below into Claude Design (Figma Make / Artifacts / any
design-capable Claude surface). Fill in the bracketed items before
pasting.

The prompt is structured so you can run it **wholesale** (Claude Design
produces a full 6-frame storyboard in one pass) OR **per-frame** (paste
it six times with one `## Produce` section swapped). Per-frame runs
usually give higher fidelity on each frame at the cost of consistency
— use wholesale first, iterate per-frame only on the frames that need
fixing.

### Prompt — paste this

````markdown
You are acting as a senior art director for Pulse HR, an open-source,
modular HR & payroll platform for services-first teams. You have
already read the brand identity at docs/brand/identity.md (treat its
voice, colour tokens, typography, motion principles, and do/don't
rules as non-negotiable). If anything below conflicts with that file,
the file wins.

I need a 15-second Instagram Reel ad at **1080×1920 (9:16)**.

## Angle (pick ONE — the rest of the prompt assumes this)
**Open source** — "HR you can read, fork, and run." No other HR
platform ships its source code. We do.

## Product truths (don't invent beyond these)
- Source is public at github.com/davide97g/workflows-people under
  FSL-1.1-MIT. Converts to MIT after 2 years.
- Three modules: Money, People, Work — adopted independently.
- ⌘K fuzzy search + ⌘J command bar (local intent parser, no LLM call,
  works offline).
- Free for the first 5 employees, forever. €8 / active employee / month
  above that. Self-host is €0.
- Competitors referenced: Rippling, Deel, BambooHR — all closed source.

## Brand system (from docs/brand/identity.md)
- Background: ink `#0b0b0d`. Text: cream `#f2f2ee`. Accent: brand
  lime `#b4ff39`. Hover / pulse state: `#c6ff5a`.
- Role accents (frame 3 only): Money=violet `#c48fff`,
  People=coral `#ff8a7a`, Work=lime `#b4ff39`.
- Fonts: display = Fraunces Variable (italic = emphasis on ONE word
  per headline). UI / body = Geist Variable. Code, kbd, timestamps,
  IDs = JetBrains Mono.
- Motion curve: `cubic-bezier(0.2, 0, 0, 1)`. No bounce, no spring.
- Brand lime is a pulse, not a wash — never exceed ~20% of the frame.

## 15-second storyboard (produce all 6 frames)

**Frame 1 · 0.0–2.0s — The hook**
Full-bleed ink. Centred terminal window with rounded corners, thin
`rgba(255,255,255,0.1)` border, traffic-light buttons dimmed. Inside,
monospace caret typing out: `$ git clone github.com/davide97g/workflows-people`
Typing animation: ~24 chars/sec. No other copy on screen.

**Frame 2 · 2.0–4.5s — The promise**
Terminal output blurs + scales down, a product screen of Pulse's time
tracker fades up behind it. Subtle ink-on-ink grid at 64px, 15%
opacity, radially masked. Overlay (Fraunces Variable, ~120pt):
`HR you can [italic]read[/italic].` — lime period at the end. Text
enters with a 4px translate-up + fade-in, the italic word types in
after a 200ms delay.

**Frame 3 · 4.5–7.0s — Modular proof**
Cut to three stacked module cards, centered, 9:16 friendly:
- Top: **Money** (violet `#c48fff` icon + label)
- Middle: **People** (coral `#ff8a7a`)
- Bottom: **Work** (lime `#b4ff39`)
They start touching, then snap apart by ~20px with a tight click.
Overlay (Fraunces, ~80pt): `Modular.` on line 1; `Pick any.` on
line 2 (Geist, 40pt, 0.5 opacity).

**Frame 4 · 7.0–10.0s — Keyboard-first proof**
Cut to a dark UI card — a command palette open on top of a blurred
app screenshot. Inside the palette, a `⌘J` kbd pill on the top-right.
A monospace query types: `log 4h on ACME-22`. Below it, a lime
response pill resolves: `intent=log-hours · confidence=0.94`.
Overlay (Fraunces, ~80pt): `Keyboard-first.` plus (Geist, 28pt,
JetBrains Mono for "no LLM"): `No LLM call.`

**Frame 5 · 10.0–12.5s — The contrast**
Split the 9:16 frame horizontally at the midpoint.
- Top half: the wordmarks `Rippling · Deel · BambooHR` set in a muted
  grey, all with a diagonal strikethrough line in coral `#ff8a7a`.
- Bottom half: `github.com/davide97g/workflows-people` in monospace
  lime, with a lime highlight bar swiping across the URL
  left-to-right in 400ms.
Overlay (Geist, 44pt, top): `Every other HR platform is closed.`

**Frame 6 · 12.5–15.0s — End card**
Pulse wordmark (Fraunces, italic R) with Sparkles bug in the top-left
corner. Centered, stacked:
`HR you can [italic]read[/italic],` (line 1)
`fork, and run.` (line 2, same size)
both in Fraunces Variable, ~140pt, cream, with a lime period at the
end. Bottom-anchored CTA pill: brand lime background, ink text,
`Star on GitHub ★`, with `github.com/davide97g/workflows-people` in
mono below it at 50% opacity.

## Motion, universally
- Every cut is on the beat. Assume 100 BPM: frames land on beats
  0 / 4 / 9 / 14 / 20 / 25 / 30 (the final beat).
- Text reveals: 120–220ms, ease-out, never bounce.
- Frames 2, 3 and 6 get a single brand-lime pulse (pulse-dot or
  highlight). No more than one brand-lime animation on screen at a
  time.
- Safe area: top 84px and bottom 220px must stay free of load-bearing
  content (Instagram UI overlays land there).

## Deliverables
Produce, in one pass:
1. A visual storyboard grid: 6 frames rendered side-by-side at
   1080×1920 each, with the exact type treatment and motion state at
   the *midpoint* of each frame.
2. A per-frame motion note (2–3 sentences) describing how the frame
   enters and exits — enough for a motion designer to execute in
   CapCut / After Effects without guessing.
3. An export-ready end-card as a separate PNG at 1080×1920 (frame 6
   only) for static cross-posting.

## Constraints
- No stock photography. No people. No illustrated characters, 3D
  blobs, or isometric scenes.
- No emoji except the single ★ in the CTA.
- Do NOT use the word "AI" anywhere on screen.
- Do NOT say "Book a demo", "Request access", "Join the waitlist", or
  "Trusted by".
- If Fraunces Variable or Geist Variable aren't available, SUBSTITUTE
  with Playfair Display + Inter as the closest open-source fallbacks,
  and flag the substitution in the output — do not silently pick
  something else.

## Reference frames (I paste 3 labelled screenshots here)
1. [Linear 2024 homepage hero at 00:02 — for type-reveal cadence]
2. [Raycast pricing page scroll mid-section — for dark product card
   framing with keyboard prompts]
3. [Apple Instagram reel end-card from the iPhone Pro campaign — for
   closing-frame composition]
````

*(Replace the three bracketed lines at the bottom with real
screenshots before you run the prompt.)*

### Per-frame variant

If the wholesale run goes wide on any frame, re-prompt with only the
brand-system block + the frame's paragraph from the storyboard,
prefixed with:

> Re-render ONLY Frame N from the Pulse HR reel brief. Keep all other
> frames identical. Tighter on [the specific issue].

---

## 3. Production checklist

Claude Design gives you static frames + motion notes. Real production
happens in CapCut / Premiere / After Effects. Checklist:

1. **Sign off each frame on static.** If a static frame doesn't feel
   Pulse, no amount of motion will save it.
2. **Drop frames into CapCut (mobile-native) or Premiere (desktop).**
   For the first reel, CapCut is fine and free.
3. **Time cuts to the beat.** Pick the track first, then cut frames to
   its downbeats. Don't cut on the beat and then try to fit music.
4. **Burn in captions.** Use Geist. Position captions **above** the
   Instagram bottom UI (stay in safe area).
5. **Color-check on a phone.** Brand lime can look dim on a low-brightness
   iPhone in sunlight. Bump saturation by 5–10% for mobile export if
   that's the case.
6. **Export master + Instagram preset.** Keep a `.mp4` master in
   1080×1920, H.264, 10 Mb/s. Instagram re-compresses; don't send it
   already over-compressed.
7. **Commit the master to the repo** under
   `docs/brand/renders/reel-001-open-source.mp4` (or whatever angle
   you ran) so future variants have a reference.
8. **Publish once, observe for 48h.** Save-rate ≥ 4% and completion-rate
   ≥ 55% are healthy for an angle this sharp. If both are low the
   ANGLE is wrong; don't re-cut the same angle, switch to keyboard or
   modular.
9. **Commit a `reel-001-notes.md`** alongside the render with what the
   reel achieved (reach, saves, completion, comments worth reading).
   The next reel inherits the lessons.

---

## 4. Alternate-angle seeds

Ready-to-paste one-liners for when "Open source" has run its course:

### Keyboard-first seed
Frame 1 hook: Black screen. A single monospace `⌘J` pulses into view,
then the caret types `log 4h on ACME-22`. Frame 2: intent pill
resolves in green. Headline: `Two keys. Everything.`

### Modular seed
Frame 1 hook: Three stacked cards lit one at a time (Money, People,
Work) with role accents. Frame 2: the stack splits into three
independent standalone cards drifting apart. Headline:
`Pick one. Skip the rest.`

### Anti-suite / vs seed
Frame 1 hook: Logos of Rippling / Deel / BambooHR crossfade with a
strikethrough. Frame 2: Pulse logo snaps in, lime pulse. Headline:
`The open alternative.` Ends on `/vs` URL card.

Each seed inherits the same brand system, safe area rules, and end
card. Only the middle 10 seconds change.
