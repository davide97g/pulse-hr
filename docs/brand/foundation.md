# Pulse HR — Brand & Product Foundation

The reference document for who we are, why we exist, and what we refuse to compromise on.

Everything else — a landing page, a tweet, a sales conversation, a feature decision, a hire — is judged against what's written here. The **visual** brand (colors, typography, motion, logo) lives in [`identity.md`](./identity.md). This document owns the **conceptual** brand (mission, values, positioning, voice). Where the two disagree, this one wins.

Written April 2026 by Davide, synthesized from a Cowork session with Claude. Living document — edit freely, but flag the change in the commit.

---

## 1. One-line positioning

> **Open-source people ops for modern teams.**
> Built in the open, by the people who use it. HR, time, and projects in one workspace — self-hostable and free to start.

The short version: we're building the HR platform two craft-obsessed frontend devs would actually want to use, in public, for people who hate what they're using now. Hosted if you want it, self-hosted if you don't, yours either way. Every feature ships because someone — a maintainer or a contributor — actually needed it.

*Previously considered and retired:*
- *"Rippling for services firms — open source"* — over-niched on services firms and anchored us to a category incumbent. The commessa/services-firm angle is a **strong feature story**, not the whole pitch.
- *"HR you can read, fork, and run"* — too coder-coded for the manager / people-ops audience who are our paying buyers. Kept as a **secondary line** for developer-audience surfaces (repo README, engineering blog, contributor calls).

---

## 2. Mission

**Make HR software that respects you.**

Respects your *data* (you own it, you can leave any time, it lives on your infra if you want). Respects your *time* (keyboard-first, fast, no training needed, no "book a demo" to see the product). Respects your *taste* (beautiful, terse, not another enterprise slog). Respects your *intelligence* (honest docs, honest prices, honest limits, honest about what we're bad at).

Pulse exists because HR software today does none of these things and everyone just accepts it.

## 3. Vision

**A world where the operational layer of a company — people, time, money, projects — is open, modular, and composable.**

HR is where we start because it's where the suffering is highest and the incumbents are softest. But the long arc is a set of open-source ops modules that share a workspace, a keyboard, and an API. You adopt the one that solves your pain, you keep the ones that keep paying off, you never get locked into a suite.

In ten years, "I use an open-source HR system" should sound as normal as "I use an open-source database." Today it sounds weird. We want to be one of the reasons it stops sounding weird.

## 4. Origin — why this, why now

**Why this.** The HR software at our day jobs is slow, ugly, and half-blind. Managers can see their own team's leave but not the adjacent team's. Time entry (commessa) lives in a separate universe from the actual project management tools engineers use every day, so the same eight hours gets logged twice — once where finance can see it, once where the project lead can see it. Nobody trusts either number. We've watched our colleagues burn afternoons on this.

**Why now, part 1 — the cost of a new product collapsed.** Claude Code, Codex, and the current generation of code-gen tools mean a two-person frontend team can ship a product surface that used to need six engineers. The gate to starting something real is lower than it's been in a decade. If we don't try now, we'll regret it.

**Why now, part 2 — and this is the honest one.** Davide wants to find out what it's like to build something in public. Not as a pitch strategy, as a personal experiment. The fascination is the point. A brand built by someone who's curious about the act of building in public feels different from a brand built by someone who read a growth playbook. We want the former.

---

## 5. Core values

Five values. Every product decision, every blog post, every PR review weighs against these. If a proposed thing clearly serves at least one and contradicts none, it's worth doing. If it contradicts one, default to no.

### 5.1 Openness is not negotiable

The code is open-source (FSL-1.1-MIT, converting to MIT in two years). The roadmap is open. The changelog is open. The feedback board is open. Prices are public. Limits are public. Security reports have a public policy. We never gate "what the product does" behind a sales call.

### 5.2 Your data, your infra, your exit

Self-host on your own box if you want. Export everything in a clean format, any time, without asking. No proprietary binary formats, no contractual exits, no "we'll help you migrate" stalling. The strongest signal we're doing this right is that *leaving Pulse is easy*. If you still stay, that's real loyalty.

### 5.3 Craft over features

We'd rather ship one thing that feels handmade than ten things that feel outsourced. Keyboard-first (⌘K, ⌘J), fast loads, clean motion, terse copy, no dead pixels. "Fewer things, done properly" beats "everything, done okay" every time. The day Pulse starts to feel like Pulse's competitors is the day we've failed.

### 5.4 Modular by design, composable over time

Money, People, Work, and the Labs features are independent units of value. You can adopt just one. You can replace one with a competitor and keep the others. Every surface exposes a public API + webhooks so your systems can integrate at the seam of your choice. We're not building a suite; we're building seedlings.

### 5.5 In public, on purpose

We build with the door open. Commits, docs, roadmap, screw-ups. We write about what we learned, including the stuff we got wrong. We don't perform transparency — we're genuinely curious what happens when two devs just keep shipping in the open. The brand voice is a byproduct of that, not a strategy laid over it.

### 5.6 Built by the people who use it

The roadmap is shaped by pull requests, not product managers. Davide and Niccolò use Pulse for their own work every day — if a friction lasts more than a week, it gets fixed. External contributors aren't a distant second class: the codebase, the domain model, and the docs are written so someone outside the core team can land a meaningful change in an afternoon. "Feature request" and "pull request" are two paths to the same roadmap, and both are first-class. When we stop using our own product — or stop taking outside PRs seriously — something has gone wrong.

**Note on AI.** Agent-driven development is *how* we build — it's why two of us can compete. But we don't sell it and we don't say "AI-powered." If a feature uses an LLM, we say what it does and what it costs. If it doesn't, we say "no LLM call." The public language is about craft and openness; AI shows up in engineering posts, not homepage hero copy.

---

## 6. Target audience

Three concentric rings. The brand talks to all three, in different registers.

### Inner ring — the people who carry us

**Frontend-fluent developers at services firms and small tech teams (10–200 people).** They've suffered BambooHR or Factorial or Personio. They can install Pulse themselves. They'll file issues, send PRs, and tell colleagues. They're the reason we hit 500 stars.

### Middle ring — the buyers

**People ops / HR / Finance leads at services firms (20–200) and small tech teams (10–100), EU-first.** They're not going to fork the repo, but they feel the pain of their current tool every week. They'll adopt hosted Pulse because a developer on their team vouched for it, or because they found us via a comparison post. They renew because the product keeps getting better.

### Outer ring — the lurkers

**Open-source-curious founders, ops-minded engineers, people who read `/changelog` for fun.** They'll maybe never use Pulse. They'll tell people about it. They're the soil the other two rings grow in. We write blog posts for them even when they don't convert.

### Who we are deliberately NOT for

- Enterprises >1,000 headcount who need Workday-grade compliance matrices. We're not building that.
- Teams who want HR fully outsourced to a vendor's customer-success team. We don't have one.
- Shops looking for "one throat to choke." Pulse is a tool, not an insurance policy.

---

## 7. Value proposition

### For the person evaluating Pulse

> A fast, beautiful HR platform your team can actually use — with your data on your infra if you want it, a public roadmap you can vote on, and an export button that just works. Open source. Free to start. No sales call to see the product.

### For the developer thinking about contributing

> A readable TypeScript codebase (React SPA + Bun/Hono API, no framework magic) with a clear domain model, a visible maintainer, a public roadmap, and an engineering blog that's honest about what we got wrong. We pay for guest posts. We credit contributors. The license is fair.

### For the person thinking about self-hosting

> One command to stand it up. Docker + Helm + Terraform published. Migrations versioned. Anonymous telemetry is opt-in and the schema is documented. We publish runbooks, not just marketing pages. Support/SLA is available if you need it; the free self-host path is first-class either way.

---

## 8. Moat and differentiation

We asked ourselves honestly: what makes this defensible against a well-funded incumbent who decides to copy us?

**The honest answer is that a single-feature moat doesn't exist.** The moat is the *stack* of choices working together:

1. **License that cuts off hosted clones for two years** (FSL-1.1-MIT). You can use, fork, and run. You can't spin up "Pulse Cloud" and outcompete us on our own product during the window that matters.
2. **Data-ownership as a promise, not a feature.** Incumbents can't credibly copy this because their business model is anchored on lock-in. The day BambooHR ships "export everything cleanly and self-host the rest" is the day their unit economics break.
3. **AI-leveraged two-person velocity.** Not because we talk about AI — because we use it hard, every day, to ship more than our headcount should allow. A 200-person HR company can't move at the cadence we can.
4. **Community gravity, not just users.** Stars, PRs, self-host clones, plugin authors. Each one raises the cost of a competitor catching up, because we're not selling a product; we're tending an ecosystem.
5. **Voice and taste.** Linear-grade craft + Supabase-grade openness is hard to fake. It takes years of saying no to things. Every time an incumbent tries to sound like us, they give up in three months because their org can't sustain it.

None of these is bulletproof alone. Together they make Pulse annoying to displace.

---

## 9. Anti-positioning — what we won't do

These are the lines. If we cross them, something has gone wrong and we need to stop and look at it.

- **No "book a demo" gate.** The product is installable or self-servable, full stop. If a prospect asks for a call, great — but they never *had* to ask.
- **No dark patterns.** No engagement traps, no notification addiction, no growth-at-any-cost metrics driving the roadmap.
- **No AI-washing.** If a feature doesn't actually use an LLM, it doesn't get an "AI" label. If it does, we say exactly what it does and what it costs.
- **No user lock-in.** Exports are complete, formats are open, self-host is a first-class path, not a compliance afterthought.
- **No consulting revenue.** Easy money, but it diverts product time and creates a conflict of interest with the OSS. We stay a product company.
- **No paid-only modules in the open-source tier.** The OSS is the whole product. Hosted/support is the business model.
- **No banned-phrase copy.** "Best-in-class," "world-class," "seamless," "revolutionary," "AI-powered," "one-stop shop," "trusted by" — never. See `identity.md` for the full list.
- **No enterprise sales org.** The day we need a BDR team to sell Pulse, the product has gone wrong.
- **No VC in the near term.** We're building a sustainable OSS business, not a billion-dollar outcome. Revisiting only if the shape genuinely requires it.

---

## 10. Voice and personality

**How we sound.** Honest, terse, technical-without-bravado. We write like a senior engineer explaining their work to another senior engineer, which is to say: precise, unadorned, willing to admit what we're bad at.

**Reference feel.** Linear (precise, dark, anti-enterprise) meets Supabase/Vercel (open-source-honest, developer-facing, real numbers, build-in-public). Not Basecamp (we don't do philosophical long-form manifestos), not Raycast-level playful. Serious craft, open door.

**Tone rules.**

- Name competitors when it's useful. No "legacy HRIS" euphemisms.
- Admit where we're weaker. A `/vs` page that doesn't show our losses is a lie.
- Show the code path. `apps/app/src/lib/nlp.ts:115` beats "our algorithm."
- Include real numbers. Prices, rate limits, response times, unit economics where sensible.
- Italic one word per headline, not two. See the hero pattern in `identity.md`.
- Use `commessa` deliberately. Explain it on first mention in English-market copy.

**Taglines in rotation** (pick one per asset, don't stack):

- **Primary (homepage, press, landing pages):** "Open-source people ops for modern teams."
- **Primary subtitle / supporting line:** "Built in the open, by the people who use it."
- **Secondary, dev-audience surfaces** (repo README, engineering blog, GitHub About, contributor outreach): "HR you can read, fork, and run."
- **For pricing / comparison pages:** "Open-source people ops, without the sales call."
- **For data-ownership assets:** "Your HR data, on your infra, your way out any time."
- **For product demos / keyboard-first posts:** "Two keys. Everything."

**The three-pillar stamp.** When you need a compact principle line — in a slide footer, a tweet bio, a sticker, a one-pager — use:

> **Open. Transparent. Built by the people who use it.**

These are the three values that carry the most weight in public messaging (§5.1, §5.5, §5.6). They're short enough to stencil, and they say what Pulse is before you've explained anything else.

**Public presence — who shows up.** Product-first, founders behind it. Davide and Niccolò sign blog posts and ship commits; the homepage and landing don't lead with founder bios. When a post benefits from a human voice, it gets a byline. The product is the main character.

**Language.** English-first for everything public-facing (homepage, docs, product UI, blog). Italian-friendly for content that serves a specific EU/IT audience — commessa explainers, Italian payroll deep-dives, services-firm landing pages. Not bilingual-from-day-one; that's a 2× writing tax we can't afford yet.

---

## 11. Business model

**Open core, sustainable.**

- **Free forever:** the full open-source product, self-hosted or run locally. No feature gates. The OSS is the actual product, not a teaser.
- **Hosted tier (`pulsehr.it`):** pay per active employee per month. Main revenue line. What you're paying for is *convenience and operational burden removed* — uptime, backups, migrations, no infra to run — not locked features.
- **Support & SLA for self-hosters:** flat tier for companies that self-host but need a phone number. Priority patches, onboarding help, guaranteed response times.
- **Guest-post payments** (editorial budget, not a revenue line): €400 per published piece, €200 for commissioned drafts we don't run. Invest in content quality from day one.

**Not revenue lines:** paid add-ons, paid modules, consulting, implementation services, custom dev. Each is a distraction or a conflict of interest.

**Why this is sustainable rather than VC-shaped.** We don't need massive scale to be profitable — the team is two, the infra is modest, the customer acquisition cost via OSS is near zero if we do the content well. A few hundred hosted customers paying a reasonable monthly price covers costs and then some. The ceiling is lower than a VC-backed HRIS; the floor is much lower too, and *we own it*.

---

## 12. Success metrics — what "it worked" looks like

Davide's own words: 18 months from today, we're having a beer and we're proud because:

- **There is a community** — not just users, a *community*. Maturing, working on features, sending PRs, arguing about roadmap priorities on the feedback board.
- **It's a real product, not a demo.** The mocked local-storage "test drive" still exists as an onboarding on-ramp, but the actual hosted and self-hosted deployments are where people do real work.
- **The audience is mixed.** Developers contribute code. Managers and people-ops folks who *aren't* developers believe in us enough to request real features for their real use cases. Both registers feel welcome.
- **At least 500 GitHub stars on `davide97g/pulse-hr`.** Not a vanity number — a proxy for "we reached escape velocity in the OSS distribution loop."
- **Hosted + self-hosted both work.** Customers choose their path. Neither is a second-class citizen.

**Metrics we'll track publicly, monthly:**

1. Stars on the primary GitHub repo.
2. Signups on hosted Pulse via blog referrer.
3. Anonymous self-host telemetry opt-ins (proxy for self-host adoption).
4. Inbound issues labeled `feature` — real community requests, not bug reports.
5. Monthly recurring revenue on the hosted tier.

**Metrics we won't chase:** DA scores, generic "traffic" growth, keyword volume, impressions, engagement seconds. Quality of community beats quantity of visitors every time.

---

## 13. Team & founder stance

**Davide Ghiotto** (`@davide97g`) and **Niccolò** — two frontend-fluent developers, independent of any employer (this is not a Bitrock project, though Bitrock's day job informs the design pain-points). Built with intentional use of agent-driven development: Claude Code, Codex, Cowork. AI leverage is the reason two of us can take on a category usually owned by companies of 50+ engineers.

We don't lead with our names in marketing. We do sign our work in commits, posts, and PRs. The stance is: the product is the main character, the founders are the second cast. When a human voice genuinely helps — a postmortem, a why-we-built-this post, a conference talk — we show up with a byline.

Contributions from outside welcome; the governance model, contribution workflow, and code-of-conduct are documented in the repo (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`). We credit contributors in the changelog and link their profiles.

---

## 14. The "so what" for downstream work

This document is the input for everything that comes next. Concretely:

- **Landing page rewrites** pull their hero headline from §1, value prop from §7, anti-positioning from §9.
- **Blog posts** pick a pillar (OSS mechanics, commessa ops, engineering notes, agent-native HR from `CONTENT_STRATEGY.md`) and land against at least one value in §5.
- **Feature decisions** check §5 (values), §9 (anti-goals), and §6 (audience rings) before entering the roadmap.
- **Contributor conversations** start from §7 (value prop for devs) and §13 (team stance).
- **Sales conversations** (if any) run from §7 (for buyers) and §11 (pricing is public, lead with it).
- **Pitches to press / podcasts** use §4 (origin) and §3 (vision) as the narrative arc.
- **Visual / design execution** defers to [`identity.md`](./identity.md) for color, type, motion, logo; this doc governs the *intent* that identity.md dresses.

---

## 15. Open questions — honest TBDs

Things we deliberately haven't decided yet. Noted here so nobody invents answers silently.

- **Niccolò's public presence.** Co-byline on blog posts? Twitter? Let's decide when he weighs in.
- **Hosted tier pricing exact numbers.** Per-employee range, free-tier cap (likely "first 5 employees forever" per `identity.md`, but revisit).
- **Plugin SDK surface.** The vision says MCP + plugin SDK + API + skill library. Which one is shipped first? Likely API/webhooks already, then MCP, then plugin SDK — but an ADR is needed.
- **Governance model at scale.** Who has merge rights when we have 20 external contributors? BDFL, maintainer team, RFC process?
- **Italian payroll.** Do we build it ourselves or integrate (Fattureincloud / Zucchetti APIs)? Affects ICP depth significantly.
- **Niccolò's last name** for the published version of this doc.

---

*This document lives at `docs/brand/foundation.md`. Supersedes conceptual portions of `docs/brand/identity.md` (which continues to own visual execution). Keep both in sync when the brand evolves; link changes in commit messages.*
