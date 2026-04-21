import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Check, Settings2, Star, Shield } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/app/AppShell";
import { SkeletonCards } from "@/components/app/SkeletonList";
import { EmptyState } from "@/components/app/EmptyState";
import { plugins as initialPlugins } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — Pulse HR" }] }),
  component: Marketplace,
});

const INSTALLED_KEY = "pulse.marketplace.installed";

function readInstalled(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(INSTALLED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}
function writeInstalled(ids: Set<string>) {
  try {
    window.localStorage.setItem(INSTALLED_KEY, JSON.stringify([...ids]));
  } catch {
    /* noop */
  }
}

function Marketplace() {
  const [installed, setInstalled] = useState<Set<string>>(() => {
    // Seed from mock-data's initial installed flags the first time only.
    const stored = readInstalled();
    if (stored.size > 0) return stored;
    const seeded = new Set(initialPlugins.filter((p) => p.installed).map((p) => p.id));
    writeInstalled(seeded);
    return seeded;
  });
  const plugins = initialPlugins.map((p) => ({ ...p, installed: installed.has(p.id) }));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [configure, setConfigure] = useState<(typeof plugins)[number] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 440);
    return () => clearTimeout(t);
  }, []);

  const categories = Array.from(new Set(plugins.map((p) => p.category)));

  const toggle = (id: string) => {
    const next = new Set(installed);
    const wasInstalled = next.has(id);
    if (wasInstalled) next.delete(id);
    else next.add(id);
    writeInstalled(next);
    setInstalled(next);
    const p = plugins.find((x) => x.id === id);
    if (p)
      toast.success(wasInstalled ? `Uninstalled ${p.name}` : `Installed ${p.name}`, {
        description: wasInstalled ? undefined : "Launch to complete setup.",
      });
  };

  const filtered = plugins.filter(
    (p) => (!q || p.name.toLowerCase().includes(q.toLowerCase())) && (!cat || p.category === cat),
  );

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Marketplace"
        description="Extend Pulse HR with apps, integrations and workflows"
      />

      <div className="flex items-center gap-2 flex-wrap mb-5">
        <div className="relative max-w-md flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search apps…"
            className="pl-8 h-9"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setCat(null)}
            className={cn(
              "h-8 px-3 rounded-md text-sm transition-colors press-scale",
              !cat ? "bg-foreground text-background" : "hover:bg-muted",
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "h-8 px-3 rounded-md text-sm transition-colors press-scale",
                cat === c ? "bg-foreground text-background" : "hover:bg-muted",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonCards cards={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No apps match"
          action={
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setQ("");
                setCat(null);
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-in">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="p-5 hover:shadow-md transition-all press-scale flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xl">
                  {p.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm">{p.name}</div>
                    {p.installed && (
                      <span className="text-[10px] uppercase tracking-wider text-success font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Installed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{p.category}</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  4.{6 + (p.id.charCodeAt(0) % 3)}
                </div>
              </div>
              <div className="text-sm text-muted-foreground flex-1">{p.desc}</div>
              <div className="flex items-center gap-2 mt-3 text-[11px] text-muted-foreground">
                <Shield className="h-3 w-3" />
                Verified publisher
              </div>
              <div className="flex gap-2 mt-4">
                {p.installed && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="press-scale"
                    onClick={() => setConfigure(p)}
                  >
                    <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                    Configure
                  </Button>
                )}
                <Button
                  variant={p.installed ? "outline" : "default"}
                  size="sm"
                  className={cn(
                    "flex-1 press-scale",
                    p.installed && "text-destructive hover:bg-destructive/10",
                  )}
                  onClick={() => toggle(p.id)}
                >
                  {p.installed ? "Uninstall" : "Install"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!configure} onOpenChange={(o) => !o && setConfigure(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{configure?.name} configuration</DialogTitle>
            <DialogDescription>
              Configure how {configure?.name} integrates with Pulse HR.
            </DialogDescription>
          </DialogHeader>
          {configure && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-md border">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-xl">
                  {configure.icon}
                </div>
                <div>
                  <div className="text-sm font-medium">{configure.name}</div>
                  <div className="text-xs text-muted-foreground">{configure.category}</div>
                </div>
                <div className="ml-auto text-xs text-success font-medium">Connected</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-md border">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    Events synced
                  </div>
                  <div className="text-lg font-semibold tabular-nums">1,284</div>
                </div>
                <div className="p-3 rounded-md border">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                    Last sync
                  </div>
                  <div className="text-lg font-semibold">2 min ago</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Open in {configure.name} to adjust channel mappings, permissions, and webhooks.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfigure(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                toast.success("Opening app settings");
                setConfigure(null);
              }}
            >
              Open settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
