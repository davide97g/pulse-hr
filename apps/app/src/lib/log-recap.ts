import type { EmployeeLogHealth, LogMessage, LogSentiment, LogTopic } from "./mock-data";
import { aggregateMessages, scoreMessage } from "./log-sentiment";

export interface DailyMean {
  date: string; // YYYY-MM-DD
  overall: number;
  energy: number;
  stress: number;
  engagement: number;
  alignment: number;
  count: number;
}

export interface RecapDimensions {
  energy: number;
  stress: number;
  engagement: number;
  alignment: number;
  overall: number;
}

export interface RecapResult {
  summary: string;
  managerSummary: string;
  topics: { topic: LogTopic; count: number }[];
  topicContribution: { topic: LogTopic; count: number; sentiment: number }[];
  dimensions: RecapDimensions;
  confidence: number;
  drivers: { label: string; value: number; tone: "positive" | "negative" | "neutral" }[];
  suggestedActions: string[];
  dailyMeans: DailyMean[]; // 14 entries oldest -> newest
  sparkline: number[];
  trend: EmployeeLogHealth["trend"];
  score: number;
  lastSentiment?: LogSentiment;
  lastLogAt?: string;
  recapUpdatedAt: string;
  messageCount: number;
}

export function computeRecap(employeeName: string, msgs: LogMessage[]): RecapResult {
  const employeeMsgs = msgs.filter((m) => m.role === "employee");
  const agg = aggregateMessages(msgs);

  const topicCounts = new Map<LogTopic, number>();
  for (const m of employeeMsgs) {
    if (m.topic) topicCounts.set(m.topic, (topicCounts.get(m.topic) ?? 0) + 1);
  }
  const topics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));
  const topicContribution = topics.map(({ topic, count }) => {
    const topicMsgs = employeeMsgs.filter((m) => m.topic === topic);
    const sentiment = avg(topicMsgs.map((m) => scoreMessage(m.text, topic).overall));
    return { topic, count, sentiment: round2(sentiment) };
  });

  const today = startOfDay(new Date());
  const dailyMeans: DailyMean[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const dayMsgs = employeeMsgs.filter((m) => m.createdAt.slice(0, 10) === key);
    if (dayMsgs.length === 0) {
      dailyMeans.push({
        date: key,
        overall: 0,
        energy: 0,
        stress: 0,
        engagement: 0,
        alignment: 0,
        count: 0,
      });
      continue;
    }
    const scores = dayMsgs.map((m) => scoreMessage(m.text, m.topic));
    const meanOf = (k: keyof Pick<DailyMean, "overall" | "energy" | "stress" | "engagement" | "alignment">) =>
      clamp(scores.reduce((s, x) => s + x[k], 0) / scores.length);
    dailyMeans.push({
      date: key,
      overall: meanOf("overall"),
      energy: meanOf("energy"),
      stress: meanOf("stress"),
      engagement: meanOf("engagement"),
      alignment: meanOf("alignment"),
      count: dayMsgs.length,
    });
  }

  const sparkline = dailyMeans.map((d) => round2(d.overall));

  const recent = avg(sparkline.slice(-4));
  const prior = avg(sparkline.slice(-8, -4));
  const delta = recent - prior;
  const trend: EmployeeLogHealth["trend"] = delta > 0.1 ? "up" : delta < -0.1 ? "down" : "flat";

  const score = Math.max(0, Math.min(100, Math.round(60 + agg.overall * 35)));

  const last = employeeMsgs[employeeMsgs.length - 1];
  const lastSentiment = last
    ? toLegacy(scoreMessage(last.text, last.topic).overall)
    : undefined;

  const summary = renderSummary(employeeName, agg, topics, trend);
  const drivers = renderDrivers(agg);
  const suggestedActions = renderSuggestedActions(agg, topics, trend);
  const managerSummary = renderManagerSummary(employeeName, agg, topics, trend);

  return {
    summary,
    managerSummary,
    topics,
    topicContribution,
    dimensions: {
      energy: agg.energy,
      stress: agg.stress,
      engagement: agg.engagement,
      alignment: agg.alignment,
      overall: agg.overall,
    },
    confidence: round2(agg.confidence),
    drivers,
    suggestedActions,
    dailyMeans,
    sparkline,
    trend,
    score,
    lastSentiment,
    lastLogAt: last?.createdAt,
    recapUpdatedAt: new Date().toISOString(),
    messageCount: employeeMsgs.length,
  };
}

function renderSummary(
  name: string,
  agg: RecapDimensions,
  topics: { topic: LogTopic; count: number }[],
  trend: EmployeeLogHealth["trend"],
): string {
  const first = name.split(" ")[0];
  const top = topics[0]?.topic;
  const mood =
    agg.overall > 0.3
      ? "in good shape"
      : agg.overall > 0.1
        ? "trending positive"
        : agg.overall > -0.1
          ? "steady"
          : agg.overall > -0.3
            ? "running heavy"
            : "under strain";
  const stressNote =
    agg.stress > 0.3
      ? " Stress signals are high — worth a check-in."
      : agg.stress < -0.2
        ? " Workload feels manageable."
        : "";
  const engageNote =
    agg.engagement > 0.3
      ? " Engagement is strong."
      : agg.engagement < -0.2
        ? " Engagement is dipping."
        : "";
  const trendNote =
    trend === "up" ? " Trend is improving." : trend === "down" ? " Trend is sliding." : "";
  const focus = top ? ` Focus this week: ${top}.` : "";
  return `${first} is ${mood}.${stressNote}${engageNote}${trendNote}${focus}`.trim();
}

function renderManagerSummary(
  name: string,
  agg: RecapDimensions,
  topics: { topic: LogTopic; count: number }[],
  trend: EmployeeLogHealth["trend"],
): string {
  const first = name.split(" ")[0];
  const top = topics[0]?.topic ?? "status";
  const trendText =
    trend === "up" ? "improving" : trend === "down" ? "softening" : "steady";
  if (agg.stress > 0.35) {
    return `${first}'s ${top} signal is ${trendText}, with workload strain worth a manager check-in.`;
  }
  if (agg.engagement > 0.25) {
    return `${first}'s ${top} signal is ${trendText}, with strong engagement and useful momentum to reinforce.`;
  }
  if (agg.alignment < -0.2) {
    return `${first}'s ${top} signal is ${trendText}, with some ambiguity around priorities.`;
  }
  return `${first}'s ${top} signal is ${trendText}; no raw transcript is shared.`;
}

function renderDrivers(
  agg: RecapDimensions,
): { label: string; value: number; tone: "positive" | "negative" | "neutral" }[] {
  const rows = [
    { label: "Energy", value: agg.energy, invert: false },
    { label: "Engagement", value: agg.engagement, invert: false },
    { label: "Alignment", value: agg.alignment, invert: false },
    { label: "Stress load", value: agg.stress, invert: true },
  ];
  return rows
    .map((r) => {
      const display = r.invert ? -r.value : r.value;
      const tone = display > 0.15 ? "positive" : display < -0.15 ? "negative" : "neutral";
      return { label: r.label, value: round2(display), tone };
    })
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

function renderSuggestedActions(
  agg: RecapDimensions,
  topics: { topic: LogTopic; count: number }[],
  trend: EmployeeLogHealth["trend"],
): string[] {
  const actions: string[] = [];
  const top = topics[0]?.topic;
  if (agg.stress > 0.35) actions.push("Ask what can be removed, delayed, or paired.");
  if (agg.alignment < -0.2) actions.push("Clarify the next priority and what success looks like.");
  if (agg.engagement < -0.2) actions.push("Use the next 1:1 to find what would restore momentum.");
  if (top === "win") actions.push("Reflect the win back before it disappears into the week.");
  if (top === "feedback") actions.push("Turn the feedback into one specific request.");
  if (trend === "down") actions.push("Schedule a low-pressure check-in before the next cycle.");
  if (actions.length === 0) actions.push("Keep the cadence: one short check-in each workday.");
  return actions.slice(0, 3);
}

function toLegacy(overall: number): LogSentiment {
  if (overall > 0.25) return "positive";
  if (overall < -0.25) return "negative";
  if (overall < -0.05) return "mixed";
  return "neutral";
}

function avg(xs: number[]): number {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function clamp(x: number): number {
  return Math.max(-1, Math.min(1, x));
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}
