import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  employees,
  logMessages as seedMsgs,
  managerAsks as seedAsks,
  employeeLogHealth,
  type LogMessage,
  type LogTopic,
  type ManagerAsk,
} from "@/lib/mock-data";
import { openerFor, replyTo, streamReply } from "@/lib/log-agent";
import { LogChatThread } from "./LogChatThread";
import { LogComposer } from "./LogComposer";
import { QuickTopicChips } from "./QuickTopicChips";
import { PinnedAskCard } from "./PinnedAskCard";

const ME_ID = employees[0].id; // demo: first employee is "me"

export function EmployeeLogView() {
  const [msgs, setMsgs] = useState<LogMessage[]>(() =>
    seedMsgs.filter((m) => m.employeeId === ME_ID),
  );
  const [asks, setAsks] = useState<ManagerAsk[]>(() =>
    seedAsks.filter((a) => a.employeeId === ME_ID && a.status === "pending"),
  );
  const [streamingId, setStreamingId] = useState<string | undefined>();
  const [pendingTopic, setPendingTopic] = useState<LogTopic | undefined>();

  const health = employeeLogHealth.find((h) => h.employeeId === ME_ID);

  const dailyOpener = useMemo(() => openerFor(new Date(), asks[0]), [asks]);

  const hasOpenerForToday = msgs.some(
    (m) => m.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10) && m.role === "agent",
  );

  useEffect(() => {
    if (!hasOpenerForToday) {
      const id = `lm-opener-${Date.now()}`;
      setMsgs((prev) => [
        ...prev,
        {
          id,
          employeeId: ME_ID,
          role: "agent",
          text: dailyOpener,
          createdAt: new Date().toISOString(),
          topic: "freeform",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSend(text: string, voice: boolean) {
    const userMsg: LogMessage = {
      id: `lm-u-${Date.now()}`,
      employeeId: ME_ID,
      role: "employee",
      text,
      createdAt: new Date().toISOString(),
      voice,
      topic: pendingTopic,
    };
    const agentId = `lm-a-${Date.now() + 1}`;
    const reply = replyTo(text, pendingTopic);
    const agentStub: LogMessage = {
      id: agentId,
      employeeId: ME_ID,
      role: "agent",
      text: "",
      createdAt: new Date().toISOString(),
      topic: reply.topic,
      sentiment: reply.sentiment,
    };
    setMsgs((prev) => [...prev, userMsg, agentStub]);
    setStreamingId(agentId);
    setPendingTopic(undefined);
    streamReply(reply.text, (soFar, done) => {
      setMsgs((prev) => prev.map((m) => (m.id === agentId ? { ...m, text: soFar } : m)));
      if (done) setStreamingId(undefined);
    });
  }

  function handleAskAnswer(_ask: ManagerAsk) {
    setPendingTopic("feedback");
    toast("Composer seeded with the ask — add your answer.", {
      icon: <Sparkles className="h-4 w-4" />,
    });
  }
  function handleAskLater(ask: ManagerAsk) {
    setAsks((prev) => prev.filter((a) => a.id !== ask.id));
    toast("Snoozed — we'll bring it back tomorrow.", {
      action: { label: "Undo", onClick: () => setAsks((p) => [ask, ...p]) },
    });
  }

  return (
    <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col min-h-0">
        <LogChatThread
          messages={msgs}
          streamingId={streamingId}
          pinned={
            asks.length > 0 ? (
              <div className="px-4 md:px-6 pt-2">
                {asks.map((a) => (
                  <PinnedAskCard
                    key={a.id}
                    ask={a}
                    onAnswer={handleAskAnswer}
                    onLater={handleAskLater}
                  />
                ))}
              </div>
            ) : null
          }
        />
        <QuickTopicChips onPick={(t) => setPendingTopic(t)} />
        <LogComposer onSend={handleSend} />
      </div>
      <aside className="hidden lg:flex flex-col border-l bg-muted/20 p-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Your recap
          </div>
          <p className="mt-2 text-sm">{health?.recap ?? "Not enough data yet."}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            14-day sentiment
          </div>
          <Sparkline values={health?.sparkline ?? []} />
        </div>
        <div className="rounded-xl border bg-card p-4 text-sm">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Open asks</div>
          <div className="mt-1 text-2xl font-display">{asks.length}</div>
          <p className="text-xs text-muted-foreground">Pinned in the thread above.</p>
        </div>
      </aside>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const w = 260,
    h = 44,
    pad = 3;
  const xs = values.map((_, i) => pad + (i * (w - pad * 2)) / (values.length - 1));
  const ys = values.map((v) => h / 2 - v * (h / 2 - pad));
  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-11 mt-2">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    </svg>
  );
}
