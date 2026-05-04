import { Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Toaster } from "sonner";
import { Button } from "@pulse-hr/ui/primitives/button";
import { FeedbackShell } from "@/components/feedback/FeedbackShell";
import { ProposalProvider } from "@/components/proposals/ProposalProvider";
import { CompanyProfileProvider } from "@/components/app/CompanyProfileStore";
import { RoleOverrideProvider } from "@/lib/role-override";
import { trackGaPageViewIfConsented } from "@/lib/analytics";

const APP_URL = import.meta.env.VITE_APP_URL ?? "https://app.pulsehr.it";

function buildLoginUrl(): string {
  const redirect = encodeURIComponent(window.location.href);
  return `${APP_URL}/login?redirect_url=${redirect}`;
}

function SignedOutGate() {
  const onSignIn = () => window.location.assign(buildLoginUrl());
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm fade-in">
        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
          <MessageSquare className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Sign in to Pulse Feedback</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vote on proposals, comment on roadmap items, and track what's shipping. We'll bring you
          back here right after sign-in.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={onSignIn} className="h-11 press-scale w-full">
            Sign in <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
          <a
            href={`${APP_URL}/signup`}
            className="text-xs text-center text-muted-foreground hover:text-foreground"
          >
            Don't have an account? Create one →
          </a>
        </div>
      </div>
    </div>
  );
}

function RootComponent() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    trackGaPageViewIfConsented();
  }, [pathname]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
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
