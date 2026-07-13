import { Gauge, Scale, Utensils, CheckSquare, Flame } from "lucide-react";
import type { UserDetail } from "@/lib/api/user-detail-contracts.local";
import { MetricCard } from "@/components/general/MetricCard";
import { formatNumber } from "@/lib/format";

/** "17 🔥" — number-first, matching this page's stat-card style (distinct
 *  from the Recent Users table's "🔥 17d" format). */
function formatStreakValue(days: number): string {
  return days > 0 ? `${days} 🔥` : "0";
}

/** 5-card stat row — current streak, foods logged, weight logs, check-ins,
 *  avg daily kcal. Sourced from the same GET_USER fetch as the header and
 *  subscription card (no independent query needed for this section). */
export function UserStatCards({ stats }: { stats: UserDetail["stats"] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        label="Current streak"
        value={formatStreakValue(stats.currentStreakDays)}
        icon={Flame}
      />
      <MetricCard label="Foods logged" value={formatNumber(stats.totalFoodLogs)} icon={Utensils} />
      <MetricCard label="Weight logs" value={formatNumber(stats.totalWeightLogs)} icon={Scale} />
      <MetricCard label="Check-ins" value={formatNumber(stats.totalCheckIns)} icon={CheckSquare} />
      <MetricCard
        label="Avg daily kcal"
        value={stats.avgDailyKcal !== null ? formatNumber(stats.avgDailyKcal) : "—"}
        icon={Gauge}
      />
    </div>
  );
}
