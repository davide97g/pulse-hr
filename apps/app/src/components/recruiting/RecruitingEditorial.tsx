import { useMemo } from "react";
import { toast } from "sonner";
import { useI18n } from "@pulse-hr/shared/i18n";
import { useCandidates, candidatesTable } from "@/lib/tables/candidates";
import { useJobPostings } from "@/lib/tables/jobPostings";
import type { Candidate } from "@/lib/mock-data";

const STAGE_ORDER: Array<Candidate["stage"]> = [
  "Applied",
  "Screen",
  "Interview",
  "Offer",
  "Hired",
];

function nextStage(s: Candidate["stage"]): Candidate["stage"] | null {
  const i = STAGE_ORDER.indexOf(s);
  return i >= 0 && i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1] : null;
}

const STAGES: Array<{
  id: Candidate["stage"];
  label: string;
  color: "muted" | "fg" | "spark";
}> = [
  { id: "Applied", label: "APPLIED", color: "muted" },
  { id: "Screen", label: "SCREEN", color: "fg" },
  { id: "Interview", label: "INTERVIEW", color: "fg" },
  { id: "Offer", label: "OFFER", color: "spark" },
  { id: "Hired", label: "HIRED", color: "muted" },
];

function colorVar(c: "muted" | "fg" | "spark"): string {
  if (c === "spark") return "var(--spark)";
  if (c === "fg") return "var(--fg)";
  return "var(--muted-foreground)";
}

function relativeFromIso(iso: string, locale: "en" | "it"): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (locale === "it") {
    if (days <= 0) return "oggi";
    if (days === 1) return "1 g fa";
    if (days < 7) return `${days} gg fa`;
    if (days < 30) return `${Math.round(days / 7)} sett fa`;
    return `${Math.round(days / 30)} mesi fa`;
  }
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;
  return `${Math.round(days / 30)}mo ago`;
}

export function RecruitingEditorial() {
  const { t, locale } = useI18n();
  const candidates = useCandidates();
  const jobs = useJobPostings();
  const openJobs = jobs.filter((j) => j.status === "open").length;

  const grouped = useMemo(() => {
    const map = new Map<Candidate["stage"], Candidate[]>();
    for (const s of STAGES) map.set(s.id, []);
    for (const c of candidates) {
      const list = map.get(c.stage);
      if (list) list.push(c);
    }
    return map;
  }, [candidates]);

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-6 min-h-full">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {t("recruiting.eyebrow", { open: openJobs, candidates: candidates.length })}
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
            {t("recruiting.title")}<span style={{ fontStyle: "italic" }}>{t("recruiting.title.italic")}</span>
            <span style={{ color: "var(--spark)" }}>?</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button type="button" className="pill pill-ghost pill-sm">
            {t("recruiting.filter.all")}
          </button>
          <button type="button" className="pill pill-dark pill-sm">
            + {t("recruiting.new")}
          </button>
        </div>
      </div>

      <div
        className="grid gap-3.5 flex-1 min-h-[480px] overflow-x-auto"
        style={{ gridTemplateColumns: "repeat(5, minmax(220px, 1fr))" }}
      >
        {STAGES.map((s) => {
          const list = grouped.get(s.id) ?? [];
          const c = colorVar(s.color);
          return (
            <section key={s.id} className="flex flex-col gap-2.5 min-h-0 overflow-hidden">
              <div style={{ borderTop: `2px solid ${c}`, paddingTop: 12, paddingBottom: 4 }}>
                <div className="flex justify-between">
                  <span className="t-mono" style={{ color: c }}>
                    {s.label}
                  </span>
                  <span className="t-num" style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
                    {list.length}
                  </span>
                </div>
                <div
                  className="t-num mt-1.5"
                  style={{
                    fontSize: 36,
                    letterSpacing: "-0.03em",
                    color: s.color === "spark" ? "var(--spark)" : "var(--fg)",
                  }}
                >
                  {String(list.length).padStart(2, "0")}
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-2 pr-1 pb-1">
                {list.slice(0, 6).map((cand) => {
                  const next = nextStage(cand.stage);
                  return (
                    <article
                      key={cand.id}
                      style={{
                        border: `1px solid ${s.color === "spark" ? "var(--spark)" : "var(--line)"}`,
                        borderRadius: 12,
                        padding: "12px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        background:
                          s.color === "spark"
                            ? "color-mix(in oklch, var(--spark) 5%, transparent)"
                            : "var(--bg)",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="ph-avatar ph-avatar-sm">{cand.initials}</span>
                        <div className="min-w-0">
                          <div
                            style={{
                              fontFamily: "Fraunces, ui-serif, serif",
                              fontStyle: "italic",
                              fontSize: 17,
                              letterSpacing: "-0.01em",
                              lineHeight: 1.05,
                            }}
                          >
                            {cand.name}
                          </div>
                          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                            {cand.role.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="t-mono"
                          style={{
                            color:
                              s.color === "spark" ? "var(--spark)" : "var(--muted-foreground)",
                          }}
                        >
                          {relativeFromIso(cand.appliedDate, locale)}
                        </span>
                        <span style={{ flex: 1 }} />
                        {next && (
                          <button
                            type="button"
                            className="t-mono"
                            onClick={() => {
                              const prev = cand.stage;
                              candidatesTable.update(cand.id, { stage: next });
                              toast(`${cand.name} → ${next}`, {
                                action: {
                                  label: t("common.undo"),
                                  onClick: () =>
                                    candidatesTable.update(cand.id, { stage: prev }),
                                },
                              });
                            }}
                            style={{
                              color: "var(--spark)",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            → {next}
                          </button>
                        )}
                        <button
                          type="button"
                          className="t-mono"
                          onClick={() => {
                            candidatesTable.remove(cand.id);
                            toast(locale === "it" ? "Candidato rimosso" : "Candidate removed", {
                              action: {
                                label: t("common.undo"),
                                onClick: () => candidatesTable.add(cand),
                              },
                            });
                          }}
                          style={{
                            color: "var(--muted-foreground)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                          aria-label="Rimuovi"
                        >
                          ×
                        </button>
                      </div>
                    </article>
                  );
                })}
                {list.length > 6 && (
                  <div
                    className="t-mono text-center py-2"
                    style={{
                      color: "var(--muted-foreground)",
                      border: "1px dashed var(--line-strong)",
                      borderRadius: 12,
                    }}
                  >
                    + {list.length - 6} altri
                  </div>
                )}
                {list.length === 0 && (
                  <div
                    className="t-mono text-center py-3"
                    style={{
                      color: "var(--muted-foreground)",
                      border: "1px dashed var(--line)",
                      borderRadius: 12,
                    }}
                  >
                    VUOTO
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
