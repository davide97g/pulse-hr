---
type: concept
tags: [concept, ai]
last_updated: 2026-04-26
---

# Copilot

The natural-language overlay. Triggered with `⌘J` (or `Ctrl+J`). Runs locally in the browser — no server round-trip needed for the parsing layer.

## What it does

- Parses intent from a phrase like "log 4h on ACM-2025-01" or "request leave Friday afternoon" or "give 20 kudos to Marcus."
- Surfaces a runnable action with confirm / edit / open options.
- Toasts the result and (optionally) navigates to the resulting record.
- Streams fake answers when used as a "what's happening this week?" assistant.

## Distinct from [[Status Log]]

[[Status Log]] is a *conversation* — open-ended, sentiment-tracked, manager-summarized. Copilot is a *command bar* — deterministic, action-oriented, no transcript. Both can use voice input; only Status Log keeps a session.

## Where it lives

Global overlay. Triggered from:

- `⌘J` keyboard shortcut.
- The quick-action chips on [[Dashboard]].
- The `+` button in the topbar.

## Related

[[Command Palette]] · [[Status Log]] · [[Keyboard-First]]
