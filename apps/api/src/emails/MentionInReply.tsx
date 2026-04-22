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

export type MentionInReplyProps = {
  mentionerName: string;
  commentTitle: string;
  replySnippet: string;
  link: string;
};

export function MentionInReply({
  mentionerName,
  commentTitle,
  replySnippet,
  link,
}: MentionInReplyProps) {
  return (
    <Html>
      <Head />
      <Preview>{`${mentionerName} mentioned you in Pulse HR`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading as="h1" style={h1}>
            {mentionerName} mentioned you
          </Heading>
          <Text style={subtitle}>On: {commentTitle}</Text>
          <Hr style={hr} />
          <Text style={quote}>{replySnippet}</Text>
          <Button href={link} style={button}>
            View the thread
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            You're receiving this because @mention emails are enabled. Change this in Settings →
            Notifications.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default MentionInReply;

const body = {
  backgroundColor: "#f6f7f9",
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
};
const container = {
  maxWidth: "520px",
  margin: "0 auto",
  padding: "28px 24px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
};
const h1 = { margin: 0, fontSize: "20px", color: "#0b0b0d" };
const subtitle = { margin: "6px 0 0", fontSize: "14px", color: "#6b7280" };
const hr = { borderColor: "#e5e7eb", margin: "18px 0" };
const quote = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#1f2937",
  borderLeft: "3px solid #c7d2fe",
  paddingLeft: "12px",
  margin: "0 0 20px",
};
const button = {
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  padding: "10px 18px",
  borderRadius: "8px",
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-block",
};
const footer = { fontSize: "12px", color: "#6b7280", lineHeight: "18px" };
