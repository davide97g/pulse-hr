import { useState } from "react";
import { toast } from "sonner";
import {
  Plug,
  PlugZap,
  RefreshCw,
  AlertTriangle,
  Check,
  ArrowDownToLine,
  ArrowLeftRight,
} from "lucide-react";
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
import type { IntegrationConnection, IntegrationProvider, SyncDirection } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { GoogleOAuthDialog } from "./GoogleOAuthDialog";

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
  const [googleOpen, setGoogleOpen] = useState(false);
  const isGoogle = provider === "google-calendar";

  const connect = async () => {
    if (isGoogle) {
      setGoogleOpen(true);
      return;
    }
    setBusy("connect");
    try {
      const c = await fakeOAuthConnect(provider);
      onChange(c);
      toast.success(`Connected to ${c.workspace}`);
    } finally {
      setBusy(null);
    }
  };

  const setSyncDirection = (dir: SyncDirection) => {
    onChange({ ...connection, syncDirection: dir });
    toast.success(
      dir === "two-way"
        ? "Two-way sync enabled — Pulse events will push to Google"
        : "Import-only sync — Pulse won't write to Google",
    );
  };
  const disconnect = () => {
    onChange(fakeDisconnect(provider));
    toast(`Disconnected ${providerLabel[provider]}`);
  };
  const sync = () => {
    setBusy("sync");
    setTimeout(() => {
      const summary = isGoogle
        ? "Imported 3 events from Google"
        : `Pulled 5 issues from ${providerLabel[provider]}`;
      const kind = isGoogle ? "events.imported" : "sync";
      onChange(mockWebhookEvent(connection, kind, summary));
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
            "h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0",
            isGoogle ? "bg-white border border-neutral-200" : "text-white",
            !connected && !errored && !isGoogle && "grayscale opacity-80",
            !connected && !errored && isGoogle && "opacity-90",
          )}
          style={isGoogle ? undefined : { backgroundColor: accent }}
        >
          {isGoogle ? <GoogleMark /> : providerLabel[provider][0]}
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
                {isGoogle ? "Account" : "Workspace"}{" "}
                <span className="font-mono">{connection.workspace}</span> · Last sync{" "}
                {relativeTime(connection.syncedAt)}
              </>
            ) : errored ? (
              <>Webhook delivery failed — reconnect to retry.</>
            ) : isGoogle ? (
              <>Sync events from Google Calendar into Pulse. Two-way push optional.</>
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

      {connected && isGoogle && (
        <div className="mt-4 flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">Sync direction</span>
          <div className="inline-flex rounded-md border p-0.5 bg-muted/30">
            <button
              onClick={() => setSyncDirection("import")}
              className={cn(
                "px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-colors",
                (connection.syncDirection ?? "import") === "import"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ArrowDownToLine className="h-3 w-3" />
              Import only
            </button>
            <button
              onClick={() => setSyncDirection("two-way")}
              className={cn(
                "px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-colors",
                connection.syncDirection === "two-way"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ArrowLeftRight className="h-3 w-3" />
              Two-way
            </button>
          </div>
        </div>
      )}

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

      {isGoogle && (
        <GoogleOAuthDialog
          open={googleOpen}
          onOpenChange={setGoogleOpen}
          onConnected={(c) => {
            onChange(c);
            toast.success(`Connected ${c.workspace}`);
          }}
        />
      )}
    </Card>
  );
}

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
