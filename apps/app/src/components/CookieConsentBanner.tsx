import { useEffect, useState } from "react";
import { Button } from "@pulse-hr/ui/primitives/button";
import {
  applyAnalyticsConsent,
  getStoredAnalyticsConsent,
  isGoogleAnalyticsEnabled,
} from "@/lib/ga";

const PRIVACY_HREF = "https://pulsehr.it/privacy";

export function CookieConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isGoogleAnalyticsEnabled()) return;
    setOpen(getStoredAnalyticsConsent() == null);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-border bg-card/95 p-4 text-card-foreground shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80 md:px-6"
      role="region"
      aria-label="Cookie preferences"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          We use Google Analytics, with your consent, to understand how the product is used. See the{" "}
          <a
            href={PRIVACY_HREF}
            className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
            target="_blank"
            rel="noreferrer noopener"
          >
            privacy policy
          </a>{" "}
          for details. You can change this choice any time by clearing site data.
        </p>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => {
              applyAnalyticsConsent("denied");
              setOpen(false);
            }}
          >
            Decline
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => {
              applyAnalyticsConsent("granted");
              setOpen(false);
            }}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
