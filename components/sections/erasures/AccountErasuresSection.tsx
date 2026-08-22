"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

export function AccountErasuresSection() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["account-erasures"],
    queryFn: () => callApi("LIST_ACCOUNT_ERASURES"),
  });
  const retry = useMutation({
    mutationFn: (id: string) => callApi("RETRY_ACCOUNT_ERASURE", { params: { id } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["account-erasures"] }),
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account erasures</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {query.data?.erasures.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-4 border-b py-3">
              <div>
                <div className="font-medium">{row.status}</div>
                <div className="text-muted-foreground">
                  Requested {formatDate(row.requestedAt)} · Attempts {row.attempts}
                </div>
              </div>
              {row.status === "failed" || row.status === "retryable" ? (
                <Button size="sm" onClick={() => retry.mutate(row.id)} disabled={retry.isPending}>
                  Retry
                </Button>
              ) : null}
            </div>
          ))}
          {query.data?.erasures.length === 0 ? (
            <p className="text-muted-foreground">No erasures queued.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
