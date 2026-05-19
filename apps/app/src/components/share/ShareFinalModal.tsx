import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@pulse-hr/ui/primitives/dialog";
import { useI18n } from "@pulse-hr/shared/i18n";
import {
  addInvites,
  getInviteLink,
  type InviteRole,
} from "@/lib/invites";
import { useEmployees } from "@/lib/tables/employees";
import { useWorkspaceStatus } from "@/lib/workspace";
import { CloseX } from "./share-atoms";
import { ShareFinalCompose } from "./ShareFinalCompose";
import { ShareFinalSent } from "./ShareFinalSent";
import { ShareFinalShared } from "./ShareFinalShared";
import type { AutocompleteSuggestion } from "./share-atoms";
import "./share-final.css";

type View = "compose" | "sent" | "shared";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareFinalModal({ open, onOpenChange }: Props) {
  const { locale } = useI18n();
  const ws = useWorkspaceStatus();
  const employees = useEmployees();
  const it = locale === "it";

  const [view, setView] = useState<View>("compose");
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [role, setRole] = useState<InviteRole>("Member");
  const [copied, setCopied] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [sentEmails, setSentEmails] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null!);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slug = ws.name.toLowerCase().replace(/\s+/g, "-");
  const link = getInviteLink(slug);

  useEffect(() => {
    if (!open) return;
    // reset state on every open
    setView("compose");
    setEmails([]);
    setDraft("");
    setRole("Member");
    setCopied(false);
    setActiveSuggestion(0);
    setSentEmails([]);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (sentTimerRef.current) clearTimeout(sentTimerRef.current);
    };
  }, []);

  const avatarStack = useMemo(
    () => employees.slice(0, 4).map((e) => e.initials),
    [employees],
  );

  const onAddEmail = useCallback(
    (email: string) => {
      const clean = email.trim().replace(/[,;]$/, "");
      if (!clean || emails.includes(clean)) {
        setDraft("");
        return;
      }
      setEmails((prev) => [...prev, clean]);
      setDraft("");
      setActiveSuggestion(0);
    },
    [emails],
  );

  const onRemoveEmail = useCallback((email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  }, []);

  const onAcceptSuggestion = useCallback(
    (s: AutocompleteSuggestion) => {
      if (s.guest) setRole("Guest");
      onAddEmail(s.email);
    },
    [onAddEmail],
  );

  const onCopy = useCallback(() => {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
  }, [link]);

  const onSend = useCallback(() => {
    if (emails.length === 0) return;
    addInvites(emails, role, role === "Guest" ? 30 : undefined);
    setSentEmails(emails);
    setEmails([]);
    setDraft("");
    setView("sent");
    toast.success(
      it
        ? `${emails.length} invit${emails.length === 1 ? "o spedito" : "i spediti"}`
        : `${emails.length} invite${emails.length === 1 ? "" : "s"} sent`,
    );
    if (sentTimerRef.current) clearTimeout(sentTimerRef.current);
    sentTimerRef.current = setTimeout(() => setView("shared"), 3200);
  }, [emails, role, it]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const backToCompose = useCallback(() => setView("compose"), []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="share-final !p-0 !gap-0 !border-0 !max-w-none !w-auto !bg-transparent !shadow-none !rounded-none data-[state=open]:!animate-none data-[state=closed]:!animate-none"
        style={{
          width: 720,
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            background: "var(--bg)",
            border: "1px solid var(--line-strong)",
            borderRadius: 22,
            boxShadow:
              "0 80px 160px -40px color-mix(in oklch, var(--spark) 16%, transparent), 0 24px 48px -12px rgba(12,10,8,.22)",
            overflow: "hidden",
            position: "relative",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          <div
            style={{
              padding: "16px 28px",
              borderBottom: "1px dashed var(--line-strong)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "color-mix(in oklch, var(--bg-2) 30%, transparent)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 0,
              }}
            >
              <span
                className="t-mono truncate"
                style={{ color: "var(--muted-foreground)" }}
              >
                {it
                  ? `INVITO · WORKSPACE ${ws.name.toUpperCase()}`
                  : `INVITE · WORKSPACE ${ws.name.toUpperCase()}`}
              </span>
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 999,
                  background: "var(--spark)",
                  flexShrink: 0,
                }}
              />
            </div>
            <CloseX onClick={close} />
          </div>

          {view === "compose" && (
            <ShareFinalCompose
              emails={emails}
              draft={draft}
              copied={copied}
              role={role}
              activeSuggestion={activeSuggestion}
              onDraftChange={(v) => {
                setDraft(v);
                setActiveSuggestion(0);
              }}
              onRemoveEmail={onRemoveEmail}
              onAddEmail={onAddEmail}
              onAcceptSuggestion={onAcceptSuggestion}
              onRoleChange={setRole}
              onCopy={onCopy}
              onSend={onSend}
              inputRef={inputRef}
              link={link}
              workspaceCount={ws.headcount}
              avatarStack={avatarStack}
            />
          )}
          {view === "sent" && (
            <ShareFinalSent
              emails={sentEmails}
              onInviteOthers={backToCompose}
              onClose={close}
            />
          )}
          {view === "shared" && (
            <ShareFinalShared
              onInviteOthers={backToCompose}
              workspaceName={ws.name}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
