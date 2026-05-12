/**
 * OpenAI Whisper wrapper for Super Import voice notes.
 */
import OpenAI from "openai";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY missing");
    client = new OpenAI({ apiKey });
  }
  return client;
}

export async function transcribeAudio(blob: Blob, filename: string): Promise<string> {
  const file = new File([blob], filename, { type: blob.type || "audio/webm" });
  const res = await getClient().audio.transcriptions.create({
    file,
    model: "whisper-1",
  });
  return res.text;
}
