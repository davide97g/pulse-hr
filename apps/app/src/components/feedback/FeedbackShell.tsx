import { Link, useNavigate } from "@tanstack/react-router";
import { useUser, useClerk } from "@clerk/react";
import { ArrowLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarRouteGuard } from "@/components/app/SidebarRouteGuard";

export function FeedbackShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const displayName =
    user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Signed in";
  const initials =
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "") ||
    displayName.slice(0, 2).toUpperCase();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(1200px 600px at 85% -20%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 60%), var(--background)",
      }}
    >
      <header className="h-14 border-b bg-background/70 backdrop-blur flex items-center px-4 md:px-6 gap-3 shrink-0">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground press-scale"
          title="Back to Pulse"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back to Pulse</span>
        </Link>
        <div className="mx-2 h-5 w-px bg-border" />
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-display text-lg tracking-tight leading-none">Pulse</span>
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-primary pulse-dot"
            aria-hidden
          />
          <span className="font-display text-lg tracking-tight leading-none text-primary">
            Feedback
          </span>
        </div>
        <div className="flex-1" />
        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={displayName}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: "oklch(0.6 0.16 220)" }}
                >
                  {initials.toUpperCase().slice(0, 2) || "?"}
                </div>
              )}
              <div className="text-xs font-medium max-w-[160px] truncate">{displayName}</div>
            </div>
            <button
              onClick={async () => {
                await signOut();
                navigate({ to: "/login", replace: true });
              }}
              className={cn(
                "h-9 w-9 md:w-auto md:px-2.5 inline-flex items-center justify-center gap-1.5 rounded-md",
                "border bg-background/80 hover:bg-muted text-xs text-muted-foreground",
              )}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign out</span>
            </button>
          </div>
        )}
      </header>
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <SidebarRouteGuard>{children}</SidebarRouteGuard>
      </main>
    </div>
  );
}
