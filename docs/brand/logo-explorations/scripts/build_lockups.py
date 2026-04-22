"""
Build outlined SVG lockups from the Fraunces italic 900 / opsz=144 instance.
Outputs:
  - 10-lockup-horizontal.svg (cream + lime HR, two-tone)
  - 11-lockup-horizontal-mono.svg (all cream)
  - 12-lockup-stacked.svg (mark above wordmark, two-tone)
Also writes 10b / 11b versions against cream background (ink + lime) for light mode.
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
OUT_DIR = Path("/sessions/peaceful-compassionate-planck/mnt/pulse-hr/docs/brand/logo-explorations")

# ---------- Load + instantiate font ----------
font = TTFont(str(FONT_PATH))
static = instantiateVariableFont(font, {"wght": 900, "opsz": 144})

glyph_set = static.getGlyphSet()
cmap = static.getBestCmap()
hmtx = static["hmtx"]
upm = static["head"].unitsPerEm  # 2000

def glyph(ch):
    code = ord(ch)
    if ch == " ":
        name = cmap.get(ord(" "))
        adv = hmtx[name][0] if name else int(upm * 0.25)
        return {"char": ch, "path": "", "advance": adv}
    name = cmap[code]
    g = glyph_set[name]
    pen = SVGPathPen(glyph_set)
    g.draw(pen)
    adv, _ = hmtx[name]
    return {"char": ch, "path": pen.getCommands(), "advance": adv}

chars = [glyph(c) for c in "Pulse HR"]

# ---------- Helpers ----------
def build_run(run_chars, color):
    """Return (svg_fragment, total_advance_units) for a run at origin (0,0)."""
    parts = []
    x = 0
    for c in run_chars:
        if c["path"]:
            parts.append(
                f'    <path fill="{color}" transform="translate({x} 0)" d="{c["path"]}"/>'
            )
        x += c["advance"]
    return "\n".join(parts), x


def build_wordmark(cream_color, lime_color, scale, baseline_x, baseline_y):
    """
    Compose 'Pulse HR' with the first 6 chars (including trailing space) in cream,
    'HR' in lime. Return SVG string.
    """
    cream_frag, cream_adv = build_run(chars[:6], cream_color)
    lime_frag,  lime_adv  = build_run(chars[6:], lime_color)
    return f'''  <g transform="translate({baseline_x} {baseline_y}) scale({scale} {-scale})">
{cream_frag}
    <g transform="translate({cream_adv} 0)">
{lime_frag.replace('    <path', '      <path')}
    </g>
  </g>'''


def build_mono_wordmark(color, scale, baseline_x, baseline_y):
    """All-one-color wordmark."""
    frag, _ = build_run(chars, color)
    return f'''  <g transform="translate({baseline_x} {baseline_y}) scale({scale} {-scale})">
{frag}
  </g>'''


# ---------- Common values ----------
# Total advance in font units
TOTAL_ADV = sum(c["advance"] for c in chars)  # ≈ 8305

# ---------- 10 — horizontal two-tone (ink bg, cream + lime HR) ----------
def horizontal_svg(bg_fill, cream_color, lime_color, mark_ring_stroke, mark_dot_fill):
    # Canvas 560x120. Mark centered at (60, 60), text baseline at y=84.
    scale = 0.044         # 1 font unit = 0.044 SVG units (font-size ≈ 88 @ upm 2000)
    baseline_x = 128
    baseline_y = 84
    body = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120" width="560" height="120" role="img" aria-label="Pulse HR">
  <rect width="560" height="120" fill="{bg_fill}"/>
  <!-- Mark: concentric rings + dot -->
  <g transform="translate(60 60)">
    <circle cx="0" cy="0" r="42"  fill="none" stroke="{mark_ring_stroke}" stroke-width="2.25" opacity="0.55"/>
    <circle cx="0" cy="0" r="27.5" fill="none" stroke="{mark_ring_stroke}" stroke-width="3"/>
    <circle cx="0" cy="0" r="9"   fill="{mark_dot_fill}"/>
  </g>
  <!-- Outlined wordmark — Fraunces italic, wght=900, opsz=144, UPM=2000, scale={scale} -->
{build_wordmark(cream_color, lime_color, scale, baseline_x, baseline_y)}
</svg>
'''
    return body


def horizontal_mono_svg(bg_fill, fg_color):
    scale = 0.044
    baseline_x = 128
    baseline_y = 84
    body = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120" width="560" height="120" role="img" aria-label="Pulse HR">
  <rect width="560" height="120" fill="{bg_fill}"/>
  <g transform="translate(60 60)">
    <circle cx="0" cy="0" r="42"  fill="none" stroke="{fg_color}" stroke-width="2.25" opacity="0.55"/>
    <circle cx="0" cy="0" r="27.5" fill="none" stroke="{fg_color}" stroke-width="3"/>
    <circle cx="0" cy="0" r="9"   fill="{fg_color}"/>
  </g>
{build_mono_wordmark(fg_color, scale, baseline_x, baseline_y)}
</svg>
'''
    return body


def stacked_svg(bg_fill, cream_color, lime_color):
    # Canvas 440x300. Mark centered at (220, 108), text baseline at y=240.
    scale = 0.052    # slightly larger text for stacked reading
    # Text width in SVG units:
    text_w = TOTAL_ADV * scale   # ≈ 432
    baseline_x = (440 - text_w) / 2     # centered
    baseline_y = 240
    body = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 300" width="440" height="300" role="img" aria-label="Pulse HR">
  <rect width="440" height="300" fill="{bg_fill}"/>
  <g transform="translate(220 108)">
    <circle cx="0" cy="0" r="54"   fill="none" stroke="{cream_color if cream_color != '#f2f2ee' else '#b4ff39'}" stroke-width="2.5" opacity="0.55"/>
    <circle cx="0" cy="0" r="35"   fill="none" stroke="{cream_color if cream_color != '#f2f2ee' else '#b4ff39'}" stroke-width="3.25"/>
    <circle cx="0" cy="0" r="11.5" fill="{cream_color if cream_color != '#f2f2ee' else '#b4ff39'}"/>
  </g>
{build_wordmark(cream_color, lime_color, scale, baseline_x, baseline_y)}
</svg>
'''
    return body


# ---------- Write files ----------
OUT_DIR.mkdir(exist_ok=True)

# Lockup 10 — default two-tone on ink
(OUT_DIR / "10-lockup-horizontal.svg").write_text(
    horizontal_svg(
        bg_fill="#0b0b0d",
        cream_color="#f2f2ee",
        lime_color="#b4ff39",
        mark_ring_stroke="#b4ff39",
        mark_dot_fill="#b4ff39",
    )
)

# Lockup 11 — cream monochrome on ink
(OUT_DIR / "11-lockup-horizontal-mono.svg").write_text(
    horizontal_mono_svg(bg_fill="#0b0b0d", fg_color="#f2f2ee")
)

# Lockup 12 — stacked two-tone on ink
(OUT_DIR / "12-lockup-stacked.svg").write_text(
    stacked_svg(bg_fill="#0b0b0d", cream_color="#f2f2ee", lime_color="#b4ff39")
)

# Light-mode companion: horizontal, ink on cream, with HR in lime
# (lime on cream is low-contrast — keep both text and mark in ink for accessibility)
(OUT_DIR / "10b-lockup-horizontal-light.svg").write_text(
    horizontal_svg(
        bg_fill="#f2f2ee",
        cream_color="#0b0b0d",
        lime_color="#0b0b0d",   # no lime on cream; stays ink
        mark_ring_stroke="#0b0b0d",
        mark_dot_fill="#0b0b0d",
    )
)

print("wrote:")
for p in sorted(OUT_DIR.glob("1[012]*-lockup*.svg")):
    print(" ", p.name, p.stat().st_size, "bytes")
