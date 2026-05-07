import { Link } from "@tanstack/react-router";
import type { MicroCardConfig } from "./types";

export function MicroCard({ eyebrow, title, big, caption, accent, spark, status, link }: MicroCardConfig) {
  return (
    <Link
      to={link}
      style={{
        flex: 1,
        background: "var(--bg-2)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: "14px 16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        overflow: "hidden",
        boxShadow: accent ? "inset 0 2px 0 0 var(--spark)" : "none",
        cursor: "pointer",
        minHeight: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="t-mono" style={{ color: "var(--muted-foreground)", fontSize: 9 }}>
          {eyebrow}
        </span>
        <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
          ↗
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
        <span
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--fg-2)",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </span>
      </div>
      <div
        className="t-num"
        style={{
          fontSize: 38,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: spark ? "var(--spark)" : "var(--fg)",
          marginTop: 2,
        }}
      >
        {big}
      </div>
      <div
        className="t-mono-sm"
        style={{ color: "var(--muted-foreground)", marginTop: 4, lineHeight: 1.4 }}
      >
        {caption}
      </div>
      {status && (
        <span
          className="t-mono-sm"
          style={{
            marginTop: 6,
            color: "var(--spark-ink)",
            background: "var(--spark)",
            padding: "3px 8px",
            borderRadius: 999,
            alignSelf: "flex-start",
            fontWeight: 700,
          }}
        >
          {status}
        </span>
      )}
    </Link>
  );
}
