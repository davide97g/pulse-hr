import { useMemo } from "react";
import { useI18n } from "@pulse-hr/shared/i18n";
import { useEmployees } from "@/lib/tables/employees";
import type { InviteRole } from "@/lib/invites";
import {
  AutocompleteRow,
  type AutocompleteSuggestion,
  EmailChip,
  RoleChip,
} from "./share-atoms";

const INTERNAL_DOMAIN = "@bitrock.it";

interface Props {
  emails: string[];
  draft: string;
  copied: boolean;
  role: InviteRole;
  activeSuggestion: number;
  onDraftChange: (v: string) => void;
  onRemoveEmail: (email: string) => void;
  onAddEmail: (email: string) => void;
  onAcceptSuggestion: (s: AutocompleteSuggestion) => void;
  onRoleChange: (role: InviteRole) => void;
  onCopy: () => void;
  onSend: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  link: string;
  workspaceCount: number;
  avatarStack: string[];
}

export function ShareFinalCompose({
  emails,
  draft,
  copied,
  role,
  activeSuggestion,
  onDraftChange,
  onRemoveEmail,
  onAddEmail,
  onAcceptSuggestion,
  onRoleChange,
  onCopy,
  onSend,
  inputRef,
  link,
  workspaceCount,
  avatarStack,
}: Props) {
  const { locale } = useI18n();
  const employees = useEmployees();
  const it = locale === "it";
  const typing = draft.trim().length > 0 || emails.length > 0;

  const suggestions = useMemo<AutocompleteSuggestion[]>(() => {
    const token = draft.trim().toLowerCase();
    if (!token) return [];
    const matches = employees
      .filter((e) => {
        const hay = (e.name + " " + e.email).toLowerCase();
        return hay.includes(token) && !emails.includes(e.email);
      })
      .slice(0, 5)
      .map<AutocompleteSuggestion>((e) => ({
        initials: e.initials,
        name: e.name,
        email: e.email,
        meta: `${e.department}${e.location ? " · " + e.location : ""}`,
      }));
    if (token.includes("@") && !token.endsWith(INTERNAL_DOMAIN)) {
      matches.push({
        initials: token.charAt(0).toUpperCase(),
        name: token,
        email: token,
        meta: it
          ? "Collaboratore esterno · suggerimento Guest"
          : "External collaborator · Guest suggestion",
        guest: true,
      });
    }
    return matches;
  }, [draft, employees, emails, it]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const active = suggestions[activeSuggestion];
      if (active) {
        onAcceptSuggestion(active);
        return;
      }
      const value = draft.trim().replace(/,$/, "");
      if (value && /^\S+@\S+\.\S+$/.test(value)) {
        onAddEmail(value);
      } else if (emails.length > 0 && !value) {
        onSend();
      }
    } else if (e.key === "," || e.key === " ") {
      const value = draft.trim();
      if (/^\S+@\S+\.\S+$/.test(value)) {
        e.preventDefault();
        onAddEmail(value);
      }
    } else if (e.key === "Backspace" && !draft && emails.length > 0) {
      onRemoveEmail(emails[emails.length - 1]);
    }
  }

  return (
    <div
      style={{
        padding: "28px 40px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontWeight: 400,
            margin: 0,
            fontSize: 64,
            letterSpacing: "-0.035em",
            lineHeight: 0.92,
            color: "var(--fg)",
          }}
        >
          {it ? "Porta qualcuno" : "Bring someone"}
          <br />
          {it ? "in " : "into "}
          <span style={{ fontStyle: "italic" }}>Pulse</span>
          <span style={{ color: "var(--spark)" }}>.</span>
        </h1>
        <p
          style={{
            margin: "12px 0 0",
            maxWidth: 520,
            fontSize: 14,
            lineHeight: 1.5,
            color: "var(--muted-foreground)",
          }}
        >
          {it
            ? "Chi accetta l'invito entra subito nello stesso workspace — stesse persone, stesse commesse, stessa configurazione. Nessun setup da rifare."
            : "Whoever accepts the invite joins the same workspace right away — same people, same projects, same configuration. No setup to redo."}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {it ? "VIA EMAIL · INVITA UNO O PIÙ" : "VIA EMAIL · INVITE ONE OR MORE"}
        </span>
        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            border:
              "1px solid " + (typing ? "var(--fg)" : "var(--line-strong)"),
            borderRadius: 14,
            padding: "12px 14px",
            background: "color-mix(in oklch, var(--bg-2) 60%, transparent)",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
            minHeight: 56,
            transition: "border-color 160ms ease-out",
            cursor: "text",
          }}
        >
          {emails.map((e) => (
            <EmailChip
              key={e}
              email={e}
              onRemove={() => onRemoveEmail(e)}
            />
          ))}
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              emails.length === 0
                ? it
                  ? "nome@dominio.it, un altro@dominio.it…"
                  : "name@domain.com, another@domain.com…"
                : ""
            }
            style={{
              flex: 1,
              minWidth: 180,
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 14,
              color: "var(--fg)",
            }}
          />
          <RoleChip role={role} onChange={onRoleChange} />
        </div>

        {suggestions.length > 0 && (
          <div
            role="listbox"
            style={{
              border: "1px solid var(--line-strong)",
              borderRadius: 14,
              background: "var(--bg)",
              boxShadow: "0 24px 48px -16px rgba(12,10,8,.18)",
              overflow: "hidden",
              marginTop: 2,
            }}
          >
            <div
              style={{
                padding: "8px 14px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span
                className="t-mono"
                style={{ color: "var(--muted-foreground)" }}
              >
                {it ? "SUGGERIMENTI" : "SUGGESTIONS"}
              </span>
            </div>
            {suggestions.map((s, i) => (
              <AutocompleteRow
                key={s.email}
                active={i === activeSuggestion}
                suggestion={s}
                onSelect={() => onAcceptSuggestion(s)}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {it ? "OPPURE · LINK DI INVITO" : "OR · INVITE LINK"}
        </span>
        <div
          style={{
            border:
              "1px solid " + (copied ? "var(--spark)" : "var(--line-strong)"),
            background: copied
              ? "color-mix(in oklch, var(--spark) 12%, transparent)"
              : "color-mix(in oklch, var(--bg-2) 60%, transparent)",
            borderRadius: 14,
            padding: "10px 10px 10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            transition: "border-color 160ms ease-out, background 200ms ease-out",
          }}
        >
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              color: "var(--fg)",
              letterSpacing: "-0.01em",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {link.split("/").map((part, i, arr) => {
              const isSlug = i === arr.length - 2;
              return (
                <span
                  key={i}
                  style={isSlug ? { color: "var(--spark)" } : undefined}
                >
                  {part}
                  {i < arr.length - 1 ? "/" : ""}
                </span>
              );
            })}
          </span>
          {copied ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 999,
                background: "var(--spark)",
                color: "var(--spark-ink)",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden>
                <path
                  d="M2 5.5 L4.5 8 L9 3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {it ? "COPIATO" : "COPIED"}
            </span>
          ) : (
            <button
              type="button"
              onClick={onCopy}
              className="pill pill-light pill-sm sf-btn"
              style={{
                border: "1px solid var(--line-strong)",
                padding: "6px 12px",
              }}
            >
              {it ? "Copia" : "Copy"}
            </button>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 2,
            flexWrap: "wrap",
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {it ? "SCADE" : "EXPIRES"}
          </span>
          <span style={{ fontSize: 12, color: "var(--fg)" }}>
            {it ? "fra 7 giorni" : "in 7 days"}
          </span>
          <span style={{ color: "var(--muted-foreground)" }}>·</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {it ? "RUOLO" : "ROLE"}
          </span>
          <RoleChip role={role} onChange={onRoleChange} />
        </div>
      </div>

      <div
        style={{
          marginTop: 6,
          paddingTop: 20,
          borderTop: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex" }}>
            {avatarStack.map((i, n) => (
              <span
                key={n}
                className="ph-avatar ph-avatar-sm"
                style={{
                  marginLeft: n === 0 ? 0 : -8,
                  border: "2px solid var(--bg)",
                }}
              >
                {i}
              </span>
            ))}
            {workspaceCount > avatarStack.length && (
              <span
                className="ph-avatar ph-avatar-sm"
                style={{
                  marginLeft: -8,
                  background: "transparent",
                  color: "var(--muted-foreground)",
                  border: "1.5px dashed var(--line-strong)",
                }}
              >
                +{workspaceCount - avatarStack.length}
              </span>
            )}
          </div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {it ? `${workspaceCount} nel workspace` : `${workspaceCount} in workspace`}
          </span>
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={emails.length === 0}
          className="pill pill-spark sf-cta"
          style={{
            padding: "10px 18px",
            opacity: emails.length === 0 ? 0.55 : 1,
            cursor: emails.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {emails.length === 0
            ? it
              ? "Invia inviti"
              : "Send invites"
            : it
              ? `Invia ${emails.length} ${emails.length === 1 ? "invito" : "inviti"}`
              : `Send ${emails.length} ${emails.length === 1 ? "invite" : "invites"}`}
          <span
            className="arr"
            style={{ fontFamily: "Fraunces, ui-serif, serif", marginLeft: 4 }}
          >
            →
          </span>
        </button>
      </div>
    </div>
  );
}
