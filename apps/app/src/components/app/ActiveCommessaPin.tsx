import { useEffect, useRef, useState } from "react";
import { Command, ChevronDown, Check, Search, Briefcase } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "./WorkspaceContext";
import { commesse } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ActiveCommessaPin({ compact }: { compact?: boolean }) {
  const { activeCommessaId, setActiveCommessaId, activeCommessa } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌥C / Alt+C opens the picker from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
    else setQ("");
  }, [open]);

  const active = commesse.filter(c => c.status !== "closed");
  const matches = q
    ? active.filter(
        c =>
          c.code.toLowerCase().includes(q.toLowerCase()) ||
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.client.toLowerCase().includes(q.toLowerCase()),
      )
    : active;

  const pick = (id: string) => {
    setActiveCommessaId(id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-2 h-9 rounded-md border hover:bg-muted transition-colors press-scale text-xs",
            compact ? "px-2" : "px-2.5",
          )}
          title="Active commessa · Alt+C"
        >
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{
              backgroundColor: activeCommessa?.color,
              boxShadow: activeCommessa ? `0 0 6px ${activeCommessa.color}80` : undefined,
            }}
          />
          {!compact && (
            <span className="font-mono text-[11px] truncate max-w-[120px]">
              {activeCommessa?.code ?? "No commessa"}
            </span>
          )}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] p-0">
        <div className="px-3 py-2 border-b flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
            Active commessa
          </div>
          <kbd className="ml-auto text-[10px] font-mono border rounded px-1.5 py-0.5 bg-muted/50">
            ⌥C
          </kbd>
        </div>
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search code, name or client"
              className="pl-7 h-8 text-xs"
              onKeyDown={e => {
                if (e.key === "Enter" && matches[0]) pick(matches[0].id);
                if (e.key === "Escape") setOpen(false);
              }}
            />
          </div>
        </div>
        <div className="max-h-[280px] overflow-y-auto scrollbar-thin py-1">
          {matches.length === 0 ? (
            <div className="px-4 py-6 text-xs text-muted-foreground text-center">No matches.</div>
          ) : (
            matches.map((c, i) => {
              const isActive = c.id === activeCommessaId;
              return (
                <button
                  key={c.id}
                  onClick={() => pick(c.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-muted/60 transition-colors",
                    isActive && "bg-primary/5",
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-muted-foreground">{c.code}</span>
                      {c.status === "on_hold" && (
                        <span className="text-[9px] uppercase tracking-wider text-warning font-medium">on hold</span>
                      )}
                    </div>
                    <div className="text-xs font-medium truncate">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{c.client}</div>
                  </div>
                  {i < 5 && (
                    <kbd className="hidden md:inline-flex text-[9px] font-mono border rounded px-1 py-0.5 bg-background text-muted-foreground">
                      <Command className="h-2.5 w-2.5 mr-0.5" />{i + 1}
                    </kbd>
                  )}
                  {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })
          )}
        </div>
        <div className="px-3 py-2 border-t text-[10px] text-muted-foreground">
          Used by Time, Focus and Forecast defaults.
        </div>
      </PopoverContent>
    </Popover>
  );
}
