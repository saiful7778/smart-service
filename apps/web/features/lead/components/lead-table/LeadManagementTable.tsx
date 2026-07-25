"use client";

import { useQuery } from "@tanstack/react-query";
import {
  parseAsArrayOf,
  parseAsIsoDate,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";

import {
  LeadStatusEnumSchema,
  LeadStatusEnumType,
} from "@workspace/drizzle/zod-db-enums";
import { DataTableEmpty } from "@workspace/ui/components/data-table/data-table-empty";
import { DataTableGlobalSearch } from "@workspace/ui/components/data-table/data-table-global-search";
import { DataTableSkeleton } from "@workspace/ui/components/data-table/data-table-skeleton";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { ExportData } from "@/components/ExportData";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";
import { useTableQueryState } from "@/hooks/use-table-query-state";
import { orpcTQClient } from "@/server/orpc.client";

import { useLeadExportData } from "../../api/lead.api.hook";
import { LeadTable } from "./LeadTable";
import { LeadTableContextProvider } from "./LeadTableContext";

export function LeadManagementTable({
  page,
  limit,
  search,
  searchFields,
}: {
  page: number;
  limit: number;
  search: string;
  searchFields: string[];
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useTableQueryState({
    defaultPage: page,
    defaultLimit: limit,
    defaultSearch: search,
    additionalKeys: {
      status: parseAsStringLiteral(LeadStatusEnumSchema.options).withOptions({
        clearOnDefault: true,
      }),
      categories: parseAsArrayOf(parseAsString, ",").withOptions({
        clearOnDefault: true,
      }),
      createdAt: parseAsArrayOf(parseAsIsoDate, ",").withOptions({
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
          createdAt: filters.createdAt
            ? { from: filters.createdAt[0], to: filters.createdAt[1] }
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
                createdAt: filters.createdAt
                  ? { from: filters.createdAt[0], to: filters.createdAt[1] }
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
          <LeadTableContextProvider data={data.data}>
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
                  createdAt: filters.createdAt
                    ? filters.createdAt.map((date) => date.toISOString())
                    : null,
                },
              }}
              setFilters={(filters) => {
                const status = filters?.filter?.status as
                  LeadStatusEnumType[] | null;
                const categories = filters?.filter?.leadCategories as
                  string[] | null;
                const createdAt = filters?.filter?.createdAt as string[] | null;

                setFilters({
                  page: filters?.page ?? DEFAULT_PAGE_INDEX,
                  limit: filters?.limit ?? DEFAULT_PAGE_SIZE,
                  order: filters?.order ?? null,
                  orderField: filters?.orderField ?? null,
                  status: status && status?.length > 0 ? status[0] : null,
                  categories,
                  createdAt: createdAt
                    ? createdAt.map((date) => new Date(date))
                    : null,
                });
              }}
            />
          </LeadTableContextProvider>
        )}
      </QueryStateBoundary>
    </div>
  );
}
