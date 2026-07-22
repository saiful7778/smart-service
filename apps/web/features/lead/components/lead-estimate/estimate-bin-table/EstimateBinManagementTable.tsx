"use client";

import { useQuery } from "@tanstack/react-query";

import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/data-table-skeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";
import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { EstimateBinTable } from "./EstimateBinTable";

export function EstimateBinManagementTable({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useTableQueryState({
    defaultPage: DEFAULT_PAGE_INDEX,
    defaultLimit: DEFAULT_PAGE_SIZE,
  });

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.lead.estimate.bin.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields: ["name"],
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        leadId,
        jobId,
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
          <EstimateBinTable
            leadId={leadId}
            jobId={jobId}
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
