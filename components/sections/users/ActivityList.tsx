"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { callApi, queryKeys } from "@/lib/api";
import { POLL_INTERVALS } from "@/lib/query/make-query-client";
import { fixtureUserActivity, resolveData } from "@/lib/fixtures";
import type { ActivityType } from "@/lib/api/user-detail-contracts.local";
import { EmptyState } from "@/components/general/states";
import { formatDate, formatNumber } from "@/lib/format";

const ACTIVITY_LIMIT = 8;

function activityQuery(id: string, type: ActivityType) {
  return {
    queryKey: queryKeys.users.activity(id, type),
    queryFn: () =>
      resolveData(fixtureUserActivity[type], () =>
        callApi("GET_USER_ACTIVITY", { params: { id }, query: { type, limit: ACTIVITY_LIMIT } })
      ),
    refetchInterval: POLL_INTERVALS.operational,
  };
}

function rowContent(type: ActivityType, item: Record<string, unknown>) {
  if (type === "food_logs") {
    const servingLine = item.servingQty
      ? `${item.servingQty}${item.servingUnit ? ` ${item.servingUnit}` : ""}`
      : null;
    return {
      primary: String(item.name),
      subtitle: [formatDate(item.localDate as string), servingLine].filter(Boolean).join(" · "),
      trailing: `${formatNumber(item.kcal as number)} kcal`,
    };
  }
  if (type === "check_ins") {
    return {
      primary: String(item.mood).charAt(0).toUpperCase() + String(item.mood).slice(1),
      subtitle: [formatDate(item.localDate as string), item.note as string | null]
        .filter(Boolean)
        .join(" · "),
      trailing: null,
    };
  }
  return {
    primary: `${item.weightKg} kg`,
    subtitle: [formatDate(item.localDate as string), item.note as string | null]
      .filter(Boolean)
      .join(" · "),
    trailing: null,
  };
}

/** One activity tab's content — independent fetch, independent loading/error
 *  state, keyed by (userId, type) so switching tabs and back is cache-warm. */
export function ActivityList({ userId, type }: { userId: string; type: ActivityType }) {
  const { data } = useSuspenseQuery(activityQuery(userId, type));

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Showing {data.items.length} most recent · {formatNumber(data.total)} total
      </p>
      {data.items.length === 0 ? (
        <EmptyState title="Nothing here yet" />
      ) : (
        <div className="divide-y divide-border">
          {data.items.map((item) => {
            const row = rowContent(type, item as unknown as Record<string, unknown>);
            const key = (item as { id: string }).id;
            return (
              <div key={key} className="flex items-center justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{row.primary}</p>
                  <p className="truncate text-xs text-muted-foreground">{row.subtitle}</p>
                </div>
                {row.trailing ? (
                  <span className="shrink-0 text-sm text-muted-foreground">{row.trailing}</span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
