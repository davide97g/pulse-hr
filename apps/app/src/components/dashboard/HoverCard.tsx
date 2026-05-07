import type { ConstellationPerson, LensConfig } from "./types";

interface HoverInfo extends ConstellationPerson {
  x: number;
  y: number;
}

export function HoverCard({
  hover,
  dark,
  lens,
}: {
  hover: HoverInfo;
  dark: boolean;
  lens: LensConfig;
}) {
  const primary = lens.tooltipPrimary(hover);
  const secondary = lens.tooltipSecondary(hover);
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        background: dark ? "rgba(12,10,8,0.92)" : "rgba(255,255,255,0.95)",
        border: "1px solid var(--line-strong)",
        borderRadius: 14,
        padding: "14px 18px",
        minWidth: 280,
        boxShadow: "0 24px 48px -16px rgba(0,0,0,0.4)",
        backdropFilter: "blur(18px)",
        zIndex: 6,
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <span className="ph-avatar ph-avatar-sm">{hover.initials}</span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontSize: 20,
              lineHeight: 1.05,
              color: "var(--fg)",
              letterSpacing: "-0.02em",
            }}
          >
            {hover.name}
          </span>
          <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
            {hover.role.toUpperCase()} · {hover.dept}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
            {primary.label}
          </span>
          <span
            className="t-num"
            style={{
              fontSize: 28,
              lineHeight: 1,
              color: primary.accent ? "var(--spark)" : "var(--fg)",
            }}
          >
            {primary.value}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
            {secondary.label}
          </span>
          <div
            style={{
              fontFamily: "JetBrains Mono, ui-monospace, monospace",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--fg)",
            }}
          >
            {secondary.value}
          </div>
        </div>
      </div>
    </div>
  );
}
