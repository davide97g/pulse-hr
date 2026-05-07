import type { CSSProperties } from "react";

export function DeptLabel({
  pos,
  title,
  count,
}: {
  pos: CSSProperties;
  title: string;
  count: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        ...pos,
        zIndex: 3,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <span
        style={{
          fontFamily: "Fraunces, ui-serif, serif",
          fontStyle: "italic",
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "var(--fg-2)",
          opacity: 0.75,
        }}
      >
        {title.toLowerCase()}
      </span>
      <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
        {count} PERSONE
      </span>
    </div>
  );
}
