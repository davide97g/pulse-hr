import { useUser } from "@clerk/react";
import { useEmployees } from "@/lib/tables/employees";
import { useFullName } from "@/lib/current-user";

const ME = "e1";

function splitName(name: string): { first: string; last: string } {
  const parts = name.trim().split(" ");
  if (parts.length < 2) return { first: parts[0] ?? name, last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export function ProfileEditorial() {
  const employees = useEmployees();
  const fullName = useFullName();
  const { user } = useUser();
  const me = employees.find((e) => e.id === ME) ?? employees[0];

  if (!me) {
    return (
      <div className="p-12 text-center" style={{ color: "var(--muted-foreground)" }}>
        <span className="t-mono">PROFILO NON DISPONIBILE</span>
      </div>
    );
  }

  const displayName =
    user?.fullName || fullName || `${me.name}`;
  const { first, last } = splitName(displayName);
  const initials = me.initials;
  const email = user?.primaryEmailAddress?.emailAddress ?? me.email;
  const seniority = (() => {
    const join = new Date(me.joinDate);
    const years = new Date().getFullYear() - join.getFullYear();
    return years <= 0 ? "< 1 anno" : `${years} ann${years === 1 ? "o" : "i"}`;
  })();

  return (
    <div
      className="ph p-4 md:p-6 grid gap-11 min-h-full"
      style={{ gridTemplateColumns: "1.2fr 1fr" }}
    >
      <section className="flex flex-col justify-between min-h-0 gap-6">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            PROFILO · {me.id.toUpperCase().replace(/^E/, "PHR-")} · DAL{" "}
            {new Date(me.joinDate).getFullYear()}
          </span>
          <div className="flex items-end gap-7 mt-3.5 flex-wrap">
            <span
              className="ph-avatar ph-avatar-lg"
              style={{ width: 88, height: 88, fontSize: 28 }}
            >
              {initials}
            </span>
            <div>
              <h1
                style={{
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontWeight: 400,
                  margin: 0,
                  fontSize: "clamp(56px, 7vw, 92px)",
                  letterSpacing: "-0.045em",
                  lineHeight: 0.86,
                }}
              >
                {first}
                <br />
                <span style={{ fontStyle: "italic" }}>{last || me.name.split(" ")[0]}</span>
                <span style={{ color: "var(--spark)" }}>.</span>
              </h1>
            </div>
          </div>
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
            {me.role}. {me.department} · {me.location}.
          </p>
        </div>

        <div
          className="grid pt-6"
          style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--line-strong)" }}
        >
          <Stat label="EMPLOYEE SCORE" value="92" accent first />
          <Stat label="SATURAZIONE" value="78%" />
          <Stat label="PERMANENZA" value={seniority} />
        </div>
      </section>

      <section className="flex flex-col gap-4 min-h-0 overflow-auto pr-1">
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            CONTATTI
          </span>
          {[
            ["EMAIL", email],
            ["TELEFONO", me.phone],
            ["SLACK", `@${me.name.toLowerCase().split(" ").join(".")}`],
            ["SEDE", me.location],
          ].map(([l, v], i) => (
            <Row key={l} label={l} value={v} last={i === 3} />
          ))}
        </div>

        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div className="flex justify-between">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              EMPLOYMENT
            </span>
            <span className="t-mono" style={{ color: "var(--spark)" }}>
              ATTIVO
            </span>
          </div>
          {[
            ["RUOLO", me.role],
            ["MANAGER", me.manager ?? "—"],
            ["DIPARTIMENTO", me.department],
            ["CONTRATTO", `${me.employmentType} · 40h/sett`],
            [
              "INIZIO",
              new Date(me.joinDate).toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }),
            ],
            ["RAL", `€ ${me.salary.toLocaleString("it-IT")}`],
          ].map(([l, v], i, arr) => (
            <Row key={l} label={l} value={v} last={i === arr.length - 1} wide />
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, last, wide }: { label: string; value: string; last: boolean; wide?: boolean }) {
  return (
    <div
      className="grid items-baseline"
      style={{
        gridTemplateColumns: wide ? "150px 1fr" : "120px 1fr",
        gap: 14,
        padding: "8px 0",
        borderBottom: last ? "none" : "1px solid var(--line)",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "Fraunces, ui-serif, serif",
          fontStyle: "italic",
          fontSize: 18,
          letterSpacing: "-0.005em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  first,
}: {
  label: string;
  value: string;
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
      <div
        className="t-num mt-1"
        style={{
          fontSize: 36,
          letterSpacing: "-0.03em",
          color: accent ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
