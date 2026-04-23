import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { toast } from "sonner";
import { Send, Users, Search, CheckCircle2 } from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { Textarea } from "@pulse-hr/ui/primitives/textarea";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Checkbox } from "@pulse-hr/ui/primitives/checkbox";
import { PageHeader } from "@/components/app/AppShell";
import { SkeletonRows } from "@pulse-hr/ui/atoms/SkeletonList";
import { useIsEffectiveAdmin } from "@/lib/role-override";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/send-email")({
  head: () => ({ meta: [{ title: "Send email — Pulse HR" }] }),
  component: AdminSendEmail,
});

type Member = {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
};

function AdminSendEmail() {
  const admin = useIsEffectiveAdmin();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await apiFetch("/admin/members", {}, token);
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { members: Member[] };
        if (cancelled) return;
        setMembers(data.members);
      } catch (err) {
        if (!cancelled) toast.error("Couldn't load workspace members");
        console.warn(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken]);

  const filtered = useMemo(() => {
    if (!query.trim()) return members;
    const q = query.toLowerCase();
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.email ?? "").toLowerCase().includes(q),
    );
  }, [members, query]);

  const sendableCount = useMemo(
    () => [...selected].filter((id) => members.find((m) => m.id === id)?.email).length,
    [selected, members],
  );

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[50vh]">
        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
      </div>
    );
  }
  if (!admin) return <Navigate to="/" replace />;

  async function send() {
    if (selected.size === 0) {
      toast.error("Pick at least one recipient");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are required");
      return;
    }
    setSending(true);
    try {
      const token = await getToken();
      const res = await apiFetch(
        "/admin/send-email",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            userIds: [...selected],
            subject: subject.trim(),
            body: body.trim(),
          }),
        },
        token,
      );
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        queued?: number;
        skipped?: { userId: string; reason: string }[];
        error?: { message?: string };
      } | null;
      if (!res.ok || !data?.ok) {
        const msg = data?.error?.message ?? `HTTP ${res.status}`;
        throw new Error(msg);
      }
      const queued = data.queued ?? 0;
      const skipped = data.skipped?.length ?? 0;
      toast.success(
        `Queued ${queued} email${queued === 1 ? "" : "s"}${skipped > 0 ? ` (${skipped} skipped)` : ""}`,
        {
          description:
            "Delivery happens via the send-pending cron (roughly every 5 min) — check Resend for status.",
          icon: <CheckCircle2 className="h-4 w-4" />,
        },
      );
      setSelected(new Set());
      setSubject("");
      setBody("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allFilteredSelected = filtered.length > 0 && filtered.every((m) => selected.has(m.id));
  const toggleAllFiltered = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        for (const m of filtered) next.delete(m.id);
      } else {
        for (const m of filtered) if (m.email) next.add(m.id);
      }
      return next;
    });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto fade-in">
      <PageHeader
        title="Send email"
        description="Pick recipients, write a message, and it's queued through the same outbox that powers release + mention emails. Delivery happens on the next send-pending cron tick."
        actions={
          <Button onClick={send} disabled={sending || sendableCount === 0} className="press-scale">
            <Send className="h-4 w-4 mr-1.5" />
            {sending ? "Sending…" : `Send to ${sendableCount}`}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-4">
        <Card className="p-4 md:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              Recipients
            </div>
            <div className="text-xs text-muted-foreground">
              {selected.size} selected · {members.length} total
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name or email"
              className="pl-8 h-9"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={toggleAllFiltered}
              className="text-primary hover:underline"
              disabled={filtered.length === 0}
            >
              {allFilteredSelected ? "Clear selection" : "Select all matching"}
            </button>
            {selected.size > 0 && (
              <button
                onClick={() => setSelected(new Set())}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="rounded-md border overflow-hidden max-h-[28rem] overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="p-4">
                <SkeletonRows rows={6} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No members match "{query}".
              </div>
            ) : (
              <ul className="divide-y">
                {filtered.map((m) => {
                  const disabled = !m.email;
                  return (
                    <li
                      key={m.id}
                      className={cn(
                        "flex items-start gap-3 px-3 py-2.5 hover:bg-muted/40",
                        disabled && "opacity-60",
                      )}
                    >
                      <Checkbox
                        checked={selected.has(m.id)}
                        disabled={disabled}
                        onCheckedChange={() => toggle(m.id)}
                        className="mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{m.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {m.email ?? "no email on file"}
                        </div>
                      </div>
                      {m.role && (
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                          {m.role}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        <Card className="p-4 md:p-5 space-y-4">
          <div>
            <Label htmlFor="subj" className="text-sm font-medium">
              Subject
            </Label>
            <Input
              id="subj"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Test email from Pulse HR"
              maxLength={200}
              className="mt-1.5 h-9"
            />
          </div>
          <div>
            <Label htmlFor="body" className="text-sm font-medium">
              Message
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hey team — quick check that our email delivery actually works end-to-end."
              maxLength={8000}
              rows={12}
              className="mt-1.5 font-mono text-sm"
            />
            <div className="text-[11px] text-muted-foreground mt-1">
              Plain text. Line breaks are preserved; no markdown parsing.
            </div>
          </div>
          <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground leading-relaxed">
            <div className="font-medium text-foreground mb-0.5">How delivery works</div>
            Each recipient gets one row in <span className="font-mono">
              notifications_outbox
            </span>{" "}
            with <span className="font-mono">template_key = 'admin_message'</span>. The{" "}
            <span className="font-mono">send-pending</span> cron picks it up on its next tick and
            calls Resend. Per-user preferences don't apply — admin messages always send.
          </div>
        </Card>
      </div>
    </div>
  );
}
