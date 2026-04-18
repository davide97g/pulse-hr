export type VoiceEvent =
  | { kind: "toggle" }
  | { kind: "start" }
  | { kind: "stop" }
  | { kind: "state"; listening: boolean }
  | { kind: "draftPrompt"; text: string };

type Handler = (ev: VoiceEvent) => void;

const handlers = new Set<Handler>();

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
};
