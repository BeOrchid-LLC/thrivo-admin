import type { EngagementAnalytics } from "@/lib/contracts";
import { EmptyState } from "@/components/general/states";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Retention cohort grid (cohort × week → retained %), shaded by value. */
export function CohortGrid({ data }: { data: EngagementAnalytics["retention"] }) {
  if (!data || data.length === 0) return <EmptyState title="No cohort data yet" />;

  const cohorts = Array.from(new Set(data.map((d) => d.cohort)));
  const weeks = Array.from(new Set(data.map((d) => d.week))).sort((a, b) => a - b);
  const lookup = new Map(data.map((d) => [`${d.cohort}:${d.week}`, d.retained]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th className="px-2 py-1 text-left text-xs font-semibold text-muted-foreground">
              Cohort
            </th>
            {weeks.map((w) => (
              <th
                key={w}
                className="px-2 py-1 text-center text-xs font-semibold text-muted-foreground"
              >
                W{w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => (
            <tr key={cohort}>
              <td className="px-2 py-1 text-xs font-medium text-foreground">{cohort}</td>
              {weeks.map((w) => {
                const v = lookup.get(`${cohort}:${w}`);
                return (
                  <td
                    key={w}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-center text-xs font-medium",
                      v === undefined ? "text-muted-foreground" : "text-foreground"
                    )}
                    style={
                      v === undefined
                        ? undefined
                        : { backgroundColor: `hsl(var(--primary) / ${0.12 + v * 0.5})` }
                    }
                  >
                    {v === undefined ? "—" : formatPercent(v, 0)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
