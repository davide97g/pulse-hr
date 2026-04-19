import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, Gift, Flame, Trophy, ChevronLeft, ChevronRight, X, Target,
  Heart, Crown,
} from "lucide-react";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { NewBadge } from "@/components/app/NewBadge";
import { BirthdayHalo } from "@/components/app/BirthdayHalo";
import { strengthColor } from "@/lib/colors";
import {
  employees, employeeById, kudosSeed, focusSessionsSeed, goalsSeed,
  pulseEntries, type Kudo, type Vibe,
} from "@/lib/mock-data";
import { leaderboard } from "@/lib/growth";
import { isBirthday } from "@/lib/birthday";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/moments")({
  head: () => ({ meta: [{ title: "Moments — Pulse HR" }] }),
  component: Moments,
});

type SlideKind = "birthday" | "kudos" | "focus" | "goal" | "podium" | "vibe";

interface Slide {
  kind: SlideKind;
  title: string;
  kicker: string;
  emoji: string;
  confetti: boolean;
}

function withinDays(iso: string, days: number, now: Date) {
  const d = new Date(iso);
  return (now.getTime() - d.getTime()) / 86400000 <= days;
}

const VIBE_EMOJI: Record<Vibe, string> = {
  amazing: "🔥",
  good: "🙂",
  meh: "😐",
  rough: "😵‍💫",
};

function Moments() {
  const nav = useNavigate();
  const now = useMemo(() => new Date(), []);

  // ── pick content ───────────────────────────────────────────────────
  const birthdayPerson = useMemo(
    () => employees.find(e => isBirthday(e, now)),
    [now],
  );

  const heroKudo = useMemo<Kudo | null>(() => {
    const recent = kudosSeed.filter(k => withinDays(k.date, 7, now));
    if (recent.length === 0) return null;
    return [...recent].sort((a, b) => b.amount - a.amount)[0];
  }, [now]);

  const focusChamp = useMemo(() => {
    const counts = new Map<string, number>();
    focusSessionsSeed
      .filter(f => withinDays(f.date, 7, now))
      .forEach(f => counts.set(f.employeeId, (counts.get(f.employeeId) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!top) return null;
    const emp = employeeById(top[0]);
    return emp ? { employee: emp, sessions: top[1] } : null;
  }, [now]);

  const recentGoalHit = useMemo(() => {
    const hits = goalsSeed
      .filter(g => g.status === "hit")
      .sort((a, b) => b.dueAt.localeCompare(a.dueAt));
    if (hits.length === 0) return null;
    const g = hits[0];
    return { goal: g, employee: employeeById(g.employeeId) };
  }, []);

  const podium = useMemo(() => leaderboard("weekly", now).slice(0, 3), [now]);

  const teamVibe = useMemo(() => {
    const score: Record<Vibe, number> = { amazing: 4, good: 3, meh: 2, rough: 1 };
    const recent = pulseEntries.filter(p => withinDays(p.date, 7, now));
    if (recent.length === 0) return null;
    const avg = recent.reduce((a, p) => a + score[p.vibe], 0) / recent.length;
    const label: Vibe =
      avg >= 3.5 ? "amazing" :
      avg >= 2.8 ? "good" :
      avg >= 1.8 ? "meh" : "rough";
    return { label, count: recent.length, avg: avg.toFixed(2) };
  }, [now]);

  const slides: Slide[] = [];
  if (birthdayPerson) slides.push({
    kind: "birthday",
    title: `Happy birthday, ${birthdayPerson.name.split(" ")[0]}!`,
    kicker: "Today's celebration",
    emoji: "🎂",
    confetti: true,
  });
  if (heroKudo) slides.push({
    kind: "kudos",
    title: "Kudos of the week",
    kicker: "Biggest boost received",
    emoji: "💐",
    confetti: true,
  });
  if (focusChamp) slides.push({
    kind: "focus",
    title: "Focus champion",
    kicker: "Deepest work streak",
    emoji: "🎯",
    confetti: false,
  });
  if (recentGoalHit) slides.push({
    kind: "goal",
    title: "Goal hit",
    kicker: "Target cleared",
    emoji: "🏁",
    confetti: true,
  });
  if (podium.length > 0) slides.push({
    kind: "podium",
    title: "This week's podium",
    kicker: "XP leaderboard",
    emoji: "🏆",
    confetti: true,
  });
  if (teamVibe) slides.push({
    kind: "vibe",
    title: `Team vibe — ${teamVibe.label}`,
    kicker: "Pulse this week",
    emoji: VIBE_EMOJI[teamVibe.label],
    confetti: teamVibe.label === "amazing",
  });

  // ── navigation ─────────────────────────────────────────────────────
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  useEffect(() => {
    if (paused || total <= 1) return;
    const t = setTimeout(() => setIdx(i => (i + 1) % total), 5200);
    return () => clearTimeout(t);
  }, [idx, paused, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % total);
      else if (e.key === "ArrowLeft") setIdx(i => (i - 1 + total) % total);
      else if (e.key === " ") { e.preventDefault(); setPaused(p => !p); }
      else if (e.key === "Escape") nav({ to: "/" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total, nav]);

  if (total === 0) {
    return (
      <div className="p-10 max-w-2xl mx-auto text-center fade-in">
        <PageHeader title={<><span>Moments</span><NewBadge /></>} description="A curated weekly reel of team highlights." />
        <div className="rounded-lg border p-10 bg-card">
          <Sparkles className="h-8 w-8 mx-auto text-primary" />
          <div className="mt-3 font-display text-lg">Not much to celebrate yet</div>
          <div className="text-sm text-muted-foreground mt-1">
            Send some kudos, hit a goal, or log a focus session — check back in a few days.
          </div>
        </div>
      </div>
    );
  }

  const slide = slides[idx];

  return (
    <div
      className="relative min-h-[calc(100vh-56px)] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* backdrop gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(1000px 600px at 20% 10%, oklch(0.72 0.17 295 / 0.15), transparent 65%)," +
            "radial-gradient(800px 500px at 85% 80%, oklch(0.78 0.18 130 / 0.12), transparent 60%)",
        }}
      />
      {slide.confetti && <ConfettiBurst key={idx} />}

      <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-md grid place-items-center bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="font-display text-xl leading-tight flex items-center gap-2">
              Moments <NewBadge />
            </div>
            <div className="text-[11px] text-muted-foreground">
              Weekly highlights reel · ← → navigate · Space pause · Esc close
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === idx ? "w-8 bg-primary" : "w-4 bg-muted hover:bg-muted-foreground/30",
                )}
              />
            ))}
            <Link
              to="/"
              className="ml-2 h-8 w-8 rounded-md grid place-items-center hover:bg-muted press-scale"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div
          key={idx}
          className="relative rounded-2xl border bg-card overflow-hidden iridescent-border pop-in"
          style={{ minHeight: 480 }}
        >
          <div
            className="absolute -top-24 -right-24 h-80 w-80 rounded-full blur-3xl pointer-events-none"
            style={{ background: slideTint(slide.kind), opacity: 0.3 }}
            aria-hidden
          />
          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
              <span className="text-lg leading-none">{slide.emoji}</span>
              {slide.kicker}
            </div>
            <div className="font-display text-4xl md:text-5xl leading-[1.05] mt-3 mb-6">
              {slide.title}
            </div>
            <SlideBody slide={slide} ctx={{ birthdayPerson, heroKudo, focusChamp, recentGoalHit, podium, teamVibe }} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setIdx(i => (i - 1 + total) % total)}
            className="h-10 px-3 rounded-md border hover:bg-muted press-scale inline-flex items-center gap-1.5 text-sm"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <div className="text-xs text-muted-foreground tabular-nums">
            {idx + 1} / {total} {paused && "· paused"}
          </div>
          <button
            onClick={() => setIdx(i => (i + 1) % total)}
            className="h-10 px-3 rounded-md border hover:bg-muted press-scale inline-flex items-center gap-1.5 text-sm"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function slideTint(kind: SlideKind): string {
  switch (kind) {
    case "birthday": return "oklch(0.75 0.2 85)";
    case "kudos":    return "oklch(0.65 0.18 340)";
    case "focus":    return "oklch(0.78 0.18 130)";
    case "goal":     return "oklch(0.6 0.16 220)";
    case "podium":   return "oklch(0.82 0.17 85)";
    case "vibe":     return "oklch(0.7 0.15 30)";
  }
}

function SlideBody({
  slide, ctx,
}: {
  slide: Slide;
  ctx: {
    birthdayPerson: ReturnType<typeof employees.find>;
    heroKudo: Kudo | null;
    focusChamp: { employee: ReturnType<typeof employeeById>; sessions: number } | null;
    recentGoalHit: { goal: typeof goalsSeed[number]; employee: ReturnType<typeof employeeById> } | null;
    podium: ReturnType<typeof leaderboard>;
    teamVibe: { label: Vibe; count: number; avg: string } | null;
  };
}) {
  if (slide.kind === "birthday" && ctx.birthdayPerson) {
    const p = ctx.birthdayPerson;
    return (
      <div className="flex items-center gap-6 flex-wrap">
        <BirthdayHalo initials={p.initials} color={p.avatarColor} size={120} active />
        <div>
          <div className="text-xl font-semibold">{p.name}</div>
          <div className="text-sm text-muted-foreground">{p.role} · {p.department}</div>
          <div className="mt-4">
            <Link
              to="/kudos"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-primary text-primary-foreground press-scale hover:bg-primary/90 text-sm font-medium"
            >
              <Gift className="h-4 w-4" /> Send birthday kudos
            </Link>
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            Birthday kudos carry a +25% XP boost today.
          </div>
        </div>
      </div>
    );
  }
  if (slide.kind === "kudos" && ctx.heroKudo) {
    const k = ctx.heroKudo;
    const from = employeeById(k.fromId);
    const to = employeeById(k.toId);
    if (!from || !to) return null;
    const color = strengthColor(k.tag);
    return (
      <div className="grid md:grid-cols-[auto_1fr] gap-6 items-start">
        <div className="flex items-center gap-2">
          <Avatar initials={from.initials} color={from.avatarColor} size={56} employeeId={from.id} />
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
          <Avatar initials={to.initials} color={to.avatarColor} size={72} employeeId={to.id} />
        </div>
        <div className="min-w-0">
          <div className="text-sm">
            <span className="font-medium">{from.name}</span>
            <span className="text-muted-foreground"> → </span>
            <span className="font-medium">{to.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {k.tag}
            </span>
            <span className="font-mono text-sm tabular-nums text-primary">+{k.amount} 🪙</span>
            <span className="text-xs text-muted-foreground ml-auto tabular-nums">{k.date}</span>
          </div>
          <blockquote className="mt-4 text-lg italic leading-snug border-l-4 pl-4" style={{ borderColor: color }}>
            "{k.message}"
          </blockquote>
        </div>
      </div>
    );
  }
  if (slide.kind === "focus" && ctx.focusChamp?.employee) {
    const emp = ctx.focusChamp.employee;
    return (
      <div className="flex items-center gap-6 flex-wrap">
        <Avatar initials={emp.initials} color={emp.avatarColor} size={96} employeeId={emp.id} />
        <div>
          <div className="text-xl font-semibold">{emp.name}</div>
          <div className="text-sm text-muted-foreground">{emp.role}</div>
          <div className="inline-flex items-center gap-1.5 text-sm text-warning mt-3 font-medium">
            <Flame className="h-4 w-4" /> {ctx.focusChamp.sessions} focus sessions this week
          </div>
          <div className="text-[11px] text-muted-foreground mt-2">
            Deep-work minutes add up to real XP. Try a 90-minute session today.
          </div>
        </div>
      </div>
    );
  }
  if (slide.kind === "goal" && ctx.recentGoalHit) {
    const g = ctx.recentGoalHit.goal;
    const emp = ctx.recentGoalHit.employee;
    return (
      <div className="space-y-4">
        {emp && (
          <div className="flex items-center gap-3">
            <Avatar initials={emp.initials} color={emp.avatarColor} size={40} employeeId={emp.id} />
            <div>
              <div className="text-sm font-medium">{emp.name}</div>
              <div className="text-[11px] text-muted-foreground">{emp.role}</div>
            </div>
          </div>
        )}
        <div className="rounded-lg border bg-success/5 border-success/30 p-5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{g.quarter}</div>
          <div className="text-lg font-semibold mt-1">{g.title}</div>
          <div className="text-sm text-muted-foreground mt-0.5">{g.metric} · target {g.target}</div>
          <div className="flex items-center gap-3 mt-3 text-sm">
            <Target className="h-4 w-4 text-success" />
            <span className="font-mono tabular-nums">{g.progress}%</span>
            <span className="text-muted-foreground">· closed {g.dueAt}</span>
          </div>
        </div>
      </div>
    );
  }
  if (slide.kind === "podium" && ctx.podium.length > 0) {
    const tints = ["oklch(0.82 0.17 85)", "oklch(0.78 0.03 250)", "oklch(0.68 0.14 50)"];
    return (
      <div className="grid grid-cols-3 gap-4 items-end">
        {ctx.podium.map((row, i) => (
          <div key={row.employee.id} className="text-center">
            <div
              className="relative inline-block rounded-full p-1 mb-2"
              style={{
                background: `conic-gradient(from 0deg, ${tints[i]}, color-mix(in oklch, ${tints[i]} 50%, transparent), ${tints[i]})`,
              }}
            >
              <div className="bg-card rounded-full p-0.5">
                <Avatar initials={row.employee.initials} color={row.employee.avatarColor} size={i === 0 ? 72 : 56} employeeId={row.employee.id} />
              </div>
              <div
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full grid place-items-center text-base border-2 border-card"
                style={{ backgroundColor: tints[i] }}
              >
                {i === 0 ? <Crown className="h-4 w-4 text-white" /> : i + 1}
              </div>
            </div>
            <div className="text-sm font-semibold truncate">{row.employee.name}</div>
            <div className="font-mono text-xl tabular-nums mt-1" style={{ color: tints[i] }}>
              +{row.xp.toLocaleString()} XP
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (slide.kind === "vibe" && ctx.teamVibe) {
    return (
      <div className="flex items-center gap-6 flex-wrap">
        <div className="text-7xl leading-none">{VIBE_EMOJI[ctx.teamVibe.label]}</div>
        <div>
          <div className="text-xl font-semibold capitalize">{ctx.teamVibe.label}</div>
          <div className="text-sm text-muted-foreground">
            Based on {ctx.teamVibe.count} pulse check-ins this week · avg {ctx.teamVibe.avg}/4
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-primary">
            <Heart className="h-3.5 w-3.5" /> <Link to="/pulse" className="hover:underline">Open Team Pulse →</Link>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function ConfettiBurst() {
  const palette = ["#b4ff39", "#39e1ff", "#c06bff", "#ff6b9a", "#ffd939"];
  const pieces = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    dx: (Math.random() - 0.5) * 600,
    color: palette[i % palette.length],
    delay: Math.random() * 0.3,
  }));
  return (
    <div className="absolute inset-x-0 top-10 pointer-events-none flex justify-center" aria-hidden>
      <div className="relative h-0 w-0">
        {pieces.map(p => (
          <span
            key={p.id}
            className="confetti-piece"
            style={{
              backgroundColor: p.color,
              ["--dx" as never]: `${p.dx}px`,
              animationDelay: `${p.delay}s`,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
