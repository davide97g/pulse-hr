import { useNavigate } from "@tanstack/react-router";

export type GrowthTab = "overview" | "achievements" | "challenges" | "kudos" | "paths";

const TABS: Array<[GrowthTab, string]> = [
  ["overview", "Overview"],
  ["achievements", "Achievements"],
  ["challenges", "Challenges"],
  ["kudos", "Kudos"],
  ["paths", "Skill paths"],
];

export function GrowthTabs({ active }: { active: GrowthTab }) {
  const nav = useNavigate({ from: "/growth" });
  const setTab = (t: GrowthTab) =>
    nav({
      search: (prev) => ({ ...prev, tab: t === "overview" ? undefined : t, employee: undefined }),
    });
  return (
    <div
      className="flex gap-6 overflow-x-auto scrollbar-thin"
      style={{
        borderBottom: "1px solid var(--line-strong)",
        margin: "0 -16px",
        padding: "0 16px",
      }}
    >
      {TABS.map(([id, label]) => {
        const on = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              padding: "10px 0",
              marginBottom: -1,
              borderBottom: `2px solid ${on ? "var(--fg)" : "transparent"}`,
              fontFamily: on
                ? '"Geist", ui-sans-serif, system-ui, sans-serif'
                : '"Fraunces", ui-serif, serif',
              fontStyle: on ? "normal" : "italic",
              fontSize: 17,
              fontWeight: on ? 600 : 400,
              color: on ? "var(--fg)" : "var(--muted-foreground)",
              cursor: "pointer",
              background: "transparent",
              border: "none",
              borderBottomWidth: 2,
              borderBottomStyle: "solid",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {label}
            {on && (
              <span
                style={{
                  width: 6,
                  height: 6,
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
