import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey && process.env.NODE_ENV === "production") {
  console.warn("[api/email] RESEND_API_KEY is not set — email sends will fail.");
}

export const resend = apiKey ? new Resend(apiKey) : null;

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "Pulse HR <onboarding@resend.dev>";
export const APP_BASE_URL = (process.env.APP_BASE_URL ?? "http://localhost:5173").replace(
  /\/+$/,
  "",
);

export function absoluteAppUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${APP_BASE_URL}${p}`;
}
