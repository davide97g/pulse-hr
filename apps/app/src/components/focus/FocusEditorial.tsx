import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useFocusSessions, focusSessionsTable } from "@/lib/tables/focusSessions";
import { commesse } from "@/lib/mock-data";

const ME = "e1";
const DEFAULT_TASK = "Rivedere il flow di onboarding";
const DEFAULT_DETAIL =
  "Cinque schermate, due varianti. Decidere il tono di voce del copy IT prima delle 11. Quando hai finito, premi ⌘⏎ — io faccio il resto.";

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FocusEditorial() {
  const sessions = useFocusSessions();
  const minePast = useMemo(
    () =>
      sessions
        .filter((s) => s.employeeId === ME)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [sessions],
  );
  const lastSession = minePast[0];
  const lastCommessa = lastSession ? commesse.find((c) => c.id === lastSession.commessaId) : null;

  const [running, setRunning] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [task] = useState(lastSession?.note ?? DEFAULT_TASK);
  const commessaCode = lastCommessa?.code ?? commesse[0]?.code ?? "—";

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  function complete() {
    const today = new Date().toISOString().slice(0, 10);
    focusSessionsTable.add({
      id: `fs-${Date.now()}`,
      employeeId: ME,
      date: today,
      startedAt: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
      durationMin: Math.max(1, Math.round(seconds / 60)),
      commessaId: lastCommessa?.id ?? commesse[0]?.id ?? "",
      meetingsDeclined: 0,
      note: task,
    });
    toast.success("Focus completato", { description: `${formatTimer(seconds)} di deep work registrati.` });
    setRunning(false);
    setSeconds(0);
  }

  // 7-step progress dots (4 done by default)
  const dots = [1, 1, 1, 1, 0, 0, 0];

  return (
    <div className="ph relative overflow-hidden flex flex-col" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
      {/* Tiny top bar */}
      <div
        className="flex items-center px-6 py-4 gap-3.5"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <span style={{ fontFamily: "Fraunces, ui-serif, serif", fontStyle: "italic", fontSize: 18, fontWeight: 500 }}>
          pulse·hr
        </span>
        <span className="dot" />
        <span className="t-mono" style={{ color: "var(--spark)" }}>
          FOCUS · {formatTimer(seconds)}
        </span>
        <span className="flex-1" />
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          ⌘. ESCI · ⌘⏎ COMPLETA
        </span>
      </div>

      <main
        className="flex-1 grid items-center"
        style={{ gridTemplateColumns: "1fr min(880px, 80%) 1fr", padding: "0 24px" }}
      >
        <div />
        <div className="flex flex-col gap-7">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            COMMESSA {commessaCode} · TASK 04 / 07
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: 0,
              fontSize: "clamp(64px, 9vw, 120px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.92,
              textWrap: "balance",
            }}
          >
            {task.replace(/onboarding/i, "")}
            <span style={{ fontStyle: "italic" }}>onboarding</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
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
              textWrap: "pretty",
            }}
          >
            {DEFAULT_DETAIL}
          </p>
          <div className="flex gap-3.5 items-center mt-3 flex-wrap">
            <button type="button" className="pill pill-spark" onClick={complete}>
              ⌘⏎ Completa task
            </button>
            <button
              type="button"
              className="pill pill-ghost"
              onClick={() => setRunning((r) => !r)}
            >
              {running ? "Pausa" : "Riprendi"}
            </button>
            <button type="button" className="pill pill-ghost">
              Snooze 15min
            </button>
            <span className="flex-1" />
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              SLACK MUTED · MAIL MUTED · NOTIFICHE OFF
            </span>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-4">
            {dots.map((on, i) => (
              <span
                key={i}
                style={{
                  height: 4,
                  flex: 1,
                  borderRadius: 999,
                  background: on
                    ? i === 3
                      ? "var(--spark)"
                      : "var(--fg)"
                    : "var(--line-strong)",
                }}
              />
            ))}
          </div>
        </div>
        <div />
      </main>

      <div
        className="px-6 py-4 flex justify-between"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          INIZIATO{" "}
          {new Date(Date.now() - seconds * 1000).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          · ETA{" "}
          {new Date(Date.now() + (60 * 60 - seconds) * 1000).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          PROSSIMA · COPY MICROCOPY ERROR-STATES
        </span>
      </div>
    </div>
  );
}
