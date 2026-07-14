interface PlanRowProps {
  label: string;
  statsLine: string;
  /** Share of total premium users on this plan, 0–100 — the bar's fill width. */
  pct: number;
}

/** One row in the "Plan breakdown" mini-list: label + stats + a thin progress bar. */
export function PlanRow({ label, statsLine, pct }: PlanRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{statsLine}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          data-testid="plan-row-fill"
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
