import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { StatusBadge } from "@/components/app/AppShell";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { IntegrationBadge } from "./IntegrationBadge";
import { syncIssues } from "@/lib/integrations";
import type { IntegrationProvider, MockIssue } from "@/lib/mock-data";
import { RefreshCw, Plug, ExternalLink } from "lucide-react";

export function LinkedIssuesPanel({
  projectId,
  connectedProviders,
}: {
  projectId: string;
  connectedProviders: IntegrationProvider[];
}) {
  const [issues, setIssues] = useState<MockIssue[]>([]);
  const [syncing, setSyncing] = useState<IntegrationProvider | null>(null);

  const sync = async (provider: IntegrationProvider) => {
    setSyncing(provider);
    const fresh = await syncIssues(projectId, provider);
    setSyncing(null);
    setIssues((prev) => {
      const withoutProv = prev.filter((i) => i.provider !== provider);
      return [...withoutProv, ...fresh];
    });
    toast.success(
      `Synced ${fresh.length} ${provider === "jira" ? "Jira" : "Linear"} issue${fresh.length === 1 ? "" : "s"}`,
    );
  };

  if (connectedProviders.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState
          icon={<Plug className="h-5 w-5" />}
          title="No integrations connected"
          description="Connect Jira or Linear in Settings → Integrations to sync issues into this project."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {connectedProviders.map((p) => (
          <Button
            key={p}
            variant="outline"
            size="sm"
            onClick={() => sync(p)}
            disabled={syncing === p}
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-2", syncing === p && "animate-spin")} />
            Sync {p === "jira" ? "Jira" : "Linear"}
          </Button>
        ))}
      </div>
      {issues.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<RefreshCw className="h-5 w-5" />}
            title="No issues synced yet"
            description="Click Sync above to pull linked issues from connected tools."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Key</th>
                <th className="text-left font-medium px-3 py-2.5">Title</th>
                <th className="text-left font-medium px-3 py-2.5">Assignee</th>
                <th className="text-left font-medium px-3 py-2.5">Status</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="stagger-in">
              {issues.map((i) => (
                <tr key={`${i.provider}-${i.key}`} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <IntegrationBadge provider={i.provider} issueKey={i.key} />
                  </td>
                  <td className="px-3 py-2.5">{i.title}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{i.assignee ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={i.status} />
                  </td>
                  <td className="px-2 py-2.5">
                    <a
                      href={i.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
