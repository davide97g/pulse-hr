import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useI18n } from "@pulse-hr/shared/i18n";
import { GrowthTabs, type GrowthTab } from "./GrowthTabs";
import { GrowthOverview } from "./GrowthOverview";
import { GrowthAchievements } from "./GrowthAchievements";
import { GrowthChallenges } from "./GrowthChallenges";
import { GrowthKudos } from "./GrowthKudos";
import { GrowthSkillPath } from "./GrowthSkillPath";
import { NewKudosSheet } from "./NewKudosSheet";
import { NewChallengeSheet } from "./NewChallengeSheet";
import { useEmployees } from "@/lib/tables/employees";

const MONTH_NAMES_EN = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

const MONTH_NAMES_IT = [
  "GENNAIO",
  "FEBBRAIO",
  "MARZO",
  "APRILE",
  "MAGGIO",
  "GIUGNO",
  "LUGLIO",
  "AGOSTO",
  "SETTEMBRE",
  "OTTOBRE",
  "NOVEMBRE",
  "DICEMBRE",
];

const TAB_TITLES_BY_LOCALE: Record<"en" | "it", Record<GrowthTab, { eyebrow: string; title: string; italic: string }>> = {
  en: {
    overview: { eyebrow: "GROWTH", title: "", italic: "Growth" },
    achievements: { eyebrow: "ACHIEVEMENTS", title: "", italic: "Achievements" },
    challenges: { eyebrow: "CHALLENGES", title: "", italic: "Challenges" },
    kudos: { eyebrow: "PEER RECOGNITION", title: "", italic: "Kudos" },
    paths: { eyebrow: "PATHS", title: "Skill", italic: "paths" },
  },
  it: {
    overview: { eyebrow: "CRESCITA", title: "", italic: "Growth" },
    achievements: { eyebrow: "RICONOSCIMENTI", title: "", italic: "Achievements" },
    challenges: { eyebrow: "SFIDE", title: "", italic: "Challenges" },
    kudos: { eyebrow: "PEER RECOGNITION", title: "", italic: "Kudos" },
    paths: { eyebrow: "PERCORSI", title: "Skill", italic: "paths" },
  },
};

export function GrowthEditorial({
  tab,
  employee,
}: {
  tab: GrowthTab;
  employee?: string;
}) {
  const { t, locale } = useI18n();
  const employees = useEmployees();
  const nav = useNavigate({ from: "/growth" });
  const [kudosOpen, setKudosOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const TAB_TITLES = TAB_TITLES_BY_LOCALE[locale];
  const MONTH_NAMES = locale === "it" ? MONTH_NAMES_IT : MONTH_NAMES_EN;

  const focusEmployee = useMemo(
    () => employees.find((e) => e.id === employee) ?? employees[0],
    [employees, employee],
  );

  // Keyboard shortcuts ⌘K (kudos) / ⌘L (challenge)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === "k") {
        e.preventDefault();
        setKudosOpen(true);
      } else if (k === "l") {
        e.preventDefault();
        setChallengeOpen(true);
      } else if (k === "a") {
        e.preventDefault();
        nav({ search: (prev) => ({ ...prev, tab: "achievements", employee: undefined }) });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav]);

  const now = new Date();
  const peopleLabel = locale === "it" ? "PERSONE" : "PEOPLE";
  const eyebrow = `${TAB_TITLES[tab].eyebrow} · ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()} · ${employees.length} ${peopleLabel}`;

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-5 min-h-full">
      <div className="grid items-end gap-4 md:gap-6 grid-cols-1 md:grid-cols-[1fr_auto]">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {eyebrow}
          </span>
          <h1
            style={{
              fontFamily: '"Fraunces", ui-serif, serif',
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(40px, 9vw, 92px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            {TAB_TITLES[tab].title && (
              <>
                {TAB_TITLES[tab].title}{" "}
              </>
            )}
            <span style={{ fontStyle: "italic" }}>{TAB_TITLES[tab].italic}</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap items-end">
          <button
            type="button"
            onClick={() => setKudosOpen(true)}
            className="t-mono"
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid var(--line-strong)",
              background: "transparent",
              color: "var(--fg)",
              cursor: "pointer",
            }}
          >
            + {t("growth.kudo.new").toUpperCase()}
          </button>
          <button
            type="button"
            onClick={() => setChallengeOpen(true)}
            className="t-mono"
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "none",
              background: "var(--ink)",
              color: "var(--paper)",
              cursor: "pointer",
            }}
          >
            + {t("growth.challenge.new").toUpperCase()}
          </button>
        </div>
      </div>

      <GrowthTabs active={tab} />

      <div className="flex-1 min-h-0">
        {tab === "overview" && (
          <GrowthOverview
            onOpenNewKudos={() => setKudosOpen(true)}
            onOpenNewChallenge={() => setChallengeOpen(true)}
          />
        )}
        {tab === "achievements" && <GrowthAchievements />}
        {tab === "challenges" && (
          <GrowthChallenges onOpenNewChallenge={() => setChallengeOpen(true)} />
        )}
        {tab === "kudos" && <GrowthKudos onOpenNewKudos={() => setKudosOpen(true)} />}
        {tab === "paths" && focusEmployee && (
          <GrowthSkillPath employeeId={focusEmployee.id} />
        )}
      </div>

      <NewKudosSheet open={kudosOpen} onClose={() => setKudosOpen(false)} />
      <NewChallengeSheet open={challengeOpen} onClose={() => setChallengeOpen(false)} />
    </div>
  );
}
