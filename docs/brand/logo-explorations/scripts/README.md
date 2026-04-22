# Brand asset generators

Self-contained Python scripts that regenerate the outlined lockups and the OG
social cards from the Fraunces variable font shipped in `node_modules/`. No
Google Fonts fetch, no external font install — outputs are stroke-path SVGs
that render identically on any device.

## Prereqs

```bash
pip install fonttools brotli --break-system-packages
```

`brotli` is needed so fontTools can read the `.woff2` files fontsource ships.

## Run

From anywhere:

```bash
python3 docs/brand/logo-explorations/scripts/build_lockups.py
python3 docs/brand/logo-explorations/scripts/build_og_cards.py
```

`build_lockups.py` writes into `docs/brand/logo-explorations/`:

- `10-lockup-horizontal.svg` — primary two-tone lockup
- `10b-lockup-horizontal-light.svg` — light-mode (ink on cream)
- `11-lockup-horizontal-mono.svg` — monochrome cream
- `12-lockup-stacked.svg` — avatars / footers / social cards

`build_og_cards.py` writes into `docs/brand/logo-explorations/og/`:

- `og-brand.svg` / `.png` — centered lockup + 3-pillar stamp
- `og-hero.svg` / `.png` — hero tagline ("HR software for people who hate HR software.")
- `og-callout.svg` / `.png` — medium callout ("Everything you touch sticks.")

## Rasterize SVG → PNG

The OG cards need PNG siblings because some social crawlers reject SVG
`og:image`. Install `sharp` in a scratch directory (per repo convention —
`sharp` is NOT a repo dep):

```bash
mkdir -p /tmp/sharp-scratch && cd /tmp/sharp-scratch
npm init -y >/dev/null && npm install sharp --silent
```

Then in the scratch dir:

```js
// rasterize.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";
import path from "node:path";

const dir = "../../pulse-hr/docs/brand/logo-explorations/og";
for (const name of ["og-brand", "og-hero", "og-callout"]) {
  await sharp(readFileSync(path.join(dir, `${name}.svg`)), { density: 300 })
    .resize(1200, 630, { fit: "contain", background: "#0b0b0d" })
    .png({ compressionLevel: 9 })
    .toFile(path.join(dir, `${name}.png`));
}
```

```bash
node rasterize.mjs
```

## Font axis values used

- `wght` = 900 (black)
- `opsz` = 144 (display optical size — higher contrast, sharper ball terminals)
- `SOFT` = 0 (default, standard terminals)
- `WONK` = 1 (default for this subset — does not affect "Pulse HR" or any
  letter used in the current taglines)

To change any of these, edit the `instantiateVariableFont(...)` call near the
top of each script.

## Customising an OG card

The cleanest path is to edit `build_og_cards.py` — the three `og_*()` functions
are self-contained. Each computes its layout from a few variables (scale,
baseline, margin) so you can tweak the tagline string and re-run.

If you need a whole new card template, copy one of the existing functions,
rename it, and add a `(OUT_DIR / "og-whatever.svg").write_text(og_whatever())`
line at the bottom. The helpers `outline_run`, `centered_line`, `left_line`,
and `mark_inline` cover most compositions.
