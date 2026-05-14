import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AvatarDisplay } from "@pulse-hr/ui/atoms/AvatarDisplay";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { LevelSegments } from "@pulse-hr/ui/atoms/LevelSegments";
import { LV_LABEL, pendingRows, type PendingRow } from "@/lib/skills-data";

const WAIT_LABELS = [
  "2 days ago",
  "4 days ago",
  "6 days ago",
  "1 wk ago",
  "1 wk ago",
  "10 days ago",
  "2 wks ago",
];

export function ManagerPending({ onAdjust }: { onAdjust?: (row: PendingRow) => void }) {
  const initial = useMemo(pendingRows, []);
  const [rows, setRows] = useState<PendingRow[]>(initial);

  const approve = (row: PendingRow) => {
    const prev = rows;
    setRows((cur) => cur.filter((r) => r.key !== row.key));
    toast.success(`${row.s.name} approved for ${row.e.name}`, {
      action: { label: "Undo", onClick: () => setRows(prev) },
    });
  };

  const approveAll = () => {
    if (rows.length === 0) return;
    const prev = rows;
    setRows([]);
    toast.success(`Approved ${prev.length} pending`, {
      action: { label: "Undo", onClick: () => setRows(prev) },
    });
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            QUEUE · {rows.length} PROPOSED · AVG 4 DAYS WAITING
          </span>
          <div
            style={{
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 30,
              letterSpacing: "-0.03em",
              marginTop: 4,
            }}
          >
            Quello che la squadra ti chiede di confermare.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <EditorialPill kind="ghost" size="sm" onClick={approveAll}>
            Approve all visible
          </EditorialPill>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "4px 6px",
        }}
        className="scrollbar-thin"
      >
        {rows.length === 0 && (
          <div
            style={{
              border: "1px dashed var(--line-strong)",
              borderRadius: 14,
              padding: "32px 20px",
              textAlign: "center",
              color: "var(--muted-foreground)",
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 20,
            }}
          >
            Tutto in pari. Niente in coda.
          </div>
        )}
        {rows.map((r, i) => (
          <div
            key={r.key}
            className="sk-pending-halo"
            style={{
              borderRadius: 14,
              padding: "16px 20px",
              background: "var(--bg)",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto auto",
              gap: 18,
              alignItems: "center",
            }}
          >
            <AvatarDisplay size="md" initials={r.e.initials} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{r.e.name}</span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {r.e.role} · {r.e.dept}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontFamily: '"Fraunces", ui-serif, serif',
                    fontStyle: "italic",
                    fontSize: 24,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {r.s.name}
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {r.s.bucket.toUpperCase()}
                </span>
                <span className="t-mono" style={{ color: "var(--spark)" }}>
                  SELF-ASSESSED →
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <LevelSegments level={r.lvl} size="md" />
                  <span
                    style={{
                      fontFamily: '"Fraunces", ui-serif, serif',
                      fontStyle: "italic",
                      fontSize: 17,
                      color: r.lvl === "master" ? "var(--spark)" : "var(--fg)",
                    }}
                  >
                    {LV_LABEL[r.lvl]}
                  </span>
                </span>
              </div>
            </div>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {WAIT_LABELS[i] ?? "—"}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <EditorialPill kind="ghost" size="sm" onClick={() => onAdjust?.(r)}>
                Adjust
              </EditorialPill>
              <EditorialPill kind="spark" size="sm" onClick={() => approve(r)}>
                Approve
              </EditorialPill>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
