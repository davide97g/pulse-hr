import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@pulse-hr/shared/i18n";
import { useEmployees } from "@/lib/tables/employees";
import {
  type InviteRole,
  resendInvite,
  restoreInvite,
  revokeInvite,
  updateInviteRole,
  useInvites,
} from "@/lib/invites";
import { RoleChip } from "./share-atoms";

type TabKey = "all" | "pending" | "guests" | "expired";

interface MemberRow {
  id: string;
  initials: string;
  name: string;
  meta: string;
  role: InviteRole | "Owner";
  owner: boolean;
  pending: boolean;
  guest: boolean;
  source: "member" | "invite";
}

interface Props {
  onInviteOthers: () => void;
  workspaceName: string;
}

export function ShareFinalShared({ onInviteOthers, workspaceName }: Props) {
  const { locale } = useI18n();
  const employees = useEmployees();
  const invites = useInvites();
  const it = locale === "it";
  const [tab, setTab] = useState<TabKey>("all");

  const rows = useMemo<MemberRow[]>(() => {
    const members: MemberRow[] = employees.slice(0, 6).map((e, idx) => ({
      id: `m-${e.id}`,
      initials: e.initials,
      name: e.name,
      meta:
        idx === 0
          ? it
            ? "Tu · Owner"
            : "You · Owner"
          : `${e.department}${e.location ? " · " + e.location : ""}`,
      role: idx === 0 ? "Owner" : "Member",
      owner: idx === 0,
      pending: false,
      guest: false,
      source: "member",
    }));
    const inviteRows: MemberRow[] = invites.map((inv) => ({
      id: `i-${inv.id}`,
      initials: inv.initials,
      name: inv.name,
      meta:
        inv.status === "pending"
          ? it
            ? `invito in attesa · inviato ${inv.sent}`
            : `pending invite · sent ${inv.sent}`
          : it
            ? `invito scaduto · ${inv.sent}`
            : `invite expired · ${inv.sent}`,
      role: inv.role,
      owner: false,
      pending: inv.status === "pending",
      guest: inv.role === "Guest",
      source: "invite",
    }));
    return [...members, ...inviteRows];
  }, [employees, invites, it]);

  const filtered = useMemo(() => {
    switch (tab) {
      case "pending":
        return rows.filter((r) => r.pending);
      case "guests":
        return rows.filter((r) => r.guest);
      case "expired":
        return rows.filter((r) => r.source === "invite" && !r.pending);
      default:
        return rows;
    }
  }, [rows, tab]);

  const counts = useMemo(() => {
    return {
      all: rows.length,
      pending: rows.filter((r) => r.pending).length,
      guests: rows.filter((r) => r.guest).length,
      expired: rows.filter((r) => r.source === "invite" && !r.pending).length,
    };
  }, [rows]);

  function inviteId(rowId: string): string | null {
    return rowId.startsWith("i-") ? rowId.slice(2) : null;
  }

  function onResend(rowId: string) {
    const id = inviteId(rowId);
    if (!id) return;
    resendInvite(id);
    toast.success(it ? "Invito rispedito" : "Invite resent");
  }

  function onRevoke(rowId: string) {
    const id = inviteId(rowId);
    if (!id) return;
    const removed = revokeInvite(id);
    if (!removed) return;
    toast(it ? "Invito revocato" : "Invite revoked", {
      action: {
        label: it ? "Annulla" : "Undo",
        onClick: () => restoreInvite(removed),
      },
    });
  }

  function onRoleChange(rowId: string, role: InviteRole) {
    const id = inviteId(rowId);
    if (!id) return;
    updateInviteRole(id, role);
  }

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "all", label: it ? `TUTTI · ${counts.all}` : `ALL · ${counts.all}` },
    {
      key: "pending",
      label: it
        ? `IN ATTESA · ${counts.pending}`
        : `PENDING · ${counts.pending}`,
    },
    {
      key: "guests",
      label: it ? `OSPITI · ${counts.guests}` : `GUESTS · ${counts.guests}`,
    },
    {
      key: "expired",
      label: it
        ? `SCADUTI · ${counts.expired}`
        : `EXPIRED · ${counts.expired}`,
    },
  ];

  return (
    <div
      style={{
        padding: "24px 40px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {it
              ? `ACCESSO · WORKSPACE ${workspaceName.toUpperCase()}`
              : `ACCESS · WORKSPACE ${workspaceName.toUpperCase()}`}
          </span>
          <h2
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "6px 0 0",
              fontSize: 40,
              letterSpacing: "-0.03em",
              lineHeight: 0.96,
              color: "var(--fg)",
            }}
          >
            <span style={{ fontStyle: "italic" }}>{counts.all}</span>
            {it
              ? ` persone, ${counts.guests} ospit${counts.guests === 1 ? "e" : "i"}.`
              : ` people, ${counts.guests} guest${counts.guests === 1 ? "" : "s"}.`}
          </h2>
        </div>
        <button
          type="button"
          onClick={onInviteOthers}
          className="pill pill-dark pill-sm sf-btn"
          style={{ padding: "6px 14px" }}
        >
          + {it ? "Invita" : "Invite"}
        </button>
      </div>

      <div
        role="tablist"
        style={{
          display: "flex",
          gap: 18,
          borderBottom: "1px solid var(--line)",
          paddingBottom: 0,
          overflowX: "auto",
        }}
      >
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className="t-mono"
              style={{
                paddingBottom: 10,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: active ? "var(--fg)" : "var(--muted-foreground)",
                borderBottom: active
                  ? "2px solid var(--spark)"
                  : "2px solid transparent",
                transition: "color 140ms",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {filtered.length === 0 && (
          <div
            style={{
              padding: "24px 8px",
              fontSize: 13,
              color: "var(--muted-foreground)",
            }}
          >
            {it ? "Nessun risultato." : "No results."}
          </div>
        )}
        {filtered.map((row, i) => {
          const guestStyle = row.guest
            ? {
                background: "transparent" as const,
                color: "var(--fg)",
                border: "1.5px dashed var(--line-strong)",
              }
            : undefined;
          return (
            <div
              key={row.id}
              className="sf-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 8px",
                margin: "0 -8px",
                borderRadius: 8,
                borderBottom:
                  i < filtered.length - 1 ? "1px solid var(--line)" : "none",
                opacity: row.pending ? 0.9 : 1,
              }}
            >
              <span className="avatar" style={guestStyle}>
                {row.initials}
              </span>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  className="truncate"
                  style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}
                >
                  {row.name}
                </span>
                <span
                  className="t-mono truncate"
                  style={{
                    color: row.pending
                      ? "var(--spark)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {row.pending && "◌ "}
                  {row.meta}
                </span>
              </div>
              <RoleChip
                role={row.role}
                onChange={(r) => onRoleChange(row.id, r)}
                interactive={!row.owner && row.source === "invite"}
              />
              {row.source === "invite" && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => onResend(row.id)}
                    className="pill pill-ghost pill-sm sf-btn"
                    style={{ padding: "5px 10px" }}
                  >
                    {it ? "Rispedisci" : "Resend"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRevoke(row.id)}
                    className="sf-more"
                    aria-label={it ? "Revoca" : "Revoke"}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      border: "none",
                      background: "transparent",
                      color: "var(--muted-foreground)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ⋯
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
