# Claude Code prompt — refocus apps/marketing on the new identity

Paste this into Claude Code at the repo root. Self-contained: tells Claude what the new identity is, which files to touch, and which rules are non-negotiable.

---

## Prompt

```
We just refocused the Pulse HR brand identity (May 2026, second pass). The
foundation, the visual identity, the voice rules, the OG cards, the LinkedIn
copy and the supporting marketing docs are all updated under docs/brand/.
The Astro marketing site at apps/marketing has NOT been touched yet — it
still ships with the prior April-2026 positioning. Your job is to bring
apps/marketing in line with the new identity.

## Read first (in this order)

Read these files completely before writing any code. They are the source of
truth:

1. docs/brand/foundation.md — conceptual brand (mission, vision, values,
   audience, voice, business model). The hero, the tone, the anti-positioning
   all come from here.
2. docs/brand/identity.md — category, ICP, pillars, taglines, banned phrases,
   voice rules.
3. docs/brand/aesthetic.md — visual feel (light touch — visual direction is
   unchanged; this confirms what stays).
4. docs/brand/marketing/campaign.md §1, §3, §4 — the four pillars (Employee-
   first as spine; Open, Transparent, Built-by as supporting) and the IC-first
   audience rings.
5. wiki/concepts/target-audience.md — the full primary-persona positioning.
6. wiki/AGENTS.md — product-focus rules (people-first; what's parked).
7. CLAUDE.md (root) — the active-vs-parked surface list.

## The new spine, in one paragraph

Pulse HR is an open-source workspace for the IC dev or designer at a
tech-forward team (20–200 people). Adopted bottoms-up: one IC self-installs,
their team joins, six months later the company that "officially" rolls out HR
tooling finds the choice was already made. The hero is "Your best work is
buried in a Slack thread from March." The mission is "Make your work
impossible to miss." The vision is "The tool the team installs before HR
notices." Fully open source under FSL-1.1-MIT (converts to MIT in two years).
Self-host free; pay us to host. No "enterprise tier with extra features." No
"talk to sales." The demo is the sales call.

## Hard rules

These are non-negotiable. Any draft that breaks them gets thrown out:

1. NO NAMED COMPETITORS. Anywhere. Not in the /vs page, not in feature
   comparisons, not in blog posts, not in OG meta descriptions, not in
   alt text. Not Workday, not Lattice, not 15Five, not Officevibe, not
   CultureAmp, not BambooHR, not Personio, not Rippling, not Deel, not
   anything else. The brand stands on what Pulse is. We describe patterns
   ("the shared doc nobody opens", "the kudos that scrolls off") — never
   logos.
2. NO ROAST / NO HATE / NO COMBATIVE TONE. The April-2026 hero ("HR software
   for people who hate HR software") and its roast-flavoured copy are
   retired. The new voice is opinionated in stance, plain in language —
   quietly opinionated, not strident. We describe what we improve on, not
   what we fight.
3. NO BANNED PHRASES. See identity.md §6: best-in-class, world-class,
   seamless, next-generation, revolutionize, AI-powered, one-stop shop,
   book a demo, trusted by, the leading HR platform, reach out to learn
   more, enterprise-grade, synergy, unlock value, empower your workforce.
4. ENGLISH-FIRST, ITALIAN AS FULL-FIDELITY TRANSLATION. If a headline
   doesn't land in both languages, rewrite the English first. Italian is
   never a different message.
5. ONE ITALIC WORD PER HEADLINE. The italic carries the emotional weight.
   Lime dot at the end of the H1. Pattern is locked in identity.md §5.
6. PARKED SURFACES STAY PARKED. Time tracking, projects, payroll,
   recruiting, documents, marketplace, onboarding workflows, offices,
   announcements, calendar, activities, clients — see CLAUDE.md and
   wiki/AGENTS.md. Don't reintroduce them into marketing copy or
   navigation.

## Files to update in apps/marketing

The Astro site is at apps/marketing/. Start with the inventory:

```
apps/marketing/
├── src/
│   ├── data/         # structured content (landing, features, vs, pricing, ecosystem, roadmap, changelog)
│   ├── i18n/         # en.ts + it.ts dictionaries — these are the load-bearing copy files
│   ├── pages/        # *.astro routes
│   ├── components/   # shared layout/widgets
│   └── layouts/      # page shells (incl. OG meta)
└── public/           # static assets, OG card png/svg if mirrored here
```

Concretely, expect to touch:

- src/i18n/en.ts and src/i18n/it.ts — every hero, subtitle, CTA, feature
  blurb, footer, and OG meta string. Audit end-to-end against
  foundation.md §1 / identity.md §6 / campaign.md §1. Italian must be a
  full translation of English, not a different message.
- src/data/landing.ts — hero blocks, pillars, sections.
- src/data/vs.ts (or wherever the /vs page reads from) — REWRITE
  ENTIRELY. The old /vs compared Pulse to named competitors. The new
  /vs compares Pulse to patterns ("a shared doc and a Slack channel",
  "a quarterly engagement survey", "a textarea-based review form").
  Each row is a pattern + how Pulse addresses it. No brand names in
  the column headers or cell text.
- src/data/features.ts — make sure feature blurbs match the active
  surface list (Status Log, Growth, Kudos, Moments, Saturation, Leave,
  Pulse, People Insights). No parked-surface mentions.
- src/data/pricing.ts — fully OSS framing: self-host free, hosted paid.
  No free-tier seat cap framing ("free for the first 5 employees" is
  retired). No "enterprise tier with extra features."
- src/data/ecosystem.ts — list Slack / Calendar / SSO only (per the
  May 14 refocus). Don't add HRIS importers or payroll integrations.
- src/data/roadmap.ts, src/data/changelog.ts — verify no parked-surface
  shipments are surfaced as future work; the people-first surfaces are
  the current scope.
- src/layouts/*.astro — OG meta tags (og:title, og:description,
  twitter:title, twitter:description). Lead with the new hero. The OG
  card image at docs/brand/logo-explorations/og/og-hero.png has already
  been regenerated; if apps/marketing/public hosts a mirror, update that
  too.
- src/pages/index.astro — hero block, three-pillar stamp ("Employee-
  first. Open source. Built by the people who use it."), CTA.
- src/pages/about.astro (if it exists) — voice should match
  foundation.md §11; no "hate" framing.
- src/pages/open-source.astro — uses identity.md §1 (category) and
  foundation.md §5 (values). Lead with employee-first; OSS is the
  credibility proof, not the headline.

## The acceptance checklist

Before opening the PR, verify each of these by grep:

```bash
# Should return zero matches in apps/marketing/src/:
rg -i 'workday|lattice|bamboohr|personio|rippling|\bdeel\b|15five|cultureamp|officevibe|factorial' apps/marketing/src
rg -i 'hate.*HR|book a demo|AI-powered|trusted by|best-in-class|world-class|seamless|enterprise-grade|empower your workforce' apps/marketing/src
rg -i 'commessa|services firm|services-first|money / people / work|free for the first 5' apps/marketing/src

# Should return non-zero (the new hero / mission / vision lands somewhere):
rg 'buried in a Slack thread' apps/marketing/src
rg 'impossible to miss' apps/marketing/src
```

Also do a visual pass with `bun run dev:marketing` and walk every route:
hero reads cleanly; /vs page has no brand names; pricing is unambiguously
"free self-host, paid hosted, no extra tiers"; the footer matches the new
three-pillar stamp.

## Output

A single PR with a clear conventional commit (`feat(marketing):`, or
`docs(marketing):` if there's no logic change). Body should list what
moved, what stayed, and any open questions for the maintainer to resolve.

## What NOT to do

- Don't touch the wiki, docs/brand/, or the OG card scripts — those are
  the source of truth for this change and they're already updated. If
  you find an inconsistency between docs/brand and apps/marketing, the
  docs/brand version wins; flag the conflict in the PR body.
- Don't add new features, new routes, or new sections. This is a copy /
  data / meta refocus, not a redesign.
- Don't translate Italian by machine — read the Italian foundation /
  identity guidance in docs/brand/marketing/linkedin-page.it.md for the
  current tone, and write it natively. Where you're unsure, leave the
  English placeholder and flag it in the PR body.
- Don't introduce a marketing campaign tone (the "001-hate" carousel
  voice) into the identity-level pages. Campaigns may roast in slides
  later; the homepage / vs / pricing / about pages stay clean.

That's it. Start with `Read foundation.md` and work outward from there.
```

---

## After the agent finishes

Manual review pass:

- Walk every route on `bun run dev:marketing` and read every visible string out loud. If a sentence sounds like a press release, rewrite it as something a person would say.
- Open the regenerated `docs/brand/logo-explorations/og/og-hero.png` in a preview and confirm it reads at 600px wide (LinkedIn's effective preview size).
- Verify Italian by reading `i18n/it.ts` end-to-end. Italian translations from agents often drift into formality — the brand voice is direct without being curt; check that.
- If the agent added a "What we don't do" or "Why not X" section that compared Pulse to patterns rather than brands, keep it. If it accidentally named a brand, reject and re-prompt.
