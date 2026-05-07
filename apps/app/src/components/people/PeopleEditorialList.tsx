import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEmployees, employeesTable } from "@/lib/tables/employees";
import { type Employee } from "@/lib/mock-data";
import { commesse } from "@/lib/mock-data";
import { useQuickAction } from "@/components/app/QuickActions";
import { useUrlParam } from "@/lib/useUrlParam";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@pulse-hr/ui/primitives/alert-dialog";
import { Trash2 } from "lucide-react";

const DEPT_FILTERS = ["TUTTE", "ENGINEERING", "DESIGN", "PRODUCT", "PEOPLE OPS", "FINANCE", "SALES", "MARKETING"];

function seniority(joinDate: string): string {
  const join = new Date(joinDate);
  const now = new Date();
  const months = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
  if (months < 12) return `${Math.max(months, 0)}m`;
  const y = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0 ? `${y}a` : `${y}a ${rem}m`;
}

function statusMono(status: Employee["status"]): { label: string; color: string } {
  switch (status) {
    case "active":
      return { label: "ATTIVA", color: "var(--fg-2)" };
    case "remote":
      return { label: "REMOTE", color: "var(--fg-2)" };
    case "on_leave":
      return { label: "LEAVE", color: "var(--muted-foreground)" };
    case "offboarding":
      return { label: "OFFBRDG", color: "var(--muted-foreground)" };
  }
}

function projectFor(empId: string): string {
  const owned = commesse.find((c) => c.ownerId === empId);
  return owned?.code ?? "—";
}

export function PeopleEditorialList() {
  const employees = useEmployees();
  const navigate = useNavigate();
  const { open: openAction } = useQuickAction();
  const [filter, setFilter] = useState<string>("TUTTE");
  const [q, setQ] = useUrlParam("q");
  const search = q ?? "";
  const [toDelete, setToDelete] = useState<Employee | null>(null);

  const filtered = useMemo(() => {
    let list = employees;
    if (filter !== "TUTTE") {
      list = list.filter((e) => e.department.toUpperCase() === filter);
    }
    if (search) {
      const needle = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(needle) ||
          e.role.toLowerCase().includes(needle) ||
          e.email.toLowerCase().includes(needle),
      );
    }
    return [...list].sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
  }, [employees, filter, search]);

  const onboardingCount = employees.filter((e) => e.status === "active" && new Date(e.joinDate) > new Date(Date.now() - 90 * 86_400_000)).length;
  const leaveCount = employees.filter((e) => e.status === "on_leave").length;

  function confirmDelete() {
    if (!toDelete) return;
    const e = toDelete;
    employeesTable.remove(e.id);
    setToDelete(null);
    toast.success(`${e.name} removed`, {
      action: { label: "Undo", onClick: () => employeesTable.add(e) },
    });
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-4 flex-wrap">
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: 0,
              fontSize: "clamp(40px, 5vw, 56px)",
              letterSpacing: "-0.035em",
              lineHeight: 0.95,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Persone</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {employees.length} ATTIVE
          </span>
          {onboardingCount > 0 && (
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              · {onboardingCount} ONBOARDING
            </span>
          )}
          {leaveCount > 0 && (
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              · {leaveCount} LEAVE
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Cerca…"
            value={search}
            onChange={(e) => setQ(e.target.value || null)}
            className="t-mono"
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              border: "1px solid var(--line-strong)",
              background: "transparent",
              color: "var(--fg)",
              outline: "none",
              minWidth: 160,
            }}
          />
          <button type="button" className="pill pill-ghost pill-sm">
            Esporta
          </button>
          <button type="button" className="pill pill-dark pill-sm" onClick={() => openAction("add-employee")}>
            + Persona
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 items-center flex-wrap">
        {DEPT_FILTERS.map((t) => {
          const active = filter === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className="t-mono"
              style={{
                padding: "5px 10px",
                borderRadius: 999,
                border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
                background: active ? "var(--ink)" : "transparent",
                color: active ? "var(--paper)" : "var(--fg-2)",
                cursor: "pointer",
                fontSize: 10,
                letterSpacing: "0.06em",
                fontWeight: 600,
              }}
            >
              {t}
            </button>
          );
        })}
        <span className="flex-1" />
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          ORDINA: ANZIANITÀ ↑
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 14,
          background: "var(--bg)",
          overflow: "hidden",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="tab-row head"
          style={
            {
              "--cols": "44px 1.4fr 1fr 1fr 110px 80px 90px 32px",
              background: "var(--bg-2)",
              borderBottom: "1px solid var(--line-strong)",
            } as React.CSSProperties
          }
        >
          <span></span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>NOME</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>RUOLO</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>DIPARTIMENTO</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>COMMESSA</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>
            ANZIANITÀ
          </span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>
            STATO
          </span>
          <span></span>
        </div>
        <div style={{ overflow: "auto", flex: 1 }}>
          {filtered.map((p, i) => {
            const stat = statusMono(p.status);
            return (
              <div
                key={p.id}
                className="tab-row"
                onClick={() => navigate({ to: "/people/$employeeId", params: { employeeId: p.id } })}
                style={
                  {
                    "--cols": "44px 1.4fr 1fr 1fr 110px 80px 90px 32px",
                    "--row-pad": "11px",
                    alignItems: "center",
                    cursor: "pointer",
                    background:
                      i === 0
                        ? "color-mix(in oklch, var(--spark) 10%, transparent)"
                        : "transparent",
                  } as React.CSSProperties
                }
              >
                <span className="ph-avatar ph-avatar-sm">{p.initials}</span>
                <span className="t-body" style={{ fontWeight: 500 }}>
                  {p.name}
                </span>
                <span
                  className="t-body"
                  style={{
                    color: "var(--fg-2)",
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 16,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {p.role}
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {p.department.toUpperCase()}
                </span>
                <span className="t-mono" style={{ color: "var(--fg)" }}>
                  {projectFor(p.id)}
                </span>
                <span className="t-num" style={{ fontSize: 14, textAlign: "right" }}>
                  {seniority(p.joinDate)}
                </span>
                <span
                  className="t-mono"
                  style={{
                    textAlign: "right",
                    color: stat.color,
                  }}
                >
                  {stat.label}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setToDelete(p);
                  }}
                  className="opacity-40 hover:opacity-100"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    color: "var(--muted-foreground)",
                  }}
                  aria-label={`Remove ${p.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-12 text-center" style={{ color: "var(--muted-foreground)" }}>
              <span className="t-mono">NESSUN RISULTATO</span>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This soft-deletes the employee. You can undo from the toast.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
