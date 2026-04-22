# Security Policy

## Supported versions

Pulse HR is developed on `main`. Only the latest release receives security fixes. Older versions are not patched.

| Version | Supported |
| ------- | --------- |
| `main`  | ✅        |
| older   | ❌        |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Email **security@pulsehr.it** with:

- A description of the issue and its impact
- Steps to reproduce (proof-of-concept code, URLs, payloads)
- Affected component (`apps/app`, `apps/api`, `apps/marketing`, etc.) and commit/version
- Your name / handle for credit (optional)

You can also use [GitHub's private vulnerability reporting](https://github.com/davide97g/pulse-hr/security/advisories/new).

## What to expect

- **Acknowledgement** within 2 business days.
- **Triage & initial assessment** within 7 days.
- **Fix timeline** depends on severity; critical issues are patched out-of-band, everything else ships in the next release.
- **Coordinated disclosure** — we'll agree on a public disclosure date with you. Credit is given in the changelog unless you prefer otherwise.

## Scope

In scope:

- `apps/app` (product SPA)
- `apps/api` (Hono backend)
- `apps/marketing` (marketing site)
- Build/release infra in this repo

Out of scope:

- Third-party services we integrate with (report directly to the vendor)
- Denial-of-service via volumetric attacks
- Social engineering of Pulse HR employees
- Physical attacks

## Safe harbor

We will not take legal action against researchers who act in good faith, stay within this policy, and do not exfiltrate more data than necessary to demonstrate the issue.
