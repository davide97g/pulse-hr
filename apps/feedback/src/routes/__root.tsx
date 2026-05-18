import { Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { FeedbackShell } from "@/components/feedback/FeedbackShell";
import { ProposalProvider } from "@/components/proposals/ProposalProvider";
import { CompanyProfileProvider } from "@/components/app/CompanyProfileStore";
import { RoleOverrideProvider } from "@/lib/role-override";
import { trackGaPageViewIfConsented } from "@/lib/analytics";
import { SignedOutGate } from "@/components/feedback/SignedOutGate";
import { setPageMeta } from "@/lib/page-meta";

// Per-path meta. Description only matters for direct-link / social-share UX
// since every page is noindex'd. Dynamic routes (/proposals/$id, /comments/$id)
// fall through to the default and rely on the route component to set richer
// meta once content loads.
const META_BY_PATH: Record<string, { title: string; description?: string }> = {
  "/": {
    title: "Pulse Feedback — the wall that listens",
    description: "Share ideas, upvote what matters, track proposals.",
  },
  "/welcome": {
    title: "Welcome — Pulse Feedback",
    description: "Set up your Pulse Feedback profile.",
  },
  "/voting-power": {
    title: "Voting Power — Pulse Feedback",
    description: "See how your voting weight is calculated on Pulse Feedback.",
  },
};

function RootComponent() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    trackGaPageViewIfConsented();
  }, [pathname]);

  useEffect(() => {
    const isDynamic =
      pathname.startsWith("/proposals/") || pathname.startsWith("/comments/");
    if (isDynamic) return;
    const meta = META_BY_PATH[pathname] ?? {
      title: "Pulse Feedback",
      description: "Share ideas, upvote what matters, track proposals.",
    };
    setPageMeta(meta);
  }, [pathname]);

  if (!isLoaded) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isSignedIn) {
    return <SignedOutGate />;
  }

  return (
    <RoleOverrideProvider>
      <CompanyProfileProvider>
        <ProposalProvider>
          <FeedbackShell>
            <Outlet />
          </FeedbackShell>
          <Toaster position="top-right" richColors closeButton />
        </ProposalProvider>
      </CompanyProfileProvider>
    </RoleOverrideProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
