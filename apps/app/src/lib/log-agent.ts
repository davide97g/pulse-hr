import type { LogMessage, LogSentiment, LogTopic, ManagerAsk } from "./mock-data";
import { aggregateMessages, scoreMessage, toLegacySentiment } from "./log-sentiment";
import type { AgentPersona } from "./log-presets";

export type { AgentPersona };

export interface AgentReply {
  text: string;
  topic?: LogTopic;
  sentiment?: LogSentiment;
}

export interface ReplyContext {
  history?: LogMessage[];
  persona?: AgentPersona;
  hint?: LogTopic;
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

const PROBES_BY_TOPIC: Record<LogTopic, string[]> = {
  status: [
    "What's the current state — in a sentence?",
    "Where are you on the plan vs. where you hoped to be?",
    "Any moving target shifting your plan?",
  ],
  win: [
    "Nice — want me to log that as a win?",
    "What made it work?",
    "Who else helped land it? I can credit them.",
    "Want this in your manager recap, or keep it private?",
  ],
  pain: [
    "Noted. What would make this less painful?",
    "Who could help, if anyone?",
    "Is this a one-off or a pattern this week?",
    "Want me to flag this as a risk in your recap?",
  ],
  challenge: [
    "What's the next move you're weighing?",
    "Solved, or still in the fight?",
    "Could a teammate take a slice off your plate?",
  ],
  feedback: [
    "Who is this for, and what's the kindest-but-useful version?",
    "Want this shared as a summary or kept private?",
    "Should I draft it for your 1:1 prep?",
  ],
  freeform: [
    "Tell me more.",
    "Anything else tugging at you?",
    "Is there a thread we should keep pulling?",
  ],
};

const PERSONA_PROBES: Record<AgentPersona, Partial<Record<LogTopic, string[]>>> = {
  coach: {
    status: ["Cut to it — green, yellow, or red?", "What's the single next move?"],
    pain: ["Smallest unblocker that gets you moving today?"],
  },
  reflective: {
    win: ["What does this say about how the week actually went?"],
    pain: ["What pattern is this part of, if any?"],
    freeform: ["When you read this back next week, what should it tell you?"],
  },
  empathetic: {
    pain: ["That sounds heavy. What's the part that's hitting hardest?", "Take your time."],
    feedback: ["No judgment here — say it raw, I'll help shape it later."],
  },
  strategic: {
    feedback: ["What do you want them to do differently? Frame it as a request."],
    challenge: ["What's the trade-off you're really choosing between?"],
  },
  curious: {
    win: ["What surprised you about how it went?"],
    pain: ["What were you assuming that turned out not to be true?"],
    challenge: ["What's the strongest argument for the other path?"],
  },
  celebratory: {
    win: ["Love that. Who else should hear this?", "What did you do that you almost didn't?"],
    freeform: ["Even a tiny one — what's worth banking?"],
  },
};

const TOPIC_RULES: { topic: LogTopic; rx: RegExp }[] = [
  { topic: "win", rx: /\b(won|shipped|landed|nailed|proud|great|crushed|launched|closed)\b/i },
  {
    topic: "pain",
    rx: /\b(stuck|blocked|pain|tired|drained|overwhelm|behind|swamped|fire|crunch)\b/i,
  },
  { topic: "challenge", rx: /\b(challenge|tough|hard|struggl|tricky|wrestling)\b/i },
  { topic: "feedback", rx: /\b(feedback|thought|opinion|suggest|push back|disagree)\b/i },
];

export function openerFor(date: Date, personaOrPendingAsk?: AgentPersona | ManagerAsk): string {
  if (personaOrPendingAsk && typeof personaOrPendingAsk === "object") {
    return `Your manager asked: "${personaOrPendingAsk.prompt}" — want to take it now, or log other things first?`;
  }
  const options = OPENERS_BY_WEEKDAY[date.getDay()] ?? OPENERS_BY_WEEKDAY[1];
  return options[Math.floor(Math.random() * options.length)];
}

export function detectTopic(text: string, fallback?: LogTopic): LogTopic {
  for (const rule of TOPIC_RULES) {
    if (rule.rx.test(text)) return rule.topic;
  }
  return fallback ?? "status";
}

export function replyTo(text: string, ctxOrTopic?: ReplyContext | LogTopic): AgentReply {
  const ctx: ReplyContext =
    typeof ctxOrTopic === "string" ? { hint: ctxOrTopic } : (ctxOrTopic ?? {});

  const topic = detectTopic(text, ctx.hint ?? carryTopic(ctx.history));
  const score = scoreMessage(text, topic);
  const sentiment = toLegacySentiment(score.overall);

  const probes = pickProbes(topic, ctx.persona);
  const recentProbes = recentAgentTexts(ctx.history);
  const fresh = probes.filter((p) => !recentProbes.includes(p));
  const pool = fresh.length > 0 ? fresh : probes;
  const probe = pool[Math.floor(Math.random() * pool.length)];

  const lead = personaLead(ctx.persona, topic, score);
  const text2 = lead ? `${lead} ${probe}` : probe;

  return { text: text2, topic, sentiment };
}

function pickProbes(topic: LogTopic, persona?: AgentPersona): string[] {
  const base = PROBES_BY_TOPIC[topic];
  if (!persona) return base;
  const extra = PERSONA_PROBES[persona]?.[topic] ?? [];
  return [...extra, ...base];
}

function carryTopic(history?: LogMessage[]): LogTopic | undefined {
  if (!history || history.length === 0) return undefined;
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i];
    if (m.topic && m.topic !== "freeform") return m.topic;
  }
  return undefined;
}

function recentAgentTexts(history?: LogMessage[]): string[] {
  if (!history) return [];
  return history
    .filter((m) => m.role === "agent")
    .slice(-4)
    .map((m) => m.text);
}

function personaLead(
  persona: AgentPersona | undefined,
  topic: LogTopic,
  score: { stress: number; engagement: number; overall: number },
): string {
  if (!persona) return "";
  if (persona === "empathetic" && (topic === "pain" || score.stress > 0.3)) {
    return "Hearing you.";
  }
  if (persona === "celebratory" && (topic === "win" || score.engagement > 0.3)) {
    return "Big yes.";
  }
  if (persona === "coach" && topic === "pain") return "OK, working it.";
  if (persona === "reflective" && topic === "win") return "Worth pausing on.";
  if (persona === "strategic" && topic === "feedback") return "Good signal.";
  if (persona === "curious") return "Curious —";
  return "";
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
  const agg = aggregateMessages(msgs);
  const topTopic = mostCommon(msgs.map((m) => m.topic).filter(Boolean) as LogTopic[]) ?? "status";
  const mood = toLegacySentiment(agg.overall);
  return `Focus: ${topTopic}. Overall mood ${mood}. ${msgs.length} signals logged.`;
}

export function healthFromMessages(msgs: LogMessage[]): number {
  const agg = aggregateMessages(msgs);
  return Math.max(0, Math.min(100, Math.round(60 + agg.overall * 35)));
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
