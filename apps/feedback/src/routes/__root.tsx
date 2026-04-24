import { Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { FeedbackShell } from "@/components/feedback/FeedbackShell";
import { ProposalProvider } from "@/components/proposals/ProposalProvider";
import { CompanyProfileProvider } from "@/components/app/CompanyProfileStore";
import { RoleOverrideProvider } from "@/lib/role-override";
import { trackGaPageViewIfConsented } from "@/lib/analytics";

const APP_URL = import.meta.env.VITE_APP_URL ?? "https://app.pulsehr.it";

function RootComponent() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    trackGaPageViewIfConsented();
  }, [pathname]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      const redirectUrl = encodeURIComponent(window.location.href);
      window.location.assign(`${APP_URL}/login?redirect_url=${redirectUrl}`);
    }
  }, [isLoaded, isSignedIn]);

  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Redirecting to sign in…
      </div>
    );
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
