"use client";

import { useQuery } from "@tanstack/react-query";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsIsoDate,
  parseAsStringEnum,
  parseAsStringLiteral,
} from "nuqs";

import {
  JobStatusEnumSchema,
  JobStatusEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { RangeSearchEnumSchema } from "@workspace/lib/utils";
import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/data-table-skeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { TimeRangeFilter } from "@/components/time-range-filter";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";
import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

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
      status: parseAsStringEnum(JobStatusEnumSchema.options).withOptions({
        clearOnDefault: true,
      }),
      serviceAt: parseAsArrayOf(parseAsIsoDate, ",").withOptions({
        clearOnDefault: true,
      }),
      revenue: parseAsArrayOf(parseAsInteger, ",").withOptions({
        clearOnDefault: true,
      }),
      range: parseAsStringLiteral(RangeSearchEnumSchema.options).withOptions({
        clearOnDefault: true,
      }),
      startTime: parseAsIsoDate.withOptions({ clearOnDefault: true }),
      endTime: parseAsIsoDate.withOptions({ clearOnDefault: true }),
    },
  });

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
          serviceAt: filters.serviceAt
            ? { from: filters.serviceAt[0], to: filters.serviceAt[1] }
            : undefined,
          receivedRevenue: filters.revenue
            ? { from: filters.revenue[0], to: filters.revenue[1] }
            : undefined,
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
          setFilters({ range, startTime, endTime })
        }
      />
      <DataTableGlobalSearch
        searchValue={filters.search}
        setSearchValue={globalSearch}
        refresh={refetch}
      ></DataTableGlobalSearch>
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
                  serviceAt: filters.serviceAt
                    ? filters.serviceAt.map((date) => date!.toISOString())
                    : null,
                  receivedRevenue: filters.revenue
                    ? filters.revenue.map((revenue) => revenue.toString())
                    : null,
                },
              }}
              setFilters={(filters) => {
                const serviceAt = filters?.filter?.serviceAt as string[] | null;
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
                  serviceAt: serviceAt
                    ? serviceAt.map((date) => new Date(date))
                    : null,
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
