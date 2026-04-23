import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { useEffect } from "react";

export function SidePanel({
  open,
  onClose,
  title,
  children,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-foreground/10 z-40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed top-0 right-0 h-full max-w-[100vw] bg-card border-l z-50 flex flex-col transition-transform duration-250 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        style={{ width: `min(${width}px, 100vw)`, boxShadow: "var(--shadow-panel)" }}
      >
        {open && (
          <>
            <div className="h-14 px-5 flex items-center justify-between border-b shrink-0">
              <div className="font-semibold text-sm truncate">{title}</div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
          </>
        )}
      </aside>
    </>
  );
}
