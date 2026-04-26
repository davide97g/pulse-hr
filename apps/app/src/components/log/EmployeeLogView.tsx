import { useEffect, useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import {
  employees,
  employeeLogHealth,
  type LogMessage,
  type LogTopic,
  type ManagerAsk,
} from "@/lib/mock-data";
import { logMessagesTable, useLogMessages } from "@/lib/tables/logMessages";
import { managerAsksTable, useManagerAsks } from "@/lib/tables/managerAsks";
import { openerFor, replyTo, streamReply } from "@/lib/log-agent";
import { type LogPreset, presetById } from "@/lib/log-presets";
import { LogChatThread } from "./LogChatThread";
import { LogComposer } from "./LogComposer";
import { QuickTopicChips } from "./QuickTopicChips";
import { PinnedAskCard } from "./PinnedAskCard";
import { PresetPicker } from "./PresetPicker";
import { SentimentRadar } from "./SentimentRadar";

const ME_ID = employees[0].id; // demo: first employee is "me"

export function EmployeeLogView() {
  const allMsgs = useLogMessages();
  const allAsks = useManagerAsks();
  const msgs = useMemo(() => allMsgs.filter((m) => m.employeeId === ME_ID), [allMsgs]);
  const asks = useMemo(
    () => allAsks.filter((a) => a.employeeId === ME_ID && a.status === "pending"),
    [allAsks],
  );
  const [streamingId, setStreamingId] = useState<string | undefined>();
  const [pendingTopic, setPendingTopic] = useState<LogTopic | undefined>();
  const [composerSeed, setComposerSeed] = useState<string | undefined>();
  const [activePresetId, setActivePresetId] = useState<string | undefined>();
  const activePreset = activePresetId ? presetById(activePresetId) : undefined;

  const health = employeeLogHealth.find((h) => h.employeeId === ME_ID);

  const today = new Date().toISOString().slice(0, 10);
  const todayMsgs = useMemo(
    () => msgs.filter((m) => m.createdAt.slice(0, 10) === today),
    [msgs, today],
  );
  const showPresets = todayMsgs.filter((m) => m.role === "employee").length === 0;

  const dailyOpener = useMemo(() => openerFor(new Date(), asks[0]), [asks]);

  const hasOpenerForToday = todayMsgs.some((m) => m.role === "agent");

  useEffect(() => {
    if (!hasOpenerForToday) {
      const id = `lm-opener-${Date.now()}`;
      logMessagesTable.add({
        id,
        employeeId: ME_ID,
        role: "agent",
        text: dailyOpener,
        createdAt: new Date().toISOString(),
        topic: "freeform",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startPreset(preset: LogPreset) {
    setActivePresetId(preset.id);
    if (preset.composerSeed) setComposerSeed(preset.composerSeed);
    if (preset.suggestedTopics[0]) setPendingTopic(preset.suggestedTopics[0]);
    const id = `lm-preset-${Date.now()}`;
    logMessagesTable.add({
      id,
      employeeId: ME_ID,
      role: "agent",
      text: preset.opener,
      createdAt: new Date().toISOString(),
      topic: preset.suggestedTopics[0] ?? "freeform",
    });
    toast(`Started: ${preset.label}`, { icon: <Sparkles className="h-4 w-4" /> });
  }

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
    const reply = replyTo(text, {
      hint: pendingTopic,
      persona: activePreset?.persona,
      history: msgs.slice(-6),
    });
    const agentStub: LogMessage = {
      id: agentId,
      employeeId: ME_ID,
      role: "agent",
      text: "",
      createdAt: new Date().toISOString(),
      topic: reply.topic,
      sentiment: reply.sentiment,
    };
    logMessagesTable.add(userMsg);
    logMessagesTable.add(agentStub);
    setStreamingId(agentId);
    setPendingTopic(undefined);
    setComposerSeed(undefined);
    streamReply(reply.text, (soFar, done) => {
      logMessagesTable.update(agentId, { text: soFar });
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
    managerAsksTable.update(ask.id, { status: "snoozed" });
    toast("Snoozed — we'll bring it back tomorrow.", {
      action: {
        label: "Undo",
        onClick: () => managerAsksTable.update(ask.id, { status: "pending" }),
      },
    });
  }

  const topicChips = activePreset?.suggestedTopics;

  return (
    <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col min-h-0">
        <LogChatThread
          messages={msgs}
          streamingId={streamingId}
          pinned={
            <>
              {showPresets && !activePreset && <PresetPicker onPick={startPreset} />}
              {activePreset && (
                <ActivePresetBanner
                  preset={activePreset}
                  onClear={() => setActivePresetId(undefined)}
                />
              )}
              {asks.length > 0 && (
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
              )}
            </>
          }
        />
        <QuickTopicChips onPick={(t) => setPendingTopic(t)} preferredTopics={topicChips} />
        <LogComposer onSend={handleSend} seed={composerSeed} />
      </div>
      <aside className="hidden lg:flex flex-col border-l bg-muted/20 p-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Your recap
          </div>
          <p className="mt-2 text-sm">{health?.recap ?? "Not enough data yet."}</p>
        </div>
        {health && (
          <div className="rounded-xl border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              How you've been
            </div>
            <SentimentRadar values={health.dimensions} size={180} />
          </div>
        )}
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

function ActivePresetBanner({
  preset,
  onClear,
}: {
  preset: LogPreset;
  onClear: () => void;
}) {
  const Icon = preset.icon;
  return (
    <div className="px-4 md:px-6 pt-3">
      <div className="flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur px-3 py-1.5 text-xs">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium">{preset.label}</span>
        <span className="text-muted-foreground hidden sm:inline">· {preset.description}</span>
        <button
          type="button"
          onClick={onClear}
          aria-label="End preset"
          className="ml-auto text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
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
