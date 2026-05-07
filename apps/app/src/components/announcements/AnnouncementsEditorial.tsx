import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { useAnnouncements, announcementsTable } from "@/lib/tables/announcements";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import type { Announcement } from "@/lib/mock-data";

const ME = "e1";

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

type FilterMode = "all" | "mine";

export function AnnouncementsEditorial() {
  const announcements = useAnnouncements();
  const employees = useEmployees();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const me = employeeById(ME);

  const sorted = useMemo(() => {
    const base = filter === "mine" && me ? announcements.filter((a) => a.author === me.name) : announcements;
    return [...base].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return 0;
    });
  }, [announcements, filter, me]);

  const featured = sorted[0];
  const rest = sorted.slice(1);

  function toggleReact(a: Announcement) {
    const next = !a.youReacted;
    const delta = next ? 1 : -1;
    announcementsTable.update(a.id, {
      youReacted: next,
      reactions: Math.max(0, (a.reactions ?? 0) + delta),
    });
  }

  function togglePin(a: Announcement) {
    announcementsTable.update(a.id, { pinned: !a.pinned });
    toast(a.pinned ? "Annuncio sbloccato" : "Annuncio in evidenza");
  }

  function deleteAnn(a: Announcement) {
    announcementsTable.remove(a.id);
    toast("Annuncio rimosso", {
      action: { label: "Annulla", onClick: () => announcementsTable.add(a) },
    });
  }

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
          <button
            type="button"
            className={filter === "all" ? "pill pill-dark pill-sm" : "pill pill-ghost pill-sm"}
            onClick={() => setFilter("all")}
          >
            Tutti
          </button>
          <button
            type="button"
            className={filter === "mine" ? "pill pill-dark pill-sm" : "pill pill-ghost pill-sm"}
            onClick={() => setFilter("mine")}
          >
            Da te
          </button>
          <button
            type="button"
            className="pill pill-spark pill-sm"
            onClick={() => setComposerOpen(true)}
          >
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
              <button
                type="button"
                onClick={() => toggleReact(featured)}
                className="t-mono"
                style={{
                  color: featured.youReacted ? "var(--spark)" : "var(--muted-foreground)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ↑ {featured.reactions ?? 0}
              </button>
              <button
                type="button"
                onClick={() => togglePin(featured)}
                className="t-mono"
                style={{
                  color: featured.pinned ? "var(--spark)" : "var(--muted-foreground)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {featured.pinned ? "● PIN" : "○ PIN"}
              </button>
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

      <AnnouncementComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        author={me?.name ?? "Tu"}
      />

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
                  <button
                    type="button"
                    onClick={() => toggleReact(it)}
                    className="t-mono"
                    style={{
                      color: it.youReacted ? "var(--spark)" : "var(--muted-foreground)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    ↑ {it.reactions ?? 0}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAnn(it)}
                    className="t-mono"
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
                {void author}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AnnouncementComposer({
  open,
  onClose,
  author,
}: {
  open: boolean;
  onClose: () => void;
  author: string;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);

  function publish() {
    if (!title.trim() || !body.trim()) {
      toast.error("Titolo e corpo sono obbligatori");
      return;
    }
    const a: Announcement = {
      id: `an-${Date.now()}`,
      author,
      title: title.trim(),
      body: body.trim(),
      time: new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "short" }),
      pinned,
      reactions: 0,
      youReacted: false,
    };
    announcementsTable.add(a);
    toast.success("Annuncio pubblicato", {
      action: { label: "Annulla", onClick: () => announcementsTable.remove(a.id) },
    });
    setTitle("");
    setBody("");
    setPinned(false);
    onClose();
  }

  return (
    <SidePanel open={open} onClose={onClose} title="Nuovo annuncio" width={560}>
      <div className="p-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            TITOLO
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Cosa vuoi annunciare?"
            style={{
              padding: "10px 0",
              border: "none",
              borderBottom: "1px solid var(--line-strong)",
              background: "transparent",
              color: "var(--fg)",
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 26,
              letterSpacing: "-0.02em",
              outline: "none",
            }}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            CORPO
          </span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Tre frasi al massimo. Concrete."
            style={{
              padding: "12px 14px",
              border: "1px solid var(--line-strong)",
              borderRadius: 12,
              background: "transparent",
              color: "var(--fg)",
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 16,
              lineHeight: 1.4,
              resize: "vertical",
            }}
          />
        </label>
        <label className="flex items-center gap-2 t-mono" style={{ color: "var(--muted-foreground)" }}>
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
          />
          METTI IN EVIDENZA
        </label>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="pill pill-ghost pill-sm"
          >
            Annulla
          </button>
          <span className="flex-1" />
          <button type="button" onClick={publish} className="pill pill-spark pill-sm">
            Pubblica →
          </button>
        </div>
      </div>
    </SidePanel>
  );
}
