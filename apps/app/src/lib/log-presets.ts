import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  CalendarRange,
  Compass,
  Heart,
  MessageSquareText,
  RotateCcw,
  Sunrise,
  Trophy,
  Wrench,
} from "lucide-react";
import type { LogTopic } from "./mock-data";

export type AgentPersona =
  | "coach"
  | "reflective"
  | "empathetic"
  | "strategic"
  | "curious"
  | "celebratory";

export interface LogPreset {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  persona: AgentPersona;
  opener: string;
  suggestedTopics: LogTopic[];
  composerSeed?: string;
  accent: string;
}

export const PRESETS: LogPreset[] = [
  {
    id: "daily-standup",
    label: "Daily standup",
    icon: Sunrise,
    description: "Three crisp lines. Shipped, next, blocked.",
    persona: "coach",
    opener: "Three quick bullets — what shipped, what's next, any blockers?",
    suggestedTopics: ["status", "win", "pain"],
    accent: "from-amber-500/15 to-amber-500/0",
  },
  {
    id: "end-of-day",
    label: "End-of-day close",
    icon: CalendarCheck,
    description: "Done, still open, tomorrow's first move.",
    persona: "reflective",
    opener: "Let's close the loop. What got done, what's still open, and what's tomorrow's first move?",
    suggestedTopics: ["status", "win", "challenge"],
    composerSeed: "Today I closed ",
    accent: "from-lime-500/15 to-lime-500/0",
  },
  {
    id: "weekly-recap",
    label: "Weekly recap",
    icon: CalendarRange,
    description: "Zoom out. Wins, drags, takeaway.",
    persona: "reflective",
    opener: "Let's zoom out. Biggest win, biggest drag, one thing to carry into next week.",
    suggestedTopics: ["win", "pain", "freeform"],
    accent: "from-sky-500/15 to-sky-500/0",
  },
  {
    id: "blocker-unblock",
    label: "Blocker unblock",
    icon: Wrench,
    description: "Name the block, owner, next ask.",
    persona: "coach",
    opener: "Let's isolate the blocker. What is stuck, who owns the next step, and what ask would unblock it?",
    suggestedTopics: ["pain", "challenge", "status"],
    composerSeed: "I'm blocked on ",
    accent: "from-orange-500/15 to-orange-500/0",
  },
  {
    id: "vent",
    label: "Vent session",
    icon: Heart,
    description: "Off the record. No structure needed.",
    persona: "empathetic",
    opener: "Off the record. What's frustrating you right now? No structure needed.",
    suggestedTopics: ["pain", "feedback"],
    accent: "from-rose-500/15 to-rose-500/0",
  },
  {
    id: "feedback-draft",
    label: "Feedback draft",
    icon: MessageSquareText,
    description: "Turn rough feedback into a useful ask.",
    persona: "strategic",
    opener: "Say the feedback plainly. I'll help turn it into a kind, specific request.",
    suggestedTopics: ["feedback", "challenge"],
    composerSeed: "Feedback I want to give: ",
    accent: "from-cyan-500/15 to-cyan-500/0",
  },
  {
    id: "one-on-one-prep",
    label: "1:1 prep",
    icon: Compass,
    description: "Frame what to bring to your next 1:1.",
    persona: "strategic",
    opener: "What do you want to bring to your 1:1? I'll help you frame it cleanly.",
    suggestedTopics: ["feedback", "freeform"],
    accent: "from-violet-500/15 to-violet-500/0",
  },
  {
    id: "project-retro",
    label: "Project retro",
    icon: RotateCcw,
    description: "Worked, didn't, would change.",
    persona: "curious",
    opener: "Pick a recent project. What worked, what didn't, what would you change?",
    suggestedTopics: ["win", "challenge", "feedback"],
    accent: "from-emerald-500/15 to-emerald-500/0",
  },
  {
    id: "win-journal",
    label: "Win journal",
    icon: Trophy,
    description: "Bank a win — even a small one.",
    persona: "celebratory",
    opener: "Tell me about a win — big or small. Banking it for your recap.",
    suggestedTopics: ["win"],
    composerSeed: "Today I'm proud of ",
    accent: "from-fuchsia-500/15 to-fuchsia-500/0",
  },
];

export function presetById(id: string): LogPreset | undefined {
  return PRESETS.find((p) => p.id === id);
}
