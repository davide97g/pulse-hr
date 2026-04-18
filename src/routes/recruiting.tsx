import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Star, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { useQuickAction } from "@/components/app/QuickActions";
import { candidates as initialCandidates, type Candidate } from "@/lib/mock-data";
import { SidePanel } from "@/components/app/SidePanel";

export const Route = createFileRoute("/recruiting")({
  head: () => ({ meta: [{ title: "Recruiting — Pulse HR" }] }),
  component: Recruiting,
});

const stages: Candidate["stage"][] = ["Applied", "Screen", "Interview", "Offer", "Hired"];

function Recruiting() {
  const [selected, setSelected] = useState<Candidate | null>(null);

  return (
    <div className="p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Recruiting"
        description="3 open roles • 8 candidates in pipeline"
        actions={<Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Post a job</Button>}
      />

      <div className="grid grid-cols-5 gap-3">
        {stages.map(stage => {
          const items = candidates.filter(c => c.stage === stage);
          return (
            <div key={stage} className="bg-muted/40 rounded-lg p-2.5 min-h-[400px]">
              <div className="flex items-center justify-between px-1.5 mb-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stage}</div>
                <div className="text-xs text-muted-foreground bg-background rounded px-1.5 py-0.5 min-w-5 text-center">{items.length}</div>
              </div>
              <div className="space-y-2">
                {items.map(c => (
                  <Card
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Avatar initials={c.initials} color={c.avatarColor} size={28} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{c.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`h-3 w-3 ${i <= c.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <span>{c.appliedDate.slice(5)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <SidePanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
      >
        {selected && (
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Avatar initials={selected.initials} color={selected.avatarColor} size={56} />
              <div>
                <div className="font-semibold">{selected.name}</div>
                <div className="text-sm text-muted-foreground">{selected.role}</div>
                <div className="flex mt-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i <= selected.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mb-5">
              <Button size="sm" className="flex-1"><Calendar className="h-3.5 w-3.5 mr-1.5" />Schedule interview</Button>
              <Button size="sm" variant="outline">Move stage</Button>
            </div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Timeline</div>
            <div className="space-y-3">
              {["Applied via website","Screened by Olivia","Tech interview scheduled"].map((t, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-primary shrink-0" />
                  <div className="flex-1">{t}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  );
}
