# Cross-posts — Carousel 001

Three cross-posts. Same substance, different shapes. All go up between
17:45 and 18:00 CET on launch day — after the LinkedIn post has had
45 minutes to breathe and the first comments have landed.

Do NOT post these simultaneously with the LinkedIn launch. Each
platform needs to feel like it's hosting the launch, not being told
about it after the fact.

---

## 1. GitHub Discussions — 17:45

**Where:** `github.com/davide97g/pulse-hr/discussions` → **Announcements**
category. If the Announcements category doesn't exist yet, create it
first (repo settings → Discussions → categories).

**Title:**
```
Pulse HR is now on LinkedIn — and yes, the tone is "roast"
```

**Body (paste as-is):**

```
We just published the first thing from the new Pulse HR LinkedIn page.

linkedin.com/company/pulse-hr

The post is a 10-slide carousel about what's wrong with HR software
(approximately everything) and what we're doing about it (this repo).
The tone is sarcastic on purpose — `foundation.md` §10 has the voice
rules if you're curious about the "why."

### If you want to help

- ⭐ Star the repo if you haven't already. GitHub stars are the single
  loudest distribution signal an OSS project has — they show up in
  Hacker News rankings, in comparison posts, and in the "Trending"
  bucket GitHub itself surfaces.
- 👀 Read the carousel and leave a comment on the LinkedIn post. The
  algorithm rewards first-hour dwell time and reply velocity. A real
  comment from someone who's actually read the brand docs is worth
  20 generic likes.
- 🍴 Fork the repo or open a Discussion here if there's a specific HR
  pain we should roast next. The carousel names three incumbents
  (Rippling, Deel, BambooHR) and one behaviour ("book a demo") — but
  we know there are ten more. Which one should carousel 002 hit?

### What we're watching for the next 3 hours

- Comments on the LinkedIn post. We'll reply in real time to anything
  substantive.
- New issues on this repo labelled `feature` — real use-cases we
  hadn't thought of.
- New stars. Target for launch day: 50 new stars in 24 hours. If we
  hit that, the pillar ("Open") lands; if we don't, we try
  "Transparent" next week.

### Also worth reading today

- `docs/brand/foundation.md` — why we built this.
- `docs/brand/marketing/campaign.md` — the 14-section plan the carousel
  is one asset of.
- `docs/brand/marketing/content-backlog.md` — everything else we owe
  ourselves to produce.

If you want to challenge any of the claims in the carousel, please do.
That's how the `/vs` page on the marketing site ends up honest.

— Davide
```

**Why this works.** Github Discussions is where target-ring A lives
(the developer contributor). This announcement does three jobs:
(1) points them at the carousel; (2) gives them something concrete to
do (star / comment / fork); (3) opens the door for the next piece of
content to be co-chosen with the community. All in one post.

---

## 2. X / Twitter — 18:00

**Account:** `@pulsehr` (if it exists; otherwise post from Davide's
personal and re-share from Niccolò's).

**Post 1 (the anchor — 280 chars):**

```
Pulse HR is now on LinkedIn. The first carousel is up.

Open-source HR software. Built by two devs who hate HR software. FSL-1.1-MIT.

Read the source: github.com/davide97g/pulse-hr
Roast us in the comments: linkedin.com/company/pulse-hr
```

**Count:** ~255 / 280. ✓

**Post 2 (reply to the anchor — quote the hook):**

```
The setup, in one slide:

[attach Slide 1 PNG — the hook slide — exported at 1080×1080 from carousel.html via screenshot or from the PDF]
```

**Post 3 (reply to the anchor — the sarcastic one):**

```
Three things we refuse to do:

→ "Book a demo" to see the product
→ "AI-powered" without saying what it does
→ Fake Fortune 500 logos in the testimonials slider

Absolutely bullied into this stance by our own foundation.md §9.
```

**Post 4 (reply — the call):**

```
If you also hate your HRIS, tell us which one and why. We're collecting reasons for a /vs page and we'd rather fill it with real complaints than marketing prose.

github.com/davide97g/pulse-hr/discussions
```

---

## 3. Hacker News — T+1 DAY (Saturday morning)

**Do NOT submit to Hacker News on launch Friday.** HN rewards Monday–Thursday
mornings PT. Saturday morning PT is our second-best window.

**Submission title:**

```
Show HN: Pulse HR – open-source, self-hostable HR software (FSL-1.1-MIT)
```

**Top comment (paste immediately after submitting — HN rewards an
early substantive author comment):**

```
Hi HN — Davide here. Pulse HR is an open-source HR/payroll platform
my co-maintainer Niccolò and I are building in public from Milan.

The honest-brochure version:

• Source on GitHub under FSL-1.1-MIT. Converts to MIT automatically
  after 2 years. Full repo at https://github.com/davide97g/pulse-hr
• Three independent modules (Money / People / Work). Adopt one, skip
  the rest. Public REST API + webhooks on every resource event.
• Keyboard-first — ⌘K for search, ⌘J for a command bar with a LOCAL
  intent parser (no LLM call, no data leaves your tenant, works
  offline).
• Self-host on Docker / Helm / Terraform. Hosted tier coming on
  pulsehr.it — free for the first 5 employees, forever.

We launched on LinkedIn yesterday with a roast-toned carousel
(linkedin.com/company/pulse-hr) if you're curious what the brand
feels like.

What I'd love HN's eyes on specifically:

1. The license choice — we picked FSL over AGPL because we want
   non-competing forks to be frictionless. Documented the reasoning
   at /blog once that post lands next week. Arguments against FSL
   welcome here.
2. The two-person cadence with agent-driven dev (Claude Code, Codex,
   Cowork) — we think it's how we compete with the 50-engineer
   incumbents. Happy to answer how that actually plays out day-to-day.
3. Anything you'd want to see in the repo that isn't there yet.

No analytics funnels on the marketing site. No "book a demo" form.
Prices will be public when we flip the hosted tier on — that's about
2 weeks away.

Thanks for the honest feedback.
```

**Why Saturday morning and not Friday:** HN traffic on Saturday is
smaller in absolute but the front-page dwell-time is longer, AND our
LinkedIn launch-day energy is already competing with itself if we HN
at the same time.

---

## 4. Product Hunt — NOT TODAY

Product Hunt launch is **week 5 of the calendar** (`content-calendar.md`).
Don't pull it forward. If a commenter on LinkedIn asks "why aren't you
on PH yet?" the answer is:

```
Because a launch is a moment, and we want the moment to land on
something real — not on a promise we're still wiring. PH next month.
```

Reminder in `content-backlog.md` §1.2.
