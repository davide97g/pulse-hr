---
type: concept
aliases: [Brand Voice, Voice]
tags: [concept, brand]
last_updated: 2026-05-16
---

# Brand Voice

How we write — in marketing, in the wiki, in the product, in commits. The voice is **opinionated in stance, plain in language**. We have a clear point of view about how work should be visible. We say it out loud without raising our voice. English is the source of truth; Italian is a full-fidelity translation.

## The rules

1. **Plain English. Present tense. Second person where natural.**
   "You log a day off and it's logged." Not "Employees may submit a leave request which will then be processed."

2. **No marketing fluff.**
   No "leverage," "unlock," "synergize," "best-in-class," "next-generation." If you'd be embarrassed to read it back to a friend over coffee, cut it.

3. **No engineering jargon in user-facing copy.**
   "Async standup" is fine; "event-driven sentiment aggregation pipeline" is not.

4. **Have a point of view.**
   We say what we think work should look like, in concrete terms: "Three lines beat a stand-up." "A kudos that survives the week is worth more than one that scrolls." We don't hedge with "different tools work for different teams." If we believe one way is better for the IC, we say so plainly.

5. **Describe what we're improving on, not what we're fighting.**
   We talk about the IC's actual day: the demo from Friday afternoon that's gone by Monday, the kudos that scrolls off in a Slack channel, the growth conversation with no artefact behind it. That's the gap we fill. We frame it as the thing we make better, not the thing we're at war with.

6. **No named competitors. Ever.**
   We don't name other HR or people-ops products in product copy, marketing, blog posts, or social — not to compare, not to dunk, not even to say "we're not like them." The identity stands on what Pulse is, not on what others aren't. The `/vs` page, if it exists at all, describes patterns and trade-offs, not logos. (A future marketing campaign may decide to roast specific products in a slide deck — that's a campaign choice, not an identity choice. The foundation here stays clean.)

7. **Honest about what we don't do.**
   "Pulse doesn't track hours" beats "Pulse offers a streamlined hour-tracking experience." When asked "does it replace my HRIS?", the answer is "no, and that's the point." We've parked half the product on purpose; the parked half is a feature.

8. **One specific number beats three vague ones.**
   "Three lines a day" beats "minimal daily input." "`docker compose up` in 90 seconds" beats "easy self-hosting." "Two years to MIT" beats "developer-friendly licence."

9. **Manager-safe by default.**
   Raw chat stays with the employee. The aggregate goes up. Write all surfaces as if the employee will read what the manager sees — because they can, and they should.

10. **Italics on first mention of an Italian term.**
    Then plain text from there. Glossary entry linked once. *Ferie* → [[ferie]] on first mention; ferie afterwards.

11. **Sign your work.**
    Commit messages, changelog entries, public posts — Pulse is built by humans, in public. The voice is plural ("we ship") but the people are named.

## Lexicon — preferred terms

| Use | Not |
|---|---|
| IC, the team, people | resources, headcount, FTEs |
| log a day off | request leave |
| Status Log | daily journal, AI standup |
| kudos, recognition, grazie | rewards, points, gamification |
| workload check-in | utilisation, saturation, capacity |
| People Insights | reports, analytics |
| Pulse vibe | engagement score, survey result |
| growth, achievements, proof | performance review, KPIs |
| parked | deprecated, deleted, removed |
| self-host | on-prem |
| bottoms-up | enterprise rollout |
| run the demo | request a trial |

## Voice in product surfaces

- **Empty states say what to do next.** "Nothing logged yet. Three lines is enough — what did you ship today?" beats "No records found."
- **Confirmations are concrete.** "Logged · in your time off journal" beats "Success."
- **Errors are honest.** "We can't reach the server — your change is saved locally and will sync when we're back" beats "An error occurred."
- **Toasts have texture.** A kudos sent gets confetti and a one-line acknowledgement. A leave logged gets a quiet "*Riposo.* Take care of yourself." Recognition is loud; rest is quiet.

## Voice in marketing copy

- Lead with the IC's situation, not the product's feature. "Your best work is buried in a Slack thread from March" before "Pulse is an open-source workspace for…"
- Show, don't promise. A screenshot of three lines, a kudos toast, a `docker compose up` terminal beats a paragraph of adjectives.
- One headline says one thing. Don't try to say five.
- Calls to action are verbs. "Run the demo." "Read the source." "Self-host in 90 seconds." Not "Get started today" or "Learn more."
- Italian is a translation, not a different message. If a headline doesn't land in both languages, rewrite the English first.
- We never name another product in marketing copy. If a comparison is unavoidable, describe the pattern ("the spreadsheet you maintain by hand," "the form nobody fills in"), never the brand.

## Voice in commits and changelogs

- Conventional-ish prefixes: `feat(scope):`, `fix(scope):`, `chore(scope):`, `refactor(scope):`. Short imperative subject.
- A body explains the *why*. The diff explains the *what*.
- Changelogs published on the marketing site read like a person wrote them — because a person did.

## See also

- [[Mission]] · [[Vision]] · [[Target Audience]] · [[Open Source Positioning]]
- [[wiki/AGENTS.md|AGENTS.md]] — voice rules for wiki authoring specifically.
