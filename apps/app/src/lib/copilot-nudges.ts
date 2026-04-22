import {
  employees,
  kudosSeed,
  oneOnOnesSeed,
  expenses as expensesSeed,
  leaveRequests,
  employeeById,
} from "./mock-data";
import { isBirthday } from "./birthday";
import {
  offices,
  roomsByOffice,
  bookings as bookingsSeed,
  officeLocalNow,
  officeLocalDate,
  closureFor,
} from "./offices";

export interface Nudge {
  id: string;
  emoji: string;
  headline: string;
  prompt: string;
  /** Higher = sort first. */
  score: number;
}

const ME = "e1";

function daysBetween(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Build 3 contextual suggestion chips for the compact Copilot empty state.
 * Pure-mock reads; safe to call on every render — memo at the call site.
 */
export function buildNudges(now: Date = new Date()): Nudge[] {
  const nudges: Nudge[] = [];

  // 1) Birthday nudge — highest priority when someone is celebrating.
  const birthdayPerson = employees.find((e) => e.id !== ME && isBirthday(e, now));
  if (birthdayPerson) {
    nudges.push({
      id: "birthday",
      emoji: "🎂",
      headline: `Wish ${birthdayPerson.name.split(" ")[0]} a happy birthday`,
      prompt: `Draft a short, warm birthday kudos for ${birthdayPerson.name}.`,
      score: 100,
    });
  }

  // 2) Stale 1:1 — find a direct report/report whose last 1:1 is > 30 days ago.
  const onesByEmployee = new Map<string, Date>();
  for (const o of oneOnOnesSeed) {
    const d = new Date(o.date);
    const prev = onesByEmployee.get(o.employeeId);
    if (!prev || d > prev) onesByEmployee.set(o.employeeId, d);
  }
  const candidates = employees.filter((e) => e.manager && e.id !== ME);
  const stale = candidates
    .map((e) => {
      const last = onesByEmployee.get(e.id);
      const days = last ? daysBetween(now, last) : 180;
      return { e, days };
    })
    .sort((a, b) => b.days - a.days);
  if (stale[0]) {
    const { e, days } = stale[0];
    nudges.push({
      id: "one-on-one",
      emoji: "💬",
      headline: `Schedule 1:1 with ${e.name.split(" ")[0]} — ${days}d since last`,
      prompt: `Propose 3 agenda topics for a 1:1 with ${e.name} based on their recent goals, kudos, and action items.`,
      score: Math.min(90, 30 + days / 3),
    });
  }

  // 3) Pending approvals — expenses under $100 or leaves awaiting decision.
  const smallExpenses = expensesSeed.filter((x) => x.status === "pending" && x.amount < 100).length;
  const totalSmall = expensesSeed.filter((x) => x.status === "pending").length;
  if (smallExpenses > 0) {
    nudges.push({
      id: "small-expenses",
      emoji: "🧾",
      headline: `Approve ${smallExpenses} expense${smallExpenses === 1 ? "" : "s"} under $100`,
      prompt: `Approve all pending expenses under $100 from this week.`,
      score: 70 + smallExpenses * 2,
    });
  } else if (totalSmall > 0) {
    nudges.push({
      id: "expenses",
      emoji: "🧾",
      headline: `Review ${totalSmall} pending expense${totalSmall === 1 ? "" : "s"}`,
      prompt: `Summarize the pending expenses and flag anything unusual.`,
      score: 60,
    });
  }

  // 4) Top kudos giver recently — suggest reciprocating.
  const recentCutoff = new Date(now);
  recentCutoff.setDate(recentCutoff.getDate() - 14);
  const givers = new Map<string, number>();
  for (const k of kudosSeed) {
    if (k.toId !== ME) continue;
    const d = new Date(k.date);
    if (d < recentCutoff) continue;
    givers.set(k.fromId, (givers.get(k.fromId) ?? 0) + k.amount);
  }
  const topGiver = [...givers.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topGiver) {
    const giver = employeeById(topGiver[0]);
    if (giver) {
      nudges.push({
        id: "reciprocate-kudos",
        emoji: "💐",
        headline: `Send kudos back to ${giver.name.split(" ")[0]}`,
        prompt: `Draft a kudos message thanking ${giver.name} for recent support. Pick a fitting tag.`,
        score: 55,
      });
    }
  }

  // 5) Pending leave approvals (as HR persona).
  const pendingLeaves = leaveRequests.filter((l) => l.status === "pending").length;
  if (pendingLeaves > 0) {
    nudges.push({
      id: "leaves",
      emoji: "🌴",
      headline: `${pendingLeaves} leave request${pendingLeaves === 1 ? "" : "s"} awaiting you`,
      prompt: `List the pending leave requests and flag any coverage risks.`,
      score: 50 + pendingLeaves,
    });
  }

  // 6) Rooms free right now at the office with most availability.
  const nowToMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const availability = offices
    .map((o) => {
      const today = officeLocalDate(o, now);
      if (closureFor("office", o.id, today)) return null;
      const localNow = nowToMin(officeLocalNow(o, now));
      const [oh, om] = o.openingHours.open.split(":").map(Number);
      const [ch, cm] = o.openingHours.close.split(":").map(Number);
      if (localNow < oh * 60 + om || localNow >= ch * 60 + cm) return null;
      const rooms = roomsByOffice(o.id);
      const free = rooms.filter((r) => {
        if (closureFor("room", r.id, today)) return false;
        const occupied = bookingsSeed.some((b) => {
          if (b.resourceId !== r.id || b.date !== today || b.status === "cancelled") return false;
          return localNow >= nowToMin(b.startTime) && localNow < nowToMin(b.endTime);
        });
        return !occupied;
      }).length;
      return { office: o, free, total: rooms.length };
    })
    .filter((x): x is NonNullable<typeof x> => !!x && x.total > 0)
    .sort((a, b) => b.free / b.total - a.free / a.total);
  const topAvail = availability[0];
  if (topAvail && topAvail.free > 0) {
    nudges.push({
      id: "rooms-free-now",
      emoji: "🚪",
      headline: `${topAvail.free} room${topAvail.free === 1 ? "" : "s"} free at ${topAvail.office.name} now`,
      prompt: `Which rooms are free right now at ${topAvail.office.name}? Suggest the best one for a 30-min call.`,
      score: 45 + topAvail.free * 2,
    });
  }

  // Sort and keep top 3, deduping by headline.
  return nudges.sort((a, b) => b.score - a.score).slice(0, 3);
}
