# AGENTS.md — Wiki schema and workflows

You are maintaining the Pulse HR product wiki. This file is the schema. Read it fully before ingesting, querying, or linting.

## Purpose

The wiki models **Pulse HR as a product**, not as code. The audience is HR-minded humans first, agents second. Every page should be readable by someone who has never opened a terminal.

You write and maintain the wiki. Humans read it. They will rarely edit pages directly — that is your job.

## Hard rules

1. **No technical content.** Never document APIs, React patterns, hooks, build tooling, file paths, environment variables, or any engineering plumbing. That belongs in `CLAUDE.md` and source comments. If you find yourself typing a code block, stop.
2. **Never invent features.** If you are unsure whether something exists, check `apps/app/src/routes/`, `apps/marketing/src/`, or ask the user. Better to file a stub than fabricate.
3. **Italian domain terms get a glossary entry.** First mention on any page wikilinks to `glossary/<term>.md`. Add a glossary page if missing.
4. **Every page has frontmatter.** `type` and `last_updated` are required.
5. **Wikilinks for internal references.** Use `[[Page Name]]`. Use standard markdown links only in `README.md` and `index.md` (so GitHub renders them).
6. **No screenshots, no images** — text + wikilinks only. Reconsider for a journey page if a diagram is genuinely useful.
7. **Read-mostly outside ingest/lint.** During normal coding sessions, agents read the wiki for context but do not modify it. Modifications happen during explicit `/wiki-ingest` or `/wiki-lint` flows.

## Folder structure

```
wiki/
  README.md       index.md       log.md       AGENTS.md
  personas/   features/   entities/   concepts/   journeys/   glossary/
```

Folder names are stable. File slugs are kebab-case English.

## Frontmatter

```yaml
---
type: persona | feature | entity | concept | journey | glossary
tags: [people, work, money, insights, labs, workspace, italian]
last_updated: YYYY-MM-DD
---
```

`type` and `last_updated` are required. `tags` are optional but help Obsidian filtering.

**Aliases.** When a file's slug is kebab-case but the title has spaces (e.g. `time-tracking.md` → "Time Tracking"), add `aliases: [Title Case]` so wikilinks like `[[Time Tracking]]` resolve in Obsidian. Always set this on creation for any multi-word filename.

## Page shape by type

- **persona** — Who they are · What they do daily in Pulse · Theme + accent · Features they touch · Pain points addressed.
- **feature** — What it is (HR-plain English) · Who uses it · Key entities involved · Notable behaviors (NEW-badged, offline-capable…) · Related journeys.
- **entity** — Definition · Italian name if any · Lifecycle / states · Connected entities · Where it appears.
- **concept** — Definition · Scope · Which features embody it.
- **journey** — Numbered steps. Wikilinks to every touched feature/entity. Mention the persona who experiences the step.
- **glossary** — Italian term · English translation · One-paragraph context · Wikilink to canonical entity/feature page.

Keep pages short — 100-300 words. Wikilinks do the heavy lifting, not prose.

## Workflows

### Ingest (`/wiki-ingest` or "ingest the diff")

Triggered by the user before merging a branch.

1. Read the branch diff (`git diff main...HEAD`) and the commit messages.
2. Summarize the change in plain HR-readable English. If the change is purely technical (refactor, dependency bump, build config), report "no wiki impact" and stop.
3. Identify which existing wiki pages it touches (use `index.md` to find candidates).
4. Update those pages. Bump `last_updated`. Preserve voice and length.
5. Create new pages for genuinely new product concepts/entities/features. Add them to `index.md`.
6. Append an entry to `log.md`:
   ```
   ## [YYYY-MM-DD] ingest | <commit subject or branch name>
   <one paragraph: which pages changed, why, anything notable>
   ```
7. Report back to the user: list of pages created, updated, and any "needs research" stubs you filed.

### Query

When answering product questions in any session:

1. Read `index.md` first to find candidate pages.
2. Drill into named pages via wikilinks.
3. Synthesize the answer with citations (e.g. "see [[Commessa]]").
4. If the wiki is missing something, file a stub with a `needs-research` tag, append a `query` log entry, and tell the user.

### Lint (`/wiki-lint`)

Triggered manually, weekly or on demand.

Check for:

- **Orphans** — pages with no inbound wikilinks.
- **Contradictions** — claims on page A that disagree with page B.
- **Stale claims** — wiki content that contradicts current source/marketing.
- **Missing cross-references** — features reference entities that aren't wikilinked.
- **Important nouns without a page** — concepts mentioned ≥3 times across the wiki but lacking their own entity/concept page.
- **Glossary gaps** — Italian terms used in pages but not in `glossary/`.
- **Broken wikilinks** — pages that point to files that don't exist.

Output a report grouped by category, propose fixes, wait for user approval, then apply. Append a `lint` log entry summarizing the pass.

## Voice

Plain English. Present tense. Second person where natural ("Employees see…"). No marketing fluff, no engineering jargon. Italics for first mention of a glossary term, then the wikilink.

## Decision tree — what folder?

- Is it a person? → `personas/`
- Is it a screen / product surface? → `features/`
- Is it a noun the app stores or shows? → `entities/`
- Is it a cross-cutting idea (theme, mode, design pattern)? → `concepts/`
- Is it an end-to-end flow across multiple features? → `journeys/`
- Is it an Italian / HR-jargon term? → `glossary/`

When in doubt, prefer fewer pages: extend an existing page rather than splitting.

## First-mention rule

The first occurrence of any Italian term on any page wikilinks to its glossary entry. Subsequent uses on the same page are plain text.

## Sources

The wiki's raw layer is the repo itself. When researching, prefer (in order):

1. `CLAUDE.md` (root) — overall product description.
2. `apps/app/src/routes/` — feature surface.
3. `apps/app/src/lib/mock-data.ts` — entity shapes and lifecycles (translate to HR language).
4. `apps/marketing/src/data/` and `apps/marketing/src/pages/` — positioning, persona narrative.
5. `packages/tokens/src/themes/` — role-theme mapping.
6. `apps/api/src/db/schema.ts` — entity relationships (read for structure, render in HR terms).

Never paste source code into the wiki. Always render the meaning in plain English.
