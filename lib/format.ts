/** Display formatters (admin renders, never computes money/metrics). */
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});
const num = new Intl.NumberFormat("en-US");

export const formatCents = (cents: number): string => usd.format(cents / 100);
export const formatMoney = (
  cents: number | null | undefined,
  currency: string | null | undefined
): string => {
  if (cents === null || cents === undefined) return "—";
  if (!currency)
    return `${cents < 0 ? "−" : ""}${Math.abs(cents / 100).toFixed(2)} (unknown currency)`;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
};
/** "+$344" / "−$91" — signed money, for month-over-month MRR deltas. */
export const formatSignedCents = (cents: number): string => {
  const sign = cents > 0 ? "+" : cents < 0 ? "−" : "";
  return `${sign}${formatCents(Math.abs(cents))}`;
};
/** "$1.65k", "$2.2k" — for space-constrained axes (chart ticks). */
export const formatCompactCents = (cents: number): string => usdCompact.format(cents / 100);
export const formatNumber = (n: number): string => num.format(n);
export const formatPercent = (ratio: number, decimals = 1): string =>
  `${(ratio * 100).toFixed(decimals)}%`;
/** For values the API already returns as a percentage (0–100), not a 0–1 ratio. */
export const formatPct = (value: number, decimals = 1): string => `${value.toFixed(decimals)}%`;
/** Same, but signed — "+18%" / "−4%" — for vs-prior-period deltas. Returns
 *  "—" for `null` (not enough history yet to compare against). */
export const formatSignedPct = (value: number | null, decimals = 1): string => {
  if (value === null) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(decimals)}%`;
};
/** "🔥 17d" streak display, "—" when there's no active streak. */
export const formatStreak = (days: number | null | undefined): string =>
  days && days > 0 ? `🔥 ${days}d` : "—";
/** Short name of the previous calendar month (e.g. "Jun"), for "+18% vs Jun"
 *  captions — computed client-side, not fetched. */
export const lastMonthLabel = (now = new Date()): string => {
  const d = new Date(now);
  d.setMonth(d.getMonth() - 1);
  return d.toLocaleDateString("en-US", { month: "short" });
};
export const formatDate = (value: string | Date | null | undefined): string =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
/** "Today" / "Yesterday" / "N days ago" for recent dates, else falls back to
 *  `formatDate`'s "Jun 12, 2026" style. */
export const formatRelativeDate = (value: string | Date | null | undefined): string => {
  if (!value) return "—";
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(new Date(value))) / 86_400_000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(value);
};
