import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Sparkles, Send, X, Wand2, Zap, CheckCircle2, ArrowRight, Bot, RotateCcw,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NewBadge } from "./NewBadge";
import { copilotSuggestions } from "@/lib/mock-data";
import { answerFor, type ActionCtx, type ActionRunnable } from "@/lib/actions";
import { cn } from "@/lib/utils";

type Msg =
  | { role: "user"; id: string; text: string }
  | { role: "assistant"; id: string; text: string; streaming?: boolean; actions?: ActionRunnable[] };

export function CopilotLauncher({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative inline-flex items-center gap-2 h-9 px-3 rounded-md border bg-background/80 hover:bg-muted text-sm iridescent-border press-scale"
    >
      <Sparkles className="h-4 w-4 text-primary" />
      <span className="font-medium">Ask Pulse</span>
      <NewBadge />
      <kbd className="hidden md:inline-flex h-5 px-1.5 items-center rounded border bg-muted text-[10px] font-mono">⌘J</kbd>
    </button>
  );
}

export function CopilotOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const nav = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const ctx: ActionCtx = {
    navigate: opts => { nav(opts); onOpenChange(false); },
  };
  const runAction = (a: ActionRunnable) => { void a.run(ctx); };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const uid = `u-${Date.now()}`;
    const aid = `a-${Date.now() + 1}`;
    setMessages(m => [...m, { role: "user", id: uid, text: trimmed }, { role: "assistant", id: aid, text: "", streaming: true }]);
    setInput("");
    setThinking(true);

    const { text: answer, actions } = answerFor(trimmed);
    let i = 0;
    const step = () => {
      i += Math.max(2, Math.round(answer.length / 60));
      const slice = answer.slice(0, i);
      setMessages(m => m.map(x => (x.id === aid ? { ...x, text: slice, streaming: i < answer.length } : x)));
      if (i < answer.length) {
        setTimeout(step, 18);
      } else {
        setThinking(false);
        setMessages(m => m.map(x => (x.id === aid ? { ...x, streaming: false, actions } : x)));
      }
    };
    setTimeout(step, 220);
  };

  const reset = () => { setMessages([]); setInput(""); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 overflow-hidden max-w-[680px] border-0 iridescent-border rounded-xl [&>button.absolute]:hidden"
      >
        <div className="flex flex-col h-[min(640px,calc(100vh-80px))] bg-card">
          <div className="px-4 h-12 flex items-center gap-2 border-b">
            <div className="h-7 w-7 rounded-md bg-primary/10 text-primary grid place-items-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold flex items-center gap-2">
                Pulse Copilot <NewBadge />
              </div>
              <div className="text-[11px] text-muted-foreground">AI that reads your HR data and runs actions. Mock preview.</div>
            </div>
            {messages.length > 0 && (
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={reset} title="New conversation">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
            {messages.length === 0 ? (
              <EmptyCopilot onPick={send} />
            ) : (
              <div className="px-4 py-4 space-y-4">
                {messages.map(m => (
                  <MessageBubble key={m.id} msg={m} onRun={runAction} />
                ))}
              </div>
            )}
          </div>

          <div className="border-t p-3">
            <div className="relative iridescent-border rounded-lg">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                rows={1}
                placeholder={messages.length ? "Ask a follow-up…" : "Ask about approvals, hiring, payroll, anomalies…"}
                className="w-full resize-none bg-background rounded-lg pl-3 pr-11 py-2.5 text-sm focus:outline-none"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || thinking}
                className="absolute right-1.5 top-1.5 h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center disabled:opacity-40 press-scale hover:bg-primary/90"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-muted-foreground">
              <span>Enter to send · Shift+Enter for newline</span>
              <span className="inline-flex items-center gap-1"><Bot className="h-3 w-3" />mock response only</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyCopilot({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="px-5 py-6">
      <div className="rounded-lg border bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <div className="text-xs uppercase tracking-wider text-primary font-medium">Hi, I'm Pulse</div>
        </div>
        <div className="text-lg font-display leading-snug">
          Ask in plain English — I can query every corner of your workspace, summarise, draft, and run actions for you.
        </div>
      </div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Try one of these</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 stagger-in">
        {copilotSuggestions.map(s => (
          <button
            key={s.id}
            onClick={() => onPick(s.prompt)}
            className="group text-left px-3 py-2.5 rounded-md border hover:border-primary/40 hover:bg-primary/[0.03] transition-colors press-scale"
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{s.category}</div>
            <div className="text-sm flex items-center gap-1.5">{s.prompt}<ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></div>
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
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </span>
          )}
          {msg.streaming && msg.text && <span className="inline-block w-[6px] h-[12px] ml-0.5 align-middle bg-primary/70 animate-pulse" />}
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
                    : "hover:bg-muted"
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
