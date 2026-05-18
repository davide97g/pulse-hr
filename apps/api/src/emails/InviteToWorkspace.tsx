import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type InviteToWorkspaceProps = {
  inviterName: string;
  inviteeName?: string;
  inviteeEmail: string;
  workspaceName: string;
  role: "Admin" | "Member" | "Viewer" | "Guest";
  peopleCount: number;
  projectCount: number;
  region?: string;
  acceptUrl: string;
  previewAvatars: string[];
  locale?: "it" | "en";
};

export function inviteToWorkspaceSubject({
  workspaceName,
  locale = "it",
}: Pick<InviteToWorkspaceProps, "workspaceName" | "locale">) {
  return locale === "it"
    ? `Ti aspettano in ${workspaceName} su PulseHR`
    : `They're waiting for you in ${workspaceName} on PulseHR`;
}

/**
 * Transactional invitation email — design parity with the in-app ShareFinal modal.
 * Editorial Fraunces hero, lime "Accetta" CTA, workspace preview card with avatar stack.
 */
export function InviteToWorkspace({
  inviterName,
  inviteeName,
  workspaceName,
  role,
  peopleCount,
  projectCount,
  region = "IT",
  acceptUrl,
  previewAvatars,
  locale = "it",
}: InviteToWorkspaceProps) {
  const it = locale === "it";
  const greeting = inviteeName
    ? it
      ? `Ciao ${inviteeName.split(" ")[0]},`
      : `Hi ${inviteeName.split(" ")[0]},`
    : it
      ? "Ciao,"
      : "Hi,";

  return (
    <Html>
      <Head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>{inviteToWorkspaceSubject({ workspaceName, locale })}</Preview>
      <Body style={bodyStyle}>
        <Container style={container}>
          <Section style={brandRow}>
            <Text style={brand}>
              pulse<span style={brandDot}>·</span>hr
            </Text>
          </Section>

          <Heading as="h1" style={h1}>
            {greeting}
            <br />
            <span style={h1Italic}>{inviterName}</span>{" "}
            {it ? "ti vuole dentro." : "wants you in."}
          </Heading>

          <Text style={lead}>
            {it ? (
              <>
                Sei stat
                {inviteeName?.endsWith("a") ? "a" : "o"} invitat
                {inviteeName?.endsWith("a") ? "a" : "o"} al workspace{" "}
                <strong>{workspaceName}</strong> come <strong>{role}</strong>.
                Accettando entrerai subito — stesse persone, stesse commesse,
                stessa configurazione.
              </>
            ) : (
              <>
                You've been invited to the <strong>{workspaceName}</strong>{" "}
                workspace as <strong>{role}</strong>. Accept and you're in —
                same people, same projects, same configuration.
              </>
            )}
          </Text>

          <Section style={card}>
            <table
              role="presentation"
              cellPadding="0"
              cellSpacing="0"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tbody>
                <tr>
                  <td style={cardLogoCell}>
                    <div style={cardLogo}>
                      {workspaceName.charAt(0).toUpperCase()}
                    </div>
                  </td>
                  <td style={cardBodyCell}>
                    <div style={cardName}>{workspaceName}</div>
                    <div style={cardMeta}>
                      {peopleCount}{" "}
                      {it
                        ? peopleCount === 1
                          ? "PERSONA"
                          : "PERSONE"
                        : peopleCount === 1
                          ? "PERSON"
                          : "PEOPLE"}{" "}
                      · {projectCount}{" "}
                      {it
                        ? projectCount === 1
                          ? "COMMESSA"
                          : "COMMESSE"
                        : projectCount === 1
                          ? "PROJECT"
                          : "PROJECTS"}{" "}
                      · {region}
                    </div>
                  </td>
                  <td style={cardAvatarsCell}>
                    {previewAvatars.slice(0, 5).map((initials, i) => (
                      <span
                        key={i}
                        style={{
                          ...avatarChip,
                          marginLeft: i === 0 ? 0 : -6,
                        }}
                      >
                        {initials}
                      </span>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Button href={acceptUrl} style={cta}>
            {it ? "Accetta l'invito" : "Accept the invite"}
            <span style={ctaArrow}> →</span>
          </Button>

          <Text style={fallback}>
            {it ? "OPPURE APRI" : "OR OPEN"} ·{" "}
            <Link href={acceptUrl} style={fallbackLink}>
              {acceptUrl.replace(/^https?:\/\//, "")}
            </Link>
          </Text>

          <Text style={disclaimer}>
            {it
              ? `L'invito scade fra 7 giorni. Se non conosci ${inviterName}, ignora questa email — non potremo aggiungerti senza la tua accettazione.`
              : `This invite expires in 7 days. If you don't know ${inviterName}, ignore this email — we can't add you without your explicit acceptance.`}
          </Text>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerLeft}>PULSE.HR · MILANO</Text>
            <Text style={footerRight}>
              {it ? "PREFERENZE · ANNULLA ISCRIZIONE" : "PREFERENCES · UNSUBSCRIBE"}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  margin: 0,
  padding: 24,
  fontFamily: "Inter, system-ui, sans-serif",
  backgroundColor: "#f0eee9",
} as const;

const container = {
  maxWidth: 640,
  margin: "0 auto",
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(12,10,8,.10)",
  borderRadius: 18,
  overflow: "hidden",
  padding: "28px 36px 16px",
} as const;

const brandRow = { paddingBottom: 12 } as const;
const brand = {
  fontFamily: "Fraunces, ui-serif, serif",
  fontStyle: "italic",
  fontSize: 22,
  letterSpacing: "-0.02em",
  color: "#0c0a08",
  margin: 0,
} as const;
const brandDot = { fontStyle: "normal" } as const;

const h1 = {
  fontFamily: "Fraunces, ui-serif, serif",
  fontWeight: 400,
  fontSize: 46,
  letterSpacing: "-0.035em",
  lineHeight: 0.96,
  color: "#0c0a08",
  margin: "20px 0 8px",
} as const;

const h1Italic = { fontStyle: "italic" } as const;

const lead = {
  margin: "12px 0 0",
  fontSize: 14,
  lineHeight: 1.6,
  color: "rgba(12,10,8,.88)",
  maxWidth: 460,
} as const;

const card = {
  marginTop: 24,
  marginBottom: 24,
  border: "1px solid rgba(12,10,8,.10)",
  borderRadius: 14,
  padding: "16px 18px",
  backgroundColor: "#FBFAF7",
} as const;

const cardLogoCell = { width: 56, verticalAlign: "middle" } as const;
const cardLogo = {
  width: 44,
  height: 44,
  borderRadius: 10,
  backgroundColor: "#0c0a08",
  color: "#F5F4F2",
  textAlign: "center" as const,
  lineHeight: "44px",
  fontFamily: "Fraunces, ui-serif, serif",
  fontStyle: "italic",
  fontSize: 22,
  fontWeight: 500,
};
const cardBodyCell = { verticalAlign: "middle", paddingLeft: 12 } as const;
const cardName = {
  fontFamily: "Fraunces, ui-serif, serif",
  fontStyle: "italic",
  fontSize: 22,
  letterSpacing: "-0.02em",
  color: "#0c0a08",
  lineHeight: 1,
} as const;
const cardMeta = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  color: "rgba(12,10,8,.55)",
  marginTop: 4,
};
const cardAvatarsCell = {
  verticalAlign: "middle",
  textAlign: "right" as const,
  whiteSpace: "nowrap" as const,
};
const avatarChip = {
  display: "inline-block",
  width: 22,
  height: 22,
  borderRadius: 999,
  backgroundColor: "#0c0a08",
  color: "#F5F4F2",
  textAlign: "center" as const,
  lineHeight: "22px",
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 8,
  fontWeight: 600,
  letterSpacing: "0.04em",
  border: "2px solid #FFFFFF",
} as const;

const cta = {
  display: "inline-block",
  width: "100%",
  boxSizing: "border-box" as const,
  textAlign: "center" as const,
  padding: "14px 22px",
  borderRadius: 999,
  backgroundColor: "#b4ff39",
  color: "#0a1400",
  fontFamily: "Inter, system-ui, sans-serif",
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
  letterSpacing: "-0.01em",
};
const ctaArrow = { fontFamily: "Fraunces, ui-serif, serif", marginLeft: 6 } as const;

const fallback = {
  textAlign: "center" as const,
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  color: "rgba(12,10,8,.55)",
  margin: "16px 0 8px",
};
const fallbackLink = {
  color: "rgba(12,10,8,.55)",
  textDecoration: "none",
} as const;

const disclaimer = {
  textAlign: "center" as const,
  fontSize: 11,
  lineHeight: 1.5,
  color: "rgba(12,10,8,.55)",
  margin: "8px auto 16px",
  maxWidth: 480,
} as const;

const hr = {
  borderColor: "rgba(12,10,8,.10)",
  margin: "0 -36px",
} as const;

const footer = {
  padding: "14px 0 0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
} as const;
const footerLeft = {
  margin: 0,
  fontSize: 10,
  fontFamily: "JetBrains Mono, monospace",
  fontWeight: 500,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "rgba(12,10,8,.55)",
};
const footerRight = { ...footerLeft, textAlign: "right" as const } as const;

export default InviteToWorkspace;
