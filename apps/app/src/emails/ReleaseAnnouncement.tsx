import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type ReleaseAnnouncementProps = {
  version: string;
  title: string;
  /**
   * A sentinel string; the cron handler renders this template with `render()`,
   * then string-replaces this token with HTML produced by `marked(markdown)`.
   * Keeping it out of JSX avoids `dangerouslySetInnerHTML`.
   */
  bodyPlaceholder?: string;
  appUrl: string;
  tourId?: string | null;
};

export const BODY_PLACEHOLDER_TOKEN = "@@PULSE_RELEASE_BODY@@";

/**
 * Email sent to every user on a new release. The rich body is injected by
 * the caller via a post-render string replace on `BODY_PLACEHOLDER_TOKEN`.
 */
export function ReleaseAnnouncement({
  version,
  title,
  appUrl,
  tourId,
  bodyPlaceholder,
}: ReleaseAnnouncementProps) {
  const ctaHref = tourId ? `${appUrl}/?tour=${encodeURIComponent(tourId)}` : appUrl;
  return (
    <Html>
      <Head />
      <Preview>{`What's new in Pulse HR ${version} — ${title}`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading as="h1" style={h1}>
            Pulse HR {version}
          </Heading>
          <Text style={subtitle}>{title}</Text>
          <Hr style={hr} />
          <Section style={prose}>
            {/* Replaced post-render with marked() HTML. */}
            <Text style={prose}>{bodyPlaceholder ?? BODY_PLACEHOLDER_TOKEN}</Text>
          </Section>
          <Section style={{ textAlign: "center", padding: "16px 0" }}>
            <Button href={ctaHref} style={button}>
              {tourId ? "Take the 1-minute tour" : "Open Pulse HR"}
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            You're receiving this because release notifications are enabled in your Pulse HR
            account. Change this in Settings → Notifications.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ReleaseAnnouncement;

const body = {
  backgroundColor: "#f6f7f9",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji'",
};
const container = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "32px 24px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
};
const h1 = { margin: 0, fontSize: "24px", color: "#0b0b0d" };
const subtitle = { margin: "6px 0 0", fontSize: "14px", color: "#6b7280" };
const hr = { borderColor: "#e5e7eb", margin: "20px 0" };
const prose = { fontSize: "15px", lineHeight: "24px", color: "#1f2937" };
const button = {
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  padding: "12px 20px",
  borderRadius: "8px",
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-block",
};
const footer = { fontSize: "12px", color: "#6b7280", lineHeight: "18px" };
