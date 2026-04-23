import { useState } from "react";
import { Coins, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewBadge } from "./NewBadge";
import { useCompanyProfileStore } from "./CompanyProfileStore";

const DISMISS_KEY = "pulse.company-profile.dismissed";
const FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL ?? "https://feedback.pulsehr.it";

/**
 * Dashboard banner prompting users who never fully answered the company
 * questionnaire. CTA opens the Voting Power page on the feedback app,
 * where the questionnaire now lives.
 */
export function CompanyProfileBanner() {
  const { profile } = useCompanyProfileStore();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof sessionStorage === "undefined") return false;
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  });

  const needsPrompt = !profile || !profile.fullyAnswered;
  if (!needsPrompt || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative mb-4 rounded-xl iridescent-border bg-gradient-to-br from-[color:var(--labs)]/[0.08] via-transparent to-transparent p-4 flex items-start gap-3">
      <div className="h-9 w-9 rounded-md bg-[color:var(--labs)]/15 text-[color:var(--labs)] grid place-items-center shrink-0">
        <Coins className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="text-sm font-medium">Double your voting power</div>
          <NewBadge />
        </div>
        <div className="text-xs text-muted-foreground">
          Tell us a bit about your company to unlock +100 voting power — takes under a minute.
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" className="press-scale" asChild>
          <a href={`${FEEDBACK_URL}/voting-power`}>Complete profile</a>
        </Button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
