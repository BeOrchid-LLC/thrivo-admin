/** Display formatters (admin renders, never computes money/metrics). */
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const num = new Intl.NumberFormat("en-US");

export const formatCents = (cents: number): string => usd.format(cents / 100);
export const formatNumber = (n: number): string => num.format(n);
export const formatPercent = (ratio: number, decimals = 1): string =>
  `${(ratio * 100).toFixed(decimals)}%`;
export const formatDate = (value: string | Date | null | undefined): string =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
