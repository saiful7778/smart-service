"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral } from "nuqs";

import {
  LeadEstimateStatusEnumSchema,
  LeadEstimateStatusEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/DataTableSkeleton";
import { DataTableToolbarSkeleton } from "@workspace/ui/components/data-table/DataTableToolbarSkeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { LeadEstimateTable } from "./LeadEstimateTable";

export function LeadEstimateManagementTable({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useTableQueryState({
    additionalKeys: {
      status: parseAsStringLiteral(
        LeadEstimateStatusEnumSchema.options
      ).withOptions({
        clearOnDefault: true,
      }),
    },
  });

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.lead.estimate.list.queryOptions({
      input: {
        leadId,
        jobId,
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields: ["name"],
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        filter: {
          status: filters.status ?? undefined,
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
        loadingFallback={
          <DataTableSkeleton>
            <DataTableToolbarSkeleton />
          </DataTableSkeleton>
        }
        emptyFallback={<DataTableEmpty />}
      >
        {(data) => (
          <LeadEstimateTable
            leadId={leadId}
            jobId={jobId}
            data={data}
            filters={{
              page: filters.page,
              limit: filters.limit,
              search: filters.search,
              order: filters.order ?? undefined,
              orderField: filters.orderField ?? undefined,
              filter: {
                status: filters.status,
              },
            }}
            setFilters={(filters) => {
              const status = filters?.filter?.status as
                LeadEstimateStatusEnumType[] | null;

              setFilters({
                page: filters?.page,
                limit: filters?.limit,
                order: filters?.order ?? null,
                orderField: filters?.orderField ?? null,
                status: status && status?.length > 0 ? status[0] : null,
              });
            }}
          />
        )}
      </QueryStateBoundary>
    </div>
  );
}
