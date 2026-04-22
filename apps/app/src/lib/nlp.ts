import { addDays, format, nextFriday, nextMonday, parseISO, startOfDay, subDays } from "date-fns";
import { commesse, employees, leaveRequests, expenses } from "./mock-data";

export type IntentKind =
  | "log-hours"
  | "book-leave"
  | "approve-expense"
  | "add-employee"
  | "fill-missing"
  | "open-autofill"
  | "navigate";

export interface ParsedIntent {
  kind: IntentKind;
  verb: string;
  label: string; // headline rendered in the palette
  detail: string; // one-line explanation
  args: Record<string, string | number | boolean>;
  confidence: number; // 0..1
}

const WORKDAYS = [1, 2, 3, 4, 5]; // Mon..Fri

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

// ── date phrase resolver ───────────────────────────────────────────────
function resolveDate(raw: string, today = new Date()): Date | null {
  const s = normalize(raw);
  if (!s) return null;
  if (s === "today") return startOfDay(today);
  if (s === "yesterday") return subDays(today, 1);
  if (s === "tomorrow") return addDays(today, 1);

  const nextDay: Record<string, (d: Date) => Date> = {
    "next monday": nextMonday,
    "next friday": nextFriday,
  };
  if (nextDay[s]) return nextDay[s](today);

  const weekdayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  if (weekdayMap[s] !== undefined) {
    const target = weekdayMap[s];
    const diff = (target - today.getDay() + 7) % 7 || 7;
    return addDays(today, diff);
  }

  // ISO date fallback
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    try {
      return parseISO(s);
    } catch {
      return null;
    }
  }
  return null;
}

// ── duration parser: "4h", "4h 30m", "0.5h", "90m" ─────────────────────
function parseHours(s: string): number | null {
  const m = s.match(/(\d+(?:\.\d+)?)\s*h(?:\s*(\d+)\s*m)?/);
  if (m) {
    const hours = parseFloat(m[1]);
    const mins = m[2] ? parseInt(m[2], 10) / 60 : 0;
    return hours + mins;
  }
  const mm = s.match(/(\d+)\s*m(?:in)?s?/);
  if (mm) return parseInt(mm[1], 10) / 60;
  return null;
}

function parseDayCount(s: string): number | null {
  const m = s.match(/(\d+(?:\.\d+)?)\s*(?:day|days|d)\b/);
  return m ? parseFloat(m[1]) : null;
}

// ── fuzzy match helpers ────────────────────────────────────────────────
function bestCommessa(q: string) {
  const s = normalize(q);
  let best: { id: string; score: number } | null = null;
  for (const c of commesse) {
    const haystack = `${c.code} ${c.name} ${c.client}`.toLowerCase();
    if (haystack.includes(s)) {
      const score = s.length / haystack.length;
      if (!best || score > best.score) best = { id: c.id, score };
      continue;
    }
    const tokens = s.split(/\s+/).filter(Boolean);
    const hits = tokens.filter((t) => haystack.includes(t)).length;
    if (hits > 0) {
      const score = (hits / tokens.length) * 0.6;
      if (!best || score > best.score) best = { id: c.id, score };
    }
  }
  return best;
}

function bestEmployee(q: string) {
  const s = normalize(q);
  if (!s) return null;
  let best: { id: string; score: number } | null = null;
  for (const e of employees) {
    const name = e.name.toLowerCase();
    if (name.includes(s)) {
      const score = s.length / name.length;
      if (!best || score > best.score) best = { id: e.id, score };
      continue;
    }
    const first = name.split(" ")[0];
    if (first === s) return { id: e.id, score: 1 };
  }
  return best;
}

// ── intent matchers ────────────────────────────────────────────────────
export function parseCommand(input: string, opts: { today?: Date } = {}): ParsedIntent[] {
  const raw = input.trim();
  if (!raw) return [];
  const s = normalize(raw);
  const today = opts.today ?? new Date();
  const out: ParsedIntent[] = [];

  // log-hours: "4h migration yesterday", "log 6h acm today"
  const hours = parseHours(s);
  if (hours && hours > 0 && hours <= 24) {
    const dateTokens = [
      "today",
      "yesterday",
      "tomorrow",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const hitDate = dateTokens.find((t) => s.includes(t));
    const date = hitDate ? resolveDate(hitDate, today) : today;
    const rest = s
      .replace(/\d+(?:\.\d+)?\s*h(\s*\d+\s*m)?/g, "")
      .replace(/\d+\s*m(?:in)?s?/g, "")
      .replace(/\b(log|add|yesterday|today|tomorrow|for|on|against|to|hours?)\b/g, " ")
      .replace(new RegExp(`\\b(${dateTokens.join("|")})\\b`, "g"), " ")
      .trim();
    const match = rest ? bestCommessa(rest) : null;
    out.push({
      kind: "log-hours",
      verb: "Log hours",
      label: `Log ${hours}h to ${match ? commesse.find((c) => c.id === match.id)!.code : commesse[0].code}`,
      detail: `${date ? format(date, "EEE, MMM d") : "today"} · ${rest || "draft description"}`,
      args: {
        hours,
        date: format(date ?? today, "yyyy-MM-dd"),
        commessaId: match?.id ?? commesse[0].id,
        description: rest || "Logged via quick command",
      },
      confidence: 0.7 + (match ? 0.2 : 0),
    });
  }

  // book-leave: "book friday off", "vacation 3 days next monday"
  if (
    /\b(book|take|request)\b.*\b(off|leave|vacation|sick|personal)\b/.test(s) ||
    /\b(off|leave)\b/.test(s)
  ) {
    const dateTokens = [
      "today",
      "tomorrow",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
      "next monday",
      "next friday",
    ];
    const hit = dateTokens.find((t) => s.includes(t));
    const date = hit ? resolveDate(hit, today) : today;
    const days = parseDayCount(s) ?? 1;
    const type = /\bsick\b/.test(s)
      ? "Sick"
      : /\bpersonal\b/.test(s)
        ? "Personal"
        : /\bparental\b/.test(s)
          ? "Parental"
          : "Vacation";
    out.push({
      kind: "book-leave",
      verb: "Book leave",
      label: `Request ${days} day${days === 1 ? "" : "s"} ${type.toLowerCase()}`,
      detail: date ? `Starting ${format(date, "EEE, MMM d")}` : "Starting today",
      args: {
        type,
        days,
        from: format(date ?? today, "yyyy-MM-dd"),
      },
      confidence: 0.75,
    });
  }

  // approve-expense: "approve emma expense", "approve 184"
  if (/\bapprove\b/.test(s)) {
    const money = s.match(/\$?(\d+(?:\.\d+)?)/);
    const target = s
      .replace(/\bapprove\b/, "")
      .replace(/\bexpense[s]?\b/, "")
      .replace(/\$?\d+(?:\.\d+)?/, "")
      .trim();
    const emp = target ? bestEmployee(target) : null;
    const match = emp
      ? expenses.find((x) => x.employeeId === emp.id && x.status === "pending")
      : money
        ? expenses.find(
            (x) => x.status === "pending" && Math.abs(x.amount - parseFloat(money[1])) < 1,
          )
        : expenses.find((x) => x.status === "pending");
    if (match) {
      out.push({
        kind: "approve-expense",
        verb: "Approve expense",
        label: `Approve "${match.description}"`,
        detail: `$${match.amount} · submitted ${match.date}`,
        args: { expenseId: match.id },
        confidence: 0.8,
      });
    }
  }

  // add-employee: "add emma wilson senior engineer"
  if (/\b(add|hire|onboard|new hire)\b/.test(s)) {
    const rest = s.replace(/\b(add|hire|onboard|new hire|employee)\b/g, "").trim();
    if (rest.length > 2) {
      out.push({
        kind: "add-employee",
        verb: "Add employee",
        label: `Open Add Employee for "${rest}"`,
        detail: "Pre-fills the side panel. Review and invite.",
        args: { query: rest },
        confidence: 0.6,
      });
    }
  }

  // fill-missing
  if (/\b(fill|complete)\b.*\bmissing\b/.test(s) || /\bautofill\b/.test(s)) {
    out.push({
      kind: "fill-missing",
      verb: "Fill missing",
      label: "Open bulk fill for missing weekdays",
      detail: "Bulk dialog in fill-missing mode.",
      args: {},
      confidence: 0.9,
    });
  }

  // draft week / autofill
  if (/\b(draft|generate|autofill)\b.*\b(week|timesheet)\b/.test(s)) {
    out.push({
      kind: "open-autofill",
      verb: "Draft week",
      label: "Draft this week from calendar",
      detail: "Opens AI auto-fill with a reviewable preview.",
      args: {},
      confidence: 0.9,
    });
  }

  return out.sort((a, b) => b.confidence - a.confidence);
}

// ── formatting helpers exposed to the UI ───────────────────────────────
export function formatCommessaRef(id: string): string {
  const c = commesse.find((x) => x.id === id);
  return c ? `${c.code} · ${c.name}` : id;
}

export function pendingLeaveForDate(_: string): boolean {
  return leaveRequests.some((l) => l.status === "approved");
}
