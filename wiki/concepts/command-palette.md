---
type: concept
aliases: [Command Palette]
tags: [concept]
last_updated: 2026-04-26
---

# Command Palette

Pulse HR's `⌘K` (or `Ctrl+K`) fuzzy finder. The fastest way to navigate.

## What it finds

- [[Employee]]s — by name, role, department, location.
- [[Commessa]]e — by code, name, client.
- [[Document]]s — by title.
- [[Settings]] entries.
- [[In-App Docs]] topics.
- Sidebar destinations (jump to any feature without clicking).

## Intent parser

Beyond fuzzy navigation, the palette also runs a deterministic local intent parser (`apps/app/src/lib/nlp.ts`) for natural-language actions like `log 4h on ACM-2025-01` or `request leave next Friday`. No LLM is involved; the parser maps phrases to runnable actions scoped by the caller's permissions.

## Related

[[Keyboard-First]]
