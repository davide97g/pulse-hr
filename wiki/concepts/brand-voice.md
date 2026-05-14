---
type: concept
aliases: [Brand Voice, Voice]
tags: [concept, brand]
last_updated: 2026-05-14
---

# Brand Voice

How we write — in marketing, in the wiki, in the product, in commits.

## The rules

1. **Plain English. Present tense. Second person where natural.**
   "You log a day off and it's logged." Not "Employees may submit a leave request which will then be processed."

2. **No marketing fluff.**
   No "leverage," "unlock," "synergize," "best-in-class," "next-generation." If you'd be embarrassed to read it back to a friend over coffee, cut it.

3. **No engineering jargon in user-facing copy.**
   "Async standup" is fine; "event-driven sentiment aggregation pipeline" is not. The user is a person at work, not a developer at a conference.

4. **Italics on first mention of an Italian term.**
   Then plain text from there. Glossary entry linked once. *Ferie* → [[ferie]] on first mention; ferie afterwards.

5. **Honest about what we don't do.**
   "Pulse doesn't track hours" beats "Pulse offers a streamlined hour-tracking experience." When asked "does it replace my HRIS?", the answer is "no, and that's the point."

6. **One specific number beats three vague ones.**
   "Three lines a day" beats "minimal daily input." "Eight surfaces" beats "a comprehensive suite."

7. **Anti-positioning is a feature, not a fight.**
   We say what we're not because it helps people decide. We don't dunk on Lattice, Workday, Rippling. Pick them if they fit you better — we'll still be here when you change your mind.

8. **Manager-safe by default.**
   When in doubt, write as if the employee will read it over the manager's shoulder. Recognition is public; concern is private; raw sentiment data never travels.

9. **Quiet humour, never sarcasm.**
   "Riposo. Take care of yourself." beats "You've earned a break, you absolute legend."

10. **Sign your work.**
    Commit messages, changelog entries, public posts — Pulse is built by humans, in public. The voice is plural ("we ship") but the people are named.

## Lexicon — preferred terms

| Use | Not |
|---|---|
| people, teammates, the team | resources, headcount, FTEs |
| log a day off | request leave |
| Status Log | daily journal, AI standup |
| kudos, recognition, grazie | rewards, points, gamification |
| workload check-in | utilisation, saturation, capacity |
| People Insights | reports, analytics |
| Pulse vibe | engagement score (when shown to the team), survey result |
| growth, achievements | performance review, KPIs |
| parked | deprecated, deleted, removed |

## Voice in product surfaces

- **Empty states are friendly.** "Nothing logged yet" beats "No records found."
- **Confirmations are concrete.** "Logged · Added to your time off journal" beats "Success."
- **Errors are honest.** "We can't reach the server — your change is saved locally and will sync when we're back" beats "An error occurred."

## See also

- [[Mission]] · [[Vision]]
- [[wiki/AGENTS.md|AGENTS.md]] — voice rules for wiki authoring specifically.
