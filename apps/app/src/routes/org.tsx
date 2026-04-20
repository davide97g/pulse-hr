import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { employees, departments } from "@/lib/mock-data";

export const Route = createFileRoute("/org")({
  head: () => ({ meta: [{ title: "Org chart — Pulse HR" }] }),
  component: Org,
});

function Org() {
  const ceo = employees.find(e => e.role === "Head of Engineering")!;
  const directs = employees.filter(e => e.manager === ceo.name);
  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader title="Org chart" description="How your company is structured" />

      <Card className="p-8 mb-6">
        <div className="flex flex-col items-center gap-8">
          <OrgNode name={ceo.name} role={ceo.role} initials={ceo.initials} color={ceo.avatarColor} accent />
          <div className="h-8 w-px bg-border" />
          <div className="flex items-start gap-6 flex-wrap justify-center">
            {directs.map(e => (
              <div key={e.id} className="flex flex-col items-center gap-3">
                <OrgNode name={e.name} role={e.role} initials={e.initials} color={e.avatarColor} />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <PageHeader title="Departments" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(d => (
          <Card key={d.name} className="p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{d.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Led by {d.lead}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold">{d.count}</div>
                <div className="text-xs text-muted-foreground">people</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Annual budget</span>
              <span className="font-medium">${(d.budget / 1000).toFixed(0)}k</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OrgNode({ name, role, initials, color, accent }: { name: string; role: string; initials: string; color: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow w-48 ${accent ? "border-primary/30 bg-primary/5" : ""}`}>
      <Avatar initials={initials} color={color} size={48} />
      <div className="text-sm font-medium text-center">{name}</div>
      <div className="text-xs text-muted-foreground text-center">{role}</div>
    </div>
  );
}
