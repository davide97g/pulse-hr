import { createFileRoute } from "@tanstack/react-router";
import { SkillsSelfView } from "@/components/skills/SkillsSelfView";

export const Route = createFileRoute("/skills/me")({
  head: () => ({ meta: [{ title: "Your skills — Pulse HR" }] }),
  component: SkillsMePage,
});

function SkillsMePage() {
  return <SkillsSelfView />;
}
