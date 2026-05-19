import { useUser, useClerk } from "@clerk/react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft, Coins, LayoutGrid, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsEffectiveAdmin } from "@/lib/role-override";
import { AuthorAvatar } from "./shared";

const APP_URL = import.meta.env.VITE_APP_URL ?? "https://app.pulsehr.it";

export function FeedbackShell({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { pathname } = useLocation();
  const onBoard = pathname === "/";
  const onVoting = pathname === "/voting-power";
  const admin = useIsEffectiveAdmin();
  const displayName =
    user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Signed in";

  return (
    <div className="room-dark min-h-dvh flex flex-col bg-[#0a0907] text-[var(--paper)] pl-safe pr-safe">
      <header
        className="shrink-0 sticky top-0 z-30 border-b border-white/5 bg-[#0a0907]/90 backdrop-blur-md pt-safe"
      >
        <div className="h-14 flex items-center px-4 md:px-6 gap-2 md:gap-3">
          <a
            href={APP_URL}
            className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase font-mono text-white/55 hover:text-white press-scale tap-target no-tap-highlight h-9 px-1 whitespace-nowrap shrink-0"
            title="Back to Pulse"
          >
            <ArrowLeft className="h-3 w-3 shrink-0" />
            <span className="hidden lg:inline">Back to Pulse</span>
          </a>
          <span className="mx-1 h-4 w-px bg-white/10 hidden sm:block" />
          <Link to="/" className="flex items-baseline gap-2 min-w-0 shrink-0">
            <span className="font-display text-lg tracking-[-0.02em] leading-none whitespace-nowrap">Pulse</span>
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--spark)] pulse-dot shrink-0"
              style={{ boxShadow: "0 0 12px var(--spark)" }}
            />
            <span className="font-display text-lg tracking-[-0.02em] leading-none text-[var(--spark)] whitespace-nowrap">
              Feedback
            </span>
            <span className="ml-1.5 hidden lg:inline-flex h-[18px] items-center px-1.5 rounded-full bg-[var(--spark)]/12 text-[var(--spark)] font-mono text-[9px] tracking-[0.12em] uppercase font-semibold whitespace-nowrap">
              Labs · Beta
            </span>
          </Link>
          <div className="flex-1" />
          <nav className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Link
              to="/"
              className={cn(
                "h-9 inline-flex items-center gap-1.5 px-3 rounded-md border text-xs font-medium press-scale transition-colors tap-target no-tap-highlight",
                onBoard
                  ? "bg-white/8 text-white border-white/10"
                  : "bg-transparent text-white/55 border-transparent hover:text-white hover:bg-white/5",
              )}
              title="Feature board"
            >
              <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden lg:inline whitespace-nowrap">Board</span>
            </Link>
            <Link
              to="/voting-power"
              className={cn(
                "h-9 inline-flex items-center gap-1.5 px-3 rounded-md border text-xs font-medium press-scale transition-colors tap-target no-tap-highlight",
                onVoting
                  ? "bg-[var(--spark)]/10 text-[var(--spark)] border-[var(--spark)]/40"
                  : "bg-transparent text-[var(--spark)]/85 border-[var(--spark)]/30 hover:bg-[var(--spark)]/10",
              )}
              title="Voting power"
            >
              <Coins className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden lg:inline whitespace-nowrap">Voting Power</span>
            </Link>
            {admin && (
              <span className="ml-1 hidden xl:inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-[var(--spark)]/10 text-[var(--spark)] border border-[var(--spark)]/25 text-[10px] font-mono tracking-[0.12em] uppercase whitespace-nowrap">
                <ShieldCheck className="h-3 w-3 shrink-0" />
                Admin
              </span>
            )}
            <span className="mx-1 h-5 w-px bg-white/10" />
          </nav>
          {user && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5">
                <AuthorAvatar name={displayName} avatarUrl={user.imageUrl ?? null} size={22} />
                <div className="text-xs font-medium max-w-[160px] truncate whitespace-nowrap">{displayName}</div>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  window.location.assign(`${APP_URL}/login`);
                }}
                className="h-9 w-9 lg:w-auto lg:h-8 lg:px-2.5 inline-flex items-center justify-center gap-1.5 rounded-md border border-white/10 bg-transparent hover:bg-white/5 text-[11px] text-white/60 tap-target no-tap-highlight"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden lg:inline whitespace-nowrap">Sign out</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile-only secondary nav strip */}
        <nav className="sm:hidden flex items-center gap-1.5 px-3 pb-2 -mt-1">
          <Link
            to="/"
            className={cn(
              "flex-1 h-9 inline-flex items-center justify-center gap-1.5 px-3 rounded-md border text-xs font-medium press-scale transition-colors tap-target no-tap-highlight",
              onBoard
                ? "bg-white/8 text-white border-white/10"
                : "bg-transparent text-white/55 border-white/8 hover:text-white hover:bg-white/5",
            )}
            title="Feature board"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Board</span>
          </Link>
          <Link
            to="/voting-power"
            className={cn(
              "flex-1 h-9 inline-flex items-center justify-center gap-1.5 px-3 rounded-md border text-xs font-medium press-scale transition-colors tap-target no-tap-highlight",
              onVoting
                ? "bg-[var(--spark)]/10 text-[var(--spark)] border-[var(--spark)]/40"
                : "bg-transparent text-[var(--spark)]/85 border-[var(--spark)]/30 hover:bg-[var(--spark)]/10",
            )}
            title="Voting power"
          >
            <Coins className="h-3.5 w-3.5" />
            <span>Voting</span>
          </Link>
        </nav>
      </header>
      <main
        className="flex-1 overflow-y-auto scrollbar-thin pb-safe"
        style={{ scrollPaddingTop: "calc(env(safe-area-inset-top, 0px) + 7rem)" }}
      >
        {isLoaded ? (
          children
        ) : (
          <div className="flex flex-1 items-center justify-center min-h-[40vh]">
            <div className="h-6 w-6 rounded-full border-2 border-white/15 border-t-white animate-spin" />
          </div>
        )}
      </main>
    </div>
  );
}
