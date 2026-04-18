import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Mail, Phone, MapPin, Calendar, Briefcase, Building2, Sparkles, Flame,
  Clock, FileText, Receipt, Trophy, Settings as SettingsIcon, Gift,
  TrendingUp, ArrowUpRight, Target, Award, Zap, MessageCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import {
  employees, kudosSeed, employeeById, leaveRequests,
} from "@/lib/mock-data";
import {
  growthSummaryFor, strengthRadarFor, type StrengthTag,
} from "@/lib/growth";
import { STRENGTH_COLORS, strengthColor } from "@/lib/colors";
import { MiniStat } from "@/components/app/StatTiles";
import { cn } from "@/lib/utils";

const ME = "e1";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Pulse HR" }] }),
  component: Profile,
});

function Profile() {
  const me = useMemo(() => employees.find(e => e.id === ME), []);
  const summary = useMemo(() => growthSummaryFor(ME), []);
  const radar = useMemo(() => strengthRadarFor(ME), []);
  const kudosIn = useMemo(
    () => kudosSeed.filter(k => k.toId === ME).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [],
  );
  const leaveBalance = useMemo(() => {
    const myLeave = leaveRequests.filter(l => l.employeeId === ME);
    const pending = myLeave.filter(l => l.status === "pending").length;
    const approvedDays = myLeave.filter(l => l.status === "approved").reduce((a, l) => a + l.days, 0);
    return { pending, approvedDays, remaining: Math.max(0, 25 - approvedDays) };
  }, []);

  if (!me || !summary) return null;

  const topStrengths = [...radar].sort((a, b) => b.value - a.value).slice(0, 3);

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto fade-in">
      <PageHeader
        title={<span>My profile</span>}
        description="Personal hub for your growth, time, documents, and expenses."
      />

      {/* Hero */}
      <Card className="p-6 relative overflow-hidden mb-4">
        <div
          className="absolute -top-20 -right-20 h-72 w-72 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: summary.level.color, opacity: 0.22 }}
          aria-hidden
        />
        <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-5 items-center">
          <Avatar initials={me.initials} color={me.avatarColor} size={80} />
          <div className="min-w-0">
            <div className="font-display text-3xl leading-tight">{me.name}</div>
            <div className="text-sm text-muted-foreground">{me.role} · {me.department}</div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span
                className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                style={{
                  background: summary.level.color.replace(")", " / 0.15)"),
                  color: summary.level.color,
                }}
              >
                <Sparkles className="h-3 w-3" /> Level {summary.level.tier} · {summary.level.name}
              </span>
              {summary.streak > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                  <Flame className="h-3.5 w-3.5" /> {summary.streak}-week streak
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3" /> Joined {me.joinDate}
              </span>
            </div>
          </div>
          <div className="w-full md:w-[280px]">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-muted-foreground">XP</span>
              <span className="font-mono tabular-nums">{summary.xp.total.toLocaleString()} · {summary.progressPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${summary.progressPct}%`, backgroundColor: summary.level.color }}
              />
            </div>
            {summary.next && (
              <div className="text-[10px] text-muted-foreground mt-1.5 tabular-nums">
                Next: <span className="font-medium text-foreground">{summary.next.name}</span>
                {" — "}
                {(summary.next.xpMin - summary.xp.total).toLocaleString()} XP to go
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Entry points — quick actions */}
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2 px-0.5">
        Quick access
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 stagger-in">
        <EntryTile
          to="/growth"
          search={{ view: "me" }}
          icon={<Trophy className="h-5 w-5" />}
          title="My growth"
          hint={`Lv ${summary.level.tier} · ${summary.xp.total.toLocaleString()} XP`}
          accent="oklch(0.78 0.18 55)"
        />
        <EntryTile
          to="/time"
          icon={<Clock className="h-5 w-5" />}
          title="My timesheet"
          hint="Week of Apr 13"
          accent="oklch(0.6 0.16 220)"
        />
        <EntryTile
          to="/leave"
          icon={<Calendar className="h-5 w-5" />}
          title="My leave"
          hint={`${leaveBalance.remaining} days left${leaveBalance.pending ? ` · ${leaveBalance.pending} pending` : ""}`}
          accent="oklch(0.65 0.15 155)"
        />
        <EntryTile
          to="/expenses"
          icon={<Receipt className="h-5 w-5" />}
          title="My expenses"
          hint="Submit a claim"
          accent="oklch(0.65 0.18 340)"
        />
        <EntryTile
          to="/documents"
          icon={<FileText className="h-5 w-5" />}
          title="My documents"
          hint="Contracts · tax forms"
          accent="oklch(0.7 0.13 110)"
        />
        <EntryTile
          to="/settings"
          icon={<SettingsIcon className="h-5 w-5" />}
          title="Settings"
          hint="Theme · notifications"
          accent="oklch(0.62 0.22 295)"
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3">
        {/* Personal info */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="h-4 w-4 text-primary" />
            <div className="font-semibold text-sm">Personal info</div>
          </div>
          <div className="space-y-0">
            <InfoRow icon={<Mail className="h-3.5 w-3.5" />}      label="Email"      value={me.email} />
            <InfoRow icon={<Phone className="h-3.5 w-3.5" />}     label="Phone"      value={me.phone} />
            <InfoRow icon={<MapPin className="h-3.5 w-3.5" />}    label="Location"   value={me.location} />
            <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Department" value={me.department} />
            <InfoRow icon={<Briefcase className="h-3.5 w-3.5" />} label="Employment" value={me.employmentType} />
            {me.manager && <InfoRow icon={<Briefcase className="h-3.5 w-3.5" />} label="Manager" value={me.manager} />}
          </div>
        </Card>

        {/* Growth at a glance */}
        <Card className="p-5 iridescent-border relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div className="font-semibold text-sm">Growth at a glance</div>
            <Link
              to="/growth"
              search={{ view: "me" }}
              className="ml-auto text-xs text-primary hover:underline inline-flex items-center gap-1 press-scale"
            >
              Full profile <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            <MiniStat variant="card" icon={<Gift className="h-3 w-3" />}   value={summary.kudosReceived} label="kudos" />
            <MiniStat variant="card" icon={<Target className="h-3 w-3" />} value={summary.goalsActive}    label="goals" />
            <MiniStat variant="card" icon={<Trophy className="h-3 w-3" />} value={summary.challengesOpen} label="open" />
            <MiniStat variant="card" icon={<Award className="h-3 w-3" />}  value={summary.badgesEarned}   label="badges" />
          </div>

          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Top strengths
          </div>
          <div className="space-y-2">
            {topStrengths.map(s => (
              <div key={s.tag} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: STRENGTH_COLORS[s.tag] }} />
                <span className="capitalize w-20 shrink-0">{s.tag}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${s.value}%`, backgroundColor: STRENGTH_COLORS[s.tag] }}
                  />
                </div>
                <span className="font-mono tabular-nums text-muted-foreground w-8 text-right">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2 mt-4">
            XP breakdown
          </div>
          <div className="grid grid-cols-5 gap-1.5 text-[10px]">
            {([
              ["Kudos",      summary.xp.kudos,      <Gift className="h-3 w-3" key="a" />],
              ["Focus",      summary.xp.focus,      <Zap className="h-3 w-3" key="b" />],
              ["Goals",      summary.xp.goals,      <Target className="h-3 w-3" key="c" />],
              ["Challenges", summary.xp.challenges, <Trophy className="h-3 w-3" key="d" />],
              ["1:1s",       summary.xp.oneOnOnes,  <MessageCircle className="h-3 w-3" key="e" />],
            ] as const).map(([lbl, v, icon]) => (
              <div key={lbl} className="rounded-md border p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground">{icon}{lbl}</div>
                <div className="font-mono font-semibold tabular-nums mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent kudos */}
      <Card className="p-5 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="h-4 w-4 text-primary" />
          <div className="font-semibold text-sm">Recent kudos received</div>
          <span className="ml-auto text-[11px] text-muted-foreground">{kudosIn.length} most recent</span>
        </div>
        {kudosIn.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No kudos yet — keep shipping, they'll come.
          </div>
        ) : (
          <ul className="space-y-2 stagger-in">
            {kudosIn.map(k => {
              const from = employeeById(k.fromId);
              if (!from) return null;
              return (
                <li key={k.id} className="flex items-start gap-3 p-3 rounded-md border">
                  <Avatar initials={from.initials} color={from.avatarColor} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium">{from.name}</span>
                      <span
                        className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${strengthColor(k.tag)}22`,
                          color: strengthColor(k.tag),
                        }}
                      >
                        {k.tag}
                      </span>
                      <span className="text-muted-foreground">· {k.amount} 🪙</span>
                      <span className="ml-auto text-[11px] text-muted-foreground font-mono tabular-nums">{k.date}</span>
                    </div>
                    <div className="text-sm mt-1 leading-snug">"{k.message}"</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────

function EntryTile({
  to, search, icon, title, hint, accent,
}: {
  to: string;
  search?: Record<string, unknown>;
  icon: React.ReactNode;
  title: string;
  hint: string;
  accent: string;
}) {
  return (
    <Link
      to={to}
      search={search as never}
      className={cn(
        "group relative rounded-lg border p-4 press-scale hover:shadow-md hover:border-primary/40",
        "bg-card transition-all overflow-hidden",
      )}
    >
      <div
        className="absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: accent, opacity: 0.22 }}
        aria-hidden
      />
      <div className="relative">
        <div
          className="h-9 w-9 rounded-md grid place-items-center mb-2"
          style={{ backgroundColor: `${accent.replace(")", " / 0.15)")}`, color: accent }}
        >
          {icon}
        </div>
        <div className="text-sm font-semibold flex items-center gap-1">
          {title}
          <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{hint}</div>
      </div>
    </Link>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="text-sm font-medium text-right break-all">{value}</div>
    </div>
  );
}

