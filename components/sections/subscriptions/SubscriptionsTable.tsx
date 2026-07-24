"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { callApi, queryKeys, type ListParams } from "@/lib/api";
import { fixtureSubscriptionsPage, resolveData } from "@/lib/fixtures";
import { DataTable } from "@/components/general/DataTable";
import { subscriptionColumns } from "./columns";

export function subscriptionsListQuery(params: ListParams) {
  return {
    queryKey: queryKeys.subscriptions.list(params),
    queryFn: () =>
      resolveData(fixtureSubscriptionsPage, () =>
        callApi("LIST_SUBSCRIPTIONS", {
          query: {
            page: params.page,
            pageSize: params.pageSize,
            status: params.status && params.status !== "all" ? params.status : undefined,
            q: params.q || undefined,
          },
        })
      ),
  };
}

interface SubscriptionsTableProps {
  params: ListParams;
  onPageChange: (page: number) => void;
}

export function SubscriptionsTable({ params, onPageChange }: SubscriptionsTableProps) {
  const { data } = useSuspenseQuery(subscriptionsListQuery(params));

  return (
    <DataTable
      columns={subscriptionColumns}
      data={data.items}
      emptyMessage="No subscriptions match these filters."
      pagination={{
        currentPage: data.pagination.page,
        totalPages: data.pagination.totalPages,
        onPageChange,
      }}
    />
  );
}
