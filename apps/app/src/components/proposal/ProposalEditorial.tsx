import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const PHASES: Array<{
  n: string;
  title: string;
  weeks: string;
  price: string;
  desc: string;
  active?: boolean;
}> = [
  {
    n: "01",
    title: "Discovery & audit",
    weeks: "2 sett.",
    price: "€ 18.000",
    desc: "Interview con 6 operatori, mappa dei flussi, audit del codice esistente.",
    active: true,
  },
  {
    n: "02",
    title: "Design & prototipi",
    weeks: "2 sett.",
    price: "€ 26.000",
    desc: "Wireframe, system di componenti, prototipo navigabile, validazione con utenti.",
  },
  {
    n: "03",
    title: "Implementazione",
    weeks: "2 sett.",
    price: "€ 40.000",
    desc: "Build delle nuove view, migrazione progressiva, handoff al team interno.",
  },
];

export function ProposalEditorial({ id }: { id: string }) {
  const navigate = useNavigate();
  const ref = useMemo(() => `PRP-${id.slice(-3).padStart(3, "0").toUpperCase()}`, [id]);

  return (
    <div
      className="ph p-4 md:p-6 grid gap-11 min-h-full"
      style={{ gridTemplateColumns: "1.1fr 1fr" }}
    >
      <section className="flex flex-col justify-between gap-6">
        <div>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="t-mono"
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid var(--line)",
              background: "transparent",
              color: "var(--muted-foreground)",
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            ← INDIETRO
          </button>
          <div className="flex gap-3 items-center mt-4">
            <span className="t-mono" style={{ color: "var(--spark)" }}>
              PROPOSTA · {ref}
            </span>
            <span className="dot" />
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              BOZZA
            </span>
          </div>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "16px 0 0",
              fontSize: "clamp(56px, 7vw, 88px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
            }}
          >
            Acme · <span style={{ fontStyle: "italic" }}>refactor</span>
            <br />
            pannello operatore<span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 22,
              maxWidth: 480,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.35,
            }}
          >
            Sei settimane, due designer, un PM. Refactor del pannello operatore in tre fasi, con
            consegna incrementale.
          </p>
        </div>

        <div
          className="grid pt-6"
          style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--line-strong)" }}
        >
          <KpiCell label="BUDGET" value="€ 84.000" accent first />
          <KpiCell label="DURATA" value="6 sett." />
          <KpiCell label="TEAM" value="3 FTE" />
          <KpiCell label="INIZIO" value="20 mag" first firstRow />
          <KpiCell label="FINE" value="01 lug" firstRow />
          <KpiCell label="MARGINE STIM." value="+22%" firstRow />
        </div>
      </section>

      <section className="flex flex-col gap-3.5 min-h-0 overflow-hidden">
        <div className="flex justify-between">
          <span className="t-h3-sans">Fasi</span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {PHASES.length} MILESTONE
          </span>
        </div>
        <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-3 pr-1">
          {PHASES.map((p) => (
            <div
              key={p.n}
              className="grid items-start"
              style={{
                border: `1px solid ${p.active ? "var(--spark)" : "var(--line)"}`,
                borderRadius: 14,
                padding: "18px 20px",
                gridTemplateColumns: "44px 1fr 100px",
                gap: 16,
                background: p.active
                  ? "color-mix(in oklch, var(--spark) 5%, transparent)"
                  : "transparent",
              }}
            >
              <span
                className="t-num"
                style={{
                  fontSize: 32,
                  letterSpacing: "-0.04em",
                  color: p.active ? "var(--spark)" : "var(--muted-foreground)",
                }}
              >
                {p.n}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontWeight: 500,
                    fontSize: 22,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  <span style={{ fontStyle: "italic" }}>{p.title}</span>
                </div>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 14.5,
                    color: "var(--fg-2)",
                    lineHeight: 1.5,
                  }}
                >
                  {p.desc}
                </p>
                <span
                  className="t-mono mt-2 block"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  DURATA · {p.weeks.toUpperCase()}
                </span>
              </div>
              <span
                className="t-num"
                style={{ fontSize: 18, textAlign: "right", letterSpacing: "-0.02em" }}
              >
                {p.price}
              </span>
            </div>
          ))}
        </div>

        <div
          className="pt-4 flex items-center gap-2.5 flex-wrap"
          style={{ borderTop: "1px solid var(--line-strong)" }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            BOZZA SALVATA · 09:42
          </span>
          <span className="flex-1" />
          <SubmitProposal />
        </div>
      </section>
    </div>
  );
}

function KpiCell({
  label,
  value,
  accent,
  first,
  firstRow,
}: {
  label: string;
  value: string;
  accent?: boolean;
  first?: boolean;
  firstRow?: boolean;
}) {
  return (
    <div
      style={{
        paddingTop: firstRow ? 14 : 0,
        paddingLeft: first ? 0 : 12,
        borderLeft: first ? "none" : "1px solid var(--line)",
        marginBottom: !firstRow ? 14 : 0,
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div
        className="t-num"
        style={{
          fontSize: 24,
          marginTop: 4,
          letterSpacing: "-0.02em",
          color: accent ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SubmitProposal() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <button
        type="button"
        className="pill pill-ghost pill-sm"
        onClick={() => toast("Anteprima non disponibile in modalità demo")}
      >
        Anteprima
      </button>
      <button
        type="button"
        className="pill pill-spark pill-sm"
        disabled={sent}
        style={{ opacity: sent ? 0.6 : 1 }}
        onClick={() => {
          setSent(true);
          toast.success("Proposta inviata", {
            description: "Acme · email scheduled",
            action: { label: "Annulla", onClick: () => setSent(false) },
          });
        }}
      >
        {sent ? "Inviata ✓" : <>Invia → Acme <span className="arr">→</span></>}
      </button>
    </>
  );
}
