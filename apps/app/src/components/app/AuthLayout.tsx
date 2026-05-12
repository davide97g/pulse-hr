import { APP_VERSION } from "@/lib/version";
import { useLayoutEffect, type ReactNode } from "react";
import { useT } from "@pulse-hr/shared/i18n";

/**
 * Pin <html> to dark while the auth screens are mounted, then restore the
 * user's previous theme on unmount. Auth uses a dark editorial split that only
 * reads correctly in dark mode (--ink stays dark, --paper stays light).
 */
function useForcedDarkTheme() {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const prevTheme = html.dataset.theme;
    const prevDarkClass = html.classList.contains("dark");
    html.dataset.theme = "dark";
    html.classList.add("dark");
    return () => {
      if (prevTheme !== undefined) html.dataset.theme = prevTheme;
      else delete html.dataset.theme;
      html.classList.toggle("dark", prevDarkClass);
    };
  }, []);
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  side,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: ReactNode;
}) {
  useForcedDarkTheme();
  const t = useT();
  return (
    <div
      className="ph min-h-dvh grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] pt-safe pb-safe pl-safe pr-safe"
      style={{ background: "var(--bg)" }}
    >
      {/* Hero side — dark editorial */}
      <aside
        className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "48px 56px",
        }}
      >
        <div className="flex items-center gap-3.5">
          <span
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 28,
              letterSpacing: "-0.04em",
              fontWeight: 500,
            }}
          >
            pulse<span style={{ fontStyle: "normal", fontWeight: 400 }}>·</span>hr
          </span>
          <span
            className="t-mono"
            style={{ color: "color-mix(in oklch, var(--paper) 55%, transparent)" }}
          >
            v{APP_VERSION}
          </span>
        </div>

        <div>{side ?? <DefaultEditorialHero />}</div>

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr",
            borderTop: "1px solid color-mix(in oklch, var(--paper) 18%, transparent)",
            paddingTop: 22,
          }}
        >
          {(
            [
              ["142", "PERSONE", false],
              ["28", "CLIENTI", false],
              ["+22%", "MARGINE Q1", true],
            ] as Array<[string, string, boolean]>
          ).map(([v, l, accent]) => (
            <div key={l}>
              <div
                className="t-num"
                style={{
                  fontSize: 38,
                  letterSpacing: "-0.03em",
                  color: accent ? "var(--spark)" : "var(--paper)",
                }}
              >
                {v}
              </div>
              <span
                className="t-mono"
                style={{ color: "color-mix(in oklch, var(--paper) 55%, transparent)" }}
              >
                {l}
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* Form side */}
      <main className="flex flex-col justify-center min-h-full px-6 py-8 sm:px-10 sm:py-12 lg:px-[clamp(40px,5vw,80px)] lg:py-14 gap-5 sm:gap-6">
        <div className="lg:hidden flex items-center gap-3">
          <span
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              letterSpacing: "-0.04em",
              fontWeight: 500,
            }}
          >
            pulse·hr
          </span>
          <span
            className="t-mono ml-auto"
            style={{ color: "color-mix(in oklch, var(--foreground) 60%, transparent)" }}
          >
            v{APP_VERSION}
          </span>
        </div>
        <div>
          <span
            className="t-mono"
            style={{ color: "color-mix(in oklch, var(--foreground) 78%, transparent)" }}
          >
            {t("auth.access")}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "8px 0 0",
              fontSize: "clamp(32px, 7.5vw, 56px)",
              letterSpacing: "-0.035em",
              lineHeight: 0.98,
            }}
          >
            <span style={{ fontStyle: "italic" }}>{title.replace(/\.$/, "")}</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 12,
              color: "color-mix(in oklch, var(--foreground) 92%, transparent)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: "clamp(15px, 4vw, 18px)",
              maxWidth: 460,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        </div>
        <div className="w-full max-w-[460px]">{children}</div>
        {footer && (
          <div
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 16,
              color: "color-mix(in oklch, var(--foreground) 80%, transparent)",
              marginTop: 4,
            }}
          >
            {footer}
          </div>
        )}
        <span
          className="t-mono mt-auto hidden lg:inline"
          style={{ color: "color-mix(in oklch, var(--foreground) 65%, transparent)" }}
        >
          v{APP_VERSION}
        </span>
      </main>
    </div>
  );
}

function DefaultEditorialHero() {
  return (
    <div>
      <span className="t-mono" style={{ color: "var(--spark)" }}>
        ⏤ HR PER CHI HA ALTRO DA FARE ⏤
      </span>
      <h1
        style={{
          fontFamily: "Fraunces, ui-serif, serif",
          fontWeight: 400,
          margin: "20px 0 0",
          fontSize: "clamp(48px, 13vw, 132px)",
          letterSpacing: "-0.045em",
          lineHeight: 0.86,
          color: "var(--paper)",
        }}
      >
        Bentornato<span style={{ color: "var(--spark)" }}>.</span>
      </h1>
      <p
        style={{
          marginTop: 26,
          maxWidth: 460,
          color: "color-mix(in oklch, var(--paper) 78%, transparent)",
          fontFamily: "Fraunces, ui-serif, serif",
          fontStyle: "italic",
          fontSize: 22,
          lineHeight: 1.35,
        }}
      >
        Hai 3 timesheet da chiudere e una persona nuova che inizia mercoledì.
      </p>
    </div>
  );
}
