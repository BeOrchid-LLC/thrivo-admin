import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Optional delta caption, e.g. "+12% vs last month". */
  hint?: string;
  tone?: "default" | "accent" | "destructive";
  loading?: boolean;
}

const toneClass: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "text-primary",
  accent: "text-accent",
  destructive: "text-destructive",
};

/** KPI tile for the dashboard. */
export function MetricCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  loading = false,
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <p className={cn("mt-1 text-3xl font-bold", toneClass[tone])}>{value}</p>
          )}
          {hint && !loading ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className="rounded-lg bg-muted p-2 text-muted-foreground">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
