import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Heart, ShieldCheck, TrendingUp, Users, MessageCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/app/AppShell";
import { NewBadge } from "@/components/app/NewBadge";
import { pulseEntries as seed, type PulseEntry, type Vibe } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pulse")({
  head: () => ({ meta: [{ title: "Team Pulse — Pulse HR" }] }),
  component: Pulse,
});

const VIBES: { v: Vibe; emoji: string; label: string; color: string; score: number }[] = [
  { v: "amazing", emoji: "🤩", label: "Amazing",    color: "oklch(0.78 0.17 150)", score: 5 },
  { v: "good",    emoji: "😊", label: "Good",       color: "oklch(0.75 0.15 95)",  score: 4 },
  { v: "meh",     emoji: "😐", label: "Meh",        color: "oklch(0.72 0.1 75)",   score: 3 },
  { v: "rough",   emoji: "😣", label: "Rough",      color: "oklch(0.7 0.17 40)",   score: 2 },
  { v: "awful",   emoji: "😭", label: "Awful",      color: "oklch(0.6 0.22 25)",   score: 1 },
];
const vibeMeta = (v: Vibe) => VIBES.find(x => x.v === v)!;

function Pulse() {
  const [entries, setEntries] = useState<PulseEntry[]>(seed);
  const [today, setToday] = useState<Vibe | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!today) return;
    const e: PulseEntry = {
      id: `pl-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      vibe: today,
      note: note.trim() || undefined,
      tag: "other",
    };
    setEntries(arr => [e, ...arr]);
    setSubmitted(true);
    toast.success("Vibe logged — anonymously", { description: "Your response is not attached to your identity." });
  };

  const stats = useMemo(() => {
    const last7 = entries.slice(-7);
    const avg = last7.reduce((a, e) => a + vibeMeta(e.vibe).score, 0) / Math.max(1, last7.length);
    const prev7 = entries.slice(-14, -7);
    const prevAvg = prev7.reduce((a, e) => a + vibeMeta(e.vibe).score, 0) / Math.max(1, prev7.length);
    const counts = VIBES.map(v => ({
      ...v,
      count: last7.filter(e => e.vibe === v.v).length,
    }));
    const total = counts.reduce((a, c) => a + c.count, 0);
    const participation = Math.round(Math.min(100, (last7.length / 12) * 100));
    return { avg, prevAvg, counts, total, participation, last7, delta: avg - prevAvg };
  }, [entries]);

  const heatmap = useMemo(() => {
    // last 42 days → 6 weeks × 7 days
    const last = entries.slice(-42);
    return last;
  }, [entries]);

  const notes = entries.filter(e => e.note).slice(-8).reverse();

  return (
    <div className="p-6 max-w-[1200px] mx-auto fade-in">
      <PageHeader
        title={<><span>Team Pulse</span><NewBadge /></>}
        description="Anonymous daily vibe check. Detect burnout and celebrate good weeks — without surveillance."
        actions={
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground border rounded-md px-2.5 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span>Fully anonymized · aggregated over 3+ responses</span>
          </div>
        }
      />

      {/* Today check-in */}
      <Card className="p-6 mb-4 iridescent-border relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">Today's check-in</div>
            <NewBadge label="DAILY" />
          </div>
          <div className="font-display text-3xl leading-tight max-w-xl">
            {submitted ? "Thanks — vibe logged." : "How was work today?"}
          </div>
          {!submitted ? (
            <>
              <div className="grid grid-cols-5 gap-2 mt-5 max-w-2xl">
                {VIBES.map(v => (
                  <button
                    key={v.v}
                    onClick={() => setToday(v.v)}
                    className={cn(
                      "group p-4 rounded-xl border-2 transition-all press-scale text-center",
                      today === v.v ? "border-primary bg-primary/5 shadow-md scale-[1.03]" : "border-transparent hover:border-border hover:bg-muted/40"
                    )}
                    style={today === v.v ? { borderColor: v.color, backgroundColor: `${v.color.replace(")", " / 0.08)").replace("oklch(", "oklch(")}` } : undefined}
                  >
                    <div className={cn("text-4xl transition-transform", today === v.v && "scale-110")}>{v.emoji}</div>
                    <div className="text-[11px] mt-2 font-medium uppercase tracking-wider text-muted-foreground">{v.label}</div>
                  </button>
                ))}
              </div>
              {today && (
                <div className="mt-5 space-y-3 fade-in max-w-2xl">
                  <div className="space-y-1.5">
                    <Label>Anything to add? (optional, anonymous)</Label>
                    <Input
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="One thing that shaped today…"
                      maxLength={140}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{note.length}/140</span>
                    <Button className="press-scale" onClick={submit}>Submit anonymously</Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-5 text-sm text-muted-foreground max-w-2xl">
              Your vibe is added to this week's team score. You'll be able to check in again tomorrow.
            </div>
          )}
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 stagger-in">
        <Card className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><TrendingUp className="h-3 w-3" />Team score</div>
          <div className="text-3xl font-display mt-1 tabular-nums">{stats.avg.toFixed(1)}<span className="text-lg text-muted-foreground">/5</span></div>
          <div className={cn("text-xs mt-1 tabular-nums", stats.delta >= 0 ? "text-success" : "text-destructive")}>
            {stats.delta >= 0 ? "▲" : "▼"} {Math.abs(stats.delta).toFixed(2)} vs prev week
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Users className="h-3 w-3" />Participation</div>
          <div className="text-3xl font-display mt-1 tabular-nums">{stats.participation}%</div>
          <div className="h-1.5 mt-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${stats.participation}%`, background: "linear-gradient(90deg,#b4ff39,#39e1ff)" }} />
          </div>
        </Card>
        <Card className="p-5 col-span-2">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Distribution · last 7 days</div>
          <div className="flex items-end gap-2 h-20 mt-3">
            {stats.counts.map(c => (
              <div key={c.v} className="flex-1 text-center">
                <div className="h-14 w-full bg-muted rounded-md flex items-end overflow-hidden">
                  <div
                    className="w-full rounded-md transition-[height] duration-700"
                    style={{ height: `${stats.total ? (c.count / stats.total) * 100 : 0}%`, backgroundColor: c.color }}
                  />
                </div>
                <div className="text-sm mt-1">{c.emoji}</div>
                <div className="text-[10px] text-muted-foreground tabular-nums">{c.count}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-sm">Mood heatmap · last 6 weeks</div>
            <div className="text-xs text-muted-foreground">Each cell is one anonymized response. Hover to see the note.</div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
            <div key={d} className="text-[10px] text-muted-foreground text-center uppercase tracking-wider">{d}</div>
          ))}
          {heatmap.map(e => {
            const m = vibeMeta(e.vibe);
            return (
              <div
                key={e.id}
                className="aspect-square rounded-md border relative group cursor-pointer transition-transform hover:scale-110 hover:z-10"
                style={{ backgroundColor: `${m.color.replace("oklch(", "oklch(").replace(")", " / 0.55)")}` }}
                title={e.date}
              >
                <div className="absolute inset-0 grid place-items-center text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-background/70 rounded-md">
                  {m.emoji}
                </div>
                {e.note && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-md bg-foreground text-background text-[11px] shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                    <div className="font-medium mb-1">{e.date} · {m.label}</div>
                    <div className="leading-snug">"{e.note}"</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Anonymous notes */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-4 w-4 text-primary" />
          <div className="font-semibold text-sm">What the team is saying</div>
          <span className="ml-auto text-[11px] text-muted-foreground inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI-clustered
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 stagger-in">
          {notes.map((n, i) => {
            const m = vibeMeta(n.vibe);
            return (
              <div key={n.id} className="p-3 rounded-md border hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{n.tag ?? "other"}</span>
                  <Heart className="h-3 w-3 text-muted-foreground ml-auto cursor-pointer hover:text-destructive hover:fill-destructive transition-colors" onClick={() => toast("You affirmed this vibe", { description: "Still anonymous." })} />
                </div>
                <div className="text-sm">"{n.note}"</div>
                <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">{n.date} · anonymous #{i + 1}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
