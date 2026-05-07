# Editorial Rewrite — multi-phase plan

The Claude-Design bundle in `/tmp/pulse-design/pulsehr/` (extracted from
`https://api.anthropic.com/v1/design/h/E4ILPoHqvXCZs_xl4sxG0Q`) ships ~30 page
templates in editorial-luxury style. Phase 1 (Constellation dashboard, People
list + spread, Timesheet Calendar) shipped on the `feat/editorial-rewrite`
branch / develop. This file is the running plan for the rest of the rewrite.

## Source of truth

- Design HTML: `/tmp/pulse-design/pulsehr/project/PulseHR Editorial.html`
- Design system CSS reference: `pulsehr/project/styles/pulse-system.css`
  (already mirrored into `packages/tokens/src/editorial.css`)
- Per-page React/JSX designs in `pulsehr/project/components/`
- Chat transcripts (intent + iterations): `pulsehr/chats/chat{1..6}.md`

When in doubt, read the design JSX top-to-bottom — the bundle's README is
explicit: "Read the HTML and CSS directly; a screenshot won't tell you
anything they don't."

## Working principles (carried from Phase 1)

1. **Design has priority. Logic follows.** When the design omits a feature
   the existing route had (multi-tab strength view, saved views, bulk
   actions, etc.), drop it from the route body. Optional re-attach via side
   panels later if the user asks.
2. **Token infra is already aligned.** `packages/tokens/src/editorial.css`
   exposes `.t-mono`, `.t-num`, `.spark-mark`, `.tag-spark`, `.tag-attention`,
   `.pill*`, `.dot`, `.glass`, `.solid-card`, `.ph-avatar`, `.tab-row`,
   `.placeholder-img`, `.room-dark/.room-light`, density data-attrs. **Do
   not duplicate** — consume them.
3. **Chrome stays.** AppShell sidebar/topbar/CommandPalette ⌘K/Status Log ⌘J/
   comments overlay/role-override/DemoBanner/notifications/etc. all survive
   each phase. Per-page rewrites swap **route bodies only**.
4. **Reuse existing data hooks.** `useEmployees`, `useLeaveRequests`,
   `useExpenses`, `useTimesheetEntries`, `useActivities`, `useAnnouncements`,
   `useNotifications`, `useTimesheetTemplates`, etc. live under
   `apps/app/src/lib/tables/`. The mock-data sources live in `lib/mock-data.ts`.
5. **Per-page component pattern.** Each page gets a self-contained component
   under `apps/app/src/components/<domain>/<Name>Editorial.tsx`. The route
   file becomes a 10-line shell that mounts the component. This keeps lint
   warnings limited to one per route (the standard react-refresh warning).
6. **Italian copy.** The design ships Italian throughout. Use Italian for
   labels, captions, and copy on each editorial page. UI labels for actions
   (buttons / chips) follow the design's exact strings.
7. **Light/Dark.** Each page in the design ships in both light and dark
   "rooms." We do **not** wrap each route in `room-light`/`room-dark` — the
   global theme via `useTheme()` already drives the palette through tokens.
   Page bodies should consume `var(--bg)`, `var(--fg)`, `var(--spark)` and
   render correctly under both modes without per-page palette switching.
8. **No hand-rolled hex.** Use tokens. `--spark` for brand accent, `--ink`
   and `--paper` for the inverted dark/light rooms, `--fg-2`/`--muted-foreground`
   for de-emphasized copy.

## Conventions for per-page components

- File path: `apps/app/src/components/<domain>/<Name>Editorial.tsx`
- Exports a single named component matching the file name.
- Receives no props for top-level routes; data via hooks/mocks inside.
- Outer wrapper: `<div className="ph p-4 md:p-6 flex flex-col gap-4">…`
  (no fixed-pixel canvas — pages must reflow).
- Hero layout: small mono eyebrow → `Fraunces` italic H1 (clamp 56–84px) →
  italic Fraunces lede paragraph.
- Use `pill pill-spark`/`pill pill-ghost`/`pill pill-dark` for buttons.
- Use `tab-row` + `--cols` CSS var for tabular blocks.
- Verify visually under both `<html class="dark">` and the default light theme.

---

## Phase 2 — Money + work flagships (NEXT)

Target the highest-business-value money/work pages. These reuse mock-data
that's already wired to existing routes.

### 2.1 Payroll editorial — `/payroll`
- Design source: `payroll.jsx` (PayrollEditorial), `money-pages.jsx`
- New file: `apps/app/src/components/payroll/PayrollEditorial.tsx`
- Replace route body in `apps/app/src/routes/payroll.tsx`.
- Hero: `MAGGIO 2026 · RUN PRELIMINARE` mono · `Run di maggio.` italic H1.
- Cover number: `€ 218k` in 132px Fraunces, italic adjective beneath.
- Breakdown band: 4 KPI cells (lordo / netto / contributi / imposte).
- Buste paga list: tab-row with avatar, name, italic role, mono RAL,
  lordo/netto t-num, anomalie pill (spark when > 0).
- Action bar: `Esporta CSV` ghost / `Approva run` spark.
- Data hooks: `payrollRuns` from `lib/mock-data`, `payslips`,
  `useEmployees()`. The current /payroll body has the wiring — copy the
  mutators (`__setPayrollRuns`) and wrap with editorial visuals.

### 2.2 Forecast editorial — `/forecast`
- Design source: `forecast.jsx` (ForecastEditorial)
- New file: `apps/app/src/components/forecast/ForecastEditorial.tsx`
- Replace route body in `apps/app/src/routes/forecast.tsx`.
- Hero: project picker chip + italic `Burn projection`.
- Big number: forecast €/h burn this quarter, spark colour.
- Chart: SVG line — actuals solid, projection dashed, budget as lime
  reference line. Use Recharts only if needed; the design draws a
  hand-rolled SVG and that's preferred for visual fidelity.
- Scenario sliders: hire pace, billable rate, off days. Each slider
  tweaks projection in-place via local state.
- Footer band: 3 KPIs (margine atteso, ritardo previsto, deficit/surplus).
- Reuses: `commesse`, `allocations`, `useTimesheetEntries`.

### 2.3 Expenses editorial — `/expenses`
- Design source: `money-pages.jsx` → `ExpensesEditorial`
- New file: `apps/app/src/components/expenses/ExpensesEditorial.tsx`
- Hero: `Spese.` italic H1 + 4-cell summary band (totale, pendenti, approvate, rifiutate).
- List: editorial tab-row with date / employee / italic descrizione / commessa /
  amount t-num / status mono. Pendenti row gets spark accent; rifiutate row gets muted.
- Side panel: receipt thumbnail + approve/reject pills.
- Reuses: `useExpenses`, `expensesTable`.

### 2.4 Saturation editorial — `/saturation`
- Design source: `analytics-pages.jsx` → `SaturationEditorial`
- New file: `apps/app/src/components/saturation/SaturationEditorial.tsx`
- Hero: `Quanto siamo pieni.` italic
- Heatmap: 5-week × team grid. >100% cells in spark; <40% transparent.
- Replace existing chart components on /saturation; preserve the existing
  data adapters in `lib/saturation/`.

### 2.5 Reports editorial — `/reports`
- Design source: `analytics-pages.jsx` → `ReportsEditorial`
- New file: `apps/app/src/components/reports/ReportsEditorial.tsx`
- Hero: `I numeri che contano.`
- KPI tiles row · 12-month bar chart · breakdown dipartimento · "segnali
  da tenere d'occhio" italic list.

**Verification for Phase 2:** typecheck adds zero errors; visit each route
under both themes; CRUD on payroll/expense flows still mutates state and
fires undo toasts.

---

## Phase 3 — Life surfaces (kudos, leave, growth, moments, feedback)

### 3.1 Kudos — `/kudos`
- Design: `life-pages.jsx` → `KudosEditorial`
- File: `components/kudos/KudosEditorial.tsx`
- Hero: italic `Grazie.` + leaderboard of the month + kudos cards with
  serif italic quotation. Existing data: `kudosSeed`, `useKudos`.

### 3.2 Leave — `/leave`
- Design: `life-pages.jsx` → `LeaveEditorial`
- Hero: italic `Riposo.` + saldo ferie spark · request form on the right ·
  storico table. Reuses `useLeaveRequests`.

### 3.3 Growth — `/growth`
- Design: `life-pages.jsx` → `GrowthEditorial`
- Path L1→L6 progress, competence bars, quarterly objectives, 62% spark.
  Reuses `useGoals`, `growthNotesSeed`.

### 3.4 Moments — `/moments`
- Design: `life-pages.jsx` → `MomentsEditorial`
- Hero: today's moment as poster, feed of next 30 days. Reuses
  `useEmployees` (birthdays + joinDate anniversaries) + `useKudos`.

### 3.5 Feedback / Pulse — `/feedback`
- Design: `comms-pages.jsx` → `FeedbackEditorial`
- Hero: `Come state?` + score 1-5 cards with horizontal bars + eNPS spark.
  Reuses `pulseEntries`.

### 3.6 Focus — `/focus`
- Design: `extra-pages.jsx` → `FocusModeEditorial`
- Single task fullscreen, 120px task title, slack/mail muted, timer in
  spark. Reuses `useFocusSessions`.

### 3.7 Status log — `/log`
- Design: `comms-pages.jsx` → `StatusLogEditorial`
- Tre righe a testa, niente call. Italic post + mono author + commessa
  right. Reuses `useLogSessions`, `useLogMessages`.

### 3.8 Activities — `/activities`
- Design: `comms-pages.jsx` → `ActivitiesEditorial`
- Cronologia eventi, mono timestamp, soggetto inline, commessa right.
  Reuses `useActivities`.

---

## Phase 4 — Work surfaces (clients, projects, proposals, recruiting)

### 4.1 Clients — `/clients`, `/clients/$clientId`
- Design: `work-pages.jsx` → `ClientsEditorial`
- List view: serif italic client name, sede mono, fatturato t-num.
- Detail: striped cover + project list + contact card.
- Reuses `useClients`, `useCommesse`.

### 4.2 Projects — `/projects/$projectId`
- Design: `work-pages.jsx` → `ProjectsEditorial`
- Cover: codice commessa as masthead. Italic name. Big tabular margine.
  Team avatars row. Burn vs. budget bar.
- Reuses `useCommesse`, `useAllocations`.

### 4.3 Recruiting — `/recruiting`
- Design: `comms-pages.jsx` (look for RecruitingEditorial)
- Kanban a 5 stage. Numeri grandi tabular per stage. Card candidati
  con avatar + ruolo. Reuses `useCandidates`, `useJobPostings`.

### 4.4 Proposal thread — `/proposal/$id`
- Design: `comms-pages.jsx` → `ProposalEditorial`
- Cover proposta + tre milestone in card. Discovery in spark.

### 4.5 Comment thread — `/comment/$id`
- Design: `comms-pages.jsx` → `CommentThreadEditorial`
- Aside con contesto, lista commenti, reply box in basso.

### 4.6 Announcements — `/announcements`
- Design: `comms-pages.jsx` → `AnnouncementsEditorial`
- Annuncio in evidenza con poster + 3 secondari come card editoriali.

---

## Phase 5 — Identity + auth (login, welcome, onboarding, profile, org)

### 5.1 Login — `/login`
- Design: `auth-org-pages.jsx` → `LoginEditorial`
- Spread: hero scuro con tagline + numeri sx; form magazine sul lato dx.
- Wrap Clerk's `<SignIn>` (or our existing email/password form) inside.

### 5.2 Welcome — `/welcome`
- Design: `welcome.jsx` → `WelcomeEditorial`
- Hero scale 144px, tre moduli come stanze, un solo CTA spark.

### 5.3 Onboarding — `/onboarding`
- Design: `setup-pages.jsx` → `OnboardingEditorial`
- Wizard a 6 step. Sidebar scura, hero domanda 96px, card di valori grandi.

### 5.4 Profile — `/profile`
- Design: `extra-pages.jsx` → `ProfileEditorial`
- Hero con nome verticale 92px, contatti e employment in card a destra.

### 5.5 Org chart — `/org`
- Design: `auth-org-pages.jsx` → `OrgEditorial`
- Albero a 3 livelli. CEO al centro spark, direttori, lead. Footer count
  per dipartimento. Reuses `useEmployees`.

---

## Phase 6 — Workspace surfaces (settings, docs, marketplace, developers, offices)

### 6.1 Settings — `/settings`
- Design: `setup-pages.jsx` → `SettingsEditorial`
- 4 card di policy: workspace, policy, brand, sicurezza. Riga per
  impostazione, valore italic, controllo mono.

### 6.2 Docs — `/docs/*`
- Design: `extra-pages.jsx` → `DocsEditorial`
- Sidebar indice paper-2, articolo a destra con hero serif.

### 6.3 Marketplace — `/marketplace`
- Design: `extra-pages.jsx` → `MarketplaceEditorial`
- Feature row Italia + griglia 3×3 di app card.

### 6.4 Developers — `/developers`
- Design: `extra-pages.jsx` → `DevelopersEditorial`
- Hero `Costruisci sopra di noi`, code block curl, tabella endpoint.

### 6.5 Offices — `/offices`, `/offices/$officeId`
- Design: `work-pages.jsx` → `OfficesEditorial`
- 4 stanze in 3 fusi. Cover striped + numero persone tabular.

### 6.6 Attendance — `/attendance` (new) or merge into `/calendar`
- Design: `life-pages.jsx` → `AttendanceEditorial`
- Orologio numerico oversize (in/out timer). Storico settimanale.

---

## Phase 7 — Command palette overlay restyle

The existing `CommandPalette.tsx` opens a Radix dialog. Restyle:
- Glass surface (`glass` class, blur, border-radius 18px).
- Italic Fraunces in the query, mono nelle scorciatoie.
- Per design `command-palette.jsx`, group results with mono group headers
  and a single spark on the primary action row.
- This is **not** a route — it's the global `apps/app/src/components/app/CommandPalette.tsx`
  component. Editing it touches every page; do this LAST so we never
  block other routes' work on chrome changes.

---

## Cross-cutting cleanup (do alongside any phase)

1. **Remove dead imports.** Each route swap leaves orphaned imports in
   places like `lib/mock-data.ts` callers. Run `bunx eslint --fix
   src/routes` after each phase to drop unused imports automatically.
2. **Re-export atoms.** When a page uses a treatment 3+ times (e.g.
   `<DetailBlock>`, `<KpiCell>`), promote it to
   `apps/app/src/components/_shared/editorial/` with a clean prop API.
   Don't promote into `@pulse-hr/ui/atoms/` until the API is stable.
3. **i18n.** Italian is the source-of-truth language; English fallback
   strings can stay in chrome (sidebar groups, toasts) since users will
   already see Italian on every page body.
4. **Dark-mode sweep.** After each phase, switch `<html>` between light
   and dark via the topbar's `ThemeSwitcher` and visually verify every new
   page.

## Skipped pages (intentional)

- `dashboard-tool.jsx` — operator-dense alternative to the constellation.
  Already covered by Phase 1.
- `dashboard-editorial.jsx` (Buongiorno triptych) — replaced by Phase 1.
- `people.jsx` (PeopleTool) — replaced by Phase 1's PeopleEditorialList.
- `timesheet.jsx` (TimesheetEditorial / TimesheetTool) — `/time` keeps
  its existing implementation until a follow-up; it's already a tool,
  not editorial. Phase 1's TimesheetCalendar covers the calendar variant.

## Per-phase checklist

For every page added:

- [ ] Read the matching JSX in `/tmp/pulse-design/pulsehr/project/components/`
- [ ] Build the new component under `apps/app/src/components/<domain>/`
- [ ] Replace the route's body to mount the new component
- [ ] `bunx tsc --noEmit -p tsconfig.json` — no new errors
- [ ] `bunx eslint src/components/<domain> src/routes/<route>.tsx` — 0 errors
- [ ] Visual: light + dark themes, narrow + wide viewport
- [ ] Existing CRUD/actions still mutate state and fire toasts where applicable

## Open questions for Phase 2+

- Should we keep `/time` (timesheet tool) under the existing dense form,
  or rebuild as `TimesheetEditorial` (week-as-magazine-spread)? The design
  ships both — we kept tool form in Phase 1.
- The design's `room-dark` is meant for inverted spreads on a light page
  (e.g. login hero pane); the global theme drives the rest. Decide per
  page whether to wrap a region in `room-dark` for emphasis.
- Reattaching saved views / bulk actions / multi-tab strength view to
  `/people`? Not in design but power-user features. Defer until requested.
