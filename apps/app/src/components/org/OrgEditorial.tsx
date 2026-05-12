import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useEmployees } from "@/lib/tables/employees";
import type { Employee } from "@/lib/mock-data";

type OrgView = "tree" | "list";

interface Node {
  id: string;
  initials: string;
  name: string;
  role: string;
}

export function OrgEditorial() {
  const employees = useEmployees();
  const [view, setView] = useState<OrgView>("tree");

  function exportOrg() {
    const blob = new Blob([JSON.stringify(employees, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulsehr-org-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Esportate ${employees.length} persone`);
  }

  const tree = useMemo(() => {
    const ceo = employees.find((e) => /ceo|founder|chief/i.test(e.role)) ?? employees[0];
    const vps = employees.filter((e) => /vp|head|director/i.test(e.role)).slice(0, 4);
    const used = new Set([ceo?.id, ...vps.map((v) => v.id)]);
    const leadsByVp: Record<string, Node[]> = {};
    for (const vp of vps) {
      leadsByVp[vp.id] = employees
        .filter(
          (e) =>
            !used.has(e.id) &&
            (e.department === vp.department ||
              new RegExp(vp.department.split(" ")[0], "i").test(e.role)),
        )
        .slice(0, 3)
        .map(toNode);
      for (const l of leadsByVp[vp.id]) used.add(l.id);
    }
    return {
      ceo: ceo ? toNode(ceo) : null,
      vps: vps.map(toNode),
      leadsByVp,
    };
  }, [employees]);

  const deptCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of employees) m.set(e.department, (m.get(e.department) ?? 0) + 1);
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [employees]);

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-7 min-h-[calc(100vh-3.5rem)]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ORGANIGRAMMA · {employees.length} PERSONE
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(40px, 11vw, 116px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Organico</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={view === "tree" ? "pill pill-dark pill-sm" : "pill pill-ghost pill-sm"}
            onClick={() => setView("tree")}
          >
            Albero
          </button>
          <button
            type="button"
            className={view === "list" ? "pill pill-dark pill-sm" : "pill pill-ghost pill-sm"}
            onClick={() => setView("list")}
          >
            Lista
          </button>
          <button type="button" className="pill pill-dark pill-sm" onClick={exportOrg}>
            Esporta
          </button>
        </div>
      </div>

      {view === "list" && (
        <div
          className="flex flex-col flex-1 min-h-0 overflow-auto"
          style={{ border: "1px solid var(--line)", borderRadius: 14 }}
        >
          {employees.map((e, i) => (
            <div
              key={e.id}
              className="grid items-center"
              style={{
                gridTemplateColumns: "32px 1fr 1fr 1fr 110px",
                gap: 12,
                padding: "10px 16px",
                borderBottom: i < employees.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <span className="ph-avatar ph-avatar-sm">{e.initials}</span>
              <span style={{ fontWeight: 500 }}>{e.name}</span>
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {e.role}
              </span>
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {e.department}
              </span>
              <span
                className="t-mono"
                style={{ color: "var(--muted-foreground)", textAlign: "right" }}
              >
                {e.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {view === "tree" && (
      <>
      {/* Tree */}
      <div className="flex flex-col gap-8 flex-1 min-h-0 overflow-auto pb-2">
        {/* CEO */}
        {tree.ceo && (
          <div className="flex justify-center">
            <OrgNode node={tree.ceo} accent wide />
          </div>
        )}

        {/* L2 directors */}
        {tree.vps.length > 0 && (
          <div className="relative">
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: -22,
                width: 1,
                height: 22,
                background: "var(--line-strong)",
              }}
            />
            <div
              className="grid gap-4.5 pt-7 relative"
              style={{
                gridTemplateColumns: `repeat(${tree.vps.length}, 1fr)`,
                borderTop: "1px solid var(--line-strong)",
              }}
            >
              {tree.vps.map((vp) => (
                <div key={vp.id} className="flex justify-center relative">
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: -28,
                      width: 1,
                      height: 28,
                      background: "var(--line-strong)",
                    }}
                  />
                  <OrgNode node={vp} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* L3 leads per VP */}
        {tree.vps.length > 0 && (
          <div
            className="grid gap-4.5"
            style={{ gridTemplateColumns: `repeat(${tree.vps.length}, 1fr)` }}
          >
            {tree.vps.map((vp) => (
              <div key={vp.id} className="flex flex-col gap-2.5 relative">
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -32,
                    width: 1,
                    height: 32,
                    background: "var(--line)",
                  }}
                />
                {tree.leadsByVp[vp.id]?.map((lead) => (
                  <OrgNode key={lead.id} node={lead} small />
                ))}
                {tree.leadsByVp[vp.id]?.length === 0 && (
                  <div
                    className="t-mono text-center py-3"
                    style={{
                      color: "var(--muted-foreground)",
                      border: "1px dashed var(--line)",
                      borderRadius: 10,
                    }}
                  >
                    —
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer dept counts */}
        <div
          className="grid pt-5 mt-3"
          style={{
            gridTemplateColumns: `repeat(${deptCounts.length || 1}, 1fr)`,
            borderTop: "1px solid var(--line-strong)",
          }}
        >
          {deptCounts.map(([dept, count], i) => (
            <div
              key={dept}
              style={{
                paddingLeft: i === 0 ? 0 : 14,
                borderLeft: i === 0 ? "none" : "1px solid var(--line)",
              }}
            >
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {dept.toUpperCase()}
              </span>
              <div
                className="t-num mt-1"
                style={{ fontSize: 36, letterSpacing: "-0.03em" }}
              >
                {count}
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
}

function toNode(emp: Employee): Node {
  return { id: emp.id, initials: emp.initials, name: emp.name, role: emp.role };
}

function OrgNode({
  node,
  accent,
  wide,
  small,
}: {
  node: Node;
  accent?: boolean;
  wide?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3"
      style={{
        border: `1px solid ${accent ? "var(--spark)" : "var(--line-strong)"}`,
        borderRadius: 14,
        padding: small ? "10px 12px" : "14px 18px",
        width: wide ? 360 : "100%",
        maxWidth: wide ? 360 : 280,
        background: accent
          ? "color-mix(in oklch, var(--spark) 8%, transparent)"
          : "var(--bg)",
      }}
    >
      <span className={small ? "ph-avatar ph-avatar-sm" : "ph-avatar"}>{node.initials}</span>
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: small ? 17 : 20,
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {node.name}
        </div>
        <span
          className="t-mono mt-1 block"
          style={{ color: accent ? "var(--spark)" : "var(--muted-foreground)" }}
        >
          {node.role}
        </span>
      </div>
    </div>
  );
}
