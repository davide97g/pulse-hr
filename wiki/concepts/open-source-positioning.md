---
type: concept
aliases: [Open Source Positioning, OSS]
tags: [concept, brand]
last_updated: 2026-05-16
---

# Open Source Positioning

Pulse HR is fully open source under FSL-1.1-MIT, converting to MIT after two years. The repo is public. The roadmap is public. Self-host on your own infra, or pay us to host. There's no "talk to sales" tier — the demo is the sales call.

## Why it's a pillar, not the headline

Open source supports the [[Mission]] — it's how an IC can self-install Pulse without asking permission, and how a team owns its own data. It is **not** the spine of the brand. The spine is **employee-first**: recognition, merit, proof. Open source is the credibility proof that we mean it.

If a marketing page leads with "self-hostable, modular, hackable," we've drifted. Lead with the IC's problem ("your best work is invisible"); mention self-hosting as the answer to "but who owns my data?" and "but can I trust this?"

## The pillars

- **Open.** Full source on GitHub. No feature gates behind a sales call. Licence is FSL-1.1-MIT, converting to MIT after two years.
- **Yours.** Self-host in 90 seconds with `docker compose up`, or run the Helm chart, or use the Terraform module. Export everything anytime. No proprietary lock-in.
- **Transparent.** Public roadmap, public changelog, public commits, security policy in the open, telemetry schema documented. The voting board at `feedback.pulsehr.it` decides what we build next.
- **Built by the people who use it.** Maintainers run Pulse daily. The roadmap is shaped by pull requests, not product managers.

## How this shows up in the product

- [[Demo Mode]] — no login wall; visitors play with the whole UI before signing up.
- [[Feedback]] — public roadmap and voting board.
- [[Modules]] — granular feature toggles, not paid tiers.
- The repo's `docker-compose.yml`, Helm chart, and Terraform module are first-class artefacts, not afterthoughts.
- Every deliverable has a self-host story by default. If a feature can't be self-hosted, it doesn't ship in the OSS core.

## Business model

Two ways to pay:

1. **Self-host, free.** Run it on your own infra. Forever. The licence flips to MIT after two years.
2. **Cloud, paid.** We host it for you. Updates, backups, EU residency, support. Pricing is public; no quotes.

That's it. No "enterprise" tier with extra features. The OSS engine is the whole product.

## Audience for the open-source story

The IC dev/designer who finds Pulse on a "Show HN" or in a friend's Slack. They self-host the demo to see whether it sucks. If it doesn't suck, they pull their team in. See [[Target Audience]] for the full picture.

## See also

- [[Mission]] · [[Vision]] · [[Brand Voice]] · [[Target Audience]]
