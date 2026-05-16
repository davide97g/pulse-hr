---
type: concept
aliases: [Target Audience, Audience]
tags: [concept, brand]
last_updated: 2026-05-16
---

# Target Audience

Who Pulse HR is built for. Read this before writing marketing copy, product copy, or roadmap rationale. Any feature that doesn't make the primary persona's first ten minutes better is suspect.

## Primary: the IC dev or designer at a tech-forward company

A specific person. Mid-20s to mid-30s. Engineer, designer, analyst, sometimes PM. Works at a 20–200-person tech company, or a tech-forward team inside a bigger one. Lives in their editor, in Slack, in Figma, in Linear. Comfortable on the command line. Has installed at least one open-source tool this month without asking permission.

Their problem isn't "we need HR software." Their problem is:

- **My best work is invisible.** It's in a closed PR, a Slack DM, a demo I gave six weeks ago, a Figma file someone pinned and then forgot.
- **Performance review week, I'm reconstructing my year from screenshots.** Then I lose the argument because the person on the other side isn't.
- **Recognition is a screenshot in #general.** Then it scrolls.
- **Growth is a vague "you should level up to senior" comment from a 1:1 in March.** No artefact, no trail, no proof.
- **The HR app is the thing I open once a quarter to fill in a form I don't believe in.**

They are not asking for HR software. They are asking for **proof of work** they can carry around with them.

## How they find Pulse

- "Show HN: Pulse HR — an open-source workspace where ICs log their own work."
- A friend's Slack: "btw I started self-hosting this thing for our standups, it's actually good."
- A tweet/post: a screenshot of three lines and a kudos toast.
- A blog post: "I replaced my one-on-one prep with a `docker compose up`."

They land on the marketing site, click through to GitHub, then to the demo, then they self-host — **in that order**. If any of those three steps takes more than two minutes, we've lost them.

## How they bring their team in

1. They use Pulse solo for a week — [[Status Log]] every morning, a [[Kudos|kudos]] to a teammate via the public feed.
2. The teammate gets the kudos. Asks what the app is. Joins the workspace.
3. Two more people join in week two.
4. Their manager notices the team's Friday recap is now a coherent paragraph instead of a guess.
5. By month three, the team is on it. By month six, the company is.

We optimise for steps 1 and 2. Step 5 takes care of itself.

## Secondary personas — they enter via the IC

- [[Manager]] — pulled in when their team is already using Pulse. We design for the IC; the manager-safe sentiment recap is the artefact we hand the manager so the trust doesn't break.
- [[HR]] — pulled in last. By the time HR notices Pulse, the workspace is already running. HR's job becomes curating People Insights, not rolling out the tool.
- [[Admin]] — usually the IC who self-hosted, now wearing a second hat. Sometimes a separate ops person at the company that adopts.
- [[Finance]] — explicitly **not** a Pulse persona. Pulse is the people half; the money half lives in the tools built for it.

## Who Pulse is *not* for

- Enterprise HR teams that want a single vendor for payroll, time, recruiting, and engagement. We've parked all of that on purpose.
- Companies whose biggest people problem is compliance, not visibility. SOC 2 audits are fine; we're not a compliance product.
- Teams that already love their HR tool. We're not here to start a fight.
- Anyone who needs "talk to sales" before they try the product. The demo is the sales call.

## What this means for the roadmap

- Any feature that doesn't make the IC's first ten minutes better is suspect.
- Any feature that gates on HR or admin to be useful is suspect.
- Any feature that makes the manager more powerful without making the IC more visible is wrong.
- Any feature that requires a sales conversation to unlock doesn't ship.

## See also

- [[Mission]] · [[Vision]] · [[Brand Voice]] · [[Open Source Positioning]]
- Personas: [[Employee]] (the IC, primary) · [[Manager]] · [[HR]] · [[Admin]] · [[Finance]]
