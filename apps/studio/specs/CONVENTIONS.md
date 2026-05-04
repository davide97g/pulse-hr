# Spec conventions

How every testreel spec in this folder is built. Read before authoring or editing.

## 1. Browser chrome — clean, no technical noise

```json
"chrome": {
  "trafficLights": true,
  "url": false,
  "titleBarColor": "#0a0a0f",
  "titleBarHeight": 32
}
```

- **No URL bar** — `url: false` always.
- Traffic-light dots only.
- Title bar color matches the dark theme so the macOS frame disappears into the page.
- Title bar 32px (slimmer than default 38) — feels less browser-y.

Schema does not expose tab strip or devtools flags — they're already hidden by testreel.

## 2. Hide the app's own dev affordances

Inject before first paint via `localStorage`:

```json
"localStorage": {
  "pulse.theme": "employee",
  "pulse.devBanner": "false",
  "pulse.tours.completed": "[\"all\"]"
}
```

This kills the demo banner, the onboarding tour overlay, and any "you're in dev" hints. Add new keys here as the app grows new noise.

## 3. Background frame

Pick one — do not mix gradients across reels. Default for product reels:

```json
"background": { "color": "#0a0a0f", "padding": 60, "borderRadius": 12 }
```

Use a brand gradient only for the "show-off" homepage montage:

```json
"background": { "gradient": { "from": "#1a1230", "to": "#0a0a0f" }, "borderRadius": 12 }
```

## 4. Output size and viewport

All specs use:

```json
"viewport": { "width": 1280, "height": 720 },
"outputSize": { "width": 1920, "height": 1080 }
```

This is the master capture. Remotion compositions then derive 16:9-web (1280×720) and 1:1 (1080×1080) from this same source via crop+scale.

## 5. Cursor

```json
"cursor": { "enabled": true, "style": "default", "rippleColor": "#9b87ff", "transitionMs": 320 }
```

Brand-colored ripple. 320ms transition reads as deliberate without dragging.

## 6. Zoom — purposeful only

Only three reasons to zoom:

| Reason | Mechanic | Scale | Duration |
|---|---|---|---|
| **Input** — about to type into a field | standalone `zoom` step before type, then `zoom: 1` after submit | 1.7–1.9 | 180–300ms |
| **CTA punch** — primary button click | `click.zoom` property on the click step | 1.9–2.2 | (auto) |
| **Detail reveal** — chart, stat, badge, confetti landing | standalone `zoom` step, hold 500–800ms, then reset | 1.4–1.6 | 300–500ms |

**Banned:**
- Zoom that resets immediately without a typing/click event between (decorative pan).
- Zooming into static labels, headers, icons.
- Stacked zooms — always reset to `scale: 1` before zooming a different region.
- More than one zoom per second.

## 7. Captions — sidecar, not inline

testreel's step schema is closed (`additionalProperties: false`), so captions cannot live in spec steps. Author captions in a sibling file:

```
specs/
├── kudos-give.template.json
└── kudos-give.captions.json
```

Format:

```json
{
  "captions": [
    { "atStep": 8, "text": "Pick a teammate", "holdMs": 1800 },
    { "atStep": 14, "text": "Plain English. No fields.", "holdMs": 2200 },
    { "atStep": 18, "text": "Sent. Confetti optional.", "holdMs": 2400 }
  ]
}
```

After recording, the runner joins `<spec>.captions.json` with the auto-emitted `output/<spec>/timeline.json` (which contains absolute `t` ms per step index) to produce `public/captures/<spec>/captions.timed.json` consumed by Remotion's `<Caption>` overlay.

Caption rules:
- 1 line, ~50 chars max, no period unless dramatic.
- Triggered by inputs (label what's being typed), CTAs (label the action), result moments (label the outcome).
- Off-screen during pure cursor movement and route transitions.
- ~1.5–2.5s on screen — long enough to read, short enough to keep pace.

## 8. Step pacing

- Post-click `pauseAfter`: 80–200ms for instant UI changes, 1200–1800ms for route transitions, 2200–2800ms when a toast or confetti needs to land.
- Keystroke `delay`: 14–22ms feels human. Slower looks theatrical.
- Don't insert `wait` steps just to "let it breathe" — captions carry the pacing.

## 9. Setup block

For flows that don't need to *show* login, set `"{{SETUP}}"` once near the top of the spec — the runner inlines `_setup.partial.json`. Only `workspace-create.template.json` records the login UI itself.

## 10. Selectors

In order of preference:
1. Attribute-scoped: `input[type=email]`, `textarea[maxlength='200']`, `#workspace-name`
2. Role + text: `[role=dialog] input`, `[role=slider]`
3. `:has-text` on a class: `.cursor-pointer:has-text('Emma Wilson')`
4. Plain text on button: `button:has-text('Send')`

Avoid: bare `button`, `nth-child`, deep XPath. They break on every UI tweak.

## 11. File layout

```
specs/
├── CONVENTIONS.md                  ← this file
├── _setup.partial.json             ← login + workspace-create
├── _ghosts.partial.json            ← ghost user pool (feedback-live only)
├── <flow>.template.json            ← spec
├── <flow>.captions.json            ← caption sidecar (optional)
└── <flow>.ghosts.json              ← ghost choreography (feedback-live only)
```

## 12. Output

```
output/<spec>/
├── <spec>.json                     ← compiled spec (post-substitution)
├── <spec>-<timestamp>.mp4          ← raw capture
└── timeline.json                   ← step timing (auto)

public/captures/<spec>/
├── clip.mp4                        ← copied from latest output mp4
├── timeline.json                   ← copied
└── captions.timed.json             ← merged from sidecar + timeline
```

The Remotion `<CaptureReel>` composition reads from `public/captures/<spec>/` only — the `output/` tree is the working area.
