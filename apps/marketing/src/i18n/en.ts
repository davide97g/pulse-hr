// English strings — master dictionary.
// Brand, tech acronyms and accepted English terms (HR, API, SOC 2, GDPR, PWA, SDK,
// webhook, open source, CEO/COO/CFO, kudos, ⌘K/⌘J, SaaS, Rippling, Deel, BambooHR,
// GitHub, Slack, etc.) stay in English across all locales.

export const en = {
  meta: {
    tagline: "Open, modular HR & payroll that doesn't lock you in.",
    description:
      "Open-source, modular HR & payroll. Money, People and Work as three composable products. Keyboard-first, webhooks on every event, free for the first 5 employees.",
    keywords:
      "open source HR, open source payroll, HRIS, modular HR, HR API, webhooks, time tracking, multi-country payroll, commessa, project hours, keyboard-first, PWA",
  },

  a11y: {
    skipToMain: "Skip to main content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    pulseHomeLabel: "Pulse HR home",
    primaryNav: "Primary",
    footer: "Footer",
    customerLogos: "Customer logos",
    customerTestimonials: "Customer testimonials",
    keyStats: "Key stats",
    languageSwitcher: "Switch language",
  },

  nav: {
    product: "Product",
    labs: "Labs",
    docs: "Docs",
    vs: "vs",
    pricing: "Pricing",
    changelog: "Changelog",
    signIn: "Sign in",
    startFree: "Start free",
    viewGithub: "View source on GitHub",
    github: "GitHub",
  },

  footer: {
    tagline: "The people platform for modern teams. Made in Milan, Berlin and San Francisco.",
    colProduct: "Product",
    colOpenSource: "Open source",
    colResources: "Resources",
    productTour: "Product tour",
    modules: "Modules",
    keyboard: "Keyboard",
    vsAlternatives: "vs. alternatives",
    pricing: "Pricing",
    changelog: "Changelog",
    roadmap: "Roadmap",
    labs: "Labs",
    whyOpenSource: "Why open source",
    ecosystem: "Ecosystem",
    github: "GitHub",
    license: "License",
    contribute: "Contribute",
    selfHost: "Self-host",
    docs: "Docs",
    apiReference: "API reference",
    blog: "Blog",
    security: "Security",
    contact: "Contact",
    rights: "All rights reserved",
    privacy: "Privacy",
    terms: "Terms",
    status: "Status",
  },

  lang: {
    switchTo: "Switch to",
  },

  hero: {
    badge: "Open source · FSL-1.1-MIT · public beta",
    eyebrow: "Open, modular HR & payroll for services-first teams",
    titleBefore: "HR you can",
    titleItalic: "read",
    titleAfter: ", fork, and run",
    body: [
      "Rippling, Deel and BambooHR are closed suites that make you buy all or nothing. Pulse is three independent modules — ",
      "Money",
      ", ",
      "People",
      " and ",
      "Work",
      " — sharing one workspace, one keyboard, one API. Source-available on GitHub. Free for the first 5 employees, forever.",
    ] as string[],
    ctaPrimary: "Start free — 5 employees",
    ctaGithub: "Star on GitHub",
    ctaTour: "Tour the app",
    chip1: "Money · People · Work — adopt any",
    chip2: "SOC 2 Type II · GDPR · EU data",
    chip3: "Self-host on Docker / K8s",
    newThisQuarter: "New this quarter",
  },

  heroReel: {
    ariaLabel: "Pulse HR product reel",
    videoLabel: "A day at Pulse — animated showreel",
    posterAlt: "A day at Pulse — static preview",
    caption: "A day at Pulse · 12s loop",
  },

  marquee: {
    title: "Teams on Pulse",
  },

  stats: {
    processed: "Processed in payroll",
    countries: "Countries supported",
    teams: "Teams on Pulse HR",
    commands: "Commands executed",
  },

  whyPulse: {
    eyebrow: "Why Pulse",
    title: {
      before: "No other HR vendor",
      italic: "all four",
      after: "matches ",
      end: ".",
    },
    subtitle: {
      before:
        "Rippling is closed. Deel is contractors-only. BambooHR has no API to speak of. Pulse is the only platform where every one of these four principles is non-negotiable — ",
      link: "see the honest comparison",
      after: ".",
    },
    source: "Source",
    values: [
      {
        k: "Open source",
        p: "The full source is on GitHub under FSL-1.1-MIT. Read every line, run it on your own hardware, fork it if we ever let you down.",
        cta: "LICENSE · self-host · contribute",
      },
      {
        k: "Modular",
        p: "Money, People and Work are three independent products. Roll out one, skip the others, swap any of them later. No all-or-nothing migration.",
        cta: "Three modules, one workspace",
      },
      {
        k: "Ecosystem-first",
        p: "Webhooks on every resource event, a public REST API, SDKs for TypeScript / Python / Go. Anything we don't ship, the community can add.",
        cta: "Webhooks · REST · integrations",
      },
      {
        k: "Keyboard-first",
        p: "⌘K finds anything, ⌘J runs anything. Local intent parser, voice dictation, 40+ shortcuts, offline PWA. No mouse required, no LLM call.",
        cta: "⌘K · ⌘J · voice · offline",
      },
    ],
  },

  concepts: {
    eyebrow: "What we believe",
    titleBefore: "Four principles.",
    titleItalic: "No",
    titleAfter: "HR vendor will match all four.",
    items: [
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
    ],
  },

  features: {
    eyebrow: "Everything in one place",
    title: "Nine products that feel like one.",
    subtitle:
      "Each module is deep enough to replace a standalone tool, but they share one profile, one search, one audit log. You'll stop switching tabs — we promise.",
    items: [
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
    ],
  },

  labs: {
    eyebrow: "Labs · shipping now",
    title: "Five bets that landed.",
    subtitle:
      "Labs is where we ship the experimental stuff. Every team on Pulse gets it by default — no waiting lists, no upsells, no \"enterprise tier\" paywall.",
    badgeNew: "NEW",
    items: [
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
    ],
  },

  roles: {
    eyebrow: "Every persona, one surface",
    titleLine1: "The same app,",
    titleItalic: "five",
    titleAfter: "points of view.",
    subtitle:
      "Role themes aren't cosmetic. Each persona ships with its own palette, default view, and shortcut set. Engineers don't see payroll drafts. CFOs don't see sprint standups.",
    items: [
      { k: "Employee", d: "Lime accent. Clock, leave, kudos, focus." },
      { k: "Manager", d: "Amber warmth. Approvals, team load, kudos authority." },
      { k: "HR", d: "Coral. People ops, onboarding, anomalies." },
      { k: "Admin", d: "Electric cyan. Integrations, API, audit." },
      { k: "Finance", d: "Violet. Payroll, margins, forecast." },
    ],
  },

  testimonials: {
    ratingLabel: "5 out of 5 stars",
    items: [
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
    ],
  },

  faq: {
    eyebrow: "Questions we get a lot",
    titleBefore: "Questions,",
    titleItalic: "answered",
    titleAfter: ".",
    items: [
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
    ],
  },

  team: {
    titleBefore: "The people behind",
    titleItalic: "Pulse",
    titleAfter: ".",
    subtitle:
      "A team of 18 across six countries, half building, half in the field. We hire from the industries we serve — payroll, HR ops, design.",
    items: [
      { n: "Sarah Chen", r: "CEO & Co-founder", bio: "Ex-Stripe Atlas. Built payroll rails in 47 countries." },
      { n: "Marcus Rivera", r: "Design lead", bio: "Formerly Figma, Linear. Believes software should feel like a pencil." },
      { n: "Aisha Patel", r: "Head of People", bio: "12 years in HR ops. Turned onboarding into a weekend project." },
      { n: "Yuki Tanaka", r: "VP Product", bio: "Shipped finance tools at Brex before joining." },
      { n: "Lina Rossi", r: "Head of Payroll", bio: "Certified payroll specialist across 8 jurisdictions." },
      { n: "Noah Williams", r: "Staff Engineer", bio: "Distributed systems for payroll concurrency." },
    ],
  },

  useCases: {
    title: {
      before: "Built for the way",
      italic: "your",
      after: "team actually works.",
    },
    items: [
      { k: "Agencies & consultancies", d: "Bill by project code (commessa), track utilization, close books without spreadsheets." },
      { k: "Product startups", d: "Onboard from a candidate-accepted email in one click. Equity, offers, laptops — on rails." },
      { k: "Scale-ups (50-500)", d: "Multi-entity payroll, approval chains that match your org, reports your CFO will actually open." },
    ],
  },

  changelog: {
    eyebrow: "Shipped recently",
    titleBefore: "A changelog",
    titleItalic: "worth reading",
    titleAfter: ".",
    full: "Full changelog",
    items: [
      { d: "Apr 19", t: "Gantt rows taller + rich hover", k: "Polish" },
      { d: "Apr 18", t: "App-wide color decluttering pass", k: "Design" },
      { d: "Apr 14", t: "Avatar hover cards + Employee Score", k: "People" },
      { d: "Apr 09", t: "Saturation tabs + Insights view", k: "Labs" },
      { d: "Apr 02", t: "Commessa Forecast with AI scenarios", k: "Labs" },
      { d: "Mar 28", t: "Command bar ⌘J with runnable actions", k: "Keyboard" },
    ],
  },

  keyboard: {
    eyebrow: "Keyboard-first",
    titleLine1: "Two keys.",
    titleItalic: "Everything",
    titleAfter: ".",
    body: {
      key1Before: " opens a fuzzy palette — jump to any employee, project, document or setting.",
      key2Before:
        " opens the command bar — type what you want in plain language, a local parser turns it into a runnable action. No LLM call, no cross-tenant training, works offline.",
    },
    chipDictate: "Dictate anywhere",
    chipShortcuts: "40+ shortcuts",
    chipOffline: "Works offline",
    panelTitle: "Command bar",
    commandExample: "log 4h on NOV-2025-07 yesterday, feature work",
    parsedLabel: "Parsed · intent=log-hours · confidence 0.94",
    parsedSentence: {
      log: "Log ",
      to: " to ",
      on: " on ",
      tagged: ", tagged ",
      end: ".",
    },
    tagFeature: "feature",
    actionConfirm: "Confirm",
    actionEdit: "Edit details",
    actionOpen: "Open timesheet",
    footerLocal: "local parser · no network call",
    footerOffline: "works offline",
  },

  productPreview: {
    title: {
      before: "See it",
      italic: "moving",
      after: ".",
    },
    openApp: "Open the full app",
    tabs: [
      { k: "dashboard", l: "Dashboard", body: "Approvals, alerts, presence and trends. The one pane your HR team opens at 9am." },
      { k: "time", l: "Time & commesse", body: "Log hours against any commessa. Budget burn, per-client profitability, exports to CSV." },
      { k: "payroll", l: "Payroll", body: "Preview payslips before running, split employees/contractors, file F24 with one click." },
    ],
    bullets: [
      "Approvals in one click",
      "Keyboard-first navigation (⌘K)",
      "Full audit trail",
      "Exports to CSV / PDF / API",
    ],
    mockDashboard: {
      pending: "Pending",
      headcount: "Headcount",
      overtime: "Overtime",
      rows: [
        { n: "Marcus R.", t: "Vacation · 5d", s: "pending" },
        { n: "Tom B.", t: "Sick · 3d", s: "approved" },
        { n: "Noah W.", t: "Personal · 1d", s: "pending" },
      ],
      statusPending: "pending",
      statusApproved: "approved",
    },
    mockTime: {
      activeClock: "Active clock",
      project: "ACM-2025-01 · Platform rebuild",
      stopCta: "Stop & log hours",
    },
    mockPayroll: {
      nextRun: "Next run · April 2025",
      employees: "12 employees · scheduled Apr 30",
      rows: ["F24 (Italy)", "Form 941 (US)", "HMRC PAYE (UK)"],
      pending: "pending",
      filed: "filed",
    },
  },

  cta: {
    titleLine1: "Your team deserves",
    titleItalic: "better software",
    titleAfter: ".",
    body: "Free for the first 5 employees — forever. No credit card. Import your data in under an hour.",
    primary: "Start free",
    secondary: "Talk to sales",
  },

  page404: {
    eyebrow: "Error 404",
    titleBefore: "Page not",
    titleItalic: "found",
    titleAfter: ".",
    body: "You followed a link that no longer exists, or typed the URL by hand. The overview usually has what you're looking for.",
    back: "Back to Pulse HR",
    report: "Tell us what broke",
    title: "404 — page not found — Pulse HR",
    description:
      "The page you asked for doesn't exist. Head back to the Pulse HR overview or search from the nav.",
  },

  indexPage: {
    title: "Open-source HR, payroll & time tracking — Pulse HR",
  },

  productPage: {
    title: "Product tour — Pulse HR platform overview",
    description:
      "Three independent modules — Money, People and Work — sharing one workspace, one keyboard, one API. Open source under FSL. Keyboard-first, role-themed, multi-country.",
    eyebrow: "Product tour",
    titleLine1: "Nine products,",
    titleItalic: "one workspace",
    titleAfter: ".",
    body:
      "Every module goes deep enough to replace a standalone tool — and they share one profile, one search, one audit log, one API. Adopt Money, People and Work independently, or all three together.",
  },

  labsPage: {
    title: "Pulse Labs — forecasting, kudos, focus & pulse tools",
    description:
      "Five Labs features shipping now: Team Pulse sentiment, Commessa Forecast scenario planning, Kudos peer recognition, Focus Mode deep work, and Saturation utilization. Included on every plan.",
    eyebrow: "Labs · shipping now · free on every plan",
    titleLine1: "The five Pulse features",
    titleItalic: "reinventing",
    titleAfter: " HR software.",
    body:
      "Labs is where we ship experimental capabilities first — AI forecasting, sentiment heatmaps, peer recognition, deep-work automation and live utilization insights. No waiting lists, no upsells, no enterprise-tier paywall.",
  },

  changelogPage: {
    title: "Pulse HR changelog — product updates & feature shipments",
    description:
      "Every meaningful update to the Pulse HR platform. Gantt polish, color decluttering, Employee Score, Saturation tabs, Commessa Forecast, Command bar — in reverse chronological order.",
    eyebrow: "Changelog",
    titleBefore: "What's",
    titleItalic: "shipped",
    titleAfter: ".",
    body:
      'Meaningful updates only — no "version 2.38.4 bug fixes" padding. New entries land every week or two, and each one gets a quick note about why it mattered.',
    breadcrumb: "Changelog",
  },

  contactPage: {
    title: "Contact — email, GitHub Discussions, security reports",
    description:
      "One email per purpose. GitHub Discussions for anything you want to ask in public. Security reports via security@. No chatbot funnels, no \"book a demo\" form that routes to a BDR.",
    eyebrow: "Contact",
    titleLine1: "A real inbox.",
    titleItalic: "Real",
    titleAfter: " humans.",
    body:
      "No chatbot funnels, no \"book a call\" form that routes to a BDR on commission. One email per purpose, and most product conversation happens in public on GitHub. Pick the lane that fits.",
    askPublic: "Ask in public.",
    whereTitle: "Where we are.",
    whereBody: "HQ in Milan, team remote-first across CET and PT.",
    hq: "Milan (HQ)",
    berlin: "Berlin",
    sf: "San Francisco",
    slaNote:
      "We aim to respond within the same business day (CET office hours) for sales and general questions. Security reports: within 24 h. GitHub issues: triaged daily, no SLA. For anything time-critical and private that doesn't fit the categories above, hello@pulsehr.it still works.",
    breadcrumb: "Contact",
    channels: [
      {
        k: "General & sales",
        email: "hello@pulsehr.it",
        d: "The catch-all. Product questions, trial help, how we bill, whether we fit your use-case. One human replies, usually the same day.",
      },
      {
        k: "Procurement / RFP",
        email: "sales@pulsehr.it",
        d: "DPAs, vendor questionnaires, security reviews, purchase orders. We pre-fill the common ones (SIG-lite, CAIQ) and send them back in 24 h.",
      },
      {
        k: "Security reports",
        email: "security@pulsehr.it",
        d: "Responsible disclosure. PGP key available at /.well-known/security.txt. Full policy at /security.",
      },
      {
        k: "Press & partnerships",
        email: "press@pulsehr.it",
        d: "Journalists, analysts, integration partners. Include a calendar link and we'll skip the email tennis.",
      },
    ],
    other: [
      {
        k: "GitHub issues",
        d: "Bug reports, feature requests, anything the whole community should see. Labels: bug / feature / docs / question.",
        label: "github.com/davide97g/pulse-hr/issues",
      },
      {
        k: "GitHub Discussions",
        d: "Open-ended questions, ideas, show-and-tell. If it's not a concrete bug, this is where it lives.",
        label: "github.com/davide97g/pulse-hr/discussions",
      },
    ],
  },

  stub: {
    badge: "Coming soon",
    back: "Back to Pulse HR",
    seeOverview: "See the overview",
    pingUs: "Ping us about",
    privacyTitle: "Privacy policy",
    privacyDescription:
      "How we collect, process and protect personal data. GDPR-compliant by design with EU data residency. Full policy document being finalised by legal.",
    termsTitle: "Terms of service",
    termsDescription:
      "Master subscription agreement, acceptable use policy and data processing addendum. The full document is being finalised and publishes here shortly.",
  },

  heroNewTags: [
    "Command bar ⌘J",
    "Commessa Forecast",
    "Saturation",
    "Team Pulse",
    "Kudos",
    "Focus Mode",
    "Open source",
  ] as string[],
};

export type Dict = typeof en;
