/**
 * Render the social preview cards (1200×630 PNG + SVG snapshot) into
 * apps/marketing/public/og/. One-shot script — run with:
 *
 *   bun run apps/marketing/scripts/render-og.ts
 *
 * Outputs:
 *   public/og/og-hero.png      ← canonical OG image (og:image)
 *   public/og/og-hero.svg      ← hand-readable text version, kept in sync
 *
 * The card uses Fraunces (display, brand serif) loaded from Google Fonts,
 * lime brand spark (#b4ff39), ink background (#0b0b0d), and the people-first
 * tagline from i18n/en.ts. Playwright renders an HTML doc to PNG so the
 * typography matches the marketing site exactly.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const OUT_DIR = resolve(import.meta.dir, "../public/og");

const INK = "#0b0b0d";
const CREAM = "#f2f2ee";
const BRAND = "#b4ff39";

const CARDS = [
  {
    name: "og-hero",
    eyebrow: "PULSE HR",
    headline: ["Your whole team."],
    accent: "One pulse.",
    sub: "Software for people, not headcount.",
  },
];

const html = (card: (typeof CARDS)[number]) => /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600;1,9..144,700&family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    background: ${INK};
    color: ${CREAM};
    font-family: "Geist", system-ui, sans-serif;
    position: relative;
    isolation: isolate;
  }
  .glow {
    position: absolute;
    inset: -10%;
    background:
      radial-gradient(ellipse 55% 45% at 28% 38%, ${BRAND}1f 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 82% 78%, ${BRAND}14 0%, transparent 70%);
    z-index: -1;
  }
  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(${CREAM}07 1px, transparent 1px),
      linear-gradient(90deg, ${CREAM}07 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, #000 30%, transparent 80%);
    z-index: -1;
  }
  .frame {
    height: 100%;
    padding: 72px 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    font-family: "Geist Mono", ui-monospace, monospace;
    font-size: 18px;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: ${CREAM}cc;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: ${BRAND};
    box-shadow: 0 0 24px ${BRAND}, 0 0 4px ${BRAND};
  }
  .headline {
    font-family: "Fraunces", "Times New Roman", serif;
    font-weight: 600;
    font-size: 132px;
    line-height: 0.96;
    letter-spacing: -0.028em;
    color: #ffffff;
    text-shadow: 0 24px 80px rgba(0,0,0,0.55);
  }
  .headline .accent {
    color: ${BRAND};
    font-style: italic;
  }
  .footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;
  }
  .sub {
    font-family: "Geist", system-ui, sans-serif;
    font-size: 26px;
    line-height: 1.3;
    color: ${CREAM}d9;
    max-width: 720px;
    font-weight: 400;
  }
  .url {
    font-family: "Geist Mono", ui-monospace, monospace;
    font-size: 20px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${CREAM};
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border: 1px solid ${BRAND}55;
    border-radius: 999px;
    background: rgba(255,255,255,0.025);
    backdrop-filter: blur(8px);
    white-space: nowrap;
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="grid"></div>
  <div class="frame">
    <div class="eyebrow">
      <span class="dot"></span>
      ${card.eyebrow}
    </div>
    <div class="headline">
      ${card.headline.map((l) => `<div>${l}</div>`).join("")}
      <div class="accent">${card.accent}</div>
    </div>
    <div class="footer">
      <div class="sub">${card.sub}</div>
      <div class="url"><span class="dot"></span>pulsehr.it</div>
    </div>
  </div>
</body>
</html>`;

const svgFor = (card: (typeof CARDS)[number]) => /* xml */ `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="${card.headline.join(" ")} ${card.accent} — Pulse HR">
  <defs>
    <radialGradient id="g1" cx="28%" cy="38%" r="55%">
      <stop offset="0%" stop-color="${BRAND}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${BRAND}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="82%" cy="78%" r="55%">
      <stop offset="0%" stop-color="${BRAND}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${BRAND}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${INK}"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <g font-family="'Geist Mono', ui-monospace, monospace" font-size="18" letter-spacing="5.7" fill="${CREAM}" opacity="0.8">
    <circle cx="92" cy="98" r="6" fill="${BRAND}"/>
    <text x="112" y="105" text-transform="uppercase">${card.eyebrow}</text>
  </g>
  <g font-family="'Fraunces', 'Times New Roman', serif" font-weight="600" fill="#ffffff" font-size="132" letter-spacing="-3.7">
    ${card.headline
      .map((l, i) => `<text x="80" y="${300 + i * 132}">${l}</text>`)
      .join("\n    ")}
    <text x="80" y="${300 + card.headline.length * 132}" fill="${BRAND}" font-style="italic">${card.accent}</text>
  </g>
  <g font-family="'Geist', system-ui, sans-serif" font-size="26" fill="${CREAM}" opacity="0.85">
    <text x="80" y="572">${card.sub}</text>
  </g>
  <g font-family="'Geist Mono', ui-monospace, monospace" font-size="20" letter-spacing="3.6" fill="${CREAM}">
    <rect x="1010" y="540" width="130" height="48" rx="24" fill="rgba(255,255,255,0.025)" stroke="${BRAND}" stroke-opacity="0.33"/>
    <circle cx="1030" cy="564" r="6" fill="${BRAND}"/>
    <text x="1046" y="571" text-transform="uppercase">pulsehr.it</text>
  </g>
</svg>`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const card of CARDS) {
      const page = await browser.newPage({
        viewport: { width: 1200, height: 630 },
        deviceScaleFactor: 2,
      });
      await page.setContent(html(card), { waitUntil: "networkidle" });
      await page.evaluate(() =>
        (document as Document & { fonts: FontFaceSet }).fonts.ready,
      );
      const png = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: 1200, height: 630 },
        omitBackground: false,
      });
      const pngPath = resolve(OUT_DIR, `${card.name}.png`);
      const svgPath = resolve(OUT_DIR, `${card.name}.svg`);
      await mkdir(dirname(pngPath), { recursive: true });
      await writeFile(pngPath, png);
      await writeFile(svgPath, svgFor(card), "utf8");
      console.log(`  ✓ ${card.name}.png + .svg`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

await main();
