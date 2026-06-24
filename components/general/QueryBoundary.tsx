"use client";

import { type ReactNode, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  errorMessage?: string;
}

/**
 * Per-block error + Suspense boundary. Each independently-loading block resolves
 * (and fails) on its own; static chrome never waits for data.
 */
export function QueryBoundary({
  children,
  fallback,
  errorMessage = "Something went wrong loading this section.",
}: QueryBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
              <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
                Try again
              </Button>
            </div>
          )}
        >
          <Suspense fallback={fallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
