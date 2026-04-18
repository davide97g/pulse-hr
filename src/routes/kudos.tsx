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
    // confetti burst
    const palette = ["#b4ff39", "#39e1ff", "#c06bff", "#ff6b9a", "#ffd939"];
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
        <Card className="p-6 iridescent-border relative overflow-visible">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md grid place-items-center" style={{ background: "linear-gradient(135deg,#b4ff39,#39e1ff)" }}>
                  <Gift className="h-4 w-4 text-[#0b0b0d]" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Send kudos</div>
                  <div className="text-[11px] text-muted-foreground">Your balance: <span className="font-medium text-foreground tabular-nums">{myBalance}</span> coins</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Monthly allowance</div>
                <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden mt-1">
                  <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(myBalance / 200) * 100}%`, background: "linear-gradient(90deg,#b4ff39,#39e1ff)" }} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>To</Label>
                <Select value={toId} onValueChange={setToId}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {employees.filter(e => e.id !== ME).map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full grid place-items-center text-[9px] font-medium text-white" style={{ backgroundColor: e.avatarColor }}>{e.initials}</span>
                          {e.name} · <span className="text-muted-foreground text-xs">{e.role}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Tell ${employeeById(toId)?.name.split(" ")[0] ?? "them"} why you're grateful…`}
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
                    <Avatar initials={r.employee.initials} color={r.employee.avatarColor} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{r.employee.name}</div>
                      <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width] duration-700"
                          style={{ width: `${(r.coins / maxCoins) * 100}%`, background: i === 0 ? "linear-gradient(90deg,#b4ff39,#39e1ff)" : r.employee.avatarColor }}
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
                <Avatar initials={from.initials} color={from.avatarColor} size={36} />
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
