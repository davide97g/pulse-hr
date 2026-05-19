import { useI18n } from "@pulse-hr/shared/i18n";
import { SparkBurst } from "./SparkBurst";

interface SentRecipient {
  initials: string;
  firstName: string;
  email: string;
}

const ORBIT_POSITIONS = [
  { x: -110, y: -60 },
  { x: 120, y: -30 },
  { x: -30, y: 100 },
];

function initials(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (local.slice(0, 2) || "??").toUpperCase();
}

function firstNameOf(email: string): string {
  const local = email.split("@")[0] ?? email;
  const first = local.split(/[._-]+/).filter(Boolean)[0] ?? local;
  return first.toUpperCase();
}

interface Props {
  emails: string[];
  onInviteOthers: () => void;
  onClose: () => void;
}

export function ShareFinalSent({ emails, onInviteOthers, onClose }: Props) {
  const { locale } = useI18n();
  const it = locale === "it";

  const visible: SentRecipient[] = emails.slice(0, 3).map((email) => ({
    initials: initials(email),
    firstName: firstNameOf(email),
    email,
  }));
  const extra = Math.max(0, emails.length - 3);

  const today = new Date().toLocaleDateString(it ? "it-IT" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        padding: "44px 40px 36px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 420,
          height: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <SparkBurst size={340} density={18} />
        </div>

        <svg
          viewBox="-210 -140 420 280"
          width="420"
          height="280"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
          aria-hidden
        >
          <circle
            cx="0"
            cy="0"
            r="58"
            fill="none"
            stroke="rgba(180,255,57,.45)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          {visible.map((_, i) => {
            const p = ORBIT_POSITIONS[i];
            return (
              <line
                key={i}
                x1="0"
                y1="0"
                x2={p.x}
                y2={p.y}
                stroke="var(--spark)"
                strokeWidth="1.4"
                strokeDasharray="2 4"
                opacity={0.6}
              />
            );
          })}
        </svg>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%) rotate(-4deg)",
            zIndex: 3,
            width: 132,
            height: 132,
            borderRadius: 16,
            background: "var(--ink)",
            color: "var(--paper)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 30px 60px -20px rgba(0,0,0,.5), 0 0 0 1px rgba(180,255,57,.2)",
          }}
        >
          <svg
            width="132"
            height="132"
            viewBox="0 0 132 132"
            style={{ position: "absolute", inset: 0 }}
            aria-hidden
          >
            <path
              d="M 0 0 L 66 76 L 132 0"
              fill="none"
              stroke="rgba(255,255,255,.18)"
              strokeWidth="1.5"
            />
            <rect
              x="18"
              y="54"
              width="96"
              height="54"
              rx="2"
              fill="none"
              stroke="rgba(255,255,255,.22)"
              strokeWidth="1"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 54,
              height: 54,
              borderRadius: 999,
              background: "var(--spark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 0 0 6px rgba(180,255,57,.18), inset 0 -6px 0 rgba(0,0,0,.18), 0 12px 24px -6px rgba(180,255,57,.6)",
            }}
          >
            <span
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 24,
                color: "var(--spark-ink)",
                fontWeight: 500,
              }}
            >
              p
            </span>
          </div>
        </div>

        {visible.map((r, i) => {
          const p = ORBIT_POSITIONS[i];
          return (
            <div
              key={r.email}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                zIndex: 4,
              }}
            >
              <span
                className="ph-avatar ph-avatar-sm"
                style={{
                  background: "var(--spark)",
                  color: "var(--spark-ink)",
                  boxShadow:
                    "0 0 0 3px color-mix(in oklch, var(--spark) 30%, transparent), 0 6px 16px -4px rgba(180,255,57,.6)",
                  fontWeight: 700,
                }}
              >
                {r.initials}
              </span>
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 9,
                  color: "var(--fg)",
                  letterSpacing: "0.04em",
                  background: "color-mix(in oklch, var(--bg) 70%, transparent)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  whiteSpace: "nowrap",
                }}
              >
                {r.firstName}
              </span>
            </div>
          );
        })}
      </div>

      <div>
        <span className="t-mono" style={{ color: "var(--spark)" }}>
          ◆ {it ? "INVIATO" : "SENT"} · {today.toUpperCase()}
        </span>
        <h2
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontWeight: 400,
            margin: "10px 0 0",
            fontSize: 52,
            letterSpacing: "-0.035em",
            lineHeight: 0.96,
            color: "var(--fg)",
          }}
        >
          {it ? "Sono " : "They're "}
          <span style={{ fontStyle: "italic" }}>
            {it ? "in arrivo" : "on the way"}
          </span>
          <span style={{ color: "var(--spark)" }}>.</span>
        </h2>
        <p
          style={{
            margin: "10px 0 0",
            maxWidth: 480,
            fontSize: 14,
            lineHeight: 1.5,
            color: "var(--muted-foreground)",
          }}
        >
          {it
            ? `${emails.length} invit${emails.length === 1 ? "o spedito" : "i spediti"}. Quando entrano, le loro orbite si fissano al tuo workspace — stesso stato, stessa configurazione.`
            : `${emails.length} invite${emails.length === 1 ? "" : "s"} sent. When they accept, their orbits lock into your workspace — same state, same configuration.`}
          {extra > 0 && (
            <>
              {" "}
              <span style={{ color: "var(--fg)" }}>
                +{extra} {it ? "altri" : "more"}
              </span>
            </>
          )}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={onInviteOthers}
          className="pill pill-ghost sf-btn"
          style={{ padding: "10px 18px" }}
        >
          {it ? "Invita altri" : "Invite more"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="pill pill-dark sf-btn"
          style={{ padding: "10px 18px" }}
        >
          {it ? "Chiudi" : "Close"}
        </button>
      </div>
    </div>
  );
}
