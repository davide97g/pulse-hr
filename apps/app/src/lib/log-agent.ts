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
