export const SITE = {
  name: "Pulse HR",
  url: "https://pulsehr.com",
  description:
    "Pulse HR unifies payroll, time tracking, leave, recruiting, onboarding and kudos in one workspace. Multi-country payroll, AI Copilot, keyboard-first. Free for the first 5 employees.",
  tagline: "The HR & payroll platform you'll actually use.",
  keywords:
    "HR software, payroll software, time tracking, people platform, HRIS, multi-country payroll, commessa, project hours, AI copilot, PWA",
  ogImage: "/og/landing.png",
  twitter: "@pulsehr",
};

export const FEATURES = [
  { icon: "Clock",      title: "Time & attendance",    body: "Clock in from anywhere. Track hours against commesse (project codes, the way finance sees it), not just the wall clock. Manual entry, imports, approvals, overtime anomalies — all one surface." },
  { icon: "Wallet",     title: "Payroll that doesn't panic", body: "Run multi-country payroll in minutes. F24, Form 941, HMRC PAYE. Payslips, tax filings and journal entries pushed straight to your accounting stack." },
  { icon: "Users",      title: "People operations",    body: "One profile per teammate. Org chart, documents, e-signatures, offboarding — no spreadsheets, no lost NDAs." },
  { icon: "Briefcase",  title: "Recruiting & onboarding", body: "Kanban pipeline for candidates, automated onboarding workflows the moment someone says yes." },
  { icon: "BarChart3",  title: "Reports everyone reads", body: "Headcount, turnover, cost per hire, absenteeism — export to PDF/CSV or pipe to BI in a click." },
  { icon: "Plug",       title: "Integrations & API",   body: "Slack, Google, QuickBooks, Okta, Stripe. And when we don't have it, our API and webhooks do." },
  { icon: "Gauge",      title: "Saturation & margins", body: "Org utilization, weekly bench, blended margin, at-risk projects. A live read on whether the company is over- or under-sold." },
  { icon: "Sparkles",   title: "Copilot (⌘J)",          body: "Ask anything in natural language — approvals, balances, forecasts, payroll previews. Answers stream with runnable actions attached." },
  { icon: "Trophy",     title: "Growth & recognition",  body: "XP, kudos coins, leaderboards, weekly podiums. Engagement data that HR and managers actually read, not a feel-good gimmick." },
];

export const CONCEPTS = [
  { k: "Commessa-first",      d: "Every hour, expense and headcount dollar is traceable to a project (commessa is the Italian finance term for a billable job code). It's how finance sees the company — now it's how your HR data sees it too." },
  { k: "One surface",         d: "Stop jumping between Deel for contracts, Rippling for payroll and a dozen Google Docs. One workspace, search from anywhere, ⌘K everywhere." },
  { k: "Workflows not forms", d: "Leave, expenses, onboarding — each is a structured workflow with owners, deadlines and automation, not a form that lands in a shared inbox." },
  { k: "Open by default",     d: "Export anything. Webhooks on every event. A public API with clear contracts. You'll never feel locked in." },
];

export const LABS = [
  { icon: "Heart",       kind: "Team Pulse",        tag: "Signal",      body: "Anonymous vibe checks + weekly heatmap. See sentiment before it shows up in a 1:1." },
  { icon: "TrendingUp",  kind: "Commessa Forecast", tag: "AI",          body: "Scenario sliders on top of project burn. 'What if I add a designer?' answered in milliseconds." },
  { icon: "Gift",        kind: "Kudos",             tag: "Recognition", body: "Peer coins with reasons attached, confetti included. Leaderboards reset weekly, monthly and yearly." },
  { icon: "Target",      kind: "Focus Mode",        tag: "Depth",       body: "Deep-work timer that auto-declines meetings, posts a status, and logs the session to your timesheet." },
  { icon: "Gauge",       kind: "Saturation",        tag: "Load",        body: "Utilization heatmap, cost-vs-value scatter, margin tab. Who's leaning in, what's returning in €/h." },
];

export const ROLES = [
  { k: "Employee", d: "Lime accent. Clock, leave, kudos, focus.",             accent: "#b4ff39", bg: "#111113" },
  { k: "Manager",  d: "Amber warmth. Approvals, team load, kudos authority.", accent: "#ffbf4a", bg: "#17130c" },
  { k: "HR",       d: "Coral. People ops, onboarding, anomalies.",            accent: "#ff8a7a", bg: "#1a1110" },
  { k: "Admin",    d: "Electric cyan. Integrations, API, audit.",             accent: "#6fd8ff", bg: "#0d151a" },
  { k: "Finance",  d: "Violet. Payroll, margins, forecast.",                  accent: "#c48fff", bg: "#141019" },
];

export const TESTIMONIALS = [
  { who: "Aisha Patel",   role: "Head of People, Nova Retail",   body: "We replaced four tools with Pulse. Payroll that used to take a full week now closes in an afternoon — and the team actually enjoys onboarding." },
  { who: "Marcus Rivera", role: "COO, Blanco Studio",            body: "The commessa view is the killer feature. I finally know which client is profitable before the quarter ends, not after." },
  { who: "Yuki Tanaka",   role: "CFO, Zenith Energy",            body: "Auditors loved it. Every change is logged, every approval timestamped, every filing a click away." },
];

export const FAQ = [
  { q: "Can I import data from my current HR tool?",
    a: "Yes. We provide one-click importers for BambooHR, Personio, Rippling, Deel and Factorial, plus a generic CSV importer with column mapping. Most teams migrate a full dataset in under an hour." },
  { q: "How is Pulse HR priced?",
    a: "Per active employee, per month. A single transparent tier with every feature — no 'talk to sales for payroll'. Free for the first 5 employees, forever." },
  { q: "Which countries does payroll support?",
    a: "We natively run payroll in the US, UK, Italy, Spain, France, Germany, Ireland and the Netherlands. For other countries, we integrate with Deel and Remote as contractor rails." },
  { q: "Is it SOC 2 / GDPR compliant?",
    a: "SOC 2 Type II audited annually. GDPR-compliant by design, with EU data residency options. ISO 27001 in progress for late 2026." },
  { q: "Do you have an API?",
    a: "Yes — a full REST API, webhooks on every resource, and SDKs for TypeScript, Python and Go. See the Developers tab inside the app." },
  { q: "Can we self-host?",
    a: "Yes. The core platform is source-available under the FSL license. Self-hosted deployments on Docker or Kubernetes are supported for teams over 50." },
  { q: "Where does Copilot run — and what does it see?",
    a: "Copilot runs on your tenant's data only. Every prompt is scoped to the current user's permissions, and nothing is used to train cross-tenant models. You can disable AI features per role or org-wide with one toggle." },
  { q: "Does Pulse work offline?",
    a: "The whole surface installs as a PWA on macOS, Windows, iOS and Android. Recent views, timesheets and kudos drafts keep working offline and sync as soon as you're back — no 'loading…' screens at the airport." },
];

export const TEAM = [
  { n: "Sarah Chen",      r: "CEO & Co-founder",  bio: "Ex-Stripe Atlas. Built payroll rails in 47 countries." },
  { n: "Marcus Rivera",   r: "Design lead",       bio: "Formerly Figma, Linear. Believes software should feel like a pencil." },
  { n: "Aisha Patel",     r: "Head of People",    bio: "12 years in HR ops. Turned onboarding into a weekend project." },
  { n: "Yuki Tanaka",     r: "VP Product",        bio: "Shipped finance tools at Brex before joining." },
  { n: "Lina Rossi",      r: "Head of Payroll",   bio: "Certified payroll specialist across 8 jurisdictions." },
  { n: "Noah Williams",   r: "Staff Engineer",    bio: "Distributed systems for payroll concurrency." },
];

export const STATS = [
  { v: "$1.2B",  l: "Processed in payroll" },
  { v: "47",     l: "Countries supported" },
  { v: "4,800+", l: "Teams on Pulse HR" },
  { v: "312k",   l: "Copilot actions run" },
];

export const USE_CASES = [
  { k: "Agencies & consultancies", d: "Bill by project code (commessa), track utilization, close books without spreadsheets." },
  { k: "Product startups",         d: "Onboard from a candidate-accepted email in one click. Equity, offers, laptops — on rails." },
  { k: "Scale-ups (50-500)",       d: "Multi-entity payroll, approval chains that match your org, reports your CFO will actually open." },
];

export const CHANGELOG = [
  { d: "Apr 19", t: "Gantt rows taller + rich hover",     k: "Polish" },
  { d: "Apr 18", t: "App-wide color decluttering pass",   k: "Design" },
  { d: "Apr 14", t: "Avatar hover cards + Employee Score", k: "People" },
  { d: "Apr 09", t: "Saturation tabs + Insights view",    k: "Labs" },
  { d: "Apr 02", t: "Commessa Forecast with AI scenarios", k: "Labs" },
  { d: "Mar 28", t: "Copilot ⌘J with streaming actions",   k: "AI" },
];

export const MARQUEE_LOGOS = [
  "ACME", "NOVA RETAIL", "BLANCO STUDIO", "ZENITH ENERGY",
  "LONGO GROUP", "FABRIQ", "POLLUX", "ORBITAL",
];

export const HERO_NEW_TAGS = [
  "Copilot ⌘J", "Commessa Forecast", "Saturation", "Team Pulse",
  "Kudos", "Focus Mode", "Growth",
];
