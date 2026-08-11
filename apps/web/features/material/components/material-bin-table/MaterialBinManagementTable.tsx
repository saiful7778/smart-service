"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsArrayOf, parseAsIsoDate } from "nuqs";

import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/data-table-skeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { MaterialBinTable } from "./MaterialBinTable";
import { MaterialBinTableContextProvider } from "./MaterialBinTableContext";

export function MaterialBinManagementTable({
  searchFields,
}: {
  searchFields: string[];
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useTableQueryState({
    additionalKeys: {
      deletedAt: parseAsArrayOf(parseAsIsoDate, ",").withOptions({
        clearOnDefault: true,
      }),
    },
  });

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.material.bin.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        searchFields,
        filter: {
          deletedAt: filters.deletedAt
            ? { from: filters.deletedAt[0], to: filters.deletedAt[1] }
            : undefined,
        },
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
      />
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
          <MaterialBinTableContextProvider data={data.data}>
            <MaterialBinTable
              data={data}
              filters={{
                page: filters.page,
                limit: filters.limit,
                search: filters.search,
                order: filters.order ?? undefined,
                orderField: filters.orderField ?? undefined,
                filter: {
                  deletedAt: filters.deletedAt
                    ? filters.deletedAt.map((date) => date.toISOString())
                    : null,
                },
              }}
              setFilters={(filters) => {
                const deletedAt = filters?.filter?.deletedAt as string[] | null;

                setFilters({
                  page: filters?.page,
                  limit: filters?.limit,
                  order: filters?.order ?? null,
                  orderField: filters?.orderField ?? null,
                  deletedAt: deletedAt
                    ? deletedAt.map((date) => new Date(date))
                    : null,
                });
              }}
            />
          </MaterialBinTableContextProvider>
        )}
      </QueryStateBoundary>
    </div>
  );
}
