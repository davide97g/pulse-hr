---
type: persona
tags: [persona, secondary]
last_updated: 2026-05-16
---

# Admin

> **Secondary persona.** Often the same IC who self-hosted Pulse, now wearing a second hat. Sometimes a separate ops person at the company that adopts.

Workspace owners. The person who set up Pulse HR for the org. In the bottoms-up motion (see [[Target Audience]]), this is usually the developer who ran `docker compose up` in the first place — they're already comfortable in a terminal and they don't want a "platform engineering" team between them and their tools.

## What they do in Pulse

- Configure which features each role sees (workspace [[Modules]] page).
- Manage [[Marketplace]] integrations (Slack, calendar, identity providers).
- Issue API keys and webhooks for the [[Developers]] surface.
- Switch role override to "view as Employee / HR / Manager / Finance" to debug what someone else sees.
- Access **everything** — admins are unfiltered. Other roles see a curated subset; admins see the full sidebar.
- Adjust [[Settings]] for the workspace (branding, theme defaults, locale).

## Features they touch

Everything. Admin is the only role with no feature gates. In particular: [[Modules]], [[Marketplace]], [[Developers]], [[Settings]], plus full visibility into [[Reports]] (People Insights).

## Pain points addressed

- "I want to onboard a small ops team without paying per seat for features they don't need." → [[Modules]] toggles features per role.
- "I need to see what HR sees right now." → role-override switcher (see [[Role Override]]) lets admins view as another role.
- "Integrations live in five places." → [[Marketplace]] is the single index.
- "I want to run this on my own infra." → `docker compose up`, Helm chart, or Terraform module. See [[Open Source Positioning]].

## See also

- [[Target Audience]] — the IC-first adoption motion that produces most admins.
- [[Employee]] · [[Open Source Positioning]]
