# Content calendar — the first 12 weeks

Week-by-week schedule across **LinkedIn**, **Product Hunt**, **Instagram**,
**YouTube**. Launch-day anchor week is **Week 5** — Phases A/B/C from
[`campaign.md`](./campaign.md) §10 map onto weeks 1–4, 5, 6–12.

Every row below names the piece, the pillar, the target ring, and a
pointer to the asset the piece is made from. If the asset doesn't exist
yet, check [`content-backlog.md`](./content-backlog.md) — it should be
scheduled for production.

**Conventions.** `O / T / Y / B` = the four pillars (Open, Transparent,
Yours, Built-by). `A / B / C` = the audience rings (dev contributor /
buyer / lurker). `✍` = writing; `🖼` = static/graphic; `🎬` = video.

---

## Phase A — warm-up (weeks 1–4)

### Week 1 — "we are live"

| Day | Channel               | Piece                                                             | Pillar · Target | Source asset            |
| --- | --------------------- | ----------------------------------------------------------------- | --------------- | ----------------------- |
| Mon | LinkedIn · Davide     | ✍ Long post: "Building an open-source HR product in public"        | T · C           | new                     |
| Tue | LinkedIn · Company    | ✍ Short: "pulsehr.it is live. read the source."                    | O · A/B         | marketing site + repo   |
| Wed | Instagram             | 🖼 Static: the four-commitment stamp (Open · Transparent · Yours · Built-by) | — · C        | `logo-explorations/`    |
| Wed | YouTube Short         | 🎬 15s vertical cut of hero reel                                   | O · A/C         | `apps/reel/output/social-vertical.mp4` |
| Thu | LinkedIn · Niccolò    | ✍ Short: "the tech stack behind Pulse HR, in 200 words"            | O · A           | `ARCHITECTURE.md`        |
| Fri | LinkedIn · Davide     | ✍ Short: "what we said no to this week"                             | T · C           | anti-positioning §9     |

### Week 2 — "read the source"

| Day | Channel            | Piece                                                                  | Pillar · Target | Source asset                    |
| --- | ------------------ | ---------------------------------------------------------------------- | --------------- | ------------------------------- |
| Mon | LinkedIn · Davide  | ✍ Long post: "Why FSL over AGPL — the licensing decision log"           | O · A/C         | LICENSE + NOTICE                |
| Tue | LinkedIn · Company | 🖼 Carousel: "what open source actually means for your HR data"         | O · B           | new carousel template           |
| Wed | Instagram          | 🎬 Reel: `git clone` → app running in 60s                                | O · A/C         | new — needs production          |
| Wed | YouTube long-form  | 🎬 **Codebase tour (10–15 min)**                                        | O · A           | new — needs production          |
| Thu | Instagram          | 🖼 Static: the LICENSE header in big Fraunces                           | O · C           | `logo-explorations/`            |
| Fri | LinkedIn · Niccolò | ✍ Short: "reading a PR in the Pulse codebase"                           | B · A           | real PR link                    |

### Week 3 — "see what we ship"

| Day | Channel            | Piece                                                       | Pillar · Target | Source asset                    |
| --- | ------------------ | ----------------------------------------------------------- | --------------- | ------------------------------- |
| Mon | LinkedIn · Davide  | ✍ Long post: "The monthly metrics we track in public"       | T · A/C         | metrics doc (to create)         |
| Tue | LinkedIn · Company | ✍ Short: pointer to `/changelog` — what we shipped this week | T · A/B         | marketing site                  |
| Wed | Instagram          | 🎬 Reel: live-typing a real changelog entry                  | T · C           | new — screen capture            |
| Wed | YouTube Short      | 🎬 Scroll of `/changelog` page (30s)                         | T · B           | marketing site                  |
| Thu | LinkedIn · Company | 🖼 Carousel: "the six proofs of transparency we publish"     | T · B           | new carousel                    |
| Fri | Davide             | ✍ Blog post: "Screw-ups log — March 2026"                    | T · C           | new blog post (editorial)       |

### Week 4 — "your data, your infra"

| Day | Channel               | Piece                                                               | Pillar · Target | Source asset                   |
| --- | --------------------- | ------------------------------------------------------------------- | --------------- | ------------------------------ |
| Mon | LinkedIn · Davide     | ✍ Long post: "We made leaving Pulse easy on purpose"                 | Y · B           | new essay                      |
| Tue | LinkedIn · Company    | 🎬 Native video: the export button clicked, full ZIP (30s)           | Y · B           | new — screen capture           |
| Wed | Instagram             | 🎬 Reel: self-host in a terminal (Docker Compose)                    | Y · A           | new — production               |
| Wed | YouTube long-form     | 🎬 **Self-hosting walkthrough (Docker → Helm → Terraform)**          | Y · A           | new — production               |
| Thu | LinkedIn · Niccolò    | ✍ Short: "the moment we killed proprietary exports"                  | Y · A           | technical post                 |
| Fri | LinkedIn · Davide     | 🎬 Countdown post: "Product Hunt launch next Tuesday"                | — · B/C         | PH assets                      |
| Sat | Product Hunt          | ✍ Final "Following" update with launch date                         | — · B           | PH listing                     |

---

## Phase B — launch week (week 5)

### Week 5 — Product Hunt + Hacker News

| Day | Channel             | Piece                                                         | Pillar · Target | Source asset              |
| --- | ------------------- | ------------------------------------------------------------- | --------------- | ------------------------- |
| Mon | LinkedIn · Davide   | ✍ Short: "tomorrow we launch on Product Hunt"                  | — · B/C         | PH card                   |
| Tue | Product Hunt        | 🎬 00:01 PT launch — hero reel + 5 gallery shots + maker story | All pillars     | PH launch kit             |
| Tue | Hacker News         | ✍ "Show HN: Pulse HR — open-source, self-hostable HR" at H+2   | O · A/C         | repo README               |
| Tue | LinkedIn · Davide + Company | ✍ Launch posts (15 min apart)                          | — · B           | launch thread             |
| Tue | Instagram           | 🎬 Launch reel (pinned) + 3 stories                             | — · C           | PH card + hero reel       |
| Tue | YouTube Short       | 🎬 60s recap of the launch moment                               | — · A/C         | launch footage            |
| Wed | LinkedIn · Niccolò  | ✍ Short: "the stack under the launch — two devs + Claude Code"  | B · A           | engineering post          |
| Wed | Instagram           | 🎬 Reel: the most-asked Product Hunt comment, answered          | T · B           | real comments             |
| Thu | LinkedIn · Davide   | ✍ "first 48h on PH, every number real"                          | T · C           | launch analytics          |
| Thu | X / LinkedIn Live   | 🎥 Live Q&A (Davide + Niccolò)                                  | B · A/C         | live format               |
| Fri | Instagram           | 🖼 Static: "the PH number next to the star count"               | T · C           | launch data               |
| Fri | LinkedIn · Company  | ✍ Launch-week recap + invite to `/roadmap`                      | T · B           | marketing site            |
| Sun | YouTube long-form   | 🎬 "Launch week, end-to-end — what worked, what didn't"          | T · A/C         | launch footage            |

---

## Phase C — flywheel (weeks 6–12)

From week 6, the weekly cadence in `campaign.md` §9.3 is the default.
The table below lists the **anchor pieces** per week — the thing that
defines the week's content arc. Atomizations (short posts, stories,
Shorts) come off these anchors per the atomization loop.

### Week 6 — "a day in Pulse"

| Day | Channel             | Anchor piece                                                       | Pillar · Target |
| --- | ------------------- | ------------------------------------------------------------------ | --------------- |
| Mon | Blog + LinkedIn     | ✍ "A day in a services firm, on Pulse"                             | B · B           |
| Wed | Instagram           | 🎬 Reel: the `commessa` concept in 15s                              | B · C           |
| Thu | LinkedIn carousel   | 🖼 "6 things our commessa view replaces"                            | B · B           |

### Week 7 — "keyboard-first"

| Day | Channel             | Anchor piece                                                       | Pillar · Target |
| --- | ------------------- | ------------------------------------------------------------------ | --------------- |
| Mon | LinkedIn · Davide   | ✍ "What we don't call AI — the ⌘J command bar, honest label"        | O · A           |
| Wed | Instagram + Short   | 🎬 ⌘J demo: `log 4h on ACME-22` → resolved intent pill              | O · A/C         |

### Week 8 — "contributor spotlight"

| Day | Channel             | Anchor piece                                                       | Pillar · Target |
| --- | ------------------- | ------------------------------------------------------------------ | --------------- |
| Mon | Blog + LinkedIn     | ✍ Contributor spotlight — first merged external PR                   | B · A           |
| Wed | Instagram           | 🖼 Carousel: "an afternoon of a real PR, step by step"              | B · A           |
| Sun | YouTube long-form   | 🎬 "Landing a PR in the Pulse codebase"                             | B · A           |

### Week 9 — "monthly metrics (T+30)"

| Day | Channel             | Anchor piece                                                       | Pillar · Target |
| --- | ------------------- | ------------------------------------------------------------------ | --------------- |
| Mon | Blog + LinkedIn     | ✍ T+30 metrics report — stars, PRs, signups, MRR                    | T · A/C         |
| Wed | Instagram           | 🖼 Static: the four numbers, big, one per slide                    | T · B/C         |
| Fri | Newsletter          | ✉ Bi-monthly digest — goes to the full list                         | — · all         |

### Week 10 — "commessa ops"

| Day | Channel             | Anchor piece                                                       | Pillar · Target |
| --- | ------------------- | ------------------------------------------------------------------ | --------------- |
| Mon | Blog · Davide       | ✍ "Commessa ops for services firms" — editorial long-form           | B · B           |
| Wed | Instagram           | 🎬 Reel: a commessa burn chart changing as hours log in             | B · B           |
| Thu | LinkedIn · Davide   | ✍ Italian-language version of the same post                         | B · IT          |

### Week 11 — "export day"

| Day | Channel             | Anchor piece                                                       | Pillar · Target |
| --- | ------------------- | ------------------------------------------------------------------ | --------------- |
| Mon | Blog · Davide       | ✍ "I exported my entire Pulse account to prove it works"             | Y · C           |
| Wed | YouTube Short       | 🎬 90s export → migration mock                                     | Y · B           |
| Thu | LinkedIn · Company  | ✍ Short + GIF of the export flow                                    | Y · B           |

### Week 12 — "first quarter in public"

| Day | Channel             | Anchor piece                                                       | Pillar · Target |
| --- | ------------------- | ------------------------------------------------------------------ | --------------- |
| Mon | Blog · Davide       | ✍ "90 days of building Pulse HR in public"                          | T · C           |
| Wed | LinkedIn · Davide   | 🎬 Native video: founders on what worked and didn't                 | T · C           |
| Sun | YouTube long-form   | 🎬 "Two devs shipping HR software with Claude Code"                 | B · C           |

---

## Notes on scheduling

- **Time zones.** Post LinkedIn between 08:30–10:00 CET for the EU
  audience. Instagram reels mid-morning and evening. YouTube publishes
  Sunday 18:00 CET (Sunday morning US).
- **Holidays.** Italian calendar. No posts on Ferragosto (August 15),
  December 24–26, January 1. The cadence pauses, not breaks.
- **Rescheduling.** If a commit / feature / metric slips, the anchor
  piece for that week moves, not the cadence. Publish something else —
  a short pointer, a screenshot, a throwback to an earlier commit.
  Silent weeks reset the flywheel; skip-but-not-silent doesn't.

---

_This calendar is advisory — the weekly cadence in `campaign.md` §9.3 is
the real source of truth once Phase C starts. Edit freely as reality
diverges from the plan, flag changes in the commit message._
