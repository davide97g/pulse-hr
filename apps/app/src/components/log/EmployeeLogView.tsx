import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clock3,
  History,
  ListChecks,
  MessageCircle,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@pulse-hr/ui/primitives/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@pulse-hr/ui/primitives/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pulse-hr/ui/primitives/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import { Textarea } from "@pulse-hr/ui/primitives/textarea";
import {
  employees,
  employeeLogHealth,
  type LogMessage,
  type LogSentiment,
  type LogTopic,
} from "@/lib/mock-data";
import { logMessagesTable, useLogMessages } from "@/lib/tables/logMessages";
import { managerAsksTable, useManagerAsks } from "@/lib/tables/managerAsks";
import type { LogPreset } from "@/lib/log-presets";
import { QuickTopicChips } from "./QuickTopicChips";
import { PinnedAskCard } from "./PinnedAskCard";
import { PresetPicker } from "./PresetPicker";
import { SentimentRadar } from "./SentimentRadar";

const ME_ID = employees[0].id; // demo: first employee is "me"
const TOPIC_ROOMS: {
  topic: Exclude<LogTopic, "freeform">;
  label: string;
  description: string;
  placeholder: string;
  modalPrompt: string;
  fields: { key: string; label: string; placeholder: string; optional?: boolean }[];
}[] = [
  {
    topic: "status",
    label: "Status",
    description: "Plan, progress, and next moves.",
    placeholder: "Log current state, next move, or blocker...",
    modalPrompt: "What changed, what is next, and anything blocked?",
    fields: [
      { key: "current", label: "Current state", placeholder: "Where does the work stand right now?" },
      { key: "next", label: "Next move", placeholder: "What will you do next?" },
      { key: "blocker", label: "Blocker or risk", placeholder: "Anything blocked or at risk?", optional: true },
    ],
  },
  {
    topic: "win",
    label: "Win",
    description: "Bank progress worth remembering.",
    placeholder: "Bank a win from today...",
    modalPrompt: "What happened, who helped, and why does it matter?",
    fields: [
      { key: "win", label: "What landed", placeholder: "What did you ship, solve, or improve?" },
      { key: "impact", label: "Impact", placeholder: "Why does it matter?" },
      { key: "credit", label: "Credit", placeholder: "Who helped?", optional: true },
    ],
  },
  {
    topic: "pain",
    label: "Pain",
    description: "Name friction before it becomes noise.",
    placeholder: "Name the friction or blocker...",
    modalPrompt: "What is painful, how long has it been happening, and what would reduce it?",
    fields: [
      { key: "pain", label: "Pain point", placeholder: "What is heavier than it should be?" },
      { key: "impact", label: "Impact", placeholder: "How is it affecting your work?" },
      { key: "help", label: "Help needed", placeholder: "What would reduce the friction?", optional: true },
    ],
  },
  {
    topic: "challenge",
    label: "Challenge",
    description: "Work through trade-offs and hard calls.",
    placeholder: "Describe the challenge...",
    modalPrompt: "What is the hard part, what options are on the table, and what is the next move?",
    fields: [
      { key: "challenge", label: "Challenge", placeholder: "What hard thing are you facing?" },
      { key: "options", label: "Options", placeholder: "What paths are you considering?" },
      { key: "next", label: "Next move", placeholder: "What will you try next?" },
    ],
  },
  {
    topic: "feedback",
    label: "Feedback",
    description: "Shape useful feedback and 1:1 notes.",
    placeholder: "Draft feedback or a 1:1 note...",
    modalPrompt: "Who is this for, what happened, and what request should come out of it?",
    fields: [
      { key: "context", label: "Context", placeholder: "Who or what is this about?" },
      { key: "observation", label: "Observation", placeholder: "What happened, plainly?" },
      { key: "request", label: "Request", placeholder: "What should change or continue?" },
    ],
  },
];

const SENTIMENT_OPTIONS: { value: LogSentiment; label: string; helper: string }[] = [
  { value: "positive", label: "Positive", helper: "Energy, progress, or confidence" },
  { value: "neutral", label: "Neutral", helper: "Plain update, no strong signal" },
  { value: "mixed", label: "Mixed", helper: "Some good signal, some friction" },
  { value: "negative", label: "Negative", helper: "Stress, risk, or pain" },
];

type TemplateValues = Record<string, string>;

function emptyValues(room: (typeof TOPIC_ROOMS)[number]): TemplateValues {
  return Object.fromEntries(room.fields.map((field) => [field.key, ""]));
}

function valuesFromLog(room: (typeof TOPIC_ROOMS)[number], text: string): TemplateValues {
  const values = emptyValues(room);
  const byLabel = new Map(
    text.split("\n").flatMap((line) => {
      const idx = line.indexOf(":");
      return idx > 0 ? [[line.slice(0, idx), line.slice(idx + 1).trim()] as const] : [];
    }),
  );
  let matched = false;
  for (const field of room.fields) {
    const value = byLabel.get(field.label);
    if (value) {
      values[field.key] = value;
      matched = true;
    }
  }
  if (!matched && room.fields[0]) values[room.fields[0].key] = text;
  return values;
}

function composeLogText(room: (typeof TOPIC_ROOMS)[number], values: TemplateValues): string {
  return room.fields
    .flatMap((field) => {
      const value = values[field.key]?.trim();
      return value ? [`${field.label}: ${value}`] : [];
    })
    .join("\n");
}

export function EmployeeLogView() {
  const allMsgs = useLogMessages();
  const allAsks = useManagerAsks();
  const msgs = useMemo(() => allMsgs.filter((m) => m.employeeId === ME_ID), [allMsgs]);
  const asks = useMemo(
    () => allAsks.filter((a) => a.employeeId === ME_ID && a.status === "pending"),
    [allAsks],
  );
  const [activeTopic, setActiveTopic] = useState<Exclude<LogTopic, "freeform">>("status");
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LogMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LogMessage | null>(null);
  const activeRoom = TOPIC_ROOMS.find((r) => r.topic === activeTopic) ?? TOPIC_ROOMS[0];

  const health = employeeLogHealth.find((h) => h.employeeId === ME_ID);

  const roomMsgs = useMemo(
    () => msgs.filter((m) => m.topic === activeTopic && m.role === "employee"),
    [activeTopic, msgs],
  );
  const roomLogs = useMemo(
    () => roomMsgs.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [roomMsgs],
  );
  const topicCounts = useMemo(
    () =>
      TOPIC_ROOMS.reduce<Partial<Record<LogTopic, number>>>((acc, room) => {
        acc[room.topic] = msgs.filter((m) => m.topic === room.topic && m.role === "employee").length;
        return acc;
      }, {}),
    [msgs],
  );
  const historyRooms = useMemo(
    () =>
      TOPIC_ROOMS.flatMap((room) => {
        if (room.topic === activeTopic) return [];
        const items = msgs.filter((m) => m.topic === room.topic && m.role === "employee");
        const last = items.reduce<LogMessage | undefined>(
          (latest, item) =>
            !latest || item.createdAt > latest.createdAt ? item : latest,
          undefined,
        );
        return [{ room, count: items.length, last }];
      }),
    [activeTopic, msgs],
  );

  function startPreset(preset: LogPreset) {
    const firstTopic = preset.suggestedTopics.find(
      (t): t is Exclude<LogTopic, "freeform"> => t !== "freeform",
    );
    if (firstTopic) setActiveTopic(firstTopic);
    setEditingLog(null);
    setLogDialogOpen(true);
    toast(`Using template: ${preset.label}`, { icon: <Sparkles className="h-4 w-4" /> });
  }

  function handleAskAnswer(ask: (typeof asks)[number]) {
    setActiveTopic("feedback");
    setEditingLog({
      id: `draft-${ask.id}`,
      employeeId: ME_ID,
      role: "employee",
      text: `Context: ${ask.topic}\nObservation: ${ask.prompt}\nRequest: `,
      createdAt: new Date().toISOString(),
      topic: "feedback",
      sentiment: "neutral",
    });
    setLogDialogOpen(true);
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

  function openCreateLog(topic = activeTopic) {
    setActiveTopic(topic);
    setEditingLog(null);
    setLogDialogOpen(true);
  }

  function openEditLog(log: LogMessage) {
    if (log.topic && log.topic !== "freeform") setActiveTopic(log.topic);
    setEditingLog(log);
    setLogDialogOpen(true);
  }

  function saveLog(input: { text: string; sentiment: LogSentiment }) {
    if (editingLog && !editingLog.id.startsWith("draft-")) {
      logMessagesTable.update(editingLog.id, {
        text: input.text,
        sentiment: input.sentiment,
        topic: activeTopic,
      });
      toast.success("Log updated");
      return;
    }
    logMessagesTable.add({
      id: `lm-log-${Date.now()}`,
      employeeId: ME_ID,
      role: "employee",
      text: input.text,
      createdAt: new Date().toISOString(),
      topic: activeTopic,
      sentiment: input.sentiment,
    });
    toast.success(`${activeRoom.label} log added`);
  }

  function deleteLog(log: LogMessage) {
    logMessagesTable.remove(log.id);
    setDeleteTarget(null);
    toast("Log deleted", {
      action: {
        label: "Undo",
        onClick: () => logMessagesTable.add(log),
      },
    });
  }

  return (
    <div className="flex-1 min-h-0 grid xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-h-0 overflow-y-auto">
        <div className="border-b bg-background/80 backdrop-blur px-4 md:px-6 py-3">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <ListChecks className="h-3.5 w-3.5 text-primary" />
                  {activeRoom.label} template
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{activeRoom.description}</p>
              </div>
              <span className="rounded-full border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
                {topicCounts[activeTopic] ?? 0} log{topicCounts[activeTopic] === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <QuickTopicChips
                onPick={(topic) => {
                  if (topic !== "freeform") setActiveTopic(topic);
                }}
                activeTopic={activeTopic}
                counts={topicCounts}
              />
              <Button size="sm" className="shrink-0 press-scale" onClick={() => openCreateLog()}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add {activeRoom.label.toLowerCase()} log
              </Button>
            </div>
          </div>
        </div>
        <main className="mx-auto w-full max-w-5xl space-y-5 p-4 md:p-6">
          <PresetPicker onPick={startPreset} className="px-0 py-0" />
          {asks.length > 0 && (
            <div className="space-y-2">
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
          <StructuredLogTemplate
            room={activeRoom}
            onSubmit={saveLog}
            onOpenFullForm={() => openCreateLog()}
          />
          <LogHistoryPanel
            room={activeRoom}
            logs={roomLogs}
            onAdd={() => openCreateLog()}
            onEdit={openEditLog}
            onDelete={setDeleteTarget}
            expanded
          />
        </main>
      </div>
      <aside className="hidden xl:flex flex-col border-l bg-muted/20 p-4 gap-4 overflow-y-auto">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <History className="h-3.5 w-3.5" /> Other chats
          </div>
          <div className="mt-3 space-y-2">
            {historyRooms.map(({ room, count, last }) => (
              <button
                key={room.topic}
                type="button"
                onClick={() => setActiveTopic(room.topic)}
                className="group w-full rounded-lg border bg-background/60 p-2.5 text-left transition hover:bg-muted/60"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{room.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock3 className="h-3 w-3" />
                  {last ? last.createdAt.slice(0, 10) : "No entries yet"} · {count} log
                  {count === 1 ? "" : "s"}
                </div>
              </button>
            ))}
          </div>
        </div>
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
      <LogEntryDialog
        open={logDialogOpen}
        onOpenChange={(open) => {
          setLogDialogOpen(open);
          if (!open) setEditingLog(null);
        }}
        room={activeRoom}
        log={editingLog}
        onSave={saveLog}
      />
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this log?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the log from your {activeRoom.label.toLowerCase()} history and recap
              signals. You can undo from the toast right after deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteLog(deleteTarget)}
            >
              Delete log
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StructuredLogTemplate({
  room,
  onSubmit,
  onOpenFullForm,
}: {
  room: (typeof TOPIC_ROOMS)[number];
  onSubmit: (input: { text: string; sentiment: LogSentiment }) => void;
  onOpenFullForm: () => void;
}) {
  const [values, setValues] = useState<TemplateValues>(() => emptyValues(room));
  const [sentiment, setSentiment] = useState<LogSentiment>("neutral");

  useEffect(() => {
    setValues(emptyValues(room));
    setSentiment("neutral");
  }, [room]);

  const canSubmit = room.fields.some((field) => values[field.key]?.trim());
  const selectedSentiment = SENTIMENT_OPTIONS.find((option) => option.value === sentiment);

  function submit() {
    const text = composeLogText(room, values);
    if (!text) return;
    onSubmit({ text, sentiment });
    setValues(emptyValues(room));
    setSentiment("neutral");
  }

  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5 text-primary" />
            Fill the {room.label.toLowerCase()} template
          </div>
          <h2 className="mt-2 font-display text-2xl">{room.modalPrompt}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Structured fields replace the chat. Save the log when the signal is clear enough for
            your personal history and recap.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onOpenFullForm}>
          Open modal
        </Button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="grid gap-3">
          {room.fields.map((field) => (
            <label key={field.key} htmlFor={`log-${room.topic}-${field.key}`} className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                {field.label}
                {field.optional && (
                  <span className="text-xs font-normal text-muted-foreground">optional</span>
                )}
              </span>
              <Textarea
                id={`log-${room.topic}-${field.key}`}
                value={values[field.key] ?? ""}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                }
                placeholder={field.placeholder}
                className="min-h-20 resize-none"
              />
            </label>
          ))}
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border bg-background/60 p-3">
            <div className="text-sm font-medium">Sentiment</div>
            <Select
              value={sentiment}
              onValueChange={(value) => setSentiment(value as LogSentiment)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose sentiment" />
              </SelectTrigger>
              <SelectContent>
                {SENTIMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSentiment && (
              <p className="mt-2 text-xs text-muted-foreground">{selectedSentiment.helper}</p>
            )}
          </div>
          <Button className="w-full" onClick={submit} disabled={!canSubmit}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Save {room.label.toLowerCase()} log
          </Button>
        </div>
      </div>
    </section>
  );
}

function LogHistoryPanel({
  room,
  logs,
  onAdd,
  onEdit,
  onDelete,
  expanded,
}: {
  room: (typeof TOPIC_ROOMS)[number];
  logs: LogMessage[];
  onAdd: () => void;
  onEdit: (log: LogMessage) => void;
  onDelete: (log: LogMessage) => void;
  expanded?: boolean;
}) {
  const visibleLogs = expanded ? logs : logs.slice(0, 8);
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" />
          {room.label} history
        </div>
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={onAdd}>
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>
      {logs.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          No {room.label.toLowerCase()} logs yet. Add one to make it visible in this room and in
          your recap signals.
        </p>
      ) : (
        <ol className={expanded ? "mt-3 grid gap-3 md:grid-cols-2" : "mt-3 space-y-2"}>
          {visibleLogs.map((log) => (
            <li key={log.id} className="rounded-lg border bg-background/60 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <span>{log.createdAt.slice(0, 10)}</span>
                    {log.sentiment && <span>· {log.sentiment}</span>}
                  </div>
                  <p className={expanded ? "mt-1 whitespace-pre-line text-sm leading-relaxed" : "mt-1 line-clamp-3 text-xs leading-relaxed"}>
                    {log.text}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    onClick={() => onEdit(log)}
                    aria-label="Edit log"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(log)}
                    aria-label="Delete log"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function LogEntryDialog({
  open,
  onOpenChange,
  room,
  log,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: (typeof TOPIC_ROOMS)[number];
  log: LogMessage | null;
  onSave: (input: { text: string; sentiment: LogSentiment }) => void;
}) {
  const [values, setValues] = useState<TemplateValues>(() => emptyValues(room));
  const [sentiment, setSentiment] = useState<LogSentiment>("neutral");

  useEffect(() => {
    if (!open) return;
    setValues(log?.text ? valuesFromLog(room, log.text) : emptyValues(room));
    setSentiment(log?.sentiment ?? "neutral");
  }, [log, open, room]);

  function submit() {
    const text = composeLogText(room, values);
    if (!text) return;
    onSave({ text, sentiment });
    onOpenChange(false);
  }

  const selectedSentiment = SENTIMENT_OPTIONS.find((option) => option.value === sentiment);
  const canSubmit = room.fields.some((field) => values[field.key]?.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {log ? "Edit" : "Add"} {room.label.toLowerCase()} log
          </DialogTitle>
          <DialogDescription>{room.modalPrompt}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Context
            </div>
            <p className="mt-1 text-sm">{room.description}</p>
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Sentiment</span>
            <Select
              value={sentiment}
              onValueChange={(value) => setSentiment(value as LogSentiment)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose sentiment" />
              </SelectTrigger>
              <SelectContent>
                {SENTIMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSentiment && (
              <span className="block text-xs text-muted-foreground">
                {selectedSentiment.helper}
              </span>
            )}
          </div>
          <div className="grid gap-3">
            {room.fields.map((field) => (
              <label
                key={field.key}
                htmlFor={`status-log-entry-${field.key}`}
                className="block space-y-2"
              >
                <span className="text-sm font-medium">
                  {field.label}
                  {field.optional && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      optional
                    </span>
                  )}
                </span>
                <Textarea
                  id={`status-log-entry-${field.key}`}
                  value={values[field.key] ?? ""}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="min-h-20 resize-none"
                />
              </label>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={!canSubmit}>
            {log ? "Save changes" : "Add log"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-11 mt-2" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    </svg>
  );
}
