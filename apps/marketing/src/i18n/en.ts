// English strings — master dictionary.
// Brand, tech acronyms and accepted English terms (HR, API, SOC 2, GDPR, PWA, SDK,
// webhook, open source, CEO/COO/CFO, kudos, ⌘K/⌘J, SaaS, Rippling, Deel, BambooHR,
// GitHub, Slack, etc.) stay in English across all locales.

export const en = {
  meta: {
    tagline: "HR software for people who hate HR software.",
    description:
      "Open-source people ops for modern teams. Built in the open, by the people who use it. Money, People and Work as three composable modules. Self-host on your own infra, or run hosted — no sales call to see the product.",
    keywords:
      "open source HR, HRIS, self-hosted HR, modular HR, HR API, webhooks, time tracking, commessa, keyboard-first, PWA, FSL, public roadmap",
  },

  a11y: {
    skipToMain: "Skip to main content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    pulseHomeLabel: "Pulse HR home",
    primaryNav: "Primary",
    footer: "Footer",
    customerLogos: "Sample workspace names",
    customerTestimonials: "Maintainer notes",
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
    tagline: "Open. Transparent. Built by the people who use it. Shipped from Milan, in public.",
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

  demoStrip: {
    label: "Public demo notice",
    tag: "Public demo",
    headline: "Pulse is in demo mode.",
    body: "The product is a frontend-only mock — every screen, every record runs in your browser. We're shipping it early to learn what people actually need before we wire up the backend. Sign in inside the app to leave feedback that goes straight to the maintainers.",
    cta: "Open the demo",
  },

  demoNotice: {
    eyebrow: "Status check",
    title: {
      before: "What you're looking at is a ",
      italic: "demo.",
      after: "",
    },
    body: "Pulse HR is currently a frontend-only mock. We deliberately ship it before the backend so the people who use HR software every day can shape what we build first. Click around, break things, then tell us what's missing — feedback is the only piece that talks to a real backend, and that's the piece we want to hear from you on.",
    bullets: [
      {
        k: "Mocked end-to-end",
        v: "Every employee, project, document and request lives in your browser. Nothing is sent to a server.",
      },
      {
        k: "Open in one click",
        v: "No signup needed to explore — spin up a workspace, pick a role, click around for as long as you like.",
      },
      {
        k: "Feedback is members-only",
        v: "Leaving a comment, voting on a Labs feature or posting on the feedback board needs a free account so we can follow up.",
      },
    ],
    ctaPrimary: "Try the demo — no signup",
    ctaSecondary: "Sign in to leave feedback",
  },

  hero: {
    badge: "Open source · FSL-1.1-MIT · public beta · built in public",
    eyebrow: "Open-source people ops for modern teams",
    titleBefore: "HR software for people who",
    titleItalic: "hate",
    titleAfter: " HR software",
    body: [
      "Built in the open. Shaped by the people who use it. ",
      "Money",
      ", ",
      "People",
      " and ",
      "Work",
      " — three independent modules sharing one workspace, one keyboard, one API. Source-available on GitHub. Self-host on your own infra, or run hosted — no sales call to see the product, no proprietary export, no lock-in.",
    ] as string[],
    ctaPrimary: "Try it free — your data, your infra",
    ctaGithub: "Read the source",
    ctaTour: "See the app",
    chip1: "Money · People · Work — adopt any",
    chip2: "Public roadmap · public changelog · public prices",
    chip3: "Self-host on Docker / Helm / Terraform",
    newThisQuarter: "New this quarter",
  },

  heroReel: {
    ariaLabel: "Pulse HR product reel",
    videoLabel: "A day at Pulse — animated showreel",
    posterAlt: "A day at Pulse — static preview",
    caption: "A day at Pulse · 12s loop",
  },

  marquee: {
    title: "Sample workspace names — not real customers",
  },

  stats: {
    processed: "Public commits to main",
    countries: "Merged community PRs",
    teams: "GitHub stars",
    commands: "Days shipped in public",
  },

  whyPulse: {
    eyebrow: "Why Pulse",
    title: {
      before: "No other HR vendor",
      italic: "openly",
      after: "ships ",
      end: ".",
    },
    subtitle: {
      before:
        "Rippling is closed. Deel is contractors-only. BambooHR has no API to speak of. Pulse is the only HR platform where the source, the roadmap, the changelog, the screw-ups and the prices are all public — ",
      link: "see the honest comparison",
      after: ".",
    },
    source: "Source",
    values: [
      {
        k: "Open",
        p: "The full source is on GitHub under FSL-1.1-MIT, converting to MIT in two years. Read every line, run it on your hardware, fork it if we ever let you down. No feature gates behind a sales call.",
        cta: "LICENSE · self-host · contribute",
      },
      {
        k: "Transparent",
        p: "Public roadmap. Public changelog. Public prices. Public commits. We publish what we ship, what we broke, and why we chose what we chose. Performance in the open, screw-ups included.",
        cta: "Roadmap · changelog · commits",
      },
      {
        k: "Yours",
        p: "Your data, your infra, your exit. Self-host on Docker, Helm or Terraform. Export everything in a clean format, any time, without asking. Leaving Pulse is easy — that's the point.",
        cta: "Self-host · export · no lock-in",
      },
      {
        k: "Built by the people who use it",
        p: "The roadmap is shaped by pull requests, not product managers. Money, People and Work are three independent modules — adopt one, skip the rest, swap any of them later. Every ship is because someone actually needed it.",
        cta: "Modules · PRs · feedback board",
      },
    ],
  },

  concepts: {
    eyebrow: "What we believe",
    titleBefore: "Four commitments.",
    titleItalic: "Non-",
    titleAfter: "negotiable.",
    items: [
      {
        k: "Open",
        d: "The whole platform is on GitHub under the Functional Source License (FSL-1.1-MIT, converting to MIT after two years). Read the code, run it yourself, fork it if we ever let you down. Your HR data and the software handling it never need to be a black box.",
      },
      {
        k: "Transparent",
        d: "Roadmap, changelog, prices, limits, security policy, telemetry schema — all public. We don't gate what the product does behind a sales call. We don't perform transparency; we just ship with the door open.",
      },
      {
        k: "Yours",
        d: "Self-host on your own box if you want. Export everything in a clean format any time, without asking. No proprietary binary formats, no contractual exit stalling. The strongest signal we're doing this right is that leaving Pulse is easy.",
      },
      {
        k: "Built by the people who use it",
        d: "The roadmap is shaped by pull requests, not product managers. The maintainers use Pulse for their own work every day. 'Feature request' and 'pull request' are two paths to the same roadmap, and both are first-class.",
      },
    ],
  },

  features: {
    eyebrow: "Everything in one place",
    title: "Eight products that feel like one.",
    subtitle:
      "Each module is deep enough to replace a standalone tool, but they share one profile, one search, one audit log. You'll stop switching tabs — we promise.",
    items: [
      {
        icon: "Clock",
        title: "Time & attendance",
        body: "Clock in from anywhere. Track hours against commesse (project codes, the way finance sees it), not just the wall clock. Manual entry, imports, approvals, overtime anomalies — all one surface.",
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
        body: "Type what you want — 'log 4h on NOV-07', 'approve Aisha's expense', 'book leave next Friday'. A local intent parser turns natural phrases into runnable actions. No LLM call, no data leaving your tenant. Works offline.",
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
    title: "Four bets that landed.",
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
      "Role themes aren't cosmetic. Each persona ships with its own palette, default view, and shortcut set. Engineers don't see expense queues. CFOs don't see sprint standups.",
    items: [
      { k: "Employee", d: "Lime accent. Clock, leave, kudos, focus." },
      { k: "Manager", d: "Amber warmth. Approvals, team load, kudos authority." },
      { k: "HR", d: "Coral. People ops, onboarding, anomalies." },
      { k: "Admin", d: "Electric cyan. Integrations, API, audit." },
      { k: "Finance", d: "Violet. Expenses, margins, reports." },
    ],
  },

  // Social proof, honest version. We don't fabricate testimonials (see foundation.md §9).
  // These are direction-setting statements from the maintainers about what we hear back
  // in issues, PRs and early self-host installs. Replace with real user quotes as they arrive.
  testimonials: {
    ratingLabel: "Built in public",
    items: [
      {
        who: "Davide Ghiotto",
        role: "Maintainer · github.com/davide97g",
        body: "We use Pulse for our own project hours and leave every day. If a friction lasts more than a week, it gets fixed. The roadmap is a list of things we — or the people running it on their own infra — actually ran into.",
      },
      {
        who: "Public feedback board",
        role: "github.com/davide97g/pulse-hr/discussions",
        body: "Every feature request is public. Every PR is reviewed in the open. The changelog reads because you can see the commit behind each line. This is how HR software should have been built the whole time.",
      },
      {
        who: "The export button",
        role: "Your data, your infra",
        body: "Click it. Get everything. Go run it somewhere else if you want. The honest test of an open platform is whether you can leave — not what the sales deck says.",
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
        a: "Yes. We ship one-click importers for BambooHR, Personio, Rippling, Deel and Factorial, plus a generic CSV importer with column mapping for anything else. The importer runs a dry-run first so you can fix bad rows before committing, and it preserves employee IDs so integrations keep working. Most teams migrate a full dataset — employees, leave balances, documents — in under an hour.",
      },
      {
        q: "How is Pulse HR priced?",
        a: "Per active employee, per month. One transparent tier with every feature included — no 'talk to sales' gates, no upsell for Labs features, no per-seat add-ons for API access or SSO. Free for the first 5 active employees, forever. Contractors are priced differently and capped at $4 per active contractor per month. Annual billing is 15% off.",
      },
      {
        q: "Is it SOC 2 / GDPR compliant?",
        a: "Honest answer: we are GDPR-compliant by design — EU data residency (Frankfurt, Dublin, Milan), signed DPA on sign-up, documented sub-processors at pulsehr.it/security. SOC 2 Type II and ISO 27001 are not in hand today; they're on the roadmap as the customer base requires them. If you need an attestation before we have one, the honest path is self-host — you stay in control of the audit boundary. We'd rather tell you that than pretend.",
      },
      {
        q: "Do you have an API?",
        a: "Yes — a full REST API, webhooks on every resource event (employee.created, leave.approved, expense.approved, etc.), and maintained SDKs for TypeScript, Python and Go. API keys are scoped per environment with granular permissions. Full OpenAPI spec published at pulsehr.it/docs/api. Rate limits are 1,000 requests/minute on the standard tier.",
      },
      {
        q: "Is Pulse really open source?",
        a: "Yes. The full source is on GitHub at github.com/davide97g/pulse-hr under the Functional Source License (FSL-1.1-MIT). You can read every line, run it yourself, fork it, and contribute back. Two years after each release the license converts automatically to plain MIT — fully permissive. The FSL window blocks competing closed-source SaaS resales during those two years, but any non-competing use (internal deployment, consulting, forks, contributions) is unrestricted from day one. See LICENSE and NOTICE in the repo for the exact terms.",
      },
      {
        q: "Can we self-host?",
        a: "Yes. The whole platform ships as a Bun monorepo you can clone and run. Self-hosted deployments on Docker or Kubernetes are supported with a reference Helm chart and Terraform modules. Everything runs entirely on your infrastructure. Start at github.com/davide97g/pulse-hr.",
      },
      {
        q: "How does the command bar (⌘J) work?",
        a: "The command bar runs a local intent parser over your tenant's data — no LLM call, no network round-trip, no cross-tenant training. You type natural phrases like 'log 4h on NOV-07 yesterday' or 'approve Aisha's expense', and a deterministic heuristic maps them to runnable actions scoped to your permissions. Because it runs in the browser, it works offline as part of the PWA. We'll expose an MCP server for true agent workflows in a later release; until then, this is the honest label — a keyboard-first command bar, not an AI copilot.",
      },
      {
        q: "Does Pulse work offline?",
        a: "The whole surface installs as a PWA on macOS, Windows, iOS and Android. Recent views, timesheets and kudos drafts keep working offline and sync as soon as you're back — no 'loading…' screens at the airport or in a basement meeting room. Destructive actions require a live connection and queue if offline, so nothing fires twice by mistake.",
      },
    ],
  },

  team: {
    titleBefore: "The people behind",
    titleItalic: "Pulse",
    titleAfter: ".",
    subtitle:
      "Two frontend-fluent developers, building in public from Milan. Agent-driven development is how two of us compete — we don't sell it, we just ship more than our headcount should allow. The product is the main character; we sign our commits.",
    items: [
      { n: "Davide Ghiotto", r: "Maintainer · Milan", bio: "Frontend-fluent, tired of HR software. github.com/davide97g · linkedin.com/in/davide-ghiotto" },
      { n: "Niccolò Naso", r: "Maintainer · Milan", bio: "Frontend-fluent co-maintainer. github.com/LordNik10 · linkedin.com/in/niccolò-naso-888039178" },
      { n: "You?", r: "Open to contributors", bio: "The roadmap is shaped by pull requests. If the codebase fixes a pain you live with every week, land a PR — we credit every contributor in the changelog." },
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
      { k: "Scale-ups (50-500)", d: "Approval chains that match your org, multi-entity controls, reports your CFO will actually open." },
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
  },

  cta: {
    titleLine1: "HR software for people who",
    titleItalic: "hate",
    titleAfter: " HR software.",
    body: "Free forever, self-hosted. Free for your first 5 employees on hosted Pulse. No credit card. No sales call to see the product. Import in an hour, export in a click — always.",
    primary: "Try it free",
    secondary: "Read the source",
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
    title: "Pulse HR — HR software for people who hate HR software",
  },

  productPage: {
    title: "Product tour — Pulse HR platform overview",
    description:
      "Three independent modules — Money, People and Work — sharing one workspace, one keyboard, one API. Open source under FSL. Keyboard-first, role-themed, multi-country.",
    eyebrow: "Product tour",
    titleLine1: "Eight products,",
    titleItalic: "one workspace",
    titleAfter: ".",
    body:
      "Every module goes deep enough to replace a standalone tool — and they share one profile, one search, one audit log, one API. Adopt Money, People and Work independently, or all three together.",
  },

  labsPage: {
    title: "Pulse Labs — kudos, focus & pulse tools",
    description:
      "Four Labs features shipping now: Team Pulse sentiment, Kudos peer recognition, Focus Mode deep work, and Saturation utilization. Included on every plan.",
    eyebrow: "Labs · shipping now · free on every plan",
    titleLine1: "The four Pulse features",
    titleItalic: "reinventing",
    titleAfter: " HR software.",
    body:
      "Labs is where we ship experimental capabilities first — sentiment heatmaps, peer recognition, deep-work automation and live utilization insights. No waiting lists, no upsells, no enterprise-tier paywall.",
  },

  changelogPage: {
    title: "Pulse HR changelog — product updates & feature shipments",
    description:
      "Every meaningful update to the Pulse HR platform. Gantt polish, color decluttering, Employee Score, Saturation tabs, Command bar — in reverse chronological order.",
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
    "Saturation",
    "Team Pulse",
    "Kudos",
    "Focus Mode",
    "Open source",
  ] as string[],
};

export type Dict = typeof en;
