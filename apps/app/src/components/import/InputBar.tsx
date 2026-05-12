import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Link2, Mic, Paperclip, Square } from "lucide-react";
import { MAX_FILES, MAX_FILE_BYTES, MAX_TEXT_BYTES, MAX_VOICE_SECONDS, type Source } from "@pulse-hr/shared/super-import";
import { toast } from "sonner";

type Props = {
  sources: Source[];
  contextNote: string;
  busy: boolean;
  canParse: boolean;
  onAddSource: (s: Source) => void;
  onContextChange: (note: string) => void;
  onParse: () => void;
  onAddBlob: (s: Extract<Source, { kind: "file" } | { kind: "voice" }>, blob: Blob) => void;
};

function uid() {
  return `s_${Math.random().toString(36).slice(2, 10)}`;
}

export function InputBar({ sources, contextNote, busy, canParse, onAddSource, onContextChange, onParse, onAddBlob }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordStartRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);

  const fileCount = sources.filter((s) => s.kind === "file").length;
  const textBytes = sources.filter((s) => s.kind === "text").reduce((n, s) => n + new TextEncoder().encode(s.body).length, 0) + new TextEncoder().encode(contextNote).length;
  const textBudget = `${Math.round((textBytes / MAX_TEXT_BYTES) * 100)}%`;

  const onFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      for (const f of arr) {
        if (fileCount >= MAX_FILES) {
          toast.error(`Max ${MAX_FILES} files per run`);
          return;
        }
        if (f.size > MAX_FILE_BYTES) {
          toast.error(`${f.name} exceeds 5 MB`);
          continue;
        }
        const src: Source = { id: uid(), kind: "file", name: f.name, mime: f.type || "application/octet-stream", size: f.size };
        onAddSource(src);
        onAddBlob(src, f);
      }
    },
    [fileCount, onAddSource, onAddBlob],
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files = Array.from(e.clipboardData.files);
      if (files.length) {
        onFiles(files);
        return;
      }
      const text = e.clipboardData.getData("text/plain");
      if (text && text.length > 40) {
        onAddSource({ id: uid(), kind: "text", body: text });
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onAddSource, onFiles]);

  function addUrl() {
    const v = urlValue.trim();
    if (!v) return;
    try {
      new URL(v);
    } catch {
      toast.error("Invalid URL");
      return;
    }
    onAddSource({ id: uid(), kind: "url", url: v });
    setUrlValue("");
  }

  async function toggleVoice() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (ev) => ev.data.size > 0 && chunksRef.current.push(ev.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const durationSec = Math.min(MAX_VOICE_SECONDS, Math.round((Date.now() - recordStartRef.current) / 1000));
        const src: Source = { id: uid(), kind: "voice", durationSec };
        onAddSource(src);
        onAddBlob(src, blob);
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };
      rec.start();
      recorderRef.current = rec;
      recordStartRef.current = Date.now();
      setRecording(true);
      setTimeout(() => recorderRef.current?.state === "recording" && recorderRef.current.stop(), MAX_VOICE_SECONDS * 1000);
    } catch {
      toast("Mic access denied");
    }
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      className="space-y-3"
    >
      <div className="iridescent-border rounded-2xl">
        <div className="rounded-[14px] bg-background p-6 text-center">
          <div className="font-sans text-base font-medium">Drop anything. Pulse figures out what to import.</div>
          <p className="mt-1 font-serif text-sm italic text-muted-foreground">
            PDF, image, screenshot, URL, paste-text, voice note — bulk insert across people, commesse, candidates, activities.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2.5">
        <input ref={fileInputRef} type="file" multiple hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md bg-muted hover:bg-muted/80"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach files"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={recording ? "Stop recording" : "Record voice"}
          onClick={toggleVoice}
          className={`flex h-8 w-8 items-center justify-center rounded-md ${recording ? "bg-red-500/20 text-red-400" : "bg-muted hover:bg-muted/80"}`}
        >
          {recording ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1">
          <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
            placeholder="paste URL"
            className="w-40 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
        <input
          value={contextNote}
          onChange={(e) => onContextChange(e.target.value)}
          placeholder='Add context — "include everyone from the email below…"'
          className="min-w-[200px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <span className="font-mono text-[10px] text-muted-foreground">{textBudget}</span>
        <button
          type="button"
          disabled={!canParse || busy}
          onClick={onParse}
          className="flex items-center gap-1 rounded-md bg-lime-400 px-3 py-1.5 font-mono text-xs font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Parsing…" : "Parse"}
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
