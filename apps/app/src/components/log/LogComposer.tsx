import { useEffect, useRef, useState } from "react";
import { Mic, Send, X } from "lucide-react";
import { Button } from "@pulse-hr/ui/primitives/button";
import { voiceBus } from "@/lib/voice-bus";
import { cn } from "@/lib/utils";
import type { LogTopic } from "@/lib/mock-data";
import { topicChipMeta } from "./QuickTopicChips";

export function LogComposer({
  onSend,
  disabled,
  seed,
  placeholder,
  activeTopic,
  onClearTopic,
}: {
  onSend: (text: string, voice: boolean) => void;
  disabled?: boolean;
  seed?: string;
  placeholder?: string;
  /** Shown above the field so topic chips feel connected to the next send. */
  activeTopic?: LogTopic;
  onClearTopic?: () => void;
}) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [fromVoice, setFromVoice] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return voiceBus.on((ev) => {
      if (ev.kind === "state") setListening(ev.listening);
      if (ev.kind === "draftPrompt" && ev.source === "log" && ev.text) {
        setText((prev) => (prev ? `${prev.trimEnd()} ${ev.text}` : ev.text));
        setFromVoice(true);
        requestAnimationFrame(() => taRef.current?.focus());
      }
    });
  }, []);

  useEffect(() => {
    if (seed) {
      setText(seed);
      requestAnimationFrame(() => {
        const ta = taRef.current;
        if (!ta) return;
        ta.focus();
        ta.setSelectionRange(seed.length, seed.length);
      });
    }
  }, [seed]);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, fromVoice);
    setText("");
    setFromVoice(false);
  }

  const topicMeta =
    activeTopic && activeTopic !== "freeform" ? topicChipMeta(activeTopic) : null;

  return (
    <div className="border-t bg-background/80 backdrop-blur px-4 md:px-6 py-3">
      {topicMeta && onClearTopic && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
            Next send
          </span>
          <button
            type="button"
            onClick={onClearTopic}
            aria-label={`Clear topic: ${topicMeta.label}`}
            className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary press-scale hover:bg-primary/15"
          >
            <span>{topicMeta.emoji}</span>
            <span>{topicMeta.label}</span>
            <X className="h-3 w-3 opacity-70" aria-hidden />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder ?? "Log a thought, a win, a struggle…"}
          rows={1}
          className="flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            voiceBus.requestSource("log");
            voiceBus.emit({ kind: "toggle" });
          }}
          className={cn("press-scale", listening && "text-destructive")}
          aria-pressed={listening}
          aria-label="Toggle voice capture"
        >
          <Mic className={cn("h-4 w-4", listening && "animate-pulse")} />
        </Button>
        <Button
          type="button"
          size="icon"
          onClick={submit}
          className="press-scale"
          disabled={disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {fromVoice && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Voice draft — review, edit, then send.
        </p>
      )}
    </div>
  );
}
