import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/docs/kudos")({
  head: () => ({ meta: [{ title: "Kudos — Pulse HR docs" }] }),
  component: KudosDoc,
});

function KudosDoc() {
  return (
    <div className="space-y-5 max-w-3xl">
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: "color-mix(in oklch, oklch(0.65 0.18 340) 18%, transparent)",
              color: "oklch(0.65 0.18 340)",
            }}
          >
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">Kudos &amp; Recognition</div>
            <div className="text-xs text-muted-foreground">
              Peer coins, tagged by the kind of contribution.
            </div>
          </div>
        </div>
      </Card>

      <Section title="Giving a kudos">
        <p>
          On the <Link to="/kudos" className="text-primary hover:underline">Kudos</Link> page, pick
          a teammate, a coin amount, a tag (teamwork / craft / impact / courage / kindness), and a
          short note explaining why. The coins are symbolic — it's the note that matters.
        </p>
      </Section>

      <Section title="How it feeds the score">
        <p>
          Kudos received and given in the last 60 days feed the <b>Recognition</b> factor of the
          Employee Score. Receiving is weighted ~4× more than giving to avoid farming, but giving
          still counts — pay it forward.
        </p>
      </Section>

      <Section title="Leaderboard">
        <p>
          The built-in leaderboard sorts by coins received this quarter. Treat it as a running
          thank-you list rather than a competition.
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
