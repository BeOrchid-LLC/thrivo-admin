import { cn } from "@/lib/utils";

export interface SegmentedBarSegment {
  label: string;
  pct: number;
  colorClassName: string;
}

interface SegmentedBarProps {
  segments: SegmentedBarSegment[];
  className?: string;
}

/**
 * A single proportional-width bar (converted/cancelled/active-trial style
 * breakdowns) with a legend-dot row below it. Distinct from `CategoryBar`,
 * which is a full vertical bar *chart* — this is one bar, segmented by %.
 */
export function SegmentedBar({ segments, className }: SegmentedBarProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={segment.colorClassName}
            style={{ width: `${Math.max(segment.pct, 0)}%` }}
            title={`${segment.label} ${segment.pct.toFixed(0)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5 text-xs">
            <span className={cn("h-2 w-2 rounded-full", segment.colorClassName)} />
            <span className="text-muted-foreground">
              {segment.label} {segment.pct.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
