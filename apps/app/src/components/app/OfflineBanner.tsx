import { useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { useOfflineMode } from "@/lib/offline-mode";
import { pingHealth } from "@/lib/server-wake";
import { Button } from "@pulse-hr/ui/primitives/button";
import { toast } from "sonner";

export function OfflineBanner() {
  const { offline, disable } = useOfflineMode();
  const [checking, setChecking] = useState(false);
  if (!offline) return null;

  const retry = async () => {
    setChecking(true);
    const ok = await pingHealth();
    setChecking(false);
    if (ok) {
      disable();
      toast.success("Server is awake", { description: "Reloading live data." });
      setTimeout(() => window.location.reload(), 400);
    } else {
      toast("Still waking up", { description: "Give it another few seconds and try again." });
    }
  };

  return (
    <div className="relative z-40 flex items-center justify-center gap-3 bg-[color:var(--labs,#b4ff39)]/10 border-b border-[color:var(--labs,#b4ff39)]/30 px-4 py-1.5 text-xs">
      <CloudOff className="h-3.5 w-3.5 text-[color:var(--labs,#b4ff39)]" />
      <span className="font-mono">Offline preview — server still waking. Data is local-only.</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={retry}
        disabled={checking}
        className="h-6 px-2 text-[11px] press-scale"
      >
        <RefreshCw className={`h-3 w-3 ${checking ? "animate-spin" : ""}`} />
        <span className="ml-1">{checking ? "Checking…" : "Retry"}</span>
      </Button>
    </div>
  );
}
