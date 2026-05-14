// English strings — master dictionary.
// Brand, tech acronyms and accepted English terms (HR, API, SOC 2, GDPR, PWA, SDK,
// webhook, open source, CEO/COO/CFO, kudos, ⌘K/⌘J, SaaS, Rippling, Deel, BambooHR,
// GitHub, Slack, etc.) stay in English across all locales.

export const en = {
  meta: {
    tagline: "Software for people, not headcount.",
    description:
      "The HR tool that cares how you're doing, not how many hours you logged. Async status log, growth, kudos, wellbeing — no timesheets, no approval queues, no payroll. Open-source, self-hostable, built by the people who use it.",
    keywords:
      "employee engagement, async standup, kudos, peer recognition, wellbeing, open source, self-hosted, status log, growth, employee satisfaction, people-first HR",
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
    tagline: "Open. Transparent. Built in public, by the people who use it.",
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
    eyebrow: "Open-source · for the humans on your team",
    titleBefore: "Software for",
    titleItalic: "people",
    titleAfter: ", not headcount.",
    body: [
      "The HR tool that cares how you're doing, not how many hours you logged. ",
      "Async status log",
      ", ",
      "growth",
      " and ",
      "recognition",
      " — built around the moments that matter to a team. No timesheets, no approval queues, no payroll. Open-source on GitHub, self-host or run hosted — no sales call to see the product.",
    ] as string[],
    ctaPrimary: "Try it free — your data, your infra",
    ctaGithub: "Read the source",
    ctaTour: "See the app",
    chip1: "No timesheets · No approval queues",
    chip2: "Async standups · Continuous Pulse",
    chip3: "Self-host or hosted — your call",
    newThisQuarter: "New this quarter",
  },

  heroReel: {
    ariaLabel: "Pulse HR product reel",
    videoLabel: "A day at Pulse — animated showreel",
    posterAlt: "A day at Pulse — static preview",
    caption: "A day at Pulse · 20s loop",
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
      before: "The other HR tools",
      italic: "count",
      after: "you. We ",
      end: "see you.",
    },
    subtitle: {
      before:
        "Lattice ties everything to OKRs. 15Five is built around 1:1 forms. Officevibe is a survey shop. Pulse is the only people-first tool where the source, the roadmap, the changelog and the prices are all public — ",
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
        p: "The roadmap is shaped by pull requests, not product managers. Pulse covers the people half of HR — status, growth, kudos, wellbeing — and stays out of the business half on purpose. The maintainers use Pulse on themselves every day; every ship is because someone actually needed it.",
        cta: "Surfaces · PRs · feedback board",
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
    eyebrow: "What's inside",
    title: "Eight surfaces. One feeling: seen.",
    subtitle:
      "Pulse is narrow on purpose. Every surface is about how a person is doing — what they're working on, what they're celebrating, where they're stretched. Payroll, timesheets and project allocation belong in tools built for them. We don't compete there.",
    items: [
      {
        icon: "MessageSquare",
        title: "Status Log",
        body: "Async morning standup in writing. Three lines per person, public team feed, manager-safe sentiment recap — the raw chat stays with the employee. No meetings, no AI, no chat threads.",
      },
      {
        icon: "Trophy",
        title: "Growth",
        body: "Achievements, challenges, skill paths and kudos coins on one canvas. Continuous signal, not yearly reviews. The score is built from what people actually do, not from a manager filling in a form.",
      },
      {
        icon: "Gift",
        title: "Kudos",
        body: "Peer recognition with reasons attached. Coins between teammates, confetti on send, leaderboards that reset weekly, monthly and yearly. Lives inside Growth.",
      },
      {
        icon: "Sparkles",
        title: "Moments",
        body: "Birthdays, work anniversaries and the kudos ticker on one continuous feed. Company memory rendered as a screen.",
      },
      {
        icon: "Gauge",
        title: "Workload check-in",
        body: "One tap each Friday — light / balanced / heavy / overloaded. Eight-week sparkline trend. Your manager sees the trend, not the individual answers. Hours and project allocation live in your other tool.",
      },
      {
        icon: "Calendar",
        title: "Leave journal",
        body: "Personal record of the days off you took. No approval workflow, no pending state — you log it, it's logged. Balance visible to you alone, for your own picture.",
      },
      {
        icon: "Heart",
        title: "Pulse",
        body: "Anonymous weekly vibe heatmap. Shows only when at least three people answer. Embedded inside Status Log so it stays part of the conversation, not a survey to dread.",
      },
      {
        icon: "BarChart3",
        title: "People Insights",
        body: "Engagement, sentiment, kudos volume, growth trend, Pulse vibe over time. Reports about how people are doing — not about cost per hire or margin.",
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
        icon: "MessageSquare",
        kind: "Status Log",
        tag: "Standup",
        body: "Async morning standup in writing. Three lines per person, public team feed, manager-safe recap with sentiment dimensions. No call, no AI, no chat.",
      },
      {
        icon: "Gift",
        kind: "Kudos",
        tag: "Recognition",
        body: "Peer coins with reasons attached, confetti included. Leaderboards reset weekly, monthly and yearly. Lives inside Growth.",
      },
      {
        icon: "Gauge",
        kind: "Workload check-in",
        tag: "Load",
        body: "One tap a week — light / balanced / heavy / overloaded. An 8-week sparkline of how the team is holding up. No allocations, no percentages, no hours.",
      },
      {
        icon: "Sparkles",
        kind: "Moments",
        tag: "Ritual",
        body: "Birthdays, work anniversaries and the kudos ticker on one continuous feed. Company memory rendered as a screen.",
      },
    ],
  },

  roles: {
    eyebrow: "Every persona, one surface",
    titleLine1: "The same app,",
    titleItalic: "five",
    titleAfter: "points of view.",
    subtitle:
      "Each persona ships with its own sidebar groups, default view and shortcut set. Light and dark themes today; per-persona accent palettes are on the roadmap. CFOs don't see sprint standups.",
    items: [
      { k: "Employee", d: "Post status, send kudos, check in on workload, log days off." },
      { k: "Manager", d: "Read the sentiment recap, notice overload, celebrate wins. Never the raw chat." },
      { k: "HR", d: "Engagement signal, growth conversations, wellbeing trends. No spreadsheets." },
      { k: "Admin", d: "Modules, persona setup, audit log — and \"View as\"." },
      { k: "Finance", d: "Honest answer: this isn't for you. Keep your existing payroll tool." },
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
        q: "Does Pulse replace my HRIS?",
        a: "No, and that's the point. Pulse is the people half of HR — status, growth, kudos, wellbeing. Payroll, time tracking, recruiting, project allocation and document e-signature belong in tools built for them. Pulse runs next to your HRIS, not in place of it. Many teams use Pulse alongside BambooHR, Personio, Rippling or Factorial; the lightweight scope is what makes it actually get used.",
      },
      {
        q: "How is Pulse HR priced?",
        a: "Per active employee, per month. One transparent tier with every feature included — no 'talk to sales' gates, no upsell for Labs features, no per-seat add-ons for API access or SSO. Free for the first 5 active employees, forever. Annual billing is 15% off.",
      },
      {
        q: "Is it SOC 2 / GDPR compliant?",
        a: "Honest answer: we are GDPR-compliant by design — EU data residency (Frankfurt, Dublin), signed DPA on sign-up, documented sub-processors at pulsehr.it/security. SOC 2 Type II and ISO 27001 are not in hand today; they're on the roadmap as the customer base requires them. If you need an attestation before we have one, the honest path is self-host — you stay in control of the audit boundary. We'd rather tell you that than pretend.",
      },
      {
        q: "Do you have an API?",
        a: "Yes — a full REST API, webhooks on every resource event (employee.created, leave.approved, etc.), and maintained SDKs for TypeScript, Python and Go. API keys are scoped per environment with granular permissions. Full OpenAPI spec published at pulsehr.it/docs/api. Rate limits are 1,000 requests/minute on the standard tier.",
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
        a: "The command bar runs a local intent parser over your tenant's data — no LLM call, no network round-trip, no cross-tenant training. You type natural phrases like 'send kudos to Marta for the demo' or 'log a day off last Friday', and a deterministic heuristic maps them to runnable actions scoped to your permissions. Because it runs in the browser, it works offline as part of the PWA. We'll expose an MCP server for external agent workflows in a later release; until then, the honest label is: a keyboard-first command bar — no AI in the loop.",
      },
      {
        q: "Does Pulse work offline?",
        a: "The whole surface installs as a PWA on macOS, Windows, iOS and Android. Recent views, status-log drafts and kudos drafts keep working offline and sync as soon as you're back — no 'loading…' screens at the airport or in a basement meeting room. Destructive actions require a live connection and queue if offline, so nothing fires twice by mistake.",
      },
    ],
  },

  team: {
    titleBefore: "The people behind",
    titleItalic: "Pulse",
    titleAfter: ".",
    subtitle:
      "Two frontend-fluent developers, building in public. Agent-driven development is how two of us compete — we don't sell it, we just ship more than our headcount should allow. The product is the main character; we sign our commits.",
    items: [
      { n: "Davide Ghiotto", r: "Maintainer", bio: "Frontend-fluent, tired of HR software. github.com/davide97g · linkedin.com/in/davide-ghiotto" },
      { n: "Niccolò Naso", r: "Maintainer", bio: "Frontend-fluent co-maintainer. github.com/LordNik10 · linkedin.com/in/niccolò-naso-888039178" },
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
      { k: "Teams sick of yearly reviews", d: "Continuous signal — kudos, status, sentiment — instead of a 90-minute calibration once a year." },
      { k: "Distributed teams tired of meetings", d: "Async standup in writing, workload check-in in one tap. Stop scheduling time to talk about time." },
      { k: "Founders who want to know their people are okay", d: "Pulse vibe, overload signal, kudos volume. Read it in 30 seconds, act on it before someone quits." },
    ],
  },

  changelog: {
    eyebrow: "Shipped recently",
    titleBefore: "A changelog",
    titleItalic: "worth reading",
    titleAfter: ".",
    full: "Full changelog",
    items: [
      { d: "May 09", t: "Forced dark theme on auth + feedback screens", k: "Polish" },
      { d: "May 06", t: "Sidebar collapse, theme and \"View as\" persist across reloads", k: "Workspace" },
      { d: "Apr 30", t: "Welcome flow simplified — name + company size, no role pick", k: "Onboarding" },
      { d: "Apr 24", t: "Topbar \"View as\" — preview the app as another persona", k: "Workspace" },
      { d: "Apr 19", t: "Sidebar regrouped: Dashboard / People / Time / Work / Other", k: "Navigation" },
    ],
  },

  keyboard: {
    eyebrow: "Keyboard-first",
    titleLine1: "Two keys.",
    titleItalic: "Everything",
    titleAfter: ".",
    body: {
      key1Before: " opens a fuzzy palette — jump to any teammate, page or setting.",
      key2Before:
        " opens the command bar — type what you want in plain language, a local parser turns it into a runnable action. No LLM call, no cross-tenant training, works offline.",
    },
    chipDictate: "Dictate anywhere",
    chipShortcuts: "40+ shortcuts",
    chipOffline: "Works offline",
    panelTitle: "Command bar",
    commandExample: "send kudos to Marta for the demo, thanks",
    parsedLabel: "Parsed · intent=send-kudos · confidence 0.96",
    parsedSentence: {
      log: "Send ",
      to: " to ",
      on: " for ",
      tagged: ", note ",
      end: ".",
    },
    tagFeature: "demo",
    actionConfirm: "Confirm",
    actionEdit: "Edit details",
    actionOpen: "Open Kudos",
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
      { k: "dashboard", l: "Dashboard", body: "Status streak, kudos this week, growth score, team Pulse vibe, upcoming Moments. The one pane your team opens at 9am." },
      { k: "log", l: "Status Log", body: "Three lines per person, public team feed, manager-safe sentiment recap. The raw chat stays with the employee." },
    ],
    bullets: [
      "One-tap workload check-in",
      "Keyboard-first navigation (⌘K)",
      "Manager-safe sentiment recap",
      "Self-host or hosted — your call",
    ],
    mockDashboard: {
      pending: "Logged off",
      headcount: "Kudos · week",
      overtime: "Growth score",
      rows: [
        { n: "Marta E.", t: "Kudos · Demo ace", s: "approved" },
        { n: "Tom B.", t: "Status · 3 in a row", s: "approved" },
        { n: "Noah W.", t: "Personal · 1d off", s: "approved" },
      ],
      statusPending: "fresh",
      statusApproved: "logged",
    },
    mockTime: {
      activeClock: "This week",
      project: "Workload · balanced ⛅",
      stopCta: "Open Status Log",
    },
  },

  cta: {
    titleLine1: "Software for",
    titleItalic: "people",
    titleAfter: ", not headcount.",
    body: "Free forever, self-hosted. Free for your first 5 employees on hosted Pulse. No credit card. No sales call to see the product. Export everything in a click — always.",
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
    title: "Pulse HR — software for people, not headcount",
  },

  productPage: {
    title: "Product tour — Pulse HR people-first overview",
    description:
      "Status Log, Growth, Kudos, Moments, Pulse, Workload check-in, Leave journal, People Insights — eight surfaces all about how your team is doing. Open source under FSL. Keyboard-first, self-hostable.",
    eyebrow: "Product tour",
    titleLine1: "Eight surfaces,",
    titleItalic: "one feeling",
    titleAfter: ": seen.",
    body:
      "Every surface is about a person, not a process. Status, kudos, growth, rest, workload — read in seconds, acted on in seconds. Hours and payroll live in the tools built for them. We don't compete there.",
  },

  labsPage: {
    title: "Pulse Labs — status log, kudos, workload check-in, moments",
    description:
      "Four Labs features shipping now: Status Log (async standup + recap), Kudos peer recognition, Workload check-in, and Moments. Included on every plan.",
    eyebrow: "Labs · shipping now · free on every plan",
    titleLine1: "The four Pulse features",
    titleItalic: "reinventing",
    titleAfter: " how teams stay in sync.",
    body:
      "Labs is where we ship experimental capabilities first — async standup with manager-safe recap, peer recognition, one-tap workload check-in, and a company-memory feed. No waiting lists, no upsells, no enterprise-tier paywall.",
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
    whereBody: "Remote-first team across CET and PT.",
    hq: "Remote-first",
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
    "Status Log",
    "Workload check-in",
    "Kudos",
    "Moments",
    "Open source",
  ] as string[],
};

export type Dict = typeof en;
