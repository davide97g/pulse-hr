import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const TAG_RE = /^[a-z0-9-]{1,24}$/;
const MAX_TAGS = 10;

function normalize(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
}

export function TagInput({
  tags,
  onChange,
  placeholder = "add tag…",
}: {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const next = normalize(raw);
    if (!next || !TAG_RE.test(next)) return;
    if (tags.includes(next)) return;
    if (tags.length >= MAX_TAGS) return;
    onChange([...tags, next]);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 min-h-[22px]">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center h-5 pl-1.5 pr-0.5 rounded-full bg-muted text-[10px] font-medium"
        >
          {t}
          <button
            type="button"
            onClick={() => onChange(tags.filter((x) => x !== t))}
            className="ml-0.5 h-4 w-4 rounded-full hover:bg-background/60 flex items-center justify-center"
            aria-label={`Remove tag ${t}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      {tags.length < MAX_TAGS && (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => commit(draft)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className={cn(
            "bg-transparent text-[11px] outline-none placeholder:text-muted-foreground",
            "min-w-[80px] flex-1 h-5",
          )}
        />
      )}
    </div>
  );
}
