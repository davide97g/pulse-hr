import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useEffectiveRole } from "@/lib/role-override";
import { LV_LABEL, type SkillLevel, type SkillValidation } from "@/lib/skills-data";

/* ============================================================
 * Shared editorial bits used across the Skills surfaces.
 * ============================================================ */

/** Italic Fraunces label for a level, lime when Master. */
export function LvLabel({
  level,
  size = 18,
}: {
  level: SkillLevel;
  size?: number;
}) {
  return (
    <span
      style={{
        fontFamily: '"Fraunces", ui-serif, serif',
        fontStyle: "italic",
        fontSize: size,
        letterSpacing: "-0.015em",
        color: level === "master" ? "var(--spark)" : "var(--fg)",
      }}
    >
      {LV_LABEL[level]}
    </span>
  );
}

/** Mono caption — `VALIDATED · {BY} · {date}` or `PROPOSED · {date}` (with spark dot). */
export function ValidationTag({
  val,
  by,
  upd,
}: {
  val: SkillValidation;
  by?: string | null;
  upd: string;
}) {
  if (val === "validated") {
    return (
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        VALIDATED · {by ? by.toUpperCase() : "—"} · {upd}
      </span>
    );
  }
  return (
    <span
      className="t-mono"
      style={{ color: "var(--spark)", display: "inline-flex", gap: 6, alignItems: "center" }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          background: "var(--spark)",
          boxShadow: "0 0 6px color-mix(in oklch, var(--spark) 60%, transparent)",
        }}
      />
      PROPOSED · {upd}
    </span>
  );
}

export interface SkillsTabsItem<T extends string> {
  id: T;
  label: ReactNode;
}

/** Editorial tab strip — active = sans bold + underline + dot, inactive = Fraunces italic muted. */
export function SkillsTabsStrip<T extends string>({
  active,
  items,
  onChange,
}: {
  active: T;
  items: SkillsTabsItem<T>[];
  onChange: (id: T) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 26,
        borderBottom: "1px solid var(--line-strong)",
      }}
    >
      {items.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              padding: "10px 0",
              marginBottom: -1,
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${on ? "var(--fg)" : "transparent"}`,
              fontFamily: on ? "inherit" : '"Fraunces", ui-serif, serif',
              fontStyle: on ? "normal" : "italic",
              fontSize: 17,
              fontWeight: on ? 600 : 400,
              color: on ? "var(--fg)" : "var(--muted-foreground)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              letterSpacing: on ? undefined : "-0.005em",
            }}
          >
            {t.label}
            {on && (
              <span
                aria-hidden
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  background: "var(--spark)",
                  display: "inline-block",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Primary `/me` ↔ `/team` view scope selector. Rendered as a left-aligned
 * top-row control (the first thing a manager sets on the page) — distinct
 * from secondary action pills. Hidden for employee personas, who only have
 * the self view.
 */
export function SkillsViewToggle({ active }: { active: "me" | "team" }) {
  const role = useEffectiveRole();
  const canSeeTeam = role === "manager" || role === "hr" || role === "admin";
  if (!canSeeTeam) return null;
  const items: { id: "me" | "team"; label: string; sub: string; to: "/skills/me" | "/skills/team" }[] = [
    { id: "me", label: "Mine", sub: "Personal matrix", to: "/skills/me" },
    { id: "team", label: "Team", sub: "Reports overview", to: "/skills/team" },
  ];
  return (
    <div className="flex items-center gap-3">
      <span
        className="t-mono"
        style={{ color: "var(--muted-foreground)", whiteSpace: "nowrap" }}
      >
        VIEW
      </span>
      <div
        role="tablist"
        aria-label="Skills view"
        style={{
          display: "inline-flex",
          padding: 4,
          gap: 2,
          borderRadius: 999,
          border: "1px solid var(--line-strong)",
          background: "var(--bg-2)",
        }}
      >
        {items.map((it) => {
          const on = it.id === active;
          return (
            <Link
              key={it.id}
              to={it.to}
              role="tab"
              aria-selected={on}
              title={it.sub}
              style={{
                padding: "7px 16px",
                borderRadius: 999,
                background: on ? "var(--fg)" : "transparent",
                color: on ? "var(--bg)" : "var(--fg)",
                fontWeight: on ? 600 : 500,
                fontSize: 13,
                textDecoration: "none",
                transition: "background 140ms ease-out, color 140ms ease-out",
                letterSpacing: "-0.005em",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {it.label}
              {on && (
                <span
                  aria-hidden
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: "var(--spark)",
                    display: "inline-block",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** Editorial hero used by both Self and Manager views. */
export function SkillsEditorialHero({
  eyebrow,
  title,
  actions,
  subtitle,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "end",
        gap: 24,
      }}
    >
      <div>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {eyebrow}
        </span>
        <h1
          style={{
            fontFamily: '"Fraunces", ui-serif, serif',
            fontWeight: 400,
            margin: "6px 0 0",
            fontSize: "clamp(36px, 9vw, 92px)",
            letterSpacing: "-0.045em",
            lineHeight: 0.86,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <span
            className="t-mono"
            style={{ color: "var(--muted-foreground)", marginTop: 6, display: "inline-block" }}
          >
            {subtitle}
          </span>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>
      )}
    </div>
  );
}
