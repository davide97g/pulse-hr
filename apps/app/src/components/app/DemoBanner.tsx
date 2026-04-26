/**
 * App-wide strip explaining that Pulse HR is a frontend-only demo and the
 * Feedback board is the only thing that talks to a real backend. Dismissible
 * (per device) so it doesn't get in the way once the message has landed.
 *
 * Anonymous visitors see a "Sign in to give feedback" CTA; authed users see
 * the link straight to the feedback board.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { FlaskConical, MessageSquarePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoginWall } from "@/components/app/LoginWall";

const DISMISS_KEY = "pulse.demoBanner.dismissed.v1";
const FEEDBACK_URL = import.meta.env.VITE_FEEDBACK_URL ?? "https://feedback.pulsehr.it";

export function DemoBanner() {
  const { isSignedIn } = useAuth();
  const { require } = useLoginWall();
  const [dismissed, setDismissed] = useState<boolean>(true);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {/* Mobile spacer so fixed-bottom banner doesn't cover the last bit of content. */}
      <div
        aria-hidden
        className="md:hidden shrink-0"
        style={{ height: "calc(2.25rem + env(safe-area-inset-bottom))" }}
      />
      <div
        className={cn(
          // Desktop: in-flow strip at the top of the main column.
          "md:relative md:border-b md:border-warning/25",
          // Mobile: pinned to the bottom, above the home indicator, with a top border.
          "fixed inset-x-0 bottom-0 z-40 border-t border-warning/25 md:border-t-0",
          "flex items-center gap-3 bg-warning/10 backdrop-blur-sm md:backdrop-blur-0",
          "px-3 md:px-4 py-1.5 text-[11px] md:text-xs",
        )}
        style={{ paddingBottom: "calc(0.375rem + env(safe-area-inset-bottom))" }}
      >
        <FlaskConical className="h-3.5 w-3.5 shrink-0 text-warning" />
        <div className="flex-1 min-w-0 leading-tight">
          <span className="font-medium text-foreground">Demo build</span>
          <span className="text-muted-foreground">
            {" "}
            — frontend-only mock, no real data. Help us shape v1:{" "}
          </span>
          {isSignedIn ? (
            <a
              href={FEEDBACK_URL}
              className="font-medium text-foreground underline underline-offset-2 hover:text-warning"
            >
              open the feedback board →
            </a>
          ) : (
            <button
              type="button"
              onClick={() => require("feedback")}
              className="font-medium text-foreground underline underline-offset-2 hover:text-warning inline-flex items-center gap-1"
            >
              <MessageSquarePlus className="h-3 w-3" />
              sign in to leave feedback
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss demo notice"
          className="h-7 w-7 md:h-5 md:w-5 rounded hover:bg-warning/20 inline-flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="h-4 w-4 md:h-3 md:w-3" />
        </button>
      </div>
    </>
  );
}
