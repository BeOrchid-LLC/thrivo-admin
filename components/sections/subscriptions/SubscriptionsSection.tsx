"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { callApi, queryKeys, type ListParams } from "@/lib/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { fixtureSubscriptionsPage, resolveData } from "@/lib/fixtures";
import { PageHeader } from "@/components/general/PageHeader";
import { FilterableDataPage } from "@/components/general/FilterableDataPage";
import { subscriptionColumns } from "./columns";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Trialing", value: "trialing" },
  { label: "Canceled", value: "canceled" },
  { label: "Expired", value: "expired" },
  { label: "No subscription", value: "none" },
];

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
          },
        })
      ),
  };
}

export function SubscriptionsSection() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const params: ListParams = { page, pageSize: DEFAULT_PAGE_SIZE, status };
  const { data, isLoading, isError, refetch } = useQuery(subscriptionsListQuery(params));

  return (
    <div>
      <PageHeader title="Subscriptions" description="Status, tier and upgrade-trigger breakdown." />
      <FilterableDataPage
        columns={subscriptionColumns}
        data={data?.items ?? []}
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        emptyMessage="No subscriptions match these filters."
        statusOptions={statusOptions}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        pagination={{
          currentPage: data?.pagination.page ?? page,
          totalPages: data?.pagination.totalPages ?? 1,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
