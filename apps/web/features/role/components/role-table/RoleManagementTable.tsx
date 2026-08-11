"use client";

import { useQuery } from "@tanstack/react-query";

import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/data-table-skeleton";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { RoleTable } from "./RoleTable";

export function RoleManagementTable() {
  "use no memo";
  const { filters, setFilters } = useTableQueryState({});

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.role.listRole.queryOptions()
  );

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data?.data}
      isEmpty={(d) => d.length === 0}
      loadingFallback={<DataTableSkeleton />}
      emptyFallback={<DataTableEmpty />}
    >
      {(data) => (
        <RoleTable
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
              order: filters?.order,
              orderField: filters?.orderField,
            });
          }}
        />
      )}
    </QueryStateBoundary>
  );
}
