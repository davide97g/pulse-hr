import { createFileRoute } from "@tanstack/react-router";
import { SkillsManagerView } from "@/components/skills/SkillsManagerView";

export const Route = createFileRoute("/skills/team")({
  head: () => ({ meta: [{ title: "Team skills — Pulse HR" }] }),
  component: SkillsTeamPage,
});

function SkillsTeamPage() {
  return <SkillsManagerView />;
}
