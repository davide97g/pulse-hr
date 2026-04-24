# First-comment bomb — Carousel 001

Three comments pre-drafted to seed the thread in the first 30 minutes.
LinkedIn's algorithm weights **early dwell time + reply count** heavily
— these give us both without looking like spam.

**Why three.** One from the company page (the prompt), one from Davide
(the model answer that invites others to pile on), one from Niccolò
(the technical side-door for developers). Three voices, one thread —
reads like a real conversation, not a marketing push.

**Do not post from sockpuppet accounts.** All three are real profiles
we actually own.

---

## 17:03 — Comment 1 · `@pulsehr` company page

Post this as the **pinned first comment** on the carousel, 2–3 minutes
after the post goes live. Purpose: invite the audience into the roast.

```
Honest question for everyone who's ever used an HRIS at work:

What's the ONE feature that made you hate it most?

We want to roast it in public. And then maybe fix it. Drop it below — we read everything.

(Bonus points if you can name the vendor. We're not scared.)
```

---

## 17:15 — Comment 2 · Davide Ghiotto (personal profile)

Post this as a **reply to Comment 1**, from Davide's personal LinkedIn.
Purpose: model the answer, add a concrete repo link, invite everyone
else who scrolls this thread to do the same.

```
I'll start.

BambooHR's team-leave calendar that shows my direct team but not the team sitting literally next to me. The fact that "see whether adjacent teams are out this week" is considered a premium feature and not a bug is, essentially, why I'm here.

Pulse's fix is public btw: github.com/davide97g/pulse-hr/issues/27
(The issue number might be different by the time you read this — point is, it's public. They're all public.)
```

**Note.** Before 17:00, open the repo and grab a real existing issue
number that maps to the BambooHR-calendar pain. If issue #27 isn't that
issue, swap the number. Replace with any honest labelled issue we'd
happily point someone at. Don't fabricate.

---

## 17:30 — Comment 3 · Niccolò Naso (personal profile)

Post this as another **reply to Comment 1**, from Niccolò's personal
LinkedIn. Purpose: open the technical side-door — the dev who scrolled
here from Ring A needs somewhere to land.

```
For the developers in this thread:

The codebase is a Bun monorepo — Vite + TanStack Router + shadcn/ui on the frontend, Hono on the API. If you want a weekend PR target, issues labelled `good-first-issue` are there for exactly that reason.

README walks you through clone-to-running in about a minute: github.com/davide97g/pulse-hr

If you hate your company's HRIS for a reason we haven't named in the carousel, that's probably the most interesting comment we could get today. File it below or open a Discussion.
```

---

## 17:45 — Optional Comment 4 · Davide, pinned to a specific reply

If a real comment lands on the post that's particularly meaty (good-faith
critique, specific feature ask, "but what about X?") — reply to that
one with a substantive answer **within 15 minutes**. The algorithm and
the audience both reward this far more than another pre-baked comment.

**Reply template if someone asks "but are you SOC 2?":**

```
Honest answer: no, not yet. GDPR-compliant by design — EU data residency, signed DPA on sign-up, sub-processors documented publicly. SOC 2 Type II and ISO 27001 are on the roadmap when the customer base demands them. If you need the attestation before we have it, the honest path is self-host — you stay inside your own audit boundary. Preferred that over pretending. Docs: pulsehr.it/security
```

**Reply template if someone asks "what's the pricing?":**

```
Public: pulsehr.it/pricing. Per-employee, per-month. Free for the first 5 on hosted, forever. Self-host is €0, same product, same features. No paid-only modules. No "contact us for enterprise pricing."
```

**Reply template if someone says "this looks great, what's the catch?":**

```
Fair question. Real catches — in order:
1. We're two devs. Response time on non-critical issues is "within the week", not "within the hour."
2. SOC 2 / ISO 27001 not in hand yet (see replies above).
3. Italian payroll we do ourselves; for other countries we lean on Deel/Remote as contractor rails while we build native.
4. The product is public beta. Some edges are rough. We log the rough ones in /changelog so you can see the pattern.

Those caveats are also why self-host is a first-class path, not an afterthought.
```

---

## Anti-patterns (do not post any of this)

- "Thanks for the great feedback!" — sounds like a brand manager.
- Generic emoji-heavy replies with no substance — `🚀🔥💯`, never.
- Same reply copy-pasted to multiple commenters — LinkedIn surfaces
  this and the algorithm notices.
- Replying to critical comments with more sarcasm. Sarcasm is for the
  carousel; real replies are substantive and calm.
- Any form of "DM for info" — everything is public, there's nothing to DM.

---

_Use this file live. Bookmark it in a browser tab before 17:00 so you
don't have to hunt for it while the first commenters are arriving._
