import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Sparkles, Clock, Users, Wallet, Briefcase, Shield, Plug, Zap,
  BarChart3, Globe2, Play, Check, ChevronDown, Star, Github, Twitter, Linkedin,
  BookOpen, MessageCircle,
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
  { v: "99.99%",   l: "Rolling uptime" },
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
      <ProductPreview />
      <UseCases />
      <Testimonials />
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
          <a href="#concepts" className="hover:text-white transition-colors">Concepts</a>
          <a href="#product" className="hover:text-white transition-colors">Product</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <a href="#team" className="hover:text-white transition-colors">Team</a>
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
            Six products that feel like one.
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
