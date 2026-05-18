import { useEffect, useRef, useState } from "react";
import type { InviteRole } from "@/lib/invites";

export function CheckIcon({ spark }: { spark?: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden>
      <path
        d="M2 5.5 L4.5 8 L9 3"
        stroke={spark ? "var(--spark)" : "currentColor"}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseX({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Chiudi"
      className="sf-btn"
      style={{
        width: 32,
        height: 32,
        borderRadius: 999,
        border: "1px solid var(--line)",
        background: "transparent",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--fg)",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
        <path
          d="M2 2 L10 10 M10 2 L2 10"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

export function EmailChip({
  email,
  onRemove,
}: {
  email: string;
  onRemove: () => void;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px 4px 4px",
        borderRadius: 999,
        background: "color-mix(in oklch, var(--spark) 18%, transparent)",
        border: "1px solid color-mix(in oklch, var(--spark) 60%, transparent)",
      }}
    >
      <span
        className="avatar avatar-xs"
        style={{ background: "var(--spark)", color: "var(--spark-ink)" }}
      >
        {email.charAt(0).toUpperCase()}
      </span>
      <span style={{ fontSize: 12, color: "var(--fg)" }}>{email}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${email}`}
        style={{
          color: "var(--muted-foreground)",
          cursor: "pointer",
          fontSize: 14,
          lineHeight: 1,
          background: "transparent",
          border: "none",
          padding: 0,
        }}
      >
        ×
      </button>
    </span>
  );
}

export interface AutocompleteSuggestion {
  initials: string;
  name: string;
  email: string;
  meta: string;
  guest?: boolean;
}

export function AutocompleteRow({
  active,
  suggestion,
  onSelect,
}: {
  active: boolean;
  suggestion: AutocompleteSuggestion;
  onSelect: () => void;
}) {
  return (
    <div
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className="sf-autorow"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        background: active
          ? "color-mix(in oklch, var(--spark) 12%, transparent)"
          : "transparent",
        borderLeft: active
          ? "3px solid var(--spark)"
          : "3px solid transparent",
        cursor: "pointer",
      }}
    >
      <span
        className="avatar avatar-sm"
        style={
          suggestion.guest
            ? {
                background: "transparent",
                color: "var(--fg)",
                border: "1.5px dashed var(--line-strong)",
              }
            : undefined
        }
      >
        {suggestion.initials}
      </span>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
        }}
      >
        <span
          style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}
          className="truncate"
        >
          {suggestion.name}{" "}
          <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>
            · {suggestion.email}
          </span>
        </span>
        <span
          className="t-mono truncate"
          style={{
            color: suggestion.guest ? "var(--spark)" : "var(--muted-foreground)",
          }}
        >
          {suggestion.meta}
        </span>
      </div>
      {suggestion.guest && <RoleChip role="Guest" interactive={false} />}
      {active && (
        <span className="t-mono" style={{ color: "var(--spark)" }}>
          ⏎
        </span>
      )}
    </div>
  );
}

const ROLE_ORDER: InviteRole[] = ["Admin", "Member", "Viewer", "Guest"];

export function RoleChip({
  role,
  accent = false,
  interactive = true,
  onChange,
}: {
  role: InviteRole | "Owner";
  accent?: boolean;
  interactive?: boolean;
  onChange?: (role: InviteRole) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const owner = role === "Owner";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isGuest = role === "Guest";

  return (
    <span
      ref={ref}
      className="sf-role"
      onClick={() => {
        if (!interactive || owner) return;
        setOpen((v) => !v);
      }}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 999,
        border:
          "1px solid " +
          (isGuest
            ? "color-mix(in oklch, var(--spark) 60%, transparent)"
            : "var(--line-strong)"),
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: accent ? "var(--spark-ink)" : "var(--fg)",
        background: accent
          ? "var(--spark)"
          : isGuest
            ? "color-mix(in oklch, var(--spark) 12%, transparent)"
            : "transparent",
        cursor: interactive && !owner ? "pointer" : "default",
        opacity: owner ? 0.85 : 1,
        userSelect: "none",
      }}
    >
      {role.toUpperCase()}
      {!owner && interactive && (
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          className="sf-caret"
          style={{ marginLeft: 1, opacity: 0.6 }}
          aria-hidden
        >
          <path
            d="M1 2.5 L4 5.5 L7 2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {open && (
        <span
          role="menu"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 10,
            minWidth: 160,
            background: "var(--bg)",
            border: "1px solid var(--line-strong)",
            borderRadius: 12,
            padding: 4,
            boxShadow: "0 20px 40px -12px rgba(12,10,8,.25)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {ROLE_ORDER.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                onChange?.(r);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                borderRadius: 8,
                border: "none",
                background: r === role ? "var(--bg-2)" : "transparent",
                color: "var(--fg)",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {r}
              {r === role && (
                <span style={{ color: "var(--spark)" }}>
                  <CheckIcon spark />
                </span>
              )}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}
