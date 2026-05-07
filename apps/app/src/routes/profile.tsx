import { createFileRoute } from "@tanstack/react-router";
import { ProfileEditorial } from "@/components/profile/ProfileEditorial";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profilo — Pulse HR" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  return <ProfileEditorial />;
}
