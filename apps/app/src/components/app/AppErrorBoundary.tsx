import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Copy, RefreshCw, RotateCcw, Github } from "lucide-react";
import { ParticleField } from "./ParticleField";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode; scope?: "app" | "route" };
type State = { error: Error | null };

function resetWorkspace() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("pulse.")) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* noop */
  }
  try {
    sessionStorage.clear();
  } catch {
    /* noop */
  }
  window.location.assign("/");
}

function copyError(err: Error) {
  const text = `${err.name}: ${err.message}\n\n${err.stack ?? ""}`;
  try {
    navigator.clipboard?.writeText(text);
  } catch {
    /* noop */
  }
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const scope = this.props.scope ?? "app";
    const fullscreen = scope === "app";

    return (
      <div
        className={
          fullscreen
            ? "fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden"
            : "relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border bg-card"
        }
      >
        <div className="absolute inset-0">
          <ParticleField variant="error" density="normal" size="full" />
        </div>
        <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-4 px-6 text-center fade-in">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-full blur-2xl opacity-50"
              style={{
                background:
                  "radial-gradient(circle, var(--destructive, #ff6b9a) 0%, transparent 70%)",
              }}
            />
            <div className="relative h-14 w-14 rounded-2xl border bg-card shadow-card flex items-center justify-center text-destructive pop-in">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Something broke</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            {error.message || "An unexpected error interrupted the app."}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground/80 truncate max-w-xs">
            {error.name}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => window.location.reload()} className="press-scale">
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="ml-1.5">Refresh</span>
            </Button>
            <Button variant="outline" onClick={resetWorkspace} className="press-scale">
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="ml-1.5">Reset workspace</span>
            </Button>
            <Button variant="ghost" onClick={() => copyError(error)} className="press-scale">
              <Copy className="h-3.5 w-3.5" />
              <span className="ml-1.5">Copy error</span>
            </Button>
          </div>
          <a
            className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:underline font-mono"
            href="https://github.com/davide97g/pulse-hr/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="h-3 w-3" /> Report on GitHub ↗
          </a>
        </div>
      </div>
    );
  }
}

export function RouteErrorFallback({ error }: { error: Error }) {
  // TanStack Router passes an error to its errorComponent; we funnel it
  // through the same UI by mounting a minimal inline variant.
  return (
    <AppErrorBoundary scope="route">
      <ErrorRethrow error={error} />
    </AppErrorBoundary>
  );
}

function ErrorRethrow({ error }: { error: Error }): never {
  throw error;
}
