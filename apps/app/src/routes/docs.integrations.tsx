import { createFileRoute, Link } from "@tanstack/react-router";
import { Plug } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/docs/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Pulse HR docs" }] }),
  component: IntegrationsDoc,
});

function IntegrationsDoc() {
  return (
    <div className="space-y-5 max-w-3xl">
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: "color-mix(in oklch, oklch(0.6 0.18 258) 18%, transparent)",
              color: "oklch(0.6 0.18 258)",
            }}
          >
            <Plug className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">Jira &amp; Linear</div>
            <div className="text-xs text-muted-foreground">
              Pulling external tickets alongside Pulse HR projects.
            </div>
          </div>
        </div>
      </Card>

      <Section title="Connecting">
        <p>
          Open <Link to="/settings" className="text-primary hover:underline">Settings → Integrations</Link> and click <b>Connect</b> on Jira or Linear. We mock the OAuth
          handshake for now (a fixed workspace is returned), but the flow mirrors what a real
          integration looks like: connect → see workspace slug → sync on demand → webhook log.
        </p>
      </Section>

      <Section title="Linking tickets to activities">
        <p>
          On any activity, add a link with the provider and issue key (e.g. <code>ACME-22</code> for
          Jira or <code>NOV-11</code> for Linear). The key shows up as a small colour-coded pill on
          the board, Gantt, and any list of activities.
        </p>
      </Section>

      <Section title="Syncing issues into a project">
        <p>
          On a project's <b>Integrations</b> tab, hit Sync to pull issues from connected providers.
          Synced issues show in a simple table with assignee, status, and a link back to the
          original system.
        </p>
      </Section>

      <Section title="Disconnecting or simulating errors">
        <p>
          Use <b>Disconnect</b> to tear down the connection. Each connected card also has a quiet
          "simulate webhook error" button for exercising the error UI — connection flips to a red
          error pill.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 space-y-2 text-sm leading-relaxed">
      <div className="font-semibold">{title}</div>
      {children}
    </Card>
  );
}
