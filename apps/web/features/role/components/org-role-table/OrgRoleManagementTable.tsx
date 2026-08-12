"use client";

import { useQuery } from "@tanstack/react-query";

import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/DataTableSkeleton";
import { DataTableToolbarSkeleton } from "@workspace/ui/components/data-table/DataTableToolbarSkeleton";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { OrgRoleTable } from "./OrgRoleTable";

export function OrgRoleManagementTable() {
  "use no memo";
  const { filters, setFilters } = useTableQueryState({});

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.role.listOrgRole.queryOptions()
  );

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data?.data}
      isEmpty={() => false}
      loadingFallback={
        <DataTableSkeleton>
          <DataTableToolbarSkeleton />
        </DataTableSkeleton>
      }
      emptyFallback={<DataTableEmpty />}
    >
      {(data) => (
        <OrgRoleTable
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
