import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEmployees, employeesTable } from "@/lib/tables/employees";
import { type Employee } from "@/lib/mock-data";
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

function tenureYears(joinDate: string): number {
  const days = (Date.now() - new Date(joinDate).getTime()) / 86_400_000;
  return Math.max(0, days / 365.25);
}

function statusLabel(status: Employee["status"]): { label: string; color: string } {
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

function isProbation(e: Employee): boolean {
  // < 90 days from join AND active → probation/PROVA tint
  const days = (Date.now() - new Date(e.joinDate).getTime()) / 86_400_000;
  return days >= 0 && days < 90 && e.status === "active";
}

export function PeopleEditorialList() {
  const employees = useEmployees();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("TUTTE");
  const [q, setQ] = useUrlParam("q");
  const search = q ?? "";
  const [toDelete, setToDelete] = useState<Employee | null>(null);

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.department));
    return Array.from(set);
  }, [employees]);

  const filterChips = useMemo(
    () => ["TUTTE", ...departments.map((d) => d.toUpperCase())],
    [departments],
  );

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
          e.email.toLowerCase().includes(needle) ||
          e.location.toLowerCase().includes(needle),
      );
    }
    return list;
  }, [employees, filter, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Employee[]>();
    for (const e of filtered) {
      if (!map.has(e.department)) map.set(e.department, []);
      map.get(e.department)!.push(e);
    }
    for (const [, list] of map) {
      list.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filtered]);

  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.status === "active" || e.status === "remote").length;
  const onboardingCount = employees.filter(
    (e) => e.status === "active" && tenureYears(e.joinDate) < 0.25,
  ).length;
  const leaveCount = employees.filter((e) => e.status === "on_leave").length;
  const offboardCount = employees.filter((e) => e.status === "offboarding").length;
  const turnoverPct = totalCount === 0 ? 0 : (offboardCount / totalCount) * 100;

  const stats: Array<[string, string, "spark" | undefined]> = [
    ["TOTALI", String(totalCount), undefined],
    ["ATTIVE", String(activeCount), undefined],
    ["ONBOARD", String(onboardingCount), onboardingCount > 0 ? "spark" : undefined],
    ["LEAVE", String(leaveCount), undefined],
    ["TURNOVER", `${turnoverPct.toFixed(1)}%`, undefined],
  ];

  function confirmDelete() {
    if (!toDelete) return;
    const e = toDelete;
    employeesTable.remove(e.id);
    setToDelete(null);
    toast.success(`${e.name} rimosso`, {
      action: { label: "Annulla", onClick: () => employeesTable.add(e) },
    });
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 min-h-[calc(100vh-3.5rem)]">
      {/* HEADER */}
      <div className="grid items-end gap-4" style={{ gridTemplateColumns: "1fr auto" }}>
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
            <span style={{ fontStyle: "italic" }}>Employees</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {filtered.length} / {totalCount}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="pill pill-ghost pill-sm"
            onClick={() => {
              const blob = new Blob([JSON.stringify(filtered, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `pulsehr-employees-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success(`Esportate ${filtered.length} persone`);
            }}
          >
            Esporta
          </button>
          <button
            type="button"
            className="pill pill-dark pill-sm"
            onClick={() => navigate({ to: "/people/new" })}
          >
            + Nuovo
          </button>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex gap-3 items-center flex-wrap">
        <div
          className="flex items-center gap-2.5"
          style={{
            flex: 1,
            minWidth: 240,
            border: "1px solid var(--line-strong)",
            borderRadius: 999,
            padding: "8px 14px",
            background: "var(--bg)",
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ⌕
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setQ(e.target.value || null)}
            placeholder="Cerca per nome, ruolo, sede…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 17,
              color: "var(--fg)",
            }}
          />
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ⌘K
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filterChips.map((t) => {
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
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* STAT RIBBON */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          borderTop: "1px solid var(--line-strong)",
          borderBottom: "1px solid var(--line)",
          padding: "12px 0",
        }}
      >
        {stats.map(([l, v, k], i) => (
          <div
            key={i}
            style={{
              paddingLeft: i === 0 ? 0 : 14,
              borderLeft: i === 0 ? "none" : "1px solid var(--line)",
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {l}
            </span>
            <div
              className="t-num"
              style={{
                fontSize: 26,
                marginTop: 2,
                letterSpacing: "-0.02em",
                color: k === "spark" ? "var(--spark)" : "var(--fg)",
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* GROUPED LIST */}
      <div className="flex flex-col gap-5" style={{ flex: 1, minHeight: 0 }}>
        {grouped.map(([dept, list]) => (
          <section key={dept} className="flex flex-col">
            <div
              className="flex items-baseline gap-3"
              style={{
                padding: "0 4px 8px",
                borderBottom: "2px solid var(--line-strong)",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontStyle: "italic",
                  fontSize: 24,
                  letterSpacing: "-0.02em",
                }}
              >
                {dept}
              </span>
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {list.length} {list.length === 1 ? "PERSONA" : "PERSONE"}
              </span>
              <span style={{ flex: 1 }} />
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                —
              </span>
            </div>

            {list.map((e) => {
              const stat = statusLabel(e.status);
              const probation = isProbation(e);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() =>
                    navigate({ to: "/people/$employeeId", params: { employeeId: e.id } })
                  }
                  className="grid items-center text-left"
                  style={{
                    gridTemplateColumns:
                      "32px minmax(0, 1.2fr) minmax(0, 1.1fr) 110px 80px 100px 80px 32px",
                    gap: 14,
                    padding: "10px 4px",
                    borderBottom: "1px solid var(--line)",
                    background: probation
                      ? "color-mix(in oklch, var(--spark) 5%, transparent)"
                      : "transparent",
                    border: 0,
                    borderBottomWidth: 1,
                    borderBottomStyle: "solid",
                    borderBottomColor: "var(--line)",
                    cursor: "pointer",
                  }}
                >
                  <span className="ph-avatar ph-avatar-sm">{e.initials}</span>
                  <div className="flex flex-col" style={{ minWidth: 0 }}>
                    <span
                      className="t-body"
                      style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {e.name}
                    </span>
                    <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                      {e.manager ? `↳ ${e.manager}` : ""}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 16,
                      color: "var(--fg-2)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {e.role}
                  </span>
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    {e.location}
                  </span>
                  <span className="t-num" style={{ fontSize: 14 }}>
                    {tenureYears(e.joinDate).toFixed(1)} a
                  </span>
                  <span className="t-num" style={{ fontSize: 14, textAlign: "right" }}>
                    €{(e.salary / 1000).toFixed(0)}k
                  </span>
                  <span
                    className="t-mono"
                    style={{
                      textAlign: "right",
                      color: probation ? "var(--spark)" : stat.color,
                    }}
                  >
                    {probation ? "PROVA" : stat.label}
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setToDelete(e);
                    }}
                    onKeyDown={(ev) => {
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.stopPropagation();
                        setToDelete(e);
                      }
                    }}
                    className="opacity-40 hover:opacity-100"
                    style={{ cursor: "pointer", padding: 4, color: "var(--muted-foreground)" }}
                    aria-label={`Rimuovi ${e.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </span>
                </button>
              );
            })}
          </section>
        ))}

        {grouped.length === 0 && (
          <div
            className="p-12 text-center"
            style={{
              border: "1px dashed var(--line)",
              borderRadius: 14,
              color: "var(--muted-foreground)",
            }}
          >
            <span className="t-mono">NESSUN RISULTATO</span>
          </div>
        )}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rimuovi {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              La persona viene rimossa dalla directory. Puoi annullare dal toast.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Rimuovi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
