import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Gift, Send, Sparkles, Trophy, Heart, Zap, Users, Rocket, ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { NewBadge } from "@/components/app/NewBadge";
import {
  employees, employeeById, kudosSeed, type Kudo,
} from "@/lib/mock-data";
import { isBirthday } from "@/lib/birthday";
import { voiceBus } from "@/lib/voice-bus";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kudos")({
  head: () => ({ meta: [{ title: "Kudos — Pulse HR" }] }),
  component: Kudos,
});

const ME = "e1";

const TAGS: { v: Kudo["tag"]; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { v: "teamwork", label: "Teamwork",  icon: Users,       color: "oklch(0.6 0.16 220)" },
  { v: "craft",    label: "Craft",     icon: Sparkles,    color: "oklch(0.65 0.18 340)" },
  { v: "impact",   label: "Impact",    icon: Rocket,      color: "oklch(0.7 0.15 30)" },
  { v: "courage",  label: "Courage",   icon: ShieldCheck, color: "oklch(0.75 0.15 75)" },
  { v: "kindness", label: "Kindness",  icon: Heart,       color: "oklch(0.65 0.15 155)" },
];
const tagMeta = (v: Kudo["tag"]) => TAGS.find(t => t.v === v)!;

function Kudos() {
  const [feed, setFeed] = useState<Kudo[]>(kudosSeed);
  const [toId, setToId] = useState<string>("e2");
  const [amount, setAmount] = useState(25);
  const [tag, setTag] = useState<Kudo["tag"]>("craft");
  const [message, setMessage] = useState("");

  // Consume a Moments-generated draft if present.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("pulse.kudos.draft");
      if (!raw) return;
      const d = JSON.parse(raw) as { toId?: string; message?: string; tag?: Kudo["tag"]; amount?: number };
      if (d.toId) setToId(d.toId);
      if (d.message) setMessage(d.message);
      if (d.tag) setTag(d.tag);
      if (d.amount) setAmount(d.amount);
      localStorage.removeItem("pulse.kudos.draft");
    } catch {}
  }, []);
  const [confetti, setConfetti] = useState<{ id: number; dx: number; color: string }[]>([]);
  const [myBalance, setMyBalance] = useState(200);
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("pulse.kudos.recent");
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [voiceListening, setVoiceListening] = useState(false);

  useEffect(() => {
    return voiceBus.on((ev) => {
      if (ev.kind === "draftPrompt" && ev.text && ev.source === "kudos") {
        const raw = ev.text.trim();
        // Name match (longest-first to prefer "Marcus Rivera" before "Marcus")
        const sorted = [...employees].sort((a, b) => b.name.length - a.name.length);
        const nameHit = sorted.find(
          e => e.id !== ME && raw.toLowerCase().includes(e.name.toLowerCase().split(" ")[0]),
        );
        if (nameHit) setToId(nameHit.id);
        // Tag match
        const tagHit = TAGS.find(t => raw.toLowerCase().includes(t.v));
        if (tagHit) setTag(tagHit.v);
        // Amount match (e.g. "25 coins")
        const amt = raw.match(/\b(5|10|25|50)\b/);
        if (amt) setAmount(Number(amt[1]));
        // Strip name/tag/amount from message
        let rest = raw;
        if (nameHit) {
          rest = rest.replace(new RegExp(nameHit.name, "ig"), "");
          rest = rest.replace(new RegExp(nameHit.name.split(" ")[0], "ig"), "");
        }
        if (tagHit) rest = rest.replace(new RegExp(tagHit.v, "ig"), "");
        rest = rest.replace(/\b(5|10|25|50)\b\s*(coins?)?/gi, "");
        rest = rest.replace(/\b(kudos|to|for|tag|with|amount)\b/gi, "");
        rest = rest.replace(/\s+/g, " ").trim();
        if (rest) setMessage((m) => (m ? `${m} ${rest}` : rest));
      } else if (ev.kind === "state") {
        setVoiceListening(ev.listening);
      }
    });
  }, []);

  const AMOUNTS = [5, 10, 25, 50];

  const board = useMemo(() => {
    const m = new Map<string, number>();
    feed.forEach(k => m.set(k.toId, (m.get(k.toId) ?? 0) + k.amount));
    return [...m.entries()]
      .map(([id, coins]) => ({ employee: employeeById(id)!, coins }))
      .filter(x => x.employee)
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 6);
  }, [feed]);

  const tagCounts = useMemo(() => {
    return TAGS.map(t => ({
      ...t,
      count: feed.filter(k => k.tag === t.v).length,
    }));
  }, [feed]);

  const sent = feed.filter(k => k.fromId === ME).reduce((a, k) => a + k.amount, 0);
  const received = feed.filter(k => k.toId === ME).reduce((a, k) => a + k.amount, 0);

  const send = () => {
    if (!message.trim() || !toId || amount > myBalance) return;
    const k: Kudo = {
      id: `kd-${Date.now()}`,
      fromId: ME, toId, amount, tag,
      message: message.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    setFeed(f => [k, ...f]);
    setMyBalance(b => b - amount);
    setMessage("");
    // Remember recent recipient (most recent first, dedupe, cap 5)
    setRecent((prev) => {
      const next = [toId, ...prev.filter((id) => id !== toId)].slice(0, 5);
      try {
        window.localStorage.setItem("pulse.kudos.recent", JSON.stringify(next));
      } catch { /* noop */ }
      return next;
    });
    // confetti burst — theme primary + neutral, no rainbow
    const palette = ["var(--primary)", "var(--muted-foreground)"];
    const bursts = Array.from({ length: 18 }).map((_, i) => ({
      id: Date.now() + i,
      dx: (Math.random() - 0.5) * 220,
      color: palette[i % palette.length],
    }));
    setConfetti(c => [...c, ...bursts]);
    setTimeout(() => setConfetti([]), 1500);
    const target = employeeById(toId);
    toast.success(`Kudos sent to ${target?.name}`, { description: `${amount} coins · ${tagMeta(tag).label}`, icon: <Gift className="h-4 w-4" /> });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title={<><span>Kudos</span><NewBadge /></>}
        description="Peer recognition that actually lands. Send coins, say why, celebrate out loud."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4 mb-4">
        {/* Sender */}
        <Card className="p-6 relative overflow-visible">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md grid place-items-center bg-primary/15 text-primary">
                  <Gift className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Send kudos</div>
                  <div className="text-[11px] text-muted-foreground">Your balance: <span className="font-medium text-foreground tabular-nums">{myBalance}</span> coins</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly allowance</div>
                <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden mt-1">
                  <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${(myBalance / 200) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>To</Label>
                {recent.length > 0 && (
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-thin -mb-0.5">
                    {recent
                      .map((id) => employeeById(id))
                      .filter((e): e is NonNullable<typeof e> => !!e && e.id !== ME)
                      .map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setToId(e.id)}
                          className={cn(
                            "shrink-0 inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border press-scale transition-colors",
                            toId === e.id
                              ? "border-primary bg-primary/5 text-primary font-medium"
                              : "hover:bg-muted",
                          )}
                          title={`Recent: ${e.name}`}
                        >
                          <span
                            className="h-4 w-4 rounded-full grid place-items-center text-[8px] font-medium text-white shrink-0"
                            style={{ backgroundColor: e.avatarColor }}
                          >
                            {e.initials}
                          </span>
                          <span className="truncate max-w-[80px]">{e.name.split(" ")[0]}</span>
                          {isBirthday(e) && <span>🎂</span>}
                        </button>
                      ))}
                  </div>
                )}
                <Select value={toId} onValueChange={setToId}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {employees.filter(e => e.id !== ME).map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full grid place-items-center text-[9px] font-medium text-white" style={{ backgroundColor: e.avatarColor }}>{e.initials}</span>
                          {e.name}
                          {isBirthday(e) && <span title="Birthday today">🎂</span>}
                          · <span className="text-muted-foreground text-xs">{e.role}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(() => {
                  const target = employeeById(toId);
                  if (target && isBirthday(target)) {
                    return (
                      <div
                        className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2.5 py-1 shimmer"
                        style={{
                          background: "linear-gradient(90deg, oklch(0.75 0.2 85 / 0.18), oklch(0.65 0.2 340 / 0.18), oklch(0.7 0.2 200 / 0.18))",
                          border: "1px solid color-mix(in oklch, oklch(0.75 0.2 85) 35%, transparent)",
                        }}
                      >
                        🎂 Birthday boost · <span className="font-mono tabular-nums">+25% XP</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <div className="grid grid-cols-5 gap-1.5">
                  {TAGS.map(t => {
                    const Icon = t.icon;
                    const active = tag === t.v;
                    return (
                      <button
                        key={t.v}
                        type="button"
                        onClick={() => setTag(t.v)}
                        className={cn(
                          "p-2 rounded-md border text-center press-scale transition-all",
                          active ? "shadow-sm" : "hover:bg-muted/40"
                        )}
                        style={active ? { borderColor: t.color, backgroundColor: `${t.color.replace(")", " / 0.1)")}` } : undefined}
                      >
                        <Icon className="h-4 w-4 mx-auto" style={{ color: active ? t.color : undefined }} />
                        <div className="text-[10px] mt-1">{t.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Amount</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {AMOUNTS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmount(a)}
                      disabled={a > myBalance}
                      className={cn(
                        "py-2.5 rounded-md border font-mono text-sm tabular-nums press-scale transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                        amount === a ? "border-primary bg-primary/5 text-primary font-semibold" : "hover:bg-muted"
                      )}
                    >
                      {a} 🪙
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Message</Label>
                  <button
                    type="button"
                    onClick={() => {
                      voiceBus.requestSource("kudos");
                      voiceBus.emit({ kind: "toggle" });
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border press-scale transition-colors",
                      voiceListening
                        ? "bg-destructive/10 border-destructive/40 text-destructive"
                        : "hover:border-primary/40 hover:text-primary",
                    )}
                    title="Dictate (⌘⇧.)"
                  >
                    <Mic className="h-3 w-3" />
                    {voiceListening ? "Listening…" : "Dictate"}
                  </button>
                </div>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Tell ${employeeById(toId)?.name.split(" ")[0] ?? "them"} why you're grateful — or dictate "kudos to Marcus craft tokens work".`}
                  rows={3}
                  maxLength={200}
                />
                <div className="text-[11px] text-muted-foreground text-right">{message.length}/200</div>
              </div>

              <div className="relative">
                <Button
                  onClick={send}
                  disabled={!message.trim() || !toId || amount > myBalance}
                  className="w-full press-scale relative"
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" /> Send {amount} coins
                </Button>
                {confetti.map(c => (
                  <span
                    key={c.id}
                    className="confetti-piece left-1/2 top-1/2 rounded-sm"
                    style={{ backgroundColor: c.color, ["--dx" as keyof React.CSSProperties]: `${c.dx}px` } as React.CSSProperties}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Leaderboard + stats */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Sent this month</div><div className="text-2xl font-display mt-1 tabular-nums">{sent} 🪙</div></Card>
            <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Received</div><div className="text-2xl font-display mt-1 tabular-nums">{received} 🪙</div></Card>
            <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3" />Streak</div><div className="text-2xl font-display mt-1 tabular-nums">6 weeks</div></Card>
          </div>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-warning" />
              <div className="font-semibold text-sm">Top recipients this month</div>
            </div>
            <div className="space-y-2 stagger-in">
              {board.map((r, i) => {
                const maxCoins = board[0].coins;
                return (
                  <div key={r.employee.id} className="flex items-center gap-3 group">
                    <div className={cn(
                      "w-6 text-center font-mono text-xs tabular-nums",
                      i === 0 ? "text-warning font-bold" : i < 3 ? "font-semibold" : "text-muted-foreground"
                    )}>#{i + 1}</div>
                    <Avatar initials={r.employee.initials} color={r.employee.avatarColor} size={32} employeeId={r.employee.id} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{r.employee.name}</div>
                      <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-[width] duration-700",
                            i === 0 ? "bg-primary" : "bg-muted-foreground/40",
                          )}
                          style={{ width: `${(r.coins / maxCoins) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">{r.coins} 🪙</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="font-semibold text-sm mb-3">Team values in action</div>
            <div className="grid grid-cols-5 gap-2">
              {tagCounts.map(t => {
                const Icon = t.icon;
                return (
                  <div key={t.v} className="p-3 rounded-md border text-center">
                    <Icon className="h-4 w-4 mx-auto" style={{ color: t.color }} />
                    <div className="text-lg font-semibold mt-1 tabular-nums">{t.count}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.label}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Feed */}
      <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="font-semibold text-sm">Kudos feed</div>
          <div className="text-xs text-muted-foreground">Visible to everyone in Acme Inc.</div>
        </div>
        <div className="divide-y stagger-in">
          {feed.map(k => {
            const from = employeeById(k.fromId);
            const to = employeeById(k.toId);
            if (!from || !to) return null;
            const t = tagMeta(k.tag);
            const Icon = t.icon;
            return (
              <div key={k.id} className="px-5 py-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                <Avatar initials={from.initials} color={from.avatarColor} size={36} employeeId={from.id} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold">{from.name}</span>
                    <span className="text-muted-foreground">sent</span>
                    <span className="font-semibold">{to.name}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md border" style={{ borderColor: `${t.color.replace(")"," / 0.5)")}`, color: t.color, backgroundColor: `${t.color.replace(")"," / 0.06)")}` }}>
                      <Icon className="h-3 w-3" />{t.label}
                    </span>
                    <span className="ml-auto text-sm font-semibold tabular-nums">{k.amount} 🪙</span>
                  </div>
                  <div className="text-sm mt-1.5">"{k.message}"</div>
                  <div className="text-[11px] text-muted-foreground mt-1 tabular-nums">{k.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
