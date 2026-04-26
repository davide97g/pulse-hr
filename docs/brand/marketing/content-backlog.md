# Content backlog — what's missing, ranked

The TODO list of every marketing asset we still need to produce, pulled
from the pillar × target × platform matrix in [`campaign.md`](./campaign.md)
§5 and the 12-week calendar in [`content-calendar.md`](./content-calendar.md).

**How this is ranked.** Every item has a **priority** (P0 = blocks
launch week; P1 = needed for Phase C flywheel; P2 = nice to have), an
**owner**, and a **link to the source** it's derived from. "New" means
there's nothing in the repo to derive it from — we write / shoot / draw
it from scratch.

**Conventions.** Same as the calendar — `O / T / Y / B` for pillars, `A / B / C` for
audience rings. "MD" = marketing deliverable (copy / page / component).
"VID" = video asset, "IMG" = static graphic, "POST" = written post.

Commit against specific items in this file: `docs(marketing): drafted
codebase-tour script for YT-001` is fine.

---

## 0. What we already have (inventory check)

Before adding anything, credit what exists:

| ID     | Asset                                      | Location                                      | Status      |
| ------ | ------------------------------------------ | --------------------------------------------- | ----------- |
| EX-01  | Hero reel — "A day at Pulse" (12s, 1280×720) | `apps/studio/output/desktop.mp4`                | Ready       |
| EX-02  | Social vertical of EX-01 (9:16)              | `apps/studio/output/social-vertical.mp4`        | Ready       |
| EX-03  | Marketing site copy (EN + IT)              | `apps/marketing/src/i18n/{en,it}.ts`          | Updated to foundation (this commit) |
| EX-04  | Lockup + OG cards                          | `docs/brand/logo-explorations/`               | Ready       |
| EX-05  | Repo README                                | `README.md`                                   | Ready       |
| EX-06  | Architecture + self-host docs              | `ARCHITECTURE.md`, `docs/self-hosting.md`     | Ready       |
| EX-07  | Content-strategy doc                       | `CONTENT_STRATEGY.md`                         | Ready       |
| EX-08  | Remotion video pipeline                    | `apps/studio/`                                  | Usable      |

Anything below is **not** in this inventory — it's what we still need.

---

## 1. P0 — blocks launch week

### 1.1 Marketing site · final copy pass

| ID      | Title                                                           | Owner    | Pillar · Target | Derived from                        |
| ------- | --------------------------------------------------------------- | -------- | --------------- | ----------------------------------- |
| MD-001  | Hero re-cut video using the primary line "HR software for people who hate HR software" | Davide | O · B/C | `apps/studio/src/DayInPulse.tsx`      |
| MD-002  | `/open-source` page rewrite off `foundation.md` §5              | Davide   | O · A           | foundation §5, LICENSE              |
| MD-003  | `/vs` page update — include honest losses alongside wins        | Niccolò  | T · B           | foundation §10                      |
| MD-004  | `/pricing` page — explicit "no sales call", "export any time"   | Davide   | Y · B           | foundation §11                      |
| MD-005  | Blog index — 3 seeded posts (licensing log, stack tour, commessa) | Davide | T/O/B · C     | new                                 |
| MD-006  | `/about` page — two maintainers, no team theatre                | Davide   | B · C           | foundation §13                      |
| MD-007  | Monthly-metrics live number component (stars, PRs, signups)     | Niccolò  | T · all         | GitHub API / plausible              |

### 1.2 Product Hunt launch kit

| ID      | Asset                                                           | Owner    | Format               | Notes                                  |
| ------- | --------------------------------------------------------------- | -------- | -------------------- | -------------------------------------- |
| PH-001  | PH card — 240×240 PNG, ink + lime + italic "hate"                | Davide   | IMG                  | From `logo-explorations/`              |
| PH-002  | Gallery — 5 × 1200×750 screens (`/`, `/pricing`, `/vs`, `/roadmap`, `/changelog`) | Davide | IMG | Hand-composed on ink card              |
| PH-003  | Hero video for PH header — the EX-01 master re-cut to 30s       | Davide   | VID                  | Derived from EX-01                      |
| PH-004  | Maker story (pinned comment) — 3 paragraphs                     | Davide   | POST                 | Off foundation §4 origin                |
| PH-005  | Tagline (60-char): "Open-source, modular HR. Read, run, export." | Davide  | POST                 | —                                       |
| PH-006  | First-100-commenters reply playbook — ~20 prepared phrasings    | Davide   | POST                 | Internal, not published                 |
| PH-007  | "Upcoming" teaser page on `pulsehr.it/launch`                    | Davide   | MD                   | Simple email capture + countdown        |

### 1.3 Launch-week posts

| ID      | Post                                                            | Owner    | Channel             | Status  |
| ------- | --------------------------------------------------------------- | -------- | ------------------- | ------- |
| POST-001| "tomorrow we launch on PH" — short, dated, calm                 | Davide   | LinkedIn · personal | NEW     |
| POST-002| Launch morning LinkedIn long post from Davide                    | Davide   | LinkedIn · personal | NEW     |
| POST-003| Launch morning company page post                                 | Davide   | LinkedIn · company  | NEW     |
| POST-004| "Show HN: Pulse HR" submission copy                              | Davide   | Hacker News         | NEW     |
| POST-005| Niccolò's "two devs + Claude Code" technical short                | Niccolò  | LinkedIn · personal | NEW     |
| POST-006| Launch-week recap post with every number real                    | Davide   | LinkedIn + blog     | NEW     |

### 1.4 Instagram seed (pre-launch — Phase A produces 12 posts)

| ID      | Type              | Title / concept                                              | Pillar · Target |
| ------- | ----------------- | ------------------------------------------------------------ | --------------- |
| IG-001  | Static (feed)      | The four-commitment stamp                                    | — · C           |
| IG-002  | Static (feed)      | `HR software for people who hate HR software.` italic slide  | — · all         |
| IG-003  | Static (feed)      | LICENSE header in big Fraunces                               | O · C           |
| IG-004  | Static (feed)      | "two devs · one ink room" cold frame                          | B · C           |
| IG-005  | Carousel           | "What open source actually means for your HR data" (6 slides) | O · B           |
| IG-006  | Carousel           | "Six proofs of transparency we publish" (6 slides)           | T · B           |
| IG-007  | Carousel           | "Money · People · Work — pick any" (8 slides)                 | B · B           |
| IG-008  | Carousel           | "The export button, step by step" (7 slides)                  | Y · B           |
| IG-009  | Reel (12–18s)      | `git clone` → Pulse running in 60s                            | O · A/C         |
| IG-010  | Reel (15s)         | ⌘J command bar resolving a natural phrase                     | O · A           |
| IG-011  | Reel (20s)         | Commessa burn chart changing live as hours log                | B · B           |
| IG-012  | Reel (12s)         | One-click export cinematic (ZIP lands in Finder)              | Y · B           |

### 1.5 YouTube pre-launch (2 long-forms)

| ID      | Title                                                           | Owner    | Length   | Pillar · Target |
| ------- | --------------------------------------------------------------- | -------- | -------- | --------------- |
| YT-001  | "Building Pulse HR: the codebase tour (React + Bun + Hono)"      | Niccolò  | 12–15 min | O · A           |
| YT-002  | "Self-hosting Pulse HR on Docker, Helm, and Terraform"          | Davide   | 15–18 min | Y · A           |

---

## 2. P1 — Phase C flywheel (weeks 6–12)

### 2.1 Long-form content

| ID      | Title                                                                         | Owner    | Format              | Pillar · Target |
| ------- | ----------------------------------------------------------------------------- | -------- | ------------------- | --------------- |
| BLOG-001| "A day in a services firm, on Pulse" (editorial long-form)                    | Davide   | Blog + LinkedIn     | B · B           |
| BLOG-002| "What we don't call AI — the ⌘J command bar, honest label"                     | Davide   | Blog + LinkedIn     | O · A           |
| BLOG-003| Contributor spotlight: first merged external PR                                | Niccolò  | Blog + LinkedIn     | B · A           |
| BLOG-004| T+30 metrics report (stars, PRs, signups, MRR)                                 | Davide   | Blog + LinkedIn     | T · A/C         |
| BLOG-005| "Commessa ops for services firms" (EN + IT)                                    | Davide   | Blog + LinkedIn     | B · B           |
| BLOG-006| "I exported my entire Pulse account to prove it works"                         | Davide   | Blog + LinkedIn     | Y · C           |
| BLOG-007| "90 days of building Pulse HR in public"                                       | Davide   | Blog + LinkedIn     | T · C           |
| BLOG-008| "Why FSL over AGPL — the licensing decision log" (deep-dive)                  | Davide   | Blog + LinkedIn     | O · A/C         |
| BLOG-009| "Screw-ups log — monthly"                                                      | Davide   | Blog                | T · C           |

### 2.2 YouTube long-forms (months 3–6)

| ID      | Title                                                                         | Owner    | Length   | Pillar · Target |
| ------- | ----------------------------------------------------------------------------- | -------- | -------- | --------------- |
| YT-003  | "How we track monthly metrics in public"                                       | Davide   | 8–10 min  | T · A/C         |
| YT-004  | "A day in Pulse HR: timesheets, commessa, payroll, all keyboard-first"         | Davide   | 12–15 min | B · B           |
| YT-005  | "Choosing FSL over AGPL for Pulse HR: the licensing decision log"              | Davide   | 10–12 min | O · A/C         |
| YT-006  | "Two developers shipping HR software with Claude Code (and nothing else)"     | Davide   | 18–25 min | B · C           |
| YT-007  | "Landing a PR in the Pulse codebase" (based on BLOG-003 subject)               | Niccolò  | 10 min    | B · A           |

### 2.3 Repeating reels / Shorts (templates — reuse each quarter)

| ID      | Template                                                                     | Cadence            | Pillar · Target |
| ------- | ---------------------------------------------------------------------------- | ------------------ | --------------- |
| RL-TMPL-1 | "This week on GitHub" — 10s scroll of the last N commits                    | Weekly             | T · A/C         |
| RL-TMPL-2 | "Command of the week" — ⌘J doing a different intent each time               | Weekly             | O · A           |
| RL-TMPL-3 | "Feature of the week" — one UI, no voice, cut to a lime-dot beat            | Weekly             | B · B           |
| RL-TMPL-4 | "Contributor of the month"                                                  | Monthly            | B · A           |
| RL-TMPL-5 | "Export Friday" — the export button clicked, different dataset each month  | Monthly            | Y · B           |

### 2.4 Carousels (templates)

| ID        | Template                                                                 | Cadence  | Pillar · Target |
| --------- | ------------------------------------------------------------------------ | -------- | --------------- |
| CA-TMPL-1 | "vs. \<competitor\>" — 8 slides, balanced wins/losses per `foundation.md` §10 | Monthly | O/B · B         |
| CA-TMPL-2 | "Monthly stats" — 6 slides of the numbers we track publicly              | Monthly  | T · all         |
| CA-TMPL-3 | "Anatomy of a PR" — real merged PR, step-by-step                         | Monthly  | B · A           |

---

## 3. P2 — nice to have

### 3.1 Derivatives and bets

| ID     | Asset                                                                   | Format                   | Pillar · Target |
| ------ | ----------------------------------------------------------------------- | ------------------------ | --------------- |
| DER-01 | Newsletter setup (Postmark or Buttondown) + bi-monthly send cadence    | Email                    | — · all         |
| DER-02 | Physical stickers — wordmark + Sparkles bug, send to early adopters    | Print                    | B · A           |
| DER-03 | Pitch deck (16:9 + 4:5) — for press / podcast guesting                  | Slide deck               | — · press       |
| DER-04 | Slide deck for conference CFPs (DevOpsDays EU, State of Open Con, FOSDEM) | Slide deck             | O · A           |
| DER-05 | RSS → mailing-list Cloudflare worker                                    | Infra                    | — · all         |
| DER-06 | Sonic brand — 2s audio mark for video opens                             | Audio                    | — · all         |

### 3.2 Honest gaps to close

These are things we intentionally do NOT have today that a reader or
customer might expect — we should decide when to build them, not if.

- **No customer testimonials from real paying users yet.** The marketing
  site now uses maintainer/public-board framing. Replace with real
  quotes as soon as three paying hosted customers agree to be named
  (target T+60).
- **No SOC 2 / ISO 27001 attestation.** Addressed honestly in `/faq` and
  `/security`. Do not invent.
- **No photography of team or customers.** Use typographic + product-screen
  compositions until the brand earns a real photo library
  (`../identity.md` §7 phase 2).
- **No podcast appearances yet.** Pitch after YT-001–YT-004 land —
  Latent Space, The Pragmatic Engineer, Changelog, Self-Hosted.
- **No translations beyond EN/IT.** Deliberate per `../foundation.md` §10.

---

## 4. Retired / deleted (for the record)

Things that were in the old brand folder and have been explicitly
removed. Anyone scanning git blame should see these deletions
acknowledged here so the intent is clear.

| Removed                                | Why                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| `docs/brand/instagram-reel.md`         | One reel brief is not a campaign. Superseded by `campaign.md` + `content-calendar.md`. |
| `docs/brand/reels/001-open-source/`    | Single-reel render folder. Video masters now live under `apps/studio/output/` and ship to `apps/marketing/public/studio/`. |
| Fake team section (18 people, 6 countries) | Contradicted `foundation.md` §13. Replaced with Davide + Niccolò + an open contributor slot. |
| Fake testimonials (Aisha / Marcus / Yuki) | Contradicted `foundation.md` §9 (no fabricated social proof). Replaced with honest maintainer framing pending real quotes. |
| SOC 2 Type II "audited annually" claim | Not true today. Replaced with an honest explanation of what we have vs. what's on the roadmap. |
| Footer "Made in Milan, Berlin and San Francisco" | Team is in Milan. Replaced with an honest Milan-only footer. |
| "Talk to sales" CTA                    | Banned phrase per `foundation.md` §9. Replaced with "Read the source". |
| Vanity stats ($1.2B, 47 countries, 4,800+ teams) | Not real. Replaced with honest labels (GitHub stars, merged PRs, public commits) that we'll wire to actual numbers. |

---

## 5. How to use this file

1. **Before producing anything**, claim the ID here in a PR title or
   commit message. If the item isn't here, add it before starting.
2. **While producing**, link the draft in the row — Figma link, WIP
   branch, a `wip/` path in the repo.
3. **When done**, flip the row to `Ready`, note the published URL, and
   update `content-calendar.md` if the schedule changed.
4. **After publishing**, capture one sentence of what we learned
   underneath the row. Those notes feed the monthly retrospective in
   `marketing/retrospectives/`.

---

_This file lives at `docs/brand/marketing/content-backlog.md`. Living
document — every PR can add/remove rows. Treat it like a sprint
backlog: ruthless about what's P0, realistic about what's P2._
