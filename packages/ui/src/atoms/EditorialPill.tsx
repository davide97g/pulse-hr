import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/cn";

export type EditorialPillKind = "spark" | "ghost" | "dark" | "light";
export type EditorialPillSize = "sm" | "md";

export interface EditorialPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: EditorialPillKind;
  size?: EditorialPillSize;
  /** Append a chevron arrow that animates on hover (spark variant). */
  arrow?: boolean;
  children: ReactNode;
}

/**
 * Editorial pill button — wraps shadcn `<Button>` semantics with the .pill
 * design-system class. Use this for the *one* primary action per page in the
 * editorial design (spark) and any secondary editorial pills (ghost).
 *
 * Forms / dialogs / dense toolbars keep the standard `<Button>` from
 * `@pulse-hr/ui/primitives/button`.
 */
export const EditorialPill = forwardRef<HTMLButtonElement, EditorialPillProps>(
  ({ kind = "ghost", size = "md", arrow, children, className, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type={rest.type ?? "button"}
        className={cn("pill", `pill-${kind}`, size === "sm" && "pill-sm", className)}
        {...rest}
      >
        {children}
        {arrow && (
          <span className="arr" aria-hidden>
            →
          </span>
        )}
      </button>
    );
  },
);
EditorialPill.displayName = "EditorialPill";
