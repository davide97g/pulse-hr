import { format } from "date-fns";
export function LogSessionDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-4 fade-in">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <span className="font-display text-xs tracking-wide text-muted-foreground uppercase">
        {format(new Date(date), "EEE, MMM d")}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
