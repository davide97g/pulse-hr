import { useEffect, useMemo, useState } from "react";
import { useI18n as usePaletteI18n } from "@pulse-hr/shared/i18n";
import {
  Search,
  User,
  Calendar,
  Receipt,
  Briefcase,
  FileText,
  Settings,
  Users,
  Clock,
  Sparkles,
  Wand2,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  Lightbulb,
  UserPlus,
} from "lucide-react";
import { TOURS } from "@/lib/tours";
import { useTour } from "./TourProvider";
import { Dialog, DialogContent } from "@pulse-hr/ui/primitives/dialog";
import { Input } from "@pulse-hr/ui/primitives/input";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { employees, projects } from "@/lib/mock-data";
import { useQuickAction } from "./QuickActions";
import { useNewProposal } from "@/components/proposals/ProposalProvider";
import { NewBadge } from "@pulse-hr/ui/atoms/NewBadge";
import { parseCommand, type ParsedIntent } from "@/lib/nlp";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { label: string; to: string; icon: typeof User }[] = [
  { label: "Dashboard", to: "/", icon: Settings },
  { label: "Employees", to: "/people", icon: Users },
  { label: "Time & attendance", to: "/time", icon: Clock },
  { label: "Leave", to: "/leave", icon: Calendar },
  { label: "Documents", to: "/documents", icon: FileText },
];

const ACTIONS = [
  { label: "Add employee", id: "add-employee", icon: User },
  { label: "Request leave", id: "request-leave", icon: Calendar },
  { label: "Post a job", id: "post-job", icon: Briefcase },
] as const;

const TOUR_KEYWORDS = ["tour", "guide", "help", "walkthrough"];
const PROPOSAL_KEYWORDS = "new proposal bug idea improvement feedback";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { locale: paletteLocale } = usePaletteI18n();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { open: openAction } = useQuickAction();
  const { open: openProposal } = useNewProposal();
  const { start: startTour } = useTour();

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const qLower = useMemo(() => q.toLowerCase(), [q]);

  const queryHintsTours = useMemo(
    () => !q || TOUR_KEYWORDS.some((k) => qLower.includes(k)),
    [q, qLower],
  );
  const tourMatches = useMemo(
    () =>
      TOURS.filter(
        (t) => !q || `${t.name} ${t.summary} ${t.workflow}`.toLowerCase().includes(qLower),
      ).slice(0, 4),
    [q, qLower],
  );

  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };
  const act = (id: Parameters<typeof openAction>[0]) => {
    onOpenChange(false);
    openAction(id);
  };

  const empMatches = useMemo(
    () =>
      q
        ? employees
            .filter(
              (e) =>
                e.name.toLowerCase().includes(qLower) ||
                e.role.toLowerCase().includes(qLower),
            )
            .slice(0, 5)
        : [],
    [q, qLower],
  );

  const navItems = useMemo(
    () => NAV_ITEMS.filter((n) => !q || n.label.toLowerCase().includes(qLower)),
    [q, qLower],
  );

  const actions = useMemo(
    () => ACTIONS.filter((a) => !q || a.label.toLowerCase().includes(qLower)),
    [q, qLower],
  );

  const proposalMatches = !q || PROPOSAL_KEYWORDS.includes(qLower);
  const inviteKeywords = paletteLocale === "it"
    ? "invita persone invito condividi share"
    : "invite people share workspace";
  const inviteMatches = !q || inviteKeywords.includes(qLower);

  const intents = useMemo(() => (q.length > 2 ? parseCommand(q).slice(0, 3) : []), [q]);

  const runIntent = (intent: ParsedIntent) => {
    switch (intent.kind) {
      case "log-hours": {
        const project = projects.find((c) => c.id === intent.args.projectId);
        toast.success(`${intent.args.hours}h logged to ${project?.code}`, {
          description: `${intent.args.date} · ${intent.args.description}`,
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
        go("/time");
        return;
      }
      case "book-leave":
        act("request-leave");
        return;
      case "add-employee":
        act("add-employee");
        return;
      case "fill-missing":
        go("/time");
        window.dispatchEvent(
          new CustomEvent("pulse:open-bulk", { detail: { mode: "fill-missing" } }),
        );
        return;
      case "open-autofill":
        go("/time");
        window.dispatchEvent(new CustomEvent("pulse:open-autofill"));
        return;
      case "navigate":
      default:
        return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden top-[14%] translate-y-0 glass [&>button.absolute]:hidden ph-cmdk"
        style={{
          borderRadius: 22,
          maxWidth: "min(720px, calc(100vw - 32px))",
          width: "100%",
          backdropFilter: "blur(40px) saturate(180%)",
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          boxShadow:
            "0 80px 160px -40px color-mix(in oklch, var(--spark) 22%, transparent), 0 24px 48px -12px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="flex items-center gap-3.5 px-6"
          style={{ borderBottom: "1px solid var(--line)" }}
        >
          <span className="t-mono shrink-0" style={{ color: "var(--muted-foreground)" }}>
            ⌘K
          </span>
          <Search
            className="h-4 w-4 shrink-0"
            style={{ color: "var(--muted-foreground)" }}
          />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={paletteLocale === "it" ? "Cerca o digita un comando…" : "Search or type a command…"}
            className="border-0 focus-visible:ring-0 shadow-none h-16 px-0"
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              letterSpacing: "-0.02em",
              fontSize: 28,
              background: "transparent",
              color: "var(--fg)",
              caretColor: "var(--spark)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && intents[0]) {
                e.preventDefault();
                runIntent(intents[0]);
              }
            }}
          />
          <NewBadge />
          <kbd
            className="ml-2 t-mono"
            style={{
              color: "var(--muted-foreground)",
              border: "1px solid var(--line)",
              padding: "4px 8px",
              borderRadius: 6,
            }}
          >
            ESC
          </kbd>
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin p-2">
          {intents.length > 0 && (
            <Section
              label={
                <span className="flex items-center gap-1.5">
                  <Wand2 className="h-3 w-3 text-primary" />
                  Natural language
                </span>
              }
            >
              {intents.map((intent, i) => (
                <IntentItem
                  key={i}
                  intent={intent}
                  primary={i === 0}
                  onRun={() => runIntent(intent)}
                />
              ))}
            </Section>
          )}
          {empMatches.length > 0 && (
            <Section label="Employees">
              {empMatches.map((e) => (
                <Item
                  key={e.id}
                  icon={<User className="h-4 w-4" />}
                  label={e.name}
                  desc={e.role}
                  onSelect={() => go("/people")}
                />
              ))}
            </Section>
          )}
          {(actions.length > 0 || proposalMatches || inviteMatches) && (
            <Section label="Quick actions">
              {actions.map((a) => {
                const Icon = a.icon;
                return (
                  <Item
                    key={a.id}
                    icon={<Icon className="h-4 w-4" />}
                    label={a.label}
                    onSelect={() => act(a.id)}
                  />
                );
              })}
              {inviteMatches && (
                <Item
                  icon={<UserPlus className="h-4 w-4" />}
                  label={paletteLocale === "it" ? "Invita persone" : "Invite people"}
                  desc={paletteLocale === "it" ? "Condividi il workspace" : "Share the workspace"}
                  onSelect={() => {
                    onOpenChange(false);
                    (window as typeof window & {
                      __pulse_openShare?: () => void;
                    }).__pulse_openShare?.();
                  }}
                />
              )}
              {proposalMatches && (
                <Item
                  icon={<Lightbulb className="h-4 w-4" />}
                  label="New proposal"
                  desc="Bug, idea, or improvement · ⌘⇧O"
                  onSelect={() => {
                    onOpenChange(false);
                    openProposal();
                  }}
                />
              )}
            </Section>
          )}
          {tourMatches.length > 0 && queryHintsTours && (
            <Section label="Take a tour">
              {tourMatches.map((t) => (
                <Item
                  key={t.id}
                  icon={<PlayCircle className="h-4 w-4 text-primary" />}
                  label={t.name}
                  desc={`${t.workflow} · ${t.duration}`}
                  onSelect={() => {
                    onOpenChange(false);
                    startTour(t.id);
                  }}
                />
              ))}
            </Section>
          )}
          {navItems.length > 0 && (
            <Section label="Navigate">
              {navItems.map((n) => {
                const Icon = n.icon;
                return (
                  <Item
                    key={n.to}
                    icon={<Icon className="h-4 w-4" />}
                    label={n.label}
                    onSelect={() => go(n.to)}
                  />
                );
              })}
            </Section>
          )}
          {q &&
            intents.length === 0 &&
            empMatches.length === 0 &&
            actions.length === 0 &&
            navItems.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No results for "{q}". Try "4h migration yesterday" or "book friday off".
              </div>
            )}
          {!q && (
            <div className="px-3 py-6 text-xs text-muted-foreground">
              <div className="text-[10px] uppercase tracking-wider font-medium mb-2">
                Try natural language
              </div>
              <ul className="space-y-1">
                <li>
                  · <span className="font-mono">4h migration yesterday</span>
                </li>
                <li>
                  · <span className="font-mono">book friday off</span>
                </li>
                <li>
                  · <span className="font-mono">draft my week</span>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div
          className="flex items-center justify-between px-6 py-2.5"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ↑↓ NAVIGA · ⏎ APRI · ⌘J STATUS LOG
          </span>
          <span className="t-mono" style={{ color: "var(--spark)" }}>
            · LIVE
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="px-2 py-1.5 t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Item({
  icon,
  label,
  desc,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-[10px] text-left transition-colors hover:bg-[color-mix(in_oklch,var(--spark)_8%,transparent)] hover:border-[color-mix(in_oklch,var(--spark)_40%,transparent)]"
      style={{ border: "1px solid transparent" }}
    >
      <div style={{ width: 24, color: "var(--muted-foreground)", textAlign: "center" }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="t-body" style={{ fontWeight: 500, color: "var(--fg)" }}>
          {label}
        </span>
        {desc && (
          <span
            className="t-body truncate"
            style={{ color: "var(--muted-foreground)", fontSize: 12 }}
          >
            {desc}
          </span>
        )}
      </div>
    </button>
  );
}

function IntentItem({
  intent,
  primary,
  onRun,
}: {
  intent: ParsedIntent;
  primary: boolean;
  onRun: () => void;
}) {
  return (
    <button
      onClick={onRun}
      className={cn(
        "w-full flex items-start gap-3.5 px-3 py-2.5 rounded-[10px] text-left transition-colors press-scale",
      )}
      style={{
        background: primary
          ? "color-mix(in oklch, var(--spark) 12%, transparent)"
          : "transparent",
        border: primary
          ? "1px solid color-mix(in oklch, var(--spark) 50%, transparent)"
          : "1px solid transparent",
      }}
    >
      <div
        className={cn(
          "h-7 w-7 rounded-md grid place-items-center shrink-0",
          primary ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
            {intent.verb}
          </span>
          {primary && (
            <span className="text-[10px] text-muted-foreground ml-auto inline-flex items-center gap-1">
              Enter <kbd className="font-mono border rounded px-1 py-0.5">↵</kbd>
            </span>
          )}
        </div>
        <div className="text-sm font-medium mt-0.5">{intent.label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{intent.detail}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
    </button>
  );
}
