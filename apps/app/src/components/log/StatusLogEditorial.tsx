import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLogSessions } from "@/lib/tables/logSessions";
import { useLogMessages } from "@/lib/tables/logMessages";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { projects } from "@/lib/mock-data";

const ME = "e1";

const MONTHS_IT_SHORT = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
const WEEKDAYS_IT = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];

function timeOnly(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function StatusLogEditorial() {
  const sessions = useLogSessions();
  const messages = useLogMessages();
  const employees = useEmployees();
  const [draft, setDraft] = useState("");

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const todaysPosts = useMemo(() => {
    return sessions
      .filter((s) => {
        const t = new Date(s.startedAt).getTime();
        return t >= todayStart && (s.summary || s.managerSummary);
      })
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 8);
  }, [sessions, todayStart]);

  const fallbackPosts = useMemo(() => {
    if (todaysPosts.length > 0) return [];
    // Build from logMessages if no sessions today
    const recent = [...messages]
      .filter((m) => m.role === "employee")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    return recent;
  }, [messages, todaysPosts]);

  const dateMono = `${WEEKDAYS_IT[today.getDay()]} ${String(today.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[today.getMonth()]}`;

  function publish() {
    if (!draft.trim()) {
      toast.error("Scrivi qualcosa prima di pubblicare");
      return;
    }
    toast.success("Status pubblicato");
    setDraft("");
  }

  return (
    <div
      className="ph p-4 md:p-6 grid gap-11 min-h-[calc(100vh-3.5rem)]"
      style={{ gridTemplateColumns: "1fr 1.2fr" }}
    >
      <section className="flex flex-col">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {dateMono} · STANDUP ASINCRONO
        </span>
        <h1
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontWeight: 400,
            margin: "10px 0 0",
            fontSize: "clamp(80px, 10vw, 124px)",
            letterSpacing: "-0.045em",
            lineHeight: 0.86,
          }}
        >
          Cosa <span style={{ fontStyle: "italic" }}>oggi</span>
          <span style={{ color: "var(--spark)" }}>?</span>
        </h1>
        <p
          style={{
            marginTop: 22,
            maxWidth: 460,
            color: "var(--fg-2)",
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 22,
            lineHeight: 1.35,
          }}
        >
          Tre righe a testa. Niente call. Read-only fino alle 10.
        </p>

        <div
          style={{
            marginTop: 32,
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "18px 20px",
            background: "var(--bg)",
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            IL TUO POST · {(employees.find((e) => e.id === ME)?.name ?? "Davide").toUpperCase()}
          </span>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Cosa hai fatto ieri, cosa farai oggi, cosa ti blocca?"
            rows={3}
            style={{
              marginTop: 14,
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 20,
              lineHeight: 1.4,
              color: "var(--fg)",
              width: "100%",
              minHeight: 80,
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "vertical",
            }}
          />
          <div className="flex gap-2 items-center mt-3">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ⌘⏎ PUBBLICA
            </span>
            <span className="flex-1" />
            <button type="button" className="pill pill-ghost pill-sm">
              Allega
            </button>
            <button type="button" className="pill pill-spark pill-sm" onClick={publish}>
              Pubblica
            </button>
          </div>
        </div>
      </section>

      <section className="min-h-0 overflow-hidden flex flex-col">
        <div className="flex justify-between items-baseline mb-3.5">
          <span className="t-h3-sans">
            Oggi · {todaysPosts.length || fallbackPosts.length} post
          </span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ULTIMI · {dateMono}
          </span>
        </div>
        <div className="overflow-auto flex-1 flex flex-col gap-4 pr-1">
          {todaysPosts.map((s, i) => {
            const emp = employeeById(s.employeeId) ?? employees.find((e) => e.id === s.employeeId);
            if (!emp) return null;
            const summary = s.summary ?? s.managerSummary ?? "";
            const project =
              s.topics
                .map((t) => projects.find((c) => c.name.toLowerCase().includes(t.toLowerCase()))?.code)
                .find((x) => x) ?? s.topics[0]?.toUpperCase() ?? "—";
            const isHero = i === 0;
            return (
              <PostRow
                key={s.id}
                initials={emp.initials}
                name={emp.name}
                time={timeOnly(s.startedAt)}
                project={project}
                summary={summary}
                hero={isHero}
                last={i === todaysPosts.length - 1}
              />
            );
          })}
          {fallbackPosts.map((m, i) => {
            const emp = employeeById(m.employeeId) ?? employees.find((e) => e.id === m.employeeId);
            if (!emp) return null;
            return (
              <PostRow
                key={m.id}
                initials={emp.initials}
                name={emp.name}
                time={timeOnly(m.createdAt)}
                project={(m.topic ?? "LOG").toUpperCase()}
                summary={m.text}
                hero={i === 0}
                last={i === fallbackPosts.length - 1}
              />
            );
          })}
          {todaysPosts.length === 0 && fallbackPosts.length === 0 && (
            <div className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
              <span className="t-mono">NESSUN POST OGGI</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function PostRow({
  initials,
  name,
  time,
  project,
  summary,
  hero,
  last,
}: {
  initials: string;
  name: string;
  time: string;
  project: string;
  summary: string;
  hero: boolean;
  last: boolean;
}) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "44px 1fr",
        gap: 16,
        paddingBottom: 16,
        borderBottom: last ? "none" : "1px solid var(--line)",
      }}
    >
      <span className="ph-avatar ph-avatar-sm">{initials}</span>
      <div>
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className="t-body" style={{ fontWeight: 600 }}>
            {name}
          </span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {time}
          </span>
          <span
            className="t-mono"
            style={{ color: hero ? "var(--spark)" : "var(--muted-foreground)" }}
          >
            · {project}
          </span>
        </div>
        <p
          style={{
            margin: "8px 0 0",
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 20,
            lineHeight: 1.4,
            color: "var(--fg)",
            letterSpacing: "-0.005em",
            textWrap: "pretty",
          }}
        >
          {summary}
        </p>
      </div>
    </div>
  );
}
