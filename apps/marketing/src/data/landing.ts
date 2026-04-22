export const SITE = {
  name: "Pulse HR",
  url: "https://pulsehr.it",
  description:
    "Open-source, modular HR & payroll. Money, People and Work as three composable products. Keyboard-first, webhooks on every event, free for the first 5 employees.",
  tagline: "Open, modular HR & payroll that doesn't lock you in.",
  keywords:
    "open source HR, open source payroll, HRIS, modular HR, HR API, webhooks, time tracking, multi-country payroll, commessa, project hours, keyboard-first, PWA",
  ogImage: "/og/landing.svg",
  twitter: "@pulsehr",
};

export const FEATURES = [
  {
    icon: "Clock",
    title: "Time & attendance",
    body: "Clock in from anywhere. Track hours against commesse (project codes, the way finance sees it), not just the wall clock. Manual entry, imports, approvals, overtime anomalies — all one surface.",
  },
  {
    icon: "Wallet",
    title: "Payroll that doesn't panic",
    body: "Run multi-country payroll in minutes. F24, Form 941, HMRC PAYE. Payslips, tax filings and journal entries pushed straight to your accounting stack.",
  },
  {
    icon: "Users",
    title: "People operations",
    body: "One profile per teammate. Org chart, documents, e-signatures, offboarding — no spreadsheets, no lost NDAs.",
  },
  {
    icon: "Briefcase",
    title: "Recruiting & onboarding",
    body: "Kanban pipeline for candidates, automated onboarding workflows the moment someone says yes.",
  },
  {
    icon: "BarChart3",
    title: "Reports everyone reads",
    body: "Headcount, turnover, cost per hire, absenteeism — export to PDF/CSV or pipe to BI in a click.",
  },
  {
    icon: "Plug",
    title: "Integrations & API",
    body: "Slack, Google, QuickBooks, Okta, Stripe. And when we don't have it, our API and webhooks do.",
  },
  {
    icon: "Gauge",
    title: "Saturation & margins",
    body: "Org utilization, weekly bench, blended margin, at-risk projects. A live read on whether the company is over- or under-sold.",
  },
  {
    icon: "Sparkles",
    title: "Command bar (⌘J)",
    body: "Type what you want — 'log 4h on NOV-07', 'approve Aisha's expense', 'book leave next Friday'. A local intent parser turns natural phrases into runnable actions. No LLM call, no data leaving your tenant.",
  },
  {
    icon: "Trophy",
    title: "Growth & recognition",
    body: "XP, kudos coins, leaderboards, weekly podiums. Engagement data that HR and managers actually read, not a feel-good gimmick.",
  },
];

export const CONCEPTS = [
  {
    k: "Open source",
    d: "The whole platform is on GitHub under the Functional Source License. Read the code, run it yourself, fork it if we ever let you down. Your HR data and the software handling it never need to be a black box.",
  },
  {
    k: "Modular",
    d: "Money, People and Work are three independent products that happen to share a workspace. Roll out one, skip the others, swap any of them out later. No all-or-nothing migration, no buy-the-suite trap.",
  },
  {
    k: "Ecosystem-first",
    d: "Webhooks on every resource event, a public REST API, and first-class integrations with Slack, Google, QuickBooks, Okta and Stripe. Anything we don't ship, you (or the community) can add in an afternoon.",
  },
  {
    k: "Keyboard-first",
    d: "Two keys — ⌘K for fuzzy search, ⌘J for the command bar — reach every action in the product without leaving the keyboard. Voice dictation, 40+ shortcuts, works offline as a PWA.",
  },
];

export const LABS = [
  {
    icon: "Heart",
    kind: "Team Pulse",
    tag: "Signal",
    body: "Anonymous vibe checks + weekly heatmap. See sentiment before it shows up in a 1:1.",
  },
  {
    icon: "TrendingUp",
    kind: "Commessa Forecast",
    tag: "Scenarios",
    body: "Scenario sliders on top of project burn. 'What if I add a designer?' answered in milliseconds.",
  },
  {
    icon: "Gift",
    kind: "Kudos",
    tag: "Recognition",
    body: "Peer coins with reasons attached, confetti included. Leaderboards reset weekly, monthly and yearly.",
  },
  {
    icon: "Target",
    kind: "Focus Mode",
    tag: "Depth",
    body: "Deep-work timer that auto-declines meetings, posts a status, and logs the session to your timesheet.",
  },
  {
    icon: "Gauge",
    kind: "Saturation",
    tag: "Load",
    body: "Utilization heatmap, cost-vs-value scatter, margin tab. Who's leaning in, what's returning in €/h.",
  },
];

export const ROLES = [
  {
    k: "Employee",
    d: "Lime accent. Clock, leave, kudos, focus.",
    accent: "#b4ff39",
    bg: "#111113",
  },
  {
    k: "Manager",
    d: "Amber warmth. Approvals, team load, kudos authority.",
    accent: "#ffbf4a",
    bg: "#17130c",
  },
  { k: "HR", d: "Coral. People ops, onboarding, anomalies.", accent: "#ff8a7a", bg: "#1a1110" },
  { k: "Admin", d: "Electric cyan. Integrations, API, audit.", accent: "#6fd8ff", bg: "#0d151a" },
  { k: "Finance", d: "Violet. Payroll, margins, forecast.", accent: "#c48fff", bg: "#141019" },
];

export const TESTIMONIALS = [
  {
    who: "Aisha Patel",
    role: "Head of People, Nova Retail",
    body: "We replaced four tools with Pulse. Payroll that used to take a full week now closes in an afternoon — and the team actually enjoys onboarding.",
  },
  {
    who: "Marcus Rivera",
    role: "COO, Blanco Studio",
    body: "The commessa view is the killer feature. I finally know which client is profitable before the quarter ends, not after.",
  },
  {
    who: "Yuki Tanaka",
    role: "CFO, Zenith Energy",
    body: "Auditors loved it. Every change is logged, every approval timestamped, every filing a click away.",
  },
];

export const FAQ = [
  {
    q: "Can I import data from my current HR tool?",
    a: "Yes. We ship one-click importers for BambooHR, Personio, Rippling, Deel and Factorial, plus a generic CSV importer with column mapping for anything else. The importer runs a dry-run first so you can fix bad rows before committing, and it preserves employee IDs so integrations keep working. Most teams migrate a full dataset — employees, payroll history, leave balances, documents — in under an hour.",
  },
  {
    q: "How is Pulse HR priced?",
    a: "Per active employee, per month. One transparent tier with every feature included — no 'talk to sales for payroll', no upsell for Labs features, no per-seat add-ons for API access or SSO. Free for the first 5 active employees, forever. Contractors are priced differently and capped at $4 per active contractor per month. Annual billing is 15% off.",
  },
  {
    q: "Which countries does payroll support?",
    a: "We natively run payroll in the US, UK, Italy, Spain, France, Germany, Ireland and the Netherlands — all tax filings (F24, Form 941, HMRC PAYE, Modelo 111, URSSAF, Lohnsteuer) and statutory reporting included. For every other country, we integrate with Deel and Remote as contractor rails, and with local Employers of Record for full employment where needed.",
  },
  {
    q: "Is it SOC 2 / GDPR compliant?",
    a: "SOC 2 Type II audited annually — report available under NDA. GDPR-compliant by design with EU data residency options (Frankfurt, Dublin, Milan). Every customer gets a signed Data Processing Agreement at sign-up, sub-processors published at pulsehr.it/security. ISO 27001 certification in progress for late 2026; HIPAA BAAs available for US healthcare customers.",
  },
  {
    q: "Do you have an API?",
    a: "Yes — a full REST API, webhooks on every resource event (employee.created, leave.approved, payslip.finalised, etc.), and maintained SDKs for TypeScript, Python and Go. API keys are scoped per environment with granular permissions. Full OpenAPI spec published at pulsehr.it/docs/api. Rate limits are 1,000 requests/minute on the standard tier.",
  },
  {
    q: "Is Pulse really open source?",
    a: "Yes. The full source is on GitHub at github.com/davide97g/pulse-hr under the Functional Source License (FSL-1.1-MIT). You can read every line, run it yourself, fork it, and contribute back. Two years after each release the license converts automatically to plain MIT — fully permissive. The FSL window blocks competing closed-source SaaS resales during those two years, but any non-competing use (internal deployment, consulting, forks, contributions) is unrestricted from day one. See LICENSE and NOTICE in the repo for the exact terms.",
  },
  {
    q: "Can we self-host?",
    a: "Yes. The whole platform ships as a Bun monorepo you can clone and run. Self-hosted deployments on Docker or Kubernetes are supported with a reference Helm chart and Terraform modules. Payroll filing connectors remain managed by Pulse (you'd need tax authority integrations otherwise), but the rest runs entirely on your infrastructure. Start at github.com/davide97g/pulse-hr.",
  },
  {
    q: "How does the command bar (⌘J) work?",
    a: "The command bar runs a local intent parser over your tenant's data — no LLM call, no network round-trip, no cross-tenant training. You type natural phrases like 'log 4h on NOV-07 yesterday' or 'approve Aisha's expense', and a deterministic heuristic maps them to runnable actions scoped to your permissions. Because it runs in the browser, it works offline as part of the PWA. We'll expose an MCP server for true agent workflows in a later release; until then, this is the honest label — a keyboard-first command bar, not an AI copilot.",
  },
  {
    q: "Does Pulse work offline?",
    a: "The whole surface installs as a PWA on macOS, Windows, iOS and Android. Recent views, timesheets and kudos drafts keep working offline and sync as soon as you're back — no 'loading…' screens at the airport or in a basement meeting room. Payroll runs and other destructive actions require a live connection and will queue if offline, so you never double-pay someone by mistake.",
  },
];

export const TEAM = [
  {
    n: "Sarah Chen",
    r: "CEO & Co-founder",
    bio: "Ex-Stripe Atlas. Built payroll rails in 47 countries.",
  },
  {
    n: "Marcus Rivera",
    r: "Design lead",
    bio: "Formerly Figma, Linear. Believes software should feel like a pencil.",
  },
  {
    n: "Aisha Patel",
    r: "Head of People",
    bio: "12 years in HR ops. Turned onboarding into a weekend project.",
  },
  { n: "Yuki Tanaka", r: "VP Product", bio: "Shipped finance tools at Brex before joining." },
  {
    n: "Lina Rossi",
    r: "Head of Payroll",
    bio: "Certified payroll specialist across 8 jurisdictions.",
  },
  { n: "Noah Williams", r: "Staff Engineer", bio: "Distributed systems for payroll concurrency." },
];

export const STATS = [
  { v: "$1.2B", l: "Processed in payroll" },
  { v: "47", l: "Countries supported" },
  { v: "4,800+", l: "Teams on Pulse HR" },
  { v: "312k", l: "Commands executed" },
];

export const USE_CASES = [
  {
    k: "Agencies & consultancies",
    d: "Bill by project code (commessa), track utilization, close books without spreadsheets.",
  },
  {
    k: "Product startups",
    d: "Onboard from a candidate-accepted email in one click. Equity, offers, laptops — on rails.",
  },
  {
    k: "Scale-ups (50-500)",
    d: "Multi-entity payroll, approval chains that match your org, reports your CFO will actually open.",
  },
];

export const CHANGELOG = [
  { d: "Apr 19", t: "Gantt rows taller + rich hover", k: "Polish" },
  { d: "Apr 18", t: "App-wide color decluttering pass", k: "Design" },
  { d: "Apr 14", t: "Avatar hover cards + Employee Score", k: "People" },
  { d: "Apr 09", t: "Saturation tabs + Insights view", k: "Labs" },
  { d: "Apr 02", t: "Commessa Forecast with AI scenarios", k: "Labs" },
  { d: "Mar 28", t: "Command bar ⌘J with runnable actions", k: "Keyboard" },
];

export const MARQUEE_LOGOS = [
  "ACME",
  "NOVA RETAIL",
  "BLANCO STUDIO",
  "ZENITH ENERGY",
  "LONGO GROUP",
  "FABRIQ",
  "POLLUX",
  "ORBITAL",
];

export const HERO_NEW_TAGS = [
  "Command bar ⌘J",
  "Commessa Forecast",
  "Saturation",
  "Team Pulse",
  "Kudos",
  "Focus Mode",
  "Open source",
];
