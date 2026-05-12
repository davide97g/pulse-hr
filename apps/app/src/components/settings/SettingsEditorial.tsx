import { useState } from "react";
import { toast } from "sonner";
import { useI18n, LOCALE_LABELS } from "@pulse-hr/shared/i18n";
import { setWorkspaceName, useWorkspaceStatus } from "@/lib/workspace";

interface Item {
  label: string;
  value: string;
  control: "edit" | "select" | "toggle" | "upload" | "color" | "spark";
  nameKey?: string;
}
interface Section {
  label: string;
  items: Item[];
}

export function SettingsEditorial() {
  const { t, locale, setLocale } = useI18n();
  const ws = useWorkspaceStatus();
  const [draftName, setDraftName] = useState(ws.name);

  const CONTROL_LABEL: Record<Item["control"], string> = {
    edit: t("settings.modify").toUpperCase(),
    select: "▼",
    toggle: "ON / OFF",
    upload: (locale === "it" ? "CARICA" : "UPLOAD"),
    color: "● ● ●",
    spark: (locale === "it" ? "ATTIVO" : "ACTIVE"),
  };

  function save() {
    if (!draftName.trim()) {
      toast.error(locale === "it" ? "Il nome del workspace non può essere vuoto" : "Workspace name cannot be empty");
      return;
    }
    setWorkspaceName(draftName.trim());
    toast.success(locale === "it" ? "Impostazioni salvate" : "Settings saved");
  }

  function reset() {
    setDraftName(ws.name);
    toast(locale === "it" ? "Modifiche scartate" : "Changes discarded");
  }

  function toggleLocale() {
    setLocale(locale === "it" ? "en" : "it");
  }

  const sections: Section[] = [
    {
      label: t("settings.workspace"),
      items: [
        { label: t("settings.workspace.name"), value: draftName, control: "edit", nameKey: "name" },
        { label: t("settings.workspace.locale"), value: LOCALE_LABELS[locale], control: "select", nameKey: "locale" },
        { label: t("settings.workspace.timezone"), value: "Europe/Rome (UTC+1)", control: "select" },
        { label: t("settings.workspace.week_start"), value: t("settings.week.monday"), control: "toggle" },
      ],
    },
    {
      label: t("settings.policy"),
      items: [
        {
          label: locale === "it" ? "Approvazione ferie" : "Leave approval",
          value: locale === "it" ? "Manager diretto" : "Direct manager",
          control: "select",
        },
        {
          label: locale === "it" ? "Cut-off timesheet" : "Timesheet cut-off",
          value: locale === "it" ? "Venerdì 18:00" : "Friday 6:00 PM",
          control: "edit",
        },
      ],
    },
    {
      label: "BRAND",
      items: [
        { label: "Logo", value: "pulse-mark.svg · 240×240", control: "upload" },
        {
          label: locale === "it" ? "Colore brand" : "Brand color",
          value: "Spark · #B4FF39",
          control: "color",
        },
        {
          label: locale === "it" ? "Email mittente" : "Sender email",
          value: "noreply@pulsehr.it",
          control: "edit",
        },
      ],
    },
    {
      label: locale === "it" ? "SICUREZZA" : "SECURITY",
      items: [
        {
          label: "SSO Google",
          value: (locale === "it" ? `Attivo · 142 utenti` : `Active · 142 users`),
          control: "spark",
        },
        {
          label: locale === "it" ? "2FA obbligatoria" : "2FA required",
          value: locale === "it" ? "Solo per admin" : "Admins only",
          control: "toggle",
        },
        {
          label: "Audit log",
          value: locale === "it" ? "Conservato 12 mesi" : "Retained 12 months",
          control: "select",
        },
      ],
    },
  ];

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-7 min-h-full">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {t("settings.eyebrow", { workspace: ws.name.toUpperCase() })}
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
            <span style={{ fontStyle: "italic" }}>{t("settings.title")}</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button type="button" className="pill pill-ghost pill-sm" onClick={reset}>
            {t("settings.reset")}
          </button>
          <button type="button" className="pill pill-dark pill-sm" onClick={save}>
            {t("settings.save")}
          </button>
        </div>
      </div>

      <div
        className="grid gap-4.5 flex-1 min-h-0 overflow-auto pr-1 pb-1"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" }}
      >
        {sections.map((s) => (
          <section
            key={s.label}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 18,
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              className="t-mono mb-3"
              style={{ color: "var(--muted-foreground)" }}
            >
              {s.label}
            </span>
            {s.items.map((it, j) => (
              <div
                key={it.label}
                className="grid items-baseline"
                style={{
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  padding: "14px 0",
                  borderBottom: j < s.items.length - 1 ? "1px solid var(--line)" : "none",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 19,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.1,
                    }}
                  >
                    {it.label}
                  </div>
                  {it.nameKey === "name" ? (
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="t-body-sm mt-1 block"
                      style={{
                        color: "var(--fg)",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid var(--line)",
                        padding: "4px 0",
                        outline: "none",
                        width: "100%",
                      }}
                    />
                  ) : (
                    <span
                      className="t-body-sm mt-1 block"
                      style={{
                        color:
                          it.control === "spark" ? "var(--spark)" : "var(--fg-2)",
                      }}
                    >
                      {it.value}
                    </span>
                  )}
                </div>
                <span
                  className="t-mono"
                  style={{ color: "var(--muted-foreground)", cursor: "pointer" }}
                  onClick={it.nameKey === "locale" ? toggleLocale : undefined}
                >
                  {CONTROL_LABEL[it.control]}
                </span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
