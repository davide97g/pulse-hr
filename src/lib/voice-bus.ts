export type VoiceSource = "copilot" | "kudos" | "field" | "default";

export type VoiceEvent =
  | { kind: "toggle" }
  | { kind: "start" }
  | { kind: "stop" }
  | { kind: "state"; listening: boolean }
  | { kind: "draftPrompt"; text: string; source: VoiceSource };

type Handler = (ev: VoiceEvent) => void;

const handlers = new Set<Handler>();

/**
 * Callers can hint the intended destination of the next transcript
 * BEFORE emitting `toggle` / `start`. VoiceDock reads this at stop() to
 * tag the outgoing draftPrompt. Consumed (cleared) on every stop.
 */
let pendingSource: VoiceSource | null = null;

export const voiceBus = {
  emit(ev: VoiceEvent) {
    handlers.forEach((h) => {
      try {
        h(ev);
      } catch (err) {
        console.warn("voiceBus handler", err);
      }
    });
  },
  on(h: Handler) {
    handlers.add(h);
    return () => {
      handlers.delete(h);
    };
  },
  /** Route the next completed capture to a specific consumer. */
  requestSource(source: VoiceSource) {
    pendingSource = source;
  },
  consumeSource(): VoiceSource {
    const s = pendingSource ?? "default";
    pendingSource = null;
    return s;
  },
};
