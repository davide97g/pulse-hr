# Wiki log

Append-only chronological record. Newest entries at the bottom.

Prefix convention: `## [YYYY-MM-DD] <op> | <subject>` where `<op>` is one of `bootstrap`, `ingest`, `lint`, `query`, `manual`.

Quick recent activity:

```
grep "^## \[" wiki/log.md | tail -10
```

---

## [2026-04-26] bootstrap | initial wiki scaffold

Created the full first-pass wiki: 5 personas, ~28 features, ~17 entities, 7 concepts, 7 journeys, 8 glossary entries. Schema (`AGENTS.md`), index (`index.md`), and human entry point (`README.md`) seeded. Pointer added to root `CLAUDE.md` so future Claude Code sessions know the wiki exists.

Source layer at bootstrap: `CLAUDE.md`, `apps/app/src/routes/`, `apps/app/src/lib/mock-data.ts`, `apps/app/src/lib/sidebar-nav-groups.tsx`, `apps/app/src/lib/role-features.ts`, `apps/marketing/src/data/landing.ts`, `packages/tokens/src/themes/`. Italian glossary terms (commessa, permesso, ferie, busta paga, TFR, ROL, malattia, badge) bootstrapped from CLAUDE.md and mock-data labels.

Known gaps flagged for future research: (a) e-signature flow on `[[Documents]]` is mentioned in marketing but not visibly modeled; (b) BambooHR/Personio/Rippling importers mentioned in FAQ but no UI scaffold; (c) `[[Saturation]]` and `` overlap — relationship needs sharpening once the products mature.

## [2026-05-09] ingest | apps/app sync — welcome, role override, sidebar, themes

Sync pass against the current state of `apps/app/`. Driven by recent commits `7b2d6bd` (welcome route + signed-out gate), `9b6ad75` (role-as override), `f9162e1` / `f34262f` (workspace simplification — name + size only), `45b7480` (sidebar regrouping), `07b5a5c` (localStorage persistence), `7d86bd5` / `87fa66a` (forced dark on auth + feedback) and the editorial rewrite of [[Status Log]] / [[Growth]] / [[Kudos]].

**Updated.** `features/status-log.md` (now an async-standup feed plus a privacy-bounded recap; explicitly no AI / no chat), `features/pulse.md` (no standalone route — the strip lives inside Status Log), `concepts/role-themes.md` (only `light` and `dark` actually ship; the five-role palette was aspirational), `personas/employee.md` (theme + status-log lines corrected), `journeys/daily-status-log.md` (steps now match the public-feed + recap surface), `concepts/labs.md` (Labs isn't a sidebar group; current inventory is Status Log / Pulse / Kudos / Saturation / Moments), `concepts/demo-mode.md` (added persistence + reset → Welcome), `features/saturation.md` (Other group, `/docs/saturation` explainer), `features/kudos.md` and `features/growth.md` (timestamp refresh).

**Created.** `features/welcome.md`, `concepts/signed-out-gate.md`, `concepts/role-override.md`, `glossary/kudos.md`, `glossary/timesheet.md`, `glossary/allocation.md`, `glossary/persona.md`. All linked from `index.md`.

**Source corrections.** Root `CLAUDE.md` had drifted on three points and was updated alongside the wiki: sidebar groups are `Dashboard / People / Time / Work / Other / Workspace` (not Overview / Money / Insights / Labs / Workspace); only two themes ship today (not seven); the public route prefix list is `/welcome /login /signup` (not `/landing /login /signup`).

Known gaps still flagged: (a) per-persona accent palettes are described in marketing but not in tokens — gap noted in `concepts/role-themes.md`; (b) [[Pulse]] sits between feature and component — page kept, with the framing "lives inside Status Log".


## [2026-05-14] manual | people-first refocus

Narrowed Pulse HR's scope to the people half of HR. Eight active surfaces: [[Dashboard]], [[Status Log]], [[Growth]], [[Kudos]], [[Moments]], Workload check-in ([[Saturation]] rewritten), [[Leave]] journal, [[Pulse]], [[Employees]], [[Org Chart]], People Insights ([[Reports]] rewritten). Twelve surfaces parked: [[Time Tracking]], [[Projects]], [[Activities]], [[Clients]], [[Recruiting]], [[Documents]], [[Offices]], [[Announcements]], [[Marketplace]], [[Developers]], [[Calendar]] (folded into Leave), [[Onboarding]]. Soft-prune pattern: routes still resolve, but the modules ship off by default in \`packages/shared/src/sidebar-features.ts\` and the sidebar (\`apps/app/src/lib/sidebar-nav-groups.tsx\`) regroups around Dashboard / You / Wellbeing / People / Workspace.

**Updated wiki pages.** \`AGENTS.md\` (added a product-focus paragraph naming the active vs parked split). \`index.md\` (features split into Active / Parked, three concept pages added). \`features/leave.md\` (personal journal, no approvals). \`features/saturation.md\` (Workload check-in, one-tap weekly). \`features/reports.md\` (People Insights, no business KPIs). \`personas/employee.md\`, \`personas/manager.md\`, \`personas/hr.md\` (parked surfaces removed from daily narrative). \`personas/finance.md\` (marked as marginal). \`journeys/leave-request-to-approval.md\` (rewritten as \"Logging Time Off\", no manager step). \`journeys/daily-status-log.md\` (Time Tracking step removed). \`journeys/candidate-to-employee.md\` and \`journeys/onboarding-new-hire.md\` (parked banner added). All 12 parked feature pages got \`status: parked\` in frontmatter.

**Created.** \`concepts/mission.md\`, \`concepts/vision.md\`, \`concepts/brand-voice.md\`.

**Out of scope of this entry but related.** Marketing site (\`apps/marketing\`) rewritten end-to-end — both i18n locales, hero, features, vs (now Lattice/15Five/Officevibe/CultureAmp, not Rippling/Deel/BambooHR), modules → \"What's inside\", pricing simplified, ecosystem shrunk to Slack/Calendar/SSO, roadmap rewired around people-first surfaces. Root README + CLAUDE.md got top-of-file scope notes. In-app dashboard cards swapped to people-first signals. Leave + Saturation editorials rewritten. Reports renamed → People Insights.

Known gaps. (a) The entity \`Leave Request\` is still named that in code even though there's nothing to request anymore — renamed in the wiki feature page but not in mock-data. (b) The marketing \`/changelog\` page still narrates old shipments; the people-first ones haven't been added yet. (c) \`apps/api\` still serves endpoints for parked features — intentional (low cost) but should be revisited if the scope holds for a quarter.


## [2026-05-16] manual | identity refinement — IC-first, opinionated voice, constructive framing

> **Note (second pass, same day):** The first version of this entry framed the voice as "punk" and named the enemy by listing specific competitor brands. Both have since been retired — see the second entry below for the constructive-not-combative refinement and the no-named-competitors sweep. The text immediately following is preserved as a record of what we tried and walked back from.

## [2026-05-16] manual | original framing (later softened)

Refined the brand identity now that the people-first scope has settled. The May 14 refocus narrowed *what* Pulse does; this pass narrows *who it's for* and *how it talks*. Synthesised from a four-question Cowork interview with Davide.

**The new spine.**
- **Primary persona:** the IC dev or designer at a 20–200-person tech-forward company. Bottoms-up adoption — one IC self-installs, their team joins, six months later HR finds the choice already made. Manager / HR / Admin / Finance are now explicitly secondary or marginal; they enter via the IC.
- **Hero value prop:** employee-first (recognition, merit, proof). Open source and "built by the people who use it" are supporting pillars, not the headline.
- **Voice:** punk in stance, plain in language. Takes a side. Mocks the practice, not the person. Names the enemy by behaviour, not by brand.
- **The enemy:** the spreadsheet-and-Slack-DM status quo — invisible work, lost recognition, growth no one can prove. Not Workday / Lattice / BambooHR by name.
- **Locale:** English-first; Italian is a full-fidelity translation.
- **Business model:** fully open source (FSL-1.1-MIT → MIT in two years). Self-host free; cloud paid. No "enterprise tier" with extra features. No "talk to sales."
- **Name:** "Pulse HR" kept (revisited after launch). The "HR" stays as ironic ownership of the category we're refusing to be.
- **New hero line:** "Your best work is buried in a Slack thread from March."
- **New mission:** "Make your work impossible to miss."
- **New vision:** "The tool the team installs before HR notices."

**Wiki pages rewritten / created.** \`concepts/mission.md\` (new hero, IC framing). \`concepts/vision.md\` (bottoms-up motion). \`concepts/brand-voice.md\` (punk stance + 11 rules, retired the old "anti-positioning is a feature, not a fight" rule). \`concepts/open-source-positioning.md\` (now framed as a pillar under employee-first, not the headline; retired the 50–500 services-firm audience). \`concepts/target-audience.md\` (**new** — the full ring model). \`concepts/role-themes.md\` (stripped parked-feature references, marked persona hierarchy). \`personas/employee.md\` (rewritten as the IC; primary). \`personas/manager.md\`, \`personas/hr.md\`, \`personas/admin.md\` (all marked secondary, theme-accent claims removed). \`personas/finance.md\` (left marginal). \`index.md\` (persona ordering: primary / secondary / marginal). \`features/activities.md\` (removed "agencies use it" leftover).

**Brand docs rewritten / updated.** \`docs/brand/foundation.md\` (full rewrite — new positioning, mission, vision, audience rings, values §5.1 Employee-first added, voice §11 punk-but-plain, business model fully OSS, retired-tagline list expanded). \`docs/brand/identity.md\` (full rewrite of the verbal/positioning layer — category, ICP, pillars, taglines; role-chip palette kept as chip-only, never as theme; visual primitives unchanged). \`docs/brand/aesthetic.md\` (light touch — italic-rule example updated to the new hero; two commessa references removed). \`docs/brand/marketing/campaign.md\` (one-screen brief, four narrative pillars, target rings, LinkedIn voice rules, Product Hunt headline, showcase list, honest-limits all updated; weekly cadence/structure unchanged; TODO banner at top flags remaining matrix copy that still needs a rewrite). \`docs/brand/marketing/README.md\` (rules-in-one-screen updated). \`docs/brand/marketing/content-backlog.md\` and \`content-calendar.md\` (status banners — structure good, per-item copy needs sweep). \`docs/brand/marketing/linkedin-page.md\` + \`.it.md\` (status banners — page live, bios/About need rewrite). \`docs/brand/marketing/personal-profiles.md\` (status banner — needs rewrite). \`docs/brand/marketing/retrospectives/launch-day.md\` (left as-is — pillar-anchored but template-shaped). \`docs/brand/marketing/carousels/001-hate/{slides,slides.it,post}.md\`, \`captions/001-hate{,.it,-first-comments}.md\`, \`cross-posts/001-hate.md\` (all marked SUPERSEDED — they ran with the prior positioning; historical record only). \`docs/brand/logo-explorations/scripts/README.md\` + \`build_og_cards.py\` (flagged that \`og-hero.svg/.png\` still bakes in the old hero string; needs a re-render with the new line).

**Tension flagged for follow-up.** The May 14 entry mentions the marketing site's \`/vs\` page names Lattice/15Five/Officevibe/CultureAmp. The new voice rule (no brand-name dunking, name the *behaviour* not the logo) is in tension with that. Decision needed: either the \`/vs\` page becomes "vs the spreadsheet-and-Slack status quo" with no brand names, or we keep the brand-named vs page as an exception with a written rationale. Not changed in this pass.

**Out of scope of this entry but related.** Marketing site (\`apps/marketing\`) was last refreshed in the May 14 refocus and still leads with the people-first scope but with the prior hero. Hero copy, OG cards (\`apps/marketing/public/...\` derived from the script flagged above), and the \`/vs\` page all need an alignment pass against the new spine. \`apps/feedback\` headline is fine (it's the feedback board, neutral). \`apps/app/src/routes/welcome.*\` greeting may want a one-line refresh.

Known gaps. (a) \`og-hero.svg\` and its \`.png\` still carry the April hero — re-render queued in scripts/README.md. (b) \`docs/brand/marketing/campaign.md\` §5 matrix cells still reference services-firm and commessa angles in a few places — partial rewrite pending. (c) \`docs/brand/marketing/content-backlog.md\` and \`content-calendar.md\` per-item titles need a sweep. (d) Personal LinkedIn About sections (mine and Niccolò's) reference the old hero — drafts need updating before next campaign push.


## [2026-05-16] manual | softened voice + no named competitors sweep

Second pass on the same day. Davide pushed back on two parts of the earlier framing: (1) the "punk / roast" voice was too combative for the foundation — the identity should describe what we improve on, not who we're against; (2) naming specific competitor brands, even in a "we don't dunk on these" list, was still naming them. Both reframed.

**The refined spine.**
- **Voice:** opinionated in stance, plain in language. Quietly opinionated, not strident. Roasting may live in specific marketing campaigns later — it does not live in the identity.
- **Framing:** we describe what we improve on — a *pattern of invisibility* (the shared doc nobody opens, the kudos that scrolls off, the review that fits a year into a textarea) — never another product. The phrase "the enemy" is retired in favour of "what we improve on."
- **Competitor names:** banned everywhere in the identity. Not in product copy, marketing, blog, social, comparison pages, About sections, taglines, or even in the "we don't dunk on these" lists. A future marketing campaign may roast specific products in a slide deck — that's a campaign-level choice, not an identity choice, and the foundation stays clean either way.

**Wiki updated.** \`concepts/brand-voice.md\` — rules 4/5/6 rewritten (have a point of view; describe what we improve on; no named competitors ever). Banned-phrases section now bans the proper names of any other HR or people-ops product. \`features/welcome.md\` — removed the hero quote from the v0.7.2 era, replaced with a generic description that points at the marketing site as the source of truth.

**Brand docs updated.** \`foundation.md\` — §1 retired list rewritten without competitor names; §7 retitled "What we improve on" (was "The enemy"), reframed around the pattern of invisibility; §9 moat point 3 generalised; §10 anti-positioning entry rewritten to "no named competitors anywhere in the identity"; §11 voice section rewritten ("opinionated in stance, plain in language"), retired the "punch the practice" rule and the "Built for the IC, by people who hate enterprise HR" tagline. \`identity.md\` — §1 retired list rewritten; §6 voice section rewritten with the same constructive framing, voice rules table updated, banned-phrases section now includes the names of other HR/people-ops products as a category, taglines retired entries rewritten without brand names. \`aesthetic.md\` — italic-rule example updated to use the current hero. \`marketing/campaign.md\` — §1 anti-promise rewritten, §3 Pillar 0 added (Employee-first spine) with banned phrases, Pillar 4 phrases softened, §4 targets rewritten in IC-first ring model, §6.1 LinkedIn voice rule rewritten (describe the pattern, never the brand), §5 matrix cell rewritten ("the open-source workspace for the IC" instead of brand-comparison), §6.3 Instagram cadence rewritten. \`marketing/README.md\` — rules block updated.

**Marketing assets updated.** \`marketing/linkedin-page.md\` — tagline + About + Specialties fully rewritten for the new spine; status banner now says "current drafts." \`marketing/linkedin-page.it.md\` — Italian version mirrored (full-fidelity translation). \`marketing/personal-profiles.md\` — both Davide's and Niccolò's profile headlines, About sections, and work-experience descriptions rewritten end to end. \`marketing/content-backlog.md\` — active backlog items MD-001 and IG-002 updated to use the current hero. \`marketing/retrospectives/launch-day.md\` — the example bullet that named three competitor brands rewritten to a concrete-numbers example with a "never reference other products by name" reminder.

**Historical 001-hate marketing artefacts sanitised.** These were marked SUPERSEDED in the previous pass; in this pass the competitor names inside the content are also scrubbed: \`cross-posts/001-hate.md\` (the GitHub Discussions post no longer lists three brands; the HN top comment no longer lists Money/People/Work modules), \`captions/001-first-comments.md\` (BambooHR mentions replaced with generic "current HR tool"; Deel/Remote line softened to "third-party contractor rails"; "name the vendor" prompt replaced with "describe the pattern, not the brand"), \`captions/001-hate.it.md\` (Italian equivalent of the vendor-naming prompt softened). The historical roast/hate framing of the launch carousel itself is preserved as record — the SUPERSEDED banners flag that the content is not for reuse.

**OG hero card re-rendered.** \`docs/brand/logo-explorations/scripts/build_og_cards.py\` — hero string updated to "Your best work is / buried in a Slack thread / from March." (lime punchline on the last line). Font-path detection now resolves from the repo root rather than a hardcoded session path. Script comments + scripts/README.md updated. \`docs/brand/logo-explorations/og/og-hero.svg\` + \`.png\` regenerated; \`og-brand.png\` + \`og-callout.png\` also refreshed for consistency.

**Marketing app (apps/marketing) — NOT touched in this pass.** The Astro site still leads with the older positioning and references competitor brands on \`/vs\`. A Claude Code prompt for the marketing-app rewrite is being delivered alongside this commit so the app can be brought up to the refined identity in a separate change.

Known gaps. (a) The \`apps/marketing\` Astro site still carries old positioning + named-brand \`/vs\` content — covered by the Claude Code prompt. (b) The carousel HTML (\`docs/brand/marketing/carousels/001-hate/carousel.html\`) still bakes the April hero — left as-is because the file is marked SUPERSEDED and the rendered carousel PDF is already in the public timeline. (c) The April retrospective template still has scaffolding for a launch that ran with the old voice — left intact as a record. (d) The marketing-app i18n dictionaries, OG meta, and \`/vs\` page need a person to read the new foundation.md + identity.md before the rewrite ships.



