import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Sparkles, Clock, Users, Wallet, Briefcase, Shield, Plug, Zap,
  BarChart3, Globe2, Play, Check, ChevronDown, Star, Github, Twitter, Linkedin,
  BookOpen, MessageCircle, Heart, TrendingUp, Gift, Target, Command, Mic,
  Gauge, Trophy, PartyPopper, Palette, WifiOff, Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/landing")({
  head: () => ({ meta: [{ title: "Pulse HR — the people platform you'll actually use" }] }),
  component: Landing,
});

const FEATURES = [
  { icon: Clock,      title: "Time & attendance",    body: "Clock in from anywhere. Track hours against commesse, not just the wall clock. Manual entry, imports, approvals, overtime anomalies — all one surface." },
  { icon: Wallet,     title: "Payroll that doesn't panic", body: "Run multi-country payroll in minutes. F24, Form 941, HMRC PAYE. Payslips, tax filings and journal entries pushed straight to your accounting stack." },
  { icon: Users,      title: "People operations",    body: "One profile per teammate. Org chart, documents, e-signatures, offboarding — no spreadsheets, no lost NDAs." },
  { icon: Briefcase,  title: "Recruiting & onboarding", body: "Kanban pipeline for candidates, automated onboarding workflows the moment someone says yes." },
  { icon: BarChart3,  title: "Reports everyone reads", body: "Headcount, turnover, cost per hire, absenteeism — export to PDF/CSV or pipe to BI in a click." },
  { icon: Plug,       title: "Integrations & API",   body: "Slack, Google, QuickBooks, Okta, Stripe. And when we don't have it, our API and webhooks do." },
  { icon: Gauge,      title: "Saturation & margins", body: "Org utilization, weekly bench, blended margin, at-risk projects. A live read on whether the company is over- or under-sold." },
  { icon: Sparkles,   title: "Copilot (⌘J)",         body: "Ask anything in natural language — approvals, balances, forecasts, payroll previews. Answers stream with runnable actions attached." },
  { icon: Trophy,     title: "Growth & recognition", body: "XP, kudos coins, leaderboards, weekly podiums. Engagement data that HR and managers actually read, not a feel-good gimmick." },
];

// Labs — the "NEW this quarter" surfaces. Each gets an iridescent spotlight
// treatment on the landing grid; order matches the in-app sidebar group.
const LABS = [
  { icon: Heart,       kind: "Team Pulse",        tag: "Signal",    body: "Anonymous vibe checks + weekly heatmap. See sentiment before it shows up in a 1:1." },
  { icon: TrendingUp,  kind: "Commessa Forecast", tag: "AI",        body: "Scenario sliders on top of project burn. 'What if I add a designer?' answered in milliseconds." },
  { icon: Gift,        kind: "Kudos",             tag: "Recognition", body: "Peer coins with reasons attached, confetti included. Leaderboards reset weekly, monthly and yearly." },
  { icon: Target,      kind: "Focus Mode",        tag: "Depth",     body: "Deep-work timer that auto-declines meetings, posts a status, and logs the session to your timesheet." },
  { icon: Gauge,       kind: "Saturation",        tag: "Load",      body: "Utilization heatmap, cost-vs-value scatter, margin tab. Who's leaning in, what's returning in €/h." },
];

// Role themes — each persona gets a dedicated palette shift inside the app.
// Tiles render as mini swatches on landing so the theming story is visible
// without needing a screenshot carousel.
const ROLES: { k: string; d: string; accent: string; bg: string }[] = [
  { k: "Employee", d: "Lime accent. Clock, leave, kudos, focus.",                 accent: "#b4ff39", bg: "#111113" },
  { k: "Manager",  d: "Amber warmth. Approvals, team load, kudos authority.",      accent: "#ffbf4a", bg: "#17130c" },
  { k: "HR",       d: "Coral. People ops, onboarding, anomalies.",                 accent: "#ff8a7a", bg: "#1a1110" },
  { k: "Admin",    d: "Electric cyan. Integrations, API, audit.",                  accent: "#6fd8ff", bg: "#0d151a" },
  { k: "Finance",  d: "Violet. Payroll, margins, forecast.",                       accent: "#c48fff", bg: "#141019" },
];

// Changelog teaser — hand-picked highlights from the last quarter.
const CHANGELOG = [
  { d: "Apr 19", t: "Gantt rows taller + rich hover",     k: "Polish" },
  { d: "Apr 18", t: "App-wide color decluttering pass",   k: "Design" },
  { d: "Apr 14", t: "Avatar hover cards + Employee Score", k: "People" },
  { d: "Apr 09", t: "Saturation tabs + Insights view",    k: "Labs" },
  { d: "Apr 02", t: "Commessa Forecast with AI scenarios", k: "Labs" },
  { d: "Mar 28", t: "Copilot ⌘J with streaming actions",   k: "AI" },
];

const CONCEPTS = [
  { k: "Commessa-first",      d: "Every hour, expense and headcount dollar is traceable to a project. It's how finance sees the company — now it's how your HR data sees it too." },
  { k: "One surface",         d: "Stop jumping between Deel for contracts, Rippling for payroll and a dozen Google Docs. One workspace, search from anywhere, ⌘K everywhere." },
  { k: "Workflows not forms", d: "Leave, expenses, onboarding — each is a structured workflow with owners, deadlines and automation, not a form that lands in a shared inbox." },
  { k: "Open by default",     d: "Export anything. Webhooks on every event. A public API with clear contracts. You'll never feel locked in." },
];

const TESTIMONIALS = [
  { who: "Aisha Patel",   role: "Head of People, Nova Retail",   body: "We replaced four tools with Pulse. Payroll that used to take a full week now closes in an afternoon — and the team actually enjoys onboarding." },
  { who: "Marcus Rivera", role: "COO, Blanco Studio",            body: "The commessa view is the killer feature. I finally know which client is profitable before the quarter ends, not after." },
  { who: "Yuki Tanaka",   role: "CFO, Zenith Energy",            body: "Auditors loved it. Every change is logged, every approval timestamped, every filing a click away." },
];

const FAQ = [
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

const TEAM = [
  { n: "Sarah Chen",      r: "CEO & Co-founder",        bio: "Ex-Stripe Atlas. Built payroll rails in 47 countries." },
  { n: "Marcus Rivera",   r: "Design lead",              bio: "Formerly Figma, Linear. Believes software should feel like a pencil." },
  { n: "Aisha Patel",     r: "Head of People",           bio: "12 years in HR ops. Turned onboarding into a weekend project." },
  { n: "Yuki Tanaka",     r: "VP Product",               bio: "Shipped finance tools at Brex before joining." },
  { n: "Lina Rossi",      r: "Head of Payroll",          bio: "Certified payroll specialist across 8 jurisdictions." },
  { n: "Noah Williams",   r: "Staff Engineer",           bio: "Distributed systems for payroll concurrency." },
];

const STATS = [
  { v: "$1.2B",    l: "Processed in payroll" },
  { v: "47",       l: "Countries supported" },
  { v: "4,800+",   l: "Teams on Pulse HR" },
  { v: "312k",     l: "Copilot actions run" },
];

const USE_CASES = [
  { k: "Agencies & consultancies", d: "Bill by commessa, track utilization, close books without spreadsheets." },
  { k: "Product startups",          d: "Onboard from a candidate-accepted email in one click. Equity, offers, laptops — on rails." },
  { k: "Scale-ups (50-500)",        d: "Multi-entity payroll, approval chains that match your org, reports your CFO will actually open." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#f2f2ee] selection:bg-[#b4ff39] selection:text-[#0b0b0d] overflow-x-hidden">
      <Nav />
      <Hero />
      <Marquee />
      <StatsBar />
      <Concepts />
      <Features />
      <LabsSection />
      <KeyboardCopilot />
      <ProductPreview />
      <RolesSection />
      <UseCases />
      <Testimonials />
      <Changelog />
      <TeamSection />
      <FaqSection />
      <Cta />
      <Footer />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-[#0b0b0d]/70 border-b border-white/5">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-8">
        <Link to="/landing" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-[#b4ff39] text-[#0b0b0d] flex items-center justify-center">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl">Pulse HR</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#labs" className="hover:text-white transition-colors inline-flex items-center gap-1">
            Labs<span className="h-1 w-1 rounded-full bg-[#b4ff39] pulse-dot" />
          </a>
          <a href="#product" className="hover:text-white transition-colors">Product</a>
          <a href="#changelog" className="hover:text-white transition-colors">Changelog</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/login" className="text-sm text-white/70 hover:text-white px-3 py-1.5 rounded-md transition-colors">Sign in</Link>
          <Link
            to="/signup"
            className="text-sm font-medium bg-[#b4ff39] text-[#0b0b0d] px-4 py-2 rounded-md hover:bg-[#c6ff5a] transition-colors press-scale"
          >
            Start free
          </Link>
          <button className="md:hidden h-9 w-9 grid place-items-center rounded-md border border-white/10" onClick={() => setOpen(o => !o)}>
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff22 1px, transparent 1px), linear-gradient(to bottom, #ffffff22 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, black 40%, transparent 100%)",
        }}
        aria-hidden
      />
      <div className="absolute top-40 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-[#b4ff39]/15 blur-[120px] pointer-events-none" aria-hidden />

      <div className="relative max-w-[1280px] mx-auto px-6 pt-24 pb-24 md:pt-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-white/70 mb-7">
          <span className="h-1.5 w-1.5 rounded-full bg-[#b4ff39] pulse-dot" />
          Now in public beta · 4,800+ teams
        </div>
        <h1 className="font-display text-[56px] md:text-[88px] leading-[0.95] tracking-tight">
          The people platform<br />
          you'll <em className="italic text-[#b4ff39]">actually</em> use<span className="text-[#b4ff39]">.</span>
        </h1>
        <p className="mt-6 max-w-xl text-white/70 text-lg leading-relaxed">
          Pulse HR unifies payroll, time, leave, recruiting, onboarding and documents
          behind a single workspace — <em className="italic">commessa-aware</em>, keyboard-first,
          fast enough you'll forget it's software.
        </p>
        <div className="mt-9 flex items-center gap-3 flex-wrap">
          <Link to="/signup" className="group inline-flex items-center gap-2 bg-[#b4ff39] text-[#0b0b0d] px-5 py-3 rounded-md font-medium press-scale hover:bg-[#c6ff5a] transition-colors">
            Start free — 5 employees
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] px-5 py-3 rounded-md font-medium press-scale transition-colors">
            <Play className="h-4 w-4 text-[#b4ff39]" />
            Tour the app
          </Link>
        </div>
        <div className="mt-12 flex items-center gap-6 text-xs text-white/50 flex-wrap">
          <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-[#b4ff39]" />SOC 2 Type II</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5 text-[#b4ff39]" />GDPR · EU data residency</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-[#b4ff39]" />99.99% uptime SLA</span>
        </div>

        <div className="mt-10 flex items-center gap-2 flex-wrap text-[11px] text-white/60">
          <span className="font-mono uppercase tracking-[0.2em] text-[#b4ff39]">New this quarter</span>
          {["Copilot ⌘J", "Commessa Forecast", "Saturation", "Team Pulse", "Kudos", "Focus Mode", "Growth"].map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 hover:border-[#b4ff39]/40 transition-colors"
            >
              <span className="h-1 w-1 rounded-full bg-[#b4ff39]" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const logos = ["ACME", "NOVA RETAIL", "BLANCO STUDIO", "ZENITH ENERGY", "LONGO GROUP", "FABRIQ", "POLLUX", "ORBITAL"];
  return (
    <div className="border-y border-white/5 py-6 overflow-hidden">
      <div className="flex gap-14 animate-[marquee_40s_linear_infinite] whitespace-nowrap text-white/30">
        {[...logos, ...logos, ...logos].map((l, i) => (
          <span key={i} className="font-display text-2xl tracking-[0.25em]">{l}</span>
        ))}
      </div>
      <style>{`@keyframes marquee { to { transform: translateX(-33.333%); } }`}</style>
    </div>
  );
}

function StatsBar() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map(s => (
          <div key={s.l} className="border-l-2 border-[#b4ff39]/40 pl-5 py-2">
            <div className="font-display text-5xl md:text-6xl">{s.v}</div>
            <div className="text-sm text-white/60 mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Concepts() {
  return (
    <section id="concepts" className="max-w-[1280px] mx-auto px-6 py-24">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-[0.25em] text-[#b4ff39] mb-4">How we think</div>
        <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-tight">
          Four concepts that make<br /><em className="italic">this</em> thing different.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 mt-16 border border-white/5 rounded-xl overflow-hidden">
        {CONCEPTS.map((c, i) => (
          <div key={c.k} className="bg-[#0b0b0d] p-10 hover:bg-[#111113] transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="font-mono text-xs text-white/40 tabular-nums">0{i + 1}</div>
              <div className="h-px flex-1 bg-white/10 group-hover:bg-[#b4ff39]/40 transition-colors" />
            </div>
            <h3 className="font-display text-3xl mb-3">{c.k}</h3>
            <p className="text-white/70 leading-relaxed">{c.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="max-w-[1280px] mx-auto px-6 py-24">
      <div className="flex items-end justify-between gap-8 mb-16 flex-wrap">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.25em] text-[#b4ff39] mb-4">Everything in one place</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-tight">
            Nine products that feel like one.
          </h2>
        </div>
        <p className="text-white/60 max-w-md text-sm leading-relaxed">
          Each module is deep enough to replace a standalone tool, but they share one profile, one search, one audit log. You'll stop switching tabs — we promise.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="group rounded-xl border border-white/8 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-[#b4ff39]/30 transition-all press-scale">
              <div className="h-10 w-10 rounded-md bg-[#b4ff39]/10 text-[#b4ff39] grid place-items-center mb-5 group-hover:bg-[#b4ff39] group-hover:text-[#0b0b0d] transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-2xl mb-2">{f.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{f.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProductPreview() {
  const [tab, setTab] = useState<"dashboard" | "time" | "payroll">("dashboard");
  const tabs = [
    { k: "dashboard" as const, l: "Dashboard",         body: "Approvals, alerts, presence and trends. The one pane your HR team opens at 9am." },
    { k: "time" as const,      l: "Time & commesse",    body: "Log hours against any commessa. Budget burn, per-client profitability, exports to CSV." },
    { k: "payroll" as const,   l: "Payroll",            body: "Preview payslips before running, split employees/contractors, file F24 with one click." },
  ];
  return (
    <section id="product" className="max-w-[1280px] mx-auto px-6 py-24">
      <div className="flex items-end justify-between gap-8 mb-10 flex-wrap">
        <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-tight max-w-xl">
          See it <em className="italic">moving</em>.
        </h2>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white border-b border-white/20 hover:border-[#b4ff39] pb-1 transition-colors">
          Open the full app <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              "px-4 py-2 rounded-full text-sm transition-colors press-scale",
              tab === t.k ? "bg-[#b4ff39] text-[#0b0b0d] font-medium" : "border border-white/10 text-white/70 hover:bg-white/5"
            )}
          >
            {t.l}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6 items-stretch">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-7">
          <div className="text-xs uppercase tracking-[0.25em] text-[#b4ff39] mb-3">{tabs.find(t => t.k === tab)!.l}</div>
          <p className="text-white/70 leading-relaxed">{tabs.find(t => t.k === tab)!.body}</p>
          <ul className="mt-6 space-y-2 text-sm">
            {["Approvals in one click", "Keyboard-first navigation (⌘K)", "Full audit trail", "Exports to CSV / PDF / API"].map(i => (
              <li key={i} className="flex items-center gap-2 text-white/70"><Check className="h-4 w-4 text-[#b4ff39]" />{i}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-3 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-40 -left-20 h-80 w-80 rounded-full bg-[#b4ff39]/20 blur-3xl pointer-events-none" aria-hidden />
          <MockUI variant={tab} />
        </div>
      </div>
    </section>
  );
}

function MockUI({ variant }: { variant: "dashboard" | "time" | "payroll" }) {
  return (
    <div className="relative rounded-lg bg-[#fafaf7] text-[#0b0b0d] overflow-hidden border border-black/10">
      <div className="h-8 px-3 flex items-center gap-1.5 border-b border-black/5 bg-white/50">
        <span className="h-2 w-2 rounded-full bg-red-400/70" />
        <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
        <span className="h-2 w-2 rounded-full bg-green-400/70" />
        <span className="ml-3 text-[11px] font-mono text-black/50">app.pulsehr.com{variant === "dashboard" ? "/" : `/${variant}`}</span>
      </div>
      <div className="p-5 space-y-3">
        {variant === "dashboard" && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[{l:"Pending",v:"4"},{l:"Headcount",v:"12"},{l:"Overtime",v:"42h"}].map(x => (
                <div key={x.l} className="rounded-md border border-black/10 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-black/50">{x.l}</div>
                  <div className="font-display text-2xl">{x.v}</div>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-black/10 divide-y divide-black/5">
              {[{n:"Marcus R.",t:"Vacation · 5d",s:"pending"},{n:"Tom B.",t:"Sick · 3d",s:"approved"},{n:"Noah W.",t:"Personal · 1d",s:"pending"}].map((r,i) => (
                <div key={i} className="px-3 py-2 flex items-center gap-2 text-[12px]">
                  <div className="h-6 w-6 rounded-full bg-black/10" />
                  <div className="flex-1"><div className="font-medium">{r.n}</div><div className="text-black/50 text-[11px]">{r.t}</div></div>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", r.s === "pending" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{r.s}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {variant === "time" && (
          <>
            <div className="rounded-md border border-black/10 p-4">
              <div className="text-[10px] uppercase tracking-wider text-black/50">Active clock</div>
              <div className="font-mono text-3xl tabular-nums mt-1">02:41:18</div>
              <div className="text-[11px] text-black/60 mt-1">ACM-2025-01 · Platform rebuild</div>
              <div className="mt-3 h-8 rounded-md bg-emerald-500 text-white text-[11px] font-medium grid place-items-center">Stop & log hours</div>
            </div>
            <div className="grid grid-cols-7 gap-1 h-20">
              {[0.6,0.8,0.9,1,0.85,0.2,0].map((h,i) => (
                <div key={i} className="rounded-sm bg-black/10 flex items-end">
                  <div className="w-full rounded-sm" style={{ height: `${h*100}%`, background: h ? "#b4ff39" : "transparent" }} />
                </div>
              ))}
            </div>
          </>
        )}
        {variant === "payroll" && (
          <>
            <div className="rounded-md border border-black/10 p-4 bg-emerald-50/50">
              <div className="text-[10px] uppercase tracking-wider text-black/50">Next run · April 2025</div>
              <div className="font-display text-3xl mt-1">$124,500</div>
              <div className="text-[11px] text-black/60 mt-1">12 employees · scheduled Apr 30</div>
            </div>
            <div className="rounded-md border border-black/10 divide-y divide-black/5 text-[12px]">
              {["F24 (Italy)","Form 941 (US)","HMRC PAYE (UK)"].map((t,i) => (
                <div key={t} className="px-3 py-2 flex items-center justify-between">
                  <span>{t}</span>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded", i === 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{i === 0 ? "pending" : "filed"}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UseCases() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-24">
      <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-tight max-w-3xl">
        Built for the way <em className="italic">your</em> team actually works.
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14">
        {USE_CASES.map((u, i) => (
          <div key={u.k} className="rounded-xl border border-white/10 bg-white/[0.02] p-7 hover:-translate-y-1 transition-transform">
            <div className="font-mono text-xs text-[#b4ff39] tabular-nums mb-4">→ 0{i + 1}</div>
            <h3 className="font-display text-2xl mb-2">{u.k}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{u.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={t.who}
            className={cn(
              "rounded-xl border border-white/10 p-7 bg-gradient-to-b",
              i === 1 ? "from-[#b4ff39]/10 to-transparent md:scale-[1.02]" : "from-white/[0.03] to-transparent"
            )}
          >
            <div className="flex gap-0.5 mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-[#b4ff39] text-[#b4ff39]" />)}
            </div>
            <blockquote className="font-display text-xl leading-snug">
              "{t.body}"
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/10 grid place-items-center text-sm">{t.who.split(" ").map(p => p[0]).join("")}</div>
              <div><div className="text-sm font-medium">{t.who}</div><div className="text-xs text-white/50">{t.role}</div></div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section id="team" className="max-w-[1280px] mx-auto px-6 py-24">
      <div className="flex items-end justify-between gap-8 flex-wrap mb-12">
        <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-tight max-w-xl">
          The people behind <em className="italic">Pulse</em>.
        </h2>
        <p className="text-sm text-white/60 max-w-sm">
          A team of 18 across six countries, half building, half in the field. We hire from the industries we serve — payroll, HR ops, design.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {TEAM.map((m, i) => (
          <div key={m.n} className="rounded-lg border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.05] transition-colors group">
            <div
              className="h-12 w-12 rounded-full grid place-items-center text-sm font-medium mb-4"
              style={{ backgroundColor: `hsl(${(i * 53) % 360}, 55%, 60%)` }}
            >
              {m.n.split(" ").map(p => p[0]).join("")}
            </div>
            <div className="text-sm font-medium">{m.n}</div>
            <div className="text-[11px] text-[#b4ff39] uppercase tracking-wider mt-0.5">{m.r}</div>
            <div className="text-xs text-white/50 mt-3 leading-relaxed">{m.bio}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="max-w-[1024px] mx-auto px-6 py-24">
      <div className="text-xs uppercase tracking-[0.25em] text-[#b4ff39] mb-4">Questions we get a lot</div>
      <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-tight mb-14">
        Questions, <em className="italic">answered</em>.
      </h2>
      <div className="divide-y divide-white/8 border-y border-white/8">
        {FAQ.map((f, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-6 py-6 text-left hover:bg-white/[0.02] transition-colors px-2"
            >
              <span className="font-display text-xl md:text-2xl">{f.q}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-[#b4ff39] shrink-0 transition-transform",
                  open === i && "rotate-180"
                )}
              />
            </button>
            {open === i && (
              <div className="pb-7 px-2 text-white/70 leading-relaxed max-w-3xl fade-in">{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function LabsSection() {
  return (
    <section id="labs" className="relative max-w-[1280px] mx-auto px-6 py-24">
      <div
        className="absolute inset-x-8 top-10 bottom-10 pointer-events-none rounded-3xl opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 20%, #b4ff3914 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, #c06bff12 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div className="relative flex items-end justify-between gap-8 flex-wrap mb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#b4ff39] mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b4ff39] pulse-dot" />
            Labs · shipping now
          </div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-tight">
            Five bets that landed.
          </h2>
        </div>
        <p className="text-white/60 max-w-md text-sm leading-relaxed">
          Labs is where we ship the experimental stuff. Every team on Pulse gets it by default — no waiting lists, no upsells, no "enterprise tier" paywall.
        </p>
      </div>
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {LABS.map((lab, i) => {
          const Icon = lab.icon;
          const wide = i === 0 || i === 3;
          return (
            <article
              key={lab.kind}
              className={cn(
                "group relative rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 hover:-translate-y-0.5 transition-transform overflow-hidden",
                wide && "lg:col-span-2",
              )}
            >
              <div
                className="absolute -top-20 -right-16 h-52 w-52 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-60 transition-opacity"
                style={{ background: "radial-gradient(circle, #b4ff3940 0%, transparent 70%)" }}
                aria-hidden
              />
              <div className="relative flex items-start gap-4">
                <div className="h-11 w-11 shrink-0 rounded-md border border-[#b4ff39]/30 bg-[#b4ff39]/[0.08] text-[#b4ff39] grid place-items-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.18em] uppercase">
                    <span className="text-[#b4ff39]">NEW</span>
                    <span className="text-white/30">·</span>
                    <span className="text-white/60">{lab.tag}</span>
                  </div>
                  <h3 className="font-display text-2xl mt-1">{lab.kind}</h3>
                  <p className="text-sm text-white/60 leading-relaxed mt-2">{lab.body}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function KeyboardCopilot() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[#b4ff39] mb-4 inline-flex items-center gap-2">
            <Keyboard className="h-3 w-3" /> Keyboard-first
          </div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-tight">
            Two keys.<br />
            <em className="italic text-[#b4ff39]">Everything</em>.
          </h2>
          <p className="text-white/70 mt-6 max-w-md leading-relaxed">
            <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/10 border border-white/15">⌘K</kbd> opens a fuzzy command palette — jump to any employee, project, document, setting.
            <br className="hidden md:inline" />
            <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/10 border border-white/15 mt-3 inline-block">⌘J</kbd> wakes Copilot — ask anything, approve anything, generate anything. Streamed answers, runnable actions.
          </p>
          <div className="mt-8 flex items-center gap-5 flex-wrap text-sm">
            <span className="inline-flex items-center gap-2 text-white/70">
              <Mic className="h-4 w-4 text-[#b4ff39]" />Dictate anywhere
            </span>
            <span className="inline-flex items-center gap-2 text-white/70">
              <Command className="h-4 w-4 text-[#b4ff39]" />40+ shortcuts
            </span>
            <span className="inline-flex items-center gap-2 text-white/70">
              <WifiOff className="h-4 w-4 text-[#b4ff39]" />Works offline
            </span>
          </div>
        </div>
        <div className="relative rounded-2xl border border-white/10 bg-[#0f0f11] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff22 1px, transparent 1px), linear-gradient(to bottom, #ffffff22 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden
          />
          <div className="relative p-6 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[11px] text-white/60">
              <Sparkles className="h-3 w-3 text-[#b4ff39]" /> Ask Pulse
              <kbd className="ml-2 font-mono text-[10px] px-1 py-0 rounded bg-white/10 border border-white/15">⌘J</kbd>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80">
              <span className="text-white/40">&gt;&nbsp;</span>Who's overallocated this sprint on Mobile onboarding?
            </div>
            <div className="rounded-lg border border-[#b4ff39]/25 bg-[#b4ff39]/[0.04] px-4 py-3 text-[13px] text-white/85 leading-relaxed space-y-2">
              <div className="font-mono text-[10px] text-[#b4ff39] uppercase tracking-wider">Answer · streamed in 420ms</div>
              <p>
                Two people are above 100% load on <span className="font-mono text-[#b4ff39]">NOV-2025-07</span>: Noah Williams (130%) and Yuki Tanaka (108%).
                The next bottleneck lands in W19 unless you reshuffle.
              </p>
              <div className="flex gap-2 pt-1 flex-wrap">
                {["Draft reshuffle", "Open Saturation", "Message Yuki"].map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-white/15 bg-white/[0.04] text-[11px] text-white/80 hover:border-[#b4ff39]/40 cursor-default">
                    <ArrowRight className="h-3 w-3 text-[#b4ff39]" />{a}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 text-[10px] text-white/35 pt-1">
              <span className="font-mono">scoped: your tenant · 12 employees</span>
              <span className="ml-auto font-mono">no training · no cross-tenant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-24">
      <div className="flex items-end justify-between gap-8 flex-wrap mb-14">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.25em] text-[#b4ff39] mb-4 inline-flex items-center gap-2">
            <Palette className="h-3 w-3" /> Every persona, one surface
          </div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-tight">
            The same app,<br />
            <em className="italic">five</em> points of view.
          </h2>
        </div>
        <p className="text-white/60 max-w-md text-sm leading-relaxed">
          Role themes aren't cosmetic. Each persona ships with its own palette, default view, and shortcut set. Engineers don't see payroll drafts. CFOs don't see sprint standups.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-px rounded-xl overflow-hidden border border-white/10 bg-white/5">
        {ROLES.map((r) => (
          <div
            key={r.k}
            className="relative p-6 min-h-[220px] flex flex-col overflow-hidden hover:-translate-y-0.5 transition-transform"
            style={{ backgroundColor: r.bg }}
          >
            <div
              className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl pointer-events-none opacity-60"
              style={{ backgroundColor: r.accent }}
              aria-hidden
            />
            <div
              className="h-8 w-8 rounded-md grid place-items-center mb-auto"
              style={{ backgroundColor: `${r.accent}22`, color: r.accent, border: `1px solid ${r.accent}66` }}
            >
              <span className="font-mono text-xs font-bold">{r.k[0]}</span>
            </div>
            <div className="relative mt-6">
              <div className="font-display text-xl">{r.k}</div>
              <div className="text-xs text-white/55 mt-1.5 leading-relaxed">{r.d}</div>
            </div>
            <div
              className="relative mt-4 h-1 rounded-full"
              style={{ backgroundColor: r.accent }}
              aria-hidden
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function Changelog() {
  return (
    <section id="changelog" className="max-w-[1280px] mx-auto px-6 py-24">
      <div className="flex items-end justify-between gap-8 flex-wrap mb-12">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.25em] text-[#b4ff39] mb-4">Shipped recently</div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.02] tracking-tight">
            A changelog<br />
            <em className="italic">worth reading</em>.
          </h2>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white border-b border-white/20 hover:border-[#b4ff39] pb-1 transition-colors"
        >
          Full changelog <ArrowRight className="h-4 w-4" />
        </a>
      </div>
      <ol className="relative border-l border-white/10 ml-3 space-y-5">
        {CHANGELOG.map((e) => (
          <li key={e.t} className="relative pl-8">
            <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-[#b4ff39] ring-4 ring-[#0b0b0d]" />
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-mono text-xs text-white/40 tabular-nums w-16">{e.d}</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#b4ff39] border border-[#b4ff39]/30 px-1.5 py-0.5 rounded-sm">
                {e.k}
              </span>
              <span className="font-display text-xl md:text-2xl">{e.t}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Cta() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-24">
      <div className="relative rounded-3xl border border-[#b4ff39]/30 bg-gradient-to-br from-[#b4ff39]/10 via-transparent to-transparent p-12 md:p-20 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#b4ff39]/20 blur-3xl pointer-events-none" aria-hidden />
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <h2 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">
            Your team deserves<br />
            <em className="italic text-[#b4ff39]">better software</em>.
          </h2>
          <p className="text-white/70 mt-6 max-w-lg">Free for the first 5 employees — forever. No credit card. Import your data in under an hour.</p>
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <Link to="/signup" className="inline-flex items-center gap-2 bg-[#b4ff39] text-[#0b0b0d] px-6 py-3 rounded-md font-medium press-scale hover:bg-[#c6ff5a]">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="mailto:sales@pulsehr.com" className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] px-6 py-3 rounded-md font-medium press-scale">
              Talk to sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 mt-12">
      <div className="max-w-[1280px] mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-md bg-[#b4ff39] text-[#0b0b0d] grid place-items-center"><Sparkles className="h-4 w-4" strokeWidth={2.5} /></div>
            <span className="font-display text-xl">Pulse HR</span>
          </div>
          <p className="text-sm text-white/50 max-w-xs">The people platform for modern teams. Made in Milan, Berlin and San Francisco.</p>
          <div className="flex gap-3 mt-5 text-white/50">
            <a href="#" className="hover:text-white transition-colors"><Twitter className="h-4 w-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin className="h-4 w-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Github className="h-4 w-4" /></a>
          </div>
        </div>
        {[
          { t: "Product",  l: ["Features","Product tour","Pricing","Changelog","Roadmap"] },
          { t: "Company",  l: ["About","Team","Customers","Careers","Contact"] },
          { t: "Resources",l: ["Docs","API reference","Guides","Help center","Community"] },
        ].map(c => (
          <div key={c.t}>
            <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">{c.t}</div>
            <ul className="space-y-2 text-sm text-white/70">
              {c.l.map(x => <li key={x}><a href="#" className="hover:text-white transition-colors">{x}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div>© {new Date().getFullYear()} Pulse HR · All rights reserved</div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Security</a>
            <a href="#" className="hover:text-white inline-flex items-center gap-1"><BookOpen className="h-3 w-3" />Docs</a>
            <a href="#" className="hover:text-white inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
