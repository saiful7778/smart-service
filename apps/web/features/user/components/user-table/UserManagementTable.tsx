"use client";

import { useQuery } from "@tanstack/react-query";

import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/data-table-skeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { ExportData } from "@/components/ExportData";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";
import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { useUserExportData } from "../../api/users.api.hook";
import { UsersTable } from "./UsersTable";

interface UserManagementTableProps {
  page: number;
  limit: number;
  search: string;
  searchFields?: string[] | undefined;
}

export function UserManagementTable({
  page,
  limit,
  search,
  searchFields,
}: UserManagementTableProps) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useTableQueryState({
    defaultPage: page,
    defaultLimit: limit,
    defaultSearch: search,
  });

  const { mutate: exportData, isPending } = useUserExportData();

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.user.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
      },
    })
  );

  const globalSearch = useDebouncedCallback(
    (searchValue: string | null) => setSearchFilter(searchValue),
    500
  );

  return (
    <div className="space-y-3">
      <DataTableGlobalSearch
        searchValue={filters.search}
        setSearchValue={globalSearch}
        refresh={refetch}
      >
        <ExportData
          isLoading={isPending}
          onExport={(format) =>
            exportData({
              format,
              order: filters.order,
              orderField: filters.orderField,
            })
          }
        />
      </DataTableGlobalSearch>
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data?.data}
        isEmpty={() => false}
        loadingFallback={<DataTableSkeleton />}
        emptyFallback={<DataTableEmpty />}
      >
        {(data) => (
          <UsersTable
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
                page: filters?.page ?? DEFAULT_PAGE_INDEX,
                limit: filters?.limit ?? DEFAULT_PAGE_SIZE,
                order: filters?.order ?? null,
                orderField: filters?.orderField ?? null,
              });
            }}
          />
        )}
      </QueryStateBoundary>
    </div>
  );
}
