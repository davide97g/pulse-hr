import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/app/AppShell";
import { plugins as initialPlugins } from "@/lib/mock-data";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — Pulse HR" }] }),
  component: Marketplace,
});

function Marketplace() {
  const [plugins, setPlugins] = useState(initialPlugins);
  const [q, setQ] = useState("");

  const toggle = (id: string) => setPlugins(arr => arr.map(p => p.id === id ? { ...p, installed: !p.installed } : p));
  const filtered = plugins.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader title="Marketplace" description="Extend Pulse HR with apps, integrations and workflows" />

      <div className="relative max-w-md mb-5">
        <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps…" className="pl-8 h-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <Card key={p.id} className="p-5 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xl">{p.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm">{p.name}</div>
                  {p.installed && <span className="text-[10px] uppercase tracking-wider text-success font-medium flex items-center gap-1"><Check className="h-3 w-3" />Installed</span>}
                </div>
                <div className="text-xs text-muted-foreground">{p.category}</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex-1">{p.desc}</div>
            <Button
              variant={p.installed ? "outline" : "default"}
              size="sm"
              className="mt-4"
              onClick={() => toggle(p.id)}
            >
              {p.installed ? "Uninstall" : "Install"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
