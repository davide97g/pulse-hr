import { useUrlParam } from "@/lib/useUrlParam";
import { EmployeesDashboard } from "@/components/people/EmployeesDashboard";
import { PeopleEditorialList } from "@/components/people/PeopleEditorialList";

type View = "dashboard" | "list";

export function EmployeesView() {
  const [raw, setView] = useUrlParam("view");
  const view: View = raw === "list" ? "list" : "dashboard";

  return (
    <div className="flex flex-col">
      <div
        className="flex gap-1 items-center px-4 md:px-6 pt-4"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        {(["dashboard", "list"] as const).map((v) => {
          const active = view === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => setView(v === "dashboard" ? null : v)}
              className="t-mono"
              style={{
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? "var(--ink)" : "transparent"}`,
                color: active ? "var(--fg)" : "var(--muted-foreground)",
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {v === "dashboard" ? "DASHBOARD" : "LISTA"}
            </button>
          );
        })}
      </div>
      {view === "dashboard" ? <EmployeesDashboard /> : <PeopleEditorialList />}
    </div>
  );
}
