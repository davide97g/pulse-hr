import { useState } from "react";
import { toast } from "sonner";
import { Bookmark, BookmarkPlus, Check, Link2, Pencil, Trash2, X, RotateCcw, MoreHorizontal } from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SavedView } from "@/lib/useSavedViews";

interface Props<State> {
  savedViews: SavedView<State>[];
  activeViewId: string | null;
  isDirty: boolean;
  shareUrl: string;
  onApply: (id: string) => void;
  onSave: (name: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onReset: () => void;
  placeholder?: string;
}

export function SavedViewsBar<State>({
  savedViews, activeViewId, isDirty, shareUrl,
  onApply, onSave, onRemove, onRename, onReset, placeholder,
}: Props<State>) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const copyLink = () => {
    if (!shareUrl) return;
    try {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied");
    } catch {}
  };

  if (savedViews.length === 0 && !isDirty) {
    return (
      <div className="mb-3 text-[11px] text-muted-foreground flex items-center gap-2">
        <Bookmark className="h-3 w-3" />
        <span>{placeholder ?? "Apply filters, then save a view to jump back in one click."}</span>
      </div>
    );
  }

  return (
    <div className="mb-3 flex items-center gap-1.5 flex-wrap">
      <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
      {savedViews.map(v => {
        const active = v.id === activeViewId;
        return (
          <div key={v.id} className="inline-flex items-stretch">
            <button
              onClick={() => onApply(v.id)}
              className={cn(
                "h-8 pl-2.5 pr-1 rounded-l-md border border-r-0 text-xs inline-flex items-center gap-1.5 transition-colors press-scale",
                active
                  ? "bg-primary/10 border-primary/40 text-foreground"
                  : "hover:bg-muted",
              )}
            >
              {active && <Check className="h-3 w-3 text-primary" />}
              {v.name}
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "h-8 px-1.5 rounded-r-md border text-muted-foreground hover:bg-muted press-scale",
                    active && "border-primary/40",
                  )}
                  aria-label={`Manage ${v.name}`}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[220px] p-1">
                {editing === v.id ? (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (editName.trim()) onRename(v.id, editName.trim());
                      setEditing(null);
                    }}
                    className="p-2 flex gap-1"
                  >
                    <Input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Button size="sm" className="h-8 press-scale" type="submit">
                      <Check className="h-3 w-3" />
                    </Button>
                  </form>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditing(v.id); setEditName(v.name); }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted"
                    >
                      <Pencil className="h-3 w-3" /> Rename
                    </button>
                    <button
                      onClick={() => { onApply(v.id); copyLink(); }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted"
                    >
                      <Link2 className="h-3 w-3" /> Copy share link
                    </button>
                    <button
                      onClick={() => onRemove(v.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-destructive/10 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </>
                )}
              </PopoverContent>
            </Popover>
          </div>
        );
      })}

      <Popover open={saveOpen} onOpenChange={setSaveOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={!isDirty}
            className={cn(
              "h-8 px-2 rounded-md border text-xs inline-flex items-center gap-1.5 press-scale transition-colors",
              isDirty
                ? "border-dashed hover:bg-muted text-foreground"
                : "border-dashed text-muted-foreground opacity-60 cursor-not-allowed",
            )}
          >
            <BookmarkPlus className="h-3 w-3" />
            Save view
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[240px] p-3">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!newName.trim()) return;
              onSave(newName.trim());
              setNewName("");
              setSaveOpen(false);
              toast.success(`View "${newName.trim()}" saved`);
            }}
            className="space-y-2"
          >
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Name this view</div>
            <Input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="Eng · Active only" className="h-8 text-xs" />
            <div className="flex justify-end gap-1.5">
              <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSaveOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="h-7 text-xs press-scale" disabled={!newName.trim()}>
                <Check className="h-3 w-3 mr-1" />Save
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>

      {isDirty && (
        <>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs press-scale" onClick={onReset} title="Reset filters">
            <RotateCcw className="h-3 w-3 mr-1" />Reset
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs press-scale" onClick={copyLink} title="Copy shareable link">
            <Link2 className="h-3 w-3 mr-1" />Share
          </Button>
        </>
      )}
    </div>
  );
}
