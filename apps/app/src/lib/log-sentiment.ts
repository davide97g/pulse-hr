import type { LogMessage, LogSentiment, LogTopic } from "./mock-data";

export interface Dimensions {
  energy: number;
  stress: number;
  engagement: number;
  alignment: number;
}

export interface SentimentScore extends Dimensions {
  overall: number;
  confidence: number;
}

export const DIMENSION_KEYS = ["energy", "stress", "engagement", "alignment"] as const;

const BANKS: Record<keyof Dimensions, { positive: string[]; negative: string[] }> = {
  energy: {
    positive: [
      "energized",
      "fresh",
      "rested",
      "focused",
      "clear-headed",
      "sharp",
      "ready",
      "in flow",
      "good night",
    ],
    negative: [
      "tired",
      "drained",
      "exhausted",
      "foggy",
      "burnt",
      "wiped",
      "low energy",
      "sleepy",
      "no sleep",
      "hardly slept",
      "fried",
      "running on fumes",
    ],
  },
  stress: {
    positive: ["calm", "steady", "manageable", "under control", "relaxed", "in flow"],
    negative: [
      "overwhelmed",
      "blocked",
      "stuck",
      "behind",
      "crunch",
      "fire",
      "stressed",
      "swamped",
      "stretched thin",
      "panicking",
      "panic",
      "pressure",
      "too much",
      "drowning",
      "urgent",
      "escalation",
    ],
  },
  engagement: {
    positive: [
      "excited",
      "love",
      "shipped",
      "proud",
      "momentum",
      "won",
      "nailed",
      "enjoyed",
      "feeling great",
      "energized about",
      "fired up",
    ],
    negative: [
      "bored",
      "stalled",
      "disengaged",
      "going through the motions",
      "pointless",
      "dragging",
      "checked out",
      "not motivated",
      "no momentum",
      "detached",
    ],
  },
  alignment: {
    positive: [
      "clear",
      "aligned",
      "know what to do",
      "priorities clear",
      "on the same page",
      "direction is clear",
    ],
    negative: [
      "unclear",
      "conflicting",
      "no direction",
      "confused",
      "moving target",
      "shifting priorities",
      "don't know what",
      "what should i",
      "misaligned",
      "surprised by scope",
    ],
  },
};

const TOPIC_BIAS: Record<LogTopic, Partial<Dimensions>> = {
  win: { engagement: 0.3, energy: 0.15 },
  pain: { stress: 0.4, energy: -0.15 },
  challenge: { stress: 0.2, engagement: 0.1 },
  feedback: {},
  status: {},
  freeform: {},
};

function scan(text: string, terms: string[]): number {
  let n = 0;
  for (const term of terms) if (text.includes(term)) n++;
  return n;
}

function clamp(x: number): number {
  return Math.max(-1, Math.min(1, x));
}

export function scoreMessage(text: string, topic?: LogTopic): SentimentScore {
  const lower = text.toLowerCase();
  const dims: Dimensions = { energy: 0, stress: 0, engagement: 0, alignment: 0 };
  let hits = 0;

  for (const k of DIMENSION_KEYS) {
    const pos = scan(lower, BANKS[k].positive);
    const neg = scan(lower, BANKS[k].negative);
    hits += pos + neg;
    if (pos + neg > 0) {
      dims[k] = clamp((pos - neg) / (pos + neg));
    }
  }

  if (topic) {
    const bias = TOPIC_BIAS[topic];
    for (const k of DIMENSION_KEYS) {
      const b = bias[k];
      if (b !== undefined) dims[k] = clamp(dims[k] + b);
    }
  }

  const overall = clamp((dims.energy + dims.engagement + dims.alignment - dims.stress) / 4);
  const confidence = Math.min(1, hits / 3);
  return { ...dims, overall, confidence };
}

export function aggregateMessages(msgs: LogMessage[]): SentimentScore {
  const employeeMsgs = msgs.filter((m) => m.role === "employee");
  if (employeeMsgs.length === 0) {
    return { energy: 0, stress: 0, engagement: 0, alignment: 0, overall: 0, confidence: 0 };
  }

  const acc: Dimensions = { energy: 0, stress: 0, engagement: 0, alignment: 0 };
  let totalWeight = 0;
  let totalConfidence = 0;

  for (const m of employeeMsgs) {
    const s = scoreMessage(m.text, m.topic);
    const w = Math.max(0.2, s.confidence);
    acc.energy += s.energy * w;
    acc.stress += s.stress * w;
    acc.engagement += s.engagement * w;
    acc.alignment += s.alignment * w;
    totalWeight += w;
    totalConfidence += s.confidence;
  }

  const norm = totalWeight || 1;
  const dims: Dimensions = {
    energy: clamp(acc.energy / norm),
    stress: clamp(acc.stress / norm),
    engagement: clamp(acc.engagement / norm),
    alignment: clamp(acc.alignment / norm),
  };
  const overall = clamp((dims.energy + dims.engagement + dims.alignment - dims.stress) / 4);
  return { ...dims, overall, confidence: totalConfidence / employeeMsgs.length };
}

export function toLegacySentiment(overall: number): LogSentiment {
  if (overall > 0.25) return "positive";
  if (overall < -0.25) return "negative";
  if (overall < -0.05) return "mixed";
  return "neutral";
}

export const DIMENSION_LABEL: Record<keyof Dimensions, string> = {
  energy: "Energy",
  stress: "Stress",
  engagement: "Engagement",
  alignment: "Alignment",
};
