"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "@/components/general/states";

interface CategoryBarProps {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
  height?: number;
}

/** Vertical category bar chart themed with Thrivo tokens (pre-aggregated data). */
export function CategoryBar({ data, formatValue, height = 260 }: CategoryBarProps) {
  if (!data || data.length === 0) return <EmptyState title="No data yet" />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={formatValue}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          formatter={(value: number) => (formatValue ? formatValue(value) : value)}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--background))",
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
