import type { IntegrationConnection, IntegrationProvider, MockIssue } from "./mock-data";
import { mockIssuePool } from "./mock-data";

const workspaceSlug: Record<IntegrationProvider, string> = {
  jira: "acme-internal.atlassian.net",
  linear: "linear.app/acme",
};

export function fakeOAuthConnect(provider: IntegrationProvider): Promise<IntegrationConnection> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      resolve({
        provider,
        status: "connected",
        workspace: workspaceSlug[provider],
        connectedAt: now,
        syncedAt: now,
        webhookEvents: [
          { id: `w-${Date.now()}`, at: now, kind: "auth", summary: "OAuth handshake completed" },
        ],
      });
    }, 1200);
  });
}

export function fakeDisconnect(provider: IntegrationProvider): IntegrationConnection {
  return { provider, status: "disconnected", webhookEvents: [] };
}

export function syncIssues(projectId: string, provider: IntegrationProvider): Promise<MockIssue[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const pool = mockIssuePool[projectId] ?? [];
      resolve(pool.filter((i) => i.provider === provider));
    }, 800);
  });
}

export function mockWebhookEvent(
  current: IntegrationConnection,
  kind: string,
  summary: string,
): IntegrationConnection {
  return {
    ...current,
    syncedAt: new Date().toISOString(),
    webhookEvents: [
      { id: `w-${Date.now()}`, at: new Date().toISOString(), kind, summary },
      ...current.webhookEvents,
    ].slice(0, 8),
  };
}

export const providerLabel: Record<IntegrationProvider, string> = {
  jira: "Jira",
  linear: "Linear",
};

export const providerAccent: Record<IntegrationProvider, string> = {
  jira: "oklch(0.6 0.18 258)",
  linear: "oklch(0.65 0.18 290)",
};
