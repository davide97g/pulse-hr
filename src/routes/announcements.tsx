import { createFileRoute } from "@tanstack/react-router";
import { Pin, Plus, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { announcements } from "@/lib/mock-data";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "Announcements — Pulse HR" }] }),
  component: Announcements,
});

function Announcements() {
  return (
    <div className="p-6 max-w-[900px] mx-auto fade-in">
      <PageHeader
        title="Announcements"
        description="Company-wide updates from leadership and HR"
        actions={<Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New post</Button>}
      />

      <div className="space-y-3">
        {announcements.map(a => (
          <Card key={a.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <Avatar initials={a.author.split(" ").map(p => p[0]).join("")} color="oklch(0.6 0.16 220)" size={40} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-sm">{a.title}</div>
                  {a.pinned && <Pin className="h-3.5 w-3.5 text-warning fill-warning" />}
                </div>
                <div className="text-xs text-muted-foreground">{a.author} • {a.time}</div>
                <div className="text-sm mt-3">{a.body}</div>
                <div className="mt-4 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                  <button className="flex items-center gap-1.5 hover:text-foreground"><MessageSquare className="h-3.5 w-3.5" />Comment</button>
                  <span>•</span>
                  <span>👍 12 reactions</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
