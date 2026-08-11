"use client";

import { useQuery } from "@tanstack/react-query";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { LeadCategoryTable } from "./LeadCategoryTable";

export function LeadCategoryManagementTable() {
  "use no memo";
  const { filters, setFilters } = useTableQueryState({});

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.lead.category.list.queryOptions()
  );

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data?.data}
      isEmpty={() => false}
    >
      {(data) => (
        <LeadCategoryTable
          data={data}
          filters={{
            page: filters.page,
            limit: filters.limit,
            search: filters.search,
            order: filters.order ?? undefined,
            orderField: filters.orderField ?? undefined,
          }}
          setFilters={(filters) => {
            setFilters({
              page: filters?.page,
              limit: filters?.limit,
              order: filters?.order ?? null,
              orderField: filters?.orderField ?? null,
            });
          }}
        />
      )}
    </QueryStateBoundary>
  );
}
