import { createFileRoute } from "@tanstack/react-router";
import { Building2, Users, ShieldCheck, History, Languages, Plug } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/app/AppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Pulse HR" }] }),
  component: Settings,
});

function Settings() {
  return (
    <div className="p-6 max-w-[1100px] mx-auto fade-in">
      <PageHeader title="Settings" description="Company configuration, roles and integrations" />

      <Tabs defaultValue="company" orientation="horizontal">
        <TabsList>
          <TabsTrigger value="company"><Building2 className="h-3.5 w-3.5 mr-1.5" />Company</TabsTrigger>
          <TabsTrigger value="roles"><Users className="h-3.5 w-3.5 mr-1.5" />Roles</TabsTrigger>
          <TabsTrigger value="security"><ShieldCheck className="h-3.5 w-3.5 mr-1.5" />Security</TabsTrigger>
          <TabsTrigger value="audit"><History className="h-3.5 w-3.5 mr-1.5" />Audit log</TabsTrigger>
          <TabsTrigger value="locale"><Languages className="h-3.5 w-3.5 mr-1.5" />Localization</TabsTrigger>
          <TabsTrigger value="integrations"><Plug className="h-3.5 w-3.5 mr-1.5" />Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4">
          <Card className="p-6 space-y-4 max-w-2xl">
            <div className="space-y-1.5"><Label>Company name</Label><Input defaultValue="Acme Inc." /></div>
            <div className="space-y-1.5"><Label>Legal entity</Label><Input defaultValue="Acme Holdings LLC" /></div>
            <div className="space-y-1.5"><Label>Country</Label><Input defaultValue="United States" /></div>
            <div className="space-y-1.5"><Label>Default currency</Label><Input defaultValue="USD" /></div>
            <Button>Save changes</Button>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold text-sm">Roles & permissions</div>
            <div className="divide-y">
              {[
                { name: "Admin", desc: "Full access to all modules and settings", count: 2 },
                { name: "HR Manager", desc: "Manage employees, payroll, and reports", count: 3 },
                { name: "Manager", desc: "Approve team requests, view team data", count: 4 },
                { name: "Employee", desc: "Personal data, time, leave, expenses", count: 12 },
              ].map(r => (
                <div key={r.name} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.desc}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{r.count} users</div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card className="p-6 space-y-4 max-w-2xl">
            {[
              { l: "Require 2FA for all users", v: true },
              { l: "Single sign-on (SSO)", v: true },
              { l: "Session timeout after 8h inactivity", v: false },
              { l: "IP allowlist", v: false },
            ].map(s => (
              <div key={s.l} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="text-sm">{s.l}</div>
                <Switch defaultChecked={s.v} />
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold text-sm">Activity log</div>
            <div className="divide-y">
              {[
                { who: "Aisha Patel", what: "approved leave request for Tom Becker", when: "2 hours ago" },
                { who: "Lina Rossi", what: "ran payroll for March 2025", when: "Yesterday" },
                { who: "Alex Carter", what: "added Emma Wilson as employee", when: "2 days ago" },
                { who: "System", what: "synced 12 records with QuickBooks", when: "3 days ago" },
              ].map((l, i) => (
                <div key={i} className="px-5 py-3 text-sm">
                  <span className="font-medium">{l.who}</span>
                  <span className="text-muted-foreground"> {l.what}</span>
                  <span className="text-xs text-muted-foreground ml-2">• {l.when}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="locale" className="mt-4">
          <Card className="p-6 space-y-4 max-w-2xl">
            <div className="space-y-1.5"><Label>Language</Label><Input defaultValue="English (US)" /></div>
            <div className="space-y-1.5"><Label>Timezone</Label><Input defaultValue="America/Los_Angeles" /></div>
            <div className="space-y-1.5"><Label>Date format</Label><Input defaultValue="YYYY-MM-DD" /></div>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <div className="text-sm text-muted-foreground mb-3">Manage installed integrations from the Marketplace.</div>
          <Button variant="outline" asChild><a href="/marketplace">Open Marketplace</a></Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
