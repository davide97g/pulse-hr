import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Pin, Plus, MessageSquare, Heart, Trash2, MoreHorizontal, Megaphone, Send,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import { announcements as seed } from "@/lib/mock-data";
import { useFullName } from "@/lib/current-user";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "Announcements — Pulse HR" }] }),
  component: Announcements,
});

type Post = {
  id: string; author: string; title: string; body: string; time: string;
  pinned: boolean; reactions: number; youReacted: boolean; comments: { who: string; text: string }[];
};

function Announcements() {
  const me = useFullName() || "You";
  const [posts, setPosts] = useState<Post[]>(
    seed.map(a => ({ ...a, reactions: 12, youReacted: false, comments: [] }))
  );
  const [composeOpen, setComposeOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => { const t = setTimeout(() => setLoading(false), 320); return () => clearTimeout(t); }, []);

  const create = (data: { title: string; body: string; pinned: boolean }) => {
    const p: Post = {
      id: `p-${Date.now()}`, author: me, title: data.title, body: data.body,
      time: "just now", pinned: data.pinned, reactions: 0, youReacted: false, comments: [],
    };
    setPosts(ps => [p, ...ps]);
    toast.success("Announcement published");
  };
  const remove = (p: Post) => {
    setPosts(ps => ps.filter(x => x.id !== p.id));
    toast("Announcement deleted", { action: { label: "Undo", onClick: () => setPosts(ps => [p, ...ps]) } });
  };
  const togglePin = (p: Post) => {
    setPosts(ps => ps.map(x => (x.id === p.id ? { ...x, pinned: !x.pinned } : x)));
  };
  const react = (id: string) => {
    setPosts(ps => ps.map(p => (p.id === id ? { ...p, youReacted: !p.youReacted, reactions: p.reactions + (p.youReacted ? -1 : 1) } : p)));
  };
  const addComment = (id: string) => {
    if (!commentText.trim()) return;
    setPosts(ps => ps.map(p => (p.id === id ? { ...p, comments: [...p.comments, { who: me, text: commentText.trim() }] } : p)));
    setCommentText("");
    toast.success("Comment posted");
  };

  const sorted = [...posts].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="p-4 md:p-6 max-w-[900px] mx-auto fade-in">
      <PageHeader
        title="Announcements"
        description="Company-wide updates from leadership and HR"
        actions={
          <Button size="sm" className="press-scale" onClick={() => setComposeOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />New post
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5 flex gap-3">
              <div className="h-10 w-10 rounded-full shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-[40%] shimmer rounded" />
                <div className="h-2.5 w-[60%] shimmer rounded" />
                <div className="h-10 w-full shimmer rounded mt-2" />
              </div>
            </Card>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-6 w-6" />}
          title="No announcements yet"
          description="Share something with the team to kick off the feed."
          action={<Button size="sm" onClick={() => setComposeOpen(true)}><Plus className="h-4 w-4 mr-1.5" />First post</Button>}
        />
      ) : (
        <div className="space-y-3 stagger-in">
          {sorted.map(a => (
            <Card key={a.id} className={`p-5 hover:shadow-md transition-shadow ${a.pinned ? "border-warning/40 bg-warning/[0.03]" : ""}`}>
              <div className="flex items-start gap-3">
                <Avatar
                  initials={a.author.split(" ").map(p => p[0]).join("")}
                  color="oklch(0.6 0.16 220)"
                  size={40}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm">{a.title}</div>
                    {a.pinned && <Pin className="h-3.5 w-3.5 text-warning fill-warning" />}
                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => togglePin(a)}><Pin className="h-4 w-4 mr-2" />{a.pinned ? "Unpin" : "Pin"}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Link copied")}>Copy link</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setToDelete(a)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{a.author} • {a.time}</div>
                  <div className="text-sm mt-3 whitespace-pre-wrap">{a.body}</div>

                  <div className="mt-4 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                    <button
                      onClick={() => react(a.id)}
                      className={`inline-flex items-center gap-1.5 hover:text-foreground press-scale ${a.youReacted ? "text-destructive" : ""}`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${a.youReacted ? "fill-destructive text-destructive" : ""}`} />
                      {a.reactions}
                    </button>
                    <button
                      onClick={() => setCommentFor(commentFor === a.id ? null : a.id)}
                      className="inline-flex items-center gap-1.5 hover:text-foreground press-scale"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {a.comments.length} comment{a.comments.length === 1 ? "" : "s"}
                    </button>
                  </div>

                  {commentFor === a.id && (
                    <div className="mt-3 space-y-2 fade-in">
                      {a.comments.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                            {c.who.split(" ").map(p => p[0]).join("")}
                          </div>
                          <div className="flex-1 rounded-md bg-muted/50 px-3 py-2">
                            <div className="text-[11px] text-muted-foreground">{c.who}</div>
                            <div>{c.text}</div>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addComment(a.id)}
                          placeholder="Write a comment…"
                          className="h-9"
                        />
                        <Button size="sm" className="press-scale" onClick={() => addComment(a.id)} disabled={!commentText.trim()}>
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New announcement</DialogTitle>
            <DialogDescription>Visible to everyone in Acme Inc.</DialogDescription>
          </DialogHeader>
          <ComposeForm
            onCancel={() => setComposeOpen(false)}
            onSave={d => { create(d); setComposeOpen(false); }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>{toDelete && `"${toDelete.title}" will be removed.`}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (toDelete) remove(toDelete); setToDelete(null); }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ComposeForm({ onCancel, onSave }: { onCancel: () => void; onSave: (d: { title: string; body: string; pinned: boolean }) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1.5"><Label>Title</Label><Input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Q2 OKRs published" /></div>
        <div className="space-y-1.5"><Label>Message</Label><Textarea rows={6} value={body} onChange={e => setBody(e.target.value)} placeholder="Share context, links, and next steps…" /></div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} className="h-4 w-4 rounded border-border" />
          Pin to top
        </label>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={!title.trim() || !body.trim()} onClick={() => onSave({ title, body, pinned })}>
          <Send className="h-4 w-4 mr-1.5" />Publish
        </Button>
      </DialogFooter>
    </>
  );
}
