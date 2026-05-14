import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/skills")({
  head: () => ({ meta: [{ title: "Skills — Pulse HR" }] }),
  component: SkillsLayout,
});

function SkillsLayout() {
  return <Outlet />;
}
