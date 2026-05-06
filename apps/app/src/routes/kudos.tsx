import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { Avatar } from "@/components/app/AppShell";
import { NewBadge } from "@pulse-hr/ui/atoms/NewBadge";
import { employeeById, type Kudo } from "@/lib/mock-data";
import { kudosTable, useKudos } from "@/lib/tables/kudos";
import { useEmployees } from "@/lib/tables/employees";
import { useFirstName } from "@/lib/current-user";

export const Route = createFileRoute("/kudos")({
  head: () => ({ meta: [{ title: "Kudos — Pulse HR" }] }),
  component: KudosPage,
});

const TAGS: Kudo["tag"][] = ["teamwork", "craft", "impact", "courage", "kindness"];
const TAG_LABEL: Record<Kudo["tag"], string> = {
  teamwork: "TEAMWORK",
  craft: "CRAFT",
  impact: "IMPACT",
  courage: "COURAGE",
  kindness: "KINDNESS",
};

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} · ${hh}:${mm}`;
}

function KudosPage() {
  const employees = useEmployees();
  const feed = useKudos();
  const firstName = useFirstName();

  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState(5);
  const [tag, setTag] = useState<Kudo["tag"]>("craft");
  const [message, setMessage] = useState("");

  // Leaderboard — top 4 receivers
  const leaderboard = useMemo(() => {
    const counts = new Map<string, number>();
    for (const k of feed) counts.set(k.toId, (counts.get(k.toId) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([id, n]) => ({ employee: employeeById(id), count: n }))
      .filter((x) => !!x.employee)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [feed]);

  const sortedFeed = useMemo(
    () => [...feed].sort((a, b) => (a.date > b.date ? -1 : 1)),
    [feed],
  );

  const send = () => {
    const m = message.trim();
    if (!m) {
      toast.error("Scrivi un messaggio");
      return;
    }
    if (!recipient) {
      toast.error("Scegli a chi mandare il kudos");
      return;
    }
    const me = employees[0]?.id ?? "e1";
    const id = `k-${Date.now()}`;
    const newKudo: Kudo = {
      id,
      fromId: me,
      toId: recipient,
      amount,
      tag,
      date: new Date().toISOString().slice(0, 10),
      message: m,
    };
    kudosTable.add(newKudo);
    setMessage("");
    setRecipient("");
    toast.success("Kudos inviato", { description: `+${amount} coin` });
  };

  return (
    <div
      className="ph room-light fade-in"
      style={{ padding: "32px 48px", display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* HERO ROW: title left + composer right */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)",
          gap: 32,
          alignItems: "end",
        }}
      >
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            PEER RECOGNITION ·{" "}
            {new Date()
              .toLocaleDateString("it-IT", { month: "long", year: "numeric" })
              .toUpperCase()}{" "}
            <NewBadge />
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(72px, 9vw, 132px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Grazie</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 18,
              maxWidth: 480,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.35,
            }}
          >
            Quando qualcuno ti rende il lavoro più leggero, vale la pena dirlo. Anche per scritto,
            {firstName ? ` ${firstName}` : ""}.
          </p>
        </div>

        {/* Composer card */}
        <div
          style={{
            border: "1px solid var(--line-strong)",
            borderRadius: 16,
            padding: "18px 22px",
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            NUOVO KUDOS
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="A chi vuoi dire grazie oggi?"
            rows={2}
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 20,
              lineHeight: 1.4,
              color: "var(--fg)",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              padding: 0,
            }}
          />
          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="pill pill-ghost pill-sm"
              style={{ paddingRight: 28, maxWidth: 180 }}
            >
              <option value="">@persona</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value as Kudo["tag"])}
              className="pill pill-ghost pill-sm"
              style={{ paddingRight: 28 }}
            >
              {TAGS.map((t) => (
                <option key={t} value={t}>
                  #{TAG_LABEL[t].toLowerCase()}
                </option>
              ))}
            </select>
            <select
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="pill pill-ghost pill-sm"
              style={{ paddingRight: 28 }}
            >
              {[3, 5, 10, 25].map((n) => (
                <option key={n} value={n}>
                  +{n} coin
                </option>
              ))}
            </select>
            <span style={{ flex: 1 }} />
            <EditorialPill kind="spark" size="sm" arrow onClick={send}>
              Pubblica
            </EditorialPill>
          </div>
        </div>
      </div>

      {/* Leaderboard strip — 4-up */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {leaderboard.map((row, i) => {
          const isLeader = i === 0;
          return (
            <div
              key={row.employee!.id}
              className="flex items-center gap-3.5"
              style={{
                padding: "16px 20px",
                borderRight: i < leaderboard.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <Avatar size={26} initials={row.employee!.initials} color={row.employee!.avatarColor} />
              <div className="min-w-0">
                <div
                  className="truncate"
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: isLeader ? "italic" : "normal",
                    fontSize: 22,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {row.employee!.name}
                </div>
                <span
                  className="t-mono"
                  style={{ color: isLeader ? "var(--spark)" : "var(--muted-foreground)" }}
                >
                  {row.count} ricevuti
                </span>
              </div>
            </div>
          );
        })}
        {leaderboard.length === 0 && (
          <div
            className="t-mono"
            style={{ padding: "24px", color: "var(--muted-foreground)", gridColumn: "span 4" }}
          >
            Nessun kudos ancora — sii il primo a dire grazie.
          </div>
        )}
      </div>

      {/* Kudos cards — 2-col citations */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
          gap: 16,
        }}
      >
        {sortedFeed.slice(0, 12).map((k) => {
          const from = employeeById(k.fromId);
          const to = employeeById(k.toId);
          if (!from || !to) return null;
          return (
            <article
              key={k.id}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 18,
                padding: "22px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                background: "var(--bg)",
              }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <Avatar size={26} initials={from.initials} color={from.avatarColor} />
                <span style={{ fontWeight: 600 }}>{from.name.split(" ")[0]}</span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  →
                </span>
                <Avatar size={26} initials={to.initials} color={to.avatarColor} />
                <span style={{ fontWeight: 600 }}>{to.name.split(" ")[0]}</span>
                <span style={{ flex: 1 }} />
                <span className="t-mono" style={{ color: "var(--spark)" }}>
                  +{k.amount}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontStyle: "italic",
                  fontSize: 22,
                  lineHeight: 1.4,
                  color: "var(--fg)",
                  letterSpacing: "-0.005em",
                }}
              >
                «{k.message}»
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  #{TAG_LABEL[k.tag]}
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {shortDate(k.date)}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
