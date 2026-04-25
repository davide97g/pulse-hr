# Changelog

All notable user-facing changes to Pulse HR. Each `## version — date — "title"` section
below becomes a release announcement. An optional fenced ` ```tour ` block embeds an in-app
tour that the "What's new" prompt can launch.

## 0.7.0 — 2026-04-25 — "Voting power, with a real economy"

Voting power stops being a vanity number and becomes a usable currency. Every account starts with **10**, every vote on a comment or proposal **costs 1**, and the balance **refills weekly to 10** without accumulating beyond that. New comments and new proposals are still free, but each capped at **10 per UTC day** so the board doesn't drown in noise.

- **Spend to vote** — upvotes and downvotes both cost 1. Retracting refunds 1. Switching from up to down (or vice-versa) refunds and recharges in one round, so net cost is the same as a single vote.
- **Weekly refill** — power tops back up to 10 every 7 days, lazily on read. Boosted balances above 10 do not refill — those are earned and stay until you spend them.
- **Daily caps** — 10 new comments and 10 new proposals per UTC day, per user. Replies to existing threads stay unlimited so conversations aren't throttled.
- **Earn more power** — completing a questionnaire grants **+10**, once per round (the company-profile questionnaire is the only round live today). When a comment or proposal you authored moves to **planned**, you earn **+10** as a one-shot reward.
- **Migration** — the previous "double the baseline" bonus is replaced by the new +10 grant. Existing voting-power events are archived to `voting_power_events_legacy` for audit, and questionnaire completers keep their boost (now +10 above the new 10 baseline, so 20 total).
- **Out of power UX** — vote attempts on an empty wallet return a structured error and toast in both `apps/app` and `apps/feedback`. Daily-cap-reached toasts keep the composer open with the user's draft intact.

```tour
{
  "id": "release-0.7.0",
  "name": "What's new in 0.7.0",
  "workflow": "Getting started",
  "duration": "1 min",
  "steps": [
    {
      "title": "You start with 10 voting power",
      "body": "Every vote on a comment or proposal costs 1, retracting refunds it, and the balance refills weekly to 10. The chip in the topbar shows what you've got and when the next refill lands."
    },
    {
      "title": "Earn more by helping us",
      "body": "Complete a questionnaire round to earn +10. When a comment or proposal you wrote moves to ‘planned', you earn another +10 — once per item, automatically."
    },
    {
      "title": "Daily caps on new posts",
      "body": "Up to 10 new live comments and 10 new proposals per UTC day. Replies don't count, so conversations stay open. If you hit the cap, the composer keeps your draft and tells you to come back tomorrow."
    }
  ]
}
```

## 0.6.0 — 2026-04-22 — "Tell us about your company, double your voting power"

Pulse now asks new accounts a few short questions about their company — name, website, size, industry — and rewards a complete, honest answer with double the baseline voting power. Voting power is a new Labs primitive that will weigh future in-product decisions, so getting it seeded early matters.

- **Signup step 4** — a new final step after role selection. Skippable. A valid submission doubles voting power from 100 to 200.
- **Dashboard banner** — users who skipped see a dismissible banner on the dashboard with a one-click "Complete profile" dialog.
- **Topbar chip** — shows your current voting power next to the Status Log button. Click it to open the new page.
- **/voting-power** — new Labs page under **Me**. Shows current vs baseline, the multiplier, "how to earn", and a running history of grant events.
- **Persistence** — answers and voting power are stored in the database, not just in memory. Four new tables prepare for future surveys: `user_profiles` (normalized, with placeholders for intentions, desires, origin, pain point, source, and UTM fields), `questionnaire_responses` (append-only JSON log so questionnaires can evolve without migrations), `voting_power`, and `voting_power_events` (an audit ledger).
- **API** — new `/user-profile/*` endpoints (`GET /me`, `POST /company-profile`, `POST /skip`), all Clerk-authenticated.

UTM source capture is scaffolded in the schema but not yet wired to the signup flow — that ships next.

## 0.5.0 — 2026-04-22 — "Everything you touch sticks"

Until now, most of Pulse remembered a handful of things across reloads (people, leave, expenses) and quietly forgot the rest. Create a project, log a focus session, send kudos, add a webhook, move a candidate through the pipeline — reload and it was gone. Not anymore. This release wires the whole product onto the same local-storage foundation the core HR surfaces were already using, so every edit you make survives a refresh.

- **Clients & Projects** — new clients, new projects, edits, deletes (with Undo) all persist. Removing a client still cascades to its projects, and Undo brings the whole thing back.
- **Kudos** — the feed persists, balance derives from what you've actually sent this month, and the allowance is a more generous 300. The feed now sorts latest-first and has multi-select tag chips + a search box across message, sender, recipient.
- **Focus Mode** — completed sessions stick. Your streak, daily total, and history survive reload.
- **Announcements** — posts, pins, reactions, and comments all persist.
- **Recruiting & Onboarding** — candidate stage moves, job drafts/open/closed toggles, workflow task ticks — all remembered. Recruiting and onboarding ship together because they reference each other.
- **Calendar** — events you create or import persist. Disconnecting Google now hides events from view instead of wiping them; reconnecting brings them back.
- **Time & Payroll** — every timesheet edit (clock-in log, smart-fill, inline edits, duplicate, submit, bulk ops with Undo) persists. Payroll run deletion and mark-completed persist.
- **Developers** — API keys, webhooks, custom fields all round-trip. Delete actions gain Undo toasts.
- **Settings → Roles** — role CRUD persists.
- **Log** — daily thread, agent replies, and manager asks persist. Snoozing an ask survives reload now.
- **Marketplace** — installed/uninstalled state sticks.
- **Reports** — "Export CSV" actually downloads a CSV file instead of toasting a fake success.

If you've been treating Pulse as a sketchpad, things will feel noticeably stickier. Workspace reset in **Settings → Workspace** wipes everything back to the original demo seed, as before.

```tour
{
  "id": "release-0.5.0",
  "name": "What's new in 0.5.0",
  "workflow": "Getting started",
  "duration": "1 min",
  "steps": [
    {
      "title": "Your edits now stick",
      "body": "Create a client, draft a job posting, log a focus session, add a webhook — reload and it's all still there. Every surface in Pulse now persists to local storage the same way People, Leave, and Expenses already did."
    },
    {
      "title": "Kudos feed, filtered",
      "body": "The kudos feed sorts latest-first and has tag chips above it. Click Craft + Impact to see just those, or type into the search box to match message, sender, or recipient.",
      "route": "/kudos"
    },
    {
      "title": "Workspace reset still works",
      "body": "If you want to start fresh, Settings → Workspace → Reset wipes everything back to the original demo seed — same as before.",
      "route": "/settings"
    }
  ]
}
```

## 0.4.0 — 2026-04-21 — "Proposals on the feature board"

Comments were great for pinning a bug to a specific screen, but not everything lives on a page. Now you can post a detached **proposal** — bug, idea, or improvement — that lands on the same board, with the same upvotes, replies, and triage columns.

- **New shortcut** — press `⌘⇧O` anywhere in Pulse to open the proposal composer. Also available via `⌘K → New proposal` and the **Propose** button on the Feedback board.
- **Three categories** — Bug, Idea, Improvement. Each card shows a colored badge in place of the route chip.
- **Same triage flow** — proposals share the Open / Triaged / Planned / Shipped / Won't do columns with comments. Admins drag between columns, everyone else upvotes and replies.
- **Just three fields** — title, description, type. No screenshots, no attachments, no tags.

Existing pins and comments are unchanged — they still show their `/route` chip and keep working exactly as before.

```tour
{
  "id": "release-0.4.0",
  "name": "What's new in 0.4.0",
  "workflow": "Getting started",
  "duration": "1 min",
  "steps": [
    {
      "title": "Propose anything",
      "body": "Press ⌘⇧O anywhere in Pulse to open the proposal composer. Pick Bug, Idea, or Improvement, write a title and description, and it lands on the feature board."
    },
    {
      "title": "Same board, two kinds",
      "body": "Comments keep their page-pinned chip. Proposals show a colored BUG / IDEA / IMPROVEMENT badge. Upvotes, replies, and status drag work identically across both.",
      "route": "/feedback"
    }
  ]
}
```

## 0.3.0 — 2026-04-21 — "Bun backend + brand refresh"

Behind-the-scenes rewiring you mostly won't feel, plus a deliberate visual reset.

- **Signature theme** — lime-on-near-black from the marketing site is now the default. Existing accounts keep the theme they last picked.
- **Dedicated backend** — every `/api/*` route moved out of the Vite SPA into a long-running Bun + Hono server living at `api.pulsehr.it`. Cold starts are gone and the frontend bundle is lighter.
- **Three clean domains** — `pulsehr.it` for marketing, `app.pulsehr.it` for the product, `api.pulsehr.it` for the API.
- **Email from our domain** — release notes and `@mention` alerts now send from `send.pulsehr.it`, so they actually hit the inbox instead of Resend's sandbox.

Nothing to do on your end — preferences, data, and keyboard muscle memory are all preserved.

```tour
{
  "id": "release-0.3.0",
  "name": "What's new in 0.3.0",
  "workflow": "Getting started",
  "duration": "1 min",
  "steps": [
    {
      "title": "New look",
      "body": "The default theme now matches the marketing identity — lime on near-black. If you preferred the old light palette or a role-specific one, the Help & tours menu in the sidebar footer has the switcher."
    },
    {
      "title": "Same app, faster",
      "body": "Bell, comments, kudos, focus, forecast — every keyboard shortcut still works. The API just runs on its own server now (api.pulsehr.it) instead of hitching a ride on Vercel.",
      "target": "topbar-notifications",
      "placement": "bottom"
    }
  ]
}
```

## 0.2.0 — 2026-04-21 — "In-app + email notifications"

The bell is real. New events (comments, replies, votes, status changes, @mentions) now create
persisted notifications, and releases announce themselves by email and in-app.

- Persistent notifications with unread badge in the topbar bell
- Outbox-backed email delivery (Resend) with daily rate-limit guard
- `@name` mentions in replies notify the tagged admin (in-app + email)
- Per-channel email preferences in **Settings → Notifications**
- Changelog app-tour launches automatically on new releases

```tour
{
  "id": "release-0.2.0",
  "name": "What's new in 0.2.0",
  "workflow": "Getting started",
  "duration": "1 min",
  "steps": [
    {
      "title": "A real inbox",
      "body": "The bell up top now persists every notification — comments, replies, votes, state changes, and release notes like this one.",
      "target": "topbar-notifications",
      "placement": "bottom"
    },
    {
      "title": "Tune your email",
      "body": "Pick which categories email you. Everything else still lands in the bell.",
      "route": "/settings"
    }
  ]
}
```

## 0.1.0 — 2026-04-01 — "Initial public release"

First cut. Sidebar visibility, role overrides, feedback board, kudos, focus mode, commessa
forecast, and the offices module.
