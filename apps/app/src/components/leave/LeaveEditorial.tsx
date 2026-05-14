import { useMemo } from "react";
import { toast } from "sonner";
import { useI18n } from "@pulse-hr/shared/i18n";
import { useLeaveRequests, leaveTable } from "@/lib/tables/leave";
import { type LeaveRequest } from "@/lib/mock-data";
import { useDraft } from "@/lib/use-draft";

const ME = "e1";
const VACATION_ALLOWANCE = 24;
const PERMIT_ALLOWANCE = 32;

const TYPES: Array<LeaveRequest["type"]> = ["Vacation", "Sick", "Personal", "Parental"];

const MONTHS_SHORT: Record<"en" | "it", string[]> = {
  en: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
  it: ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"],
};

function fmtRange(months: string[], from: string, to: string): string {
  const f = new Date(from);
  const t = new Date(to);
  if (f.getMonth() === t.getMonth())
    return `${String(f.getDate()).padStart(2, "0")}–${String(t.getDate()).padStart(2, "0")} ${months[f.getMonth()]}`;
  return `${String(f.getDate()).padStart(2, "0")} ${months[f.getMonth()]} – ${String(t.getDate()).padStart(2, "0")} ${months[t.getMonth()]}`;
}

export function LeaveEditorial() {
  const { t, locale } = useI18n();
  const all = useLeaveRequests();
  const mine = useMemo(() => all.filter((l) => l.employeeId === ME), [all]);
  const months = MONTHS_SHORT[locale];

  const localizeType = (kind: LeaveRequest["type"]) =>
    t(`leave.type.${kind.toLowerCase()}`);

  const usedVacation = mine
    .filter((l) => l.type === "Vacation" && l.status === "approved")
    .reduce((s, l) => s + l.days, 0);
  const remaining = Math.max(0, VACATION_ALLOWANCE - usedVacation);
  const sickDays = mine.filter((l) => l.type === "Sick" && l.status === "approved").reduce((s, l) => s + l.days, 0);
  const permitHours = mine.filter((l) => l.type === "Personal" && l.status === "approved").reduce((s, l) => s + l.days * 8, 0);

  const today = new Date().toISOString().slice(0, 10);
  const { draft, setDraft, clearDraft } = useDraft<{
    type: LeaveRequest["type"];
    from: string;
    to: string;
    reason: string;
  }>("pulsehr.draft.leave-new", {
    type: "Vacation",
    from: today,
    to: today,
    reason: "",
  });

  function submit() {
    const f = new Date(draft.from);
    const toDt = new Date(draft.to);
    const days = Math.max(1, Math.round((toDt.getTime() - f.getTime()) / 86_400_000) + 1);
    const unit = locale === "it" ? "gg" : "d";
    const r: LeaveRequest = {
      id: `l-${Date.now()}`,
      employeeId: ME,
      type: draft.type,
      from: draft.from,
      to: draft.to,
      days,
      // People-first refocus: no approval flow. Every entry is the user's own
      // journal record of time they took off.
      status: "approved",
      reason: draft.reason || `${localizeType(draft.type)} · ${days}${unit}`,
      submittedAt: new Date().toISOString(),
    };
    leaveTable.add(r);
    toast.success(t("leave.toast.sent"), { description: t("leave.toast.sent_desc") });
    clearDraft();
  }

  const history = useMemo(
    () =>
      [...mine]
        .sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime())
        .slice(0, 8),
    [mine],
  );

  return (
    <div className="ph p-4 md:p-6 grid gap-6 md:gap-10 min-h-full grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      <section className="flex flex-col gap-8">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {t("leave.eyebrow", { year: new Date().getFullYear() })}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(56px, 14vw, 144px)",
              letterSpacing: "-0.05em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>{t("leave.title")}</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              maxWidth: 470,
              marginTop: 22,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.35,
            }}
          >
            {t("leave.summary.left", { days: remaining })}{" "}
            {remaining > 0 ? t("leave.summary.plan") : t("leave.summary.spent")}
          </p>
        </div>
        <div
          className="grid gap-0 pt-6"
          style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--line-strong)" }}
        >
          <BalanceCell
            label={t("leave.balance.vacation")}
            value={String(remaining)}
            sub={t("leave.balance.vacation.unit", { n: VACATION_ALLOWANCE })}
            accent
            first
          />
          <BalanceCell
            label={t("leave.balance.permits")}
            value={String(Math.max(0, PERMIT_ALLOWANCE - permitHours))}
            sub={t("leave.balance.permits.unit", { n: PERMIT_ALLOWANCE })}
          />
          <BalanceCell
            label={t("leave.balance.sick")}
            value={String(sickDays)}
            sub={t("leave.balance.sick.unit")}
          />
        </div>
      </section>

      <section className="flex flex-col gap-5 min-h-0">
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <span className="t-h3-sans">{t("leave.form.title")}</span>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <FormField label={t("leave.form.type")}>
              <select
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as LeaveRequest["type"] })}
                style={inputStyle}
              >
                {TYPES.map((kind) => (
                  <option key={kind} value={kind}>
                    {localizeType(kind)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t("leave.form.from")}>
              <input
                type="date"
                value={draft.from}
                onChange={(e) => setDraft({ ...draft, from: e.target.value })}
                style={inputStyle}
              />
            </FormField>
            <FormField label={t("leave.form.to")}>
              <input
                type="date"
                value={draft.to}
                onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                style={inputStyle}
              />
            </FormField>
            <FormField label={t("leave.form.reason")}>
              <input
                type="text"
                placeholder={t("leave.form.reason.placeholder")}
                value={draft.reason}
                onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
                style={inputStyle}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="pill pill-ghost pill-sm">
              {t("leave.form.save_draft")}
            </button>
            <button type="button" className="pill pill-spark pill-sm" onClick={submit}>
              {t("leave.form.submit")} <span className="arr">→</span>
            </button>
          </div>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {t("leave.history")}
          </span>
          <div className="overflow-auto pr-1">
            {history.map((r, i) => (
              <div
                key={r.id}
                className="grid items-center grid-cols-[88px_1fr_auto] sm:grid-cols-[120px_1fr_60px]"
                style={{
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < history.length - 1 ? "1px solid var(--line)" : "none",
                }}
              >
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {fmtRange(months, r.from, r.to)}
                </span>
                <span
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 17,
                  }}
                >
                  {localizeType(r.type)}
                </span>
                <span className="t-num" style={{ textAlign: "right", fontSize: 16 }}>
                  {r.days < 1 ? `${r.days * 8}h` : `${r.days}${locale === "it" ? "gg" : "d"}`}
                </span>
              </div>
            ))}
            {history.length === 0 && (
              <div className="p-6 text-center" style={{ color: "var(--muted-foreground)" }}>
                <span className="t-mono">{t("leave.history.empty")}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "10px 12px",
  background: "transparent",
  color: "var(--fg)",
  outline: "none",
  width: "100%",
};

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function BalanceCell({
  label,
  value,
  sub,
  accent,
  first,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  first?: boolean;
}) {
  return (
    <div
      style={{
        paddingLeft: first ? 0 : 14,
        borderLeft: first ? "none" : "1px solid var(--line)",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span
          className="t-num"
          style={{
            fontSize: 44,
            letterSpacing: "-0.03em",
            color: accent ? "var(--spark)" : "var(--fg)",
          }}
        >
          {value}
        </span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {sub}
        </span>
      </div>
    </div>
  );
}
