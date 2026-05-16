# LinkedIn Company Page — `@pulse-hr-official`

> **Status (May 2026 refocus):** Tagline, About, and Specialties below are the **current drafts** — IC-first, employee-first hero, no named competitors. Paste them into LinkedIn when you next refresh the page (the page itself is live). The `.it.md` sibling carries the Italian version.


**Live URL:** https://www.linkedin.com/company/pulse-hr-official/

Copy to paste into LinkedIn's "Create a Company Page" wizard. All
fields below are paste-and-go. Character counts verified against
LinkedIn's actual limits as of April 2026.

**Owner.** Davide (primary admin). Add Niccolò as admin before 15:00
so he can post from the page independently on launch day.

**Go-live.** Fri Apr 24 2026. Page visible by 14:00. First post at
17:00.

---

## 1. Setup wizard — paste-and-go

| Field                | Value                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------- |
| Page type            | **Small business**                                                                     |
| Name                 | **Pulse HR**                                                                           |
| LinkedIn public URL  | **linkedin.com/company/pulse-hr-official** (the clean `pulse-hr` / `pulsehr` slugs were taken) |
| Website              | **https://pulsehr.it**                                                                 |
| Industry             | **Software Development**                                                               |
| Company size         | **2-10 employees**                                                                     |
| Company type         | **Privately Held**                                                                     |
| Location (HQ)        | Milan, Lombardy, Italy                                                                 |
| Logo (300×300 PNG)   | Sparkles bug on ink — export from `docs/brand/logo-explorations/mark-final.svg` at 2× |
| Cover (1128×191 PNG) | Ink flat with wordmark centred — quick render below, full design is Phase 2           |
| Tagline (220 chars)  | See §2 below                                                                           |
| About (2,000 chars)  | See §3 below                                                                           |
| Specialties          | See §4 below                                                                           |
| CTA button           | **Visit website** → `https://pulsehr.it`                                               |
| Founded              | **2026**                                                                               |

---

## 2. Tagline (220-char limit)

Paste this exact string:

```
An open-source workspace that makes your work impossible to miss. For ICs at tech-forward teams. Source public, prices public, self-host any time, no sales call to see the product.
```

**Count:** 184 / 220 chars. ✓

---

## 3. About section (2,000-char limit)

Paste this exact string. Empty lines are intentional — LinkedIn respects paragraph breaks.

```
Pulse HR is an open-source workspace for the IC dev or designer — the person whose best work is buried in a Slack thread from March.

Three lines of status a day. A kudos that doesn't scroll off. A growth trail with artefacts you can point to. The work you do gets seen, recognised, and remembered — without filling in a form once a quarter.

The whole platform is on GitHub under FSL-1.1-MIT — read every line, run it on your own infra, fork it if we let you down. The license converts to plain MIT automatically after two years.

Active surfaces today (people-first):
• Status Log — three lines, ⌘⏎, async standup replacement
• Kudos — peer recognition that survives the week
• Growth — achievements, skill paths, the proof you carry into your next 1:1
• Moments — birthdays, anniversaries, the small things that make a team feel like one
• Workload check-in — one tap weekly, manager sees the aggregate, not the answer
• Leave journal — personal, no approval queue

Four commitments, non-negotiable:

1. Employee-first — built for the IC. Recognition, growth, proof of work. The manager sees a manager-safe recap, never the raw chat.

2. Open — source on GitHub, license fair, contributors credited in every changelog entry. No paid feature gates. No enterprise tier with extra modules.

3. Transparent — roadmap, changelog, prices, and screw-ups all public. You don't need a sales call to figure out whether Pulse fits you. Scroll.

4. Yours — self-host with `docker compose up` in 90 seconds, or pay us to host. Export everything in a clean format any time. Leaving Pulse is the easiest thing it does.

Built in Milan, in public, by two frontend-fluent developers. Not a Bitrock project — Bitrock is our day job. No VC. No BDRs. No "AI-powered" anything. Just two developers, a public commit log, and the workspace we'd actually want to use.

Start: github.com/davide97g/pulse-hr
```

**Count:** ~1,950 / 2,000 chars. ✓

---

## 4. Specialties (tag list — up to 20 tags)

Paste one at a time (LinkedIn makes you enter them individually):

```
Open Source
Employee Experience
People Operations
Recognition
Async Standups
Self-Hosted Software
Keyboard-First UX
FSL License
TypeScript
React
Bun
Public Roadmap
Build in Public
Developer Tools
```

---

## 5. Cover image (1128 × 191, needed by 14:00)

**Quick render plan (10 min).** Open any image tool. Make a 1128 × 191
PNG:

- Background: `#0b0b0d`
- Centred text: "Pulse HR" in Fraunces Italic 72pt, cream `#f2f2ee`,
  with one italic word and a lime dot after it (match the wordmark
  from the marketing site).
- Right edge, small mono label: `OPEN-SOURCE · BUILT IN PUBLIC` at
  14pt, 0.25em tracking, lime `#b4ff39` at 70% opacity.

**Claude Design prompt (if you want something nicer by next week):**

```
Design a LinkedIn company page cover at 1128 × 191 px for Pulse HR.
Ink background (#0b0b0d). Centred wordmark in Fraunces Variable,
italic "R" in "Pulse HR" for emphasis, with a brand-lime (#b4ff39)
period after. Right-edge monospace (JetBrains Mono) label at 0.25em
letter-spacing: "OPEN-SOURCE · BUILT IN PUBLIC · MILAN · 2026".
No gradients. No stock photography. Keep everything inside a 48px
safe margin (LinkedIn overlays the profile photo circle on the
bottom-left of the cover at desktop widths — do not place text
there). Output as PNG at 2x for retina.
```

---

## 6. Admin roles

- **Super admin:** Davide Ghiotto
- **Content admin (launch day):** Niccolò Naso
- **Analytics viewer:** none (Davide has it anyway via super admin)
- **Paid-media admin:** none (we're not running ads)

Set these **before 14:00**. If Niccolò isn't admin by go-live, he
can't post from the page at 17:30.

---

## 7. Verification

LinkedIn sometimes asks for company domain verification. If prompted:

- DNS TXT record on `pulsehr.it`. The Vercel DNS dashboard supports
  this. Takes 5–15 minutes to propagate.
- If you're on a deadline and can't wait, skip verification — it's
  a trust badge, not a blocker. Re-do later.

---

## 8. Post-setup checklist (before 17:00)

- [x] Company page is live at `linkedin.com/company/pulse-hr-official` ✓ (2026-04-24)
- [ ] Logo visible at 300 × 300 on the profile
- [ ] Cover visible, doesn't clip the profile photo
- [ ] About section renders line breaks correctly
- [ ] Website link works and opens in a new tab
- [ ] CTA button reads "Visit website" (not "Contact us")
- [ ] Davide and Niccolò are admins (not Just Davide — double-check)
- [ ] Tagline visible under the company name on desktop
- [ ] Specialties populated; tags appear on the right sidebar
- [ ] At least 5 employees have clicked "I work here" (Davide +
      Niccolò minimum; ping 3 sympathetic colleagues to do the same)
- [ ] The page has 0 posts (good — we're launching with the carousel)
