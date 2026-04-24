# Content strategy — workflows-people / Pulse HR

Public document. This lives in the repo so contributors and prospective
guest authors can see what we're trying to do with content before they
commit to writing or proposing a post.

## Positioning check

We are **the open-source, modular, ecosystem-first, keyboard-first HR &
payroll platform for services-first teams**. All content choices should
be weighed against that sentence. If a topic doesn't naturally relate to
at least one of:

1. Open source (licensing, governance, self-host, community ops)
2. Modular architecture (Money / People / Work as independent products)
3. Ecosystem (API, webhooks, SDKs, integrations, agents / MCP)
4. Keyboard-first UX (⌘K, command bar, intent parsing, PWA offline)

…we don't publish it, even if it's interesting. Off-topic content
dilutes positioning at exactly the moment we need positioning to do the
work of ten sales reps.

## Pillars ("tracks")

Four tracks rotate on a two-per-month cadence. See
`apps/marketing/src/pages/blog.astro` for the live schedule and owners.

| Track                 | Angle                                               | Reader                              |
| --------------------- | --------------------------------------------------- | ----------------------------------- |
| **OSS mechanics**     | How we run Pulse as an open-source business         | Founders, OSS devs, infra engineers |
| **Commessa ops**      | Financial ops for services firms                    | COOs, agency finance leads, CFOs    |
| **Agent-native HR**   | Building toward MCP + agent-accessible tool schemas | Platform teams, AI engineers        |
| **Engineering notes** | Technical deep-dives on the actual stack            | Developers evaluating self-host     |

## Publishing discipline

- **Commit, not aspiration.** Every scheduled post has a named owner and
  a date. Missing a date beats hand-waving a "Q3-ish" slot.
- **Ship as git commits.** Blog posts live under
  `apps/marketing/src/pages/blog/` as Astro files. No headless CMS, no
  marketing team workflow app — the blog is part of the repo.
- **Takeaway per post.** Each post's intro ends with the one thing the
  reader will be able to do or decide after reading. If we can't state
  that in one sentence, the post isn't ready.

## Distribution loop

1. Commit + merge → deploy triggers Vercel prod rebuild.
2. Cross-post to Hacker News by the author (self-submitted, no "growth
   team" games).
3. Tweet thread from the product account + personal founder account.
4. Linkedin post (company page + founders).
5. Update the GitHub repo README with the 3 most recent posts (manual
   commit, on purpose — keeps the repo active signal alive).
6. Aggregate RSS → mailing list send twice a month (Postmark, via a
   simple Cloudflare Worker — no HubSpot).

## Programmatic SEO layer (post-launch)

Once the flagship posts land and the blog has ~12 pieces, a
programmatic layer uses the `seo-audit` + `programmatic-seo` skills
against templated pages:

- One landing page per **integration** (e.g. `/integrations/slack-hr`)
- One landing page per **country payroll** (e.g. `/payroll-italy`)
- One landing page per **alternative comparison** beyond the top five on
  `/vs` (e.g. `/vs/humaans`, `/vs/factorial`)

Every generated page must (a) read like a human wrote it, (b) reference
at least two pieces of repo content (LICENSE, `apps/app/src/lib/nlp.ts`,
etc.), and (c) list honest weaknesses. The day a programmatic page
reads like SEO sludge is the day we turn the whole layer off.

## Success metrics

Monthly, reviewed in a public GitHub Discussion:

- **Star growth** on `davide97g/workflows-people` (primary — OSS PLG).
- **Signups** from `/blog` referrer (secondary conversion).
- **Self-host clones** detected via the anonymous telemetry opt-in in
  the Helm chart (tertiary — shows the open-source motion is working).
- **Inbound issues** with `feature` label (content drives informed
  feedback).

We **do not** chase DA scores, keyword volume lists, or generic
"traffic" growth. Open-source distribution favours quality over
quantity — 50 engaged readers will clone the repo; 5,000 driveby
searchers won't.

## Guest posts

We pay €400 per published piece, €200 for the draft even if we don't
run it. Pitch `editorial@pulsehr.it` with: (a) which track, (b) one
sentence of takeaway, (c) your byline link.
