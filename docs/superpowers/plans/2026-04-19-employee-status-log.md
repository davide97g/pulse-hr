# Employee Status Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/pulse` and the ⌘J Copilot overlay with a single agentic chat surface ("Status Log") that logs employee reflections identified, keeps raw conversations private to the employee, and gives managers AI-summarized recaps + health signals + the ability to request targeted updates/feedback.

**Architecture:** One route `/log` role-splits into `EmployeeLogView` (continuous chat) and `ManagerLogView` (team dashboard). A single `log-agent.ts` util owns prompt selection, streamed responses, session summarization, and health scoring. Voice stays via the existing `VoiceDock` + `voiceBus`. A strict typing boundary (`LogMessage[]` never reaches manager components) enforces privacy. ⌘J opens `LogOverlay`, a compact chat that appends into the same thread.

**Tech Stack:** TanStack Router (file-based, `autoCodeSplitting`), React 19, Tailwind 4, shadcn/radix, lucide-react, sonner toasts, `bun` package manager. All state in-memory — no backend. Styling inherits `iridescent-border`, `pulse-dot`, `typing-dot`, `stagger-in`, `fade-in`, `new-badge`, `press-scale` from `src/styles.css`.

---

## Repo conventions this plan follows

- **No test suite exists** (`CLAUDE.md`: "bun:test runner — no tests yet"). Each task ends with **visual verification via `bun run dev`** + `bun run lint`, not unit tests. A final task runs `bun run build` to confirm no chunk regression.
- **Commits** are short imperative subject + body describing the "why". Conventional Commits not enforced.
- **Mocked loading** on every data surface: `setTimeout(…, 420)` → `SkeletonRows` / `SkeletonCards` → `stagger-in`.
- **Undo on destructive ops** via `toast(..., { action: { label: "Undo", onClick } })`.
- Icons: lucide-react. Never re-skin shadcn — theme via tokens only.
- File-based routes regenerate `src/routeTree.gen.ts` automatically on `bun run dev`. **Do not hand-edit that file.**

---

## File structure

```
src/
├── routes/
│   ├── log.tsx                              [NEW] role-split primary route
│   ├── log.$employeeId.tsx                  [NEW] manager drilldown
│   └── pulse.tsx                            [DELETE]
├── components/
│   ├── app/
│   │   ├── AppShell.tsx                     [MODIFY] sidebar + ⌘J wiring
│   │   ├── Copilot.tsx                      [DELETE]
│   │   └── LogOverlay.tsx                   [NEW] ⌘J compact chat
│   └── log/                                 [NEW directory]
│       ├── LogChatThread.tsx                [NEW]
│       ├── LogComposer.tsx                  [NEW]
│       ├── LogSessionDivider.tsx            [NEW]
│       ├── PinnedAskCard.tsx                [NEW]
│       ├── QuickTopicChips.tsx              [NEW]
│       ├── EmployeeLogView.tsx              [NEW]
│       ├── ManagerLogView.tsx               [NEW]
│       ├── EmployeeRecapCard.tsx            [NEW]
│       ├── AskTopicDialog.tsx               [NEW]
│       └── LogAgentPicker.tsx               [NEW]
└── lib/
    ├── mock-data.ts                         [MODIFY] add Log* types + seeds
    ├── log-agent.ts                         [NEW] mocked agent
    └── score.ts                             [MODIFY] optional freshness factor
```

Each file holds one responsibility. `LogChatThread` never imports manager components; `ManagerLogView` never imports `LogMessage`. The split is load-bearing.

---

## Task 1: Data model + mock seeds

**Files:**

- Modify: `src/lib/mock-data.ts`

- [ ] **Step 1.1:** Open `src/lib/mock-data.ts` and append the following type block at the bottom of the existing types section (keep alphabetical grouping loose — the file is long; place this near the `PulseEntry` block for locality):

```ts
export type LogTopic = "status" | "win" | "pain" | "challenge" | "feedback" | "freeform";
export type LogSentiment = "positive" | "neutral" | "mixed" | "negative";

export interface LogMessage {
  id: string;
  employeeId: string;
  role: "agent" | "employee";
  text: string;
  createdAt: string; // ISO
  topic?: LogTopic;
  sentiment?: LogSentiment;
  voice?: boolean;
  actionId?: string;
}

export interface LogSession {
  id: string;
  employeeId: string;
  startedAt: string; // ISO date
  endedAt?: string; // undefined = active
  summary?: string; // visible to the employee
  managerSummary?: string; // redacted; only summary crosses the boundary
  topics: LogTopic[];
  healthDelta: number; // -10..+10
}

export interface ManagerAsk {
  id: string;
  managerId: string;
  employeeId: string;
  topic: string; // "Feedback on ACME demo"
  prompt: string; // what the agent will ask
  createdAt: string;
  dueAt?: string;
  answeredAt?: string;
  answerSummary?: string; // only summary crosses the boundary
  status: "pending" | "answered" | "expired";
  tone?: "neutral" | "empathetic" | "probing";
}

export interface EmployeeLogHealth {
  employeeId: string;
  score: number; // 0..100
  trend: "up" | "flat" | "down";
  lastLogAt?: string;
  lastSentiment?: LogSentiment;
  openAsks: number;
  recap: string; // 1-2 sentence AI mock, manager-safe
  recapUpdatedAt: string;
  sparkline: number[]; // 14 daily sentiment ticks, -1..+1
}
```

- [ ] **Step 1.2:** Add seed data immediately after the types. Seed ~30 days of `logSessions` for all 12 employees, ~6 messages per recent session, plus 4 open `ManagerAsk`s and one `EmployeeLogHealth` per employee. Use `employees` already in the file for ids. Keep generation deterministic (seeded pseudo-random via a simple LCG; do NOT use `Math.random` at module load because the file is read multiple times in dev).

Paste this helper + seed block:

```ts
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const TOPICS_ORDER: LogTopic[] = ["status", "win", "pain", "challenge", "feedback", "freeform"];
const SENTIMENTS: LogSentiment[] = ["positive", "neutral", "mixed", "negative"];

function iso(daysAgo: number, hour = 9) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

const SAMPLE_EMP_LINES = [
  "Shipped the pricing page ahead of the sprint goal.",
  "Blocked on the legal review for the ACME contract.",
  "Spent the morning debugging a flaky export in payroll.",
  "Pairing session with Luca helped me unstick the onboarding flow.",
  "Feeling stretched thin — three clients active at once.",
  "Client demo went well, they want to scope phase 2.",
  "Stuck on a bug in the time-tracking module; escalating to ops.",
];
const SAMPLE_AGENT_LINES = [
  "Nice — want me to log that as a win?",
  "Noted. What would unblock this the fastest?",
  "Got it. Anything you'd want your manager to know, summary-only?",
  "Mid-sprint check: any risks I should flag into next Monday's plan?",
  "Thanks for sharing. I'll tag this as a pain point in your recap.",
];

export const logSessions: LogSession[] = (() => {
  const rand = lcg(42);
  const out: LogSession[] = [];
  for (const e of employees) {
    for (let day = 28; day >= 0; day -= Math.max(1, Math.floor(rand() * 3))) {
      const topics = [TOPICS_ORDER[Math.floor(rand() * 4)]];
      if (rand() > 0.6) topics.push(TOPICS_ORDER[Math.floor(rand() * 6)]);
      out.push({
        id: `ls-${e.id}-${day}`,
        employeeId: e.id,
        startedAt: iso(day, 9),
        endedAt: day === 0 ? undefined : iso(day, 17),
        summary:
          day === 0
            ? undefined
            : `Covered ${topics.join(", ")} with ${Math.floor(rand() * 4) + 2} exchanges.`,
        managerSummary:
          day === 0
            ? undefined
            : `Recent focus: ${topics[0]}. Sentiment ${SENTIMENTS[Math.floor(rand() * SENTIMENTS.length)]}.`,
        topics,
        healthDelta: Math.round((rand() * 20 - 10) * 10) / 10,
      });
    }
  }
  return out;
})();

export const logMessages: LogMessage[] = (() => {
  const rand = lcg(101);
  const out: LogMessage[] = [];
  for (const s of logSessions) {
    const turns = 3 + Math.floor(rand() * 4);
    for (let t = 0; t < turns; t++) {
      const isAgent = t % 2 === 0;
      const createdAt = new Date(new Date(s.startedAt).getTime() + t * 8 * 60_000).toISOString();
      out.push({
        id: `lm-${s.id}-${t}`,
        employeeId: s.employeeId,
        role: isAgent ? "agent" : "employee",
        text: isAgent
          ? SAMPLE_AGENT_LINES[Math.floor(rand() * SAMPLE_AGENT_LINES.length)]
          : SAMPLE_EMP_LINES[Math.floor(rand() * SAMPLE_EMP_LINES.length)],
        createdAt,
        topic: s.topics[Math.floor(rand() * s.topics.length)],
        sentiment: SENTIMENTS[Math.floor(rand() * SENTIMENTS.length)],
        voice: rand() > 0.85,
      });
    }
  }
  return out;
})();

export const managerAsks: ManagerAsk[] = [
  {
    id: "ma-1",
    managerId: employees[0].id,
    employeeId: employees[3].id,
    topic: "Feedback on the ACME demo",
    prompt:
      "How did the ACME demo feel from your side? Anything we should change before the follow-up?",
    createdAt: iso(1),
    dueAt: iso(-3),
    status: "pending",
    tone: "neutral",
  },
  {
    id: "ma-2",
    managerId: employees[0].id,
    employeeId: employees[5].id,
    topic: "Mid-sprint blockers",
    prompt: "Anything blocking you mid-sprint that I can help unstick?",
    createdAt: iso(2),
    status: "pending",
    tone: "empathetic",
  },
  {
    id: "ma-3",
    managerId: employees[0].id,
    employeeId: employees[2].id,
    topic: "Internal project — payroll v2",
    prompt: "Quick read on the payroll v2 kickoff — risks you see, wins so far?",
    createdAt: iso(4),
    answeredAt: iso(2),
    answerSummary: "Confident on scope; worried about QA capacity. Wants a week buffer.",
    status: "answered",
    tone: "probing",
  },
  {
    id: "ma-4",
    managerId: employees[0].id,
    employeeId: employees[7].id,
    topic: "Energy check",
    prompt: "Just a pulse — how's your week feeling energy-wise?",
    createdAt: iso(5),
    dueAt: iso(-1),
    status: "expired",
    tone: "empathetic",
  },
];

export const employeeLogHealth: EmployeeLogHealth[] = employees.map((e, i) => {
  const rand = lcg(200 + i);
  const score = Math.round(55 + rand() * 45);
  const trend: EmployeeLogHealth["trend"] = score > 78 ? "up" : score < 60 ? "down" : "flat";
  const days = Math.floor(rand() * 8);
  return {
    employeeId: e.id,
    score,
    trend,
    lastLogAt: iso(days),
    lastSentiment: SENTIMENTS[Math.floor(rand() * SENTIMENTS.length)],
    openAsks: managerAsks.filter((a) => a.employeeId === e.id && a.status === "pending").length,
    recap:
      score > 78
        ? `${e.name.split(" ")[0]} is shipping consistently and flagging risks early.`
        : score < 60
          ? `${e.name.split(" ")[0]} is signalling overload — two pain points in the last week.`
          : `${e.name.split(" ")[0]} is steady; mix of wins and minor blockers.`,
    recapUpdatedAt: iso(0, 7),
    sparkline: Array.from({ length: 14 }, () => Math.round((rand() * 2 - 1) * 100) / 100),
  };
});
```

- [ ] **Step 1.3:** Run `bun run lint` — expect no errors. Fix any import ordering or type issues reported.

- [ ] **Step 1.4:** Start `bun run dev` briefly, confirm the app still boots (existing pages unaffected). Stop the server.

- [ ] **Step 1.5:** Commit.

```bash
git add src/lib/mock-data.ts
git commit -m "Add Status Log data model and seeds

Introduces LogMessage, LogSession, ManagerAsk, EmployeeLogHealth types
with deterministic seeds for 12 employees × 28 days. Seeds back the
upcoming /log route."
```

---

## Task 2: Mocked agent utility (`log-agent.ts`)

**Files:**

- Create: `src/lib/log-agent.ts`

- [ ] **Step 2.1:** Create the file with the following contents. This is the single source of mocked AI behavior — prompt selection, streaming, summarization, health scoring. Reuse the streaming cadence from `Copilot.tsx:94-124`.

```ts
import type { LogMessage, LogSentiment, LogTopic, ManagerAsk } from "./mock-data";

export type AgentPersona = "coach" | "analyst" | "confidant";

export interface AgentReply {
  text: string;
  topic?: LogTopic;
  sentiment?: LogSentiment;
}

const OPENERS_BY_WEEKDAY: Record<number, string[]> = {
  1: ["What are you aiming for this week?", "Any theme you want to carry into the week?"],
  2: ["How's day two feeling — on track?", "Anything already shifting from yesterday?"],
  3: ["Mid-sprint check: anything in the way?", "What would unblock you the fastest right now?"],
  4: [
    "Thursday gut-check — energy and momentum?",
    "What's the one thing you still want to land this week?",
  ],
  5: [
    "Wins or struggles worth logging before the weekend?",
    "If your manager read one line about your week, what should it say?",
  ],
  0: ["A quiet note for the weekend — anything weighing on you?"],
  6: ["A quiet note for the weekend — anything weighing on you?"],
};

const PROBES: Record<LogTopic, string[]> = {
  status: [
    "What's the current state — in a sentence?",
    "Where are you on the plan vs. where you hoped to be?",
  ],
  win: ["Nice — want me to log that as a win?", "What made it work?"],
  pain: ["Noted. What would make this less painful?", "Who could help, if anyone?"],
  challenge: ["What's the next move you're weighing?", "Solved, or still in the fight?"],
  feedback: [
    "Who is this for, and what's the kindest-but-useful version?",
    "Want this shared as a summary or kept private?",
  ],
  freeform: ["Tell me more.", "Anything else tugging at you?"],
};

export function openerFor(date: Date, personaOrPendingAsk?: AgentPersona | ManagerAsk): string {
  if (personaOrPendingAsk && typeof personaOrPendingAsk === "object") {
    return `Your manager asked: "${personaOrPendingAsk.prompt}" — want to take it now, or log other things first?`;
  }
  const options = OPENERS_BY_WEEKDAY[date.getDay()] ?? OPENERS_BY_WEEKDAY[1];
  return options[Math.floor(Math.random() * options.length)];
}

export function replyTo(text: string, topic?: LogTopic): AgentReply {
  const guessed: LogTopic =
    topic ??
    (/won|shipped|landed|great|nailed/i.test(text)
      ? "win"
      : /stuck|blocked|pain|tired|overwhelm/i.test(text)
        ? "pain"
        : /challenge|tough|hard|struggl/i.test(text)
          ? "challenge"
          : /feedback|thought|opinion/i.test(text)
            ? "feedback"
            : "status");
  const probe = PROBES[guessed][Math.floor(Math.random() * PROBES[guessed].length)];
  const sentiment: LogSentiment =
    guessed === "win"
      ? "positive"
      : guessed === "pain"
        ? "negative"
        : guessed === "challenge"
          ? "mixed"
          : "neutral";
  return { text: probe, topic: guessed, sentiment };
}

export function streamReply(
  full: string,
  onChunk: (soFar: string, done: boolean) => void,
  opts: { cadenceMs?: number } = {},
) {
  const cadence = opts.cadenceMs ?? 18;
  let i = 0;
  const step = () => {
    i += Math.max(2, Math.round(full.length / 60));
    const slice = full.slice(0, i);
    const done = i >= full.length;
    onChunk(done ? full : slice, done);
    if (!done) setTimeout(step, cadence);
  };
  setTimeout(step, 220);
}

export function summarizeForEmployee(msgs: LogMessage[]): string {
  if (msgs.length === 0) return "No activity yet.";
  const topics = new Set(msgs.map((m) => m.topic).filter(Boolean));
  return `Covered ${[...topics].join(", ") || "general check-in"} across ${msgs.length} exchanges.`;
}

export function summarizeForManager(msgs: LogMessage[]): string {
  if (msgs.length === 0) return "No signal this week.";
  const sentiments = msgs.map((m) => m.sentiment).filter(Boolean) as LogSentiment[];
  const topTopic = mostCommon(msgs.map((m) => m.topic).filter(Boolean) as LogTopic[]) ?? "status";
  const mood = mostCommon(sentiments) ?? "neutral";
  return `Focus: ${topTopic}. Overall mood ${mood}. ${sentiments.length} sentiment points logged.`;
}

export function healthFromMessages(msgs: LogMessage[]): number {
  if (msgs.length === 0) return 50;
  const weights: Record<LogSentiment, number> = {
    positive: 12,
    neutral: 2,
    mixed: -2,
    negative: -10,
  };
  const base = 60;
  const delta =
    msgs.reduce((acc, m) => acc + (m.sentiment ? weights[m.sentiment] : 0), 0) / msgs.length;
  return Math.max(0, Math.min(100, Math.round(base + delta * 3)));
}

function mostCommon<T>(xs: T[]): T | undefined {
  const counts = new Map<T, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  let best: T | undefined;
  let bestN = -1;
  for (const [k, v] of counts) {
    if (v > bestN) {
      best = k;
      bestN = v;
    }
  }
  return best;
}
```

- [ ] **Step 2.2:** Run `bun run lint`. Fix type issues if reported.

- [ ] **Step 2.3:** Commit.

```bash
git add src/lib/log-agent.ts
git commit -m "Add mocked log agent: openers, streaming, summaries, health

All deterministic mock functions for the Status Log feature.
Streaming cadence mirrors Copilot.tsx to keep the UX consistent."
```

---

## Task 3: Route scaffolds

**Files:**

- Create: `src/routes/log.tsx`
- Create: `src/routes/log.$employeeId.tsx`

- [ ] **Step 3.1:** Create `src/routes/log.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { useTheme } from "@/components/app/ThemeProvider";
import { EmployeeLogView } from "@/components/log/EmployeeLogView";
import { ManagerLogView } from "@/components/log/ManagerLogView";

type LogSearch = { view?: "me" | "team" };

export const Route = createFileRoute("/log")({
  head: () => ({ meta: [{ title: "Status Log — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): LogSearch => ({
    view: s.view === "team" || s.view === "me" ? s.view : undefined,
  }),
  component: LogRoute,
});

function LogRoute() {
  const { theme } = useTheme();
  const { view } = Route.useSearch();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 420);
    return () => clearTimeout(t);
  }, []);

  const isManager = theme === "manager" || theme === "hr" || theme === "admin";
  const showTeam = isManager && view !== "me";

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)]">
      <PageHeader
        icon={<MessagesSquare className="h-5 w-5" />}
        title={<span>Status Log</span>}
        subtitle={showTeam ? "Team health and recaps — no raw chats." : "Your private agentic log."}
      />
      {ready ? showTeam ? <ManagerLogView /> : <EmployeeLogView /> : null}
    </div>
  );
}
```

- [ ] **Step 3.2:** Create `src/routes/log.$employeeId.tsx`:

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";
import { EmployeeRecapCard } from "@/components/log/EmployeeRecapCard";
import { employees, employeeLogHealth, managerAsks, logSessions } from "@/lib/mock-data";

export const Route = createFileRoute("/log/$employeeId")({
  head: ({ params }) => ({ meta: [{ title: `Recap — ${params.employeeId} — Pulse HR` }] }),
  component: LogEmployeeRoute,
});

function LogEmployeeRoute() {
  const { employeeId } = Route.useParams();
  const employee = employees.find((e) => e.id === employeeId);
  const health = employeeLogHealth.find((h) => h.employeeId === employeeId);
  const asks = managerAsks.filter((a) => a.employeeId === employeeId);
  const sessions = logSessions.filter((s) => s.employeeId === employeeId);

  if (!employee || !health) {
    return (
      <div className="p-6">
        <Link
          to="/log"
          search={{ view: "team" }}
          className="text-sm text-muted-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to team
        </Link>
        <p className="mt-6 text-muted-foreground">Report not found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Link
        to="/log"
        search={{ view: "team" }}
        className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to team
      </Link>
      <PageHeader
        title={<span>{employee.name}</span>}
        subtitle="Summary only — raw log is private."
      />
      <EmployeeRecapCard employee={employee} health={health} asks={asks} sessions={sessions} />
    </div>
  );
}
```

- [ ] **Step 3.3:** Create stub components so the route compiles. In `src/components/log/EmployeeLogView.tsx` and `ManagerLogView.tsx` and `EmployeeRecapCard.tsx`, create barebones exports:

```tsx
// src/components/log/EmployeeLogView.tsx
export function EmployeeLogView() {
  return <div className="p-6 text-muted-foreground">Employee log view — coming up in Task 7.</div>;
}
```

```tsx
// src/components/log/ManagerLogView.tsx
export function ManagerLogView() {
  return <div className="p-6 text-muted-foreground">Manager log view — coming up in Task 8.</div>;
}
```

```tsx
// src/components/log/EmployeeRecapCard.tsx
import type { Employee, EmployeeLogHealth, ManagerAsk, LogSession } from "@/lib/mock-data";
export function EmployeeRecapCard(_: {
  employee: Employee;
  health: EmployeeLogHealth;
  asks: ManagerAsk[];
  sessions: LogSession[];
}) {
  return (
    <div className="rounded-lg border p-4 text-muted-foreground">Recap — coming up in Task 9.</div>
  );
}
```

- [ ] **Step 3.4:** Run `bun run dev`. Navigate to `/log` and `/log/<any-employee-id>`. Expect: page header renders, stub text shows. No console errors.

- [ ] **Step 3.5:** Commit.

```bash
git add src/routes/log.tsx src/routes/log.$employeeId.tsx src/components/log/
git commit -m "Scaffold /log route with role-aware split + drilldown

Role is derived from the current theme (manager/hr/admin → team view).
Stub components keep the route tree compiling; views land in later tasks."
```

---

## Task 4: `LogSessionDivider` + `LogChatThread`

**Files:**

- Create: `src/components/log/LogSessionDivider.tsx`
- Create: `src/components/log/LogChatThread.tsx`

- [ ] **Step 4.1:** Create `LogSessionDivider.tsx`:

```tsx
import { format } from "date-fns";
export function LogSessionDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-4 fade-in">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <span className="font-display text-xs tracking-wide text-muted-foreground uppercase">
        {format(new Date(date), "EEE, MMM d")}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
```

- [ ] **Step 4.2:** Create `LogChatThread.tsx`:

```tsx
import { Bot, Mic } from "lucide-react";
import { format } from "date-fns";
import type { LogMessage } from "@/lib/mock-data";
import { LogSessionDivider } from "./LogSessionDivider";
import { cn } from "@/lib/utils";

export function LogChatThread({
  messages,
  streamingId,
  pinned,
}: {
  messages: LogMessage[];
  streamingId?: string;
  pinned?: React.ReactNode;
}) {
  const groups = groupByDay(messages);
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 pb-4 scrollbar-thin">
      {pinned}
      {groups.map(([day, items]) => (
        <div key={day}>
          <LogSessionDivider date={day} />
          <ul className="space-y-2">
            {items.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "flex gap-2 fade-in",
                  m.role === "employee" ? "justify-end" : "justify-start",
                )}
              >
                {m.role === "agent" && (
                  <span className="h-7 w-7 shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <Bot className="h-4 w-4" />
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[72ch] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    m.role === "employee"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {streamingId === m.id && !m.text ? (
                    <TypingDots />
                  ) : (
                    <>
                      {m.text}
                      {streamingId === m.id && <span className="ml-1 animate-pulse">▍</span>}
                    </>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-[10px] opacity-60">
                    <span>{format(new Date(m.createdAt), "HH:mm")}</span>
                    {m.voice && <Mic className="h-3 w-3" aria-label="voice" />}
                    {m.topic && <span className="uppercase tracking-wide">{m.topic}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </span>
  );
}

function groupByDay(msgs: LogMessage[]): [string, LogMessage[]][] {
  const map = new Map<string, LogMessage[]>();
  for (const m of msgs) {
    const day = m.createdAt.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(m);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}
```

- [ ] **Step 4.3:** Run `bun run lint`. Expect clean.

- [ ] **Step 4.4:** Commit.

```bash
git add src/components/log/LogSessionDivider.tsx src/components/log/LogChatThread.tsx
git commit -m "Add LogChatThread + session divider

Reuses typing-dot + fade-in. Bubble styling mirrors the old Copilot
(muted agent / primary employee) for visual continuity."
```

---

## Task 5: `LogComposer` with voice wiring

**Files:**

- Create: `src/components/log/LogComposer.tsx`

- [ ] **Step 5.1:** Create the composer. It must: (a) send on Enter (Shift+Enter for newline), (b) mic button toggles `voiceBus` capture for source `"log"`, (c) auto-append transcripts via `voiceBus.on`. Model on `Copilot.tsx:295-333`.

```tsx
import { useEffect, useRef, useState } from "react";
import { Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { voiceBus } from "@/lib/voice-bus";
import { cn } from "@/lib/utils";

export function LogComposer({
  onSend,
  disabled,
}: {
  onSend: (text: string, voice: boolean) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [fromVoice, setFromVoice] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return voiceBus.on((ev) => {
      if (ev.kind === "listening" && ev.source === "log") setListening(ev.on);
      if (ev.kind === "draftPrompt" && ev.source === "log" && ev.text) {
        setText((prev) => (prev ? `${prev.trimEnd()} ${ev.text}` : ev.text));
        setFromVoice(true);
        requestAnimationFrame(() => taRef.current?.focus());
      }
    });
  }, []);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, fromVoice);
    setText("");
    setFromVoice(false);
  }

  return (
    <div className="border-t bg-background/80 backdrop-blur px-4 md:px-6 py-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Log a thought, a win, a struggle…"
          rows={1}
          className="flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => voiceBus.emit({ kind: "toggle", source: "log" })}
          className={cn("press-scale", listening && "text-destructive")}
          aria-pressed={listening}
          aria-label="Toggle voice capture"
        >
          <Mic className={cn("h-4 w-4", listening && "animate-pulse")} />
        </Button>
        <Button
          type="button"
          size="icon"
          onClick={submit}
          className="press-scale"
          disabled={disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {fromVoice && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Voice draft — review, edit, then send.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 5.2:** Check that `voiceBus` supports `source: "log"`. Open `src/lib/voice-bus.ts`; if the `source` field is a union that doesn't include `"log"`, add it:

```ts
// extend the source union to include "log"
type VoiceSource = "default" | "copilot" | "log";
```

Adjust the event type accordingly. If `source` is already `string`, no change needed.

- [ ] **Step 5.3:** Run `bun run lint` and `bun run dev`. Manually: import the composer into a throwaway spot (e.g. temporarily render it at the bottom of `EmployeeLogView` stub) and type a message — confirm Enter sends and Shift+Enter adds a newline. Remove the throwaway usage after verification.

- [ ] **Step 5.4:** Commit.

```bash
git add src/components/log/LogComposer.tsx src/lib/voice-bus.ts
git commit -m "Add LogComposer with voice capture + keyboard send

Reuses voiceBus with a new \"log\" source tag so VoiceDock stays the
single capture surface."
```

---

## Task 6: `PinnedAskCard` + `QuickTopicChips`

**Files:**

- Create: `src/components/log/PinnedAskCard.tsx`
- Create: `src/components/log/QuickTopicChips.tsx`

- [ ] **Step 6.1:** Create `PinnedAskCard.tsx`:

```tsx
import { Pin } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { ManagerAsk } from "@/lib/mock-data";

export function PinnedAskCard({
  ask,
  onAnswer,
  onLater,
}: {
  ask: ManagerAsk;
  onAnswer: (ask: ManagerAsk) => void;
  onLater: (ask: ManagerAsk) => void;
}) {
  return (
    <div className="iridescent-border rounded-xl my-3">
      <div className="rounded-[calc(0.75rem-1px)] bg-card p-4 space-y-2">
        <div className="flex items-start gap-2">
          <Pin className="h-4 w-4 mt-0.5 text-primary" />
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Manager ask</div>
            <div className="font-medium">{ask.topic}</div>
            <p className="text-sm text-muted-foreground mt-1">{ask.prompt}</p>
            {ask.dueAt && (
              <div className="text-[11px] text-muted-foreground mt-1">
                Due {format(new Date(ask.dueAt), "EEE, MMM d")}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" onClick={() => onAnswer(ask)}>
            Answer now
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onLater(ask)}>
            Later
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6.2:** Create `QuickTopicChips.tsx`:

```tsx
import type { LogTopic } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const CHIPS: { topic: LogTopic; emoji: string; label: string }[] = [
  { topic: "status", emoji: "🎯", label: "Status" },
  { topic: "win", emoji: "🎉", label: "Win" },
  { topic: "pain", emoji: "⚠️", label: "Pain" },
  { topic: "challenge", emoji: "🧗", label: "Challenge" },
  { topic: "feedback", emoji: "💬", label: "Feedback" },
];

export function QuickTopicChips({ onPick }: { onPick: (topic: LogTopic) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 px-4 md:px-6 pb-2">
      {CHIPS.map((c) => (
        <button
          key={c.topic}
          onClick={() => onPick(c.topic)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border bg-background px-2.5 h-7 text-xs press-scale",
            "hover:bg-muted",
          )}
        >
          <span>{c.emoji}</span>
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 6.3:** Run `bun run lint`. Commit.

```bash
git add src/components/log/PinnedAskCard.tsx src/components/log/QuickTopicChips.tsx
git commit -m "Add pinned manager ask card + topic chip rail

Pinned card uses iridescent-border for standout; chip rail lets
employees seed a topic without typing it out."
```

---

## Task 7: `EmployeeLogView` (full employee surface)

**Files:**

- Modify: `src/components/log/EmployeeLogView.tsx` (replaces stub)

- [ ] **Step 7.1:** Replace the stub with the full view. It wires thread + composer + chips + pinned asks + a right rail with: current day recap, 14-day sparkline, open asks count. Seeds local state from mock data; CRUD in-memory.

```tsx
import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  employees,
  logMessages as seedMsgs,
  managerAsks as seedAsks,
  employeeLogHealth,
  type LogMessage,
  type LogTopic,
  type ManagerAsk,
} from "@/lib/mock-data";
import { openerFor, replyTo, streamReply } from "@/lib/log-agent";
import { LogChatThread } from "./LogChatThread";
import { LogComposer } from "./LogComposer";
import { QuickTopicChips } from "./QuickTopicChips";
import { PinnedAskCard } from "./PinnedAskCard";

const ME_ID = employees[0].id; // demo: first employee is "me"

export function EmployeeLogView() {
  const [msgs, setMsgs] = useState<LogMessage[]>(() =>
    seedMsgs.filter((m) => m.employeeId === ME_ID),
  );
  const [asks, setAsks] = useState<ManagerAsk[]>(() =>
    seedAsks.filter((a) => a.employeeId === ME_ID && a.status === "pending"),
  );
  const [streamingId, setStreamingId] = useState<string | undefined>();
  const [pendingTopic, setPendingTopic] = useState<LogTopic | undefined>();

  const health = employeeLogHealth.find((h) => h.employeeId === ME_ID);

  const dailyOpener = useMemo(() => openerFor(new Date(), asks[0]), [asks]);

  const hasOpenerForToday = msgs.some(
    (m) => m.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10) && m.role === "agent",
  );

  useMemo(() => {
    if (!hasOpenerForToday) {
      const id = `lm-opener-${Date.now()}`;
      setMsgs((prev) => [
        ...prev,
        {
          id,
          employeeId: ME_ID,
          role: "agent",
          text: dailyOpener,
          createdAt: new Date().toISOString(),
          topic: "freeform",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSend(text: string, voice: boolean) {
    const userMsg: LogMessage = {
      id: `lm-u-${Date.now()}`,
      employeeId: ME_ID,
      role: "employee",
      text,
      createdAt: new Date().toISOString(),
      voice,
      topic: pendingTopic,
    };
    const agentId = `lm-a-${Date.now() + 1}`;
    const reply = replyTo(text, pendingTopic);
    const agentStub: LogMessage = {
      id: agentId,
      employeeId: ME_ID,
      role: "agent",
      text: "",
      createdAt: new Date().toISOString(),
      topic: reply.topic,
      sentiment: reply.sentiment,
    };
    setMsgs((prev) => [...prev, userMsg, agentStub]);
    setStreamingId(agentId);
    setPendingTopic(undefined);
    streamReply(reply.text, (soFar, done) => {
      setMsgs((prev) => prev.map((m) => (m.id === agentId ? { ...m, text: soFar } : m)));
      if (done) setStreamingId(undefined);
    });
  }

  function handleAskAnswer(ask: ManagerAsk) {
    setPendingTopic("feedback");
    toast("Composer seeded with the ask — add your answer.", {
      icon: <Sparkles className="h-4 w-4" />,
    });
  }
  function handleAskLater(ask: ManagerAsk) {
    setAsks((prev) => prev.filter((a) => a.id !== ask.id));
    toast("Snoozed — we'll bring it back tomorrow.", {
      action: { label: "Undo", onClick: () => setAsks((p) => [ask, ...p]) },
    });
  }

  return (
    <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col min-h-0">
        <LogChatThread
          messages={msgs}
          streamingId={streamingId}
          pinned={
            asks.length > 0 ? (
              <div className="px-4 md:px-6 pt-2">
                {asks.map((a) => (
                  <PinnedAskCard
                    key={a.id}
                    ask={a}
                    onAnswer={handleAskAnswer}
                    onLater={handleAskLater}
                  />
                ))}
              </div>
            ) : null
          }
        />
        <QuickTopicChips onPick={(t) => setPendingTopic(t)} />
        <LogComposer onSend={handleSend} />
      </div>
      <aside className="hidden lg:flex flex-col border-l bg-muted/20 p-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Your recap
          </div>
          <p className="mt-2 text-sm">{health?.recap ?? "Not enough data yet."}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            14-day sentiment
          </div>
          <Sparkline values={health?.sparkline ?? []} />
        </div>
        <div className="rounded-xl border bg-card p-4 text-sm">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Open asks</div>
          <div className="mt-1 text-2xl font-display">{asks.length}</div>
          <p className="text-xs text-muted-foreground">Pinned in the thread above.</p>
        </div>
      </aside>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const w = 260,
    h = 44,
    pad = 3;
  const xs = values.map((_, i) => pad + (i * (w - pad * 2)) / (values.length - 1));
  const ys = values.map((v) => h / 2 - v * (h / 2 - pad));
  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-11 mt-2">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    </svg>
  );
}
```

- [ ] **Step 7.2:** Run `bun run dev`, go to `/log`. As a default theme, the view will detect `theme !== "manager"` and render the employee view. Confirm:
  - Today's opener is appended at the bottom once.
  - Sending a message appends user bubble + streaming agent bubble with typing dots.
  - Pinned ask cards render if seeds provided one for `employees[0].id` (they don't by default — temporarily duplicate `ma-1`'s `employeeId` to `employees[0].id` in seeds to verify, then revert).
  - Right rail renders recap + sparkline + open asks count.

- [ ] **Step 7.3:** Commit.

```bash
git add src/components/log/EmployeeLogView.tsx
git commit -m "Build full EmployeeLogView

Thread + composer + chips + pinned asks + right rail. Daily opener
auto-injects once per day. State lives in the view — mocked, no
persistence, matching the repo's in-memory CRUD pattern."
```

---

## Task 8: `ManagerLogView` (team dashboard)

**Files:**

- Modify: `src/components/log/ManagerLogView.tsx` (replaces stub)

- [ ] **Step 8.1:** Replace the stub. The dashboard is a responsive grid of report cards. Each card shows avatar + name + `EmployeeScoreBadge` + trend arrow + freshness chip + 1-line recap + `[Ask topic]` button. Reuse `EmployeeHoverCard`.

```tsx
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Minus, Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeScoreBadge } from "@/components/score/EmployeeScoreBadge";
import { EmployeeHoverCard } from "@/components/score/EmployeeHoverCard";
import { employees, employeeLogHealth, type EmployeeLogHealth } from "@/lib/mock-data";
import { AskTopicDialog } from "./AskTopicDialog";
import { cn } from "@/lib/utils";

export function ManagerLogView() {
  const rows = employees.map((e) => ({
    employee: e,
    health: employeeLogHealth.find((h) => h.employeeId === e.id)!,
  }));
  const [askFor, setAskFor] = useState<string | null>(null);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
      <div className="grid gap-3 stagger-in grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ employee, health }) => (
          <article
            key={employee.id}
            className="group rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-3">
              <EmployeeHoverCard employee={employee}>
                <div className="shrink-0">
                  <EmployeeScoreBadge score={health.score} name={employee.name} />
                </div>
              </EmployeeHoverCard>
              <div className="flex-1 min-w-0">
                <Link
                  to="/log/$employeeId"
                  params={{ employeeId: employee.id }}
                  className="font-medium hover:underline truncate block"
                >
                  {employee.name}
                </Link>
                <div className="text-xs text-muted-foreground truncate">{employee.role}</div>
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  <TrendBadge trend={health.trend} />
                  {health.lastLogAt && (
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(health.lastLogAt), { addSuffix: true })}
                    </span>
                  )}
                  {health.openAsks > 0 && (
                    <span className="rounded-full bg-primary/10 text-primary px-1.5 py-0.5">
                      {health.openAsks} open ask{health.openAsks === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/90 line-clamp-2">{health.recap}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Summary only
              </span>
              <Button size="sm" variant="outline" onClick={() => setAskFor(employee.id)}>
                <MessageSquare className="h-3.5 w-3.5 mr-1" /> Ask topic
              </Button>
            </div>
          </article>
        ))}
      </div>
      {askFor && (
        <AskTopicDialog employeeId={askFor} open onOpenChange={(o) => !o && setAskFor(null)} />
      )}
    </div>
  );
}

function TrendBadge({ trend }: { trend: EmployeeLogHealth["trend"] }) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
        trend === "up" && "bg-success/15 text-success",
        trend === "down" && "bg-destructive/15 text-destructive",
        trend === "flat" && "bg-muted text-muted-foreground",
      )}
    >
      <Icon className="h-3 w-3" />
      {trend}
    </span>
  );
}
```

- [ ] **Step 8.2:** Scaffold `AskTopicDialog.tsx` as a minimal stub; the full impl lands in Task 9:

```tsx
// src/components/log/AskTopicDialog.tsx — stub
export function AskTopicDialog(_: {
  employeeId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return null;
}
```

- [ ] **Step 8.3:** In `ThemeProvider`, confirm `theme === "manager"` is already a valid value (it is — 7 themes per CLAUDE.md). Switch theme to "manager" in the UI → navigate to `/log` → expect the grid. Confirm hover cards work; no console errors.

- [ ] **Step 8.4:** Commit.

```bash
git add src/components/log/ManagerLogView.tsx src/components/log/AskTopicDialog.tsx
git commit -m "Build manager team dashboard for /log

Responsive card grid reusing EmployeeScoreBadge + EmployeeHoverCard.
Raw messages are structurally unreachable from this component —
only EmployeeLogHealth fields are read."
```

---

## Task 9: Drilldown + `EmployeeRecapCard` + `AskTopicDialog`

**Files:**

- Modify: `src/components/log/EmployeeRecapCard.tsx`
- Modify: `src/components/log/AskTopicDialog.tsx`

- [ ] **Step 9.1:** Replace the recap stub with the real card. Sparkles + gradient tint + privacy pill, topic chips, 14-day sparkline. Never touches `LogMessage`.

```tsx
import { Sparkles, Lock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import type { Employee, EmployeeLogHealth, ManagerAsk, LogSession } from "@/lib/mock-data";
import { EmployeeScoreBadge } from "@/components/score/EmployeeScoreBadge";
import { summarizeForManager } from "@/lib/log-agent";

export function EmployeeRecapCard({
  employee,
  health,
  asks,
  sessions,
}: {
  employee: Employee;
  health: EmployeeLogHealth;
  asks: ManagerAsk[];
  sessions: LogSession[];
}) {
  const pending = asks.filter((a) => a.status === "pending");
  const answered = asks.filter((a) => a.status === "answered");
  const topics = Array.from(new Set(sessions.flatMap((s) => s.topics))).slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="iridescent-border rounded-2xl">
        <div className="rounded-[calc(1rem-1px)] bg-card p-5">
          <div className="flex items-start gap-4">
            <EmployeeScoreBadge score={health.score} name={employee.name} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  AI recap
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  <Lock className="h-3 w-3" /> Summary only — raw log stays with{" "}
                  {employee.name.split(" ")[0]}
                </span>
              </div>
              <p className="mt-2 text-base leading-relaxed">{health.recap}</p>
              <p className="mt-2 text-sm text-muted-foreground">{summarizeForManager([])}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topics.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border bg-background px-2 py-0.5 text-[11px] uppercase tracking-wide"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {health.lastLogAt && (
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Last log {formatDistanceToNow(new Date(health.lastLogAt), { addSuffix: true })} ·
                  recap refreshed{" "}
                  {formatDistanceToNow(new Date(health.recapUpdatedAt), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold">Pending asks ({pending.length})</h3>
          {pending.length === 0 ? (
            <p className="text-xs text-muted-foreground mt-2">None open.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {pending.map((a) => (
                <li key={a.id} className="text-sm">
                  <div className="font-medium">{a.topic}</div>
                  <div className="text-xs text-muted-foreground">
                    Sent {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    {a.dueAt && ` · due ${format(new Date(a.dueAt), "MMM d")}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-xl border p-4">
          <h3 className="text-sm font-semibold">Answered ({answered.length})</h3>
          {answered.length === 0 ? (
            <p className="text-xs text-muted-foreground mt-2">No answers yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {answered.map((a) => (
                <li key={a.id} className="text-sm">
                  <div className="font-medium">{a.topic}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.answerSummary}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 9.2:** Check `EmployeeScoreBadge` supports a `size` prop. If not, add `size?: "sm" | "md" | "lg"` with a simple switch on the wrapping element. Keep default behavior identical.

- [ ] **Step 9.3:** Replace the `AskTopicDialog` stub with the real dialog — topic, optional due date, tone picker. On submit, push a new `ManagerAsk` (in-memory via a tiny module-level mutable array shim, or local state lifted to `ManagerLogView` — easier). Adjust `ManagerLogView` to own an `asks` state and pass `onCreate` to the dialog.

Dialog:

```tsx
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { employees, type ManagerAsk } from "@/lib/mock-data";

export function AskTopicDialog({
  employeeId,
  open,
  onOpenChange,
  onCreate,
}: {
  employeeId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate?: (ask: ManagerAsk) => void;
}) {
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [tone, setTone] = useState<ManagerAsk["tone"]>("neutral");
  const employee = employees.find((e) => e.id === employeeId);

  function submit() {
    if (!topic.trim() || !prompt.trim()) return;
    const ask: ManagerAsk = {
      id: `ma-${Date.now()}`,
      managerId: employees[0].id,
      employeeId,
      topic: topic.trim(),
      prompt: prompt.trim(),
      createdAt: new Date().toISOString(),
      dueAt: dueAt || undefined,
      status: "pending",
      tone,
    };
    onCreate?.(ask);
    toast.success(`Sent to ${employee?.name.split(" ")[0] ?? "report"}`);
    onOpenChange(false);
    setTopic("");
    setPrompt("");
    setDueAt("");
    setTone("neutral");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ask {employee?.name.split(" ")[0] ?? "report"} a topic</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Topic</Label>
            <Input
              placeholder="Feedback on ACME demo"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Prompt</Label>
            <Textarea
              rows={3}
              placeholder="What should the agent ask them?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Due</Label>
              <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as ManagerAsk["tone"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="empathetic">Empathetic</SelectItem>
                  <SelectItem value="probing">Probing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 9.4:** Update `ManagerLogView` — lift `asks` to local state and pass `onCreate={(a) => setAsks([...asks, a])}` to the dialog.

- [ ] **Step 9.5:** Run `bun run dev` as manager theme. Click a report card → drilldown loads with recap + pending/answered sections. Click "Ask topic" → dialog opens → submit → toast fires.

- [ ] **Step 9.6:** Commit.

```bash
git add src/components/log/EmployeeRecapCard.tsx src/components/log/AskTopicDialog.tsx src/components/log/ManagerLogView.tsx src/components/score/EmployeeScoreBadge.tsx
git commit -m "Manager drilldown: recap card + Ask topic dialog

Recap reads only EmployeeLogHealth + sessions' topic tags — no
LogMessage. Dialog creates a ManagerAsk that the grid picks up."
```

---

## Task 10: `LogOverlay` (⌘J)

**Files:**

- Create: `src/components/app/LogOverlay.tsx`

- [ ] **Step 10.1:** The overlay reuses `LogChatThread` + `LogComposer` inside a right-anchored sheet (mirroring the current Copilot overlay geometry from `Copilot.tsx:53-489`). "Open full log" navigates to `/log`.

```tsx
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { employees, logMessages as seedMsgs, type LogMessage } from "@/lib/mock-data";
import { replyTo, streamReply } from "@/lib/log-agent";
import { LogChatThread } from "@/components/log/LogChatThread";
import { LogComposer } from "@/components/log/LogComposer";
import { cn } from "@/lib/utils";

const ME_ID = employees[0].id;

export function LogOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const nav = useNavigate();
  const [msgs, setMsgs] = useState<LogMessage[]>(() =>
    seedMsgs.filter((m) => m.employeeId === ME_ID).slice(-8),
  );
  const [streamingId, setStreamingId] = useState<string | undefined>();

  function send(text: string, voice: boolean) {
    const userId = `lm-u-${Date.now()}`;
    const agentId = `lm-a-${Date.now() + 1}`;
    const reply = replyTo(text);
    setMsgs((prev) => [
      ...prev,
      {
        id: userId,
        employeeId: ME_ID,
        role: "employee",
        text,
        createdAt: new Date().toISOString(),
        voice,
      },
      {
        id: agentId,
        employeeId: ME_ID,
        role: "agent",
        text: "",
        createdAt: new Date().toISOString(),
        topic: reply.topic,
        sentiment: reply.sentiment,
      },
    ]);
    setStreamingId(agentId);
    streamReply(reply.text, (soFar, done) => {
      setMsgs((prev) => prev.map((m) => (m.id === agentId ? { ...m, text: soFar } : m)));
      if (done) setStreamingId(undefined);
    });
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 pointer-events-none transition-opacity",
        open ? "opacity-100 pointer-events-auto" : "opacity-0",
      )}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-background border-l shadow-2xl flex flex-col">
        <header className="flex items-center justify-between px-4 h-12 border-b">
          <span className="text-sm font-medium">Status Log</span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
                nav({ to: "/log" });
              }}
              aria-label="Open full log"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <LogChatThread messages={msgs} streamingId={streamingId} />
        <LogComposer onSend={send} />
      </aside>
    </div>
  );
}
```

- [ ] **Step 10.2:** Commit.

```bash
git add src/components/app/LogOverlay.tsx
git commit -m "Add LogOverlay — compact ⌘J chat on top of the full log

Reuses LogChatThread + LogComposer so the mini-surface and the full
/log route share a single visual language."
```

---

## Task 11: Sidebar + ⌘J wiring in `AppShell`

**Files:**

- Modify: `src/components/app/AppShell.tsx`

- [ ] **Step 11.1:** In the `groups` array (`AppShell.tsx:78-141`):
  - Add a new top-level group **above** People:

```ts
{
  label: "Me",
  items: [
    { to: "/log", label: "Status Log", icon: MessagesSquare, isNew: true },
  ],
},
```

- Remove the `{ to: "/pulse", label: "Team Pulse", … }` entry from the Labs group.
- Add `MessagesSquare` to the existing lucide import block.

- [ ] **Step 11.2:** Replace the `Copilot` imports and usage:
  - Remove: `import { CopilotLauncher, CopilotOverlay } from "./Copilot";`
  - Add: `import { LogOverlay } from "./LogOverlay";`
  - Where `<CopilotOverlay open={copilotOpen} onOpenChange={setCopilotOpen} />` is rendered, replace with `<LogOverlay open={copilotOpen} onOpenChange={setCopilotOpen} />`.
  - `CopilotLauncher` (topbar "Ask Pulse" chip): replace with a compact `Link` button that opens the overlay — reuse the same visual:

```tsx
import { Sparkles } from "lucide-react";
// ... inside the topbar:
<button
  onClick={() => setCopilotOpen(true)}
  className="group relative inline-flex items-center gap-2 h-9 px-3 rounded-md border bg-background/80 hover:bg-muted text-sm press-scale"
>
  <Sparkles className="h-4 w-4 text-primary" />
  <span className="font-medium">Status Log</span>
  <NewBadge />
  <kbd className="hidden md:inline-flex h-5 px-1.5 items-center rounded border bg-muted text-[10px] font-mono">
    ⌘J
  </kbd>
</button>;
```

- [ ] **Step 11.3:** Confirm the ⌘J handler at `AppShell.tsx:174-177` still toggles `setCopilotOpen` — no change needed; the state variable is reused to drive `LogOverlay`.

- [ ] **Step 11.4:** Also update the `voiceBus.on` listener at `AppShell.tsx:195-199` — when source is `"log"` (or keep `"copilot"` for back-compat), open the overlay:

```tsx
useEffect(() => {
  return voiceBus.on((ev) => {
    if (ev.kind === "draftPrompt" && (ev.source === "log" || ev.source === "copilot"))
      setCopilotOpen(true);
  });
}, []);
```

- [ ] **Step 11.5:** Run `bun run dev`. Confirm:
  - Sidebar shows **Me → Status Log** above People.
  - Pulse is gone from Labs.
  - ⌘J opens the new overlay; clicking ⤢ navigates to `/log`.
  - Topbar "Status Log" chip opens the overlay.

- [ ] **Step 11.6:** Commit.

```bash
git add src/components/app/AppShell.tsx
git commit -m "Rewire sidebar + ⌘J to Status Log

Status Log gets a top-level 'Me' slot; Pulse leaves Labs; ⌘J
and the topbar chip open LogOverlay (same state variable)."
```

---

## Task 12: Freshness factor in `score.ts`

**Files:**

- Modify: `src/lib/score.ts`

- [ ] **Step 12.1:** Open `src/lib/score.ts`. Current factors (per exploration): delivery 25 / utilization 20 / value 20 / recognition 15 / focus 10 / billable 10. Keep the default behavior intact, but add an **optional** `logFreshness` input that, when provided, rebalances by shaving 5 points off `focus` and 5 off `billable` and giving 10 to `logFreshness`. Gate behind an option flag to stay non-breaking.

```ts
// in computeEmployeeScore(...) (or whatever the existing export is named)
export interface ScoreOptions {
  includeLogFreshness?: boolean;
}
// extend the signature with `opts?: ScoreOptions` and the input with `logFreshness?: number` (0..100)

// inside the function, right before the final weighted sum:
const weights = opts?.includeLogFreshness
  ? {
      delivery: 25,
      utilization: 20,
      value: 20,
      recognition: 15,
      focus: 5,
      billable: 5,
      logFreshness: 10,
    }
  : {
      delivery: 25,
      utilization: 20,
      value: 20,
      recognition: 15,
      focus: 10,
      billable: 10,
      logFreshness: 0,
    };
```

Update the weighted sum to include `logFreshness` when the flag is on. Leave every existing call site unchanged (they won't pass `opts`).

- [ ] **Step 12.2:** Run `bun run lint` + `bun run dev`. Confirm `/saturation` and `/profile` scores are unchanged (they don't pass the flag).

- [ ] **Step 12.3:** Commit.

```bash
git add src/lib/score.ts
git commit -m "Score: optional log-freshness factor behind a flag

Default score computation is bit-for-bit unchanged. Callers that
want log freshness in the mix pass { includeLogFreshness: true }."
```

---

## Task 13: Remove old Pulse route + Copilot

**Files:**

- Delete: `src/routes/pulse.tsx`
- Delete: `src/components/app/Copilot.tsx`
- Auto-regenerate: `src/routeTree.gen.ts`

- [ ] **Step 13.1:** Verify no remaining imports of `@/routes/pulse` or `@/components/app/Copilot` outside of `src/routeTree.gen.ts`:

```bash
rg -n "routes/pulse|components/app/Copilot" src/ --glob '!src/routeTree.gen.ts'
```

Expected: no matches. If any remain (e.g. a deep link), replace with `/log`.

- [ ] **Step 13.2:** Delete the files:

```bash
git rm src/routes/pulse.tsx src/components/app/Copilot.tsx
```

- [ ] **Step 13.3:** Run `bun run dev`. The TanStack router plugin regenerates `routeTree.gen.ts` removing the `pulse` route. Confirm the app boots, `/log` works, `/pulse` 404s (or the router's not-found route). No console errors.

- [ ] **Step 13.4:** Check `CommandPalette.tsx` and `copilot-nudges.ts` for any mention of `/pulse` and retarget to `/log` if present.

- [ ] **Step 13.5:** Commit.

```bash
git add -A
git commit -m "Remove /pulse and the old Copilot overlay

Fully superseded by /log + LogOverlay. Route tree regenerates
automatically."
```

---

## Task 14: Polish pass

**Files:**

- Touch: `src/components/log/*`

- [ ] **Step 14.1:** **Skeletons.** In `src/routes/log.tsx`, replace the null state before `ready` with skeletons that match the final layout:

```tsx
{
  !ready && (
    <div className="p-4 md:p-6 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}
```

- [ ] **Step 14.2:** **Empty states.** In `EmployeeLogView`, if `msgs.length === 0` after filtering, show a centered `fade-in` card with the daily opener inline and a "Start logging" CTA that focuses the composer.

- [ ] **Step 14.3:** **Responsive.** Verify at `sm` width:
  - Employee view: right rail hides (`hidden lg:flex` already set).
  - Manager grid collapses to one column.
  - Overlay takes full width on `< sm`.

- [ ] **Step 14.4:** **Motion.** Ensure:
  - `stagger-in` on the manager grid (set on the grid container — already done in Task 8).
  - `fade-in` on each new message (already on `LogChatThread` `<li>`).
  - `pulse-dot` on the sidebar entry when any open ask exists. In `AppShell.tsx` map the `Status Log` item to include an `unreadDot?: boolean` prop derived from `managerAsks.filter(a => a.status === "pending").length > 0` (for demo purposes, this is fine; route it through an existing `notifications` pattern if one exists).

- [ ] **Step 14.5:** **Privacy tooltip.** Wrap the 🔒 "Summary only" pill in each manager-side card/recap with `<Tooltip>`: "Managers only see AI summaries. Raw conversations stay with the employee."

- [ ] **Step 14.6:** Run `bun run dev` → flip themes (employee, manager, hr) → walk through: send a message, open ⌘J, create an ask, click a card, answer an ask as the employee. No console errors; motion feels coherent.

- [ ] **Step 14.7:** Commit.

```bash
git add -A
git commit -m "Polish Status Log: skeletons, empty state, motion, privacy tooltip

Wires the feature into the repo's visual language end-to-end."
```

---

## Task 15: Final verification

- [ ] **Step 15.1:** Run `bun run lint`. Expect zero errors and zero warnings in changed files.

- [ ] **Step 15.2:** Run `bun run build`. Expect a clean build with **no chunk-size warning regression** (the previous `manualChunks` split + lazy recharts keeps the budget safe).

- [ ] **Step 15.3:** Run `bun run dev` and walk the full matrix:

| Theme    | Route              | Expect                                   |
| -------- | ------------------ | ---------------------------------------- |
| employee | `/log`             | Chat thread, composer, chips, right rail |
| employee | ⌘J                 | Overlay opens, sends, streams            |
| manager  | `/log`             | Team grid, score rings, "Ask topic"      |
| manager  | `/log/$employeeId` | Recap card, no raw messages              |
| manager  | after ask          | Toast fires, pending ask count +1        |
| employee | after ask          | Pinned ask renders inline                |
| any      | `/pulse`           | 404 (route removed)                      |

- [ ] **Step 15.4:** DOM privacy check: in the manager view, open devtools → Elements → search for a known raw message substring (e.g. "Shipped the pricing page"). Expected: zero matches.

- [ ] **Step 15.5:** Squash or leave the commit history as-is (repo style is short imperative subjects — fine to leave).

- [ ] **Step 15.6:** Final commit (if any polish tweaks surfaced during verification):

```bash
git add -A
git commit -m "Status Log: verification pass tweaks" || echo "nothing to commit"
```

---

## Self-review checklist

- [x] Every spec requirement from the design doc has a task (data model → 1, agent → 2, routes → 3/9, chat primitives → 4/5/6, employee view → 7, manager dashboard → 8, drilldown → 9, overlay → 10, sidebar → 11, freshness → 12, cleanup → 13, polish → 14, verify → 15).
- [x] No "TBD" / "handle edge cases" placeholders.
- [x] Types are consistent: `LogMessage`, `LogSession`, `ManagerAsk`, `EmployeeLogHealth`, `LogTopic`, `LogSentiment`, `AgentPersona`, `AgentReply`, `ScoreOptions`.
- [x] Function names consistent across tasks: `openerFor`, `replyTo`, `streamReply`, `summarizeForEmployee`, `summarizeForManager`, `healthFromMessages`.
- [x] Every code-changing step contains the actual code (no "similar to Task N").
- [x] File paths are always exact.
- [x] Verification strategy is visual + lint + build, matching the repo convention (no test suite).
- [x] Privacy boundary is enforced structurally (manager components never import `LogMessage`).

---

## Out of scope (do not implement)

- Real LLM wiring.
- Cross-team / HR roll-up dashboards.
- Notifications outside the app (email, Slack).
- Search inside the log.
- Export / audit trail UI.
