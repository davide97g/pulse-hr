import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { TOURS } from "@/lib/tours";
import { useTour } from "./TourProvider";
import { Dialog, DialogContent } from "@pulse-hr/ui/primitives/dialog";
import { Input } from "@pulse-hr/ui/primitives/input";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { employees, commesse } from "@/lib/mock-data";
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
  { label: "Expenses", to: "/expenses", icon: Receipt },
  { label: "Documents", to: "/documents", icon: FileText },
];

const ACTIONS = [
  { label: "Add employee", id: "add-employee", icon: User },
  { label: "Request leave", id: "request-leave", icon: Calendar },
  { label: "Submit expense", id: "submit-expense", icon: Receipt },
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

  const intents = useMemo(() => (q.length > 2 ? parseCommand(q).slice(0, 3) : []), [q]);

  const runIntent = (intent: ParsedIntent) => {
    switch (intent.kind) {
      case "log-hours": {
        const commessa = commesse.find((c) => c.id === intent.args.commessaId);
        toast.success(`${intent.args.hours}h logged to ${commessa?.code}`, {
          description: `${intent.args.date} · ${intent.args.description}`,
          icon: <CheckCircle2 className="h-4 w-4" />,
        });
        go("/time");
        return;
      }
      case "book-leave":
        act("request-leave");
        return;
      case "approve-expense":
        toast.success("Expense approved", {
          description: String(intent.label)
            .replace(/^Approve "/, "")
            .replace(/"$/, ""),
        });
        go("/expenses");
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
      <DialogContent className="p-0 max-w-xl gap-0 overflow-hidden top-[20%] translate-y-0 [&>button.absolute]:hidden">
        <div className="flex items-center border-b px-3">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask or jump to… try ‘4h migration yesterday’"
            className="border-0 focus-visible:ring-0 shadow-none h-12"
            onKeyDown={(e) => {
              if (e.key === "Enter" && intents[0]) {
                e.preventDefault();
                runIntent(intents[0]);
              }
            }}
          />
          <NewBadge />
          <kbd className="ml-2 text-[10px] font-mono text-muted-foreground border rounded px-1.5 py-0.5">
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
          {(actions.length > 0 || proposalMatches) && (
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
                No results for "{q}". Try "4h migration yesterday", "book friday off" or "approve
                emma expense".
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
                  · <span className="font-mono">approve emma expense</span>
                </li>
                <li>
                  · <span className="font-mono">draft my week</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
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
      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted text-left"
    >
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">{label}</div>
        {desc && <div className="text-xs text-muted-foreground truncate">{desc}</div>}
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
        "w-full flex items-start gap-3 px-2 py-2.5 rounded-md text-left transition-colors press-scale",
        primary ? "bg-primary/5 hover:bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted",
      )}
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
