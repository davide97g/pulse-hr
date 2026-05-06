import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { commesse, commessaById, type FocusSession } from "@/lib/mock-data";
import { focusSessionsTable, useFocusSessions } from "@/lib/tables/focusSessions";

export const Route = createFileRoute("/focus")({
  head: () => ({ meta: [{ title: "Focus mode — Pulse HR" }] }),
  component: FocusPage,
});

const PRESETS: { label: string; minutes: number; sub: string }[] = [
  { label: "Pomodoro", minutes: 25, sub: "25 min · 5 min pausa" },
  { label: "Deep work", minutes: 50, sub: "50 min · 10 min pausa" },
  { label: "Flow", minutes: 90, sub: "90 min · long stretch" },
  { label: "Monk", minutes: 120, sub: "120 min · zero distrazioni" },
];

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function FocusPage() {
  const sessions = useFocusSessions();
  const [duration, setDuration] = useState(50);
  const [task, setTask] = useState("Rivedere il flow di onboarding");
  const [commessaId, setCommessaId] = useState<string>(commesse[0]?.id ?? "");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(duration * 60);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeCommessa = commessaById(commessaId);

  useEffect(() => {
    if (!running) {
      setRemaining(duration * 60);
      return;
    }
    tickRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          stop("complete");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, duration]);

  const start = () => {
    if (!task.trim()) {
      toast.error("Cosa vuoi mettere a fuoco?");
      return;
    }
    setRemaining(duration * 60);
    setRunning(true);
  };

  const stop = (reason: "complete" | "abort") => {
    setRunning(false);
    if (tickRef.current) clearInterval(tickRef.current);
    if (reason === "complete") {
      const now = new Date();
      const session: FocusSession = {
        id: `fs-${Date.now()}`,
        employeeId: "e1",
        date: now.toISOString().slice(0, 10),
        startedAt: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        durationMin: duration,
        commessaId: commessaId || (commesse[0]?.id ?? ""),
        note: task.trim(),
        meetingsDeclined: 0,
      };
      focusSessionsTable.add(session);
      toast.success("Sessione completata", { description: `+${duration} min · ${task}` });
    }
  };

  const elapsed = duration * 60 - remaining;
  const progressPct = duration > 0 ? Math.min(100, Math.round((elapsed / (duration * 60)) * 100)) : 0;

  // 7 progress dots, lit proportional to elapsed
  const litDots = Math.round((progressPct / 100) * 7);

  // Header time strings
  const startedAt = new Date(Date.now() - elapsed * 1000);
  const eta = new Date(Date.now() + remaining * 1000);
  const fmtTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  // Pull a "next task" hint from the most recent session
  const nextTask = sessions[sessions.length - 2]?.note ?? "Microcopy degli error states";

  return (
    <div
      className="ph room-light"
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100dvh - var(--topbar-height, 3.5rem))",
        background: "var(--bg)",
      }}
    >
      {/* Slim top bar */}
      <div
        className="flex items-center gap-3.5"
        style={{
          padding: "16px 32px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <span
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 18,
            fontWeight: 500,
          }}
        >
          pulse·hr
        </span>
        <span className="dot" aria-hidden />
        <span
          className="t-mono"
          style={{ color: running ? "var(--spark)" : "var(--muted-foreground)" }}
        >
          {running ? `FOCUS · ${fmt(remaining)}` : "PRONTO"}
        </span>
        <span style={{ flex: 1 }} />
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {running ? "⌘. ESCI · ⌘⏎ COMPLETA" : "⌘⏎ AVVIA"}
        </span>
      </div>

      <main
        className="grid"
        style={{
          flex: 1,
          gridTemplateColumns: "1fr min(880px, 80%) 1fr",
          alignItems: "center",
          padding: "0 32px",
        }}
      >
        <div />
        <div className="flex flex-col gap-7 py-12">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {activeCommessa
              ? `COMMESSA ${activeCommessa.code} · ${duration} MIN · TASK ${(sessions.length % 7) + 1} / 07`
              : `${duration} MIN · TASK ${(sessions.length % 7) + 1} / 07`}
          </span>
          {running ? (
            <h1
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontWeight: 400,
                margin: 0,
                fontSize: "clamp(64px, 9vw, 120px)",
                letterSpacing: "-0.045em",
                lineHeight: 0.92,
                textWrap: "balance" as never,
              }}
            >
              {task.split(" ").slice(0, -1).join(" ")}{" "}
              <span style={{ fontStyle: "italic" }}>
                {task.split(" ").slice(-1)[0] ?? task}
              </span>
              <span style={{ color: "var(--spark)" }}>.</span>
            </h1>
          ) : (
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Una sola cosa, scritta come ti viene…"
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontWeight: 400,
                margin: 0,
                fontSize: "clamp(64px, 9vw, 120px)",
                letterSpacing: "-0.045em",
                lineHeight: 0.92,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--fg)",
                width: "100%",
              }}
            />
          )}
          <p
            style={{
              margin: 0,
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.45,
              color: "var(--fg-2)",
              letterSpacing: "-0.005em",
              maxWidth: 720,
            }}
          >
            {running
              ? "Slack muted, mail muted, notifiche off. Quando hai finito, premi ⌘⏎ — io faccio il resto."
              : "Scegli un preset, una commessa, e scrivi la cosa. Una sola. Per ora."}
          </p>

          {/* Action row */}
          <div className="flex items-center gap-3 flex-wrap mt-1">
            {!running && (
              <>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="pill pill-ghost pill-sm"
                  style={{ paddingRight: 28 }}
                >
                  {PRESETS.map((p) => (
                    <option key={p.minutes} value={p.minutes}>
                      {p.label} · {p.minutes}m
                    </option>
                  ))}
                </select>
                <select
                  value={commessaId}
                  onChange={(e) => setCommessaId(e.target.value)}
                  className="pill pill-ghost pill-sm"
                  style={{ paddingRight: 28 }}
                >
                  {commesse.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.name}
                    </option>
                  ))}
                </select>
                <EditorialPill kind="spark" arrow onClick={start}>
                  ⌘⏎ Avvia focus
                </EditorialPill>
              </>
            )}
            {running && (
              <>
                <EditorialPill kind="spark" arrow onClick={() => stop("complete")}>
                  ⌘⏎ Completa task
                </EditorialPill>
                <EditorialPill kind="ghost" onClick={() => stop("abort")}>
                  Salta
                </EditorialPill>
                <span style={{ flex: 1 }} />
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  SLACK MUTED · MAIL MUTED · NOTIFICHE OFF
                </span>
              </>
            )}
          </div>

          {/* progress dots */}
          <div className="flex gap-1.5 mt-4">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const lit = i < litDots;
              const isCurrent = lit && i === Math.max(0, litDots - 1);
              return (
                <span
                  key={i}
                  style={{
                    height: 4,
                    flex: 1,
                    borderRadius: 999,
                    background: lit
                      ? isCurrent
                        ? "var(--spark)"
                        : "var(--fg)"
                      : "var(--line-strong)",
                  }}
                />
              );
            })}
          </div>
        </div>
        <div />
      </main>

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: "16px 32px",
          borderTop: "1px solid var(--line)",
          color: "var(--muted-foreground)",
        }}
      >
        <span className="t-mono">
          {running ? `INIZIATO ${fmtTime(startedAt)} · ETA ${fmtTime(eta)}` : "PRONTO QUANDO LO SEI"}
        </span>
        <span className="t-mono">
          PROSSIMA · {nextTask.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
