# Pulse HR — Marketing Campaign Plan

The master campaign for launching Pulse HR into public view and
building distribution on four platforms: **LinkedIn**, **Product Hunt**,
**Instagram**, **YouTube**.

Written April 2026 by Davide (with Claude). Living document — edit as
the campaign evolves, flag changes in commit messages. Where this file
disagrees with `../foundation.md` on voice, positioning or values,
`foundation.md` wins. Where it disagrees with `../identity.md` or
`../aesthetic.md` on visual execution, those win.

---

## 1. The one-screen brief

**Who we are.** Pulse HR — open-source, modular HR software. Built by
two frontend-fluent developers in Milan, in public, for people who hate
their current HR tool.

**Primary hero line.** _HR software for people who hate HR software._

**Subtitle (three-pillar stamp).** _Open. Transparent. Built by the
people who use it._

**Promise.** Source on GitHub. Roadmap public. Changelog public. Prices
public. Self-host on your own infra, or run hosted — no sales call to
see the product, no proprietary export, no lock-in.

**Anti-promise.** No `book a demo`. No `AI-powered`. No `trusted by
Fortune 500`. No fabricated social proof. No paid-only modules in the
open-source tier. No enterprise sales org. Ever.

**The marketing thesis in one line.** We don't buy distribution — we
publish our way into it. Every post, every commit, every reel exists to
turn lurkers into users, users into self-hosters, self-hosters into
contributors, and contributors into the community that makes Pulse
impossible to displace (see `../foundation.md` §8 — the moat is the
stack, not any single trick).

---

## 2. Goals (what "it worked" looks like)

Grounded in `../foundation.md` §12. Time horizon: the next **90 days** on
launch, **12 months** on growth.

### 90-day launch goals

| Metric                                            | Target   | Why it matters                                                  |
| ------------------------------------------------- | -------- | --------------------------------------------------------------- |
| GitHub stars on `davide97g/pulse-hr`              | 250      | Proxy for OSS distribution flywheel starting to spin.           |
| Self-submitted Hacker News front page (top 30)    | 1        | Validates that one of the pillars landed with the dev audience. |
| Inbound PRs merged from non-maintainers           | 5        | Evidence that "built by the people who use it" is more than copy. |
| Hosted trial signups                              | 50       | Funnel baseline — honest conversion rate becomes measurable.    |
| Product Hunt launch placement                     | Top 10   | Acceptable ceiling for an OSS B2B tool on launch day.           |

### 12-month growth goals

| Metric                                   | Target | Why                                                      |
| ---------------------------------------- | ------ | -------------------------------------------------------- |
| GitHub stars                             | 500    | Foundation §12 — escape velocity in the OSS loop.        |
| Self-host telemetry opt-ins (anonymous)  | 50     | Proxy for real self-host deployments running in the wild. |
| Paying hosted customers                  | 30     | Revenue floor that makes the two-person model sustainable. |
| Guest posts published                    | 12     | One editorial source of content, paid at €400/piece.      |

### Metrics we deliberately do **not** chase

Generic "traffic". Keyword-volume chases. DA scores. Impressions for
impressions' sake. Engagement-seconds. Follower counts without PR
follow-through. `../foundation.md` §12 covers this.

---

## 3. The four narrative pillars

Every asset lands against **one** pillar. Never stack. Pillars map back
to `../foundation.md` §5.1 / §5.5 / §5.2 / §5.6.

### Pillar 1 — Open

**The claim.** The source is on GitHub under FSL-1.1-MIT. Read every
line, run it yourself, fork it if we let you down. In two years it
converts to plain MIT — automatic, non-negotiable.

**Proof points you can show.**

- Link to `github.com/davide97g/pulse-hr` in every asset.
- LICENSE + NOTICE files in the repo.
- `bun install && bun run dev` clip — clone-to-running in under 60 s.
- Public Helm chart + Terraform modules under `docs/self-hosting.md`.

**Phrases that live here.** "Read the source." "Fork if we let you down." "Your HR platform, not ours."

**Banned phrases when talking Open.** "AI-powered." "Best-in-class." "Source available" alone without naming the license. "Free tier" without explaining the self-host path.

### Pillar 2 — Transparent

**The claim.** Roadmap public. Changelog public. Prices public. Commits
public. Screw-ups public. We build with the door open and that
includes the stuff we got wrong.

**Proof points.**

- `/roadmap` and `/changelog` pages on `pulsehr.it`.
- GitHub Discussions as the feedback board.
- Monthly public metrics update (stars, PRs, signups, MRR) published as a blog post.
- Public postmortems when something breaks — even when it's embarrassing.
- `/vs` page that includes our losses, not just our wins (`../foundation.md` §10).

**Phrases that live here.** "Shipped in public." "Screw-ups and all." "Every commit has a story."

**Banned when talking Transparent.** "Industry-leading." Hedging about pricing. "Coming soon" without a date. Any metric we can't produce the SQL for.

### Pillar 3 — Yours

**The claim.** Your data, your infra, your exit. Self-host with one
command. Export everything in a clean format, any time. Leaving is easy
— that's the point.

**Proof points.**

- The export button. Literally film it. Click → ZIP of everything.
- `bun install` clone-and-run under a minute.
- Docker / Helm / Terraform published, not "coming soon."
- Anonymous telemetry opt-in; schema documented at `pulsehr.it/security`.
- DPA signed on sign-up, sub-processors listed publicly.

**Phrases that live here.** "Your data, your infra." "One command to stand it up." "Export in a click."

**Banned when talking Yours.** "Hosted in the cloud" without specifying which cloud + regions. Vague "enterprise-grade security." SOC 2 until we actually have it (see `../foundation.md` §9 on honesty).

### Pillar 4 — Built by the people who use it

**The claim.** The roadmap is shaped by pull requests, not product
managers. The maintainers use Pulse for their own work every day.
"Feature request" and "pull request" are two paths to the same roadmap.

**Proof points.**

- Contributor credits in every changelog entry.
- Recorded screen of a real PR being reviewed end-to-end.
- Davide + Niccolò signing commits, bylines on posts.
- The commessa feature — the Italian services-firm concept baked in because the maintainers needed it for their own day jobs.
- "Dogfood log" blog post category — what broke when we used Pulse on ourselves this month.

**Phrases that live here.** "Built by the haters." "Shaped by PRs." "If a friction lasts a week, it gets fixed."

**Banned when talking Built-by.** "Community-driven" in the abstract. "We love our users" platitudes. Fake testimonials (`../foundation.md` §9).

---

## 4. Targets — who we're talking to

Three concentric rings from `../foundation.md` §6, translated into
marketing audiences.

### Target A — Developer contributor (inner ring)

**Who.** Frontend-fluent developers at services firms and small tech
teams, 10–200 people. They've suffered BambooHR / Factorial / Personio
and can install Pulse themselves. EU-first, English-fluent.

**Where they are.** GitHub, Hacker News, Lobsters, r/selfhosted, r/sysadmin,
LinkedIn technical feeds, YouTube dev channels, Twitter/X engineering circles.

**What they want from us.** A readable codebase, a visible maintainer,
honest posts about what broke and why, a clear contribution workflow, a
fair license.

**Primary pillars.** Open + Built by the people who use it.

**Primary assets.** Engineering-notes blog posts. Codebase tour videos on
YouTube. GitHub README. LinkedIn posts on the two-person agent-driven
build.

**What NOT to do.** Sell to them. They don't buy. They evangelize. Treat
them like senior engineers explaining work to other senior engineers
(`../identity.md` §6).

### Target B — People ops / HR / Finance buyer (middle ring)

**Who.** People-ops, HR, or finance lead at a services firm (20–200) or
small tech team (10–100), EU-first. They won't fork the repo, but they
feel the pain of their current tool every week.

**Where they are.** LinkedIn People Ops / HR groups, EU-focused HR
newsletters, Product Hunt on launch day, the `/vs` page when Googling
"BambooHR alternatives."

**What they want from us.** A product they can actually use without
training. A credible migration path from their current tool. Someone
who answers email the same day. Transparent pricing they can expense
without approval.

**Primary pillars.** Yours + Transparent.

**Primary assets.** LinkedIn case studies. `/vs` comparison pages.
Migration guides. Instagram carousels that show the actual product UI.
Product Hunt launch card + first-100-comments playbook.

**What NOT to do.** Pretend we have a customer-success team. Hide the
prices. Say "book a call" anywhere. Over-index on dev terminology
("commit", "PR", "SDK") in the hero of pages aimed at this audience.

### Target C — Open-source-curious lurker (outer ring)

**Who.** Open-source-curious founders, ops-minded engineers, people who
read `/changelog` pages for fun. They may never use Pulse directly —
they'll tell a friend who does.

**Where they are.** Dev Twitter/X, Instagram for the aesthetic cut, YouTube
long-form, newsletters (Bytes, DevTools Digest, Pragmatic Engineer).

**What they want from us.** Stories. Voice. The making-of. Posts about
the license decision, the two-person agent-driven workflow, the choice
of FSL over AGPL, the commessa concept as a domain story.

**Primary pillars.** Transparent + Built by the people who use it.

**Primary assets.** YouTube long-form (the "building in public" meta
content). Instagram static + reel aesthetics. LinkedIn thought pieces
from Davide and Niccolò.

**What NOT to do.** Convert-hammer them. They're the soil. Write for them
even when they don't convert, `../foundation.md` §6.

---

## 5. The pillar × target × platform matrix

Every single asset we ship slots into **one** cell. If it spans two
cells it's really two assets — don't shortcut.

|                            | LinkedIn                                     | Product Hunt                                 | Instagram                                    | YouTube                                       |
| -------------------------- | -------------------------------------------- | -------------------------------------------- | -------------------------------------------- | --------------------------------------------- |
| **Open** · dev (A)          | "Why we chose FSL over AGPL" thought piece   | Launch card: "read the source" CTA           | Carousel: LICENSE header → 2-yr convert plan | Long-form: codebase tour (10-15 min)          |
| **Open** · buyer (B)        | "Your HR data was never a black box" post    | Featured as "the open alt to BambooHR"       | Reel: `git clone` → app running in 60s       | Short: "what open source actually means for you" |
| **Open** · lurker (C)       | Davide essay: "what building in public taught me about OSS licensing" | Maker comment thread on FSL / license choice | Static: the FSL poem (license text, big type) | Vlog: decision log from our OSS licensing week |
| **Transparent** · dev (A)   | Postmortem post on an outage we just had      | Launch-day transparency thread                | Carousel: our monthly metrics dashboard       | Long-form: "reading a pull request end-to-end"  |
| **Transparent** · buyer (B) | `/vs` comparison walkthrough                   | "See what we're bad at" link in description | Reel: live-typing the changelog commit       | Short: screen record of changelog page scroll |
| **Transparent** · lurker (C)| Niccolò essay: "the metrics we track publicly vs. the metrics we don't" | Monthly revenue thread | Static: "stats you won't see on our homepage" | Vlog: monthly public-metrics update            |
| **Yours** · dev (A)          | Self-host guide thread                        | "Works offline, PWA, self-hostable" featured in tagline | Carousel: Docker/Helm/Terraform options      | Long-form: self-host walkthrough, Docker → Helm |
| **Yours** · buyer (B)        | "Export button demo" (actual gif)             | "No lock-in, ever" as launch headline        | Reel: click export → ZIP download cinematic | Short: "leave Pulse in 90 seconds" demo       |
| **Yours** · lurker (C)       | "Why we made leaving Pulse easy on purpose"   | Data-portability thread                      | Static: "exit door" concept art              | Vlog: "the day I migrated off Pulse to prove the export worked" |
| **Built-by** · dev (A)       | Contributor spotlight post                    | First 100 comments = contributor credits     | Carousel: "an afternoon of a real PR"        | Long-form: "landing a PR in this codebase"    |
| **Built-by** · buyer (B)     | Davide/Niccolò day-in-the-life from a services firm | Maker story video pinned at top | Reel: the commessa concept in 15s            | Short: why `commessa` exists in our domain model |
| **Built-by** · lurker (C)    | "The two-dev agent-driven workflow" narrative | Launch-day AMA on the two-person cadence     | Aesthetic: founder-shot of the workspace      | Vlog: a week with Claude Code / Codex         |

Use this matrix as the gating question on any proposed asset: **which
pillar × which target × which platform?** Three clicks. If you can't
answer all three in one sentence, the asset isn't ready.

---

## 6. Platform playbooks

### 6.1 LinkedIn

**Why it matters for Pulse.** LinkedIn is where target B (the buyer)
scrolls every day, where target A (the dev) signals career identity,
and where founder-authored content still out-performs paid social for
B2B consideration. It's the cheapest high-quality distribution channel
we have.

**Who posts.** Three accounts, three registers:

- `@pulsehr` company page — product updates, changelog digest, launches. Twice a week.
- `@davide-ghiotto` personal — building-in-public narrative, decisions, essays. Once or twice a week, varying length.
- `@niccolo-naso` personal — engineering deep-dives, code posts, migration stories. Once a week.

**Format cadence.**

| Format                      | Frequency           | Use for                                                                              |
| --------------------------- | ------------------- | ------------------------------------------------------------------------------------ |
| Short post (≤ 200 words)    | 3–4 per week        | A specific commit, a screenshot, a number. One pillar. One italic word in the opener. |
| Long post (400–900 words)   | 1–2 per week        | Essays: licensing, commessa, building-in-public, postmortems.                        |
| Carousel (6–10 slides, PDF) | 2 per month         | Product walkthroughs, comparison vs. BambooHR, self-host steps.                      |
| Native video (30–90s)       | 1 per week          | Screen captures of the product, repurposed from YouTube Shorts.                       |
| Poll                        | 1 per month max     | Real question we actually want the answer to — not engagement bait.                  |

**Voice rules on LinkedIn.**

- Open every long post with one sentence that could stand alone as a tweet.
- Name competitors explicitly. "Rippling", "Deel", "BambooHR" — never "a legacy HRIS."
- End with a concrete link: a commit SHA, an issue, a page on the marketing site. Not "what do you think?"
- Never use the word "thrilled." Never use `🚀`. Never hashtag-dump at the bottom (max 3 hashtags, relevant to the post).
- First-person plural ("we") for company posts. First-person singular ("I") for Davide/Niccolò personal.

**What to avoid.**

- "Book a demo" CTAs.
- Screenshots with the branding cropped out.
- Engagement-bait openers ("Hot take: most HR software is broken. Here's what we learned:" — no).
- Reposting the same post from the personal accounts with tiny edits.

### 6.2 Product Hunt

**Why it matters.** One of the few launch moments left in B2B that still
drives a compounding distribution spike. Good for the buyer (target B)
and a vanity boost for the dev (target A) that the maintainers can
actually use to recruit contributors.

**Launch day positioning.**

- **Headline (Product Hunt's 60-char):** "HR software for people who hate HR software."
- **Tagline:** "Open-source, modular HR. Read the source. Run it yourself. Export any time."
- **Gallery:** 5 screens + 1 hero video. Order — hero reel (15s), `/` home, `/pricing`, `/vs`, `/roadmap`, `/changelog`.
- **Maker story (the pinned comment):** Three paragraphs from Davide. Why we built it (origin from `../foundation.md` §4). What's different about being two devs with Claude Code. An invitation to `github.com/davide97g/pulse-hr` with a single star ask, no drama.
- **First-100-commenters playbook:** Every commenter gets a personal, non-templated reply within the first 6 hours — Davide handles those manually. No emoji spam. No "thanks!". Answer the actual question.

**Pre-launch (T-minus 14 days).**

- Seed the hunter relationship. Ship a "following" update twice in the two weeks before launch.
- Build the teaser page on `pulsehr.it/launch` — single email capture, counts down the days.
- Line up three LinkedIn posts + one Hacker News submission for the morning of launch (H-0, H-4, H-8).
- Ask 20 early self-hosters to post their honest experience in the comments. Not to upvote — to comment.

**Launch day (T-0, PT timezone).**

- Post at 00:01 PT. Davide and Niccolò both online from hour 0 for the first 6 hours.
- Single launch tweet / X post from `@pulsehr` linking to PH, no threadjacking the comments.
- LinkedIn launch post from Davide + from the company page, 15 min apart.
- Hacker News submission by Davide at H+2 ("Show HN: Pulse HR — open-source, self-hostable HR"). Not earlier (PH is the lead).
- Instagram story drop — one frame of the PH card, one of the hero reel, one of the contributor invite.

**Post-launch (T+1 to T+30).**

- PH "Maker's journal" updates — twice, describing what we learned. Voice honest, not braggy. Include the GitHub star count and the specific feedback that changed the roadmap.
- Write the "I shipped on Product Hunt and here's the numbers" post at T+14, publish to blog + LinkedIn. Every number real. Include what didn't work.

**What to avoid.**

- "We're humbled" openers.
- Upvote-trading from accounts that clearly never used the product.
- Discount codes as a launch mechanic. (Our pricing is public; there's nothing to discount without lying about the list price.)

### 6.3 Instagram

**Why it matters.** Instagram is target C (lurker) and target B (buyer)
territory. It's where `../aesthetic.md` direction pays off — the
dark-translucent-lime visual language reads as "serious craft, not a
SaaS ad", which is what we want.

**Content mix (weekly).**

| Format             | Count / week | Example                                                                              |
| ------------------ | ------------ | ------------------------------------------------------------------------------------ |
| Static (feed)      | 2            | One italic word + one lime dot + ink background. The brand `'s` signature composition. |
| Carousel           | 1            | 6–8 slides. "What open source actually means for your HR data." Swipe-friendly pacing. |
| Reel (9:16 video)  | 1            | 12–20 s. Screen capture with burned-in Geist captions. Driven off `apps/reel/` output.  |
| Story (ephemeral)  | 3–5          | Day-in-the-build fragments, behind-the-scenes, PR merges, commit diffs.                 |

**Motion rules.** See `../aesthetic.md` §2.6 — one signature motion
(pulse-dot), three supports. Instagram posts inherit. Burned-in Geist
captions on every reel — auto-captions undermine the voice.

**Hashtag discipline.** Max 5. The relevant ones — `#opensource`,
`#hrsoftware`, `#selfhosted`, `#hris`, `#builtinpublic`. Never
generic-stack hashtags. Put hashtags in the first comment, not the
caption body.

**What to avoid.**

- Quotes-over-sunset-stock photography. Anything that could come from a generic SaaS Canva template.
- Meme-format posts about "HR software be like..." — we don't mock. We propose.
- Cross-posting LinkedIn-shape posts (paragraphs of text) onto Instagram static without re-design.
- Reels with a generic royalty-free "corporate upbeat" track (see `../identity.md` §9).

### 6.4 YouTube

**Why it matters.** YouTube is evergreen distribution — the "how I built
Pulse with Claude Code" video posted this quarter still drives GitHub
stars next year. For target A and target C, long-form video is the
single highest-leverage investment we can make.

**Two formats, two purposes.**

- **Shorts (≤ 60s).** Cross-post from Instagram reels. Same master, different descriptor. 2 per week. Focus on the product (screen captures) or the moment of a commit.
- **Long-form (8–25 min).** One per month. The hero content of the channel. Each one addresses a single question from the matrix in §5. Example titles and cadence:

| Month | Title                                                                 | Target | Pillar        |
| ----- | --------------------------------------------------------------------- | ------ | ------------- |
| 1     | "Building Pulse HR: the codebase tour (React + Bun + Hono)"           | A       | Open          |
| 2     | "Self-hosting Pulse HR on Docker, Helm, and Terraform"                | A      | Yours         |
| 3     | "How we track monthly metrics in public (stars, PRs, MRR)"            | A/C    | Transparent   |
| 4     | "A day in Pulse HR: timesheets, commessa, payroll, all keyboard-first" | B      | Built-by      |
| 5     | "Choosing FSL over AGPL for Pulse HR: the licensing decision log"      | A/C    | Open          |
| 6     | "Two developers shipping HR software with Claude Code (and nothing else)" | C     | Built-by      |

**Production principles.**

- DIY production, tight edit. Reference `../design-references.md` §14 — a single engineer, a laptop, a microphone. No production crew.
- No background music tracks under voice — only in silent interstitials between voiceover beats. `../identity.md` §9.
- Chapters in the description, timestamp each pillar transition.
- End card: "Star the repo · link in description" — not "Smash that subscribe button."
- Thumbnail rules: ink background, one italic Fraunces word, one lime dot. The same system that makes every other Pulse asset recognizable.

**What to avoid.**

- AI voice-over. Davide or Niccolò record their own. If neither can, we don't ship the video.
- Jump-cuts every 2 seconds to pretend the video is shorter. Let beats breathe.
- Sponsored spots / "this video is brought to you by" inserts — ever. Pulse is the product we're selling.

---

## 7. What we showcase (and the order we showcase it in)

The product has many surfaces. For the launch campaign we showcase
them in a deliberate order so the story compounds. Each item has a
single public "proof" you can link to.

1. **The license.** LICENSE file + NOTICE. Proof: `github.com/davide97g/pulse-hr/blob/main/LICENSE`.
2. **The `git clone` demo.** From terminal to running app in ≤ 60s. Proof: a Reel, a YouTube Short, and a screen recording embedded on `pulsehr.it/open-source`.
3. **The roadmap page.** What we're building next, in public. Proof: `pulsehr.it/roadmap`.
4. **The changelog page.** What we just shipped. Proof: `pulsehr.it/changelog`.
5. **The prices.** Per-employee, public, no gate. Proof: `pulsehr.it/pricing`.
6. **The export button.** Click → full ZIP of your data. Proof: a 12-second reel + a YouTube Short.
7. **The self-host path.** `docker compose up`, Helm chart, Terraform. Proof: `docs/self-hosting.md` + long-form YouTube.
8. **The command bar (⌘J).** Keyboard-first, no LLM call, local intent parser. Proof: a focused Reel + a YouTube Short.
9. **The commessa concept.** Italian finance term baked into the domain model. Proof: an engineering-blog post + a Reel that translates it.
10. **The contributor path.** From reading the README to landing a PR in an afternoon. Proof: a YouTube long-form + pinned blog post + a LinkedIn thread.

Every asset we ship is the "show" part of one of these ten. If a draft
isn't showing one of these ten, it probably isn't earning its slot —
interrogate why before publishing.

---

## 8. The value to expose (what we want them to feel)

Three emotional beats, in order, as a reader/viewer moves through our
content:

1. **Relief.** "Someone finally said the thing I've been thinking — HR software is a slog, I don't have to pretend anymore."
2. **Recognition.** "The maintainers are like me — they had the same day-job pain, they just built their way out."
3. **Invitation.** "I could use this. I could fork this. I could contribute. The door is actually open."

Every pillar supports all three beats, but each leans harder on one:

- **Open → Invitation.** Reading the source is itself an invitation.
- **Transparent → Recognition.** "They track the same numbers I would, in public."
- **Yours → Relief.** "I can leave whenever I want. That's new."
- **Built-by → Recognition + Invitation.** "They're two devs. I'm a dev. We could talk."

When drafting any asset, ask: **which beat am I aiming for, and does the
pillar I chose deliver it?** If the copy says `Open` but the emotional
beat it triggers is `Relief`, you picked the wrong pillar — or the wrong
words.

---

## 9. Content strategy — the loop

The four pillars × four platforms is a grid. The content loop is what
moves assets through it on a sustainable cadence.

### 9.1 Origination

Two sources feed the pipeline:

- **Real product events.** A commit, a shipped feature, a postmortem, a merged PR, a monthly metrics update. These are the **must-publish** beats — they exist whether marketing touches them or not.
- **Editorial themes.** The four tracks from `CONTENT_STRATEGY.md` — OSS mechanics, commessa ops, agent-native HR, engineering notes. Two long-form posts per month rotate through these.

Everything else is atomized from those two sources.

### 9.2 Atomization

One piece of real work yields many assets. Example — a new feature ships:

1. Code merges to `main`. Commit posted to changelog.
2. Davide records a 90s screen capture of the feature working. This becomes:
   - A YouTube Short.
   - An Instagram Reel.
   - A LinkedIn native video.
3. He writes one LinkedIn short post (≤ 200 words) linking to the changelog entry.
4. He writes one Twitter/X thread of 5–8 posts.
5. Niccolò writes a technical blog post on the how of the feature (medium length, ~600 words).
6. That blog post gets atomized into:
   - An Instagram carousel (6–8 slides).
   - A LinkedIn long post.
   - A Hacker News submission, if the feature is HN-shaped.

**One feature → 10 assets.** That's the loop in the strong form. The
asset backlog (`content-backlog.md`) tracks which have been produced
for each recent feature.

### 9.3 Cadence (weekly)

| Weekday | LinkedIn                                  | Instagram                            | YouTube               | Other                      |
| ------- | ----------------------------------------- | ------------------------------------ | --------------------- | -------------------------- |
| Mon     | Long post from Davide                      | Static (signature composition)        | —                     | Newsletter (every 2nd Mon) |
| Tue     | Company page short post (product update)   | Story × 2                            | Short                 |                            |
| Wed     | Niccolò technical short or carousel        | Reel                                 | —                     |                            |
| Thu     | Company page carousel                      | Carousel                              | —                     | Blog post (1 per 2 weeks)  |
| Fri     | Davide reflection / weekly recap           | Story × 2                            | Short                 |                            |
| Sat     | —                                         | Story (curator's pick from the week) | —                     |                            |
| Sun     | —                                         | —                                    | Long-form (monthly)   |                            |

The monthly long-form YouTube slots into the Sunday of weeks 1 or 3.
This gives the team the whole week before to edit and caption it.

### 9.4 Measurement

Post-level metrics aren't the point. We review the pipeline monthly
against the goals in §2. The single most important signal is **whether
people who showed up at a post ended up at `github.com/davide97g/pulse-hr`**.

Each post's "success criterion" is stated at draft time — e.g. "this
carousel is successful if it drives ≥ 20 clicks through to the repo."
If we don't hit that 3 months in a row across a pillar, the pillar's
treatment is broken, not the individual post — revisit at that level.

---

## 10. Launch sequence — the first 90 days

Three phases. Each phase moves the plan from zero to flywheel.

### Phase A — T-28 to T-0 (soft-launch, audience warm-up)

Goal: have ~500 people who will see the launch land, not cold.

- Marketing site live at `pulsehr.it` with the foundation copy deployed (done in this commit).
- Hero reel re-rendered off `apps/reel/` and published.
- LinkedIn company page active, 8 posts over 4 weeks.
- Davide: 4 long posts on building-in-public. Niccolò: 2 technical posts.
- Instagram account seeded with 12 posts (4 carousels, 4 stills, 4 reels) before launch day.
- Product Hunt profile complete, "upcoming" page live at T-14.
- YouTube channel: codebase tour + self-host walkthrough shipped (first two long-forms) so the channel isn't empty on launch day.

### Phase B — T-0 to T+7 (launch week)

Goal: hit 250 GitHub stars and Product Hunt top 10.

- T-0: Product Hunt launch at 00:01 PT.
- T-0 +2h: Hacker News "Show HN" submission.
- Daily LinkedIn posts from all three accounts for the full week.
- 1 reel per day on Instagram (7 total), rotating pillars.
- Davide hosts a "live Q&A" on X Spaces or LinkedIn Live mid-week.
- End of week: public launch-week retrospective post — every number real.

### Phase C — T+8 to T+90 (flywheel phase)

Goal: convert momentum into recurring content + real users.

- Weekly cadence from §9.3 kicks in.
- Monthly metrics update ships at T+30, T+60, T+90.
- Two YouTube long-forms shipped in the quarter (on top of the two pre-launch).
- First guest posts land — target 3 by T+90.
- First community PRs merged — target 5 by T+90.
- First paying hosted customers — target 20 by T+90 (half of the 90-day signup target).

Each phase ends with a one-paragraph retrospective committed to
`marketing/retrospectives/<phase>.md`. If we miss a goal, we say so, in
public, in the retrospective.

---

## 11. Governance — who owns what

This is a two-person team plus Claude. Ownership needs to be clean so
work doesn't sit.

| Surface                         | Primary  | Backup   |
| ------------------------------- | -------- | -------- |
| `pulsehr.it` copy + marketing app | Davide   | Niccolò  |
| Blog posts (editorial)           | Davide   | Niccolò  |
| Engineering deep-dives           | Niccolò  | Davide   |
| LinkedIn `@pulsehr`              | Davide   | Niccolò  |
| Instagram `@pulsehr`             | Davide   | (TBD)    |
| YouTube `@pulsehr`               | Davide   | Niccolò  |
| Product Hunt maker comms         | Davide   | Niccolò  |
| Reel production (`apps/reel/`)   | Davide   | Niccolò  |
| GitHub repo README + discoverability | Niccolò | Davide   |
| Community PR reviews             | Niccolò  | Davide   |

Niccolò's public presence is open-question territory (`../foundation.md` §15).
Defaults above assume he's willing to co-sign on technical content and
engineering deep-dives; if that changes, the backup becomes primary on
those rows.

---

## 12. Honest limits (what this plan doesn't solve)

In the spirit of `../foundation.md` §9 — name what we can't do.

- **No paid ads.** Zero budget allocation for paid social, paid search, or sponsored newsletters in the first 90 days. We earn attention or we don't have it. Revisit only if the organic loop is clearly flat after T+90.
- **No influencer / creator deals.** Same reason. If a YouTuber wants to cover Pulse because they actually use it, we'll credit generously — but we don't pay for the mention.
- **No translation beyond EN/IT for now.** `../foundation.md` §10 — Italian-friendly for commessa / EU payroll content, everything else English-first. French, German, Spanish land when the product earns a reason.
- **No SEO sludge.** The programmatic SEO layer from `CONTENT_STRATEGY.md` stays paused until we have 12 flagship posts. Quality beats volume.
- **No "AI-powered Pulse" narrative.** Agent-driven development is how we build (`../foundation.md` §5 note). It shows up in engineering posts, not homepage hero copy.
- **No enterprise sales motion.** If and when an enterprise inbound arrives, we reply honestly — but we're not staffing a BDR. `../foundation.md` §9.
- **No VC-shaped vanity metrics.** We will not lead with "1,000 users!" when we have 50 real ones. We will not publish a team photo with 18 faces when we are two. (The marketing app has been corrected in the commit alongside this plan.)

---

## 13. Open questions

Same honesty style as `../foundation.md` §15. Called out so we don't
paper over them.

- **Twitter/X.** Listed above as an atomization target (threads) but we
  haven't decided whether `@pulsehr` lives there full-time. Decision
  point: T+30, after Product Hunt data lands.
- **Niccolò public presence.** Co-byline yes/no on posts; personal
  LinkedIn activity level. Follows `../foundation.md` §15.
- **Podcast presence.** Should we pitch ourselves onto Latent Space, The
  Pragmatic Engineer, Changelog, or build our own? Decision: after the
  first three long-form YouTubes land, pitch or don't.
- **Newsletter.** The distribution loop in `CONTENT_STRATEGY.md`
  assumes a bi-monthly RSS → mailing-list send. Platform (Postmark?
  Buttondown?) undecided. Pick by T+14.
- **Community forum.** GitHub Discussions is the feedback board today.
  If community volume grows, moving to Discourse or a custom surface is
  a T+90 decision.

---

## 14. References used to build this plan

- `../foundation.md` — the conceptual brand. Every positioning choice here traces back.
- `../identity.md` — the visual primitives (color, type, motion) + voice rules.
- `../aesthetic.md` — the 2026 feel direction (quiet, dark, translucent, lime as spark).
- `../design-references.md` — the 15-brand moodboard for creative work.
- `../../../CONTENT_STRATEGY.md` — the content pillars, publishing discipline, and paid-guest-post model.
- `../../../README.md` + `../../../ARCHITECTURE.md` — product reality (what the product actually does today).
- `apps/reel/` — the Remotion-based video pipeline that turns brand primitives into motion.

---

_This document lives at `docs/brand/marketing/campaign.md`. Paired with
[`content-calendar.md`](./content-calendar.md) (week-by-week schedule)
and [`content-backlog.md`](./content-backlog.md) (TODO list). Changes
here require no approval but should be flagged in the commit message._
