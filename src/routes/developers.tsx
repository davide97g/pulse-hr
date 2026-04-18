import { createFileRoute } from "@tanstack/react-router";
import { Copy, Plus, Webhook, Key, Code2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, StatusBadge } from "@/components/app/AppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/developers")({
  head: () => ({ meta: [{ title: "Developers — Pulse HR" }] }),
  component: Developers,
});

function Developers() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto fade-in">
      <PageHeader
        title="Developers"
        description="API keys, webhooks and custom workflows"
        actions={<Button size="sm" variant="outline" onClick={() => toast("API docs", { description: "Opening developer reference" })}><Code2 className="h-4 w-4 mr-1.5" />API docs</Button>}
      />

      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys"><Key className="h-3.5 w-3.5 mr-1.5" />API keys</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="h-3.5 w-3.5 mr-1.5" />Webhooks</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="fields">Custom fields</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-4 space-y-3">
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="font-semibold text-sm">Active keys</div>
              <Button size="sm" onClick={() => toast.success("New API key generated", { description: "Copy and store it securely — it won't be shown again." })}><Plus className="h-4 w-4 mr-1.5" />New key</Button>
            </div>
            <div className="divide-y">
              {[
                { name: "Production", k: "pk_live_••••4f72", env: "prod", date: "Created Jan 2025" },
                { name: "Staging", k: "pk_test_••••a91c", env: "test", date: "Created Mar 2025" },
              ].map((k, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{k.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{k.k}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{k.date}</div>
                  </div>
                  <StatusBadge status="active" />
                  <Button variant="ghost" size="sm" onClick={() => toast.success("API key copied to clipboard")}><Copy className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="font-semibold text-sm">Webhooks</div>
              <Button size="sm" onClick={() => toast.success("Webhook endpoint added")}><Plus className="h-4 w-4 mr-1.5" />Add endpoint</Button>
            </div>
            <div className="divide-y">
              {[
                { url: "https://hooks.acme.co/hr/employees", events: ["employee.created", "employee.updated"], status: "active" },
                { url: "https://hooks.acme.co/hr/timesheets", events: ["timesheet.submitted"], status: "active" },
                { url: "https://internal.acme.co/payroll", events: ["payroll.completed"], status: "pending" },
              ].map((w, i) => (
                <div key={i} className="px-5 py-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono">{w.url}</code>
                    <StatusBadge status={w.status} />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {w.events.map(e => (
                      <span key={e} className="text-[11px] px-2 py-0.5 rounded bg-muted font-mono">{e}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="mt-4">
          <Card className="p-5">
            <div className="font-semibold text-sm mb-4">Visual workflow builder</div>
            <div className="space-y-2">
              {["When employee is created", "Then send Slack message to #hr", "Then create Google Calendar event"].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-md border bg-muted/30">
                  <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">{i + 1}</div>
                  <div className="text-sm">{s}</div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full"><Plus className="h-4 w-4 mr-1.5" />Add step</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="fields" className="mt-4">
          <Card className="p-5">
            <div className="font-semibold text-sm mb-4">Custom employee fields</div>
            <div className="space-y-2">
              {[
                { name: "T-shirt size", type: "Select" },
                { name: "Dietary preference", type: "Text" },
                { name: "Preferred pronouns", type: "Text" },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-md border">
                  <div>
                    <div className="text-sm font-medium">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.type}</div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full"><Plus className="h-4 w-4 mr-1.5" />Add custom field</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
