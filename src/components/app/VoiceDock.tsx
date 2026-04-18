import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { voiceBus } from "@/lib/voice-bus";

type Status = "idle" | "listening" | "processing" | "error";

const BAR_COUNT = 20;

export function VoiceDock() {
  const [status, setStatus] = useState<Status>("idle");
  const [interim, setInterim] = useState("");
  const [bars, setBars] = useState<number[]>(() => Array(BAR_COUNT).fill(3));

  const recognitionRef = useRef<any>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const finalRef = useRef("");
  const interimRef = useRef("");
  const startedAtRef = useRef(0);
  const statusRef = useRef<Status>("idle");

  useEffect(() => {
    statusRef.current = status;
    voiceBus.emit({ kind: "state", listening: status === "listening" });
  }, [status]);

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const stopAnalyser = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    setBars(Array(BAR_COUNT).fill(3));
  }, []);

  const startAnalyser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx = (window as any).AudioContext ?? (window as any).webkitAudioContext;
      const ctx: AudioContext = new Ctx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        const a = analyserRef.current;
        if (!a) return;
        a.getByteTimeDomainData(data);
        const step = Math.max(1, Math.floor(data.length / BAR_COUNT));
        const next: number[] = new Array(BAR_COUNT);
        for (let i = 0; i < BAR_COUNT; i++) {
          let sum = 0;
          for (let j = 0; j < step; j++) {
            const v = (data[i * step + j] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / step);
          next[i] = Math.max(3, Math.min(26, 3 + rms * 90));
        }
        setBars(next);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      console.warn("voice analyser failed", err);
    }
  }, []);

  const insertText = (el: HTMLElement, text: string) => {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      const proto =
        el instanceof HTMLInputElement
          ? window.HTMLInputElement.prototype
          : window.HTMLTextAreaElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const newVal = el.value.slice(0, start) + text + el.value.slice(end);
      setter?.call(el, newVal);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      const cursor = start + text.length;
      try {
        el.setSelectionRange(cursor, cursor);
      } catch {
        /* noop */
      }
    } else if (el.isContentEditable) {
      el.focus();
      document.execCommand("insertText", false, text);
    }
  };

  const streamInsert = (el: HTMLElement, text: string, done: () => void) => {
    let i = 0;
    const step = Math.max(2, Math.round(text.length / 30));
    const tick = () => {
      const next = text.slice(i, i + step);
      if (next) insertText(el, next);
      i += step;
      if (i < text.length) setTimeout(tick, 22);
      else done();
    };
    tick();
  };

  const stop = useCallback(
    (commit: boolean) => {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      try {
        rec?.stop();
      } catch {
        /* noop */
      }
      stopAnalyser();

      const transcript = `${finalRef.current} ${interimRef.current}`.replace(/\s+/g, " ").trim();
      finalRef.current = "";
      interimRef.current = "";
      setInterim("");

      if (!commit || !transcript) {
        setStatus("idle");
        targetRef.current = null;
        return;
      }

      setStatus("processing");
      const target = targetRef.current;
      targetRef.current = null;
      const elapsed = ((performance.now() - startedAtRef.current) / 1000).toFixed(1);
      const words = transcript.split(/\s+/).filter(Boolean).length;

      const inCopilot = target?.closest?.("[data-copilot='true']");
      const isEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target?.isContentEditable ?? false);

      const requestedSource = voiceBus.consumeSource();
      if (requestedSource !== "default") {
        voiceBus.emit({ kind: "draftPrompt", text: transcript, source: requestedSource });
        setStatus("idle");
        return;
      }
      if (inCopilot || !isEditable || !target) {
        voiceBus.emit({ kind: "draftPrompt", text: transcript, source: "copilot" });
        setStatus("idle");
        return;
      }

      streamInsert(target, transcript, () => {
        setStatus("idle");
        toast(`Heard ${words} word${words === 1 ? "" : "s"} · ${elapsed}s`, {
          duration: 1800,
          icon: <Mic className="h-3.5 w-3.5" />,
        });
      });
    },
    [stopAnalyser],
  );

  const start = useCallback(async () => {
    if (statusRef.current === "listening" || statusRef.current === "processing") return;
    if (!supported) {
      toast.error("Voice not supported in this browser", {
        description: "Try Chrome, Edge, or Safari.",
      });
      return;
    }
    const active = document.activeElement as HTMLElement | null;
    targetRef.current = active && active !== document.body ? active : null;
    finalRef.current = "";
    interimRef.current = "";
    setInterim("");
    startedAtRef.current = performance.now();

    try {
      const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = navigator.language || "en-US";
      rec.onresult = (e: any) => {
        let interimStr = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalRef.current += r[0].transcript;
          else interimStr += r[0].transcript;
        }
        interimRef.current = interimStr;
        setInterim(interimStr);
      };
      rec.onerror = (e: any) => {
        console.warn("voice error", e?.error);
        if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
          toast.error("Microphone blocked", {
            description: "Allow mic access in your browser settings.",
          });
        } else if (e?.error === "no-speech") {
          toast("Didn't catch that");
        } else if (e?.error && e.error !== "aborted") {
          toast.error("Voice error", { description: String(e.error) });
        }
        setStatus("error");
        stopAnalyser();
        setTimeout(() => {
          if (statusRef.current === "error") setStatus("idle");
        }, 900);
      };
      rec.onend = () => {
        if (recognitionRef.current === rec) stop(true);
      };
      recognitionRef.current = rec;
      rec.start();
      setStatus("listening");
      void startAnalyser();
    } catch (err) {
      console.warn("voice start failed", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 800);
    }
  }, [startAnalyser, stop, stopAnalyser, supported]);

  const toggle = useCallback(() => {
    if (statusRef.current === "listening") stop(true);
    else start();
  }, [start, stop]);

  useEffect(() => {
    return voiceBus.on((ev) => {
      if (ev.kind === "toggle") toggle();
      else if (ev.kind === "start") {
        if (statusRef.current !== "listening") start();
      } else if (ev.kind === "stop") {
        if (statusRef.current === "listening") stop(true);
      }
    });
  }, [toggle, start, stop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (statusRef.current !== "listening") return;
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        stop(true);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [stop]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* noop */
      }
      stopAnalyser();
    };
  }, [stopAnalyser]);

  const listening = status === "listening";
  const processing = status === "processing";
  const errored = status === "error";

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center">
      <div
        className={cn(
          "pointer-events-auto voice-pill rounded-full flex items-center gap-2 px-2 h-11 transition-[width,box-shadow,opacity] duration-200 select-none",
          listening && "voice-pill-listening",
          errored && "voice-pill-error",
          listening ? "w-[280px]" : processing ? "w-[220px]" : "opacity-70 hover:opacity-100",
        )}
      >
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggle}
          disabled={processing}
          className={cn(
            "h-8 w-8 rounded-full grid place-items-center shrink-0 press-scale transition-colors",
            listening
              ? "bg-destructive text-white"
              : supported
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-muted text-muted-foreground",
          )}
          aria-label={listening ? "Stop dictation" : "Start dictation"}
          title={
            !supported
              ? "Voice not supported in this browser"
              : listening
                ? "Stop (Esc cancels)"
                : "Voice dictate — ⌘⇧."
          }
        >
          {supported ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </button>

        {listening && (
          <div className="flex-1 flex items-center justify-center gap-[2px] h-8 px-1">
            {bars.map((h, i) => (
              <span
                key={i}
                className="voice-wave-bar"
                style={{ height: `${h}px`, opacity: 0.4 + (h / 26) * 0.6 }}
              />
            ))}
          </div>
        )}
        {processing && (
          <div className="flex-1 flex items-center justify-center gap-1 text-muted-foreground">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        {!listening && !processing && (
          <span className="text-[11px] text-muted-foreground pr-2 pl-0.5 hidden sm:inline">
            Dictate
            <kbd className="ml-1.5 font-mono text-[10px] px-1 py-0.5 rounded border bg-muted/60">
              ⌘⇧.
            </kbd>
          </span>
        )}
      </div>

      {listening && interim && (
        <div className="pointer-events-none mt-2 max-w-[340px] text-center text-xs text-muted-foreground bg-background/85 backdrop-blur px-3 py-1.5 rounded-md border shadow-sm fade-in">
          {interim}
        </div>
      )}
    </div>
  );
}
