import { toast } from "sonner";
import type { NavigateOptions } from "@tanstack/react-router";

/**
 * Runtime dispatch context injected by the app shell.
 * Anything that mutates React state / navigates must go through here so the
 * same action registry can be used by Copilot, Command Palette, and NLP parser
 * without each one knowing about routing details.
 */
export interface ActionCtx {
  navigate: (opts: NavigateOptions) => void;
  openQuickAction?: (
    id: "add-employee" | "request-leave" | "submit-expense" | "post-job" | "run-payroll",
  ) => void;
}

export interface ActionRunnable {
  label: string;
  run: (ctx: ActionCtx) => void | Promise<void>;
}

export interface CopilotAnswer {
  text: string;
  actions?: ActionRunnable[];
}

/**
 * Resolve a free-form prompt to a narrated answer plus one or more runnable
 * actions. Shared across Copilot and (eventually) the NLP command bar.
 */
export function answerFor(prompt: string): CopilotAnswer {
  const q = prompt.toLowerCase();

  if (q.includes("expense")) {
    return {
      text:
        "I found 2 pending expenses under $200: Client dinner ($184.50) and Figma license ($180). " +
        "Bulk-approving them will notify the owners and move both to reimbursement.",
      actions: [
        {
          label: "Approve both",
          run: () => toast.success("2 expenses approved · $364.50 queued for reimbursement"),
        },
        { label: "Open expenses", run: (ctx) => ctx.navigate({ to: "/expenses" }) },
      ],
    };
  }

  if (q.includes("overlapping") || q.includes("leave")) {
    return {
      text:
        "Sales team has overlap May 10–17 (David Park + Leo Martin). Engineering is clear. " +
        "I can flag this as a staffing risk on the dashboard.",
      actions: [
        { label: "Open leave calendar", run: (ctx) => ctx.navigate({ to: "/leave" }) },
        { label: "Flag as risk", run: () => toast.success("Risk flagged · visible on dashboard") },
      ],
    };
  }

  if (q.includes("anomal")) {
    return {
      text:
        "1 anomaly this week: Engineering overtime up 18% week-over-week, concentrated in the " +
        "migration commessa (ACM-2025-01). No over-threshold expenses detected.",
      actions: [
        { label: "Open time page", run: (ctx) => ctx.navigate({ to: "/time" }) },
        { label: "Notify Sarah Chen", run: () => toast.success("DM drafted to Sarah Chen") },
      ],
    };
  }

  if (q.includes("welcome") || q.includes("draft")) {
    return {
      text:
        "Drafted:\n\n“Hi Emma, welcome to Acme! Your first-day checklist is in Pulse HR at /onboarding. " +
        "Sarah will reach out to schedule your welcome call on May 6. Can't wait to meet you.”",
      actions: [
        { label: "Open in composer", run: () => toast.success("Email draft opened") },
        { label: "Send now", run: () => toast.success("Email sent to emma@acme.co") },
      ],
    };
  }

  if (q.includes("budget") || q.includes("commessa")) {
    return {
      text:
        "Two commesse are over budget this month: LGO-2024-12 Legacy migration (101%) and " +
        "BCO-2025-03 Design system v2 (83%, trending over).",
      actions: [{ label: "Open clients", run: (ctx) => ctx.navigate({ to: "/clients" }) }],
    };
  }

  if (q.includes("headcount") || q.includes("report")) {
    return {
      text:
        "Generated Q2 headcount view: 12 → 14 planned (+Emma Wilson Eng, +James Liu Eng). " +
        "Turnover projected 4.2%, cost/employee trending +3% vs Q1.",
      actions: [
        { label: "Open Reports", run: (ctx) => ctx.navigate({ to: "/reports" }) },
        { label: "Export PDF", run: () => toast.success("PDF export started") },
      ],
    };
  }

  if (q.includes("draft my week") || q.includes("auto") || q.includes("autofill")) {
    return {
      text:
        "I can draft your week from your calendar and focus sessions — about 32h across Mon–Fri. " +
        "Review each row before accepting.",
      actions: [
        {
          label: "Open auto-fill",
          run: (ctx) => {
            ctx.navigate({ to: "/time" });
            window.dispatchEvent(new CustomEvent("pulse:open-autofill"));
          },
        },
      ],
    };
  }

  return {
    text: `I'd route "${prompt}" across Pulse. In the full agent, I'd query your data and chain actions. For now, try one of the suggestions below.`,
  };
}
