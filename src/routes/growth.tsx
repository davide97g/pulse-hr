import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  TrendingUp, User, Users, Flame, Trophy, Target, Zap, Award, Sparkles,
  MessageCircle, StickyNote, CheckCircle2, XCircle, Circle, Clock, ChevronRight,
  Gift,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageHeader, Avatar, StatusBadge } from "@/components/app/AppShell";
import { NewBadge } from "@/components/app/NewBadge";
import {
  allGrowthSummaries, growthSummaryFor, badgesFor, strengthRadarFor,
  goalsFor, challengesFor, oneOnOnesFor, notesFor,
  type GrowthSummary, type StrengthTag,
} from "@/lib/growth";
import {
  employeeById, kudosSeed, type Goal, type Challenge, type OneOnOne, type GrowthNote,
  type Kudo,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ME = "e1";

export const Route = createFileRoute("/growth")({
  head: () => ({ meta: [{ title: "Growth — Pulse HR" }] }),
  component: Growth,
});

function Growth() {
  const [view, setView] = useState<"team" | "me">("team");
  const [focusEmployee, setFocusEmployee] = useState<string | null>(null);

  // Effective subject: Me view shows ME; Team view opens a drill-down.
  const subjectId = view === "me" ? ME : focusEmployee;
  const summaries = useMemo(() => allGrowthSummaries(), []);
  const subject = subjectId ? growthSummaryFor(subjectId) : null;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title={<><span>Growth</span><NewBadge /></>}
        description="Track progress, goals, challenges and 1:1s. Kudos and focus sessions roll up into XP and badges."
        actions={
          <div className="inline-flex rounded-md border p-0.5 bg-background">
            <button
              onClick={() => { setView("team"); setFocusEmployee(null); }}
              className={cn(
                "px-3 h-8 text-xs rounded-sm inline-flex items-center gap-1.5 press-scale",
                view === "team" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="h-3.5 w-3.5" /> Team
            </button>
            <button
              onClick={() => { setView("me"); setFocusEmployee(null); }}
              className={cn(
                "px-3 h-8 text-xs rounded-sm inline-flex items-center gap-1.5 press-scale",
                view === "me" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground",
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
        <TeamGrid summaries={summaries} onPick={id => setFocusEmployee(id)} />
      )}
    </div>
  );
}

// ─── Team grid ─────────────────────────────────────────────────────────
function TeamGrid({ summaries, onPick }: { summaries: GrowthSummary[]; onPick: (id: string) => void }) {
  const totals = useMemo(() => ({
    xp: summaries.reduce((a, s) => a + s.xp.total, 0),
    activeGoals: summaries.reduce((a, s) => a + s.goalsActive, 0),
    openChallenges: summaries.reduce((a, s) => a + s.challengesOpen, 0),
    kudos: summaries.reduce((a, s) => a + s.kudosReceived, 0),
  }), [summaries]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 stagger-in">
        <StatTile icon={<Zap className="h-4 w-4" />} label="Total XP this quarter" value={totals.xp.toLocaleString()} accent />
        <StatTile icon={<Target className="h-4 w-4" />} label="Active goals" value={`${totals.activeGoals}`} />
        <StatTile icon={<Trophy className="h-4 w-4" />} label="Open challenges" value={`${totals.openChallenges}`} />
        <StatTile icon={<Gift className="h-4 w-4" />} label="Kudos received" value={`${totals.kudos}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger-in">
        {summaries.map(s => <TeamCard key={s.employee.id} summary={s} onPick={onPick} />)}
      </div>
    </>
  );
}

function TeamCard({ summary, onPick }: { summary: GrowthSummary; onPick: (id: string) => void }) {
  const { employee, level, next, progressPct, xp, streak, kudosReceived, goalsActive, challengesOpen, badgesEarned } = summary;
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
          <Avatar initials={employee.initials} color={employee.avatarColor} size={40} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{employee.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{employee.role}</div>
          </div>
          {streak > 0 && (
            <div
              className="inline-flex items-center gap-1 text-[11px] text-warning font-medium"
              title={`${streak}-week activity streak`}
            >
              <Flame className="h-3 w-3" /> {streak}w
            </div>
          )}
        </div>

        {/* Level + XP */}
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
            style={{ background: `${level.color.replace(")", " / 0.15)").replace("oklch(", "oklch(")}`, color: level.color }}
          >
            <Sparkles className="h-3 w-3" />{level.name}
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
            <span>next · {next.name} at {next.xpMin}</span>
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

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-sm font-semibold tabular-nums flex items-center justify-center gap-1">
        <span className="text-muted-foreground">{icon}</span>{value}
      </div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function StatTile({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <Card className={cn("p-4 press-scale hover:shadow-md transition-shadow", accent && "iridescent-border")}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {icon}{label}
      </div>
      <div className="text-2xl font-display tabular-nums mt-1">{value}</div>
    </Card>
  );
}

// ─── Profile view ──────────────────────────────────────────────────────
function GrowthProfile({ summary }: { summary: GrowthSummary }) {
  const { employee, level, next, progressPct, xp, streak, kudosReceived, goalsActive, challengesOpen, badgesEarned } = summary;
  const radar = useMemo(() => strengthRadarFor(employee.id), [employee.id]);
  const badges = useMemo(() => badgesFor(employee.id), [employee.id]);
  const goals = useMemo(() => goalsFor(employee.id), [employee.id]);
  const challenges = useMemo(() => challengesFor(employee.id), [employee.id]);
  const oneOnOnes = useMemo(() => oneOnOnesFor(employee.id), [employee.id]);
  const notes = useMemo(() => notesFor(employee.id), [employee.id]);
  const kudos = useMemo(() => kudosSeed.filter(k => k.toId === employee.id).slice(0, 6), [employee.id]);

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
          <Avatar initials={employee.initials} color={employee.avatarColor} size={72} />
          <div className="min-w-0">
            <div className="font-display text-3xl leading-tight">{employee.name}</div>
            <div className="text-sm text-muted-foreground">{employee.role} · {employee.department}</div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span
                className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                style={{ background: `${level.color.replace(")", " / 0.15)").replace("oklch(", "oklch(")}`, color: level.color }}
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
              <span className="font-mono tabular-nums">{xp.total.toLocaleString()} · {progressPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${progressPct}%`, backgroundColor: level.color }}
              />
            </div>
            {next && (
              <div className="text-[10px] text-muted-foreground mt-1.5 tabular-nums">
                Next: <span className="font-medium text-foreground">{next.name}</span> at {next.xpMin.toLocaleString()} XP
                {" · "}
                {(next.xpMin - xp.total).toLocaleString()} to go
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-2 md:grid-cols-5 gap-3 mt-5 pt-5 border-t">
          <Stat label="Kudos received"     value={kudosReceived} />
          <Stat label="Goals (active/hit)" value={`${goalsActive} / ${goals.filter(g => g.status === "hit").length}`} />
          <Stat label="Challenges open"    value={challengesOpen} />
          <Stat label="Badges earned"      value={`${badgesEarned} / ${badges.length}`} />
          <Stat label="1:1s logged"        value={oneOnOnes.length} />
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
      <Tabs defaultValue="goals">
        <TabsList>
          <TabsTrigger value="goals"><Target className="h-3.5 w-3.5 mr-1.5" />Goals ({goals.length})</TabsTrigger>
          <TabsTrigger value="challenges"><Trophy className="h-3.5 w-3.5 mr-1.5" />Challenges ({challenges.length})</TabsTrigger>
          <TabsTrigger value="ones"><MessageCircle className="h-3.5 w-3.5 mr-1.5" />1:1s ({oneOnOnes.length})</TabsTrigger>
          <TabsTrigger value="notes"><StickyNote className="h-3.5 w-3.5 mr-1.5" />Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="badges"><Award className="h-3.5 w-3.5 mr-1.5" />Badges ({badges.filter(b => b.earned).length}/{badges.length})</TabsTrigger>
          <TabsTrigger value="kudos"><Gift className="h-3.5 w-3.5 mr-1.5" />Kudos ({kudos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-4"><GoalsView goals={goals} /></TabsContent>
        <TabsContent value="challenges" className="mt-4"><ChallengesView challenges={challenges} /></TabsContent>
        <TabsContent value="ones" className="mt-4"><OneOnOnesView rows={oneOnOnes} /></TabsContent>
        <TabsContent value="notes" className="mt-4"><NotesView notes={notes} /></TabsContent>
        <TabsContent value="badges" className="mt-4"><BadgesGrid badges={badges} /></TabsContent>
        <TabsContent value="kudos" className="mt-4"><KudosList rows={kudos} /></TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className="font-mono text-xl tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

// ─── Strengths radar ──────────────────────────────────────────────────
const TAG_COLOR: Record<StrengthTag, string> = {
  impact:   "oklch(0.7 0.15 30)",
  craft:    "oklch(0.65 0.18 340)",
  teamwork: "oklch(0.6 0.16 220)",
  courage:  "oklch(0.75 0.15 75)",
  kindness: "oklch(0.65 0.15 155)",
};

function StrengthsRadar({ points }: { points: { tag: StrengthTag; value: number }[] }) {
  const size = 220;
  const r = 80;
  const cx = size / 2;
  const cy = size / 2;
  const angle = (i: number) => (i / points.length) * 2 * Math.PI - Math.PI / 2;
  const pt = (i: number, v: number) => {
    const d = (v / 100) * r;
    return [cx + Math.cos(angle(i)) * d, cy + Math.sin(angle(i)) * d] as const;
  };
  const path = points.map((p, i) => {
    const [x, y] = pt(i, p.value);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {/* grid circles */}
        {[0.25, 0.5, 0.75, 1].map(f => (
          <circle
            key={f}
            cx={cx} cy={cy} r={r * f}
            fill="none" stroke="currentColor" strokeOpacity="0.1"
          />
        ))}
        {/* axes */}
        {points.map((p, i) => {
          const [x, y] = pt(i, 100);
          return <line key={p.tag} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeOpacity="0.08" />;
        })}
        {/* polygon */}
        <path d={path} fill="oklch(0.72 0.17 295 / 0.18)" stroke="oklch(0.72 0.17 295)" strokeWidth="1.5" />
        {/* dots */}
        {points.map((p, i) => {
          const [x, y] = pt(i, p.value);
          return <circle key={p.tag} cx={x} cy={y} r="3" fill={TAG_COLOR[p.tag]} />;
        })}
        {/* labels */}
        {points.map((p, i) => {
          const [x, y] = pt(i, 128);
          return (
            <text
              key={p.tag}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-current text-[10px] font-medium uppercase tracking-wider"
              style={{ fontFeatureSettings: '"tnum"' }}
            >
              {p.tag}
            </text>
          );
        })}
      </svg>
      <div className="flex-1 space-y-2">
        {points.map(p => (
          <div key={p.tag} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: TAG_COLOR[p.tag] }} />
            <span className="capitalize flex-1">{p.tag}</span>
            <span className="font-mono tabular-nums text-muted-foreground">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function XpBreakdownChart({ xp }: { xp: { kudos: number; focus: number; goals: number; challenges: number; oneOnOnes: number; total: number } }) {
  const rows = [
    { label: "Kudos",      value: xp.kudos,      color: "oklch(0.65 0.18 340)", icon: <Gift className="h-3 w-3" /> },
    { label: "Focus",      value: xp.focus,      color: "oklch(0.78 0.18 130)", icon: <Zap  className="h-3 w-3" /> },
    { label: "Goals",      value: xp.goals,      color: "oklch(0.6 0.16 220)",  icon: <Target className="h-3 w-3" /> },
    { label: "Challenges", value: xp.challenges, color: "oklch(0.75 0.15 75)",  icon: <Trophy className="h-3 w-3" /> },
    { label: "1:1s",       value: xp.oneOnOnes,  color: "oklch(0.65 0.15 155)", icon: <MessageCircle className="h-3 w-3" /> },
  ];
  const max = Math.max(1, ...rows.map(r => r.value));
  return (
    <div className="space-y-2">
      {rows.map(r => (
        <div key={r.label} className="grid grid-cols-[90px_1fr_60px] items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {r.icon}{r.label}
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
    active: goals.filter(g => g.status === "active"),
    hit:    goals.filter(g => g.status === "hit"),
    missed: goals.filter(g => g.status === "missed"),
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <GoalColumn title="Active" tone="primary"      rows={grouped.active} />
      <GoalColumn title="Hit"    tone="success"      rows={grouped.hit} />
      <GoalColumn title="Missed" tone="destructive"  rows={grouped.missed} />
    </div>
  );
}
function GoalColumn({ title, tone, rows }: { title: string; tone: "primary" | "success" | "destructive"; rows: Goal[] }) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">{title}</div>
        <div className="text-xs tabular-nums font-mono text-muted-foreground">{rows.length}</div>
      </div>
      {rows.length === 0 ? <div className="text-[11px] text-muted-foreground py-3 text-center">—</div> : (
        <div className="space-y-2 stagger-in">
          {rows.map(g => (
            <div key={g.id} className={cn(
              "p-3 rounded-md border",
              tone === "success" && "bg-success/5 border-success/20",
              tone === "destructive" && "bg-destructive/5 border-destructive/20",
              tone === "primary" && "bg-muted/30",
            )}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{g.quarter}</div>
              <div className="text-sm font-medium mt-0.5">{g.title}</div>
              <div className="text-[11px] text-muted-foreground">{g.metric} · target {g.target}</div>
              <div className="flex items-center justify-between mt-2 text-[11px]">
                <span className="tabular-nums">{g.progress}%</span>
                <span className="text-muted-foreground">due {g.dueAt}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                <div className={cn(
                  "h-full rounded-full transition-[width] duration-700",
                  tone === "success" && "bg-success",
                  tone === "destructive" && "bg-destructive",
                  tone === "primary" && "bg-primary",
                )} style={{ width: `${g.progress}%` }} />
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
        {challenges.map(c => {
          const assigner = employeeById(c.assignedBy);
          return (
            <li key={c.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-muted/20 transition-colors">
              <ChallengeIcon status={c.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{c.title}</div>
                  <DifficultyPill d={c.difficulty} />
                  <span className="ml-auto font-mono text-[11px] tabular-nums text-primary">+{c.xpReward} XP</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{c.description}</div>
                <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-2">
                  <span>Due {c.dueAt}</span>
                  {assigner && <span>· Assigned by {assigner.name}</span>}
                </div>
              </div>
              <StatusBadge status={
                c.status === "succeeded" ? "approved" :
                c.status === "failed"    ? "rejected" : "pending"
              } />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
function ChallengeIcon({ status }: { status: Challenge["status"] }) {
  if (status === "succeeded") return <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />;
  if (status === "failed")    return <XCircle      className="h-5 w-5 text-destructive mt-0.5 shrink-0" />;
  return                            <Circle       className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />;
}
function DifficultyPill({ d }: { d: 1 | 2 | 3 }) {
  const label = d === 1 ? "easy" : d === 2 ? "medium" : "hard";
  const cls = d === 1 ? "bg-muted/60" : d === 2 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
  return (
    <span className={cn("text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded", cls)}>
      {label}
    </span>
  );
}

// ─── 1:1s ──────────────────────────────────────────────────────────────
function OneOnOnesView({ rows }: { rows: OneOnOne[] }) {
  if (rows.length === 0) return <Empty label="No 1:1s logged." />;
  return (
    <ol className="relative border-l pl-5 space-y-5 ml-2 stagger-in">
      {rows.map(o => {
        const manager = employeeById(o.managerId);
        const done = o.actionItems.filter(a => a.done).length;
        return (
          <li key={o.id} className="relative">
            <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-primary ring-2 ring-background" />
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-xs tabular-nums">{o.date}</span>
                {manager && <span className="text-[11px] text-muted-foreground">· with {manager.name}</span>}
                <span className="ml-auto text-[11px] text-muted-foreground">{done}/{o.actionItems.length} actions</span>
              </div>
              {o.agenda.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-2">
                  {o.agenda.map((a, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded border bg-muted/40">{a}</span>
                  ))}
                </div>
              )}
              <div className="text-sm leading-snug">{o.notes}</div>
              {o.actionItems.length > 0 && (
                <ul className="mt-3 pt-3 border-t space-y-1.5">
                  {o.actionItems.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      {a.done
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                        : <Circle       className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                      <span className={cn(a.done && "line-through text-muted-foreground")}>{a.text}</span>
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
  praise:      "border-success/30 bg-success/[0.05]",
  observation: "border-info/30    bg-info/[0.05]",
  concern:     "border-destructive/30 bg-destructive/[0.05]",
};
function NotesView({ notes }: { notes: GrowthNote[] }) {
  if (notes.length === 0) return <Empty label="No notes yet." />;
  return (
    <div className="space-y-2 stagger-in">
      {notes.map(n => {
        const author = employeeById(n.authorId);
        return (
          <Card key={n.id} className={cn("p-4 border", NOTE_TONE[n.tone])}>
            <div className="flex items-center gap-2 mb-1.5 text-[11px]">
              <span className="font-medium capitalize">{n.tone}</span>
              {author && <span className="text-muted-foreground">· {author.name}</span>}
              <span className="ml-auto text-muted-foreground font-mono tabular-nums">{n.createdAt}</span>
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
        {badges.map(b => (
          <Tooltip key={b.id}>
            <TooltipTrigger asChild>
              <Card className={cn("p-4 text-center press-scale cursor-help", !b.earned && "opacity-55")}>
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
  if (rows.length === 0) return <Empty label="No kudos yet — send some love from the Kudos page." />;
  return (
    <div className="space-y-2 stagger-in">
      {rows.map(k => {
        const from = employeeById(k.fromId);
        if (!from) return null;
        return (
          <Card key={k.id} className="p-4">
            <div className="flex items-center gap-2.5">
              <Avatar initials={from.initials} color={from.avatarColor} size={28} />
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium">{from.name}</span>
                  <span className="text-muted-foreground"> · {k.tag} · {k.amount} 🪙</span>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono tabular-nums">{k.date}</div>
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
  return (
    <Card className="py-12 text-center text-sm text-muted-foreground">{label}</Card>
  );
}
