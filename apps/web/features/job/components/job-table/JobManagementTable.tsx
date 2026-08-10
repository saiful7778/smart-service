"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsArrayOf, parseAsInteger, parseAsStringEnum } from "nuqs";

import {
  JobStatusEnumSchema,
  JobStatusEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/data-table-skeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { createRangeFilterClient } from "@/lib/nuqs/rangeFilter.client";
import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { ExportData } from "@/components/ExportData";
import { TimeRangeFilter } from "@/components/time-range-filter";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";
import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { useJobExportData } from "../../api/job.api.hook";
import { JobTable } from "./JobTable";

export function JobManagementTable({
  page,
  limit,
  search,
  searchFields,
}: {
  page: number;
  limit: number;
  search: string;
  searchFields?: string[] | undefined;
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useTableQueryState({
    defaultPage: page,
    defaultLimit: limit,
    defaultSearch: search,
    additionalKeys: {
      ...createRangeFilterClient(),
      status: parseAsStringEnum(JobStatusEnumSchema.options).withOptions({
        clearOnDefault: true,
      }),
      revenue: parseAsArrayOf(parseAsInteger, ",").withOptions({
        clearOnDefault: true,
      }),
    },
  });

  const { mutate: exportData, isPending } = useJobExportData();

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.job.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order ?? undefined,
        orderField: filters.orderField ?? undefined,
        filter: {
          status: filters.status ?? undefined,
          receivedRevenue: filters.revenue
            ? { from: filters.revenue[0], to: filters.revenue[1] }
            : undefined,
          // createdAt:
          //   filters.startTime && filters.endTime
          //     ? { from: filters.startTime, to: filters.endTime }
          //     : undefined,
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
            range: range ?? undefined,
            startTime: startTime ?? undefined,
            endTime: endTime ?? undefined,
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
                receivedRevenue: filters.revenue ?? undefined,
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
        loadingFallback={<DataTableSkeleton />}
        emptyFallback={<DataTableEmpty />}
      >
        {(data) => (
          <JobTable
            data={data}
            filters={{
              page: filters.page,
              limit: filters.limit,
              search: filters.search,
              order: filters.order ?? undefined,
              orderField: filters.orderField ?? undefined,
              filter: {
                status: filters.status,
                receivedRevenue: filters.revenue
                  ? filters.revenue.map((revenue) => revenue.toString())
                  : null,
              },
            }}
            setFilters={(filters) => {
              const revenue = filters?.filter?.receivedRevenue as
                string[] | null;
              const status = filters?.filter?.status as
                JobStatusEnumType[] | null;

              setFilters({
                page: filters?.page ?? DEFAULT_PAGE_INDEX,
                limit: filters?.limit ?? DEFAULT_PAGE_SIZE,
                order: filters?.order ?? null,
                orderField: filters?.orderField ?? null,
                status: status && status?.length > 0 ? status[0] : null,
                revenue: revenue
                  ? revenue.map((revenue) => parseInt(revenue, 10))
                  : null,
              });
            }}
          />
        )}
      </QueryStateBoundary>
    </div>
  );
}
