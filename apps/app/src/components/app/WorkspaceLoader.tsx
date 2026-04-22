import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { ParticleField } from "./ParticleField";

export type LoaderStep = {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
};

type RunOptions = {
  title?: string;
  subtitle?: string;
  steps: Array<Omit<LoaderStep, "status">>;
  celebrateOnDone?: boolean;
};

type Controller = {
  show: (opts: RunOptions) => void;
  advance: (id: string) => void;
  done: () => void;
  hide: () => void;
  run: <T>(opts: RunOptions, work: (advance: (id: string) => void) => Promise<T>) => Promise<T>;
};

const LoaderCtx = createContext<Controller | null>(null);

type LoaderState = {
  open: boolean;
  title: string;
  subtitle: string;
  steps: LoaderStep[];
  celebrate: boolean;
};

const INITIAL: LoaderState = {
  open: false,
  title: "",
  subtitle: "",
  steps: [],
  celebrate: false,
};

export function WorkspaceLoaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoaderState>(INITIAL);

  const show = useCallback((opts: RunOptions) => {
    setState({
      open: true,
      title: opts.title ?? "Setting up your workspace",
      subtitle: opts.subtitle ?? "This usually takes a few seconds.",
      steps: opts.steps.map((s, i) => ({ ...s, status: i === 0 ? "active" : "pending" })),
      celebrate: opts.celebrateOnDone ?? true,
    });
  }, []);

  const advance = useCallback((id: string) => {
    setState((s) => {
      const idx = s.steps.findIndex((x) => x.id === id);
      if (idx === -1) return s;
      const next = s.steps.map((step, i) => {
        if (i < idx) return { ...step, status: "done" as const };
        if (i === idx) return { ...step, status: "done" as const };
        if (i === idx + 1) return { ...step, status: "active" as const };
        return step;
      });
      return { ...s, steps: next };
    });
  }, []);

  const done = useCallback(() => {
    setState((s) => {
      const celebrate = s.celebrate && s.open;
      if (celebrate) {
        try {
          confetti({
            particleCount: 80,
            spread: 75,
            startVelocity: 32,
            origin: { y: 0.5 },
            colors: ["#b4ff39", "#39e1ff", "#c06bff", "#ff6b9a", "#ffbf4a"],
          });
        } catch {
          /* noop */
        }
      }
      return { ...s, steps: s.steps.map((step) => ({ ...step, status: "done" })) };
    });
    setTimeout(() => setState(INITIAL), 800);
  }, []);

  const hide = useCallback(() => setState(INITIAL), []);

  const run: Controller["run"] = useCallback(
    async (opts, work) => {
      show(opts);
      try {
        const result = await work((id) => advance(id));
        done();
        return result;
      } catch (err) {
        hide();
        throw err;
      }
    },
    [show, advance, done, hide],
  );

  const ctrl = useMemo(
    () => ({ show, advance, done, hide, run }),
    [show, advance, done, hide, run],
  );

  return (
    <LoaderCtx.Provider value={ctrl}>
      {children}
      {state.open ? <LoaderOverlay state={state} /> : null}
    </LoaderCtx.Provider>
  );
}

export function useWorkspaceLoader(): Controller {
  const ctx = useContext(LoaderCtx);
  if (!ctx) {
    // Safe no-op outside the provider so calling code doesn't crash in tests.
    return {
      show: () => {},
      advance: () => {},
      done: () => {},
      hide: () => {},
      run: async (_opts, work) => work(() => {}),
    };
  }
  return ctx;
}

function LoaderOverlay({ state }: { state: LoaderState }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/95 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0">
        <ParticleField variant="ambient" density="dense" size="full" />
      </div>
      <div className="relative z-10 iridescent-border rounded-2xl">
        <div className="relative rounded-2xl border bg-card/95 backdrop-blur shadow-card p-6 w-[min(420px,90vw)] fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[color:var(--labs,#b4ff39)]/15 flex items-center justify-center text-[color:var(--labs,#b4ff39)] pop-in">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg font-semibold leading-tight">{state.title}</div>
              <div className="text-xs text-muted-foreground truncate">{state.subtitle}</div>
            </div>
          </div>
          <ul className="space-y-2">
            {state.steps.map((step) => (
              <li key={step.id} className="flex items-center gap-3 text-sm">
                <StepIndicator status={step.status} />
                <span
                  className={
                    step.status === "done"
                      ? "text-muted-foreground line-through decoration-muted-foreground/40"
                      : step.status === "active"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground/70"
                  }
                >
                  {step.label}
                </span>
                {step.status === "active" && (
                  <span className="typing-dot inline-flex items-center gap-0.5 ml-1" aria-hidden>
                    <span className="h-1 w-1 rounded-full bg-[color:var(--labs,#b4ff39)]" />
                    <span className="h-1 w-1 rounded-full bg-[color:var(--labs,#b4ff39)]" />
                    <span className="h-1 w-1 rounded-full bg-[color:var(--labs,#b4ff39)]" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function StepIndicator({ status }: { status: LoaderStep["status"] }) {
  if (status === "done") {
    return (
      <div className="h-5 w-5 rounded-full bg-[color:var(--labs,#b4ff39)]/20 text-[color:var(--labs,#b4ff39)] flex items-center justify-center">
        <Check className="h-3 w-3" />
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="relative h-5 w-5 rounded-full border-2 border-[color:var(--labs,#b4ff39)] pulse-dot" />
    );
  }
  return <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />;
}
