import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Pin,
  Plus,
  MessageSquare,
  Heart,
  Trash2,
  MoreHorizontal,
  Megaphone,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { Textarea } from "@pulse-hr/ui/primitives/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@pulse-hr/ui/primitives/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@pulse-hr/ui/primitives/alert-dialog";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { ListLayout } from "@pulse-hr/ui/atoms/ListLayout";
import { DataState } from "@pulse-hr/ui/atoms/DataState";
import { useSimulatedLoading } from "@pulse-hr/ui/hooks/use-simulated-loading";
import { useBulkSelect, BulkBar, RowCheckbox } from "@/components/app/bulk";
import type { Announcement } from "@/lib/mock-data";
import { announcementsTable, useAnnouncements } from "@/lib/tables/announcements";
import { useFullName } from "@/lib/current-user";
import { useUrlParam } from "@/lib/useUrlParam";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "Announcements — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>) => s as Record<string, string>,
  component: Announcements,
});

function Announcements() {
  const me = useFullName() || "You";
  const posts = useAnnouncements();
  const [composeOpen, setComposeOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Announcement | null>(null);
  const loading = useSimulatedLoading(320);
  const [commentForRaw, setCommentForRaw] = useUrlParam("comment");
  const commentFor = commentForRaw || null;
  const setCommentFor = (v: string | null) => setCommentForRaw(v);
  const [commentText, setCommentText] = useState("");

  const create = (data: { title: string; body: string; pinned: boolean }) => {
    announcementsTable.add({
      id: `p-${Date.now()}`,
      author: me,
      title: data.title,
      body: data.body,
      time: "just now",
      pinned: data.pinned,
      reactions: 0,
      youReacted: false,
      comments: [],
    });
    toast.success("Announcement published");
  };
  const remove = (p: Announcement) => {
    announcementsTable.remove(p.id);
    toast("Announcement deleted", {
      action: { label: "Undo", onClick: () => announcementsTable.add(p) },
    });
  };
  const togglePin = (p: Announcement) => {
    announcementsTable.update(p.id, { pinned: !p.pinned });
  };
  const react = (p: Announcement) => {
    const current = p.reactions ?? 12;
    const youReacted = p.youReacted ?? false;
    announcementsTable.update(p.id, {
      youReacted: !youReacted,
      reactions: current + (youReacted ? -1 : 1),
    });
  };
  const addComment = (p: Announcement) => {
    if (!commentText.trim()) return;
    const next = [...(p.comments ?? []), { who: me, text: commentText.trim() }];
    announcementsTable.update(p.id, { comments: next });
    setCommentText("");
    toast.success("Comment posted");
  };

  const sorted = [...posts].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  const state = loading ? "loading" : sorted.length === 0 ? "empty" : "populated";

  const bulk = useBulkSelect(sorted);

  const bulkSetPinned = (pinned: boolean) => {
    const targets = bulk.selectedRows.filter((p) => p.pinned !== pinned);
    if (targets.length === 0) {
      toast(`Already ${pinned ? "pinned" : "unpinned"}`);
      return;
    }
    targets.forEach((p) => announcementsTable.update(p.id, { pinned }));
    bulk.clear();
    toast.success(
      `${pinned ? "Pinned" : "Unpinned"} ${targets.length} announcement${
        targets.length === 1 ? "" : "s"
      }`,
    );
  };

  const bulkDelete = () => {
    const targets = bulk.selectedRows;
    if (targets.length === 0) return;
    targets.forEach((p) => announcementsTable.remove(p.id));
    bulk.clear();
    toast(`${targets.length} announcement${targets.length === 1 ? "" : "s"} deleted`, {
      action: {
        label: "Undo",
        onClick: () => targets.forEach((p) => announcementsTable.add(p)),
      },
    });
  };

  return (
    <ListLayout
      width="narrow"
      className="fade-in"
      header={
        <PageHeader
          title="Announcements"
          description="Company-wide updates from leadership and HR"
          actions={
            <Button size="sm" className="press-scale" onClick={() => setComposeOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              New post
            </Button>
          }
        />
      }
      sidePanel={
        <SidePanel
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          title="New announcement"
        >
          <div className="p-5">
            <p className="text-caption mb-4">Visible to everyone in Acme Inc.</p>
            <ComposeForm
              onCancel={() => setComposeOpen(false)}
              onSave={(d) => {
                create(d);
                setComposeOpen(false);
              }}
            />
          </div>
        </SidePanel>
      }
    >
      <DataState
        state={state}
        loading={
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
        }
        empty={
          <EmptyState
            tone="welcome"
            icon={<Megaphone className="h-6 w-6" />}
            title="No announcements yet"
            description="Share something with the team to kick off the feed."
            action={
              <Button size="sm" onClick={() => setComposeOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                First post
              </Button>
            }
          />
        }
      >
        <div className="space-y-3 stagger-in">
          {sorted.map((a) => {
            const reactions = a.reactions ?? 12;
            const youReacted = a.youReacted ?? false;
            const comments = a.comments ?? [];
            return (
              <Card
                key={a.id}
                className={`p-5 hover:shadow-md transition-shadow group ${
                  a.pinned ? "border-warning/40 bg-warning/[0.03]" : ""
                } ${bulk.isSelected(a.id) ? "ring-2 ring-primary/50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <RowCheckbox
                    checked={bulk.isSelected(a.id)}
                    onChange={() => bulk.toggle(a.id)}
                    label={`Select ${a.title}`}
                    className="mt-1"
                  />
                  <Avatar
                    initials={a.author
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
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
                            <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => togglePin(a)}>
                              <Pin className="h-4 w-4 mr-2" />
                              {a.pinned ? "Unpin" : "Pin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                const url = `${window.location.origin}/announcements/${a.id}`;
                                try {
                                  await navigator.clipboard.writeText(url);
                                  toast.success("Link copied", { description: url });
                                } catch {
                                  toast.error("Couldn't copy link");
                                }
                              }}
                            >
                              Copy link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setToDelete(a)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {a.author} • {a.time}
                    </div>
                    <div className="text-sm mt-3 whitespace-pre-wrap">{a.body}</div>

                    <div className="mt-4 pt-3 border-t flex items-center gap-4 text-xs text-muted-foreground">
                      <button
                        onClick={() => react(a)}
                        className={`inline-flex items-center gap-1.5 hover:text-foreground press-scale ${youReacted ? "text-destructive" : ""}`}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${youReacted ? "fill-destructive text-destructive" : ""}`}
                        />
                        {reactions}
                      </button>
                      <button
                        onClick={() => setCommentFor(commentFor === a.id ? null : a.id)}
                        className="inline-flex items-center gap-1.5 hover:text-foreground press-scale"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {comments.length} comment{comments.length === 1 ? "" : "s"}
                      </button>
                    </div>

                    {commentFor === a.id && (
                      <div className="mt-3 space-y-2 fade-in">
                        {comments.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                              {c.who
                                .split(" ")
                                .map((p) => p[0])
                                .join("")}
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
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addComment(a)}
                            placeholder="Write a comment…"
                            className="h-9"
                          />
                          <Button
                            size="sm"
                            className="press-scale"
                            onClick={() => addComment(a)}
                            disabled={!commentText.trim()}
                          >
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </DataState>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete && `"${toDelete.title}" will be removed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) remove(toDelete);
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BulkBar
        count={bulk.count}
        onClear={bulk.clear}
        noun="announcement"
        actions={[
          {
            label: "Pin",
            icon: <Pin className="h-3.5 w-3.5" />,
            onClick: () => bulkSetPinned(true),
          },
          {
            label: "Unpin",
            icon: <Pin className="h-3.5 w-3.5" />,
            onClick: () => bulkSetPinned(false),
          },
          {
            label: "Delete",
            icon: <Trash2 className="h-3.5 w-3.5" />,
            onClick: bulkDelete,
            tone: "destructive",
          },
        ]}
      />
    </ListLayout>
  );
}

function ComposeForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (d: { title: string; body: string; pinned: boolean }) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Q2 OKRs published"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Message</Label>
          <Textarea
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share context, links, and next steps…"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Pin to top
        </label>
      </div>
      <div className="flex items-center justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={!title.trim() || !body.trim()}
          onClick={() => onSave({ title, body, pinned })}
        >
          <Send className="h-4 w-4 mr-1.5" />
          Publish
        </Button>
      </div>
    </>
  );
}
