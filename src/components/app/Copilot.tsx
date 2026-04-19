import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  Send,
  X,
  Wand2,
  Zap,
  CheckCircle2,
  ArrowRight,
  Bot,
  RotateCcw,
  Maximize2,
  Minimize2,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewBadge } from "./NewBadge";
import { copilotSuggestions } from "@/lib/mock-data";
import { buildNudges } from "@/lib/copilot-nudges";
import { answerFor, type ActionCtx, type ActionRunnable } from "@/lib/actions";
import { voiceBus } from "@/lib/voice-bus";
import { cn } from "@/lib/utils";

const EXPAND_KEY = "pulse.copilot.expanded";

type Msg =
  | { role: "user"; id: string; text: string }
  | {
      role: "assistant";
      id: string;
      text: string;
      streaming?: boolean;
      actions?: ActionRunnable[];
    };

export function CopilotLauncher({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative inline-flex items-center gap-2 h-9 px-3 rounded-md border bg-background/80 hover:bg-muted text-sm press-scale"
    >
      <Sparkles className="h-4 w-4 text-primary" />
      <span className="font-medium">Ask Pulse</span>
      <NewBadge />
      <kbd className="hidden md:inline-flex h-5 px-1.5 items-center rounded border bg-muted text-[10px] font-mono">
        ⌘J
      </kbd>
    </button>
  );
}

export function CopilotOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const nav = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(EXPAND_KEY) === "1";
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const spaceHoldRef = useRef(false);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);
  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(EXPAND_KEY, expanded ? "1" : "0");
  }, [expanded]);

  const ctx: ActionCtx = {
    navigate: (opts) => {
      nav(opts);
      onOpenChange(false);
    },
  };
  const runAction = (a: ActionRunnable) => {
    void a.run(ctx);
  };

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const uid = `u-${Date.now()}`;
    const aid = `a-${Date.now() + 1}`;
    setMessages((m) => [
      ...m,
      { role: "user", id: uid, text: trimmed },
      { role: "assistant", id: aid, text: "", streaming: true },
    ]);
    setInput("");
    setVoiceDraft(false);
    setThinking(true);

    const { text: answer, actions } = answerFor(trimmed);
    let i = 0;
    const step = () => {
      i += Math.max(2, Math.round(answer.length / 60));
      const slice = answer.slice(0, i);
      setMessages((m) =>
        m.map((x) => (x.id === aid ? { ...x, text: slice, streaming: i < answer.length } : x)),
      );
      if (i < answer.length) {
        setTimeout(step, 18);
      } else {
        setThinking(false);
        setMessages((m) => m.map((x) => (x.id === aid ? { ...x, streaming: false, actions } : x)));
      }
    };
    setTimeout(step, 220);
  }, []);

  const [voiceDraft, setVoiceDraft] = useState(false);

  useEffect(() => {
    return voiceBus.on((ev) => {
      if (ev.kind === "draftPrompt" && ev.text && ev.source === "copilot") {
        setInput((prev) => (prev ? `${prev.trimEnd()} ${ev.text}` : ev.text));
        setVoiceDraft(true);
        setTimeout(() => {
          const el = inputRef.current;
          if (!el) return;
          el.focus();
          try {
            el.setSelectionRange(el.value.length, el.value.length);
          } catch {
            /* noop */
          }
        }, 80);
      } else if (ev.kind === "state") {
        setListening(ev.listening);
      }
    });
  }, []);

  const reset = () => {
    setMessages([]);
    setInput("");
    setVoiceDraft(false);
  };
  const dismissDraft = () => {
    setInput("");
    setVoiceDraft(false);
    inputRef.current?.focus();
  };
  const toggleExpanded = () => setExpanded((v) => !v);

  const onComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
      return;
    }
    if (
      e.code === "Space" &&
      !input &&
      !e.repeat &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.shiftKey
    ) {
      e.preventDefault();
      spaceHoldRef.current = true;
      voiceBus.emit({ kind: "start" });
    }
  };
  const onComposerKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.code === "Space" && spaceHoldRef.current) {
      spaceHoldRef.current = false;
      voiceBus.emit({ kind: "stop" });
    }
  };

  return (
    <>
      <div
        onClick={() => onOpenChange(false)}
        className={cn(
          "fixed inset-0 z-40 bg-background/40 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        aria-hidden={!open}
      />
      <div
        data-copilot="true"
        className={cn(
          "fixed z-50 transition-[transform,opacity,width,height,top,bottom,left,right] duration-200 ease-out",
          !open && "opacity-0 scale-95 translate-y-2 pointer-events-none",
          open && "opacity-100",
          open &&
            (expanded
              ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(820px,calc(100vw-2rem))] h-[min(86vh,720px)]"
              : "right-4 bottom-24 lg:right-6 lg:bottom-24 w-[min(440px,calc(100vw-2rem))] h-[min(620px,calc(100vh-8rem))]"),
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Pulse Copilot"
      >
        <div className="flex flex-col h-full bg-card rounded-xl border shadow-2xl iridescent-border overflow-hidden">
          <div className="px-4 h-12 flex items-center gap-2 border-b shrink-0">
            <div className="h-7 w-7 rounded-md bg-primary/10 text-primary grid place-items-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold flex items-center gap-2">
                Pulse Copilot <NewBadge />
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                AI that reads your HR data and runs actions.
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={reset}
                title="New conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={toggleExpanded}
              title={expanded ? "Minimize" : "Expand"}
            >
              {expanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
            {messages.length === 0 ? (
              expanded ? (
                <EmptyCopilot onPick={send} />
              ) : (
                <CompactEmpty />
              )
            ) : (
              <div className="px-4 py-4 space-y-4">
                {messages.map((m) => (
                  <MessageBubble key={m.id} msg={m} onRun={runAction} />
                ))}
              </div>
            )}
          </div>

          {messages.length === 0 && !expanded && (
            <CompactSuggestions onPick={send} />
          )}

          <div className={cn("p-3 shrink-0", !(messages.length === 0 && !expanded) && "border-t")}>
            {voiceDraft && input && (
              <div className="mb-2 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-primary/[0.06] border border-primary/20 text-[11px] fade-in">
                <Mic className="h-3 w-3 text-primary shrink-0" />
                <span className="text-muted-foreground">
                  Voice draft — review, edit, then send or
                </span>
                <button
                  onClick={dismissDraft}
                  className="text-foreground hover:text-destructive font-medium underline-offset-2 hover:underline"
                >
                  dismiss
                </button>
              </div>
            )}
            <div className="relative rounded-lg flex items-end">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => voiceBus.emit({ kind: "toggle" })}
                className={cn(
                  "h-10 w-10 grid place-items-center shrink-0 press-scale transition-colors rounded-l-lg relative",
                  listening ? "text-destructive" : "text-muted-foreground hover:text-primary",
                )}
                title="Voice dictate — ⌘⇧."
                aria-label="Voice dictate"
              >
                <Mic className="h-4 w-4" />
                {listening && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive pulse-dot" />
                )}
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onComposerKeyDown}
                onKeyUp={onComposerKeyUp}
                rows={1}
                placeholder={
                  messages.length ? "Ask a follow-up…" : "Ask about approvals, hiring, payroll…"
                }
                className="flex-1 resize-none bg-background rounded-lg pl-1 pr-11 py-2.5 text-sm focus:outline-none"
                data-copilot-input="true"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || thinking}
                className="absolute right-1.5 bottom-1.5 h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center disabled:opacity-40 press-scale hover:bg-primary/90"
                aria-label="Send"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-muted-foreground">
              <span>Enter to send · ⌘⇧. to dictate</span>
              <span className="inline-flex items-center gap-1">
                <Bot className="h-3 w-3" />
                mock response only
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CompactSuggestions({ onPick }: { onPick: (q: string) => void }) {
  const nudges = useMemo(() => buildNudges(), []);
  return (
    <div className="px-3 pt-2 pb-1 shrink-0 border-t">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 px-0.5 flex items-center gap-1">
        <Sparkles className="h-2.5 w-2.5" /> Next moves for you
      </div>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1.5 -mb-1">
        {nudges.length > 0 ? (
          nudges.map((n) => (
            <button
              key={n.id}
              onClick={() => onPick(n.prompt)}
              className="group shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border bg-background/60 hover:border-primary/40 hover:bg-primary/[0.04] whitespace-nowrap press-scale transition-colors"
              title={n.prompt}
            >
              <span className="text-sm leading-none">{n.emoji}</span>
              <span>{n.headline}</span>
            </button>
          ))
        ) : (
          copilotSuggestions.slice(0, 4).map((s) => (
            <button
              key={s.id}
              onClick={() => onPick(s.prompt)}
              className="shrink-0 text-xs px-2.5 py-1.5 rounded-full border bg-background/60 hover:border-primary/40 hover:bg-primary/[0.04] whitespace-nowrap press-scale transition-colors"
              title={s.category}
            >
              {s.prompt}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function CompactEmpty() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-3">
        <Wand2 className="h-5 w-5" />
      </div>
      <div className="text-lg font-display leading-snug">Hi — ask me anything.</div>
      <div className="text-xs text-muted-foreground mt-1.5 max-w-[260px]">
        Plain-English queries, drafts, and runnable actions. Tap the mic or hold ⌘⇧Space to dictate.
      </div>
    </div>
  );
}

function EmptyCopilot({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="px-5 py-6">
      <div className="rounded-lg border bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <div className="text-xs uppercase tracking-wider text-primary font-medium">
            Hi, I'm Pulse
          </div>
        </div>
        <div className="text-lg font-display leading-snug">
          Ask in plain English — I can query every corner of your workspace, summarise, draft, and
          run actions for you.
        </div>
      </div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
        Try one of these
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 stagger-in">
        {copilotSuggestions.map((s) => (
          <button
            key={s.id}
            onClick={() => onPick(s.prompt)}
            className="group text-left px-3 py-2.5 rounded-md border hover:border-primary/40 hover:bg-primary/[0.03] transition-colors press-scale"
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              {s.category}
            </div>
            <div className="text-sm flex items-center gap-1.5">
              {s.prompt}
              <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ msg, onRun }: { msg: Msg; onRun: (a: ActionRunnable) => void }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-3.5 py-2 text-sm shadow-sm">
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <div className="h-7 w-7 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl rounded-tl-md bg-muted/60 px-3.5 py-2 text-sm whitespace-pre-wrap">
          {msg.text || (
            <span className="inline-flex items-center gap-0.5 text-muted-foreground">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </span>
          )}
          {msg.streaming && msg.text && (
            <span className="inline-block w-[6px] h-[12px] ml-0.5 align-middle bg-primary/70 animate-pulse" />
          )}
        </div>
        {msg.actions && msg.actions.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {msg.actions.map((a, i) => (
              <button
                key={i}
                onClick={() => onRun(a)}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border press-scale transition-colors",
                  i === 0
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                    : "hover:bg-muted",
                )}
              >
                {i === 0 ? <Zap className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
