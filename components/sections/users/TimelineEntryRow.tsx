import type { TimelineEntry } from "@/lib/api/user-detail-contracts.local";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Dot + connecting line + title/subtitle/date. Green dot for a completed
 *  entry, amber for the one synthesized "scheduled" (future) entry. */
export function TimelineEntryRow({ entry, isLast }: { entry: TimelineEntry; isLast: boolean }) {
  const dotClass = entry.status === "scheduled" ? "bg-accent" : "bg-primary";
  const line = entry.subtitle
    ? `${entry.subtitle} · ${formatDate(entry.occurredAt)}`
    : formatDate(entry.occurredAt);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dotClass)} />
        {!isLast ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
      </div>
      <div className={cn("pb-5", isLast && "pb-0")}>
        <p className="text-sm font-medium text-foreground">{entry.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{line}</p>
      </div>
    </div>
  );
}
