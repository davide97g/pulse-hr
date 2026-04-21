# Changelog

All notable user-facing changes to Pulse HR. Each `## version — date — "title"` section
below becomes a release announcement. An optional fenced ` ```tour ` block embeds an in-app
tour that the "What's new" prompt can launch.

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
