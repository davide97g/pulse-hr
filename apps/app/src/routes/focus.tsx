import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Focus,
  Play,
  Pause,
  Square,
  Flame,
  CalendarOff,
  Bell,
  BellOff,
  Headphones,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Switch } from "@pulse-hr/ui/primitives/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import { PageHeader } from "@/components/app/AppShell";
import { NewBadge } from "@pulse-hr/ui/atoms/NewBadge";
import { commesse, commessaById, type FocusSession } from "@/lib/mock-data";
import { focusSessionsTable, useFocusSessions } from "@/lib/tables/focusSessions";
import { updateFocusPrefs, useFocusPrefs } from "@/lib/focus-prefs";
import { useWorkspace } from "@/components/app/WorkspaceContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/focus")({
  head: () => ({ meta: [{ title: "Focus Mode — Pulse HR" }] }),
  component: FocusPage,
});

const PRESETS = [
  { m: 25, label: "Pomodoro" },
  { m: 50, label: "Deep work" },
  { m: 90, label: "Flow state" },
  { m: 120, label: "Monk mode" },
];

function FocusPage() {
  const sessions = useFocusSessions();
  const workspace = useWorkspace();
  const [commessaId, setCommessaId] = useState(workspace.activeCommessaId);
  useEffect(() => {
    setCommessaId(workspace.activeCommessaId);
  }, [workspace.activeCommessaId]);
  const prefs = useFocusPrefs();
  const { duration, declineMeetings, muteSlack, soundscape } = prefs;
  const setDuration = (m: number) => updateFocusPrefs({ duration: m });
  const setDeclineMeetings = (v: boolean) => updateFocusPrefs({ declineMeetings: v });
  const setMuteSlack = (v: boolean) => updateFocusPrefs({ muteSlack: v });
  const setSoundscape = (v: "lofi" | "rain" | "brown" | "off") =>
    updateFocusPrefs({ soundscape: v });
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(duration * 60);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          setRunning(false);
          completeSession(duration);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [running, duration]);

  useEffect(() => {
    if (!running) setRemaining(duration * 60);
  }, [duration, running]);

  const start = () => {
    setRemaining(duration * 60);
    setRunning(true);
    toast.success("Focus session started", {
      description: `${duration}m on ${commessaById(commessaId)?.code}${declineMeetings ? " · auto-declining meetings" : ""}`,
      icon: <Focus className="h-4 w-4" />,
    });
  };
  const abort = () => {
    setRunning(false);
    setRemaining(duration * 60);
    toast("Session cancelled");
  };

  const completeSession = (mins: number) => {
    const s: FocusSession = {
      id: `fs-${Date.now()}`,
      employeeId: "e1",
      date: new Date().toISOString().slice(0, 10),
      startedAt: new Date().toTimeString().slice(0, 5),
      durationMin: mins,
      commessaId,
      meetingsDeclined: declineMeetings ? Math.floor(Math.random() * 3) + 1 : 0,
    };
    focusSessionsTable.add(s);
    toast.success("Session complete · take a break", {
      description: `${mins}m logged against ${commessaById(commessaId)?.code}`,
      icon: <Sparkles className="h-4 w-4" />,
    });
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const totalToday = sessions
      .filter((s) => s.date === today)
      .reduce((a, s) => a + s.durationMin, 0);
    const declined = sessions.reduce((a, s) => a + s.meetingsDeclined, 0);
    // streak: consecutive days with >= 60m
    const byDay = new Map<string, number>();
    sessions.forEach((s) => byDay.set(s.date, (byDay.get(s.date) ?? 0) + s.durationMin));
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if ((byDay.get(key) ?? 0) >= 60) streak++;
      else break;
    }
    return {
      totalToday,
      declined,
      streak,
      totalMin: sessions.reduce((a, s) => a + s.durationMin, 0),
    };
  }, [sessions]);

  const progress = ((duration * 60 - remaining) / (duration * 60)) * 100;
  const activeCommessa = commessaById(commessaId);

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto fade-in">
      <PageHeader
        title={
          <>
            <span>Focus Mode</span>
            <NewBadge />
          </>
        }
        description="Block the world out, ship what matters, log it to a commessa. Auto-decline meetings and mute Slack while you're in flow."
      />

      {/* Timer hero */}
      <Card
        className={cn(
          "p-0 mb-4 relative overflow-hidden iridescent-border",
          running && "shadow-[0_0_60px_-20px_rgba(180,255,57,0.35)]",
        )}
      >
        <div className="absolute inset-0 opacity-[0.08] grid-bg pointer-events-none" aria-hidden />
        <div
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700"
          style={{
            backgroundColor: activeCommessa?.color,
            opacity: running ? 0.35 : 0.12,
          }}
          aria-hidden
        />
        <div className="relative p-8 md:p-12 text-center">
          {running && (
            <div className="inline-flex items-center gap-2 text-xs text-success font-medium mb-4">
              <span className="h-2 w-2 rounded-full bg-success pulse-dot" />
              IN FLOW · don't disturb
            </div>
          )}
          <div className="font-mono text-[96px] md:text-[144px] leading-none tabular-nums tracking-tight select-none">
            {fmt(remaining)}
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {running ? (
              <>
                Working on{" "}
                <span className="font-medium text-foreground">{activeCommessa?.code}</span> ·{" "}
                {activeCommessa?.name}
              </>
            ) : (
              <>Ready when you are — pick a commessa and session length below.</>
            )}
          </div>

          {/* progress ring replacement: horizontal bar */}
          <div className="max-w-md mx-auto mt-6">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            {!running ? (
              <Button size="lg" onClick={start} className="press-scale h-12 px-6 text-base">
                <Play className="h-5 w-5 mr-2" /> Start focusing
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setRunning(false)}
                  className="press-scale h-12 px-5"
                >
                  <Pause className="h-5 w-5 mr-2" /> Pause
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={abort}
                  className="press-scale h-12 px-5 text-destructive hover:bg-destructive/10"
                >
                  <Square className="h-5 w-5 mr-2" /> End
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Session setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
            Session length
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.m}
                disabled={running}
                onClick={() => setDuration(p.m)}
                className={cn(
                  "p-3 rounded-md border text-left press-scale transition-colors disabled:opacity-50",
                  duration === p.m ? "border-primary bg-primary/5" : "hover:bg-muted",
                )}
              >
                <div className="font-mono text-lg font-semibold tabular-nums">{p.m}m</div>
                <div className="text-[11px] text-muted-foreground">{p.label}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
            Commessa
          </div>
          <Select value={commessaId} onValueChange={setCommessaId} disabled={running}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {commesse
                .filter((c) => c.status === "active")
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="font-mono text-xs">{c.code}</span> · {c.name}
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {activeCommessa && (
            <div className="mt-3 p-3 rounded-md border text-xs text-muted-foreground">
              Hours will auto-log to{" "}
              <span className="font-medium text-foreground">{activeCommessa.code}</span> as a draft
              timesheet entry.
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
            Deep-work automations
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CalendarOff className="h-3.5 w-3.5" />
                Auto-decline meetings
              </div>
              <Switch checked={declineMeetings} onCheckedChange={setDeclineMeetings} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                {muteSlack ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                Mute Slack
              </div>
              <Switch checked={muteSlack} onCheckedChange={setMuteSlack} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Headphones className="h-3.5 w-3.5" />
                Soundscape
              </div>
              <Select
                value={soundscape}
                onValueChange={(v) => setSoundscape(v as typeof soundscape)}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lofi">Lo-fi beats</SelectItem>
                  <SelectItem value="rain">Rain</SelectItem>
                  <SelectItem value="brown">Brown noise</SelectItem>
                  <SelectItem value="off">Silence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats + history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-4 w-4 text-warning" />
            <div className="font-semibold text-sm">Focus stats</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Today" value={`${stats.totalToday}m`} big />
            <Stat label="Streak" value={`${stats.streak}d`} accent big />
            <Stat label="Total logged" value={`${Math.round(stats.totalMin / 60)}h`} />
            <Stat label="Meetings dodged" value={`${stats.declined}`} />
          </div>
          <div className="mt-5 rounded-lg border p-4 bg-gradient-to-br from-warning/[0.08] via-transparent to-transparent">
            <div className="flex items-center gap-2 mb-1.5">
              <Flame className="h-3.5 w-3.5 text-warning" />
              <div className="text-[11px] uppercase tracking-wider text-warning font-semibold">
                Streak protection
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ship at least 60 minutes of focused work every weekday to keep your streak alive.
              Weekends don't count against you.
            </p>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">Recent sessions</div>
              <div className="text-xs text-muted-foreground">
                Auto-logged to your timesheet as drafts.
              </div>
            </div>
          </div>
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No sessions yet — start your first deep-work block above.
            </div>
          ) : (
            <div className="divide-y stagger-in">
              {[...sessions]
                .sort((a, b) => (b.date + b.startedAt).localeCompare(a.date + a.startedAt))
                .slice(0, 8)
                .map((s) => {
                  const c = commessaById(s.commessaId);
                  return (
                    <div
                      key={s.id}
                      className="px-5 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div
                        className="h-9 w-1 rounded-full shrink-0"
                        style={{ backgroundColor: c?.color ?? "var(--color-muted)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded border bg-muted/60">
                            {c?.code}
                          </span>
                          <span className="text-sm font-medium truncate">{c?.name}</span>
                          {s.note && (
                            <span className="text-xs text-muted-foreground truncate">
                              · {s.note}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums mt-0.5">
                          {s.date} · started {s.startedAt}
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="font-mono text-sm tabular-nums font-semibold">
                          {s.durationMin}m
                        </div>
                        {s.meetingsDeclined > 0 && (
                          <div className="text-[10px] text-muted-foreground tabular-nums">
                            {s.meetingsDeclined} meeting{s.meetingsDeclined > 1 ? "s" : ""} dodged
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  );
                })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  big,
  accent,
}: {
  label: string;
  value: string;
  big?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={cn("p-3 rounded-md border", accent && "border-warning/40 bg-warning/5")}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "font-mono font-semibold tabular-nums mt-0.5",
          big ? "text-2xl" : "text-lg",
          accent && "text-warning",
        )}
      >
        {value}
      </div>
    </div>
  );
}
