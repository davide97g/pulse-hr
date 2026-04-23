import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";

export const Route = createFileRoute("/docs/clients-projects")({
  head: () => ({ meta: [{ title: "Clients & Projects — Pulse HR docs" }] }),
  component: ClientsProjectsDoc,
});

function ClientsProjectsDoc() {
  return (
    <div className="space-y-5 max-w-3xl">
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: "color-mix(in oklch, oklch(0.7 0.15 30) 18%, transparent)",
              color: "oklch(0.7 0.15 30)",
            }}
          >
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">Clients &amp; Projects</div>
            <div className="text-xs text-muted-foreground">
              Managing the work we sell and who delivers it.
            </div>
          </div>
        </div>
      </Card>

      <Section title="Hierarchy">
        <p>
          Everything rolls up from <b>Client → Project → Activity</b>. A client is the billing
          entity; projects are the engagements under it; activities are the planning units inside a
          project.
        </p>
        <p>
          Create clients and projects from the{" "}
          <Link to="/clients" className="text-primary hover:underline">
            Clients &amp; Projects
          </Link>{" "}
          page. Each client has an account owner (an employee); each project has an owner and a
          default billable rate.
        </p>
      </Section>

      <Section title="Team allocations">
        <p>
          Open a project and use the <b>Team</b> tab to add employees. Each allocation has a type
          (dev / design / pm / qa / ops / consult), a weekly percentage, a date window, and an
          optional rate override. Percentages feed Saturation and cost/revenue numbers directly.
        </p>
      </Section>

      <Section title="Activities, boards, and Gantt">
        <p>
          Activities live on the <b>Board</b> tab as a Kanban (drag between columns). Give them
          start and end dates and they'll also show up on the <b>Gantt</b> tab with dependency
          arrows. There are three Gantt scopes in total — per project, per client, and per person.
        </p>
      </Section>

      <Section title="External work items">
        <p>
          Connect Jira and Linear in{" "}
          <Link to="/settings" className="text-primary hover:underline">
            Settings → Integrations
          </Link>{" "}
          to pull issues. Each activity can point at one ticket key for traceability. Ticket keys
          show as small colour-coded pills throughout.
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
