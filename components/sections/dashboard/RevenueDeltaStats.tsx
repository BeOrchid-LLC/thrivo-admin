import { formatSignedCents } from "@/lib/format";
import { cn } from "@/lib/utils";

interface RevenueDeltaStatsProps {
  month: string;
  newMrrCents: number;
  churnedMrrCents: number;
  netNewMrrCents: number;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "destructive" }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-lg font-semibold", tone === "destructive" && "text-destructive")}>
        {value}
      </p>
    </div>
  );
}

/** New/Churned/Net-New MRR 3-up row below the revenue trend chart. */
export function RevenueDeltaStats({
  month,
  newMrrCents,
  churnedMrrCents,
  netNewMrrCents,
}: RevenueDeltaStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-3">
      <Stat label={`New MRR (${month})`} value={formatSignedCents(newMrrCents)} />
      <Stat
        label={`Churned MRR (${month})`}
        value={formatSignedCents(-Math.abs(churnedMrrCents))}
        tone="destructive"
      />
      <Stat label="Net New MRR" value={formatSignedCents(netNewMrrCents)} />
    </div>
  );
}
