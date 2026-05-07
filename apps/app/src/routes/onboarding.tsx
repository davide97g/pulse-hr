import { createFileRoute } from "@tanstack/react-router";
import { OnboardingEditorial } from "@/components/onboarding/OnboardingEditorial";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — Pulse HR" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  return <OnboardingEditorial />;
}
