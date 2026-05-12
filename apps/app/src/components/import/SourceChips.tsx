import type { Source } from "@pulse-hr/shared/super-import";
import { File, Link2, Mic, Type, X } from "lucide-react";

type Props = { sources: Source[]; onRemove: (id: string) => void };

const ICONS: Record<Source["kind"], typeof File> = {
  file: File,
  url: Link2,
  voice: Mic,
  text: Type,
};

function labelFor(s: Source): string {
  switch (s.kind) {
    case "file":
      return `${s.name} · ${Math.round(s.size / 1024)} KB`;
    case "url":
      return s.url;
    case "voice":
      return `voice · ${s.durationSec}s`;
    case "text":
      return `text · ${s.body.length} chars`;
  }
}

export function SourceChips({ sources, onRemove }: Props) {
  if (sources.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {sources.map((s, i) => {
        const Icon = ICONS[s.kind];
        const isVoice = s.kind === "voice";
        return (
          <span
            key={s.id}
            style={{ animationDelay: `${i * 40}ms` }}
            className={`stagger-in flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] ${
              isVoice ? "voice-pill" : "border-border bg-card"
            }`}
          >
            <Icon className="h-3 w-3" />
            <span className="max-w-[200px] truncate">{labelFor(s)}</span>
            <button onClick={() => onRemove(s.id)} aria-label="Remove" className="ml-0.5 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
