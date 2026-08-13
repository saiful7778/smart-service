"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsArrayOf, parseAsString, parseAsStringLiteral } from "nuqs";

import {
  LeadStatusEnumSchema,
  LeadStatusEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/DataTableSkeleton";
import { DataTableToolbarSkeleton } from "@workspace/ui/components/data-table/DataTableToolbarSkeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { createRangeFilterClient } from "@/lib/nuqs/rangeFilter.client";
import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { ExportData } from "@/components/ExportData";
import { TimeRangeFilter } from "@/components/time-range-filter";

import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { useLeadExportData } from "../../api/lead.api.hook";
import { LeadTable } from "./LeadTable";

export function LeadManagementTable({
  searchFields,
}: {
  searchFields: string[];
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useTableQueryState({
    additionalKeys: {
      ...createRangeFilterClient(),
      status: parseAsStringLiteral(LeadStatusEnumSchema.options).withOptions({
        clearOnDefault: true,
      }),
      categories: parseAsArrayOf(parseAsString, ",").withOptions({
        clearOnDefault: true,
      }),
    },
  });

  const { mutate: exportData, isPending } = useLeadExportData();

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.lead.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        searchFields,
        filter: {
          status: filters.status ?? undefined,
          categories: filters.categories ?? undefined,
          createdAt:
            filters.startTime && filters.endTime
              ? { from: filters.startTime, to: filters.endTime }
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
      <TimeRangeFilter
        rangeSearch={{
          range: filters.range,
          startTime: filters.startTime,
          endTime: filters.endTime,
        }}
        setRangeSearch={({ range, startTime, endTime }) =>
          setFilters({
            range,
            startTime,
            endTime,
          })
        }
      />
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
              filter: {
                status: filters.status ?? undefined,
                categories: filters.categories ?? undefined,
                createdAt:
                  filters.startTime && filters.endTime
                    ? { from: filters.startTime, to: filters.endTime }
                    : undefined,
              },
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
        loadingFallback={
          <DataTableSkeleton>
            <DataTableToolbarSkeleton />
          </DataTableSkeleton>
        }
        emptyFallback={<DataTableEmpty />}
      >
        {(data) => (
          <LeadTable
            data={data}
            filters={{
              page: filters.page,
              limit: filters.limit,
              search: filters.search,
              order: filters.order ?? undefined,
              orderField: filters.orderField ?? undefined,
              filter: {
                status: filters.status,
                leadCategories: filters.categories,
              },
            }}
            setFilters={(filters) => {
              const status = filters?.filter?.status as
                LeadStatusEnumType[] | null;
              const categories = filters?.filter?.leadCategories as
                string[] | null;

              setFilters({
                page: filters?.page,
                limit: filters?.limit,
                order: filters?.order ?? null,
                orderField: filters?.orderField ?? null,
                status: status && status?.length > 0 ? status[0] : null,
                categories,
              });
            }}
          />
        )}
      </QueryStateBoundary>
    </div>
  );
}
