import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  TrendingUp,
  User,
  Users,
  Flame,
  Trophy,
  Target,
  Zap,
  Award,
  Sparkles,
  MessageCircle,
  StickyNote,
  CheckCircle2,
  XCircle,
  Circle,
  Clock,
  Gift,
  Crown,
  Medal,
  CalendarDays,
  CalendarRange,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeader, Avatar, StatusBadge } from "@/components/app/AppShell";
import { EmployeeScoreBadge } from "@/components/score/EmployeeScoreBadge";
import { EmployeeHoverCard } from "@/components/score/EmployeeHoverCard";
import { NewBadge } from "@/components/app/NewBadge";
import { StrengthsRadar } from "@/components/app/StrengthsRadar";
import { StatTile, MiniStat } from "@/components/app/StatTiles";
import { BirthdayHalo } from "@/components/app/BirthdayHalo";
import { isBirthday } from "@/lib/birthday";
import {
  allGrowthSummaries,
  growthSummaryFor,
  badgesFor,
  strengthRadarFor,
  goalsFor,
  challengesFor,
  oneOnOnesFor,
  notesFor,
  leaderboard,
  seasonalChallengesFor,
  type GrowthSummary,
  type StrengthTag,
  type LeaderboardEntry,
} from "@/lib/growth";
import {
  employeeById,
  kudosSeed,
  type Goal,
  type Challenge,
  type OneOnOne,
  type GrowthNote,
  type Kudo,
  type SeasonalPeriod,
  type SeasonalChallenge,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useUrlParam } from "@/lib/useUrlParam";

const ME = "e1";

interface GrowthSearch {
  employee?: string;
  view?: "team" | "me";
  tab?: "leaderboard" | "team";
  pane?: string;
}

export const Route = createFileRoute("/growth")({
  head: () => ({ meta: [{ title: "Growth — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): GrowthSearch => ({
    employee: typeof s.employee === "string" ? s.employee : undefined,
    view: s.view === "me" || s.view === "team" ? s.view : undefined,
    tab: s.tab === "leaderboard" || s.tab === "team" ? s.tab : undefined,
    pane: typeof s.pane === "string" ? s.pane : undefined,
  }),
  component: Growth,
});

function Growth() {
  const nav = useNavigate({ from: "/growth" });
  const search = useSearch({ from: "/growth" });
  const view: "team" | "me" = search.view ?? "team";
  const focusEmployee = search.employee ?? null;
  const teamTab: "leaderboard" | "team" = search.tab ?? "leaderboard";

  const setView = (v: "team" | "me") =>
    nav({ search: { view: v === "team" ? undefined : v, employee: undefined, tab: undefined } });
  const setFocusEmployee = (id: string | null) =>
    nav({ search: (prev) => ({ ...prev, employee: id ?? undefined }) });
  const setTeamTab = (t: string) =>
    nav({ search: (prev) => ({ ...prev, tab: t === "leaderboard" ? undefined : (t as "team") }) });

  // Effective subject: Me view shows ME; Team view opens a drill-down.
  const subjectId = view === "me" ? ME : focusEmployee;
  const summaries = useMemo(() => allGrowthSummaries(), []);
  const subject = subjectId ? growthSummaryFor(subjectId) : null;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title={
          <>
            <span>Growth</span>
            <NewBadge />
          </>
        }
        description="Track progress, goals, challenges and 1:1s. Kudos and focus sessions roll up into XP and badges."
        actions={
          <div className="inline-flex rounded-md border p-0.5 bg-background">
            <button
              onClick={() => {
                setView("team");
                setFocusEmployee(null);
              }}
              className={cn(
                "px-3 h-8 text-xs rounded-sm inline-flex items-center gap-1.5 press-scale",
                view === "team"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="h-3.5 w-3.5" /> Team
            </button>
            <button
              onClick={() => {
                setView("me");
                setFocusEmployee(null);
              }}
              className={cn(
                "px-3 h-8 text-xs rounded-sm inline-flex items-center gap-1.5 press-scale",
                view === "me"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <User className="h-3.5 w-3.5" /> Me
            </button>
          </div>
        }
      />

      {subject ? (
        <>
          {view === "team" && (
            <button
              onClick={() => setFocusEmployee(null)}
              className="text-xs text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 press-scale"
            >
              ← Back to team grid
            </button>
          )}
          <GrowthProfile summary={subject} />
        </>
      ) : (
        <TeamGrid
          summaries={summaries}
          onPick={(id) => setFocusEmployee(id)}
          tab={teamTab}
          onTabChange={setTeamTab}
        />
      )}
    </div>
  );
}

// ─── Team grid ─────────────────────────────────────────────────────────
function TeamGrid({
  summaries,
  onPick,
  tab,
  onTabChange,
}: {
  summaries: GrowthSummary[];
  onPick: (id: string) => void;
  tab: "leaderboard" | "team";
  onTabChange: (v: string) => void;
}) {
  const totals = useMemo(
    () => ({
      xp: summaries.reduce((a, s) => a + s.xp.total, 0),
      activeGoals: summaries.reduce((a, s) => a + s.goalsActive, 0),
      openChallenges: summaries.reduce((a, s) => a + s.challengesOpen, 0),
      kudos: summaries.reduce((a, s) => a + s.kudosReceived, 0),
    }),
    [summaries],
  );

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 stagger-in">
        <StatTile
          icon={<Zap className="h-4 w-4" />}
          label="Total XP this quarter"
          value={totals.xp.toLocaleString()}
          accent
        />
        <StatTile
          icon={<Target className="h-4 w-4" />}
          label="Active goals"
          value={`${totals.activeGoals}`}
        />
        <StatTile
          icon={<Trophy className="h-4 w-4" />}
          label="Open challenges"
          value={`${totals.openChallenges}`}
        />
        <StatTile
          icon={<Gift className="h-4 w-4" />}
          label="Kudos received"
          value={`${totals.kudos}`}
        />
      </div>

      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="leaderboard">
            <Trophy className="h-3.5 w-3.5 mr-1.5" /> Leaderboard
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Team ({summaries.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard" className="mt-4">
          <Leaderboard />
        </TabsContent>
        <TabsContent value="team" className="mt-4">
          <div className="text-[11px] text-muted-foreground mb-3 flex items-center gap-1.5">
            <Users className="h-3 w-3" /> Click a card for full profile
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger-in">
            {summaries.map((s) => (
              <TeamCard key={s.employee.id} summary={s} onPick={onPick} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

// ─── Leaderboard ───────────────────────────────────────────────────────
interface Prize {
  xp: number;
  reward: string;
  emoji: string;
  tint: string;
  label: string;
}
const PRIZES: Record<SeasonalPeriod, [Prize, Prize, Prize]> = {
  weekly: [
    {
      xp: 500,
      reward: "Shipping Sprint trophy + feature on all-hands",
      emoji: "🏆",
      tint: "oklch(0.82 0.17 85)",
      label: "Gold",
    },
    {
      xp: 250,
      reward: "Runner-up badge + coffee on the house",
      emoji: "🥈",
      tint: "oklch(0.78 0.03 250)",
      label: "Silver",
    },
    { xp: 100, reward: "Podium badge", emoji: "🥉", tint: "oklch(0.68 0.14 50)", label: "Bronze" },
  ],
  monthly: [
    {
      xp: 2000,
      reward: "$100 gift card · Legend badge · half-day off",
      emoji: "👑",
      tint: "oklch(0.82 0.17 85)",
      label: "Gold",
    },
    {
      xp: 1000,
      reward: "$50 gift card · Silver streak badge",
      emoji: "🥈",
      tint: "oklch(0.78 0.03 250)",
      label: "Silver",
    },
    { xp: 500, reward: "$25 gift card", emoji: "🥉", tint: "oklch(0.68 0.14 50)", label: "Bronze" },
  ],
  yearly: [
    {
      xp: 10000,
      reward: "$500 · engraved trophy · extra day off · Hall of Fame",
      emoji: "🏆",
      tint: "oklch(0.82 0.17 85)",
      label: "Champion",
    },
    {
      xp: 5000,
      reward: "$250 · Silver laurel · off-site seat",
      emoji: "🥈",
      tint: "oklch(0.78 0.03 250)",
      label: "Silver",
    },
    {
      xp: 2500,
      reward: "$100 · Bronze laurel",
      emoji: "🥉",
      tint: "oklch(0.68 0.14 50)",
      label: "Bronze",
    },
  ],
};

function Leaderboard() {
  const [period, setPeriod] = useState<SeasonalPeriod>("weekly");
  const entries = useMemo(() => leaderboard(period), [period]);
  const challenges = useMemo(() => seasonalChallengesFor(period), [period]);
  const scored = entries.filter((e) => e.xp > 0);
  const podium = scored.slice(0, 3);
  const rest = scored.slice(3, 10);
  const prizes = PRIZES[period];

  const label =
    period === "weekly" ? "this week" : period === "monthly" ? "this month" : "this year";
  const windowEnds =
    period === "weekly" ? "Sunday 23:59" : period === "monthly" ? "end of month" : "Dec 31";

  return (
    <Card className="p-5 overflow-hidden relative">
      <div className="relative flex items-center gap-2 mb-4 flex-wrap">
        <div className="h-8 w-8 rounded-md grid place-items-center bg-warning/15 text-warning">
          <Trophy className="h-4 w-4" />
        </div>
        <div>
          <div className="font-display text-base leading-tight">Leaderboard</div>
          <div className="text-[11px] text-muted-foreground">
            Compete on XP earned {label} · resets {windowEnds}
          </div>
        </div>
        <div className="ml-auto inline-flex rounded-md border p-0.5 bg-background">
          {(
            [
              ["weekly", "Week", CalendarDays],
              ["monthly", "Month", CalendarRange],
              ["yearly", "Year", CalendarIcon],
            ] as const
          ).map(([p, lbl, Icon]) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-2.5 h-7 text-[11px] rounded-sm inline-flex items-center gap-1 press-scale",
                period === p
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3 w-3" /> {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Podium */}
      {podium.length > 0 && <Podium podium={podium} prizes={prizes} />}

      <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-5 mt-5">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
            <Medal className="h-3 w-3" /> Contenders
          </div>
          {rest.length === 0 && podium.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center border rounded-md">
              No XP earned yet {label}. Kick it off with kudos or focus work.
            </div>
          ) : rest.length === 0 ? (
            <div className="text-xs text-muted-foreground py-6 text-center border rounded-md">
              Podium's all there is so far — catch up and claim a spot.
            </div>
          ) : (
            <ol className="space-y-1.5 stagger-in">
              {rest.map((row) => (
                <LeaderboardRow key={row.employee.id} row={row} maxXp={podium[0].xp} />
              ))}
            </ol>
          )}

          {/* Prize ladder */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
              <Gift className="h-3 w-3" /> Prize ladder
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {prizes.map((p, i) => (
                <div
                  key={i}
                  className="relative rounded-md border p-2.5 overflow-hidden"
                  style={{ borderColor: `color-mix(in oklch, ${p.tint} 40%, var(--border))` }}
                >
                  <div
                    className="absolute -top-6 -right-6 h-16 w-16 rounded-full blur-2xl pointer-events-none"
                    style={{ background: p.tint, opacity: 0.25 }}
                    aria-hidden
                  />
                  <div className="relative flex items-center gap-1.5">
                    <span className="text-base leading-none">{p.emoji}</span>
                    <span
                      className="text-[10px] uppercase tracking-wider font-bold"
                      style={{ color: p.tint }}
                    >
                      {i + 1}
                      {i === 0 ? "st" : i === 1 ? "nd" : "rd"} · {p.label}
                    </span>
                    <span className="ml-auto font-mono text-[11px] tabular-nums text-primary">
                      +{p.xp.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="relative text-[11px] text-muted-foreground mt-1 leading-snug">
                    {p.reward}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Active {period} challenges
          </div>
          <div className="space-y-2">
            {challenges.length === 0 ? (
              <div className="text-xs text-muted-foreground p-4 text-center border rounded-md">
                No {period} challenges live.
              </div>
            ) : (
              challenges.map((c) => <SeasonalChallengeCard key={c.id} challenge={c} />)
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function Podium({ podium, prizes }: { podium: LeaderboardEntry[]; prizes: [Prize, Prize, Prize] }) {
  // Layout: silver (2nd) | gold (1st) | bronze (3rd). Missing ranks collapse.
  const byRank: Record<1 | 2 | 3, LeaderboardEntry | undefined> = {
    1: podium.find((p) => p.rank === 1),
    2: podium.find((p) => p.rank === 2),
    3: podium.find((p) => p.rank === 3),
  };
  const order: (1 | 2 | 3)[] = [2, 1, 3];
  return (
    <div className="relative grid grid-cols-3 gap-3 items-end">
      {order.map((rank) => {
        const entry = byRank[rank];
        const prize = prizes[rank - 1];
        if (!entry) return <div key={rank} aria-hidden />;
        return <PodiumStep key={rank} entry={entry} prize={prize} rank={rank} />;
      })}
    </div>
  );
}

function PodiumStep({
  entry,
  prize,
  rank,
}: {
  entry: LeaderboardEntry;
  prize: Prize;
  rank: 1 | 2 | 3;
}) {
  const height = rank === 1 ? "h-[110px]" : rank === 2 ? "h-[82px]" : "h-[62px]";
  const avatarSize = rank === 1 ? 56 : 44;
  return (
    <div className={cn("relative flex flex-col items-center", rank === 1 && "-translate-y-2")}>
      {rank === 1 && (
        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-warning inline-flex items-center gap-1 shimmer">
          <Crown className="h-3 w-3" /> Reigning champ
        </div>
      )}
      <div className="relative">
        <Avatar
          initials={entry.employee.initials}
          color={entry.employee.avatarColor}
          size={avatarSize}
          employeeId={entry.employee.id}
        />
        <div
          className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full grid place-items-center text-base shadow-sm border-2 border-card bg-card"
          aria-label={`rank ${rank}`}
        >
          {prize.emoji}
        </div>
      </div>
      <div className="mt-2 text-center min-w-0 w-full px-1">
        <div className="text-sm font-semibold truncate">{entry.employee.name}</div>
        <div className="text-[10px] text-muted-foreground truncate">{entry.employee.role}</div>
      </div>
      <div
        className={cn(
          "mt-2 w-full rounded-t-lg flex flex-col items-center justify-end px-1.5 pt-1.5 pb-2 relative overflow-hidden",
          height,
        )}
        style={{
          background: `linear-gradient(180deg, color-mix(in oklch, ${prize.tint} 22%, transparent), color-mix(in oklch, ${prize.tint} 8%, transparent))`,
          border: `1px solid color-mix(in oklch, ${prize.tint} 45%, var(--border))`,
          borderBottom: "none",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ background: prize.tint, opacity: 0.7 }}
          aria-hidden
        />
        <div
          className="text-[9px] uppercase tracking-wider font-bold"
          style={{ color: prize.tint }}
        >
          {prize.label}
        </div>
        <div className="font-mono text-sm tabular-nums font-bold">+{entry.xp.toLocaleString()}</div>
        <div className="text-[9px] uppercase tracking-wider text-muted-foreground -mt-0.5">XP</div>
        <div className="mt-1 text-[10px] text-center leading-tight line-clamp-2">
          <span className="font-mono tabular-nums text-primary">
            +{prize.xp.toLocaleString()} XP
          </span>
          <span className="text-muted-foreground"> · {prize.reward.split(" · ")[0]}</span>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ row, maxXp }: { row: LeaderboardEntry; maxXp: number }) {
  const pct = Math.max(2, Math.round((row.xp / Math.max(1, maxXp)) * 100));
  return (
    <li className="relative group rounded-md border px-2.5 py-2 flex items-center gap-3 transition-colors hover:bg-muted/40">
      <div className="w-7 h-7 rounded-md grid place-items-center text-xs font-bold tabular-nums shrink-0 bg-muted text-muted-foreground">
        {row.rank}
      </div>
      <Avatar
        initials={row.employee.initials}
        color={row.employee.avatarColor}
        size={28}
        employeeId={row.employee.id}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium truncate">{row.employee.name}</div>
          <div className="ml-auto font-mono text-xs tabular-nums text-primary">
            +{row.xp.toLocaleString()} XP
          </div>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-700 bg-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground tabular-nums">
          <span className="inline-flex items-center gap-1">
            <Gift className="h-3 w-3" />
            {row.kudos} kudos
          </span>
          <span className="inline-flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {row.focusSessions} focus
          </span>
        </div>
      </div>
    </li>
  );
}

function SeasonalChallengeCard({ challenge }: { challenge: SeasonalChallenge }) {
  const top3 = [...challenge.participants].sort((a, b) => b.progress - a.progress).slice(0, 3);
  const maxProgress = top3[0]?.progress ?? 1;
  return (
    <div className="rounded-md border p-3 bg-card/60">
      <div className="flex items-start gap-2 mb-2">
        <div className="text-xl leading-none mt-0.5">{challenge.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium truncate">{challenge.title}</div>
            <span className="font-mono text-[10px] tabular-nums text-primary ml-auto shrink-0">
              +{challenge.xpReward} XP
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">
            {challenge.description}
          </div>
        </div>
      </div>
      <div className="space-y-1 mt-2">
        {top3.map((p, i) => {
          const emp = employeeById(p.employeeId);
          if (!emp) return null;
          const pct = Math.max(4, Math.round((p.progress / Math.max(1, maxProgress)) * 100));
          return (
            <div key={p.employeeId} className="flex items-center gap-2 text-[11px]">
              <span className="w-3 text-muted-foreground tabular-nums">{i + 1}</span>
              <Avatar
                initials={emp.initials}
                color={emp.avatarColor}
                size={18}
                employeeId={emp.id}
              />
              <span className="flex-1 truncate">{emp.name}</span>
              <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <span className="font-mono tabular-nums text-muted-foreground w-8 text-right">
                {p.progress}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamCard({ summary, onPick }: { summary: GrowthSummary; onPick: (id: string) => void }) {
  const {
    employee,
    level,
    next,
    progressPct,
    xp,
    streak,
    kudosReceived,
    goalsActive,
    challengesOpen,
    badgesEarned,
  } = summary;
  return (
    <Card
      className="p-5 press-scale hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
      onClick={() => onPick(employee.id)}
    >
      <div
        className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: level.color, opacity: 0.18 }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-start gap-3 mb-3">
          <EmployeeHoverCard employeeId={employee.id}>
            <span>
              <BirthdayHalo
                initials={employee.initials}
                color={employee.avatarColor}
                size={40}
                active={isBirthday(employee)}
              />
            </span>
          </EmployeeHoverCard>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{employee.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{employee.role}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <EmployeeScoreBadge employeeId={employee.id} size="sm" showInfo={false} />
            {streak > 0 && (
              <div
                className="inline-flex items-center gap-1 text-[10px] text-warning font-medium"
                title={`${streak}-week activity streak`}
              >
                <Flame className="h-3 w-3" /> {streak}w
              </div>
            )}
          </div>
        </div>

        {/* Level + XP */}
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
            style={{
              background: `${level.color.replace(")", " / 0.15)").replace("oklch(", "oklch(")}`,
              color: level.color,
            }}
          >
            <Sparkles className="h-3 w-3" />
            {level.name}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground ml-auto tabular-nums">
            {xp.total.toLocaleString()} XP
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${progressPct}%`, backgroundColor: level.color }}
          />
        </div>
        {next && (
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5 tabular-nums">
            <span>{progressPct}%</span>
            <span>
              next · {next.name} at {next.xpMin}
            </span>
          </div>
        )}

        {/* Mini stats */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t">
          <MiniStat icon={<Gift className="h-3 w-3" />} value={kudosReceived} label="kudos" />
          <MiniStat icon={<Target className="h-3 w-3" />} value={goalsActive} label="goals" />
          <MiniStat icon={<Trophy className="h-3 w-3" />} value={challengesOpen} label="open" />
          <MiniStat icon={<Award className="h-3 w-3" />} value={badgesEarned} label="badges" />
        </div>
      </div>
    </Card>
  );
}

// ─── Profile view ──────────────────────────────────────────────────────
function GrowthProfile({ summary }: { summary: GrowthSummary }) {
  const {
    employee,
    level,
    next,
    progressPct,
    xp,
    streak,
    kudosReceived,
    goalsActive,
    challengesOpen,
    badgesEarned,
  } = summary;
  const [pane, setPane] = useUrlParam("pane", "goals");
  const radar = useMemo(() => strengthRadarFor(employee.id), [employee.id]);
  const badges = useMemo(() => badgesFor(employee.id), [employee.id]);
  const goals = useMemo(() => goalsFor(employee.id), [employee.id]);
  const challenges = useMemo(() => challengesFor(employee.id), [employee.id]);
  const oneOnOnes = useMemo(() => oneOnOnesFor(employee.id), [employee.id]);
  const notes = useMemo(() => notesFor(employee.id), [employee.id]);
  const kudos = useMemo(
    () => kudosSeed.filter((k) => k.toId === employee.id).slice(0, 6),
    [employee.id],
  );

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Card className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] grid-bg pointer-events-none" aria-hidden />
        <div
          className="absolute -top-16 -right-16 h-60 w-60 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: level.color, opacity: 0.25 }}
          aria-hidden
        />
        <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-5 items-center">
          <BirthdayHalo
            initials={employee.initials}
            color={employee.avatarColor}
            size={72}
            active={isBirthday(employee)}
          />
          <div className="min-w-0">
            <div className="font-display text-3xl leading-tight">{employee.name}</div>
            <div className="text-sm text-muted-foreground">
              {employee.role} · {employee.department}
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span
                className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                style={{
                  background: `${level.color.replace(")", " / 0.15)").replace("oklch(", "oklch(")}`,
                  color: level.color,
                }}
              >
                <Sparkles className="h-3 w-3" /> Level {level.tier} · {level.name}
              </span>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                  <Flame className="h-3.5 w-3.5" /> {streak}-week streak
                </span>
              )}
            </div>
          </div>
          <div className="w-full md:w-[260px]">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-muted-foreground">XP</span>
              <span className="font-mono tabular-nums">
                {xp.total.toLocaleString()} · {progressPct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${progressPct}%`, backgroundColor: level.color }}
              />
            </div>
            {next && (
              <div className="text-[10px] text-muted-foreground mt-1.5 tabular-nums">
                Next: <span className="font-medium text-foreground">{next.name}</span> at{" "}
                {next.xpMin.toLocaleString()} XP
                {" · "}
                {(next.xpMin - xp.total).toLocaleString()} to go
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-2 md:grid-cols-5 gap-3 mt-5 pt-5 border-t">
          <Stat label="Kudos received" value={kudosReceived} />
          <Stat
            label="Goals (active/hit)"
            value={`${goalsActive} / ${goals.filter((g) => g.status === "hit").length}`}
          />
          <Stat label="Challenges open" value={challengesOpen} />
          <Stat label="Badges earned" value={`${badgesEarned} / ${badges.length}`} />
          <Stat label="1:1s logged" value={oneOnOnes.length} />
        </div>
      </Card>

      {/* Second row: strengths + XP breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div className="font-semibold text-sm">Strengths</div>
            <span className="ml-auto text-[10px] text-muted-foreground">from kudos received</span>
          </div>
          <StrengthsRadar points={radar} />
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-primary" />
            <div className="font-semibold text-sm">XP breakdown</div>
          </div>
          <XpBreakdownChart xp={xp} />
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={pane} onValueChange={setPane}>
        <TabsList>
          <TabsTrigger value="goals">
            <Target className="h-3.5 w-3.5 mr-1.5" />
            Goals ({goals.length})
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Trophy className="h-3.5 w-3.5 mr-1.5" />
            Challenges ({challenges.length})
          </TabsTrigger>
          <TabsTrigger value="ones">
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            1:1s ({oneOnOnes.length})
          </TabsTrigger>
          <TabsTrigger value="notes">
            <StickyNote className="h-3.5 w-3.5 mr-1.5" />
            Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="h-3.5 w-3.5 mr-1.5" />
            Badges ({badges.filter((b) => b.earned).length}/{badges.length})
          </TabsTrigger>
          <TabsTrigger value="kudos">
            <Gift className="h-3.5 w-3.5 mr-1.5" />
            Kudos ({kudos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-4">
          <GoalsView goals={goals} />
        </TabsContent>
        <TabsContent value="challenges" className="mt-4">
          <ChallengesView challenges={challenges} />
        </TabsContent>
        <TabsContent value="ones" className="mt-4">
          <OneOnOnesView rows={oneOnOnes} />
        </TabsContent>
        <TabsContent value="notes" className="mt-4">
          <NotesView notes={notes} />
        </TabsContent>
        <TabsContent value="badges" className="mt-4">
          <BadgesGrid badges={badges} />
        </TabsContent>
        <TabsContent value="kudos" className="mt-4">
          <KudosList rows={kudos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </div>
      <div className="font-mono text-xl tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

function XpBreakdownChart({
  xp,
}: {
  xp: {
    kudos: number;
    focus: number;
    goals: number;
    challenges: number;
    oneOnOnes: number;
    total: number;
  };
}) {
  const rows = [
    {
      label: "Kudos",
      value: xp.kudos,
      color: "oklch(0.65 0.18 340)",
      icon: <Gift className="h-3 w-3" />,
    },
    {
      label: "Focus",
      value: xp.focus,
      color: "oklch(0.78 0.18 130)",
      icon: <Zap className="h-3 w-3" />,
    },
    {
      label: "Goals",
      value: xp.goals,
      color: "oklch(0.6 0.16 220)",
      icon: <Target className="h-3 w-3" />,
    },
    {
      label: "Challenges",
      value: xp.challenges,
      color: "oklch(0.75 0.15 75)",
      icon: <Trophy className="h-3 w-3" />,
    },
    {
      label: "1:1s",
      value: xp.oneOnOnes,
      color: "oklch(0.65 0.15 155)",
      icon: <MessageCircle className="h-3 w-3" />,
    },
  ];
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[90px_1fr_60px] items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {r.icon}
            {r.label}
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, backgroundColor: r.color }}
            />
          </div>
          <div className="text-right font-mono tabular-nums">{r.value.toLocaleString()} xp</div>
        </div>
      ))}
    </div>
  );
}

// ─── Goals ─────────────────────────────────────────────────────────────
function GoalsView({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) return <Empty label="No goals yet." />;
  const grouped = {
    active: goals.filter((g) => g.status === "active"),
    hit: goals.filter((g) => g.status === "hit"),
    missed: goals.filter((g) => g.status === "missed"),
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <GoalColumn title="Active" tone="primary" rows={grouped.active} />
      <GoalColumn title="Hit" tone="success" rows={grouped.hit} />
      <GoalColumn title="Missed" tone="destructive" rows={grouped.missed} />
    </div>
  );
}
function GoalColumn({
  title,
  tone,
  rows,
}: {
  title: string;
  tone: "primary" | "success" | "destructive";
  rows: Goal[];
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
          {title}
        </div>
        <div className="text-xs tabular-nums font-mono text-muted-foreground">{rows.length}</div>
      </div>
      {rows.length === 0 ? (
        <div className="text-[11px] text-muted-foreground py-3 text-center">—</div>
      ) : (
        <div className="space-y-2 stagger-in">
          {rows.map((g) => (
            <div
              key={g.id}
              className={cn(
                "p-3 rounded-md border",
                tone === "success" && "bg-success/5 border-success/20",
                tone === "destructive" && "bg-destructive/5 border-destructive/20",
                tone === "primary" && "bg-muted/30",
              )}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                {g.quarter}
              </div>
              <div className="text-sm font-medium mt-0.5">{g.title}</div>
              <div className="text-[11px] text-muted-foreground">
                {g.metric} · target {g.target}
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px]">
                <span className="tabular-nums">{g.progress}%</span>
                <span className="text-muted-foreground">due {g.dueAt}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-700",
                    tone === "success" && "bg-success",
                    tone === "destructive" && "bg-destructive",
                    tone === "primary" && "bg-primary",
                  )}
                  style={{ width: `${g.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Challenges ────────────────────────────────────────────────────────
function ChallengesView({ challenges }: { challenges: Challenge[] }) {
  if (challenges.length === 0) return <Empty label="No challenges yet." />;
  return (
    <Card className="p-0 overflow-hidden">
      <ul className="divide-y stagger-in">
        {challenges.map((c) => {
          const assigner = employeeById(c.assignedBy);
          return (
            <li
              key={c.id}
              className="px-5 py-3.5 flex items-start gap-3 hover:bg-muted/20 transition-colors"
            >
              <ChallengeIcon status={c.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{c.title}</div>
                  <DifficultyPill d={c.difficulty} />
                  <span className="ml-auto font-mono text-[11px] tabular-nums text-primary">
                    +{c.xpReward} XP
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{c.description}</div>
                <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-2">
                  <span>Due {c.dueAt}</span>
                  {assigner && <span>· Assigned by {assigner.name}</span>}
                </div>
              </div>
              <StatusBadge
                status={
                  c.status === "succeeded"
                    ? "approved"
                    : c.status === "failed"
                      ? "rejected"
                      : "pending"
                }
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
function ChallengeIcon({ status }: { status: Challenge["status"] }) {
  if (status === "succeeded")
    return <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />;
  if (status === "failed") return <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />;
  return <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />;
}
function DifficultyPill({ d }: { d: 1 | 2 | 3 }) {
  const label = d === 1 ? "easy" : d === 2 ? "medium" : "hard";
  const cls =
    d === 1
      ? "bg-muted/60"
      : d === 2
        ? "bg-warning/15 text-warning"
        : "bg-destructive/15 text-destructive";
  return (
    <span
      className={cn("text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded", cls)}
    >
      {label}
    </span>
  );
}

// ─── 1:1s ──────────────────────────────────────────────────────────────
function OneOnOnesView({ rows }: { rows: OneOnOne[] }) {
  if (rows.length === 0) return <Empty label="No 1:1s logged." />;
  return (
    <ol className="relative border-l pl-5 space-y-5 ml-2 stagger-in">
      {rows.map((o) => {
        const manager = employeeById(o.managerId);
        const done = o.actionItems.filter((a) => a.done).length;
        return (
          <li key={o.id} className="relative">
            <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-primary ring-2 ring-background" />
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-xs tabular-nums">{o.date}</span>
                {manager && (
                  <span className="text-[11px] text-muted-foreground">· with {manager.name}</span>
                )}
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {done}/{o.actionItems.length} actions
                </span>
              </div>
              {o.agenda.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-2">
                  {o.agenda.map((a, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded border bg-muted/40">
                      {a}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-sm leading-snug">{o.notes}</div>
              {o.actionItems.length > 0 && (
                <ul className="mt-3 pt-3 border-t space-y-1.5">
                  {o.actionItems.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      {a.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className={cn(a.done && "line-through text-muted-foreground")}>
                        {a.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Notes ─────────────────────────────────────────────────────────────
const NOTE_TONE: Record<GrowthNote["tone"], string> = {
  praise: "border-success/30 bg-success/[0.05]",
  observation: "border-info/30    bg-info/[0.05]",
  concern: "border-destructive/30 bg-destructive/[0.05]",
};
function NotesView({ notes }: { notes: GrowthNote[] }) {
  if (notes.length === 0) return <Empty label="No notes yet." />;
  return (
    <div className="space-y-2 stagger-in">
      {notes.map((n) => {
        const author = employeeById(n.authorId);
        return (
          <Card key={n.id} className={cn("p-4 border", NOTE_TONE[n.tone])}>
            <div className="flex items-center gap-2 mb-1.5 text-[11px]">
              <span className="font-medium capitalize">{n.tone}</span>
              {author && <span className="text-muted-foreground">· {author.name}</span>}
              <span className="ml-auto text-muted-foreground font-mono tabular-nums">
                {n.createdAt}
              </span>
            </div>
            <div className="text-sm leading-snug">{n.body}</div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Badges ────────────────────────────────────────────────────────────
function BadgesGrid({ badges }: { badges: ReturnType<typeof badgesFor> }) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-in">
        {badges.map((b) => (
          <Tooltip key={b.id}>
            <TooltipTrigger asChild>
              <Card
                className={cn("p-4 text-center press-scale cursor-help", !b.earned && "opacity-55")}
              >
                <div className={cn("text-3xl mb-1.5", !b.earned && "grayscale")}>{b.emoji}</div>
                <div className="text-sm font-medium">{b.name}</div>
                {b.progress && (
                  <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width]"
                      style={{
                        width: `${Math.min(100, (b.progress.have / b.progress.need) * 100)}%`,
                        backgroundColor: b.earned ? "var(--color-success)" : "var(--color-primary)",
                      }}
                    />
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                  {b.progress ? `${b.progress.have} / ${b.progress.need}` : ""}
                </div>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border shadow-pop max-w-[220px]">
              <div className="text-xs font-medium">{b.name}</div>
              <div className="text-[11px] text-muted-foreground">{b.description}</div>
              {!b.earned && b.progress && (
                <div className="text-[11px] text-primary mt-1">
                  {b.progress.need - b.progress.have} more to unlock
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

// ─── Kudos ─────────────────────────────────────────────────────────────
function KudosList({ rows }: { rows: Kudo[] }) {
  if (rows.length === 0)
    return <Empty label="No kudos yet — send some love from the Kudos page." />;
  return (
    <div className="space-y-2 stagger-in">
      {rows.map((k) => {
        const from = employeeById(k.fromId);
        if (!from) return null;
        return (
          <Card key={k.id} className="p-4">
            <div className="flex items-center gap-2.5">
              <Avatar
                initials={from.initials}
                color={from.avatarColor}
                size={28}
                employeeId={from.id}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium">{from.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {k.tag} · {k.amount} 🪙
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono tabular-nums">
                  {k.date}
                </div>
              </div>
            </div>
            <div className="text-sm mt-2">"{k.message}"</div>
          </Card>
        );
      })}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <Card className="py-12 text-center text-sm text-muted-foreground">{label}</Card>;
}
