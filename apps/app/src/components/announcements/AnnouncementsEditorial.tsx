import { useMemo } from "react";
import { useAnnouncements } from "@/lib/tables/announcements";
import { useEmployees } from "@/lib/tables/employees";
import type { Announcement } from "@/lib/mock-data";

function authorInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function tagFor(a: Announcement): string {
  // Derive a category-ish tag from title keywords.
  const t = a.title.toLowerCase();
  if (/policy|policies|polic/.test(t)) return "POLICY";
  if (/release|launch|v\d|prodott|ship|version/.test(t)) return "PRODOTTO";
  if (/welcome|hire|joining|new|nuovo|onbo/.test(t)) return "PERSONE";
  if (/all-?hands|event|meet|all-hand/.test(t)) return "EVENTO";
  if (/finance|budget/.test(t)) return "FINANCE";
  return "WORKSPACE";
}

export function AnnouncementsEditorial() {
  const announcements = useAnnouncements();
  const employees = useEmployees();

  const sorted = useMemo(() => {
    return [...announcements].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return 0;
    });
  }, [announcements]);

  const featured = sorted[0];
  const rest = sorted.slice(1);

  function findAuthor(name: string) {
    return employees.find(
      (e) => e.name === name || authorInitials(e.name) === authorInitials(name),
    );
  }

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-6 min-h-[calc(100vh-3.5rem)]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            COMUNICAZIONI · {sorted.length} TOTALI · {sorted.filter((a) => a.pinned).length} IN EVIDENZA
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
            <span style={{ fontStyle: "italic" }}>Annunci</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button type="button" className="pill pill-ghost pill-sm">
            Tutti
          </button>
          <button type="button" className="pill pill-ghost pill-sm">
            Da te
          </button>
          <button type="button" className="pill pill-dark pill-sm">
            + Annuncio
          </button>
        </div>
      </div>

      {featured && (
        <article
          className="grid"
          style={{
            border: "1px solid var(--spark)",
            borderRadius: 18,
            padding: "28px 32px",
            background: "color-mix(in oklch, var(--spark) 5%, transparent)",
            gridTemplateColumns: "1fr 280px",
            gap: 32,
          }}
        >
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="t-mono" style={{ color: "var(--spark)" }}>
                {tagFor(featured)}
              </span>
              <span className="dot" />
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {featured.time.toUpperCase()}
              </span>
              {featured.pinned && (
                <span className="t-mono" style={{ color: "var(--spark)" }}>
                  ● PINNED
                </span>
              )}
            </div>
            <h2
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontWeight: 400,
                margin: "12px 0 0",
                fontSize: "clamp(40px, 4vw, 56px)",
                letterSpacing: "-0.035em",
                lineHeight: 0.96,
              }}
            >
              {featured.title}
              <span style={{ color: "var(--spark)" }}>.</span>
            </h2>
            <p
              style={{
                marginTop: 18,
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 21,
                lineHeight: 1.4,
                color: "var(--fg-2)",
                maxWidth: 620,
              }}
            >
              {featured.body}
            </p>
            <div className="flex items-center gap-4 mt-5 flex-wrap">
              <span className="ph-avatar ph-avatar-sm">{authorInitials(featured.author)}</span>
              <span className="t-body" style={{ fontWeight: 500 }}>
                {featured.author}
              </span>
              <span className="flex-1" />
              {featured.reactions != null && (
                <span className="t-mono" style={{ color: "var(--spark)" }}>
                  ↑ {featured.reactions}
                </span>
              )}
              {featured.comments && (
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  · {featured.comments.length} risposte
                </span>
              )}
            </div>
          </div>
          <div
            className="placeholder-img"
            style={{ width: "100%", borderRadius: 14, minHeight: 200 }}
          >
            <span className="cap t-mono-sm">POSTER · {tagFor(featured)}</span>
          </div>
        </article>
      )}

      {rest.length > 0 && (
        <div
          className="grid gap-3.5 flex-1 min-h-0 overflow-auto pr-1 pb-1"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
        >
          {rest.map((it) => {
            const author = findAuthor(it.author);
            return (
              <article
                key={it.id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  background: "var(--bg)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    {tagFor(it)}
                  </span>
                  <span className="flex-1" />
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    {it.time}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontWeight: 400,
                    margin: 0,
                    fontSize: 24,
                    letterSpacing: "-0.025em",
                    lineHeight: 1.05,
                  }}
                >
                  <span style={{ fontStyle: "italic" }}>
                    {it.title.split(" ").slice(0, 1).join(" ")}
                  </span>{" "}
                  {it.title.split(" ").slice(1).join(" ")}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "var(--fg-2)",
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    flex: 1,
                  }}
                >
                  {it.body}
                </p>
                <div
                  className="flex items-center gap-2.5 pt-2"
                  style={{ borderTop: "1px solid var(--line)" }}
                >
                  <span className="ph-avatar ph-avatar-sm">
                    {authorInitials(it.author)}
                  </span>
                  <span className="t-body-sm" style={{ fontWeight: 500 }}>
                    {it.author}
                  </span>
                  <span className="flex-1" />
                  {it.reactions != null && (
                    <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                      ↑ {it.reactions}
                    </span>
                  )}
                </div>
                {void author}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
