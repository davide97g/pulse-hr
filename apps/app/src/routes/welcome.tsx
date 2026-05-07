import { createFileRoute } from "@tanstack/react-router";
import { WelcomeEditorial } from "@/components/welcome/WelcomeEditorial";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — Pulse HR" }] }),
  component: WelcomePage,
});

function WelcomePage() {
  return <WelcomeEditorial />;
}
