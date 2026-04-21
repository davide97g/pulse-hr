import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { employees } from "@/lib/mock-data";
import { logMessagesTable, useLogMessages } from "@/lib/tables/logMessages";
import { replyTo, streamReply } from "@/lib/log-agent";
import { LogChatThread } from "@/components/log/LogChatThread";
import { LogComposer } from "@/components/log/LogComposer";
import { cn } from "@/lib/utils";

const ME_ID = employees[0].id;

export function LogOverlay({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const nav = useNavigate();
  const allMsgs = useLogMessages();
  const msgs = useMemo(() => allMsgs.filter((m) => m.employeeId === ME_ID).slice(-8), [allMsgs]);
  const [streamingId, setStreamingId] = useState<string | undefined>();

  function send(text: string, voice: boolean) {
    const userId = `lm-u-${Date.now()}`;
    const agentId = `lm-a-${Date.now() + 1}`;
    const reply = replyTo(text);
    logMessagesTable.add({
      id: userId,
      employeeId: ME_ID,
      role: "employee",
      text,
      createdAt: new Date().toISOString(),
      voice,
    });
    logMessagesTable.add({
      id: agentId,
      employeeId: ME_ID,
      role: "agent",
      text: "",
      createdAt: new Date().toISOString(),
      topic: reply.topic,
      sentiment: reply.sentiment,
    });
    setStreamingId(agentId);
    streamReply(reply.text, (soFar, done) => {
      logMessagesTable.update(agentId, { text: soFar });
      if (done) setStreamingId(undefined);
    });
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 pointer-events-none transition-opacity",
        open ? "opacity-100 pointer-events-auto" : "opacity-0",
      )}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-background border-l shadow-2xl flex flex-col">
        <header className="flex items-center justify-between px-4 h-12 border-b">
          <span className="text-sm font-medium">Status Log</span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
                nav({ to: "/log" });
              }}
              aria-label="Open full log"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <LogChatThread messages={msgs} streamingId={streamingId} />
        <LogComposer onSend={send} />
      </aside>
    </div>
  );
}
