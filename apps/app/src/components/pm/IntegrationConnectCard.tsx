import { useState } from "react";
import { toast } from "sonner";
import { Plug, PlugZap, RefreshCw, AlertTriangle, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fakeOAuthConnect,
  fakeDisconnect,
  mockWebhookEvent,
  providerLabel,
  providerAccent,
} from "@/lib/integrations";
import type { IntegrationConnection, IntegrationProvider } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function relativeTime(iso?: string): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function IntegrationConnectCard({
  connection,
  onChange,
  provider,
}: {
  connection: IntegrationConnection;
  onChange: (c: IntegrationConnection) => void;
  provider: IntegrationProvider;
}) {
  const [busy, setBusy] = useState<"connect" | "sync" | null>(null);

  const connect = async () => {
    setBusy("connect");
    try {
      const c = await fakeOAuthConnect(provider);
      onChange(c);
      toast.success(`Connected to ${c.workspace}`);
    } finally {
      setBusy(null);
    }
  };
  const disconnect = () => {
    onChange(fakeDisconnect(provider));
    toast(`Disconnected ${providerLabel[provider]}`);
  };
  const sync = () => {
    setBusy("sync");
    setTimeout(() => {
      onChange(
        mockWebhookEvent(connection, "sync", `Pulled 5 issues from ${providerLabel[provider]}`),
      );
      toast.success(`${providerLabel[provider]} synced`);
      setBusy(null);
    }, 700);
  };
  const simulateError = () => {
    onChange({ ...connection, status: "error" });
    toast.error(`${providerLabel[provider]} webhook failed (mock)`);
  };

  const accent = providerAccent[provider];
  const connected = connection.status === "connected";
  const errored = connection.status === "error";

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0",
            !connected && !errored && "grayscale opacity-80",
          )}
          style={{ backgroundColor: accent }}
        >
          {providerLabel[provider][0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{providerLabel[provider]}</div>
            {connected && (
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                <span className="pulse-dot mr-1.5" style={{ backgroundColor: "var(--success)" }} />
                Connected
              </Badge>
            )}
            {errored && (
              <Badge
                variant="outline"
                className="bg-destructive/10 text-destructive border-destructive/30"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Error
              </Badge>
            )}
            {!connected && !errored && (
              <Badge variant="outline" className="text-muted-foreground">
                Disconnected
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {connected ? (
              <>
                Workspace <span className="font-mono">{connection.workspace}</span> · Last sync{" "}
                {relativeTime(connection.syncedAt)}
              </>
            ) : errored ? (
              <>Webhook delivery failed — reconnect to retry.</>
            ) : (
              <>Pull issues linked to projects and activities into Pulse HR.</>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!connected && (
            <Button onClick={connect} disabled={busy === "connect"}>
              {busy === "connect" ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <Plug className="h-4 w-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          )}
          {connected && (
            <>
              <Button variant="outline" onClick={sync} disabled={busy === "sync"}>
                <RefreshCw className={cn("h-4 w-4 mr-2", busy === "sync" && "animate-spin")} />
                Sync now
              </Button>
              <Button variant="ghost" onClick={disconnect}>
                <PlugZap className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </>
          )}
        </div>
      </div>

      {connected && connection.webhookEvents.length > 0 && (
        <div className="mt-5 rounded-md border bg-muted/30 divide-y">
          <div className="px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Recent webhook events
          </div>
          {connection.webhookEvents.slice(0, 5).map((ev) => (
            <div key={ev.id} className="px-3 py-2 flex items-center gap-3 text-xs">
              <Check className="h-3 w-3 text-success" />
              <div className="flex-1 truncate">{ev.summary}</div>
              <span className="font-mono text-[10px] text-muted-foreground">{ev.kind}</span>
              <span className="text-[10px] text-muted-foreground">{relativeTime(ev.at)}</span>
            </div>
          ))}
        </div>
      )}

      {connected && (
        <div className="mt-3">
          <button
            onClick={simulateError}
            className="text-[10px] text-muted-foreground hover:text-destructive"
          >
            Simulate webhook error
          </button>
        </div>
      )}
    </Card>
  );
}
