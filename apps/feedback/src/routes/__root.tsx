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

function RootComponent() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    trackGaPageViewIfConsented();
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
