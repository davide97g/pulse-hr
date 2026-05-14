import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@pulse-hr/shared/i18n";

type Level = "light" | "balanced" | "heavy" | "overloaded";

interface CheckIn {
  weekISO: string;
  level: Level;
  at: string;
}

const STORAGE_KEY = "pulse.workload.checkins.v1";
const HISTORY_WEEKS = 8;

function isoWeek(d: Date): string {
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - day + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86_400_000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    );
  return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function loadCheckins(): CheckIn[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedHistory();
    const parsed = JSON.parse(raw) as CheckIn[];
    return Array.isArray(parsed) ? parsed : seedHistory();
  } catch {
    return seedHistory();
  }
}

function saveCheckins(list: CheckIn[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function seedHistory(): CheckIn[] {
  // 7 weeks of plausible past data so the sparkline isn't empty on first visit.
  const levels: Level[] = ["balanced", "balanced", "heavy", "balanced", "light", "heavy", "balanced"];
  const now = new Date();
  return levels.map((lvl, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (levels.length - i) * 7);
    return { weekISO: isoWeek(d), level: lvl, at: d.toISOString() };
  });
}

function pastWeeks(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    out.push(isoWeek(d));
  }
  return out;
}

interface LevelMeta {
  id: Level;
  glyph: string;
  label: { en: string; it: string };
  caption: { en: string; it: string };
  rank: number;
}

const LEVELS: LevelMeta[] = [
  {
    id: "light",
    glyph: "🌤",
    label: { en: "Light", it: "Leggera" },
    caption: { en: "Plenty of slack — good for deep work.", it: "Tanta aria — buona per cose tue." },
    rank: 1,
  },
  {
    id: "balanced",
    glyph: "⛅",
    label: { en: "Balanced", it: "Bilanciata" },
    caption: { en: "Full but sustainable.", it: "Piena ma sostenibile." },
    rank: 2,
  },
  {
    id: "heavy",
    glyph: "🌧",
    label: { en: "Heavy", it: "Pesante" },
    caption: { en: "Stretched. A second pair of hands would help.", it: "Tirata. Un aiuto farebbe comodo." },
    rank: 3,
  },
  {
    id: "overloaded",
    glyph: "⛈",
    label: { en: "Overloaded", it: "Sovraccarica" },
    caption: { en: "Too much. Worth flagging.", it: "Troppo. Vale la pena dirlo." },
    rank: 4,
  },
];

function levelColor(lvl: Level): string {
  switch (lvl) {
    case "light":
      return "color-mix(in oklch, var(--spark) 65%, var(--fg) 10%)";
    case "balanced":
      return "var(--fg)";
    case "heavy":
      return "color-mix(in oklch, var(--spark) 80%, var(--fg) 20%)";
    case "overloaded":
      return "var(--destructive)";
  }
}

export function SaturationEditorial() {
  const { locale } = useI18n();
  const it = locale === "it";
  const [checkins, setCheckins] = useState<CheckIn[]>(() => loadCheckins());
  const thisWeek = useMemo(() => isoWeek(new Date()), []);
  const current = checkins.find((c) => c.weekISO === thisWeek);

  useEffect(() => {
    saveCheckins(checkins);
  }, [checkins]);

  function pick(level: Level) {
    setCheckins((prev) => {
      const without = prev.filter((c) => c.weekISO !== thisWeek);
      return [...without, { weekISO: thisWeek, level, at: new Date().toISOString() }];
    });
    const label = LEVELS.find((l) => l.id === level)?.label[it ? "it" : "en"] ?? level;
    toast.success(it ? `Settimana segnata: ${label}` : `Week logged: ${label}`, {
      description: it
        ? "Il tuo capo vedrà solo il trend, non i singoli check-in."
        : "Your manager sees only the trend, not individual check-ins.",
    });
  }

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-10 min-h-full">
      {/* Hero */}
      <section className="flex flex-col gap-6">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {it ? "CARICO DI LAVORO · SETTIMANA " : "WORKLOAD · WEEK "}
            {thisWeek.split("-W")[1]}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(48px, 11vw, 116px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            {it ? "Com'è andata la " : "How heavy is this "}
            <span style={{ fontStyle: "italic" }}>{it ? "settimana" : "week"}</span>
            <span style={{ color: "var(--spark)" }}>?</span>
          </h1>
          <p
            style={{
              marginTop: 16,
              maxWidth: 560,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 19,
              lineHeight: 1.4,
            }}
          >
            {current
              ? it
                ? "Già segnata. Tocca pure se vuoi cambiare."
                : "Already logged. Tap again to change it."
              : it
                ? "Un tocco. Niente form, niente percentuali."
                : "One tap. No forms, no percentages."}
          </p>
        </div>

        {/* Four big buttons */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {LEVELS.map((lvl) => {
            const active = current?.level === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => pick(lvl.id)}
                className="press-scale text-left"
                style={{
                  border: `1px solid ${active ? "var(--spark)" : "var(--line)"}`,
                  background: active
                    ? "color-mix(in oklch, var(--spark) 10%, transparent)"
                    : "var(--bg-2)",
                  borderRadius: 18,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  cursor: "pointer",
                  color: "inherit",
                  minHeight: 160,
                }}
              >
                <span style={{ fontSize: 44, lineHeight: 1 }}>{lvl.glyph}</span>
                <span
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 26,
                    letterSpacing: "-0.02em",
                    color: active ? "var(--spark)" : "var(--fg)",
                  }}
                >
                  {lvl.label[it ? "it" : "en"]}
                </span>
                <span
                  style={{
                    color: "var(--fg-2)",
                    fontSize: 13,
                    lineHeight: 1.45,
                  }}
                >
                  {lvl.caption[it ? "it" : "en"]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sparkline trend */}
      <TrendStrip checkins={checkins} weeks={pastWeeks(HISTORY_WEEKS)} it={it} />

      {/* External-tool nudge */}
      <ExternalToolNote it={it} />
    </div>
  );
}

function TrendStrip({
  checkins,
  weeks,
  it,
}: {
  checkins: CheckIn[];
  weeks: string[];
  it: boolean;
}) {
  const points = weeks.map((w) => {
    const hit = checkins.find((c) => c.weekISO === w);
    return { week: w, level: hit?.level, rank: hit ? LEVELS.find((l) => l.id === hit.level)!.rank : null };
  });

  const W = 720;
  const H = 120;
  const PAD = 20;
  const x = (i: number) => PAD + ((W - 2 * PAD) * i) / Math.max(1, points.length - 1);
  const y = (rank: number) => PAD + ((H - 2 * PAD) * (rank - 1)) / 3;

  const lineD = points
    .map((p, i) => (p.rank == null ? null : `${i === 0 || points[i - 1].rank == null ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.rank).toFixed(1)}`))
    .filter(Boolean)
    .join(" ");

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-baseline flex-wrap gap-2">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {it ? "TENDENZA · ULTIME 8 SETTIMANE" : "TREND · LAST 8 WEEKS"}
        </span>
        <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
          {it ? "tu vedi questo · il tuo capo vede solo aggregato" : "you see this · manager sees only aggregate"}
        </span>
      </div>
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: "20px 22px",
          background: "var(--bg-2)",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 140 }}>
          {[1, 2, 3, 4].map((rank) => (
            <line
              key={rank}
              x1={PAD}
              x2={W - PAD}
              y1={y(rank)}
              y2={y(rank)}
              stroke="var(--line)"
              strokeDasharray="2 4"
              strokeWidth="1"
            />
          ))}
          {lineD && (
            <path
              d={lineD}
              stroke="color-mix(in oklch, var(--spark) 55%, var(--fg) 25%)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {points.map((p, i) =>
            p.rank == null ? (
              <circle
                key={p.week}
                cx={x(i)}
                cy={y(2)}
                r="4"
                fill="none"
                stroke="var(--line-strong)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
            ) : (
              <circle
                key={p.week}
                cx={x(i)}
                cy={y(p.rank)}
                r={i === points.length - 1 ? 8 : 6}
                fill={levelColor(p.level!)}
                stroke="var(--background)"
                strokeWidth="2"
              />
            ),
          )}
          {points.map((p, i) => (
            <text
              key={`${p.week}-lbl`}
              x={x(i)}
              y={H - 4}
              fontFamily="JetBrains Mono"
              fontSize="9"
              fill="var(--muted-foreground)"
              textAnchor="middle"
            >
              {p.week.split("-W")[1]}
            </text>
          ))}
        </svg>
        <div className="flex gap-4 flex-wrap mt-1">
          {LEVELS.map((l) => (
            <div key={l.id} className="flex items-center gap-1.5">
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: levelColor(l.id),
                }}
              />
              <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
                {l.label[it ? "it" : "en"]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExternalToolNote({ it }: { it: boolean }) {
  return (
    <section
      style={{
        border: "1px dashed var(--line-strong)",
        borderRadius: 16,
        padding: "18px 22px",
        background: "transparent",
        display: "flex",
        gap: 18,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div className="flex-1 min-w-[260px]">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {it ? "ORE & PROGETTI" : "HOURS & PROJECTS"}
        </span>
        <p
          style={{
            margin: "6px 0 0",
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 18,
            lineHeight: 1.4,
            color: "var(--fg)",
            maxWidth: 560,
          }}
        >
          {it
            ? "Pulse HR non traccia le ore. Per allocazioni, commesse e timesheet usa il tuo strumento di sempre — qui ci interessa solo come stai."
            : "Pulse HR doesn't track hours. For allocations, projects, and timesheets keep using your usual tool — here we only care how you're doing."}
        </p>
      </div>
      <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
        {it ? "promemoria settimanale ogni venerdì" : "weekly reminder every Friday"}
      </span>
    </section>
  );
}
