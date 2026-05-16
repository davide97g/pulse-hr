# Pulse HR — Brand & Product Foundation

The reference document for who we are, why we exist, and what we refuse to compromise on.

Everything else — a landing page, a tweet, a sales conversation (rare), a feature decision, a hire — is judged against what's written here. The **visual** brand (colors, typography, motion, logo) lives in [`identity.md`](./identity.md). The **feel** lives in [`aesthetic.md`](./aesthetic.md). This document owns the **conceptual** brand (mission, values, positioning, voice). Where any two disagree, this one wins.

Original April 2026, refined May 2026 to a tighter people-first scope and an IC-first audience. Living document — edit freely, flag the change in the commit.

---

## 1. One-line positioning

> **Your best work is buried in a Slack thread from March. Pulse HR pulls it out.**

The hero calls out the universal IC pain — invisible work, lost recognition, growth no one can prove — and the product is the answer. Open source. Self-hostable in 90 seconds. Built by the people who use it.

The longer story: Pulse HR is the workspace an IC at a tech company adopts on their own — three lines a day in [[Status Log]], a kudos that survives, a growth trail you can carry into your next conversation. Their team joins. Their manager finally has a Friday recap that's a paragraph, not a guess. Six months in, the company that "officially" rolls out HR tooling finds the choice was already made.

_Previously considered and retired:_

- _"HR software for people who hate HR software."_ — Was the April 2026 hero. Funny and broad, but framed Pulse as a reaction to a category rather than a thing in its own right. The new hero names the actual moment of pain.
- _"For services firms — open source."_ — Anchored us to a specific industry vertical and tied the product to a billable-hours / project-margin world we have since parked. See `wiki/AGENTS.md` for the people-first scope.
- _"HR · rebuilt."_ — Tidy short-form line. Kept as a video / trailer beat, not a hero. The new hero is more specific and that specificity is the point.
- _"HR you can read, fork, and run."_ — Too coder-coded. Survives only on dev-audience surfaces (repo README, GitHub About, contributor calls).

---

## 2. Mission

**Make your work impossible to miss.**

Pulse HR exists for the IC — the dev, the designer, the analyst — to log what they did, get the credit they earned, and walk into their next conversation with proof. Three lines a day. A kudos that sticks. A growth trail that doesn't live in someone else's spreadsheet.

The good engineer ships the demo on Friday afternoon. By Monday, the demo is buried under fifty messages and a deployment thread. Six months later, performance review week, they reconstruct the year from screenshots and lose the argument anyway, because the person on the other side of the table didn't have to do the same. That's the bug. Pulse fixes it.

We don't build for HR. We build for the person HR talks about.

## 3. Vision

**The tool the team installs before HR notices.**

A workspace adopted bottoms-up — by one IC, then their team, then the company. Open source under FSL-1.1-MIT (converting to MIT in two years). Self-host on your own infra in 90 seconds with `docker compose up`, or pay us to host. There is no "talk to sales" tier. The demo is the sales call.

The long arc: an IC at a tech-forward company installs Pulse the way they install any open-source tool — without permission, because the licence permits it and the docs respect them. Pulse becomes infrastructure for being a kind, attentive, well-documented workplace, owned by the team that runs on it. In five years, "I use an open-source HR system" sounds as normal as "I use an open-source database." Today it sounds weird. We want to be one of the reasons it stops sounding weird.

## 4. Origin — why this, why now

**Why this.** Performance reviews ask an engineer to summarise their year in a textarea. They scroll through Slack. They screenshot. They submit a paragraph and lose. Meanwhile their best work — the demo on Friday, the PR that unblocked their team, the kudos in #general — has all scrolled off. The HR app they were supposed to use for this is the thing they open once a quarter to fill in a form they don't believe in. We've watched our colleagues burn whole afternoons reconstructing what they did. We've done it ourselves. The bug is invisibility, and it's everywhere.

**Why now, part 1 — the cost of a new product collapsed.** Claude Code, Codex, and the current generation of agent-driven tools mean two frontend devs can ship a product surface that used to need six engineers. The gate to starting something real is lower than it's been in a decade. If we don't try now, we'll regret it.

**Why now, part 2 — and this is the honest one.** Davide wants to find out what it's like to build something in public. Not as a pitch strategy, as a personal experiment. The fascination is the point. A brand built by someone who's curious about the act of building in public feels different from a brand built by someone who read a growth playbook. We want the former.

---

## 5. Core values

Six values. Every product decision, every blog post, every PR review weighs against these. If a proposed thing clearly serves at least one and contradicts none, it's worth doing. If it contradicts one, default to no.

### 5.1 Employee-first, in every direction

The IC is the user. The manager is a witness. HR is an observer. Admin is the IC wearing a second hat. Every feature is judged on whether it makes the IC's first ten minutes better, their proof of work stronger, their next conversation easier. If a feature makes the manager more powerful without making the IC more visible, it's wrong. If raw IC writing crosses the boundary up the chain in any form other than an aggregate or a recap, the product is broken.

### 5.2 Openness is not negotiable

The code is open source (FSL-1.1-MIT, converting to MIT in two years). The roadmap is open. The changelog is open. The feedback board is open. Prices are public. Limits are public. Security reports have a public policy. We never gate "what the product does" behind a sales call. There is no enterprise tier with extra features. The OSS is the whole product.

### 5.3 Your data, your infra, your exit

Self-host on your own box if you want. Export everything in a clean format, any time, without asking. No proprietary binary formats, no contractual exits, no "we'll help you migrate" stalling. The strongest signal we're doing this right is that *leaving Pulse is easy*. If you still stay, that's real loyalty.

### 5.4 Craft over features, narrow scope on purpose

We'd rather ship one thing that feels handmade than ten things that feel outsourced. Keyboard-first (⌘K, ⌘J), fast loads, clean motion, terse copy, no dead pixels. Half of HR is parked on purpose — payroll, time, recruiting, documents, projects. Those belong in tools built for them; Pulse is the people half. "Fewer things, done properly" beats "everything, done okay" every time.

### 5.5 In public, on purpose

We build with the door open. Commits, docs, roadmap, screw-ups. We write about what we learned, including the stuff we got wrong. We don't perform transparency — we're genuinely curious what happens when two devs just keep shipping in the open. The brand voice is a byproduct of that, not a strategy laid over it.

### 5.6 Built by the people who use it

The roadmap is shaped by pull requests, not product managers. Davide and Niccolò use Pulse for their own work every day — if a friction lasts more than a week, it gets fixed. External contributors aren't a distant second class: the codebase, the domain model, and the docs are written so someone outside the core team can land a meaningful change in an afternoon. "Feature request" and "pull request" are two paths to the same roadmap, and both are first-class. When we stop using our own product — or stop taking outside PRs seriously — something has gone wrong.

**Note on AI.** Agent-driven development is *how* we build — it's why two of us can compete. But we don't sell it and we don't say "AI-powered." If a feature uses an LLM, we say what it does and what it costs. If it doesn't, we say "no LLM call." The public language is about craft and openness; AI shows up in engineering posts, not homepage hero copy.

---

## 6. Target audience

Three concentric rings. The brand talks to all three, in different registers. Detailed positioning lives in [`wiki/concepts/target-audience.md`](../../wiki/concepts/target-audience.md).

### Inner ring — the primary persona

**The IC dev or designer at a tech-forward company (20–200 people).** Mid-20s to mid-30s. Engineer, designer, analyst, sometimes PM. Comfortable on the command line. Has installed at least one open-source tool this month without asking permission. They've suffered the spreadsheet-and-Slack-DM status quo and they're done. They can self-host Pulse themselves. They'll file issues, send PRs, tell colleagues. They're the reason we hit 500 stars.

### Middle ring — the team that gets pulled in

**Their teammates and their manager.** Pulled in *after* the IC has been using Pulse for a week. They join because they got a kudos, or because the team's Friday recap suddenly works. They didn't choose Pulse — the IC did — and the product has to be good enough that they stay anyway. We design the manager-safe surfaces (sentiment recap, workload aggregate, team OOO view) so the manager helps without breaking the trust the IC has in the tool.

### Outer ring — the lurkers

**Open-source-curious founders, ops-minded engineers, people who read `/changelog` for fun.** They'll maybe never use Pulse. They'll tell people about it. They're the soil the other two rings grow in. We write blog posts for them even when they don't convert.

### Who Pulse is deliberately NOT for

- Enterprise HR teams that want a single vendor for payroll, time, recruiting, and engagement. We've parked all of that on purpose.
- Companies whose biggest people problem is compliance, not visibility. We're not a compliance product.
- Teams that already love their HR tool. We're not here to start a fight.
- Anyone who needs "talk to sales" before they try the product. The demo is the sales call.
- Services firms looking for billable-hours, commessa-based, project-margin tooling. That was the April 2026 ICP. It is now parked.

---

## 7. What we improve on

We don't position against a competitor. We position against a **pattern of invisibility** — the gap in everyone's working life that no current tool fills well, regardless of which HR product their company pays for.

The pattern looks like this:

- The shared doc nobody opens, where the team agreed to log "wins" three years ago.
- The chat channel called `#kudos` that gets six messages a month and scrolls off in a week.
- The performance review form that asks an IC to summarise twelve months in a textarea.
- The standup that's a six-person commute to a video call where one person talks.
- The 1:1 where the manager guesses what their report has been doing.
- The "did I do enough this quarter?" Sunday-night anxiety that has no artefact to answer it.

Pulse's job is to fill that gap — to make the IC's work visible, recognised, and rememberable. We're improving on a pattern of invisibility, not winning a fight against any company.

**No named competitors.** We don't reference other HR or people-ops products in marketing, product copy, blog posts, or social. Not to compare, not to dunk, not even in passing. The brand stands on what Pulse is, not on what others aren't. A future marketing campaign may roast specific products in a slide deck — that's a campaign-level decision, not an identity decision, and the foundation here stays clean either way.

---

## 8. Value proposition

### For the IC evaluating Pulse

> Three lines a day, a kudos that sticks, a growth trail you can carry into your next conversation. Open source. Self-host in 90 seconds. The demo is the sales call.

### For the developer thinking about contributing

> A readable TypeScript codebase (React SPA + Bun/Hono API, no framework magic) with a clear domain model, a visible maintainer, a public roadmap, and an engineering blog that's honest about what we got wrong. We pay for guest posts. We credit contributors. The licence is fair.

### For the person thinking about self-hosting

> One command to stand it up. Docker + Helm + Terraform published. Migrations versioned. Anonymous telemetry is opt-in and the schema is documented. We publish runbooks, not just marketing pages. Support/SLA is available if you need it; the free self-host path is first-class either way.

### For the manager who got pulled in by their team

> The Friday recap is finally a paragraph that's actually about your team. Raw chat stays with the IC; the aggregate comes to you. Approval workflows aren't a thing here — you read, you respond, you keep the hour you'd have spent in standup.

---

## 9. Moat and differentiation

We asked ourselves honestly: what makes this defensible against a well-funded incumbent who decides to copy us?

**The honest answer is that a single-feature moat doesn't exist.** The moat is the *stack* of choices working together:

1. **Licence that cuts off hosted clones for two years** (FSL-1.1-MIT). You can use, fork, and run. You can't spin up "Pulse Cloud" and outcompete us on our own product during the window that matters.
2. **Audience choice as a wedge.** Incumbents sell to HR. We sell to the IC. Their entire go-to-market — sales motion, copy, pricing model, sales calls — is wrong for our audience. They can't pivot to bottoms-up without breaking their unit economics.
3. **Data-ownership as a promise, not a feature.** The day a closed-source HR vendor ships "export everything cleanly and self-host the rest" is the day their unit economics break. Their business model is anchored on lock-in; ours isn't.
4. **AI-leveraged two-person velocity.** Not because we talk about AI — because we use it hard, every day, to ship more than our headcount should allow. A 200-person HR company can't move at the cadence we can.
5. **Community gravity, not just users.** Stars, PRs, self-host clones, plugin authors. Each one raises the cost of a competitor catching up, because we're not selling a product; we're tending an ecosystem.
6. **Voice and taste.** Linear-grade craft + Supabase-grade openness + a punk stance on enterprise HR is hard to fake. It takes years of saying no to things. Every time an incumbent tries to sound like us, they give up in three months because their org can't sustain it.

None of these is bulletproof alone. Together they make Pulse annoying to displace.

---

## 10. Anti-positioning — what we won't do

These are the lines. If we cross them, something has gone wrong and we need to stop and look at it.

- **No "book a demo" gate.** The product is installable or self-servable, full stop. If a prospect asks for a call, great — but they never *had* to ask.
- **No enterprise tier with extra features.** The OSS is the whole product. Hosted is convenience, not unlocked features.
- **No paid-only modules in the open-source tier.** Every feature in the public docs is in the public repo.
- **No dark patterns.** No engagement traps, no notification addiction, no growth-at-any-cost metrics driving the roadmap.
- **No AI-washing.** If a feature doesn't actually use an LLM, it doesn't get an "AI" label. If it does, we say exactly what it does and what it costs.
- **No user lock-in.** Exports are complete, formats are open, self-host is a first-class path, not a compliance afterthought.
- **No consulting revenue.** Easy money, but it diverts product time and creates a conflict of interest with the OSS. We stay a product company.
- **No banned-phrase copy.** "Best-in-class," "world-class," "seamless," "revolutionary," "AI-powered," "one-stop shop," "trusted by" — never. See `identity.md` for the full list.
- **No enterprise sales org.** The day we need a BDR team to sell Pulse, the product has gone wrong.
- **No named competitors anywhere in the identity.** Marketing, product copy, blog, social — none of it references another HR or people-ops product by name. We talk about patterns of invisibility, not logos. See §7.
- **No re-introducing parked surfaces.** Payroll, time tracking, projects, recruiting, documents, onboarding workflows, marketplace — all parked in the May 2026 refocus. Reintroducing any of them requires an explicit decision, not a feature-creep slide.
- **No VC in the near term.** We're building a sustainable OSS business, not a billion-dollar outcome. Revisiting only if the shape genuinely requires it.

---

## 11. Voice and personality

**The stance: opinionated. The language: plain.**

We have a clear point of view about how work should be visible, and we say it out loud — without raising our voice. We describe what we're improving on, not what we're fighting. The pattern is the subject (the shared doc nobody opens, the kudos that scrolls off, the review that fits a year into a textarea); the people who live with that pattern today aren't the target.

Honest, terse, technical-without-bravado. We write like a senior engineer explaining their work to another senior engineer — precise, unadorned, willing to admit what we're bad at, and clear about which workflow we think serves the IC best.

**Reference feel.** Linear (precise, dark, anti-enterprise) meets Supabase / Vercel (open-source-honest, developer-facing, real numbers, build-in-public). Not Basecamp (we don't do philosophical long-form manifestos), not Raycast-playful, not Stripe-corporate. Quietly opinionated, never strident.

**Tone rules.**

- Have a point of view. Different workflows are not all equally good for the IC. If we think one way is better, we say so.
- Describe what we improve on. The shared doc nobody opens, the kudos that scrolls off, the review that fits a year into a textarea. Patterns, not products.
- **Never name another product.** Not to compare, not to dunk, not even in passing. See §7.
- Admit where we're weaker. A `/vs` page that doesn't show our losses is a lie. If we ship a `/vs` page, it compares patterns and trade-offs, not logos.
- Show the code path. `apps/app/src/lib/nlp.ts:115` beats "our algorithm."
- Include real numbers. Prices, rate limits, response times, unit economics where sensible.
- Italic one word per headline, not two. See the hero pattern in `identity.md`.

**Taglines in rotation** (pick one per asset, don't stack):

- **Primary (homepage hero, press quote, banner):** "Your best work is buried in a Slack thread from March."
- **Primary subtitle / proof:** "Open-source workspace for ICs. Self-host in 90 seconds. The demo is the sales call."
- **Short-form / trailer / video:** "Three lines. A kudos. Proof."
- **Descriptor** (SEO meta, directories, product footer): "Open-source recognition, growth, and proof of work — for the IC."
- **Secondary, dev-audience surfaces** (repo README, engineering blog, GitHub About): "HR you can read, fork, and run."
- **For pricing / comparison pages:** "No sales call. No enterprise tier. Just the product."
- **For data-ownership assets:** "Your work, your infra, your way out any time."
- **For product demos / keyboard-first posts:** "Two keys. Everything."
- **For /about or manifesto moments:** "Built for the IC. Built in the open. Built to make your work impossible to miss."

**The three-pillar stamp.** When you need a compact principle line — in a slide footer, a tweet bio, a sticker, a one-pager — use:

> **Employee-first. Open source. Built by the people who use it.**

These are the three values that carry the most weight in public messaging (§5.1, §5.2, §5.6). Short enough to stencil; they say what Pulse is before you've explained anything else.

**Public presence — who shows up.** Product-first, founders behind it. Davide and Niccolò sign blog posts and ship commits; the homepage and landing don't lead with founder bios. When a post benefits from a human voice, it gets a byline. The product is the main character.

**Language.** English-first for everything public-facing (homepage, docs, product UI, blog). Italian is a full-fidelity translation, not a different message. If a headline doesn't land in both languages, we rewrite the English first. Not bilingual-from-day-one in the sense of two parallel voices — one source of truth, translated faithfully.

---

## 12. Business model

**Fully open source, two ways to pay.**

- **Self-host, free.** The full open-source product, run on your own infra. Forever. The licence flips to MIT after two years.
- **Hosted tier (`pulsehr.it`):** pay per active employee per month. Main revenue line. What you're paying for is *convenience and operational burden removed* — uptime, backups, migrations, EU residency, no infra to run — **not** locked features.
- **Support & SLA for self-hosters:** flat tier for companies that self-host but need a phone number. Priority patches, onboarding help, guaranteed response times.
- **Guest-post payments** (editorial budget, not a revenue line): €400 per published piece, €200 for commissioned drafts we don't run. Invest in content quality from day one.

**Not revenue lines:** paid add-ons, paid modules, paid feature gates, consulting, implementation services, custom dev. Each is a distraction or a conflict of interest.

**Why this is sustainable rather than VC-shaped.** We don't need massive scale to be profitable — the team is two, the infra is modest, the customer acquisition cost via OSS and bottoms-up adoption is near zero if we do the content well. A few hundred hosted customers paying a reasonable monthly price covers costs and then some. The ceiling is lower than a VC-backed HRIS; the floor is much lower too, and *we own it*.

---

## 13. Success metrics — what "it worked" looks like

Davide's own words: 18 months from today, we're having a beer and we're proud because:

- **There is a community** — not just users, a *community*. Maturing, working on features, sending PRs, arguing about roadmap priorities on the feedback board.
- **It's a real product, not a demo.** The mocked local-storage "test drive" still exists as an onboarding on-ramp, but the actual hosted and self-hosted deployments are where people do real work.
- **The audience is mixed.** Developers contribute code. Managers and people-ops folks who *aren't* developers stay because the product earns it — even though they didn't choose it.
- **At least 500 GitHub stars on `davide97g/pulse-hr`.** Not a vanity number — a proxy for "we reached escape velocity in the OSS distribution loop."
- **Hosted + self-hosted both work.** Customers choose their path. Neither is a second-class citizen.
- **At least one team where the IC who installed Pulse is the reason the company kept it.** The bottoms-up motion proved out on at least one real org.

**Metrics we'll track publicly, monthly:**

1. Stars on the primary GitHub repo.
2. Signups on hosted Pulse via blog referrer.
3. Anonymous self-host telemetry opt-ins (proxy for self-host adoption).
4. Inbound issues labeled `feature` — real community requests, not bug reports.
5. Monthly recurring revenue on the hosted tier.

**Metrics we won't chase:** DA scores, generic "traffic" growth, keyword volume, impressions, engagement seconds. Quality of community beats quantity of visitors every time.

---

## 14. Team & founder stance

**Davide Ghiotto** ([GitHub](https://github.com/davide97g) · [LinkedIn](https://www.linkedin.com/in/davide-ghiotto/)) and **Niccolò Naso** ([GitHub](https://github.com/LordNik10/LordNik10) · [LinkedIn](https://www.linkedin.com/in/niccolò-naso-888039178/)) — two frontend-fluent developers, independent of any employer (this is not a Bitrock project, though Bitrock's day job informs the design pain-points). Built with intentional use of agent-driven development: Claude Code, Codex, Cowork. AI leverage is the reason two of us can take on a category usually owned by companies of 50+ engineers.

We don't lead with our names in marketing. We do sign our work in commits, posts, and PRs. The stance is: the product is the main character, the founders are the second cast. When a human voice genuinely helps — a postmortem, a why-we-built-this post, a conference talk — we show up with a byline.

Contributions from outside welcome; the governance model, contribution workflow, and code-of-conduct are documented in the repo (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`). We credit contributors in the changelog and link their profiles.

---

## 15. The "so what" for downstream work

This document is the input for everything that comes next. Concretely:

- **Landing page rewrites** pull their hero headline from §1, value prop from §8, anti-positioning from §10, enemy framing from §7.
- **Blog posts** pick a pillar (OSS mechanics, IC visibility, engineering notes, agent-native build process) and land against at least one value in §5.
- **Feature decisions** check §5 (values), §10 (anti-goals), and §6 (audience rings) before entering the roadmap. The §5.1 employee-first lens is the loudest.
- **Contributor conversations** start from §8 (value prop for devs) and §14 (team stance).
- **Sales conversations** (if any) run from §8 (for buyers) and §12 (pricing is public, lead with it).
- **Pitches to press / podcasts** use §4 (origin) and §3 (vision) as the narrative arc.
- **Visual / design execution** defers to [`identity.md`](./identity.md) for colour, type, motion, logo and [`aesthetic.md`](./aesthetic.md) for feel; this doc governs the *intent* the others dress.

---

## 16. Open questions — honest TBDs

Things we deliberately haven't decided yet. Noted here so nobody invents answers silently.

- **Niccolò's public presence.** Co-byline on blog posts? Twitter? Let's decide when he weighs in.
- **Hosted tier pricing exact numbers.** Per-employee range, free-tier cap. Currently leaning toward generous OSS-style "no per-seat games" but final numbers are TBD.
- **Plugin SDK surface.** The vision says MCP + plugin SDK + API + skill library. Which one is shipped first? Likely API/webhooks already, then MCP, then plugin SDK — but an ADR is needed.
- **Governance model at scale.** Who has merge rights when we have 20 external contributors? BDFL, maintainer team, RFC process?
- **The bottoms-up motion at scale.** We believe in step-1 to step-5 in `wiki/concepts/target-audience.md`. We have not yet proven it. Testing this is the next 18 months.
- **What happens when a parked surface is asked for, repeatedly.** If 50 people open issues asking for time tracking, do we un-park? Need a written rule, not a case-by-case panic.

---

*This document lives at `docs/brand/foundation.md`. Supersedes conceptual portions of `docs/brand/identity.md` (which continues to own visual execution) and `docs/brand/aesthetic.md` (which owns visual feel). Keep all three in sync when the brand evolves; link changes in commit messages. Mirrored in plain HR-readable form at `wiki/concepts/{mission,vision,brand-voice,open-source-positioning,target-audience}.md`.*
