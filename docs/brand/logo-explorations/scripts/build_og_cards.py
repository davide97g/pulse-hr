"""
Generate OG social card templates (1200x630) as self-contained outlined SVGs,
then rasterize each to PNG.

Three cards:
  og-brand.svg   — centered stacked lockup + 3-pillar stamp
  og-hero.svg    — big italic hero tagline "HR software for people who hate HR software."
  og-callout.svg — mid-size italic callout "Everything you touch sticks."
"""

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from pathlib import Path

FONT_PATH = Path(
    "/sessions/peaceful-compassionate-planck/mnt/pulse-hr/node_modules/.bun/"
    "@fontsource-variable+fraunces@5.2.9/node_modules/@fontsource-variable/fraunces/"
    "files/fraunces-latin-full-italic.woff2"
)
OUT_DIR = Path("/sessions/peaceful-compassionate-planck/mnt/pulse-hr/docs/brand/logo-explorations/og")
OUT_DIR.mkdir(exist_ok=True)

# ---------- Load font and cache glyphs ----------
_font = TTFont(str(FONT_PATH))
_static = instantiateVariableFont(_font, {"wght": 900, "opsz": 144})
_glyph_set = _static.getGlyphSet()
_cmap = _static.getBestCmap()
_hmtx = _static["hmtx"]
UPM = _static["head"].unitsPerEm  # 2000

_cache = {}

def glyph(ch: str) -> dict:
    if ch in _cache:
        return _cache[ch]
    if ch == " ":
        name = _cmap.get(ord(" "))
        adv = _hmtx[name][0] if name else int(UPM * 0.25)
        res = {"path": "", "advance": adv}
    else:
        code = ord(ch)
        if code not in _cmap:
            res = {"path": "", "advance": int(UPM * 0.5)}
        else:
            name = _cmap[code]
            g = _glyph_set[name]
            pen = SVGPathPen(_glyph_set)
            g.draw(pen)
            adv, _lsb = _hmtx[name]
            res = {"path": pen.getCommands(), "advance": adv}
    _cache[ch] = res
    return res


def run_width(text: str) -> int:
    return sum(glyph(c)["advance"] for c in text)


def outline_run(text: str, color: str, x_offset: int = 0) -> str:
    """Return a set of <path> elements for `text` in font coords, origin (0,0)."""
    parts = []
    x = x_offset
    for c in text:
        g = glyph(c)
        if g["path"]:
            parts.append(f'    <path fill="{color}" transform="translate({x} 0)" d="{g["path"]}"/>')
        x += g["advance"]
    return "\n".join(parts)


def centered_line(text: str, color: str, canvas_w: int, scale: float, baseline_y: int) -> str:
    """Wrap outlined run in a flipped group centered horizontally on `canvas_w`."""
    w_units = run_width(text)
    w_svg = w_units * scale
    x_start = (canvas_w - w_svg) / 2
    return f'''  <g transform="translate({x_start:.2f} {baseline_y}) scale({scale} {-scale})">
{outline_run(text, color)}
  </g>'''


def left_line(text: str, color: str, x: float, scale: float, baseline_y: int) -> str:
    return f'''  <g transform="translate({x:.2f} {baseline_y}) scale({scale} {-scale})">
{outline_run(text, color)}
  </g>'''


# ---------- Small mark (reusable) ----------
def mark_inline(cx: int, cy: int, ring_r_outer=42, ring_r_inner=27.5, dot_r=9,
                ring_stroke=2.25, inner_stroke=3.0,
                stroke_color="#b4ff39", dot_color="#b4ff39") -> str:
    return f'''  <g transform="translate({cx} {cy})">
    <circle cx="0" cy="0" r="{ring_r_outer}" fill="none" stroke="{stroke_color}" stroke-width="{ring_stroke}" opacity="0.55"/>
    <circle cx="0" cy="0" r="{ring_r_inner}" fill="none" stroke="{stroke_color}" stroke-width="{inner_stroke}"/>
    <circle cx="0" cy="0" r="{dot_r}" fill="{dot_color}"/>
  </g>'''


# ==========================================================
#  Card 1 — og-brand: stacked lockup centered, 3-pillar stamp
# ==========================================================
def og_brand() -> str:
    W, H = 1200, 630
    # Mark centered horizontally, sitting high in the canvas so it clears the wordmark
    mark = f'''  <g transform="translate(600 175)">
    <circle cx="0" cy="0" r="100" fill="none" stroke="#b4ff39" stroke-width="5" opacity="0.55"/>
    <circle cx="0" cy="0" r="65"  fill="none" stroke="#b4ff39" stroke-width="7"/>
    <circle cx="0" cy="0" r="22"  fill="#b4ff39"/>
  </g>'''

    # "Pulse HR" centered, large — scale 0.10 → cap ≈ 140, ascender top ≈ 160 above baseline
    word_scale = 0.10
    pulse_part_w = run_width("Pulse ") * word_scale
    hr_part_w = run_width("HR") * word_scale
    total_w = pulse_part_w + hr_part_w
    x_start = (W - total_w) / 2
    baseline_y = 445    # ascender top ≈ 445 - 160 = 285, mark bottom ≈ 275 → 10px clearance
    pulse_frag = f'''  <g transform="translate({x_start:.2f} {baseline_y}) scale({word_scale} {-word_scale})">
{outline_run("Pulse ", "#f2f2ee")}
  </g>'''
    hr_frag = f'''  <g transform="translate({x_start + pulse_part_w:.2f} {baseline_y}) scale({word_scale} {-word_scale})">
{outline_run("HR", "#b4ff39")}
  </g>'''

    # 3-pillar stamp (smaller)
    stamp_text = "Open. Transparent. Built by the people who use it."
    stamp_scale = 0.022
    stamp_line = centered_line(stamp_text, "#8a8a84", W, stamp_scale, 540)

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Pulse HR">
  <rect width="{W}" height="{H}" fill="#0b0b0d"/>
{mark}
{pulse_frag}
{hr_frag}
{stamp_line}
</svg>
'''


# ==========================================================
#  Card 2 — og-hero: big italic tagline
# ==========================================================
def og_hero() -> str:
    W, H = 1200, 630
    # Three lines of hero tagline, ragged-left, large italic
    line1 = "HR software"
    line2 = "for people who hate"
    line3 = "HR software."

    # Pick a scale so the longest line fits in W - 2*margin
    margin = 80
    max_units = max(run_width(line1), run_width(line2), run_width(line3))
    scale = (W - 2 * margin) / max_units * 0.92  # 8% headroom
    # Line-height must cover ascender + descender; Fraunces italic ≈ 2200 units vertical range
    line_height = 2200 * scale

    baseline_y1 = 150
    baseline_y2 = baseline_y1 + line_height
    baseline_y3 = baseline_y2 + line_height

    lines_svg = "\n".join([
        left_line(line1, "#f2f2ee", margin, scale, baseline_y1),
        left_line(line2, "#f2f2ee", margin, scale, baseline_y2),
        left_line(line3, "#b4ff39", margin, scale, baseline_y3),  # punchline in lime
    ])

    # Small corner lockup bottom-right — size + position so text fits inside canvas
    corner_scale = 0.020
    cream_w = run_width("Pulse ") * corner_scale
    hr_w = run_width("HR") * corner_scale
    corner_total = cream_w + hr_w
    # Right-edge budget: mark_outer_radius(22) + gap(10) + text_w + right_margin(40)
    corner_right_pad = 40
    corner_text_start = W - corner_right_pad - corner_total
    mark_cx = corner_text_start - 14  # 14 px gap between mark and text
    corner_mark = mark_inline(mark_cx, 570, ring_r_outer=22, ring_r_inner=14.5, dot_r=4.5,
                              ring_stroke=1.2, inner_stroke=1.6)
    corner_baseline = 578
    corner_x = corner_text_start
    corner_text = f'''  <g transform="translate({corner_x} {corner_baseline}) scale({corner_scale} {-corner_scale})">
{outline_run("Pulse ", "#f2f2ee")}
  </g>
  <g transform="translate({corner_x + cream_w:.2f} {corner_baseline}) scale({corner_scale} {-corner_scale})">
{outline_run("HR", "#b4ff39")}
  </g>'''

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="HR software for people who hate HR software. — Pulse HR">
  <rect width="{W}" height="{H}" fill="#0b0b0d"/>
{lines_svg}
{corner_mark}
{corner_text}
</svg>
'''


# ==========================================================
#  Card 3 — og-callout: medium italic callout
# ==========================================================
def og_callout() -> str:
    W, H = 1200, 630
    headline = "Everything you touch sticks."
    margin = 80
    max_units = run_width(headline)
    scale = (W - 2 * margin) / max_units * 0.95
    baseline_y = 340  # roughly vertical center

    hl = left_line(headline, "#f2f2ee", margin, scale, baseline_y)

    # Corner lockup bottom-left this time
    corner_mark = mark_inline(104, 560, ring_r_outer=22, ring_r_inner=14.5, dot_r=4.5,
                              ring_stroke=1.2, inner_stroke=1.6)
    corner_scale = 0.022
    cream_w = run_width("Pulse ") * corner_scale
    corner_x = 134
    corner_baseline = 568
    corner_text = f'''  <g transform="translate({corner_x} {corner_baseline}) scale({corner_scale} {-corner_scale})">
{outline_run("Pulse ", "#f2f2ee")}
  </g>
  <g transform="translate({corner_x + cream_w:.2f} {corner_baseline}) scale({corner_scale} {-corner_scale})">
{outline_run("HR", "#b4ff39")}
  </g>'''

    # Subtle divider above the corner
    divider = '  <rect x="80" y="520" width="88" height="1" fill="#b4ff39" opacity="0.5"/>'

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Everything you touch sticks. — Pulse HR">
  <rect width="{W}" height="{H}" fill="#0b0b0d"/>
{hl}
{divider}
{corner_mark}
{corner_text}
</svg>
'''


# ---------- Write files ----------
(OUT_DIR / "og-brand.svg").write_text(og_brand())
(OUT_DIR / "og-hero.svg").write_text(og_hero())
(OUT_DIR / "og-callout.svg").write_text(og_callout())

for p in sorted(OUT_DIR.glob("*.svg")):
    print(f"  {p.name}  {p.stat().st_size} bytes")
