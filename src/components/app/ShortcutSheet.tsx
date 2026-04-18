import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Shortcut {
  keys: string[];
  label: string;
}
interface Group {
  name: string;
  shortcuts: Shortcut[];
}

const GLOBAL: Group = {
  name: "Global",
  shortcuts: [
    { keys: ["⌘", "K"], label: "Command palette · natural language" },
    { keys: ["⌘", "J"], label: "Ask Pulse Copilot" },
    { keys: ["⌘", "⇧", "."], label: "Voice dictate — insert or ask Pulse" },
    { keys: ["⌘", "M"], label: "Open Moments (weekly reel)" },
    { keys: ["⌥", "C"], label: "Switch active commessa" },
    { keys: ["?"], label: "Show keyboard shortcuts" },
    { keys: ["Esc"], label: "Close overlay / deselect" },
  ],
};

const GROUPS_BY_PATH: Record<string, Group[]> = {
  "/time": [
    {
      name: "Time · calendar",
      shortcuts: [
        { keys: ["Click"], label: "Open day peek" },
        { keys: ["Shift", "Click"], label: "Pick a range → bulk apply template" },
        { keys: ["1-9"], label: "Apply timesheet template N (in day peek)" },
        { keys: ["Enter"], label: "Add quick entry" },
      ],
    },
  ],
  "/focus": [
    {
      name: "Focus mode",
      shortcuts: [{ keys: ["Space"], label: "Start / pause session" }],
    },
  ],
  "/kudos": [
    {
      name: "Kudos",
      shortcuts: [{ keys: ["Tab"], label: "Jump between fields" }],
    },
  ],
  "/leave": [
    {
      name: "Leave · pending review",
      shortcuts: [
        { keys: ["Tab"], label: "Focus next pending request" },
        { keys: ["a"], label: "Approve focused request" },
        { keys: ["r"], label: "Reject focused request" },
        { keys: ["⇧", "A"], label: "Approve all pending in view" },
      ],
    },
  ],
  "/expenses": [
    {
      name: "Expenses",
      shortcuts: [
        { keys: ["Tab"], label: "Focus next pending expense" },
        { keys: ["a"], label: "Approve focused expense" },
        { keys: ["r"], label: "Reject focused expense" },
        { keys: ["⇧", "A"], label: "Approve all pending in view" },
      ],
    },
  ],
};

function matchGroupsForPath(path: string): Group[] {
  const match = Object.entries(GROUPS_BY_PATH).find(
    ([p]) => path === p || path.startsWith(p + "/"),
  );
  return match ? match[1] : [];
}

export function ShortcutSheet() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "?" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement | null)?.isContentEditable) return;
      e.preventDefault();
      setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = [GLOBAL, ...matchGroupsForPath(location.pathname)];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary/10 text-primary grid place-items-center">
              <Keyboard className="h-4 w-4" />
            </div>
            Keyboard shortcuts
          </DialogTitle>
          <DialogDescription>
            Press <Kbd>?</Kbd> anywhere to toggle this sheet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
          {groups.map((g) => (
            <div key={g.name}>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-2">
                {g.name}
              </div>
              <ul className="space-y-1.5">
                {g.shortcuts.map((s, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-1">
                    <span className="text-sm">{s.label}</span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, ki) => (
                        <Kbd key={ki}>{k}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[22px] h-6 px-1.5 rounded border bg-muted/60 font-mono text-[11px] text-muted-foreground">
      {children}
    </kbd>
  );
}
