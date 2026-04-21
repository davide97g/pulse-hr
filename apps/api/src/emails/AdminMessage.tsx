import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export type AdminMessageProps = {
  senderName: string;
  subject: string;
  /** Plain text body. Line breaks preserved via <Text style="whiteSpace: pre-wrap"> */
  body: string;
  appUrl: string;
};

/**
 * One-off message sent by an admin through the in-app "send email" form.
 * Deliberately plain — no bullets, no styled prose block — so the message
 * itself is the content, not the chrome.
 */
export function AdminMessage({ senderName, subject, body, appUrl }: AdminMessageProps) {
  return (
    <Html>
      <Head />
      <Preview>{subject || `A message from ${senderName}`}</Preview>
      <Body style={bodyStyle}>
        <Container style={container}>
          <Text style={eyebrow}>Message from {senderName} via Pulse HR</Text>
          <Heading as="h1" style={h1}>
            {subject}
          </Heading>
          <Hr style={hr} />
          <Text style={message}>{body}</Text>
          <Hr style={hr} />
          <Button href={appUrl} style={button}>
            Open Pulse HR
          </Button>
          <Text style={footer}>
            Sent through Pulse HR. If you didn't expect this, reach out to your admin.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default AdminMessage;

const bodyStyle = {
  backgroundColor: "#f6f7f9",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
};
const container = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "32px 24px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
};
const eyebrow = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 500,
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};
const h1 = { margin: "8px 0 0", fontSize: "22px", color: "#0b0b0d" };
const hr = { borderColor: "#e5e7eb", margin: "20px 0" };
const message = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#1f2937",
  whiteSpace: "pre-wrap" as const,
};
const button = {
  backgroundColor: "#0b0b0d",
  color: "#b4ff39",
  padding: "12px 20px",
  borderRadius: "8px",
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-block",
};
const footer = { fontSize: "12px", color: "#6b7280", lineHeight: "18px", marginTop: "16px" };
