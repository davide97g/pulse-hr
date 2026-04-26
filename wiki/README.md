# Pulse HR Wiki

This is the **product knowledge base** for Pulse HR — an HR-readable, LLM-maintained companion to the source code. Open it as an [Obsidian](https://obsidian.md) vault for the best experience (graph view, wikilinks, frontmatter); browse it on GitHub for a plain read.

## What this wiki is

A synthesis layer that sits between you and the codebase. It models **product concepts** — features, personas, business entities, end-to-end journeys, Italian domain terms — in plain English. It does **not** model APIs, React patterns, build tooling, or file paths.

If you are a non-technical reader (HR, ops, a curious customer) trying to understand what Pulse HR does, start here. If you are an LLM agent, read [AGENTS.md](./AGENTS.md) before doing anything else.

## How to read it

| Folder | What's inside |
|---|---|
| [`personas/`](./personas) | The five roles Pulse HR is built for (Employee, HR, Manager, Admin, Finance). |
| [`features/`](./features) | Every product surface, one page each, in plain English. |
| [`entities/`](./entities) | The nouns the product revolves around (Employee, Commessa, Timesheet…). |
| [`concepts/`](./concepts) | Cross-cutting ideas (Labs, role themes, Copilot, offline mode…). |
| [`journeys/`](./journeys) | End-to-end narratives (onboard a new hire, run payroll, submit an expense…). |
| [`glossary/`](./glossary) | Italian HR vocabulary glossed in English. |

The [`index.md`](./index.md) is the catalog of every page with a one-line summary. The [`log.md`](./log.md) is the chronological record of when each ingest, query, or lint happened.

## How it stays current

Pulse HR is built in public and changes constantly. The wiki is updated **before each branch merges** — the LLM reads the diff, updates the affected pages, and appends a log entry. There's no CI magic; a human runs the ingest command.

If you spot something stale or wrong, open an issue or note it during your next agent session.

## License & openness

The wiki is part of the public repo and inherits its license. Contributions welcome — but the LLM does most of the maintenance. Your job is to ask good questions.
