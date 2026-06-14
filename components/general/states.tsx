import type { ReactNode } from "react";
import { Inbox, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Centered empty state for tables/sections with no data. */
export function EmptyState({
  title = "Nothing here yet",
  message,
  icon,
}: {
  title?: string;
  message?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <span className="text-muted-foreground">{icon ?? <Inbox className="h-8 w-8" />}</span>
      <p className="font-medium text-foreground">{title}</p>
      {message ? <p className="max-w-sm text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}

/** Centered error state with optional retry. */
export function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

/** Centered loading spinner. */
export function LoadingState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="h-7 w-7 animate-spin" />
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
