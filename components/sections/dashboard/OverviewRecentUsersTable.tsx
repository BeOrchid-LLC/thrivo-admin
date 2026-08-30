"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { callApi, downloadApi, isApiError, queryKeys } from "@/lib/api";
import { POLL_INTERVALS } from "@/lib/query/make-query-client";
import { fixtureUsersPage, resolveData } from "@/lib/fixtures";
import { formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/general/DataTable";
import type { AdminUser } from "@/lib/contracts";
import { makeRecentUsersColumns } from "./recentUsersColumns";

const RECENT_USERS_LIMIT = 6;

export const overviewRecentUsersQuery = {
  queryKey: queryKeys.overview.recentUsers(),
  queryFn: () =>
    resolveData(fixtureUsersPage, () =>
      callApi("LIST_USERS", { query: { limit: RECENT_USERS_LIMIT } })
    ),
  refetchInterval: POLL_INTERVALS.operational,
};

const columns = makeRecentUsersColumns();

/** "Recent users" preview table — first page of the same users list the
 *  full Users page uses, with a trimmed column set. Row click navigates to
 *  the user's full account detail page (unlike the Users page's drawer). */
export function OverviewRecentUsersTable() {
  const router = useRouter();
  const { data } = useSuspenseQuery(overviewRecentUsersQuery);
  const [exporting, setExporting] = useState(false);

  const exportUsers = async () => {
    setExporting(true);
    try {
      const blob = await downloadApi("EXPORT_USERS");
      const anchor = document.createElement("a");
      const href = URL.createObjectURL(blob);
      anchor.href = href;
      anchor.download = "users.csv";
      anchor.click();
      URL.revokeObjectURL(href);
    } catch (error) {
      if (isApiError(error) && error.code === "NETWORK") {
        toast.error("Export needs the backend — not connected yet.");
      } else {
        toast.error("Export failed.");
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <div>
          <h2 className="text-lg font-semibold leading-none">Recent users</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {formatNumber(data.pagination.total)} total · click a row for full account details
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void exportUsers()} disabled={exporting}>
          <Download className="h-4 w-4" />
          {exporting ? "Exporting…" : "Export CSV"}
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable<AdminUser, unknown>
          columns={columns}
          data={data.items}
          getRowId={(user) => user.id}
          onRowClick={(user) => router.push(`/users/${user.id}`)}
          emptyMessage="No users yet."
        />
      </CardContent>
    </Card>
  );
}
