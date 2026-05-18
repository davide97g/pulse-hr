// English strings — master dictionary.
// Brand, tech acronyms and accepted English terms (HR, API, SOC 2, GDPR, PWA,
// SDK, webhook, open source, CEO/COO/CFO, kudos, ⌘K/⌘J, SaaS, GitHub, Slack,
// Docker, Kubernetes, Helm, Terraform, etc.) stay in English across all locales.
// We deliberately do not name other HR / people-ops products in marketing copy.

export const en = {
  meta: {
    tagline: "Open-source recognition, growth, and proof of work — for the IC.",
    description:
      "Your best work is buried in a Slack thread from March. Pulse HR makes it impossible to miss — three lines a day in Status Log, a kudos that sticks, a growth trail you carry into your next conversation. Open-source workspace for the IC. Self-host in 90 seconds. The demo is the sales call.",
    keywords:
      "open source HR, recognition, employee engagement, async standup, kudos, peer recognition, status log, growth, individual contributor, IC, self-hosted",
    ogImage: "/og/og-hero.png",
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
    news: "News",
    signIn: "Sign in",
    startFree: "Start free",
    viewGithub: "View source on GitHub",
    github: "GitHub",
  },

  footer: {
    tagline: "Employee-first. Open source. Built by the people who use it.",
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
    eyebrow: "Open-source workspace · built for the IC",
    titleBefore: "Three lines",
    titleItalic: "beat",
    titleAfter: " a standup",
    body: [
      "Pulse HR pulls it out. Open-source workspace for the IC — ",
      "three lines",
      " in Status Log, ",
      "a kudos",
      " that sticks, ",
      "a growth trail",
      " that doesn't live in someone else's spreadsheet. Self-host in 90 seconds with `docker compose up`, or pay us to host. The demo is the sales call.",
    ] as string[],
    ctaPrimary: "Open the demo",
    ctaGithub: "Read the source",
    ctaTour: "See the app",
    chip1: "Three lines · A kudos · Proof",
    chip2: "No demo gate · No enterprise tier",
    chip3: "Self-host or hosted — your call",
    newThisQuarter: "New this quarter",
  },

  heroReel: {
    ariaLabel: "Pulse HR product reel",
    videoLabel: "A day at Pulse — animated showreel",
    posterAlt: "A day at Pulse — static preview",
    caption: "A day at Pulse · 20s loop",
    blogCta: "Read the launch story",
    youtubeCta: "Watch on YouTube",
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
        "Whichever app your company pays for, your best work still scrolls off the team channel by Friday. Pulse is the only workspace where the source, the roadmap, the changelog and the prices are public, built around the IC instead of the org chart — ",
      link: "see what we improve on",
      after: ".",
    },
    source: "Source",
    values: [
      {
        k: "Employee-first",
        p: "The IC is the user. The manager is a witness. Every feature is judged on whether it makes your first ten minutes better, your proof of work stronger, your next conversation easier. Raw chat stays with you — only aggregates cross the line up.",
        cta: "Status Log · Kudos · Growth",
      },
      {
        k: "Open source",
        p: "Full source on GitHub under FSL-1.1-MIT, converting to plain MIT in two years. Read every line, self-host in 90 seconds with `docker compose up`, fork if we let you down. No demo gate. No enterprise tier with extra features.",
        cta: "LICENSE · self-host · contribute",
      },
      {
        k: "Built by the people who use it",
        p: "The roadmap is shaped by pull requests, not product managers. Davide and Niccolò run Pulse on themselves every day — if a friction lasts more than a week, it gets fixed. \"Feature request\" and \"pull request\" are two paths to the same roadmap.",
        cta: "Roadmap · PRs · feedback board",
      },
      {
        k: "Yours, any time",
        p: "Your data, your infra, your exit. Self-host on Docker, Helm or Terraform. Export everything in a clean format, without asking. The strongest signal we're doing this right is that leaving Pulse is easy.",
        cta: "Self-host · export · no lock-in",
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
        k: "Employee-first",
        d: "The IC is the user. The manager is a witness. Every feature is judged on whether it makes your first ten minutes better, your proof of work stronger, your next conversation easier. If a feature makes the manager more powerful without making you more visible, it's wrong.",
      },
      {
        k: "Open source",
        d: "The whole platform is on GitHub under the Functional Source License (FSL-1.1-MIT, converting to MIT after two years). Read the code, run it yourself, fork it if we ever let you down. The OSS is the whole product. No enterprise tier with extra features.",
      },
      {
        k: "Built by the people who use it",
        d: "The roadmap is shaped by pull requests, not product managers. The maintainers use Pulse for their own work every day. 'Feature request' and 'pull request' are two paths to the same roadmap, and both are first-class.",
      },
      {
        k: "Yours, any time",
        d: "Self-host on your own box if you want. Export everything in a clean format any time, without asking. No proprietary binary formats, no contractual exit stalling. The strongest signal we're doing this right is that leaving Pulse is easy.",
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
    eyebrow: "Built for the IC. Quiet for everyone else.",
    titleLine1: "The IC drives.",
    titleItalic: "Everyone",
    titleAfter: " else rides.",
    subtitle:
      "Pulse is adopted bottoms-up: the IC self-installs, posts status, sends a kudos. Their team joins. Their manager finds the Friday recap suddenly works. By month three the whole company is on it. The surfaces below are how each role enters — the IC first, the rest in their wake.",
    items: [
      { k: "Employee", d: "The hero. Post status, send kudos, check in on workload, log days off — the whole product is built around your first ten minutes." },
      { k: "Manager", d: "Pulled in once the team is already using Pulse. You read the sentiment recap, never the raw chat. The aggregate is the contract." },
      { k: "HR", d: "Arrives last. Curates People Insights, watches trends. The tool was rolled out before you noticed — that's the point." },
      { k: "Admin", d: "Usually the IC who self-hosted, now wearing a second hat. Modules, persona setup, audit log — and \"View as\"." },
      { k: "Finance", d: "Honest answer: this isn't for you. Keep your existing payroll tool. Pulse is the people half, on purpose." },
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
        a: "No, and that's the point. Pulse is the people half of HR — status, growth, kudos, wellbeing. Payroll, time tracking, recruiting, project allocation and document e-signature belong in tools built for them. Pulse runs next to your HRIS, not in place of it. The narrow scope is what makes the team actually open it.",
      },
      {
        q: "How is Pulse HR priced?",
        a: "Two ways to pay. Self-host is €0 — full open source, run it on your own infra. Hosted is €6 per active employee per month — same product, we run the uptime and the backups so you don't. No demo gate, no enterprise tier with extra features, no per-seat add-ons for API access or SSO. Annual billing is 15% off.",
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
      {
        n: "Davide Ghiotto",
        r: "Maintainer",
        bio: "Frontend-fluent, tired of HR software. github.com/davide97g · linkedin.com/in/davide-ghiotto",
        linkedin: "https://www.linkedin.com/in/davide-ghiotto",
        github: "https://github.com/davide97g",
      },
      {
        n: "Niccolò Naso",
        r: "Maintainer",
        bio: "Frontend-fluent co-maintainer. github.com/LordNik10 · linkedin.com/in/niccolò-naso-888039178",
        linkedin: "https://www.linkedin.com/in/niccolò-naso-888039178",
        github: "https://github.com/LordNik10",
      },
      {
        n: "You?",
        r: "Open to contributors",
        bio: "The roadmap is shaped by pull requests. If the codebase fixes a pain you live with every week, land a PR — we credit every contributor in the changelog.",
      },
    ] as {
      n: string;
      r: string;
      bio: string;
      linkedin?: string;
      github?: string;
    }[],
  },

  useCases: {
    title: {
      before: "Built for the IC",
      italic: "your",
      after: "company hasn't noticed yet.",
    },
    items: [
      { k: "The IC reconstructing their year from screenshots", d: "Three lines a day in Status Log builds the trail. Walk into review week with proof — kudos, status, growth artefacts the IC owns." },
      { k: "The team tired of standup theatre", d: "Three lines, public feed, ⌘⏎ to publish. Six minutes once a day beats thirty minutes every morning, and the manager-safe recap means the manager still has signal." },
      { k: "The self-hoster who hates SaaS lock-in", d: "`docker compose up` — 90 seconds to a workspace on a €25 Hetzner box. Source on GitHub under FSL. Leaving is a `pg_dump` away." },
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
    titleLine1: "Make your work",
    titleItalic: "impossible",
    titleAfter: " to miss.",
    body: "Self-host the open source on your own infra in 90 seconds, or pay us to run it. No demo gate. No enterprise tier with extra features. Export everything in a click — always.",
    primary: "Open the demo",
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
    title: "Pulse HR — open-source workspace for the IC",
  },

  productPage: {
    title: "Product tour — eight surfaces built around the IC",
    description:
      "Status Log, Growth, Kudos, Moments, Pulse, Workload check-in, Leave journal, People Insights — eight surfaces that make the IC's work visible. Open source under FSL. Keyboard-first, self-host in 90 seconds.",
    eyebrow: "Product tour",
    titleLine1: "Eight surfaces,",
    titleItalic: "one feeling",
    titleAfter: ": seen.",
    body:
      "Every surface is about a person, not a process. Status, kudos, growth, rest, workload — written in seconds, read in seconds. Hours and payroll live in the tools built for them. We don't compete there.",
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
      "One email per purpose. GitHub Discussions for anything you want to ask in public. Security reports via security@. No chatbot funnels, no demo gate, no \"talk to sales\" form that routes to a BDR.",
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

  pricingPage: {
    title: "Pricing — self-host free, hosted €6/employee, no enterprise tier",
    description:
      "Two ways to pay. Self-host is €0 — full open source, run it yourself. Hosted is €6 per active employee per month, with every feature included. No demo gate, no enterprise tier with extra features.",
  },

  vsPage: {
    title: "Pulse HR vs the pattern of invisibility — what we improve on",
    description:
      "We don't compete with other HR tools. We compete with the shared doc nobody opens, the kudos that scrolls off, the review that fits a year into a textarea. Eight shapes the problem takes, and what Pulse ships for each — plus honest losses.",
  },

  blogPage: {
    title: "Blog — OSS mechanics, IC visibility, agent-native workflows",
    description:
      "A 6-month publishing schedule. Engineering deep-dives on the open-source HR stack, field notes on making the IC's work visible, and agent-native workflows for people data.",
  },

  securityPage: {
    title: "Security — how Pulse HR protects your data",
    description:
      "SOC 2 Type II in progress, GDPR-by-design, EU data residency, encryption at rest + in transit, full audit log, responsible-disclosure program. Technical detail, not a brochure.",
  },

  openSourcePage: {
    title: "Open source — Pulse HR is on GitHub under FSL-1.1-MIT",
    description:
      "The full source of Pulse HR is public on GitHub under the Functional Source License (converts to MIT after 2 years). Read it, run it, fork it, contribute back. Self-host on Docker or Kubernetes.",
  },

  ecosystemPage: {
    title: "Ecosystem — Slack, Google Calendar, SSO, webhooks, REST API",
    description:
      "Lightweight by design. Slack notifications, Google Calendar OOO sync, SSO via Okta/Google, plus a public REST API with webhooks and maintained SDKs for TypeScript / Python / Go. Your hours, payroll and project tools already have homes — Pulse plugs in where it adds signal.",
  },

  keyboardPage: {
    title: "Keyboard-first — ⌘K, ⌘J command bar, voice, offline PWA",
    description:
      "⌘K opens a fuzzy finder, ⌘J opens a command bar that runs a local intent parser. Voice dictation, 40+ shortcuts, works offline as a PWA. No LLM call, no cross-tenant training — every keystroke stays on your device.",
  },

  modulesPage: {
    title: "What's inside — eight surfaces about how your team is doing",
    description:
      "Pulse is narrow on purpose. Eight surfaces — Status Log, Growth, Kudos, Moments, Workload check-in, Leave journal, Pulse, People Insights — all about a person, not a process. Hours and payroll belong in the tools built for them.",
  },

  roadmapPage: {
    title: "Roadmap — what's shipping now, next, and later at Pulse HR",
    description:
      "A public, honest roadmap. Three lanes — Now (in flight this quarter), Next (scoped for the quarter after), Later (on our radar). Shipped items are in the changelog.",
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
