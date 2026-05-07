import { useWorkspaceStatus } from "@/lib/workspace";

interface Item {
  label: string;
  value: string;
  control: "edit" | "select" | "toggle" | "upload" | "color" | "spark";
}
interface Section {
  label: string;
  items: Item[];
}

const CONTROL_LABEL: Record<Item["control"], string> = {
  edit: "MODIFICA",
  select: "▼",
  toggle: "ON / OFF",
  upload: "CARICA",
  color: "● ● ●",
  spark: "ATTIVO",
};

export function SettingsEditorial() {
  const ws = useWorkspaceStatus();

  const sections: Section[] = [
    {
      label: "WORKSPACE",
      items: [
        { label: "Nome workspace", value: ws.name, control: "edit" },
        { label: "Lingua di default", value: "Italiano", control: "select" },
        { label: "Fuso orario", value: "Europe/Rome (UTC+1)", control: "select" },
        { label: "Settimana inizia", value: "Lunedì", control: "toggle" },
      ],
    },
    {
      label: "POLICY",
      items: [
        { label: "Approvazione ferie", value: "Manager diretto", control: "select" },
        { label: "Cut-off timesheet", value: "Venerdì 18:00", control: "edit" },
      ],
    },
    {
      label: "BRAND",
      items: [
        { label: "Logo", value: "pulse-mark.svg · 240×240", control: "upload" },
        { label: "Colore brand", value: "Spark · #B4FF39", control: "color" },
        { label: "Email mittente", value: "noreply@pulsehr.it", control: "edit" },
      ],
    },
    {
      label: "SICUREZZA",
      items: [
        { label: "SSO Google", value: "Attivo · 142 utenti", control: "spark" },
        { label: "2FA obbligatoria", value: "Solo per admin", control: "toggle" },
        { label: "Audit log", value: "Conservato 12 mesi", control: "select" },
      ],
    },
  ];

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-7 min-h-[calc(100vh-3.5rem)]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            SETTINGS · WORKSPACE {ws.name.toUpperCase()}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(64px, 8vw, 116px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Impostazioni</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button type="button" className="pill pill-ghost pill-sm">
            Reset
          </button>
          <button type="button" className="pill pill-dark pill-sm">
            Salva
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
                  <span
                    className="t-body-sm mt-1 block"
                    style={{
                      color:
                        it.control === "spark" ? "var(--spark)" : "var(--fg-2)",
                    }}
                  >
                    {it.value}
                  </span>
                </div>
                <span
                  className="t-mono"
                  style={{ color: "var(--muted-foreground)", cursor: "pointer" }}
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
