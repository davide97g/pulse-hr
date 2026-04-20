import {
  goalsSeed, challengesSeed, oneOnOnesSeed, growthNotesSeed, kudosSeed,
  focusSessionsSeed, seasonalChallengesSeed, employees,
  type Employee, type Goal, type Challenge, type OneOnOne, type GrowthNote,
  type Kudo, type SeasonalChallenge, type SeasonalPeriod,
} from "./mock-data";

// ── Level ladder ───────────────────────────────────────────────────────
export interface Level {
  tier: number;
  name: string;
  xpMin: number;
  xpMax: number;
  color: string;
}

export const LEVELS: Level[] = [
  { tier: 1, name: "Seedling",     xpMin: 0,     xpMax: 100,   color: "oklch(0.72 0.15 160)" },
  { tier: 2, name: "Rookie",       xpMin: 100,   xpMax: 250,   color: "oklch(0.75 0.15 130)" },
  { tier: 3, name: "Contributor",  xpMin: 250,   xpMax: 500,   color: "oklch(0.76 0.17 90)"  },
  { tier: 4, name: "Specialist",   xpMin: 500,   xpMax: 1000,  color: "oklch(0.78 0.18 55)"  },
  { tier: 5, name: "Lead",         xpMin: 1000,  xpMax: 2000,  color: "oklch(0.78 0.2 25)"   },
  { tier: 6, name: "Mentor",       xpMin: 2000,  xpMax: 4000,  color: "oklch(0.68 0.2 10)"   },
  { tier: 7, name: "Principal",    xpMin: 4000,  xpMax: 8000,  color: "oklch(0.65 0.22 330)" },
  { tier: 8, name: "Architect",    xpMin: 8000,  xpMax: 20000, color: "oklch(0.62 0.22 295)" },
];

// ── XP derivation ──────────────────────────────────────────────────────
export interface XpBreakdown {
  kudos: number;
  focus: number;
  goals: number;
  challenges: number;
  oneOnOnes: number;
  total: number;
}

export function computeXp(employeeId: string): XpBreakdown {
  const kudos = kudosSeed.filter(k => k.toId === employeeId);
  const focus = focusSessionsSeed.filter(f => f.employeeId === employeeId);
  const goals = goalsSeed.filter(g => g.employeeId === employeeId);
  const challenges = challengesSeed.filter(c => c.employeeId === employeeId);
  const oneOnOnes = oneOnOnesSeed.filter(o => o.employeeId === employeeId);

  const kudosXp = kudos.reduce((acc, k) => acc + k.amount, 0); // 1 coin = 1 xp
  const focusXp = focus.length * 5;
  const goalsXp = goals.filter(g => g.status === "hit").length * 100;
  const challengesXp = challenges
    .filter(c => c.status === "succeeded")
    .reduce((acc, c) => acc + c.xpReward, 0);
  const oneOnOnesXp = oneOnOnes.length * 10;

  const total = kudosXp + focusXp + goalsXp + challengesXp + oneOnOnesXp;
  return {
    kudos: kudosXp, focus: focusXp, goals: goalsXp,
    challenges: challengesXp, oneOnOnes: oneOnOnesXp, total,
  };
}

export function levelFromXp(xp: number): { level: Level; next?: Level; progressPct: number } {
  const idx = LEVELS.findIndex(l => xp < l.xpMax);
  const lvl = LEVELS[idx === -1 ? LEVELS.length - 1 : idx];
  const next = LEVELS[LEVELS.indexOf(lvl) + 1];
  const span = lvl.xpMax - lvl.xpMin;
  const progressPct = span === 0 ? 100 : Math.min(100, Math.max(0, Math.round(((xp - lvl.xpMin) / span) * 100)));
  return { level: lvl, next, progressPct };
}

// ── Badges ─────────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  progress?: { have: number; need: number };
}

export function badgesFor(employeeId: string): Badge[] {
  const kudosIn = kudosSeed.filter(k => k.toId === employeeId);
  const distinctGivers = new Set(kudosIn.map(k => k.fromId)).size;
  const kudosOut = kudosSeed.filter(k => k.fromId === employeeId);
  const focus = focusSessionsSeed.filter(f => f.employeeId === employeeId);
  const goalsHit = goalsSeed.filter(g => g.employeeId === employeeId && g.status === "hit").length;
  const challengesDone = challengesSeed.filter(c => c.employeeId === employeeId && c.status === "succeeded").length;

  const def = [
    { id: "first-kudos",   name: "First kudos",      emoji: "💐", desc: "Receive your first kudo.",            have: kudosIn.length,   need: 1 },
    { id: "crowd",         name: "Crowd favorite",   emoji: "🌟", desc: "Receive 5 kudos total.",              have: kudosIn.length,   need: 5 },
    { id: "all-hands",     name: "All-hands",        emoji: "🫂", desc: "Receive kudos from 5 different people.", have: distinctGivers, need: 5 },
    { id: "mentor",        name: "Mentor",           emoji: "🧭", desc: "Give 10+ kudos.",                     have: kudosOut.length,  need: 10 },
    { id: "flow-state",    name: "Flow state",       emoji: "🎯", desc: "Log 10 focus sessions.",              have: focus.length,     need: 10 },
    { id: "goal-getter",   name: "Goal getter",      emoji: "🎯", desc: "Hit 1 goal.",                         have: goalsHit,         need: 1 },
    { id: "overachiever",  name: "Overachiever",     emoji: "🏆", desc: "Hit 3 goals.",                        have: goalsHit,         need: 3 },
    { id: "risk-taker",    name: "Risk taker",       emoji: "⚡", desc: "Succeed on 3 stretch challenges.",    have: challengesDone,   need: 3 },
  ];

  return def.map(d => ({
    id: d.id,
    name: d.name,
    description: d.desc,
    emoji: d.emoji,
    earned: d.have >= d.need,
    progress: { have: Math.min(d.have, d.need), need: d.need },
  }));
}

// ── Strengths radar ────────────────────────────────────────────────────
const STRENGTH_TAGS: Kudo["tag"][] = ["impact", "craft", "teamwork", "courage", "kindness"];
export type StrengthTag = (typeof STRENGTH_TAGS)[number];

export interface StrengthPoint { tag: StrengthTag; value: number }

export function strengthRadarFor(employeeId: string): StrengthPoint[] {
  const kudosIn = kudosSeed.filter(k => k.toId === employeeId);
  const maxScore = STRENGTH_TAGS.reduce((acc, t) => {
    const score = kudosIn.filter(k => k.tag === t).reduce((a, k) => a + k.amount, 0);
    return Math.max(acc, score);
  }, 1);
  return STRENGTH_TAGS.map(tag => {
    const score = kudosIn.filter(k => k.tag === tag).reduce((a, k) => a + k.amount, 0);
    return { tag, value: Math.round((score / Math.max(1, maxScore)) * 100) };
  });
}

// ── Activity streak (consecutive weeks w/ any growth activity) ─────────
export function activityStreakWeeks(employeeId: string): number {
  // Sources with dates
  const dates: Date[] = [];
  kudosSeed.filter(k => k.toId === employeeId || k.fromId === employeeId)
    .forEach(k => dates.push(new Date(k.date)));
  focusSessionsSeed.filter(f => f.employeeId === employeeId)
    .forEach(f => dates.push(new Date(f.date)));
  oneOnOnesSeed.filter(o => o.employeeId === employeeId)
    .forEach(o => dates.push(new Date(o.date)));
  growthNotesSeed.filter(n => n.employeeId === employeeId)
    .forEach(n => dates.push(new Date(n.createdAt)));
  if (dates.length === 0) return 0;

  const weekKey = (d: Date) => {
    const tmp = new Date(d);
    tmp.setHours(0, 0, 0, 0);
    const diff = (tmp.getDay() + 6) % 7;
    tmp.setDate(tmp.getDate() - diff);
    return tmp.toISOString().slice(0, 10);
  };
  const weeks = new Set(dates.map(weekKey));
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 26; i++) {
    if (weeks.has(weekKey(cursor))) streak++;
    else if (streak > 0) break;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

// ── Summary used by Team dashboard ─────────────────────────────────────
export interface GrowthSummary {
  employee: Employee;
  xp: XpBreakdown;
  level: Level;
  next?: Level;
  progressPct: number;
  streak: number;
  kudosReceived: number;
  goalsHit: number;
  goalsActive: number;
  challengesDone: number;
  challengesOpen: number;
  badgesEarned: number;
  lastActivityAt?: string;
}

export function growthSummaryFor(employeeId: string): GrowthSummary | null {
  const employee = employees.find(e => e.id === employeeId);
  if (!employee) return null;
  const xp = computeXp(employeeId);
  const lvl = levelFromXp(xp.total);
  const streak = activityStreakWeeks(employeeId);
  const kudosReceived = kudosSeed.filter(k => k.toId === employeeId).length;
  const goals = goalsSeed.filter(g => g.employeeId === employeeId);
  const challenges = challengesSeed.filter(c => c.employeeId === employeeId);
  const badges = badgesFor(employeeId);

  // last activity
  const dates: string[] = [];
  kudosSeed.filter(k => k.toId === employeeId).forEach(k => dates.push(k.date));
  focusSessionsSeed.filter(f => f.employeeId === employeeId).forEach(f => dates.push(f.date));
  oneOnOnesSeed.filter(o => o.employeeId === employeeId).forEach(o => dates.push(o.date));
  const lastActivityAt = dates.sort().at(-1);

  return {
    employee,
    xp,
    level: lvl.level,
    next: lvl.next,
    progressPct: lvl.progressPct,
    streak,
    kudosReceived,
    goalsHit: goals.filter(g => g.status === "hit").length,
    goalsActive: goals.filter(g => g.status === "active").length,
    challengesDone: challenges.filter(c => c.status === "succeeded").length,
    challengesOpen: challenges.filter(c => c.status === "open").length,
    badgesEarned: badges.filter(b => b.earned).length,
    lastActivityAt,
  };
}

export function allGrowthSummaries(): GrowthSummary[] {
  return employees
    .map(e => growthSummaryFor(e.id))
    .filter((s): s is GrowthSummary => s !== null)
    .sort((a, b) => b.xp.total - a.xp.total);
}

// ── Leaderboard (XP earned inside a date window) ───────────────────────
function inRange(d: string, from: Date, to: Date) {
  const t = new Date(d).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

export function xpInRange(employeeId: string, from: Date, to: Date): number {
  const kudos = kudosSeed
    .filter(k => k.toId === employeeId && inRange(k.date, from, to))
    .reduce((a, k) => a + k.amount, 0);
  const focus = focusSessionsSeed
    .filter(f => f.employeeId === employeeId && inRange(f.date, from, to))
    .length * 5;
  const challenges = challengesSeed
    .filter(c => c.employeeId === employeeId && c.status === "succeeded" && inRange(c.dueAt, from, to))
    .reduce((a, c) => a + c.xpReward, 0);
  const goals = goalsSeed
    .filter(g => g.employeeId === employeeId && g.status === "hit" && inRange(g.dueAt, from, to))
    .length * 100;
  const oneOnOnes = oneOnOnesSeed
    .filter(o => o.employeeId === employeeId && inRange(o.date, from, to))
    .length * 10;
  return kudos + focus + challenges + goals + oneOnOnes;
}

export interface LeaderboardEntry {
  employee: Employee;
  xp: number;
  rank: number;
  kudos: number;
  focusSessions: number;
}

/** `now` is overridable for testing; defaults to today. */
export function leaderboard(period: SeasonalPeriod, now: Date = new Date()): LeaderboardEntry[] {
  const to = new Date(now);
  const from = new Date(now);
  if (period === "weekly") {
    // ISO week starting Monday
    const dow = (from.getDay() + 6) % 7;
    from.setDate(from.getDate() - dow);
    from.setHours(0, 0, 0, 0);
  } else if (period === "monthly") {
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
  } else {
    from.setMonth(0, 1);
    from.setHours(0, 0, 0, 0);
  }

  return employees
    .map(e => ({
      employee: e,
      xp: xpInRange(e.id, from, to),
      kudos: kudosSeed.filter(k => k.toId === e.id && inRange(k.date, from, to)).length,
      focusSessions: focusSessionsSeed.filter(f => f.employeeId === e.id && inRange(f.date, from, to)).length,
    }))
    .sort((a, b) => b.xp - a.xp)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export function seasonalChallengesFor(period: SeasonalPeriod): SeasonalChallenge[] {
  return seasonalChallengesSeed.filter(c => c.period === period);
}

// ── Selectors per employee for profile view ────────────────────────────
export function goalsFor(employeeId: string): Goal[] {
  return goalsSeed.filter(g => g.employeeId === employeeId);
}
export function challengesFor(employeeId: string): Challenge[] {
  return challengesSeed.filter(c => c.employeeId === employeeId);
}
export function oneOnOnesFor(employeeId: string): OneOnOne[] {
  return oneOnOnesSeed
    .filter(o => o.employeeId === employeeId)
    .sort((a, b) => b.date.localeCompare(a.date));
}
export function notesFor(employeeId: string): GrowthNote[] {
  return growthNotesSeed
    .filter(n => n.employeeId === employeeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
