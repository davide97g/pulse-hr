import { Bot, Mic } from "lucide-react";
import { format } from "date-fns";
import type { LogMessage } from "@/lib/mock-data";
import { LogSessionDivider } from "./LogSessionDivider";
import { cn } from "@/lib/utils";

export function LogChatThread({
  messages,
  streamingId,
  pinned,
}: {
  messages: LogMessage[];
  streamingId?: string;
  pinned?: React.ReactNode;
}) {
  const groups = groupByDay(messages);
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 pb-4 scrollbar-thin">
      {pinned}
      {groups.map(([day, items]) => (
        <div key={day}>
          <LogSessionDivider date={day} />
          <ul className="space-y-2">
            {items.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "flex gap-2 fade-in",
                  m.role === "employee" ? "justify-end" : "justify-start",
                )}
              >
                {m.role === "agent" && (
                  <span className="h-7 w-7 shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center">
                    <Bot className="h-4 w-4" />
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[72ch] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    m.role === "employee"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {streamingId === m.id && !m.text ? (
                    <TypingDots />
                  ) : (
                    <>
                      {m.text}
                      {streamingId === m.id && <span className="ml-1 animate-pulse">▍</span>}
                    </>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-[10px] opacity-60">
                    <span>{format(new Date(m.createdAt), "HH:mm")}</span>
                    {m.voice && <Mic className="h-3 w-3" aria-label="voice" />}
                    {m.topic && <span className="uppercase tracking-wide">{m.topic}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </span>
  );
}

function groupByDay(msgs: LogMessage[]): [string, LogMessage[]][] {
  const map = new Map<string, LogMessage[]>();
  for (const m of msgs) {
    const day = m.createdAt.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(m);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}
