---
type: feature
aliases: [Welcome]
tags: [feature, workspace, onboarding]
last_updated: 2026-05-09
---

# Welcome

The first screen a new user sees after signing in. A three-step dialog turns an empty workspace into a populated demo so every other surface has data to show.

## Who uses it

- New [[Admin]] — the user who just signed up and now owns the demo workspace.
- Anyone who runs **Reset workspace** in [[Settings]] is sent back here.

## Steps

1. **Name your workspace.** Free-text. The name appears in the sidebar and reports.
2. **How big is your company?** Pick *Startup* (10), *Scale-up* (25) or *Mid-market* (100). The choice seeds a deterministic roster of that size into the [[Employees]] table — dashboards, [[Reports]], [[Org Chart]] and [[Saturation]] all reflect it.
3. **Add your first teammates.** Optional. Up to three real names, emails and roles. Skipped fields are filled by the seed.

## Notable behaviors

- **The workspace persona defaults to admin.** Every demo user owns their own workspace, so the role-picker is gone — see [[Role Override]] for switching to another persona.
- **Editorial framing.** Left column is the v0.7.2 hero ("HR for people *who hate* HR.") plus a 01·PEOPLE / 02·WORK / 03·REPORTS strip; right column is the Edition 19 / 2026 poster.
- **Public route.** Lives next to `/login` and `/signup` in the bare-shell prefix list, so it doesn't render the sidebar.
- ⌘K (search) and ⌘J (status log) are advertised in the footer so newcomers know they exist before the [[Demo Mode]] takes over.

## Related journeys

[[Welcome Sign-Up Flow]] · [[Onboarding a New Hire]] (different journey — that one's for *recruits*, not new account holders).
